# Substitution Guide — Run the Benchmark on YOUR Data

**Sovereignty contract: your corpus stays on your machine.**

This guide walks you through replacing the canonical R11-v2 corpus with your own documents
and running the same architectural comparison that K528 ran on LB's data — except on yours.

---

## Why substitute?

The K528 benchmark proved that Cathedral indexed retrieval is dramatically cheaper per correct
answer than full-corpus injection, on a 150-fact cooperative AI platform knowledge base.

**But is that true for YOUR knowledge base?** A state government's legislative records.
A company's internal documentation. A classroom curriculum. A family history archive.
Substituting your corpus answers that question on YOUR data, in YOUR context.

---

## Step 1 — Prepare your corpus file

Your corpus should be a plain Markdown or text file. Structure it as a sequence of
fact-bearing paragraphs. Each paragraph becomes a retrievable unit.

**Format that works well:**
```markdown
# My Company Knowledge Base

## Product Information

Our flagship product, the Acme Widget, ships in three configurations: Standard ($49),
Professional ($99), and Enterprise ($299). The Enterprise tier includes 24/7 support
and a 99.9% SLA.

## Pricing Policy

Standard warranties cover manufacturing defects for 12 months from purchase date.
Extended warranty adds 24 additional months at $19.95 per unit.

## Support Contacts

Primary support: support@acme.example.com, 1-800-ACME-123 (M-F 9AM-5PM EST).
...
```

**Size guidance:**
| Tier | Corpus size | Questions | Est. spend |
|------|-------------|-----------|------------|
| Smoke | ~1K-10K words | 20 | <$1 |
| Reasonable | ~10K-50K words | 50-100 | $5-30 |
| Full-custom | 50K-200K words | 100-200 | $50-300 |

---

## Step 2 — Prepare your question bank

Your questions must be JSON in the same format as the sealed banks:

```json
{
  "bank_version": "1.0.0-mycompany",
  "questions": [
    {
      "id": "MYCO-01",
      "category": "product_info",
      "question": "What are the three Acme Widget configurations and their prices?",
      "hot_required_elements": ["Standard", "$49", "Professional", "$99", "Enterprise", "$299"],
      "hit_required_elements": ["49", "99", "299"]
    },
    {
      "id": "MYCO-02",
      "category": "policy",
      "question": "How long does the standard warranty cover manufacturing defects?",
      "hot_required_elements": ["12 months"],
      "hit_required_elements": ["12"]
    }
  ]
}
```

**Key fields:**
- `hot_required_elements`: list of strings ALL of which must appear (case-insensitive substring)
  in the model's response to score HOT. Design these as the canonical facts a correct answer
  should contain.
- `hit_required_elements`: list of strings where >= ceil(n/2) must appear for a HIT score.

**Tip:** use `hot_required_elements` that are exact substrings of your corpus text. If your
corpus says "$49", your hot element should be "$49" not "forty-nine dollars".

---

## Step 3 — Run with substitution

```bash
python run_benchmark.py \
    --tier reasonable \
    --corpus path/to/mycompany_docs.md \
    --questions path/to/mycompany_questions.json \
    --out results/mycompany/ \
    --conditions cold_haiku claude_projects_sonnet lb_cathedral_haiku lb_cathedral_gpt4o_mini
```

That's it. Your data never leaves your machine. The benchmark produces results showing
how each architecture (cold / vendor-native corpus injection / local Cathedral retrieval)
performs on YOUR knowledge base.

---

## Step 4 — Interpret your results

After the run, check `results/mycompany/results_summary.json`:

```json
{
  "conditions": {
    "cold_haiku":             {"hot_pct": 2.1, "cost_usd": 0.0012, "dollar_per_hot": 0.057},
    "claude_projects_sonnet": {"hot_pct": 78.3, "cost_usd": 0.94, "dollar_per_hot": 0.060},
    "lb_cathedral_haiku":     {"hot_pct": 71.2, "cost_usd": 0.018, "dollar_per_hot": 0.001}
  }
}
```

**Reading it:**
- `cold_haiku` at 2.1% HOT = the baseline with no memory. Your corpus-specific facts
  are not in the model's training data.
