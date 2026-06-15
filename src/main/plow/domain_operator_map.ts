/**
 * domain_operator_map.ts — BP083 v0.3.4 Per-Domain Specialist Operator Roster
 *
 * Defines which of the 9 canonical specialists fire for each of the 14 MMLU-Pro domains.
 * Per §2 of KNIGHT_YOKE_v0_3_4_CANONICAL_PLOW_PIPELINE_BP083.md:
 *
 *   Base 4 (ALL domains): wikipedia · wikidata · openalex · commoncrawl
 *   Domain extensions:
 *     CS / Math / Engineering / Physics:  + stackexchange · arxiv · wolfram · nist
 *     Biology / Health / Psychology:      + pubmed · arxiv
 *     Chemistry:                          + pubmed · wolfram · nist
 *     History / Philosophy / Law:         + (base 4 only)
 *     Business / Economics:               + stackexchange
 *     Other:                              + (base 4 only)
 */

import type { SpecialistName } from './specialist_adapters';

export type Domain =
  | 'math' | 'physics' | 'chemistry' | 'biology' | 'computer_science' | 'engineering'
  | 'history' | 'philosophy' | 'law' | 'business' | 'economics' | 'psychology'
  | 'health' | 'other';

const BASE_OPERATORS: SpecialistName[] = ['wikipedia', 'wikidata', 'openalex', 'commoncrawl'];

export const DOMAIN_OPERATOR_MAP: Record<Domain, SpecialistName[]> = {
  math:             [...BASE_OPERATORS, 'stackexchange', 'arxiv', 'wolfram'],
  physics:          [...BASE_OPERATORS, 'stackexchange', 'arxiv', 'wolfram', 'nist'],
  chemistry:        [...BASE_OPERATORS, 'pubmed', 'wolfram', 'nist'],
  biology:          [...BASE_OPERATORS, 'pubmed', 'arxiv'],
  computer_science: [...BASE_OPERATORS, 'stackexchange', 'arxiv'],
  engineering:      [...BASE_OPERATORS, 'stackexchange', 'arxiv', 'wolfram', 'nist'],
  history:          [...BASE_OPERATORS],
  philosophy:       [...BASE_OPERATORS],
  law:              [...BASE_OPERATORS],
  business:         [...BASE_OPERATORS, 'stackexchange'],
  economics:        [...BASE_OPERATORS, 'stackexchange'],
  psychology:       [...BASE_OPERATORS, 'pubmed', 'arxiv'],
  health:           [...BASE_OPERATORS, 'pubmed', 'arxiv'],
  other:            [...BASE_OPERATORS],
};

/**
 * Get the operator list for a domain (normalized to known domains).
 * Falls back to BASE_OPERATORS for unknown domain strings.
 */
export function getOperatorsForDomain(domain: string): SpecialistName[] {
  return DOMAIN_OPERATOR_MAP[domain as Domain] ?? BASE_OPERATORS;
}
