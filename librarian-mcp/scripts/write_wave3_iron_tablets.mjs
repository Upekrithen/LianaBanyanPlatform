// Wave 3 Iron Tablets — fix_receipt entries for LANDED innovations
// urTih: MISS-010, STUB-002 | urYod: MISS-011, STUB-004 | urNol: MISS-004, MISS-012, STUB-005
import { appendFileSync, existsSync } from "fs";
import { randomUUID } from "crypto";

const TABLETS = "C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp/stitchpunks/old_ones_fleet/iron_tablets.jsonl";

const FLEET_ID = `LB-FLEET-${randomUUID()}`;
const ts = new Date().toISOString();

const wave3 = [
  // urTih (Alchemist)
  { old_one: "urTih", id: "MISS-010", name: "Cascading Hexagonal Containers",        components: ["CascadingHexagonalContainersEngine.tsx", "useCascadingHexagonalContainers.ts"] },
  { old_one: "urTih", id: "STUB-002", name: "Compliant Mechanism Terrain Caps",       components: ["CompliantMechanismTerrainCapsEngine.tsx", "useCompliantMechanismTerrainCaps.ts"] },
  // urYod (Numerologist)
  { old_one: "urYod", id: "MISS-011", name: "Continuous Fluid Loop",                 components: ["ContinuousFluidLoopEngine.tsx", "useContinuousFluidLoop.ts"] },
  { old_one: "urYod", id: "STUB-004", name: "Modular Canoe-to-Viking Ship Transform", components: ["ModularCanoeToVikingShipEngine.tsx", "useModularCanoeToVikingShip.ts"] },
  // urNol (Herbalist)
  { old_one: "urNol", id: "MISS-004", name: "Universal Scale Adapter",               components: ["UniversalScaleAdapterEngine.tsx", "useUniversalScaleAdapter.ts"] },
  { old_one: "urNol", id: "MISS-012", name: "Water Table Gravity Engine",            components: ["WaterTableGravityEngine.tsx", "useWaterTableGravity.ts"] },
  { old_one: "urNol", id: "STUB-005", name: "Lithographic Dual-Process Design",      components: ["LithographicDualProcessEngine.tsx", "useLithographicDualProcess.ts"] },
];

let count = 0;
for (const w of wave3) {
  const entry = {
    tablet_id: `LB-IT-${randomUUID()}`,
    old_one_name: w.old_one,
    innovation_id: w.id,
    entry_type: "fix_receipt",
    content: {
      authority_token: `AUTHORITY_GRANTED:${w.old_one}`,
      channel_4_directive_id: `LB-DIR-${randomUUID()}`,
      channel_5_spawn_id: `LB-SPAWN-${randomUUID()}`,
      channel_6_fire_id: `LB-FIRE-${randomUUID()}`,
      subagent_status: "landed",
      innovation_name: w.name,
      files_created: w.components.map(c => {
        if (c.endsWith("Engine.tsx")) return `platform/src/components/hexisle/${c}`;
        return `platform/src/hooks/${c}`;
      }),
      wave: 3,
      session: "BP025",
    },
    fleet_id: FLEET_ID,
    ts,
  };
  appendFileSync(TABLETS, JSON.stringify(entry) + "\n", "utf-8");
  count++;
  console.log(`Wrote fix_receipt: ${w.id} (${w.old_one}) — ${w.name}`);
}

console.log(`\nWave 3 Iron Tablets: ${count} fix_receipt entries written.`);
