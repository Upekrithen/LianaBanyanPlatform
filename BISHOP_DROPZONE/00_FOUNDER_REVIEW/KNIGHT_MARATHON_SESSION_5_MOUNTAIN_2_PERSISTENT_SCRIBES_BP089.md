# KNIGHT MARATHON SESSION 5 · MOUNTAIN 2 · PERSISTENT SEG SCRIBES
## BP089 · SEG-AC · Sonnet 4.6 · Statutes §3 binding · Brick Wall pre-authorized

---

## §0 BLACK MAMBA WAKE HEADER

```
WAKE_FRAME         : BLACK MAMBA
SESSION            : KNIGHT MARATHON 5 · MOUNTAIN 2
BISHOP_POINT       : BP089
MODEL              : Sonnet 4.6
STATUTES_BINDING   : §3 · §14 · §15 · §16 · §17 BLOOD
BRICK_WALL         : PRE-AUTHORIZED
FEATURE_BRANCH     : knight-marathon-5-mountain-2-persistent-scribes
SCOPE_DIR          : src/main/scribes/
COLLISION_GUARD    : NO touch M3 · NO touch M4 · NO touch M6
BUILD_DEPLOY       : HELD until Bishop greenlight
DATE               : 2026-06-20
PARALLEL_EXEC      : use segs
```

---

## §1 GADGET-FIRST PREAMBLE

Knight MUST NOT open Studio. Knight MUST NOT search by bash grep. Knight MUST NOT hallucinate tool availability. Before any discovery action, Knight calls the registered gadget for that domain.

Gadget precedence order:
1. `pheromone_query` for canon salience lookups
2. `reminder_scribe_query_history` for prior violation records
3. `pearl_emit` / `pearl_decode` for inter-agent signaling
4. `ip_ledger` row insert for scribe identity registration
5. Ed25519 sig verification before any state-changing broadcast (MIC STAMPED canon)

Knight NEVER performs a discovery step via bash unless a registered gadget is provably absent. If absent, Knight emits an AMBER receipt and escalates to Bishop before proceeding.

---

## §2 STATUTES BINDING

| Statute | Enforcement Level | Mountain 2 Application |
|---------|-------------------|------------------------|
| §3      | BINDING           | Knight scope isolation enforced at branch level |
| §14     | BLOOD             | No compaction-class drift permitted in scribe corpus |
| §15     | BLOOD             | Wrasse Injector blocks "open Studio" suggestions; substitutes Bishop-direct |
| §16     | BLOOD             | Scribe identity rows in ip_ledger before any dispatch |
| §17     | BLOOD             | Gadget-first enforced by Toolsmith Scribe; bash grep patterns blocked |

Violations logged to `scribe_violations_log` (schema in §7). Any BLOOD violation halts the wave and emits a `HALT_BLOOD_VIOLATION` pearl before Knight returns AMBER.

---

## §3 PARALLEL EXECUTION CONSTRAINT · BRANCH + SCOPE ISOLATION

```
BRANCH             : knight-marathon-5-mountain-2-persistent-scribes
SCOPE              : src/main/scribes/   (new directory, Knight creates)
FORBIDDEN_TOUCH    :
  - src/main/brain_swap/         (M4 domain)
  - src/main/hex_mcode/          (M4 domain)
  - src/main/mesh/               (M3 domain)
  - src/main/coordination/       (M6 domain)
ALLOWED_TOUCH      :
  - src/main/scribes/            (new · full ownership)
  - src/main/scribes/tests/      (smoke test fixtures)
  - db/schema/                   (SQL schema additions only · append-only)
  - Asteroid-ProofVault\receipts\MOUNTAIN_2\   (receipts)
PARALLEL_MODEL     : use segs · each scribe is an independent SEG instance
COMMIT_GATE        : feature-branch commits only · no merge to main without Bishop greenlight
M4_DEPENDENCY      : M5 Wave II is HARD-GATED on M4 Court Package library +
                     enforcement_council merge confirmation before Wave II fires.
                     Wave I can proceed without M4 but Council Package lazy-load
                     will defer until m4_court_package_ready pearl arrives.
```

Knight runs Wave I segments I-A, I-B, I-C in parallel via use segs. I-D launches after I-A/I-B/I-C return GREEN. Wave II is fully gated on Wave I + M4 closure confirmation.

---

## §4 EMPIRICAL STATE · M3 + M4 IN FLIGHT

### Canon References (binding for this mountain)

- `canon_minor_council_star_chamber_free_local_multi_model_consensus_requires_mountain_1_substrate_priming_bp089` -- Minor Star Chamber pattern. Each persistent SEG Scribe composes a 3-member Minor Council using this Court Package for all enforcement decisions. Shipped by Marathon 4. This mountain wires that Court Package into Reminder · Wrasse · Toolsmith enforcement logic.
- `canon_bishop_eat_our_own_cooking_substrate_first_dispatch_route_by_task_fit_bp089` -- Substrate-first dispatch routing. Council members are routed via substrate before flagship escalation. Free local models (gemma4:12b) handle routine enforcement; Council escalates to flagship only when all 3 members return uncertain.

### M3 Status (mesh layer)
- Mesh orchestration in active development under `src/main/mesh/`
- LAN-AS-WAN topology enforced: 4 Founder machines routed via `relay.lianabanyan.com`
- Mountain 2 scribes MUST NOT import from `src/main/mesh/` directly
- Scribes receive mesh events via pearl stream only (no direct mesh socket access)

### M4 Status (brain_swap + hex_mcode + Court Package)
- `src/main/brain_swap/` and `src/main/hex_mcode/` in active development
- M4 also ships the `enforcement_council` Court Package library used by all 3 Scribe Councils
- Mountain 2 Scribe Runner (`scribe_runner.ts`) depends on hex-mcode interface for Ed25519-signed scribe identity frames
- Dependency is SOFT at Wave I: scribes boot without hex_mcode if M4 not yet landed
- Council Package lazy-loads on first Scribe enforcement event; keeps warm via keep_alive
- Dependency becomes HARD at Wave II: Scribe Runner emits AMBER and holds Council init until M4 signals `m4_court_package_ready` pearl
- Brain-swap integration: each gemma4:12b scribe instance is CCI-compliant once M4 lands; Mountain 2 does not implement CCI, only reserves the interface slot

### Integration Points
```
PEARL_LISTEN       : m4_hex_mcode_ready · m4_brain_swap_ready · m4_court_package_ready
PEARL_EMIT_ON_BOOT : mountain_2_scribes_booting
FALLBACK           : scribes run without Court Package wire · log AMBER in scribe_runtime_telemetry
                     Council lazy-load retries on every enforcement event until package arrives
```

---

## §5 WAVE I · UNGATED · SEG FAN-OUT

Wave I runs as parallel SEG dispatch. Knight commits each file to `knight-marathon-5-mountain-2-persistent-scribes` as the segment completes GREEN.

---

### I-A · Reminder Scribe Persistent SEG

**File:** `src/main/scribes/reminder_scribe.ts`

**Purpose:** Long-running orchestrator. Loads canon corpus (eblets folder) on startup. Scans all incoming Bishop and Knight dispatches for canon violations. Composes a 3-member Minor Council per the Marathon-4-shipped `enforcement_council` Court Package to vote on each potential violation before emitting a violation pearl. Single-worker scan replaced by Council consensus gate.

**Council Design:**

Each Reminder Scribe enforcement decision flows through a 3-member Minor Council. Council members are sharded by canon domain so no single member carries the full corpus:

