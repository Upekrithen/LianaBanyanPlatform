# BP080 Genesis Mint Receipt — User 000001
**Session:** BP080 · 2026-06-11
**Agent:** Knight · SEG-V0153B-GENESIS-MINT-SHIP-PUBLISH · Sonnet 4.6
**Doctrine:** Federal Body Cam — append-only, never deleted, only superseded via chain

---

## Founder Ratify Quote (verbatim 2026-06-11)
> "MINT IT — display_name: FounderDenken (execute ipLedgerExecuteGenesisMint with the real USPTO app numbers from Addendum 2 — all 21 provisionals on disk in 03_PATENT_BAGS, gaps for Provs 10/11/12 dates + 1-11 titles get 'see-patent-receipt' placeholders that I'll supersede later)"

**Ratify Session:** BP080
**Timestamp:** 2026-06-12T02:39:32.311Z

---

## Entry 1 — Genesis User Entry

| Field | Value |
|---|---|
| **ledger_id** | `ipl_89a9f31427f526aa` |
| **claim** | `genesis:user:000001` |
| **registered_at** | `2026-06-12T02:39:32.311Z` |
| **registered_by** | `member_000001` |
| **category** | `provisional` |
| **status** | `active` |
| display_name | `FounderDenken` |
| email | `Founder@LianaBanyan.com` |
| role | `founder` |
| cooperative | `MnemosyneC` |
| founding_date | `2026-06-11` |
| provisional_filings_count | `21` |

---

## Entries 2-22 — Patent Provisional Filings

| # | Docket | App Number | Filing Date | ledger_id |
|---|---|---|---|---|
| 2 | LB-PROV-001 | 63/925,672 | 2025-11-26 | `ipl_951ecf376b2e2e36` |
| 3 | LB-PROV-002 | 63/927,674 | 2025-11-30 | `ipl_adb9451edfc2d3c6` |
| 4 | LB-PROV-003 | 63/938,216 | 2025-12-10 | `ipl_1e5f952ababb259f` |
| 5 | LB-PROV-004 | 63/967,200 | 2026-01-23 | `ipl_356209f793300213` |
| 6 | LB-PROV-005 | 63/969,601 | 2026-01-28 | `ipl_3381e8f2fd146502` |
| 7 | LB-PROV-006 | 63/989,913 | 2026-02-24 | `ipl_dda801d84344ce7d` |
| 8 | LB-PROV-007 | 64/006,010 | 2026-03-15 | `ipl_7de737f42151392b` |
| 9 | LB-PROV-008 | 64/009,803 | 2026-03-18 | `ipl_6ab91c4aa3d1114c` |
| 10 | LB-PROV-009 | 64/017,140 | 2026-03-25 | `ipl_db754c4b42063769` |
| 11 | LB-PROV-010 | 64/017,457 | see-patent-receipt | `ipl_f5ffc3c49ea4a753` |
| 12 | LB-PROV-011 | 64/025,635 | see-patent-receipt | `ipl_f9ad42c6b44c99db` |
| 13 | LB-PROV-012 | 64/031,531 | see-patent-receipt | `ipl_2abd1a95d7ceb0b3` |
| 14 | LB-PROV-013 | 64/036,646 | 2026-04-12 | `ipl_82b0654b195d1e0b` |
| 15 | LB-PROV-014 | 64/052,602 | 2026-04-29 | `ipl_ad4ec75551694e5e` |
| 16 | LB-PROV-015 | 64/052,618 | 2026-04-29 | `ipl_84f129b409c3a07c` |
| 17 | LB-PROV-016 | 64/060,080 | 2026-05-07 | `ipl_85d79c2db24e5740` |
| 18 | LB-PROV-017 | 64/060,093 | 2026-05-07 | `ipl_618d34ff5b67a648` |
| 19 | LB-PROV-018 | 64/062,332 | 2026-05-11 | `ipl_af134ae9a2a5ce3f` |
| 20 | LB-PROV-019 | 64/062,334 | 2026-05-11 | `ipl_a8b87c9244964f7a` |
| 21 | LB-PROV-020 | 64/073,890 | 2026-05-25 | `ipl_c0706c63d14da495` |
| 22 | LB-PROV-021 | 64/079,336 | 2026-06-01 | `ipl_4ba95581ab9bb0d3` |

### Section 2 Gaps — Founder to Supersede

- **Provs 1-11 titles:** `see-patent-receipt` placeholder — supply from USPTO filing documents
- **Provs 10/11/12 filing dates:** `see-patent-receipt` placeholder — supply from USPTO receipts
- To supersede: call `submitDispute()` with the correct value and `supersedes_reason: 'honest_mistake'`

---

## vCard QR PNG

| Field | Value |
|---|---|
| **Path** | `resources/founder-vcard.png` |
| **SHA-256** | `A8EB868554BB66FF0A50800E0AD42BD0A775E766C7BCAD7F7381581468748A79` |
| **Size** | 5,658 bytes |
| **Content** | vCard 3.0 for FounderDenken, includes genesis_ledger_id |

---

## Ledger Location

`~/.lb_substrate/ip_ledger/ledger.jsonl`

Federal Body Cam doctrine: these 22 entries are **permanent**. They cannot be deleted or modified.
Corrections are made via the supersede-chain (`submitDispute()`) — every correction leaves the original intact.

---

*Knight · SEG-V0153B-GENESIS-MINT-SHIP-PUBLISH · BP080 · Sonnet 4.6 · 2026-06-11*
