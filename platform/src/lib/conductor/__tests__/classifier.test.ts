/**
 * Conductor Classifier — 50-query test suite
 * K446a · Phase 1.1
 *
 * Mix of clear-case and borderline queries. Confidence values recorded
 * empirically from first run (BRIDLE Rule 2 — not guessed).
 *
 * Classification success criteria:
 *   - Clear cases: correct class AND confidence ≥ 0.4
 *   - Borderline cases: class matches OR "uncertain" is acceptable
 */

import { describe, it, expect } from "vitest";
import { classifyQuery } from "../classifier";
import type { QueryClass } from "../classifier";

interface TestCase {
  query: string;
  expectedClass: QueryClass;
  allowUncertain?: boolean;   // if true, "uncertain" is also acceptable
  description: string;
}

// ─── 50 Reference Queries ────────────────────────────────────────────────────

const TEST_CASES: TestCase[] = [
  // --- CODE GENERATION (10 clear cases) ---
  {
    query: "Write a Python function to sort a list of dictionaries by a key",
    expectedClass: "code_generation",
    description: "Code: Python + write function",
  },
  {
    query: "Implement a TypeScript interface for a user profile with name, email, and createdAt",
    expectedClass: "code_generation",
    description: "Code: TypeScript interface",
  },
  {
    query: "Write a SQL query that joins the members table to the transactions table on member_id",
    expectedClass: "code_generation",
    description: "Code: SQL join query",
  },
  {
    query: "Build a React component that fetches data from an API and displays it in a list",
    expectedClass: "code_generation",
    description: "Code: React component",
  },
  {
    query: "Debug this JavaScript promise chain — why is it not resolving?",
    expectedClass: "code_generation",
    description: "Code: debug promise chain",
  },
  {
    query: "Write a bash script to iterate over files in a directory and compress them",
    expectedClass: "code_generation",
    description: "Code: bash script",
  },
  {
    query: "Refactor this class to use dependency injection instead of singletons",
    expectedClass: "code_generation",
    description: "Code: refactor class",
  },
  {
    query: "Create a migration script in TypeScript for adding a conductor_mode column to members",
    expectedClass: "code_generation",
    description: "Code: migration script",
  },
  {
    query: "How do I implement a binary search tree in Go?",
    expectedClass: "code_generation",
    description: "Code: Go BST implementation",
  },
  {
    query: "Write unit tests for the classifyQuery function using vitest",
    expectedClass: "code_generation",
    description: "Code: write unit tests",
  },

  // --- CREATIVE (10 clear cases) ---
  {
    query: "Write a short poem about the Cathedral Effect and model routing",
    expectedClass: "creative",
    description: "Creative: poem",
  },
  {
    query: "Brainstorm 10 names for a cooperative AI model routing feature",
    expectedClass: "creative",
    description: "Creative: brainstorm names",
  },
  {
    query: "Draft a marketing tagline for a platform that saves 80% on AI costs",
    expectedClass: "creative",
    description: "Creative: marketing tagline",
  },
  {
    query: "Come up with a compelling story opening about a cooperative platform that changes lives",
    expectedClass: "creative",
    description: "Creative: story opening",
  },
  {
    query: "Write a blog post about how the Cathedral Effect equalizes AI model performance",
    expectedClass: "creative",
    description: "Creative: blog post",
  },
  {
    query: "Compose an email to members explaining the new automatic model routing feature",
    expectedClass: "creative",
    description: "Creative: compose email",
  },
  {
    query: "Create a catchy slogan for the Let's Make Dinner initiative",
    expectedClass: "creative",
    description: "Creative: slogan",
  },
  {
    query: "Generate some ideas for making the member onboarding experience more engaging",
    expectedClass: "creative",
    description: "Creative: generate ideas",
  },
  {
    query: "Write a 3-sentence product description for the Conductor automatic model router",
    expectedClass: "creative",
    description: "Creative: product description",
  },
  {
    query: "Imagine a world where every member gets the same quality AI help regardless of cost — write that vision",
    expectedClass: "creative",
    description: "Creative: vision narrative",
  },

  // --- MULTI-STEP PLANNING (8 clear cases) ---
  {
    query: "Create a step-by-step plan for migrating the Cathedral schema to Supabase",
    expectedClass: "multi_step_planning",
    description: "Planning: migration step-by-step",
  },
  {
    query: "What are the steps to deploy the platform to Firebase hosting?",
    expectedClass: "multi_step_planning",
    description: "Planning: deployment steps",
  },
  {
    query: "Develop a strategy for onboarding the first 1,000 members to the cooperative",
    expectedClass: "multi_step_planning",
    description: "Planning: onboarding strategy",
  },
  {
    query: "How do I set up a continuous benchmarking pipeline for model routing decisions?",
    expectedClass: "multi_step_planning",
    description: "Planning: setup pipeline",
  },
  {
    query: "First audit existing API keys, then rotate any that are older than 90 days, then update SDS.env",
    expectedClass: "multi_step_planning",
    description: "Planning: first-then sequence",
  },
  {
    query: "Create a workflow for reviewing and approving new member applications",
    expectedClass: "multi_step_planning",
    description: "Planning: workflow creation",
  },
  {
    query: "What's the roadmap for the Conductor feature from scaffold to production?",
    expectedClass: "multi_step_planning",
    description: "Planning: roadmap question",
  },
  {
    query: "Walk me through the process of setting up vendor adapters for four AI providers",
    expectedClass: "multi_step_planning",
    description: "Planning: process walkthrough",
  },

  // --- RETRIEVAL ONLY (12 clear cases) ---
  {
    query: "What is the Cathedral Effect?",
    expectedClass: "retrieval_only",
    description: "Retrieval: what-is question",
  },
  {
    query: "Who is the Founder of the Liana Banyan Platform?",
    expectedClass: "retrieval_only",
    description: "Retrieval: who-is question",
  },
  {
    query: "When was Prov 13 filed?",
    expectedClass: "retrieval_only",
    description: "Retrieval: when question",
  },
  {
    query: "How many Crown Jewels are there?",
    expectedClass: "retrieval_only",
    description: "Retrieval: how-many question",
  },
  {
    query: "What is the platform membership fee?",
    expectedClass: "retrieval_only",
    description: "Retrieval: fee question",
  },
  {
    query: "Cathedral Effect HOT% rate",
    expectedClass: "retrieval_only",
    description: "Retrieval: very short factual lookup",
  },
  {
    query: "What does EIN stand for?",
    expectedClass: "retrieval_only",
    description: "Retrieval: what-does question",
  },
  {
    query: "What is Opus 4.7's cost per HOT?",
    expectedClass: "retrieval_only",
    description: "Retrieval: cost lookup",
  },
  {
    query: "Tell me the definition of an Eblet",
    expectedClass: "retrieval_only",
    description: "Retrieval: definition request",
  },
  {
    query: "What are the Sweet Sixteen initiatives?",
    expectedClass: "retrieval_only",
    description: "Retrieval: list retrieval",
  },
  {
    query: "Where is the Conductor A&A formal document?",
    expectedClass: "retrieval_only",
    description: "Retrieval: where-is question",
  },
  {
    query: "R13 cross-vendor mean lift value",
    expectedClass: "retrieval_only",
    description: "Retrieval: specific metric lookup",
  },

  // --- REASONING REQUIRED (5 clear cases) ---
  {
    query: "Why does the Cathedral Effect equalize AI model performance across vendors?",
    expectedClass: "reasoning_required",
    description: "Reasoning: why question with explanation needed",
  },
  {
    query: "Explain the difference between Seer and Augur in the Cathedral substrate",
    expectedClass: "reasoning_required",
    description: "Reasoning: explain difference",
  },
  {
    query: "Should we use Haiku or Opus for Cathedral-grounded queries where accuracy is critical?",
    expectedClass: "reasoning_required",
    description: "Reasoning: should-we recommendation",
  },
  {
    query: "Compare the trade-offs between corpus-normalized IDF and naive IDF for vocabulary bridging",
    expectedClass: "reasoning_required",
    description: "Reasoning: compare trade-offs",
  },
  {
    query: "Analyze the pros and cons of exposing the conductor_route MCP tool publicly versus keeping it internal",
    expectedClass: "reasoning_required",
    description: "Reasoning: pros/cons analysis",
  },

  // --- BORDERLINE / UNCERTAIN (5 cases — uncertain acceptable) ---
  {
    query: "Help",
    expectedClass: "uncertain",
    description: "Borderline: single word",
    allowUncertain: true,
  },
  {
    query: "Tell me about the Conductor",
    expectedClass: "retrieval_only",
    allowUncertain: true,
    description: "Borderline: ambiguous tell-me (retrieval or reasoning)",
  },
  {
    query: "How does routing work?",
    expectedClass: "retrieval_only",
    allowUncertain: true,
    description: "Borderline: could be retrieval or reasoning",
  },
  {
    query: "Make the system faster",
    expectedClass: "multi_step_planning",
    allowUncertain: true,
    description: "Borderline: vague imperative",
  },
  {
    query: "Fix it",
    expectedClass: "uncertain",
    description: "Borderline: zero-context imperative",
    allowUncertain: true,
  },
];