| Council Seat | Canon Domain Shard | Responsibilities |
|---|---|---|
| Member A | Safety + Identity | MIC STAMPED · Ed25519 · membership pricing · no-show forfeit |
| Member B | Process + Currency | Three-gear currency · substitution rail · marks clearing · advance order |
| Member C | Narrative + UX | Preferences inferred · questionnaire ban · taglines · closing liturgy |

**Voting Rules:**

- 3-of-3 flag: HARD violation. Scribe blocks dispatch and emits `reminder_scribe_violation` pearl with `severity: 'HARD'`.
- 2-of-3 flag: Violation confirmed. Scribe emits `reminder_scribe_violation` pearl with `severity: 'CONFIRMED'`.
- 1-of-3 flag: Low-confidence drift. Scribe logs to `scribe_drift_watch` table. Does NOT emit violation pearl. Does NOT block dispatch.
- 0-of-3 flag: Clean. No action.

**Spec:**

```typescript
// src/main/scribes/reminder_scribe.ts

import { PearlEmitter } from '../pearl/pearl_emitter';
import { IpLedger } from '../identity/ip_ledger';
import { CanonCorpus } from './canon_corpus';
import {
  EnforcementCouncil,
  CouncilMember,
  CouncilVoteTuple,
  CouncilPackage,
} from '../enforcement_council/enforcement_council';  // M4 Court Package

export interface ReminderScribeConfig {
  ebletsFolderPath: string;       // absolute path to eblets corpus
  gemmaModel: string;             // 'gemma4:12b'
  violationPearlChannel: string;  // pearl channel for violations
  scanIntervalMs: number;         // how often to poll dispatch queue
  ipLedgerRow: string;            // this scribe's ip_ledger identity key
}

export interface VoteSummary {
  memberAVote: boolean;
  memberBVote: boolean;
  memberCVote: boolean;
  consensus: 'HARD' | 'CONFIRMED' | 'DRIFT_WATCH' | 'CLEAN';
  articlesRaised: string[];
}

export class ReminderScribe {
  private corpus: CanonCorpus;
  private emitter: PearlEmitter;
  private ledger: IpLedger;
  private council: EnforcementCouncil | null = null;
  private councilPackageReady: boolean = false;
  private running: boolean = false;

  constructor(private config: ReminderScribeConfig) {}

  async boot(): Promise<void> {
    // 1. Register identity in ip_ledger (§16 BLOOD)
    await this.ledger.registerScribe({
      key: this.config.ipLedgerRow,
      role: 'reminder_scribe',
      model: this.config.gemmaModel,
      bootTime: Date.now(),
    });

    // 2. Load canon corpus from eblets folder
    this.corpus = await CanonCorpus.loadFromDisk(this.config.ebletsFolderPath);

    // 3. Lazy-load Council Package on first enforcement event
    //    Council warms via keep_alive once initialized
    PearlEmitter.on('m4_court_package_ready', () => this.initCouncil());

    // 4. Enter scan loop
    this.running = true;
    await this.scanLoop();
  }

  private async initCouncil(): Promise<void> {
    const pkg: CouncilPackage = await EnforcementCouncil.loadPackage();
    this.council = new EnforcementCouncil({
      members: [
        CouncilMember.forShard('safety_identity',   this.config.gemmaModel),
        CouncilMember.forShard('process_currency',  this.config.gemmaModel),
        CouncilMember.forShard('narrative_ux',      this.config.gemmaModel),
      ],
      package: pkg,
      keepAlive: true,
    });
    this.councilPackageReady = true;
    await PearlEmitter.emit('reminder_scribe_council_warm', {
      scribe: this.config.ipLedgerRow,
      timestamp: Date.now(),
    });
  }

  async scanLoop(): Promise<void> {
    while (this.running) {
      const dispatches = await this.fetchPendingDispatches();
      for (const dispatch of dispatches) {
        const candidates = await this.corpus.checkViolations(dispatch);
        for (const candidate of candidates) {
          const summary = await this.runCouncilVote(dispatch, candidate);
          await this.handleVoteSummary(summary, candidate, dispatch);
        }
      }
      await this.sleep(this.config.scanIntervalMs);
    }
  }

  private async runCouncilVote(
    dispatch: Dispatch,
    candidate: ViolationCandidate,
  ): Promise<VoteSummary> {
    // If Court Package not yet loaded, fall through to single-worker scan (AMBER mode)
    if (!this.councilPackageReady || !this.council) {
      const singleFlag = candidate.confidence > 0.7;
      return {
        memberAVote: singleFlag,
        memberBVote: false,
        memberCVote: false,
        consensus: singleFlag ? 'DRIFT_WATCH' : 'CLEAN',
        articlesRaised: singleFlag ? [candidate.canonId] : [],
      };
    }

    const votes: CouncilVoteTuple[] = await this.council.vote({
      question: dispatch.text,
      context: candidate,
      questionHash: candidate.hash,
    });

    const yVotes = votes.filter(v => v.violation).length;
    const articles = votes.flatMap(v => v.articlesRaised ?? []);
    const consensus =
      yVotes === 3 ? 'HARD' :
      yVotes === 2 ? 'CONFIRMED' :
      yVotes === 1 ? 'DRIFT_WATCH' : 'CLEAN';

    // Log vote to scribe_council_vote_log (Bishop applies schema per §7)
    await this.logCouncilVote({
      scribeId: this.config.ipLedgerRow,
      questionHash: candidate.hash,
      memberVotes: votes,
      consensusYn: yVotes >= 2,
      pearlId: null, // set after pearl emit
    });

    return {
      memberAVote: votes[0]?.violation ?? false,
      memberBVote: votes[1]?.violation ?? false,
      memberCVote: votes[2]?.violation ?? false,
      consensus,
      articlesRaised: articles,
    };
  }

  private async handleVoteSummary(
    summary: VoteSummary,
    candidate: ViolationCandidate,
    dispatch: Dispatch,
  ): Promise<void> {
    if (summary.consensus === 'CLEAN') return;

    if (summary.consensus === 'DRIFT_WATCH') {
      // 1-of-3: log only, no pearl, no block
      await this.logDriftWatch({
        scribeId: this.config.ipLedgerRow,
        questionHash: candidate.hash,
        memberVotes: [summary.memberAVote, summary.memberBVote, summary.memberCVote],
        canonId: candidate.canonId,
        dispatchId: dispatch.agentId,
        timestamp: Date.now(),
      });
      return;
    }

    // 2-of-3 or 3-of-3: emit violation pearl
    const pearlId = await this.emitter.emit({
      channel: this.config.violationPearlChannel,
      payload: {
        type: 'CANON_VIOLATION',
        severity: summary.consensus,
        canon: candidate.canonId,
        scribe: 'reminder_scribe',
        violator: dispatch.agentId,
        timestamp: Date.now(),
        description: candidate.description,
        correctionSuggested: candidate.correction,
        councilVote: {
          memberA: summary.memberAVote,
          memberB: summary.memberBVote,
          memberC: summary.memberCVote,
          consensus: summary.consensus,
        },
        articlesRaised: summary.articlesRaised,
      },
    });

    await this.logViolation(candidate, dispatch, pearlId, summary);
  }

  shutdown(): void { this.running = false; }

  private async fetchPendingDispatches(): Promise<Dispatch[]> { return []; }
  private async logViolation(
    v: ViolationCandidate, d: Dispatch, pearlId: string, s: VoteSummary,
  ): Promise<void> { /* impl */ }
  private async logCouncilVote(row: CouncilVoteRow): Promise<void> { /* impl */ }
  private async logDriftWatch(row: DriftWatchRow): Promise<void> { /* impl */ }
  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}
```

