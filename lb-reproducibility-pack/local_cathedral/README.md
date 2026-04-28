# Local Cathedral — Standalone Instance

The Local Cathedral provides BM25-indexed retrieval over an arbitrary corpus,
running entirely on your machine. It is the sovereignty-contract-critical component
of the lb-reproducibility-pack: your corpus never leaves your filesystem.

## Architecture

The local Cathedral is implemented in `adapters/local_cathedral_adapter.py` as a
pure Python in-process library. It does NOT require Node.js, a running daemon, or
any network connection to LB infrastructure.

```
lb_cathedral_haiku condition:
  run_benchmark.py
      └─ LocalCathedralClient(corpus_text)
              └─ BM25 index built in memory
              └─ retrieve(question) → top-8 passages
      └─ Anthropic API call (YOUR key, YOUR outbound)
              └─ response → graded HOT/HIT/MISS
```

## How it works

1. **Index build** (once per run): The corpus text is split into paragraph-level
   segments. Each segment is tokenized and indexed using BM25 (Robertson/Sparck Jones
   weighting: K1=1.5, B=0.75). Typical smoke corpus (~5K words) indexes in <10ms.

2. **Retrieval** (per query): The question is tokenized. BM25 scores are computed
   against all indexed segments. Top-8 segments are selected and injected into the
   model's system prompt as "LOCAL CATHEDRAL CONTEXT".

3. **Model call**: The enriched prompt goes to the AI vendor (Anthropic/OpenAI/Google)
   using YOUR API key. The response is graded HOT/HIT/MISS.

## Sovereignty contract

The local Cathedral runs entirely in-process. Verification:

```bash
# Run with network monitoring to confirm zero LB server calls:
python run_benchmark.py --tier smoke --conditions lb_cathedral_haiku --out results/sovereignty_test/

# Parallel tcpdump / Wireshark to confirm outbound calls go ONLY to:
#   api.anthropic.com (if using Anthropic model)
#   api.openai.com (if using OpenAI model)
#   generativelanguage.googleapis.com (if using Google model)
# Zero calls to: lianabanyan.com, librarian-mcp, or any LB endpoint
```

## Comparison with full LB Cathedral

| Feature | Local Cathedral (this) | Full LB Cathedral (K528) |
|---------|------------------------|--------------------------|
| Implementation | Pure Python BM25 | Node.js consult_scribes_cli.mjs |
| Network deps | AI vendor API only | LB MCP server |
| Setup | `pip install -r requirements.txt` | `npm install` in librarian-mcp |
| Corpus source | Local file (your corpus) | LB Scribes (pre-indexed) |
| Index quality | BM25 keyword matching | BM25 + dense vector + Pheromone Substrate |
| Performance on K528 canonical | Similar to K528 at 27-30% HOT (R11-v2 not yet ingested) | Same baseline; both improve when R11-v2 is ingested |

The local Cathedral is designed for reproducibility and sovereignty, not production.
For production LB Cathedral use, see `librarian-mcp/` in the main repo.

## Extension: adding dense vector retrieval

The local Cathedral can be enhanced with sentence-transformers for dense vector
retrieval to more closely match the full Thornwick hybrid architecture:

```python
# In local_cathedral_adapter.py, add:
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode([seg.text for seg in segments])
```

This is left as a K-future extension (K-future-B: local Cathedral standalone full
implementation). The BM25 baseline is sufficient for reproducibility verification.
