# Chrome Extension Icons

The manifest references `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`.

For development loading (unpacked), Chrome will show a generic puzzle icon if PNGs are missing.

To generate production icons, use any 16x16 / 48x48 / 128x128 PNG with the Mnemosyne brand
color (#6ee7b7 on #0a0f1a). The ArtAssets folder in the workspace root contains the brand assets.

A minimal green-circle placeholder can be generated with ImageMagick:
  magick -size 128x128 xc:"#0a0f1a" -fill "#6ee7b7" -draw "circle 64,64 64,20" icon128.png