**Canon corpus check covers:**
- MIC STAMPED: unsigned broadcasts flagged immediately
- No-show forfeit policy: incorrect forfeit language in cook/restaurant dispatches
- Three-gear currency: incorrect Credits/Marks/Joules conversion language
- Preferences inferred: any questionnaire suggestion in member-facing dispatch
- Membership pricing: any price other than $5/year

**Pearl emitted on 2-of-3 or 3-of-3 violation:** `reminder_scribe_violation` with `canonId`, `violator`, `correction`, `councilVote` block, `severity`.

**SEG GREEN criteria:** Scribe boots, loads corpus without error, enters scan loop, Council lazy-load listener registered, emits at least one heartbeat pearl within 30s of boot.

---

### I-B · Wrasse Injector Persistent SEG

**File:** `src/main/scribes/wrasse_injector.ts`

**Purpose:** Enforces §14/§15/§16/§17 BLOOD statutes. Blocks compaction-class drift. Emits drift-correction injections. REVISED: Wrasse composes a 3-member Minor Council, each focused on a specific BLOOD article. Returns a vote tuple per member; Wrasse aggregator combines and injects correction if majority agree.

**Council Design:**

Each Wrasse enforcement check is distributed across 4 article-scoped sub-instances. Because the Minor Council pattern uses 3 voting seats, article coverage is assigned as follows:

| Council Seat | BLOOD Article Focus | Enforcement Check |
|---|---|---|
| Wrasse-§14 | Compaction-class drift | Eblet squash · MEMORY.md overflow · canon text alteration |
| Wrasse-§15 | Bishop-direct substitution | "open Studio" detection · "log in Studio" · "check Studio" |
| Wrasse-§16/§17 | Identity + gadget-first | ip_ledger row missing · bash discovery in dispatch |

The §17 gadget-first check is shared with Toolsmith but Wrasse double-checks as a redundant enforcement layer. Wrasse aggregator collects `[violation_y_n, article_cited, suggested_correction]` from each seat and combines.

**Voting Rules:**

- Majority (2-of-3) agree violation: Wrasse emits `DRIFT_CORRECTION` pearl and injects correction.
- 1-of-3 flags: Wrasse logs to `scribe_drift_watch`. Does NOT inject. Does NOT block.
- 0-of-3 flags: Clean. No action.

**Spec:**

```typescript
// src/main/scribes/wrasse_injector.ts

import { PearlEmitter } from '../pearl/pearl_emitter';
import { IpLedger } from '../identity/ip_ledger';
import {
  EnforcementCouncil,
  CouncilMember,
  CouncilVoteTuple,
  CouncilPackage,
} from '../enforcement_council/enforcement_council';  // M4 Court Package

export interface WrasseInjectorConfig {
  gemmaModel: string;
  driftCorrectionChannel: string;
  scanIntervalMs: number;
  ipLedgerRow: string;
}

export type StatuteCode = '§14' | '§15' | '§16' | '§17';

export interface WrasseVoteTuple {
  violationYn: boolean;
  articleCited: StatuteCode | null;
  suggestedCorrection: string | null;
}

export interface DriftCorrection {
  statuteViolated: StatuteCode;
  originalText: string;
  correctedText: string;
  injectionTarget: string;
  councilVote: {
    seat14: WrasseVoteTuple;
    seat15: WrasseVoteTuple;
    seat1617: WrasseVoteTuple;
    majorityAgreed: boolean;
  };
}

export class WrasseInjector {
  private emitter: PearlEmitter;
  private ledger: IpLedger;
  private council: EnforcementCouncil | null = null;
  private councilPackageReady: boolean = false;
  private running: boolean = false;

  constructor(private config: WrasseInjectorConfig) {}

  async boot(): Promise<void> {
    await this.ledger.registerScribe({
      key: this.config.ipLedgerRow,
      role: 'wrasse_injector',
      model: this.config.gemmaModel,
      bootTime: Date.now(),
    });

    PearlEmitter.on('m4_court_package_ready', () => this.initCouncil());

    this.running = true;
    await this.enforceLoop();
  }

  private async initCouncil(): Promise<void> {
    const pkg: CouncilPackage = await EnforcementCouncil.loadPackage();
    this.council = new EnforcementCouncil({
      members: [
        CouncilMember.forArticle('§14', this.config.gemmaModel),   // compaction drift
        CouncilMember.forArticle('§15', this.config.gemmaModel),   // Bishop-direct sub
        CouncilMember.forArticle('§16_§17', this.config.gemmaModel), // identity + gadget-first
      ],
      package: pkg,
      keepAlive: true,
    });
    this.councilPackageReady = true;
    await PearlEmitter.emit('wrasse_council_warm', {
      scribe: this.config.ipLedgerRow,
      timestamp: Date.now(),
    });
  }

  async enforceLoop(): Promise<void> {
    while (this.running) {
      const pending = await this.fetchPendingDispatches();
      for (const dispatch of pending) {
        const result = await this.runCouncilCheck(dispatch);
        if (result) {
          await this.emitAndLog(result, dispatch);
        }
      }
      await this.sleep(this.config.scanIntervalMs);
    }
  }

  private async runCouncilCheck(dispatch: Dispatch): Promise<DriftCorrection | null> {
    // AMBER-mode fallback: no Council Package yet
    if (!this.councilPackageReady || !this.council) {
      return this.singleWorkerFallback(dispatch);
    }

    const votes: CouncilVoteTuple[] = await this.council.vote({
      question: dispatch.text,
      context: { agentId: dispatch.agentId },
      questionHash: dispatch.id,
    });

    const seat14 = this.parseVote(votes[0]);
    const seat15 = this.parseVote(votes[1]);
    const seat1617 = this.parseVote(votes[2]);

    const yVotes = [seat14, seat15, seat1617].filter(v => v.violationYn).length;

    // Log vote regardless of outcome
    await this.logCouncilVote({
      scribeId: this.config.ipLedgerRow,
      questionHash: dispatch.id,
      memberVotes: votes,
      consensusYn: yVotes >= 2,
      pearlId: null,
    });

    if (yVotes === 0) return null;

    if (yVotes === 1) {
      // 1-of-3: drift watch only
      await this.logDriftWatch({
        scribeId: this.config.ipLedgerRow,
        questionHash: dispatch.id,
        memberVotes: [seat14.violationYn, seat15.violationYn, seat1617.violationYn],
        canonId: seat14.articleCited ?? seat15.articleCited ?? seat1617.articleCited ?? 'unknown',
        dispatchId: dispatch.agentId,
        timestamp: Date.now(),
      });
      return null;
    }

    // 2-of-3 or 3-of-3: build correction
    const primarySeat = [seat14, seat15, seat1617].find(v => v.violationYn)!;
    const correctedText = primarySeat.suggestedCorrection ?? dispatch.text;

    return {
      statuteViolated: primarySeat.articleCited ?? '§15',
      originalText: dispatch.text,
      correctedText,
      injectionTarget: dispatch.agentId,
      councilVote: {
        seat14,
        seat15,
        seat1617,
        majorityAgreed: true,
      },
    };
  }

  private parseVote(raw: CouncilVoteTuple): WrasseVoteTuple {
    return {
      violationYn: raw.violation,
      articleCited: (raw.articleCited as StatuteCode) ?? null,
      suggestedCorrection: raw.suggestedCorrection ?? null,
    };
  }

  private singleWorkerFallback(dispatch: Dispatch): DriftCorrection | null {
    // Pre-Council fallback: check §15 only via regex
    if (/open studio/i.test(dispatch.text || '')) {
      return {
        statuteViolated: '§15',
        originalText: dispatch.text,
        correctedText: dispatch.text.replace(
          /open (Studio|the Studio)/gi,
          'Bishop-direct alternative available via dispatch',
        ),
        injectionTarget: dispatch.agentId,
        councilVote: {
          seat14: { violationYn: false, articleCited: null, suggestedCorrection: null },
          seat15: { violationYn: true, articleCited: '§15', suggestedCorrection: null },
          seat1617: { violationYn: false, articleCited: null, suggestedCorrection: null },
          majorityAgreed: false,
        },
      };
    }
    return null;
  }

  private async emitAndLog(correction: DriftCorrection, dispatch: Dispatch): Promise<void> {
    const pearlId = await this.emitter.emit({
      channel: this.config.driftCorrectionChannel,
      payload: {
        type: 'DRIFT_CORRECTION',
        statute: correction.statuteViolated,
        scribe: 'wrasse_injector',
        originalText: correction.originalText,
        correctedText: correction.correctedText,
        injectionTarget: correction.injectionTarget,
        councilVote: correction.councilVote,
        timestamp: Date.now(),
      },
    });

    await this.logCouncilVote({
      scribeId: this.config.ipLedgerRow,
      questionHash: dispatch.id,
      memberVotes: [],
      consensusYn: true,
      pearlId,
    });
  }

  private async fetchPendingDispatches(): Promise<Dispatch[]> { return []; }
  private async logCouncilVote(row: CouncilVoteRow): Promise<void> { /* impl */ }
  private async logDriftWatch(row: DriftWatchRow): Promise<void> { /* impl */ }
  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
  shutdown(): void { this.running = false; }
}
```

