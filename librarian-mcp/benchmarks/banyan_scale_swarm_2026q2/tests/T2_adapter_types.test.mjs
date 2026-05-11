// tests/T2_adapter_types.test.mjs
// T2: Each adapter contract type-checks (shape validation).

import { test } from 'node:test';
import assert from 'node:assert/strict';

const REQUIRED_EXPORTS = ['STACK_ID', 'STACK_NAME', 'IMPLEMENTATION_STATUS', 'preflight', 'runWorkload', 'observeMetrics', 'cleanup'];
const VALID_STATUSES = ['scaffold', 'dry_run_capable', 'production_ready'];
const VALID_STACK_IDS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

const ADAPTERS = [
  { path: '../adapters/s1_ruflo.mjs',        name: 'S1' },
  { path: '../adapters/s2_wshobson.mjs',     name: 'S2' },
  { path: '../adapters/s3_hive.mjs',         name: 'S3' },
  { path: '../adapters/s4_composio.mjs',     name: 'S4' },
  { path: '../adapters/s5_maestro.mjs',      name: 'S5' },
  { path: '../adapters/s6_lb_substrate.mjs', name: 'S6' },
];

for (const { path, name } of ADAPTERS) {
  test(`T2 ${name}: adapter has all required exports`, async () => {
    const mod = await import(path);
    for (const exp of REQUIRED_EXPORTS) {
      assert.ok(exp in mod, `${name} missing export: ${exp}`);
    }
    assert.ok(VALID_STACK_IDS.includes(mod.STACK_ID), `${name}.STACK_ID invalid: ${mod.STACK_ID}`);
    assert.equal(typeof mod.STACK_NAME, 'string', `${name}.STACK_NAME must be string`);
    assert.ok(VALID_STATUSES.includes(mod.IMPLEMENTATION_STATUS), `${name}.IMPLEMENTATION_STATUS invalid`);
    assert.equal(typeof mod.preflight, 'function', `${name}.preflight must be function`);
    assert.equal(typeof mod.runWorkload, 'function', `${name}.runWorkload must be function`);
    assert.equal(typeof mod.observeMetrics, 'function', `${name}.observeMetrics must be function`);
    assert.equal(typeof mod.cleanup, 'function', `${name}.cleanup must be function`);
  });
}

test('T2 all: preflight() returns correct shape', async () => {
  for (const { path, name } of ADAPTERS) {
    const mod = await import(path);
    const pf = await mod.preflight();
    assert.equal(typeof pf.ok, 'boolean', `${name} preflight.ok must be boolean`);
    assert.equal(typeof pf.version, 'string', `${name} preflight.version must be string`);
    assert.equal(typeof pf.hardwareFit, 'boolean', `${name} preflight.hardwareFit must be boolean`);
    assert.ok(Array.isArray(pf.warnings), `${name} preflight.warnings must be array`);
  }
});
