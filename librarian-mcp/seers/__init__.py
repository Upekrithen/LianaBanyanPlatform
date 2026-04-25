"""
seers/ — Seer Prototype (K489 · B123)

The Seer is an LLM operating on the Eblet-indexed Pyramid (the Awareness Net).
It performs Eblet-relevance matching, loads a thought-bundle into context,
issues an LLM reasoning call with provenance, and can resolve Eblet pointers
to full Synapse content on demand (virtual-context-expansion).

Architecture reference:
  .claude/projects/.../memory/project_seer_augur_eblets_awareness_net.md §3

Crown Jewel: #2298 (Seer / Augur / Eblets — The Awareness Net)
REF Staff discipline: Seer reads Eblets/Synapses/bedrock; writes conversational output only.
"""
