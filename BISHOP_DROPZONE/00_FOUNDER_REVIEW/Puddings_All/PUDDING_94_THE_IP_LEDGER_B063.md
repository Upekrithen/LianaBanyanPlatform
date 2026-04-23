# Pudding #94 — The IP Ledger

*Every idea documented. Every creator credited. Every innovation tracked from napkin sketch to patent filing.*

---

When an employee at a large company has an idea, the company owns it. The employment contract includes an intellectual property assignment clause — anything you invent on company time, using company resources, or related to company business belongs to the company. The employee might get a plaque. The company gets the patent.

Liana Banyan's IP Ledger exists because the cooperative is not an employer. Members are not employees. When a member creates something — a product design, a recipe, a teaching method, a manufacturing process, a software tool — the member owns it. The IP Ledger documents that ownership with timestamps, descriptions, and classification metadata.

The ledger tracks three layers. The innovation log records what was created, when, by whom, and what it relates to. The A&A (Acknowledgment and Acceptance) formal process produces a structured document for each innovation — description, prior art analysis, claims, and classification as either a standard innovation or a Crown Jewel (one with zero or minimal prior art). The patent bag groups related innovations for provisional patent filing.

As of today, the ledger contains 2,130 innovations. Of those, 168 are Crown Jewels. 2,103 formal claims have been documented. Eleven provisional patent applications have been filed with the USPTO, covering the full range at a total cost of $715.

The technical architecture uses relational tables with JSONB metadata, full-text search via generated tsvector columns with GIN indexes, and recursive CTEs for traversing innovation chains. It scales to 100,000-1,000,000 documents comfortably in Postgres without requiring a graph database. If deep path queries across hundreds of thousands of interconnected innovations become necessary, the architecture has a migration path to Neo4j — but Postgres handles the current and projected scale.

The ledger is not a filing cabinet. It is the infrastructure that makes individual IP ownership practical at cooperative scale. A member with three innovations and one Crown Jewel has the same documentation quality as the platform itself with 2,130. The templates, the AI assistance, the formal process — these are not internal tools reserved for the Founder. They are member-facing infrastructure that makes $65 provisional patent filings accessible to anyone with an idea worth protecting.

---

*Pudding #94 | Bishop B063 | April 2, 2026*
*2,130 innovations. 168 Crown Jewels. Every one documented. Every creator credited.*
