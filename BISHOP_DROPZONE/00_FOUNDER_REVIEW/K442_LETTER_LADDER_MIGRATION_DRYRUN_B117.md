# K442 — Letter Predicate Ladder Migration (Dry-Run Report)

**Generated:** 2026-04-23T12:51:32.004101+00:00
**Manifest:** `librarian-mcp\touchstone\manifest.json`
**Proposed changes:** 43

Founder review, then run with `--apply` to commit:

```
python librarian-mcp/touchstone/migrate_letter_predicates.py --apply
```

---

## CREATE — 1 new deliverable(s)

### `crown-letter-bill-gates` — Crown letter to Bill Gates

```json
{
  "id": "crown-letter-bill-gates",
  "title": "Crown letter to Bill Gates",
  "owner": "founder",
  "depends_on": [],
  "letter_recipient": "Bill Gates",
  "predicate_ladder": [
    "letter_drafted",
    "letter_locked",
    "letter_dispatched",
    "response_received_within:14d"
  ],
  "verification": [],
  "status": "blocked",
  "blocked_reason": "Indefinite hold per MEMORY: Epstein-associations preclude outreach until further Founder direction. Do NOT auto-dispatch.",
  "completed_at": null,
  "notes": "K442 migration B117 — created 2026-04-23T12:51:32.004085+00:00. Distinct from crown-letter-melinda-french-gates."
}
```

## MODIFY — 42 existing deliverable(s)

| Deliverable | Recipient (extracted) | Ladder | Cleared verification |
|---|---|---|---|
| `crown-letter-melinda-french-gates` | Melinda French Gates | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-craig-newmark` | Craig Newmark | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-erik-brynjolfsson` | Erik Brynjolfsson | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-nathan-schneider` | Nathan Schneider | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-trebor-scholz` | Trebor Scholz | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-cory-doctorow` | Cory Doctorow | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-daron-acemoglu` | Daron Acemoglu | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-yochai-benkler` | Yochai Benkler | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-julian-posada` | Julian Posada | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-antonio-casilli` | Antonio Casilli | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-paola-ricaurte-quijano` | Paola Ricaurte Quijano | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-netsaalem-gebrie` | Netsaalem Gebrie | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-shoshana-zuboff` | Shoshana Zuboff | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-kate-raworth` | Kate Raworth | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-mariana-mazzucato` | Mariana Mazzucato | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-juliet-schor` | Juliet Schor | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-arun-sundararajan` | Arun Sundararajan | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-douglas-rushkoff` | Douglas Rushkoff | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-howard-marks` | Howard Marks | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-seth-godin` | Seth Godin | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-li-jin` | Li Jin | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-anand-giridharadas` | Anand Giridharadas | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-esther-perel` | Esther Perel | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-kara-swisher` | Kara Swisher | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-ezra-klein` | Ezra Klein | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-nilay-patel` | Nilay Patel | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-hank-green` | Hank Green | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-paris-marx` | Paris Marx | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-ed-zitron` | Ed Zitron | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-brian-merchant` | Brian Merchant | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-molly-white` | Molly White | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-tim-ingham` | Tim Ingham | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-kiko-martinez` | Kiko Martinez | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-ai-jen-poo` | Ai-jen Poo | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-majora-carter` | Majora Carter | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-simon-sinek` | Simon Sinek | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-taylor-swift` | Taylor Swift | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-dolly-parton` | Dolly Parton | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-jimmy-kimmel` | Jimmy Kimmel | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-pitbull` | Pitbull | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-ziwe-fumudoh` | Ziwe Fumudoh | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |
| `crown-letter-bambu-lab` | Bambu Lab | letter_drafted, letter_locked, letter_dispatched, response_received_within:14d | yes |


---

*Generated by `librarian-mcp/touchstone/migrate_letter_predicates.py` for K442 (B117).*