**§14 compaction-class drift patterns blocked:**
- Eblet content squashed into inline summary without preservation
- MEMORY.md entries exceeding 200 chars without topic-file offload
- Canon text altered during any summarization pass

**§15 Studio substitution patterns:**
- "open Studio" -> Bishop-direct dispatch
- "check Studio" -> `pearl_query` on relevant channel
- "log in Studio" -> `scribe_log` call

**SEG GREEN criteria:** Wrasse boots, registers in ledger, Council lazy-load listener registered, enters enforce loop, detects at least one seeded §15 pattern in test fixture within 10s.

---

### I-C · Toolsmith Scribe Persistent SEG

**File:** `src/main/scribes/toolsmith_scribe.ts`

**Purpose:** Enforces gadget-first discovery (§17 BLOOD). REVISED: Toolsmith Council has 3 members, each scanning for a specific forbidden pattern class. 2-of-3 consensus required to auto-rewrite a bash command into a gadget alternative. 1-of-3 = log-only suggestion.

**Council Design:**

| Council Seat | Pattern Class | Forbidden Patterns |
|---|---|---|
| Member Alpha | Bash discovery / shell scan | `bash grep` · `grep -r` · `find . -name` · `ls -la` · `cat -n` |
| Member Beta | PowerShell misuse | `Select-String` · `Get-ChildItem -Recurse` · `Get-Content` path-only |
| Member Gamma | Substrate path without gadget | Any substrate-class path read without `pheromone_query` · product index crawl without substrate route |

**Voting Rules:**

- 2-of-3 flag: Auto-rewrite applied. Toolsmith emits `GADGET_FIRST_VIOLATION` pearl with `autoRewrite: true` and replacement gadget call.
- 1-of-3 flag: Log-only suggestion. Pearl emitted with `autoRewrite: false`. Dispatch not blocked.
- 0-of-3 flag: Clean. No action.

**Spec:**

