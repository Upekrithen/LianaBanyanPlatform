"""Generate minimal PNG icons for the Comet Bridge Chrome extension."""
import struct
import zlib
import os

ICON_DIR = os.path.dirname(os.path.abspath(__file__))


def _chunk(name: bytes, data: bytes) -> bytes:
    c = struct.pack(">I", len(data)) + name + data
    crc = zlib.crc32(name + data) & 0xFFFFFFFF
    return c + struct.pack(">I", crc)


def make_png(size: int, r: int, g: int, b: int) -> bytes:
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    row = bytes([0]) + bytes([r, g, b] * size)
    raw = row * size
    compressed = zlib.compress(raw, 9)
    sig = b"\x89PNG\r\n\x1a\n"
    return (
        sig
        + _chunk(b"IHDR", ihdr)
        + _chunk(b"IDAT", compressed)
        + _chunk(b"IEND", b"")
    )


if __name__ == "__main__":
    os.makedirs(os.path.join(ICON_DIR, "icons"), exist_ok=True)
    R, G, B = 29, 78, 216
    for size, name in [(16, "icon16.png"), (48, "icon48.png"), (128, "icon128.png")]:
        path = os.path.join(ICON_DIR, "icons", name)
        with open(path, "wb") as f:
            f.write(make_png(size, R, G, B))
        print(f"Created icons/{name}")
