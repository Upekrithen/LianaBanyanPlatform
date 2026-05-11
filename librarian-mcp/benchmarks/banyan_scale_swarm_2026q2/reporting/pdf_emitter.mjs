// reporting/pdf_emitter.mjs
// Generates the PDF report per §7.2 structure.
// Strategy: render a structured HTML document, then convert via:
//   1. Puppeteer (if installed)
//   2. pandoc (fallback)
//   3. Write HTML only if neither is available.

import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Emit the PDF report from a results bundle.
 *
 * @param {object} bundle  Results bundle (§7.1 schema)
 * @param {string} outputDir  Directory to write report.pdf (and report.html)
 */
export async function emitPDF(bundle, outputDir) {
  const htmlPath = join(outputDir, 'report.html');
  const pdfPath  = join(outputDir, 'report.pdf');

  const html = renderHTML(bundle);
  writeFileSync(htmlPath, html, 'utf8');

  // Try puppeteer
  try {
    const { default: puppeteer } = await import('puppeteer');
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
    await browser.close();
    console.log(`[pdf_emitter] PDF via Puppeteer: ${pdfPath}`);
    return { pdfPath, htmlPath, engine: 'puppeteer' };
  } catch (puppeteerErr) {
    // Try pandoc
    const pandoc = spawnSync('pandoc', [htmlPath, '-o', pdfPath, '--pdf-engine=wkhtmltopdf'], {
      encoding: 'utf8', shell: true,
    });
    if (pandoc.status === 0) {
      console.log(`[pdf_emitter] PDF via pandoc: ${pdfPath}`);
      return { pdfPath, htmlPath, engine: 'pandoc' };
    }
    // Fallback: HTML only
    console.warn('[pdf_emitter] Neither puppeteer nor pandoc available — HTML report only.');
    return { pdfPath: null, htmlPath, engine: 'html-only' };
  }
}

function renderHTML(bundle) {
  const { benchmark, version, edition, pretty_good_caveat, run_ts, hardware_profile, results } = bundle;
  const resultsHtml = (results ?? []).map(renderResultSection).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${benchmark} — ${version}</title>
<style>
  body { font-family: Georgia, serif; max-width: 900px; margin: 40px auto; color: #111; }
  h1 { font-size: 2em; border-bottom: 3px solid #2c5f2e; padding-bottom: 8px; }
  h2 { font-size: 1.4em; color: #2c5f2e; margin-top: 2em; }
  h3 { font-size: 1.1em; color: #555; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
  th { background: #f0f4f0; }
  .caveat { background: #fff8dc; border-left: 4px solid #f5a623; padding: 8px 12px; margin: 1em 0; }
  .score-badge { display: inline-block; background: #2c5f2e; color: white; padding: 2px 8px; border-radius: 3px; font-family: monospace; }
  .axis-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 1em 0; }
  .axis-cell { border: 1px solid #ccc; padding: 8px; text-align: center; border-radius: 4px; }
  .axis-name { font-weight: bold; color: #2c5f2e; }
  .axis-score { font-size: 1.4em; font-weight: bold; }
  footer { margin-top: 3em; color: #888; font-size: 0.85em; border-top: 1px solid #eee; padding-top: 1em; }
</style>
</head>
<body>

<h1>${benchmark}</h1>
<p><strong>Version:</strong> ${version} &nbsp; <strong>Edition:</strong> ${edition}</p>
<p><strong>Run timestamp:</strong> ${run_ts}</p>
<p><strong>Hardware:</strong> ${hardware_profile?.ram_gb ?? '?'}GB RAM, ${hardware_profile?.cpu ?? 'unknown CPU'}, ${hardware_profile?.os ?? 'unknown OS'}</p>

<div class="caveat">
  <strong>Pretty Good Caveat:</strong> ${pretty_good_caveat}<br>
  This is a v0.1 benchmark — results are empirical receipts, not final verdicts.
  All [VERIFY-PER-PAWN-P12] tags require resolution before external publication.
</div>

<h2>§1 — Executive Summary</h2>
<p>
  The <em>Banyan Scale Swarm Substrate Benchmark 2026Q2</em> provides the first empirical,
  reproducible, cooperative-substrate-aware benchmark for multi-agent swarm orchestrators.
  Scores use the canonical <code>{Class}{Tier}-{Score}</code> notation from
  LBCAIS (LB-CODEX-0206). Stacks are evaluated across three workloads (W1/W2/W3)
  on a Tier-1 commodity-hardware reference rig (≤16 GB RAM, CPU-only).
</p>

<h2>§2 — Methodology</h2>
<p>Three workloads: W1 (Multi-File Refactor, Tier 4), W2 (Doc+Test Generation, Tier 5),
W3 (Data Cleaning ETL, Tier 6). Six stacks. Eight Banyan Scale axes A–H per cell.
R-MECHANISM-VERIFY applies: all pass-criteria evaluated against actual harness-side
artifacts, never orchestrator self-report.</p>

<h2>§3 — Results</h2>
${resultsHtml}

<h2>§7 — Honest Disclosure</h2>
<p>
  Per Pawn P-11 web research dispatch BP036, Ruflo's headline 84.8% SWE-Bench claim has been
  reported in community discussion to derive from a local <code>simulate_benchmarks.py</code>
  script applying random noise to hard-coded base rates [Pawn-cited; Knight harness has not
  independently inspected the script]. The Banyan Scale benchmark presented here measures
  pass-criteria-met against held-out fixtures via independent harness, not orchestrator self-report.
  Readers may compare the methodologies directly.
</p>

<h2>§9 — Pretty Good v0.1 Limitations</h2>
<ul>
  <li>6 stacks; v0.2 expands roster (ORCH, GStack, avivl/claude-007-agents, OpenClaw).</li>
  <li>3 workloads; v0.2 adds W4–W6.</li>
  <li>Single hardware profile; v0.2 adds Tier-2/3 rigs.</li>
  <li>N=5 runs per cell in v0.1; v0.2 raises N=30 for tier-7+ tests.</li>
  <li>Class N (eNvironmental) is estimate-class; v0.2 uses power-meter measurement.</li>
  <li>S6 adapter requires third-party verification before public release (per §8 honest disclosure).</li>
  <li>All [VERIFY-PER-PAWN-P12] and [VERIFY-PER-FUTURE-PAWN] tags must resolve before external publication.</li>
</ul>

<h2>§11 — Citations</h2>
<p>
  Pawn P-4 (Banyan Scale Prior Art, BP035) · Pawn P-11 (Web Scour, BP035) ·
  LB-CODEX-0206 (LBCAIS + Banyan Scale Framework) · BP036 PGP/Edition/Aviator Doctrine
</p>

<footer>
  Banyan Scale Swarm Substrate Benchmark 2026Q2 — LB-EDITION-09 (BP036)<br>
  Published under LB-CCL. "Help each other help ourselves." — Liana Banyan Corporation, EIN 41-2797446<br>
  WE Grind Salt. FOR THE KEEP!
</footer>

</body>
</html>`;
}

function renderResultSection(r) {
  const axisRows = Object.entries(r.scores ?? {})
    .map(([axis, s]) => `<tr><td><strong>${axis}</strong></td><td>${s.score ?? '–'}</td><td>${s.tier ?? '–'}</td></tr>`)
    .join('');

  return `
<h3>${r.stack_id} — ${r.stack_name} / ${r.workload} [${r.implementation_status}]</h3>
<table>
<thead><tr><th>Axis</th><th>Score (0-100)</th><th>Tier</th></tr></thead>
<tbody>${axisRows}</tbody>
</table>`;
}