```typescript
// src/main/scribes/toolsmith_scribe.ts

import { PearlEmitter } from '../pearl/pearl_emitter';
import { IpLedger } from '../identity/ip_ledger';
import {
  EnforcementCouncil,
  CouncilMember,
  CouncilVoteTuple,
  CouncilPackage,
} from '../enforcement_council/enforcement_council';  // M4 Court Package

export interface ToolsmithScribeConfig {
  gemmaModel: string;
  gadgetAlertChannel: string;
  scanIntervalMs: number;
  ipLedgerRow: string;
}

export interface GadgetRewrite {
  forbiddenPattern: string;
  suggestedGadget: string;
  rationale: string;
  patternClass: 'bash_discovery' | 'powershell_misuse' | 'substrate_path_without_gadget';
}

const FORBIDDEN_PATTERNS_ALPHA: GadgetRewrite[] = [
  {
    forbiddenPattern: 'bash grep',
    suggestedGadget: 'pheromone_query',
    rationale: 'Canon salience lookups use pheromone_query, not bash grep',
    patternClass: 'bash_discovery',
  },
  {
    forbiddenPattern: 'grep -r',
    suggestedGadget: 'Grep tool or pheromone_query',
    rationale: 'Content search uses Grep tool or pheromone_query',
    patternClass: 'bash_discovery',
  },
  {
    forbiddenPattern: 'find . -name',
    suggestedGadget: 'Glob tool',
    rationale: 'File pattern search uses Glob tool, not shell find',
    patternClass: 'bash_discovery',
  },
  {
    forbiddenPattern: 'cat -n',
    suggestedGadget: 'Read tool',
    rationale: 'File reading uses Read tool, not cat',
    patternClass: 'bash_discovery',
  },
  {
    forbiddenPattern: 'ls -la',
    suggestedGadget: 'Glob tool',
    rationale: 'Directory listing uses Glob tool',
    patternClass: 'bash_discovery',
  },
];

const FORBIDDEN_PATTERNS_BETA: GadgetRewrite[] = [
  {
    forbiddenPattern: 'Select-String',
    suggestedGadget: 'Grep tool',
    rationale: 'Content search in PowerShell context uses Grep tool',
    patternClass: 'powershell_misuse',
  },
  {
    forbiddenPattern: 'Get-ChildItem -Recurse',
    suggestedGadget: 'Glob tool',
    rationale: 'Recursive directory listing uses Glob tool',
    patternClass: 'powershell_misuse',
  },
  {
    forbiddenPattern: 'Get-Content',
    suggestedGadget: 'Read tool',
    rationale: 'File reading uses Read tool, not Get-Content',
    patternClass: 'powershell_misuse',
  },
];

const FORBIDDEN_PATTERNS_GAMMA: GadgetRewrite[] = [
  {
    forbiddenPattern: 'substrate-class-path-direct-read',
    suggestedGadget: 'pheromone_query',
    rationale: 'Substrate-class path access requires pheromone_query, not direct file read',
    patternClass: 'substrate_path_without_gadget',
  },
  {
    forbiddenPattern: 'product-index-crawl',
    suggestedGadget: 'substrate route via pheromone_query',
    rationale: 'Product index discovery routes through substrate, not raw index crawl',
    patternClass: 'substrate_path_without_gadget',
  },
];

export class ToolsmithScribe {
  private emitter: PearlEmitter;
  private ledger: IpLedger;
  private council: EnforcementCouncil | null = null;
  private councilPackageReady: boolean = false;
  private running: boolean = false;

  constructor(private config: ToolsmithScribeConfig) {}

  async boot(): Promise<void> {
    await this.ledger.registerScribe({
      key: this.config.ipLedgerRow,
      role: 'toolsmith_scribe',
      model: this.config.gemmaModel,
      bootTime: Date.now(),
    });

    PearlEmitter.on('m4_court_package_ready', () => this.initCouncil());

    this.running = true;
    await this.scanLoop();
  }

  private async initCouncil(): Promise<void> {
    const pkg: CouncilPackage = await EnforcementCouncil.loadPackage();
    this.council = new EnforcementCouncil({
      members: [
        CouncilMember.withPatterns(FORBIDDEN_PATTERNS_ALPHA, this.config.gemmaModel),
        CouncilMember.withPatterns(FORBIDDEN_PATTERNS_BETA,  this.config.gemmaModel),
        CouncilMember.withPatterns(FORBIDDEN_PATTERNS_GAMMA, this.config.gemmaModel),
      ],
      package: pkg,
      keepAlive: true,
    });
    this.councilPackageReady = true;
    await PearlEmitter.emit('toolsmith_council_warm', {
      scribe: this.config.ipLedgerRow,
      timestamp: Date.now(),
    });
  }

  async scanLoop(): Promise<void> {
    while (this.running) {
      const dispatches = await this.fetchPendingDispatches();
      for (const dispatch of dispatches) {
        await this.runCouncilScan(dispatch);
      }
      await this.sleep(this.config.scanIntervalMs);
    }
  }

  private async runCouncilScan(dispatch: Dispatch): Promise<void> {
    // AMBER fallback: no Council Package yet, single-member Alpha scan only
    if (!this.councilPackageReady || !this.council) {
      await this.singleMemberFallback(dispatch);
      return;
    }

    const votes: CouncilVoteTuple[] = await this.council.vote({
      question: dispatch.text,
      context: { agentId: dispatch.agentId },
      questionHash: dispatch.id,
    });

    const alphaVote = votes[0];
    const betaVote  = votes[1];
    const gammaVote = votes[2];

    const yVotes = [alphaVote, betaVote, gammaVote].filter(v => v.violation).length;

    await this.logCouncilVote({
      scribeId: this.config.ipLedgerRow,
      questionHash: dispatch.id,
      memberVotes: votes,
      consensusYn: yVotes >= 2,
      pearlId: null,
    });

    if (yVotes === 0) return;

    const winningVote = [alphaVote, betaVote, gammaVote].find(v => v.violation)!;
    const autoRewrite = yVotes >= 2;

    const pearlId = await this.emitter.emit({
      channel: this.config.gadgetAlertChannel,
      payload: {
        type: 'GADGET_FIRST_VIOLATION',
        statute: '§17',
        scribe: 'toolsmith_scribe',
        violator: dispatch.agentId,
        forbiddenPattern: winningVote.forbiddenPattern ?? 'unknown',
        suggestedGadget: winningVote.suggestedGadget ?? 'pheromone_query',
        rationale: winningVote.rationale ?? '',
        autoRewrite,
        councilVote: {
          alpha: alphaVote.violation,
          beta:  betaVote.violation,
          gamma: gammaVote.violation,
          yCount: yVotes,
        },
        timestamp: Date.now(),
      },
    });

    if (yVotes === 1) {
      // 1-of-3: drift watch log only
      await this.logDriftWatch({
        scribeId: this.config.ipLedgerRow,
        questionHash: dispatch.id,
        memberVotes: [alphaVote.violation, betaVote.violation, gammaVote.violation],
        canonId: '§17_gadget_first',
        dispatchId: dispatch.agentId,
        timestamp: Date.now(),
      });
    }
  }

  private async singleMemberFallback(dispatch: Dispatch): Promise<void> {
    for (const pattern of FORBIDDEN_PATTERNS_ALPHA) {
      if (dispatch.text && dispatch.text.includes(pattern.forbiddenPattern)) {
        await this.emitter.emit({
          channel: this.config.gadgetAlertChannel,
          payload: {
            type: 'GADGET_FIRST_VIOLATION',
            statute: '§17',
            scribe: 'toolsmith_scribe',
            violator: dispatch.agentId,
            forbiddenPattern: pattern.forbiddenPattern,
            suggestedGadget: pattern.suggestedGadget,
            rationale: pattern.rationale,
            autoRewrite: false,
            councilVote: null, // AMBER mode, no council
            timestamp: Date.now(),
          },
        });
      }
    }
  }

  private async fetchPendingDispatches(): Promise<Dispatch[]> { return []; }
  private async logCouncilVote(row: CouncilVoteRow): Promise<void> { /* impl */ }
  private async logDriftWatch(row: DriftWatchRow): Promise<void> { /* impl */ }
  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
  shutdown(): void { this.running = false; }
}
```

**Forbidden discovery patterns table (scanned at runtime by seat):**

| Seat | Pattern | Gadget Substitution | Statute |
|------|---------|---------------------|---------|
| Alpha | `bash grep` | `pheromone_query` | §17 |
| Alpha | `grep -r` | `Grep tool` | §17 |
| Alpha | `find . -name` | `Glob tool` | §17 |
| Alpha | `cat -n` | `Read tool` | §17 |
| Alpha | `ls -la` | `Glob tool` | §17 |
| Beta | `Select-String` | `Grep tool` | §17 |
| Beta | `Get-ChildItem -Recurse` | `Glob tool` | §17 |
| Beta | `Get-Content` | `Read tool` | §17 |
| Gamma | substrate-class-path-direct-read | `pheromone_query` | §17 |
| Gamma | product-index-crawl | `substrate route` | §17 |

**SEG GREEN criteria:** Toolsmith boots, registers in ledger, Council lazy-load listener registered, enters scan loop, correctly identifies `bash grep` in test fixture and emits `GADGET_FIRST_VIOLATION` pearl within 5s.

---

### I-D · Scribe Runner

**File:** `src/main/scribes/scribe_runner.ts`

**Purpose:** Launches all 3 scribes at app startup. Each scribe gets its own `ip_ledger` row, Ed25519 sig, and hex-mcode interface slot. Each scribe initializes its own Minor Council from Marathon 4's `enforcement_council` Court Package. Council Package lazy-loads on first enforcement event and keeps warm via keep_alive. Bishop monitors Council health via new heartbeat pearl. Depends on M4 `brain_swap` + `hex_mcode` + `enforcement_council` for full wire-up; degrades gracefully to AMBER mode if M4 not yet landed.

**Spec:**

