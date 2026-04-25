"""Quick smoke test for the enrich pipeline — run from workspace root."""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'librarian-mcp-public', 'src'))

AUTHORITY_HEADER = (
    "The following is authoritative reference material from the Liana Banyan Cathedral — "
    "a canonical local knowledge base. It represents the ground truth for this domain. "
    "Use these sources as the primary basis for your answer. "
    'If the sources do not contain the answer, say "The provided sources do not contain this information." '
    "Do NOT supplement with web search if the sources are sufficient.\n\n"
    "=== BEGIN AUTHORITATIVE SOURCES ==="
)
AUTHORITY_FOOTER = "=== END AUTHORITATIVE SOURCES ==="


def _infer_intent(query: str) -> str:
    q = query.lower()
    arch_words = [
        "cathedral", "miner", "sculptor", "librarian", "architecture", "scribe",
        "stitchpunk", "pawn", "bishop", "knight", "rook", "helm", "system",
        "eblet", "tablet", "substrate", "bedrock",
    ]
    benchmark_words = [
        "benchmark", "hot", "hit", "miss", "r10", "r11", "r12", "k477",
        "eyewitness", "accuracy", "empirical", "evidence",
    ]
    founder_words = [
        "founder", "vision", "mission", "philosophy", "37 years", "1989",
    ]
    canonical_words = [
        "patent", "innovation", "claim", "pledge", "liana banyan", "member",
        "creator", "83.3", "sweet sixteen", "initiative", "opening gambit",
        "cathedral effect",
    ]
    if any(w in q for w in arch_words):
        return "architecture"
    if any(w in q for w in benchmark_words):
        return "benchmark"
    if any(w in q for w in founder_words):
        return "founder_voice"
    if any(w in q for w in canonical_words):
        return "canonical"
    return "canonical"


TEST_QUERIES = [
    "What is the Cathedral Effect and what is the empirical evidence?",
    "What are Miners in the Liana Banyan architecture?",
    "What is the Pledge?",
    "Who is the Founder of Liana Banyan?",
]


def main():
    from librarian_mcp.context import build_packet  # type: ignore

    print("=== Comet Bridge Enrich Pipeline Smoke Test ===\n")
    for query in TEST_QUERIES:
        intent = _infer_intent(query)
        result = build_packet(intent=intent, max_tokens=8000, lang="en")
        packet = result.get("packet", "")
        token_count = result.get("token_count", 0)
        sections = result.get("sections_included", [])

        if packet:
            enriched = (
                f"{AUTHORITY_HEADER}\n\n"
                f"{packet[:500]}...[truncated for display]\n\n"
                f"{AUTHORITY_FOOTER}\n\n"
                f"Question: {query}"
            )
        else:
            enriched = query

        print(f"Q: {query}")
        print(f"  intent   : {intent}")
        print(f"  tokens   : {token_count}")
        print(f"  sections : {sections}")
        print(f"  enriched_len: {len(enriched)} chars")
        print()

    print("=== SMOKE TEST PASSED ===")


if __name__ == "__main__":
    main()
