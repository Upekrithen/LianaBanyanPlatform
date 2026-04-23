# Pudding #96 — The Librarian

*An AI knowledge management system that remembers everything so the agents don't have to.*

---

AI agents have a memory problem. Each session starts fresh. The context window — however large — is finite. When a codebase has 580 tables, 139 edge functions, 470 pages, and 2,130 documented innovations, no single session can hold all of it. The agent that built the housing domain yesterday does not remember doing it today.

The Librarian solves this. It is a Model Context Protocol (MCP) server — a TypeScript application that indexes the entire platform and exposes 23 specialized tools for querying the knowledge base. Instead of reading every file at session start, an agent calls `brief_me` with a task description and receives a compact, task-scoped context package in approximately 600 words. The right information, for the right task, at the right moment.

The indexer runs in 24 seconds and produces 15 index files: schemas, functions, pages, Cephas content, session context, Bishop chat transcripts, domain maps, architectural concepts, dropzone tasks, Cursor agent transcripts, React components, system overview, canonical numbers, v2 migration status, and letter tracking.

Each index is structured for fast lookup. The schema index maps 580 tables with their columns, types, constraints, foreign keys, indexes, RLS policies, and originating migrations. The domain index maps 29 domains to their tables, functions, pages, and feature flags. The component index catalogs 679 components, 71 hooks, and 147 libraries with their exports, imports, Supabase queries, and props.

The tools are purpose-built. `get_schema` returns everything about a table. `query_domain` returns everything in a domain. `moneypenny_checklist` validates a proposed task against architectural rules before implementation begins. `check_consistency` catches violations — like using securities language or building a feature that contradicts the three-currency system — before they reach production.

The Librarian does not think. It does not reason. It does not make decisions. It retrieves. It indexes. It cross-references. It provides the raw material that allows thinking agents — Knight, Bishop, Rook, Pawn — to make informed decisions without spending half their context window on orientation.

The name is intentional. A librarian's job is not to read every book. It is to know where every book is and to hand you the right one when you need it. The Librarian MCP does exactly this for a platform that has grown beyond what any single agent — or any single human — can hold in memory at once.

---

*Pudding #96 | Bishop B063 | April 2, 2026*
*23 tools. 15 indexes. 24 seconds to rebuild. The memory the agents need.*
