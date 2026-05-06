// B36 Phase 3 G3 — Empirical validation of all 4 triad combinations

const SK_TRIADS = {
  research:  { triad_type: "research",   agents: ["bishop","pawn","knight"], foreman: "bishop" },
  build:     { triad_type: "build",      agents: ["knight","rook","bishop"], foreman: "knight" },
  discovery: { triad_type: "discovery",  agents: ["knight","pawn","rook"],   foreman: "knight" },
  synthesis: { triad_type: "synthesis",  agents: ["bishop","pawn","rook"],   foreman: "bishop" },
};

function selectTriad(task) {
  const t = task.toLowerCase();
  if (/\b(bushel.?35|nine.?track|beyond.?colossus|full.?skulk|all.?four.?agents?|multi.?track.?research)\b/i.test(t))
    return { triad_count: 4, triad: SK_TRIADS.synthesis };
  if (/\b(build|implement|deploy|ship|develop|create|program|migrate|refactor)\b/i.test(t)
    && /\b(multimodal|pdf|image|document|figure|chart|visual|scan|file)\b/i.test(t))
    return { triad_count: 3, triad: SK_TRIADS.build };
  if (/\b(discover|explore|scan|survey|find|map|catalog|inventory|prospect)\b/i.test(t)
    && /\b(pdf|paper|literature|document|image|corpus|library|archive)\b/i.test(t))
    return { triad_count: 3, triad: SK_TRIADS.discovery };
  if (/\b(synthesize?|summarize?|compile|aggregate|evaluate|compare|assess|cross.?reference)\b/i.test(t)
    && /\b(paper|literature|data|findings|results|cross.?document|analysis|research)\b/i.test(t))
    return { triad_count: 3, triad: SK_TRIADS.synthesis };
  if (/\b(research|study|investigate|literature.?review|state.?of.?the.?art|survey|papers)\b/i.test(t))
    return { triad_count: 3, triad: SK_TRIADS.research };
  return { triad_count: 1, triad: null };
}

const tests = [
  ["Research Triad",  "study and analyze recent papers on room-temperature superconductors for deep research", "research", 3],
  ["Build Triad",     "build and implement a multimodal PDF document analysis pipeline with image scanning", "build", 3],
  ["Discovery Triad", "explore and discover papers from the literature corpus and catalog image archives", "discovery", 3],
  ["Synthesis Triad", "synthesize and evaluate findings across multiple papers for cross-document analysis", "synthesis", 3],
  ["Full Skulk",      "run Bushel 35 nine-track beyond colossus multi-track research", "full_skulk", 4],
  ["Single Agent",    "what is 2 plus 2", "single", 1],
];

let pass = 0; let fail = 0;
for (const [label, task, expected_type, expected_count] of tests) {
  const result = selectTriad(task);
  const actual_type = result.triad_count === 4 ? "full_skulk" : (result.triad?.triad_type ?? "single");
  const ok = actual_type === expected_type && result.triad_count === expected_count;
  console.log(`${ok ? "PASS" : "FAIL"} [${label}] → count=${result.triad_count} type=${actual_type} foreman=${result.triad?.foreman ?? "n/a"} agents=[${(result.triad?.agents ?? []).join(",")}]`);
  if (ok) pass++; else fail++;
}
console.log(`\n${pass}/${tests.length} triad selection tests PASS (G3 empirical validation)`);
if (fail > 0) process.exit(1);
