"""
mesh_visualize.py -- Generate SVG artifacts from mesh test results.

Usage:
    python scripts/mesh_visualize.py <results_json_path> <output_dir>

When run without arguments, generates placeholder SVGs in BISHOP_DROPZONE/00_FOUNDER_REVIEW/.
"""

import json
import os
import sys
import datetime
from pathlib import Path


# Color palette
C_BG = "#1a1a2e"
C_PANEL = "#16213e"
C_BLUE = "#3b82f6"
C_GREEN = "#22c55e"
C_YELLOW = "#eab308"
C_GRAY = "#64748b"
C_WHITE = "#f1f5f9"
C_MUTED = "#94a3b8"
C_BORDER = "#334155"


def _esc(s: str) -> str:
    """XML-escape a string for SVG text content."""
    return (
        str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def generate_big_numbers_svg(fast: str, cheap: str, good: str, output_path: str) -> int:
    """
    Artifact 1: Big Numbers card SVG.
    Width=480, height=200, dark background, white numbers, colored labels.
    Composed for v0.1.36 WelcomeView accordion slot.
    """
    fast_val = _esc(fast)
    cheap_val = _esc(cheap)
    good_val = _esc(good)

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="480" height="200" viewBox="0 0 480 200" role="img" aria-label="MnemosyneC Mesh Test Results">
  <rect width="480" height="200" fill="{C_BG}" rx="12"/>
  <rect x="1" y="1" width="478" height="198" fill="none" stroke="{C_BORDER}" stroke-width="1" rx="11"/>

  <!-- FAST column (left) -->
  <rect x="12" y="12" width="142" height="176" fill="{C_PANEL}" rx="8"/>
  <text x="83" y="42" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11" font-weight="600" fill="{C_BLUE}" letter-spacing="2">FAST</text>
  <text x="83" y="90" text-anchor="middle" font-family="ui-monospace,monospace" font-size="28" font-weight="700" fill="{C_WHITE}">{fast_val}</text>
  <text x="83" y="116" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" fill="{C_MUTED}">p50 HOT latency</text>
  <line x1="32" y1="130" x2="134" y2="130" stroke="{C_BORDER}" stroke-width="1"/>
  <text x="83" y="152" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="{C_MUTED}">local inference</text>
  <text x="83" y="168" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="{C_MUTED}">no round-trip</text>

  <!-- CHEAP column (center) -->
  <rect x="169" y="12" width="142" height="176" fill="{C_PANEL}" rx="8"/>
  <text x="240" y="42" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11" font-weight="600" fill="{C_YELLOW}" letter-spacing="2">CHEAP</text>
  <text x="240" y="90" text-anchor="middle" font-family="ui-monospace,monospace" font-size="28" font-weight="700" fill="{C_WHITE}">{cheap_val}</text>
  <text x="240" y="116" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" fill="{C_MUTED}">zero API cost</text>
  <line x1="189" y1="130" x2="291" y2="130" stroke="{C_BORDER}" stroke-width="1"/>
  <text x="240" y="152" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="{C_MUTED}">local compute</text>
  <text x="240" y="168" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="{C_MUTED}">no token spend</text>

  <!-- GOOD column (right) -->
  <rect x="326" y="12" width="142" height="176" fill="{C_PANEL}" rx="8"/>
  <text x="397" y="42" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11" font-weight="600" fill="{C_GREEN}" letter-spacing="2">GOOD</text>
  <text x="397" y="90" text-anchor="middle" font-family="ui-monospace,monospace" font-size="28" font-weight="700" fill="{C_WHITE}">{good_val}</text>
  <text x="397" y="116" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" fill="{C_MUTED}">HOT vs COLD lift</text>
  <line x1="346" y1="130" x2="448" y2="130" stroke="{C_BORDER}" stroke-width="1"/>
  <text x="397" y="152" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="{C_MUTED}">MnemosyneC</text>
  <text x="397" y="168" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="{C_MUTED}">accuracy boost</text>
</svg>"""

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(svg)
    return os.path.getsize(output_path)


def generate_hot_cold_bars_svg(per_node: dict, global_cold: float, global_hot: float, output_path: str) -> int:
    """
    Artifact 2: HOT vs COLD comparison bar chart.
    One bar pair per node plus Combined. Width=600, height=300.
    COLD bars gray (#64748b), HOT bars blue (#3b82f6).
    """
    nodes = list(per_node.keys()) + ["Combined"]
    cold_vals = [per_node[n]["cold_accuracy_pct"] for n in per_node] + [global_cold]
    hot_vals = [per_node[n]["hot_accuracy_pct"] for n in per_node] + [global_hot]

    chart_left = 60
    chart_top = 40
    chart_w = 500
    chart_h = 190
    bar_group_w = chart_w / len(nodes)
    bar_w = bar_group_w * 0.28
    bar_gap = bar_group_w * 0.06

    max_val = max(max(cold_vals + hot_vals, default=0), 10)
    y_scale_top = min(100, max_val * 1.15)

    def bar_height(v):
        return chart_h * v / y_scale_top

    def bar_y(v):
        return chart_top + chart_h - bar_height(v)

    bars_svg = ""
    labels_svg = ""
    for i, node in enumerate(nodes):
        cx = chart_left + i * bar_group_w + bar_group_w / 2
        cold_x = cx - bar_w - bar_gap / 2
        hot_x = cx + bar_gap / 2

        c_val = cold_vals[i]
        h_val = hot_vals[i]
        c_h = max(bar_height(c_val), 2)
        h_h = max(bar_height(h_val), 2)
        c_y = bar_y(c_val)
        h_y = bar_y(h_val)

        is_combined = node == "Combined"
        c_fill = C_GRAY
        h_fill = C_BLUE if not is_combined else "#60a5fa"
        stroke_extra = ' stroke="#f1f5f9" stroke-width="1.5"' if is_combined else ""

        bars_svg += f'<rect x="{cold_x:.1f}" y="{c_y:.1f}" width="{bar_w:.1f}" height="{c_h:.1f}" fill="{c_fill}" rx="2"{stroke_extra}/>\n'
        bars_svg += f'<rect x="{hot_x:.1f}" y="{h_y:.1f}" width="{bar_w:.1f}" height="{h_h:.1f}" fill="{h_fill}" rx="2"{stroke_extra}/>\n'

        if c_val > 0:
            bars_svg += f'<text x="{cold_x + bar_w/2:.1f}" y="{c_y - 4:.1f}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="{C_MUTED}">{c_val:.0f}%</text>\n'
        if h_val > 0:
            bars_svg += f'<text x="{hot_x + bar_w/2:.1f}" y="{h_y - 4:.1f}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="{C_WHITE}">{h_val:.0f}%</text>\n'

        label_y = chart_top + chart_h + 18
        weight = "700" if is_combined else "400"
        labels_svg += f'<text x="{cx:.1f}" y="{label_y}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11" font-weight="{weight}" fill="{C_MUTED}">{_esc(node)}</text>\n'

    y_ticks = ""
    for pct in [0, 25, 50, 75, 100]:
        if pct > y_scale_top:
            continue
        ty = chart_top + chart_h - chart_h * pct / y_scale_top
        y_ticks += f'<line x1="{chart_left}" y1="{ty:.1f}" x2="{chart_left + chart_w}" y2="{ty:.1f}" stroke="{C_BORDER}" stroke-width="1" stroke-dasharray="4,3"/>\n'
        y_ticks += f'<text x="{chart_left - 6}" y="{ty + 4:.1f}" text-anchor="end" font-family="ui-monospace,monospace" font-size="9" fill="{C_MUTED}">{pct}%</text>\n'

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300" role="img" aria-label="HOT vs COLD accuracy by node">
  <rect width="600" height="300" fill="{C_BG}" rx="10"/>
  <rect x="1" y="1" width="598" height="298" fill="none" stroke="{C_BORDER}" stroke-width="1" rx="9"/>

  <!-- Title -->
  <text x="300" y="24" text-anchor="middle" font-family="ui-monospace,monospace" font-size="13" font-weight="600" fill="{C_WHITE}">HOT vs COLD Accuracy -- Three-Node Mesh</text>

  <!-- Y-axis ticks and gridlines -->
  {y_ticks}

  <!-- Bars -->
  {bars_svg}

  <!-- Node labels -->
  {labels_svg}

  <!-- Legend -->
  <rect x="380" y="270" width="12" height="12" fill="{C_GRAY}" rx="2"/>
  <text x="396" y="280" font-family="ui-monospace,monospace" font-size="10" fill="{C_MUTED}">COLD (no MnemosyneC)</text>
  <rect x="490" y="270" width="12" height="12" fill="{C_BLUE}" rx="2"/>
  <text x="506" y="280" font-family="ui-monospace,monospace" font-size="10" fill="{C_WHITE}">HOT</text>

  <!-- Axis line -->
  <line x1="{chart_left}" y1="{chart_top}" x2="{chart_left}" y2="{chart_top + chart_h}" stroke="{C_BORDER}" stroke-width="1.5"/>
  <line x1="{chart_left}" y1="{chart_top + chart_h}" x2="{chart_left + chart_w}" y2="{chart_top + chart_h}" stroke="{C_BORDER}" stroke-width="1.5"/>
</svg>"""

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(svg)
    return os.path.getsize(output_path)


def generate_node_detail_svgs(node: str, stats: dict, timestamp: str, output_dir: str) -> tuple:
    """
    Artifact 3: Per-node detail -- front and back SVGs.
    Front: COLD vs HOT accuracy bar for that node.
    Back: shard size, p50 HOT, p95 HOT, hash-verify status.
    """
    front_path = os.path.join(output_dir, f"MESH_TEST_NODE_DETAIL_{node}_front_{timestamp}.svg")
    back_path = os.path.join(output_dir, f"MESH_TEST_NODE_DETAIL_{node}_back_{timestamp}.svg")

    cold_pct = stats.get("cold_accuracy_pct", 0)
    hot_pct = stats.get("hot_accuracy_pct", 0)
    max_pct = max(cold_pct, hot_pct, 10)
    scale_top = min(100, max_pct * 1.2)

    bar_h_max = 120
    cold_bar_h = max(bar_h_max * cold_pct / scale_top, 2)
    hot_bar_h = max(bar_h_max * hot_pct / scale_top, 2)

    front_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="280" height="220" viewBox="0 0 280 220" role="img" aria-label="{_esc(node)} node accuracy detail">
  <rect width="280" height="220" fill="{C_BG}" rx="10"/>
  <rect x="1" y="1" width="278" height="218" fill="none" stroke="{C_BORDER}" stroke-width="1" rx="9"/>

  <!-- Node label -->
  <text x="140" y="26" text-anchor="middle" font-family="ui-monospace,monospace" font-size="14" font-weight="700" fill="{C_WHITE}">{_esc(node)}</text>
  <text x="140" y="42" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" fill="{C_MUTED}">COLD vs HOT Accuracy</text>

  <!-- COLD bar -->
  <rect x="60" y="{55 + (bar_h_max - cold_bar_h):.1f}" width="50" height="{cold_bar_h:.1f}" fill="{C_GRAY}" rx="3"/>
  <text x="85" y="{55 + bar_h_max - cold_bar_h - 6:.1f}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" fill="{C_MUTED}">{cold_pct:.1f}%</text>
  <text x="85" y="192" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" fill="{C_MUTED}">COLD</text>

  <!-- HOT bar -->
  <rect x="170" y="{55 + (bar_h_max - hot_bar_h):.1f}" width="50" height="{hot_bar_h:.1f}" fill="{C_BLUE}" rx="3"/>
  <text x="195" y="{55 + bar_h_max - hot_bar_h - 6:.1f}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" fill="{C_WHITE}">{hot_pct:.1f}%</text>
  <text x="195" y="192" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" fill="{C_WHITE}">HOT</text>

  <!-- Baseline -->
  <line x1="30" y1="{55 + bar_h_max:.0f}" x2="250" y2="{55 + bar_h_max:.0f}" stroke="{C_BORDER}" stroke-width="1"/>

  <!-- Delta annotation -->
  <text x="140" y="210" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" fill="{C_GREEN}">lift: +{max(hot_pct - cold_pct, 0):.1f}pp</text>
</svg>"""

    with open(front_path, "w", encoding="utf-8") as f:
        f.write(front_svg)

    q_count = stats.get("question_count", 0)
    p50 = stats.get("hot_p50_ms", 0)
    p95 = stats.get("hot_p95_ms", 0)
    verified = stats.get("sha256_verified", False)
    verify_color = C_GREEN if verified else C_YELLOW
    verify_label = "VERIFIED" if verified else "PENDING"

    back_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="280" height="220" viewBox="0 0 280 220" role="img" aria-label="{_esc(node)} node shard detail">
  <rect width="280" height="220" fill="{C_BG}" rx="10"/>
  <rect x="1" y="1" width="278" height="218" fill="none" stroke="{C_BORDER}" stroke-width="1" rx="9"/>

  <!-- Node label -->
  <text x="140" y="26" text-anchor="middle" font-family="ui-monospace,monospace" font-size="14" font-weight="700" fill="{C_WHITE}">{_esc(node)}</text>
  <text x="140" y="42" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" fill="{C_MUTED}">Shard Details</text>

  <line x1="20" y1="52" x2="260" y2="52" stroke="{C_BORDER}" stroke-width="1"/>

  <!-- Stats rows -->
  <text x="30" y="80" font-family="ui-monospace,monospace" font-size="11" fill="{C_MUTED}">Shard size</text>
  <text x="250" y="80" text-anchor="end" font-family="ui-monospace,monospace" font-size="11" font-weight="600" fill="{C_WHITE}">{q_count:,} questions</text>

  <text x="30" y="108" font-family="ui-monospace,monospace" font-size="11" fill="{C_MUTED}">HOT p50 latency</text>
  <text x="250" y="108" text-anchor="end" font-family="ui-monospace,monospace" font-size="11" font-weight="600" fill="{C_BLUE}">{p50:.0f}ms</text>

  <text x="30" y="136" font-family="ui-monospace,monospace" font-size="11" fill="{C_MUTED}">HOT p95 latency</text>
  <text x="250" y="136" text-anchor="end" font-family="ui-monospace,monospace" font-size="11" font-weight="600" fill="{C_BLUE}">{p95:.0f}ms</text>

  <line x1="20" y1="150" x2="260" y2="150" stroke="{C_BORDER}" stroke-width="1"/>

  <text x="30" y="175" font-family="ui-monospace,monospace" font-size="11" fill="{C_MUTED}">SHA-256 verify</text>
  <text x="250" y="175" text-anchor="end" font-family="ui-monospace,monospace" font-size="11" font-weight="700" fill="{verify_color}">{verify_label}</text>

  <!-- Hash-verify badge -->
  <rect x="80" y="190" width="120" height="22" fill="{verify_color}" rx="4" opacity="0.15"/>
  <text x="140" y="205" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" font-weight="600" fill="{verify_color}">shard integrity {verify_label}</text>
</svg>"""

    with open(back_path, "w", encoding="utf-8") as f:
        f.write(back_svg)

    return front_path, back_path, os.path.getsize(front_path), os.path.getsize(back_path)


def generate_all(results: dict, output_dir: str, timestamp: str):
    os.makedirs(output_dir, exist_ok=True)
    fcg = results.get("fast_cheap_good", {})
    fast_label = fcg.get("FAST", "TBD")
    cheap_label = fcg.get("CHEAP", "$0.00")
    good_label = fcg.get("GOOD", "TBD")

    fast_display = fast_label.split(" ")[0] if fast_label != "TBD" else "TBD"
    good_display = good_label.split(" ")[0] if good_label != "TBD" else "TBD"

    big_path = os.path.join(output_dir, f"MESH_TEST_BIG_NUMBERS_{timestamp}.svg")
    big_size = generate_big_numbers_svg(fast_display, cheap_label, good_display, big_path)

    glob_data = results.get("global", {})
    global_cold = glob_data.get("cold_accuracy_pct", 0)
    global_hot = glob_data.get("hot_accuracy_pct", 0)
    per_node = results.get("per_node", {})

    bars_path = os.path.join(output_dir, f"MESH_TEST_HOT_COLD_BARS_{timestamp}.svg")
    bars_size = generate_hot_cold_bars_svg(per_node, global_cold, global_hot, bars_path)

    node_artifacts = []
    for node, stats in per_node.items():
        fp, bp, fs, bs = generate_node_detail_svgs(node, stats, timestamp, output_dir)
        node_artifacts.append((node, fp, bp, fs, bs))

    return big_path, big_size, bars_path, bars_size, node_artifacts


if __name__ == "__main__":
    timestamp = datetime.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    output_dir = "BISHOP_DROPZONE/00_FOUNDER_REVIEW"

    if len(sys.argv) >= 2 and os.path.exists(sys.argv[1]):
        with open(sys.argv[1]) as f:
            results = json.load(f)
        if len(sys.argv) >= 3:
            output_dir = sys.argv[2]
    else:
        # Placeholder mode
        results = {
            "fast_cheap_good": {"FAST": "TBD", "CHEAP": "$0.00", "GOOD": "TBD"},
            "global": {"cold_accuracy_pct": 0, "hot_accuracy_pct": 0, "delta_pp": 0},
            "per_node": {
                "M1": {
                    "question_count": 4011,
                    "cold_accuracy_pct": 0,
                    "hot_accuracy_pct": 0,
                    "hot_p50_ms": 0,
                    "hot_p95_ms": 0,
                    "sha256_verified": True,
                },
                "M2": {
                    "question_count": 4010,
                    "cold_accuracy_pct": 0,
                    "hot_accuracy_pct": 0,
                    "hot_p50_ms": 0,
                    "hot_p95_ms": 0,
                    "sha256_verified": False,
                },
                "M3": {
                    "question_count": 4011,
                    "cold_accuracy_pct": 0,
                    "hot_accuracy_pct": 0,
                    "hot_p50_ms": 0,
                    "hot_p95_ms": 0,
                    "sha256_verified": False,
                },
            },
        }
        print("No results JSON supplied -- running in placeholder mode.")

    big_path, big_size, bars_path, bars_size, node_artifacts = generate_all(
        results, output_dir, timestamp
    )

    print(f"Big Numbers SVG:  {big_path} ({big_size} bytes)")
    print(f"HOT/COLD Bars SVG: {bars_path} ({bars_size} bytes)")
    for node, fp, bp, fs, bsz in node_artifacts:
        print(f"  {node} front: {fp} ({fs} bytes)")
        print(f"  {node} back:  {bp} ({bsz} bytes)")
