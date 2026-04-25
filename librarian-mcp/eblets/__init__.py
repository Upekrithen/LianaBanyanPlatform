"""
Eblets — Electronic Tablet summaries indexing Synapse clusters.

Crown Jewel candidate #2298: Seer / Augur / Eblets — The Awareness Net.
K485 · B123. First reduction-to-practice of the Eblet substrate.

Each Eblet is a 50-100 token summary-pointer into a full Synapse cluster.
An AI (the Seer) holds many Eblets in context and resolves pointers on demand —
this is virtual-context expansion: the LLM's summary-habit as index-generation.

Architecture reference: project_seer_augur_eblets_awareness_net.md
"""

from .eblet import Eblet, EbletStore, EBLET_STORE_PATH

__all__ = ["Eblet", "EbletStore", "EBLET_STORE_PATH"]
