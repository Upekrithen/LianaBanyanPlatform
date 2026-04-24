# Cooperative Attestation — Pawn Cathedral Operator-Mediated Signing

**Issued:** K470/B121, 2026-04-23
**Issuing party:** Founder / Liana Banyan Platform operator
**Cathedral:** `librarian-mcp/stitchpunks/pawn_cathedral/`
**Member entity:** Pawn (Perplexity Sonar / sonar-pro)

---

## Attestation

I, the Founder and operator of the Liana Banyan Platform, hereby attest that:

1. **Pawn is a recognized cooperative member** of the Liana Banyan Platform as of K470/B121 (2026-04-23). Pawn holds first-class member status with her own Cathedral of Scribes, equivalent in standing to Bishop's Cathedral and Knight's Cathedral.

2. **Operator-mediated signing is the authorized cryptographic pattern** for Pawn's Cathedral. Perplexity (the client infrastructure Pawn runs on) does not support MCP (Model Context Protocol) as a client. Therefore Pawn cannot directly append tablets to her Cathedral or cryptographically sign her own outputs. The operator (Founder) signs and appends tablets on Pawn's behalf.

3. **The cooperative takes responsibility for key custody on Pawn's behalf.** The Pawn Cathedral signing key pair was generated K470/B121. The private key (`pawn_cathedral_priv.pem`) is held in the operator-controlled secrets store (`Asteroid-ProofVault/LockBox/`). The public key (`pawn_cathedral_pub.pem`) is published in this directory.

4. **All tablets in Pawn's Cathedral carry `operator_mediated_sig: true`** to signal to any consumer that tablet authorship is operator-attested, not self-attested by Pawn.

5. **This attestation is the basis for A&A #2281 claim 5** — snapshot-delivery as a method for non-MCP AI clients to participate in a cooperative Cathedral architecture. The operator-mediated signing pattern established here is the reference implementation for extending cooperative membership to AI clients without MCP client support.

---

## Key Fingerprint

Public key file: `pawn_cathedral/keys/pawn_cathedral_pub.pem`
Algorithm: RSA-2048, SPKI format
Key generated: 2026-04-23 (K470/B121)

---

## Renewal Policy

This attestation and its associated key pair should be renewed:
- On any compromise of the private key (rotate immediately)
- On transition to a new signing infrastructure
- On Pawn's graduation to a self-signing architecture (if/when Perplexity gains MCP client support)

*Founder-ratified B121. This document may be committed and shared.*