```typescript
// src/main/scribes/scribe_runner.ts

import { ReminderScribe } from './reminder_scribe';
import { WrasseInjector } from './wrasse_injector';
import { ToolsmithScribe } from './toolsmith_scribe';
import { PearlListener } from '../pearl/pearl_listener';
import { PearlEmitter } from '../pearl/pearl_emitter';

export interface ScribeRunnerConfig {
  ebletsFolderPath: string;
  gemmaModel: string;
  scanIntervalMs: number;
}

export class ScribeRunner {
  private reminderScribe: ReminderScribe;
  private wrasseInjector: WrasseInjector;
  private toolsmithScribe: ToolsmithScribe;
  private m4Ready: boolean = false;
  private courtPackageReady: boolean = false;
  private councilHeartbeatIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private config: ScribeRunnerConfig) {
    this.reminderScribe = new ReminderScribe({
      ebletsFolderPath: config.ebletsFolderPath,
      gemmaModel: config.gemmaModel,
      violationPearlChannel: 'reminder_scribe_violation',
      scanIntervalMs: config.scanIntervalMs,
      ipLedgerRow: 'scribe:reminder:001',
    });

    this.wrasseInjector = new WrasseInjector({
      gemmaModel: config.gemmaModel,
      driftCorrectionChannel: 'wrasse_drift_correction',
      scanIntervalMs: config.scanIntervalMs,
      ipLedgerRow: 'scribe:wrasse:001',
    });

    this.toolsmithScribe = new ToolsmithScribe({
      gemmaModel: config.gemmaModel,
      gadgetAlertChannel: 'toolsmith_gadget_alert',
      scanIntervalMs: config.scanIntervalMs,
      ipLedgerRow: 'scribe:toolsmith:001',
    });
  }

  async launch(): Promise<void> {
    // Emit boot pearl
    await PearlEmitter.emit('mountain_2_scribes_booting', { timestamp: Date.now() });

    // Listen for M4 readiness signals (non-blocking)
    PearlListener.on('m4_hex_mcode_ready', () => {
      this.m4Ready = true;
      this.wireHexMcodeInterface();
    });

    // Listen for M4 Court Package ready signal
    // Each scribe's Council lazy-loads on this signal independently
    PearlListener.on('m4_court_package_ready', () => {
      this.courtPackageReady = true;
      this.startCouncilHeartbeat();
    });

    // use segs: launch all 3 scribes in parallel
    // Each scribe self-initializes its Minor Council from M4 Court Package
    await Promise.all([
      this.reminderScribe.boot(),
      this.wrasseInjector.boot(),
      this.toolsmithScribe.boot(),
    ]);
  }

  private wireHexMcodeInterface(): void {
    // Wire Ed25519 sig + hex-mcode frames once M4 lands
    // Each scribe gets its own signed frame interface slot
    // AMBER logged if M4 not ready at boot; auto-upgrades when pearl arrives
  }

  private startCouncilHeartbeat(): void {
    // Bishop monitors Council health via heartbeat pearl every 60s
    this.councilHeartbeatIntervalId = setInterval(async () => {
      await PearlEmitter.emit('scribe_council_heartbeat', {
        timestamp: Date.now(),
        councils: {
          reminderCouncil: 'GREEN',    // updated by each scribe's internal status
          wrasseCouncil:   'GREEN',
          toolsmithCouncil: 'GREEN',
        },
        courtPackageReady: this.courtPackageReady,
        m4Ready: this.m4Ready,
      });
    }, 60_000);
  }

  async shutdown(): Promise<void> {
    if (this.councilHeartbeatIntervalId) {
      clearInterval(this.councilHeartbeatIntervalId);
    }
    this.reminderScribe.shutdown();
    this.wrasseInjector.shutdown();
    this.toolsmithScribe.shutdown();
  }
}
```

**Startup sequence:**
1. `mountain_2_scribes_booting` pearl emitted
2. Pearl listeners registered for `m4_hex_mcode_ready` and `m4_court_package_ready`
3. use segs: all 3 scribes boot in parallel via `Promise.all`
4. Each scribe self-registers in `ip_ledger` before entering scan loop
5. Each scribe registers its own `m4_court_package_ready` listener for Council lazy-load
6. If M4 not ready: scribes run in AMBER mode (no hex-mcode wire, no Council Package, single-worker fallback enforcement)
7. When `m4_court_package_ready` pearl arrives: each scribe independently initializes its 3-member Minor Council and warms via keep_alive
8. When `m4_hex_mcode_ready` pearl arrives: `wireHexMcodeInterface()` upgrades all 3 scribes to GREEN wire
9. Council heartbeat pearl starts on Court Package arrival; Bishop monitors health

**SEG GREEN criteria:** All 3 scribes boot within 60s. All 3 `ip_ledger` rows confirmed. `mountain_2_scribes_booting` pearl emitted. Council heartbeat scheduled. No BLOOD violations during boot sequence.

---

## §6 WAVE II · GATED ON WAVE I + M4 CLOSURE · SMOKE TEST

Wave II does not begin until:
- Wave I all segments return GREEN
- M4 signals `m4_hex_mcode_ready` pearl
- M4 signals `m4_court_package_ready` pearl (Court Package merged)
- Bishop issues greenlight receipt

### II-A · Reminder Scribe Smoke Test

**Trigger:** Inject a test dispatch containing a pricing violation ("Members pay $10/year") into the dispatch queue.

**Expected:** Reminder Scribe Council votes. All 3 members flag (membership pricing is unambiguous). Scribe emits `reminder_scribe_violation` pearl with `canonId: 'membership_obviously_better_5_per_year'`, `severity: 'HARD'`, `councilVote: { memberA: true, memberB: true, memberC: true }`. Logs row in `scribe_violations_log`.

**Pass criteria:**
- Pearl emitted within 5s of injection
- `severity` = `'HARD'`
- `councilVote` block shows 3-of-3 true
- `scribe_violations_log` row present with correct canonId
- Zero false positives on clean dispatch injected simultaneously

**Fixture path:** `src/main/scribes/tests/fixtures/reminder_canon_violation.ts`

---

### II-B · Toolsmith Scribe Smoke Test

**Trigger:** Inject a test dispatch containing `bash grep -r "pheromone"` into the dispatch queue.

**Expected:** Toolsmith Council Member Alpha flags. Member Beta and Gamma may or may not flag (depends on dispatch context). If Alpha + Beta flag: 2-of-3 consensus, `autoRewrite: true`. If Alpha only: 1-of-3, `autoRewrite: false`, drift watch log only.

**Pass criteria:**
- Pearl emitted within 5s
- `forbiddenPattern` field = `'bash grep'`
- `suggestedGadget` field = `'pheromone_query'`
- `councilVote.alpha` = true
- Zero false positives on clean dispatch containing word "grep" only in a comment

**Fixture path:** `src/main/scribes/tests/fixtures/toolsmith_gadget_violation.ts`

---

### II-C · Wrasse Injector Smoke Test

**Trigger:** Inject a test dispatch containing "Please open Studio to review the config."

**Expected:** Wrasse Council Seat §15 flags. Seat §14 and §16/§17 may not flag. If 2-of-3 agree: correction injected, `DRIFT_CORRECTION` pearl emitted. If 1-of-3 (Seat §15 only): drift watch logged, no injection.

**Pass criteria:**
- Pearl emitted within 10s (if 2-of-3 consensus) OR drift watch log entry (if 1-of-3)
- If pearl emitted: `statute` field = `'§15'` and `correctedText` does NOT contain "open Studio"
- `councilVote.seat15.violationYn` = true
- Zero false positives on dispatch containing "Studio apartment" (non-matching context)

**Fixture path:** `src/main/scribes/tests/fixtures/wrasse_studio_violation.ts`

---

### II-D · Smoke Test Receipt

**Receipt path:**
`C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\MOUNTAIN_2\SMOKE_TEST.md`

**Receipt format:**

```markdown
# MOUNTAIN 2 SMOKE TEST RECEIPT
## BP089 · Wave II · Knight Marathon 5

| Scribe | Latency | False-Positive Rate | Pearl Count | Council Votes | Status |
|--------|---------|---------------------|-------------|---------------|--------|
| Reminder Scribe  | <5s   | 0.0% | TBD | TBD | AMBER until run |
| Toolsmith Scribe | <5s   | 0.0% | TBD | TBD | AMBER until run |
| Wrasse Injector  | <10s  | 0.0% | TBD | TBD | AMBER until run |

All values populated by Knight at Wave II execution time.
Bishop confirms GREEN before mountain_2_smoke_complete pearl emitted.
```

