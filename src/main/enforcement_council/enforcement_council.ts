/**
 * enforcement_council.ts -- M4 Court Package STUB
 *
 * BP089 · Mountain 2 interface reservation.
 * This module will be replaced by M4's full EnforcementCouncil implementation.
 * Mountain 2 scribes lazy-load this package on receipt of m4_court_package_ready pearl.
 * Until then, scribes degrade to single-worker AMBER fallback.
 *
 * Canon ref: canon_minor_council_star_chamber_free_local_multi_model_consensus_requires_mountain_1_substrate_priming_bp089
 */

// ---------------------------------------------------------------------------
// Vote tuple returned by each Council member
// ---------------------------------------------------------------------------

export interface CouncilVoteTuple {
  /** True if this member believes a violation occurred */
  violation: boolean;
  /** Article or canon id cited by this member, if any */
  articleCited?: string;
  /** Gadget or suggested correction for the violating text */
  suggestedGadget?: string;
  /** Suggested corrected text */
  suggestedCorrection?: string;
  /** Forbidden pattern detected by this member */
  forbiddenPattern?: string;
  /** Rationale narrative */
  rationale?: string;
}

// ---------------------------------------------------------------------------
// Council member factory args
// ---------------------------------------------------------------------------

export interface CouncilMemberConfig {
  shard?: string;
  article?: string;
  patterns?: import('../../scribes/toolsmith_scribe').GadgetRewrite[];
  model: string;
}

// ---------------------------------------------------------------------------
// CouncilMember -- one seat on the 3-member Minor Council
// ---------------------------------------------------------------------------

export class CouncilMember {
  private config: CouncilMemberConfig;

  private constructor(config: CouncilMemberConfig) {
    this.config = config;
  }

  static forShard(shard: string, model: string): CouncilMember {
    return new CouncilMember({ shard, model });
  }

  static forArticle(article: string, model: string): CouncilMember {
    return new CouncilMember({ article, model });
  }

  static withPatterns(
    patterns: import('../../scribes/toolsmith_scribe').GadgetRewrite[],
    model: string,
  ): CouncilMember {
    return new CouncilMember({ patterns, model });
  }

  getConfig(): CouncilMemberConfig {
    return this.config;
  }
}

// ---------------------------------------------------------------------------
// CouncilPackage -- opaque handle returned by EnforcementCouncil.loadPackage()
// ---------------------------------------------------------------------------

export interface CouncilPackage {
  version: string;
  loadedAt: number;
  modelTag: string;
}

// ---------------------------------------------------------------------------
// EnforcementCouncil config
// ---------------------------------------------------------------------------

export interface EnforcementCouncilConfig {
  members: [CouncilMember, CouncilMember, CouncilMember];
  package: CouncilPackage;
  keepAlive: boolean;
}

// ---------------------------------------------------------------------------
// Vote request passed to council.vote()
// ---------------------------------------------------------------------------

export interface CouncilVoteRequest {
  question: string;
  context: unknown;
  questionHash: string;
}

// ---------------------------------------------------------------------------
// EnforcementCouncil -- 3-member minor council (M4 stub)
// ---------------------------------------------------------------------------

export class EnforcementCouncil {
  private cfg: EnforcementCouncilConfig;

  constructor(cfg: EnforcementCouncilConfig) {
    this.cfg = cfg;
  }

  /**
   * Load the Court Package from the M4 library.
   * STUB: returns a placeholder until M4 lands.
   */
  static async loadPackage(): Promise<CouncilPackage> {
    return {
      version: 'stub-0.0.1',
      loadedAt: Date.now(),
      modelTag: 'gemma4:12b',
    };
  }

  /**
   * Run a synchronous-async vote across all 3 Council members.
   * STUB: returns [abstain, abstain, abstain] until M4 wires real model calls.
   */
  async vote(_req: CouncilVoteRequest): Promise<[CouncilVoteTuple, CouncilVoteTuple, CouncilVoteTuple]> {
    const abstain: CouncilVoteTuple = { violation: false };
    return [abstain, abstain, abstain];
  }

  /** Keep-alive ping to warm the Council model context. STUB. */
  async keepWarm(): Promise<void> {
    // M4 implementation will call ollama keep-alive on gemma4:12b
  }
}
