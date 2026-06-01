# Cadre Big-4 API Comparison Benchmark
## BP068 | Knight | 2026-06-01T04:06:21.244544+00:00 | TRUTH-ALWAYS

### Test 2: ARC-Challenge (15 MCQ) + GSM8K (10 Math) | 25 Questions

| Model | Type | COLD | HOT | Delta | Cost/Q |
|-------|------|------|-----|-------|--------|
| gemma2:2b | Local | 36.0% | 36.0% | +0.0pp | $0.00 |
| llama3.1:8b | Local | 64.0% | 64.0% | +0.0pp | $0.00 |
| qwen2.5:7b | Local | 80.0% | 80.0% | +0.0pp | $0.00 |
| claude-haiku | API | 96.0% | 96.0% | +0.0pp | $0.00009 |
| gpt-4.1-mini | API | 96.0% | 96.0% | +0.0pp | $0.00004 |
| gemini-2.5-flash | API | 100.0% | 100.0% | +0.0pp | $0.00001 |

### Cohen's Kappa

**Local Cadre (inter-model, avg pairwise COLD):** +0.3340 (fair)
**Local Cadre (inter-model, avg pairwise HOT):** +0.3548 (fair)

**API model pairwise kappa (COLD):**
- claude-haiku vs gpt-4.1-mini: κ = -0.0417
- claude-haiku vs gemini-2.5-flash: κ = +0.0000
- gpt-4.1-mini vs gemini-2.5-flash: κ = +0.0000
- Average API kappa: -0.0139

### Key Findings

- Local cadre kappa +0.334 = FAIR agreement (Landis & Koch 1977)
- Low inter-model kappa validates D-5 Star Chamber escalation:
  quorum fails exactly when model capability variance is wide
- Deterministic grader (letter-match + numeric-compare) has kappa=1.0 with itself
- ARC-Challenge (science MCQ): Cadre COLD 93.3% quorum
- GSM8K (math): Cadre COLD 20.0% quorum (needs Frontier escalation)

### Models Skipped

(none)

FOR THE KEEP.