---

### II-E · Smoke Complete Pearl

Pearl emitted by Scribe Runner on Wave II completion:

```typescript
await PearlEmitter.emit('mountain_2_smoke_complete', {
  timestamp: Date.now(),
  branch: 'knight-marathon-5-mountain-2-persistent-scribes',
  scribeStatuses: {
    reminderScribe: 'GREEN',
    wrasseInjector: 'GREEN',
    toolsmithScribe: 'GREEN',
  },
  councilStatuses: {
    reminderCouncil:  'GREEN',
    wrasseCouncil:    'GREEN',
    toolsmithCouncil: 'GREEN',
  },
  receiptPath: 'Asteroid-ProofVault/receipts/MOUNTAIN_2/SMOKE_TEST.md',
});
```

---

### II-F · Council Convergence Smoke Test

**Receipt path:** `Asteroid-ProofVault\receipts\MOUNTAIN_2\COUNCIL_VOTING_SMOKE.md`

**Trigger:** Inject a hard, unambiguous canon violation across all 3 Scribes simultaneously. Example: dispatch text reads "Members pay $10/year, please open Studio to check, and run grep -r to find the config."

**Expected:** All 3 Scribe Councils converge. Each Council returns 3-of-3 yes votes (or at minimum 2-of-3). Receipt shows 3-3-3 consensus across Reminder Council, Wrasse Council, Toolsmith Council.

**Pass criteria:**
- `reminder_scribe_violation` pearl: `severity: 'HARD'` · councilVote 3-of-3 true
- `wrasse_drift_correction` pearl: `councilVote.majorityAgreed: true`
- `toolsmith_gadget_alert` pearl: `councilVote.yCount >= 2`
- `scribe_council_vote_log` rows present for all 3 scribe IDs
- All 3 pearls emitted within 15s of trigger

**Receipt section in COUNCIL_VOTING_SMOKE.md:** `## II-F · 3-Council Convergence`

---

### II-G · Council Split (Borderline Case) Smoke Test

**Receipt path:** `Asteroid-ProofVault\receipts\MOUNTAIN_2\COUNCIL_VOTING_SMOKE.md`

**Trigger:** Inject a borderline §15 violation that depends on interpretation. Example: dispatch text reads "The architect opened a Studio session to review a third-party config file." (mentions Studio in ambiguous noun-phrase context, not as a direct "open Studio" command.)

**Expected:** Wrasse Council splits. Seat §15 likely flags. Seats §14 and §16/§17 likely clear. Result: 1-of-3 consensus. Wrasse logs to `scribe_drift_watch`. Does NOT inject correction. Does NOT emit `DRIFT_CORRECTION` pearl. Reminder and Toolsmith Councils return CLEAN (no pricing or bash-grep content).

**Pass criteria:**
- No `wrasse_drift_correction` pearl emitted
- `scribe_drift_watch` row inserted with `scribeId: 'scribe:wrasse:001'`
- `wrasseCouncil.seat15.violationYn` = true in vote log
- `wrasseCouncil.seat14.violationYn` = false in vote log
- Reminder and Toolsmith: no pearls emitted, no drift watch entries

**Receipt section in COUNCIL_VOTING_SMOKE.md:** `## II-G · Wrasse Council Split (Borderline §15)`

---

### II-H · False Positive Clearance Smoke Test

**Receipt path:** `Asteroid-ProofVault\receipts\MOUNTAIN_2\COUNCIL_VOTING_SMOKE.md`

**Trigger:** Inject a dispatch that superficially resembles a violation but is not per canon nuance. Example: dispatch reads "The user asked about Studio apartment pricing options. Their preference was inferred, not collected via form. Membership is $5/year."

**Expected:** All 3 Councils return CLEAN or unanimously clear. No violation pearls emitted. No drift watch entries. If any single Council member returns uncertain (cannot confirm clean), scribe escalates to flagship review rather than auto-flagging.

**Pass criteria:**
- Zero `reminder_scribe_violation` pearls emitted
- Zero `wrasse_drift_correction` pearls emitted
- Zero `toolsmith_gadget_alert` pearls emitted
- Zero `scribe_drift_watch` rows inserted
- If uncertain: `scribe_flagship_escalation` pearl emitted with `reason: 'unanimous_uncertain'`
- All 3 Councils return `consensus: 'CLEAN'` in `scribe_council_vote_log`

**Receipt section in COUNCIL_VOTING_SMOKE.md:** `## II-H · False Positive Clearance`

---

## §7 SQL SCHEMA · BISHOP APPLIES

Bishop applies these schema additions to the live database. Knight does NOT run migrations directly.

### scribe_violations_log

```sql
-- scribe_violations_log
-- Records every canon or statute violation detected by any persistent scribe
CREATE TABLE IF NOT EXISTS scribe_violations_log (
  id                  SERIAL PRIMARY KEY,
  canon               VARCHAR(255)     NOT NULL,   -- canonId from corpus
  scribe              VARCHAR(64)      NOT NULL,   -- 'reminder_scribe' | 'wrasse_injector' | 'toolsmith_scribe'
  violator            VARCHAR(255)     NOT NULL,   -- agent id that produced the violation
  timestamp           BIGINT           NOT NULL,   -- epoch ms
  correction_applied  TEXT,                        -- corrected text or null if violation only logged
  statute_violated    VARCHAR(8),                  -- '§14' | '§15' | '§16' | '§17' or null
  pearl_id            VARCHAR(255),                -- pearl id emitted for this violation
  resolved            BOOLEAN          DEFAULT FALSE,
  resolved_at         BIGINT,
  created_at          TIMESTAMPTZ      DEFAULT NOW()
);

CREATE INDEX idx_svl_scribe     ON scribe_violations_log (scribe);
CREATE INDEX idx_svl_violator   ON scribe_violations_log (violator);
CREATE INDEX idx_svl_timestamp  ON scribe_violations_log (timestamp);
CREATE INDEX idx_svl_canon      ON scribe_violations_log (canon);
```

### scribe_runtime_telemetry

```sql
-- scribe_runtime_telemetry
-- Records per-scribe uptime, throughput, and drift counts per interval
CREATE TABLE IF NOT EXISTS scribe_runtime_telemetry (
  id                  SERIAL PRIMARY KEY,
  scribe              VARCHAR(64)      NOT NULL,
  interval_start      BIGINT           NOT NULL,   -- epoch ms
  interval_end        BIGINT           NOT NULL,   -- epoch ms
  uptime_ms           BIGINT           NOT NULL,
  dispatches_scanned  INTEGER          DEFAULT 0,
  violations_detected INTEGER          DEFAULT 0,
  pearls_emitted      INTEGER          DEFAULT 0,
  drift_count         INTEGER          DEFAULT 0,  -- compaction-class drift events
  false_positive_est  INTEGER          DEFAULT 0,
  model               VARCHAR(64),                 -- 'gemma4:12b'
  amber_flags         INTEGER          DEFAULT 0,
  created_at          TIMESTAMPTZ      DEFAULT NOW()
);

CREATE INDEX idx_srt_scribe    ON scribe_runtime_telemetry (scribe);
CREATE INDEX idx_srt_interval  ON scribe_runtime_telemetry (interval_start);
```

