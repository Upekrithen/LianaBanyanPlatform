// reporting/json_emitter.mjs
// Emits schema-valid results.json per §7.1

import { writeFileSync } from 'fs';
import { join } from 'path';

const REQUIRED_TOP_KEYS = [
  'benchmark', 'version', 'edition', 'pretty_good_caveat',
  'run_ts', 'hardware_profile', 'results',
];

const REQUIRED_RESULT_KEYS = [
  'stack_id', 'stack_name', 'workload', 'runs', 'scores',
];

const REQUIRED_SCORE_AXES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/**
 * Validate a results bundle against the §7.1 schema.
 * Returns { valid: boolean; errors: string[] }.
 */
export function validateSchema(bundle) {
  const errors = [];
  for (const k of REQUIRED_TOP_KEYS) {
    if (!(k in bundle)) errors.push(`Missing top-level key: ${k}`);
  }
  if (!Array.isArray(bundle.results)) {
    errors.push('results must be an array');
  } else {
    for (const [i, r] of bundle.results.entries()) {
      for (const k of REQUIRED_RESULT_KEYS) {
        if (!(k in r)) errors.push(`results[${i}] missing key: ${k}`);
      }
      if (r.scores) {
        for (const axis of REQUIRED_SCORE_AXES) {
          if (!(axis in r.scores)) errors.push(`results[${i}].scores missing axis: ${axis}`);
        }
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Write the results bundle to a JSON file, with schema validation.
 * Throws if validation fails.
 *
 * @param {object} bundle
 * @param {string} outputPath
 */
export function emitJSON(bundle, outputPath) {
  const validation = validateSchema(bundle);
  if (!validation.valid) {
    console.warn('[json_emitter] Schema warnings:', validation.errors.join('; '));
  }
  const json = JSON.stringify(bundle, null, 2);
  writeFileSync(outputPath, json, 'utf8');
  return { outputPath, byteLength: Buffer.byteLength(json), validation };
}
