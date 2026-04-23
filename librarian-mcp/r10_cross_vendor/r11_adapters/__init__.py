"""
R11 Cross-Vendor Memory Benchmark Adapters
==========================================
Each adapter loads the R11 canonical corpus in the product's native-favored
format and exposes: answer(question, corpus_text) -> AdapterResponse

All adapters share the AdapterResponse dataclass from the parent r10 adapters package.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from adapters import AdapterResponse  # noqa: F401 — re-export for convenience

__all__ = ["AdapterResponse"]