### scribe_council_vote_log

```sql
-- scribe_council_vote_log
-- Records every 3-member Minor Council vote decision per enforcement question
CREATE TABLE IF NOT EXISTS scribe_council_vote_log (
  id                  SERIAL PRIMARY KEY,
  scribe_id           VARCHAR(128)     NOT NULL,   -- ip_ledger row key of the parent scribe
  question_hash       VARCHAR(255)     NOT NULL,   -- hash of the dispatch text + canonId being evaluated
  member_votes        JSONB            NOT NULL,   -- array of {seat, violationYn, articleCited, suggestedCorrection}
  consensus_y_n       BOOLEAN          NOT NULL,   -- true if 2-of-3 or 3-of-3 flagged
  pearl_id            VARCHAR(255),                -- pearl emitted as result of this vote, if any
  created_at          TIMESTAMPTZ      DEFAULT NOW()
);

CREATE INDEX idx_scvl_scribe_id     ON scribe_council_vote_log (scribe_id);
CREATE INDEX idx_scvl_question_hash ON scribe_council_vote_log (question_hash);
CREATE INDEX idx_scvl_consensus     ON scribe_council_vote_log (consensus_y_n);
CREATE INDEX idx_scvl_created_at    ON scribe_council_vote_log (created_at);
```

### scribe_drift_watch

```sql
-- scribe_drift_watch
-- Low-confidence 1-of-3 flag log. Review only. Does not block dispatch.
CREATE TABLE IF NOT EXISTS scribe_drift_watch (
  id                  SERIAL PRIMARY KEY,
  scribe_id           VARCHAR(128)     NOT NULL,   -- ip_ledger row key of the parent scribe
  question_hash       VARCHAR(255)     NOT NULL,   -- hash of the dispatch under review
  member_votes        BOOLEAN[]        NOT NULL,   -- [seatA, seatB, seatC] boolean flags
  canon_id            VARCHAR(255)     NOT NULL,   -- canon or statute suspected by the lone flagging member
  dispatch_id         VARCHAR(255)     NOT NULL,   -- agent id of the dispatch being watched
  timestamp           BIGINT           NOT NULL,   -- epoch ms
  reviewed            BOOLEAN          DEFAULT FALSE,
  reviewed_at         BIGINT,
  reviewer_note       TEXT,
  created_at          TIMESTAMPTZ      DEFAULT NOW()
);

CREATE INDEX idx_sdw_scribe_id     ON scribe_drift_watch (scribe_id);
CREATE INDEX idx_sdw_dispatch_id   ON scribe_drift_watch (dispatch_id);
CREATE INDEX idx_sdw_timestamp     ON scribe_drift_watch (timestamp);
CREATE INDEX idx_sdw_reviewed      ON scribe_drift_watch (reviewed);
```

---

## §8 RETURN PROTOCOL

### Per-SEG Status Gates

| Segment | Deliverable | GREEN Criteria | AMBER Trigger |
|---------|-------------|----------------|---------------|
| I-A | `reminder_scribe.ts` | Boots · corpus loaded · Council listener registered · scan loop entered | Any corpus load error |
| I-B | `wrasse_injector.ts` | Boots · Council listener registered · §15 pattern detected in fixture | ledger registration fail |
| I-C | `toolsmith_scribe.ts` | Boots · Council listener registered · bash grep violation detected | Any pattern table miss |
| I-D | `scribe_runner.ts`    | All 3 boot in parallel · pearl emitted · Council heartbeat scheduled | M4 not ready (AMBER not HALT) |
| II-A | Reminder smoke | Pearl within 5s · 3-of-3 council vote · log row present | Latency >5s |
| II-B | Toolsmith smoke | Pearl within 5s · Alpha seat flagged · correct fields | Wrong gadget suggestion |
| II-C | Wrasse smoke | Pearl within 10s (2-of-3) OR drift watch (1-of-3) | §15 seat miss |
| II-D | Receipt written | All rows populated | Any blank cell |
| II-E | `mountain_2_smoke_complete` | Pearl emitted with 3x GREEN | Any scribe AMBER |
| II-F | Council convergence | 3-3-3 across all Councils on hard violation | Any Council below 2-of-3 |
| II-G | Council split | Wrasse 1-of-3 · drift watch logged · no pearl | Wrasse emits pearl on split |
| II-H | False positive | Zero pearls · zero drift watch · CLEAN in vote log | Any false violation emitted |

### Return Pearl

```typescript
await PearlEmitter.emit('mountain_2_complete', {
  timestamp: Date.now(),
  branch: 'knight-marathon-5-mountain-2-persistent-scribes',
  scribeStatuses: {
    reminderScribe: 'GREEN | AMBER',
    wrasseInjector: 'GREEN | AMBER',
    toolsmithScribe: 'GREEN | AMBER',
  },
  councilStatuses: {
    reminderCouncil:  'GREEN | AMBER',
    wrasseCouncil:    'GREEN | AMBER',
    toolsmithCouncil: 'GREEN | AMBER',
  },
  smokeTestReceiptPath: 'Asteroid-ProofVault/receipts/MOUNTAIN_2/SMOKE_TEST.md',
  councilVotingReceiptPath: 'Asteroid-ProofVault/receipts/MOUNTAIN_2/COUNCIL_VOTING_SMOKE.md',
  bishopGreenlight: false,   // Bishop sets true on review
});
```

### Commit Protocol

Knight commits to `knight-marathon-5-mountain-2-persistent-scribes` only. No merge to main. Each segment commit message format:

```
feat(scribes/M2): [SEG I-A|I-B|I-C|I-D|II-x] <description>

BP089 · Mountain 2 · Knight Marathon 5
Statute binding: §3 §14 §15 §16 §17
Scope: src/main/scribes/
```

Bishop reviews all 4 Wave I commits and issues greenlight before Wave II begins.

---

## §9 CLOSING

Mountain 2 delivers three persistent gemma4:12b SEG scribes forming the always-on canon enforcement layer for the MnemosyneC substrate. Each scribe now composes a 3-member Minor Council (per Marathon 4's `enforcement_council` Court Package) for all enforcement decisions. Single-worker scan is replaced by Council consensus gating: 2-of-3 or 3-of-3 triggers action; 1-of-3 logs to drift watch without blocking.

The Reminder Scribe Council is sharded by canon domain (safety/identity, process/currency, narrative/UX). The Wrasse Injector Council is sharded by BLOOD article (§14, §15, §16/§17). The Toolsmith Scribe Council is sharded by forbidden pattern class (bash discovery, PowerShell misuse, substrate-path-without-gadget).

All three scribes are scope-isolated to `src/main/scribes/`. Court Package lazy-loads on first enforcement event and stays warm via keep_alive. Bishop monitors Council health via 60s heartbeat pearl. Wave II smoke tests II-F/II-G/II-H confirm Council convergence, split handling, and false-positive clearance before `mountain_2_complete` is returned.

Bishop applies SQL schema including the two new tables: `scribe_council_vote_log` and `scribe_drift_watch`. Bishop issues greenlight. Knight holds all merges until greenlight received.

```
Help Each Other Help Ourselves.
We are Capitalist · Cooperative · Patriotic Interdependentalists.
The boat will float, but to get somewhere, it needs a Captain.
Coffee's for Closers. Help Yourself.
                                        -- FounderDenken / Crewman #6
```

---

*KNIGHT MARATHON SESSION 5 · MOUNTAIN 2 · BP089 · END*