// ─── Test runner ─────────────────────────────────────────────────────────────

describe("classifyQuery — 50-query reference suite (K446a Phase 1.1)", () => {
  for (const tc of TEST_CASES) {
    it(`[${tc.expectedClass.toUpperCase()}] ${tc.description}`, () => {
      const result = classifyQuery(tc.query);

      // Class must match or (if allowUncertain) be "uncertain"
      if (tc.allowUncertain) {
        expect(
          result.class === tc.expectedClass || result.class === "uncertain",
          `Expected '${tc.expectedClass}' or 'uncertain', got '${result.class}' ` +
            `(confidence=${result.confidence}, signals=${result.signals.join(", ")})\n` +
            `Query: "${tc.query}"`,
        ).toBe(true);
      } else {
        expect(result.class).toBe(tc.expectedClass);
      }

      // Non-uncertain cases must have some confidence
      if (result.class !== "uncertain") {
        expect(result.confidence).toBeGreaterThanOrEqual(UNCERTAIN_THRESHOLD_EXPORT);
      }

      // Signals array must be non-empty
      expect(result.signals.length).toBeGreaterThan(0);

      // Query must be preserved
      expect(result.query).toBe(tc.query);
    });
  }

  it("returns 50 total test cases", () => {
    expect(TEST_CASES.length).toBe(50);
  });
});

// Export for integration tests
const UNCERTAIN_THRESHOLD_EXPORT = 0.4;