- `claude_projects_sonnet` at 78.3% HOT = Claude Projects (corpus injected in every query).
  High accuracy, but cost scales linearly with corpus size.
- `lb_cathedral_haiku` at 71.2% HOT = Local Cathedral retrieval (BM25, top-8 passages).
  Comparable accuracy, 60× cheaper per correct answer on this example.

**The architectural claim generalizes:** Cathedral indexed retrieval (even the BM25 local
version) is cost-efficient at scale because it retrieves and sends only the relevant passages
per query, not the entire corpus.

---

## Step 5 — Auto-generate a question bank (optional)

If you don't want to hand-author questions, use the included generator:

```bash
python generate_questions.py \
    --corpus path/to/mycompany_docs.md \
    --n 30 \
    --out path/to/mycompany_questions.json
```

The generator extracts key facts from your corpus and produces questions with
`hot_required_elements` derived directly from the corpus text.

**Note:** Auto-generated questions are less rigorous than hand-authored sealed banks.
They're suitable for exploring substitution but not for academic publication.

---

## Three-Class Substrate Sovereignty (#2315)

Your substitute corpus and results exist in one of three sovereignty classes:

**Ephemeral (default — what you get out of the box):**
- Corpus loaded into memory at run start, discarded when the process ends
- Results written to your local `--out` directory, nothing else
- No record kept anywhere outside your filesystem
- No LB server involvement

**Personal-Permanent (opt-in):**
- After a run, copy your results directory to a personal archive location
- Your corpus becomes a local indexed store you can query across sessions
- Still purely local — no platform involvement
- No membership required

**Shared-Permanent (explicit further opt-in, scope-selected):**
- Share your benchmark results with a specific scope (Family Table / Guild / Tribe)
- Your corpus content sharing is governed by the selected scope's membership rules
- **Public Federation scope additionally requires a Member Stamp**
  (the one place where Stamp is required — because one bad-actor public contribution
  could affect everyone else's shared substrate)

The Stamp exists only at Public Federation scope. Free to substitute. Free to keep private.
Free to share with your family, your guild, your team. The only place we ask for a Stamp
is at the public square — because that's where one bad signature could fool everyone else.

---

## Sovereignty contract — technical verification (C.6)

You can verify the sovereignty contract empirically with any network monitoring tool:

**On macOS/Linux:**
```bash
# In one terminal: start network monitoring
sudo tcpdump -n -i any 'not (src host 127.0.0.1 and dst host 127.0.0.1)' > network_trace.log &

# In another terminal: run with substitute corpus
python run_benchmark.py --tier smoke \
    --corpus sample_substitute_corpus/acme_corpus.md \
    --questions sample_substitute_corpus/acme_questions.json \
    --conditions lb_cathedral_haiku \
    --out results/sovereignty_test/

# After run: inspect network_trace.log
# Expected: connections to api.anthropic.com (or api.openai.com / googleapis.com) ONLY
# Expected: ZERO connections to lianabanyan.com, lb-server, or any other endpoint
```

**On Windows:**
```powershell
# Use Wireshark or Windows Filtering Platform:
# Filter for: NOT (ip.dst == 127.0.0.1 OR ip.dst == ::1)
# Then run the benchmark and observe outbound destinations
```

**The sovereignty guarantee is inviolable:** running with a substitute corpus produces
zero LB-server outbound calls. This is by architectural design, not policy.
The local Cathedral is purely in-process Python. The AI vendor API calls use YOUR keys.
No LB infrastructure intercepts or touches any data.

---

## Sample: Acme Cooperative

See `sample_substitute_corpus/` for a worked example with a fictitious 20-fact corpus:

```bash
# Run the Acme example to see substitution end-to-end:
python run_benchmark.py \
    --tier reasonable \
    --corpus sample_substitute_corpus/acme_corpus.md \
    --questions sample_substitute_corpus/acme_questions.json \
    --conditions cold_haiku lb_cathedral_haiku \
    --out results/acme_example/
```

Expected output: cold_haiku ~0-5% HOT, lb_cathedral_haiku ~60-80% HOT.

---

*Three-Class Substrate Sovereignty (#2315) is the architectural guarantee operationalized
here. K533 packages the empirical proof. K-future-C ships the Stamp infrastructure for
the Public Federation scope.*
