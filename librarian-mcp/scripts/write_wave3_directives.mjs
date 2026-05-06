// Wave 3 channel_4_directives — urTih (MISS-010, STUB-002) / urYod (MISS-011, STUB-004) / urNol (MISS-004, MISS-012, STUB-005)
// MISS-006 (urTih) and MISS-001 (urYod) directives already exist in channel_4_directives.jsonl
import { appendFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const DIRECTIVES = resolve(__dirname, "../stitchpunks/zippleback/channel_4_directives.jsonl");
const ts = new Date().toISOString();

const directives = [
  // urTih — MISS-010: Cascading Hexagonal Containers (#16)
  {
    directive_id: `LB-DIR-${randomUUID()}`,
    origin_session: "knight",
    origin_id: "BP021",
    directive_type: "analyze_platform_site",
    payload: {
      old_one_name: "urTih",
      innovation_id: "MISS-010",
      files_to_create: [
        "platform/src/components/hexisle/CascadingHexagonalContainersEngine.tsx",
        "platform/src/hooks/useCascadingHexagonalContainers.ts",
      ],
      files_to_modify: ["platform/src/pages/HexIsle.tsx", "platform/src/lib/hexisleProjectSpec.ts", "platform/src/lib/hexislePhysicsLayer.ts"],
      component_spec: "## CascadingHexagonalContainersEngine\n\n**Innovation**: #16 - Cascading Hexagonal Containers\n**Old One**: urTih\n**Complexity**: M (9K tokens)\n**Patent risk**: low\n\n### Implementation\n\nCascading Hexagonal Containers - Water cascades between nested hex containers at different elevations. Each container overflows into the next level when threshold is reached. Gravity-driven cascade chain through 5 levels.\n\n### Missing elements to implement\n\n- React component: CascadingHexagonalContainersEngine\n- Pheromone event class: CascadingHexagonalContainersState\n- hexisleProjectSpec.ts entry: innovation #16\n- Integration with HexIsle.tsx game loop\n\n### Dependencies\n\n- None (standalone innovation)",
      authority_token: "AUTHORITY_GRANTED:urTih",
    },
    founder_fire_code_required: true,
    ts,
  },
  // urTih — STUB-002: Compliant Mechanism Terrain Caps (#8)
  {
    directive_id: `LB-DIR-${randomUUID()}`,
    origin_session: "knight",
    origin_id: "BP021",
    directive_type: "analyze_platform_site",
    payload: {
      old_one_name: "urTih",
      innovation_id: "STUB-002",
      files_to_create: [
        "platform/src/components/hexisle/CompliantMechanismTerrainCapsEngine.tsx",
        "platform/src/hooks/useCompliantMechanismTerrainCaps.ts",
      ],
      files_to_modify: ["platform/src/pages/HexIsle.tsx", "platform/src/lib/hexisleProjectSpec.ts"],
      component_spec: "## CompliantMechanismTerrainCapsEngine\n\n**Innovation**: #8 - Compliant Mechanism Terrain Caps\n**Old One**: urTih\n**Complexity**: M (8K tokens)\n**Patent risk**: low\n\n### Implementation\n\nCompliant Mechanism Terrain Caps - Flexible snap-on terrain covers for Hexel tiles. Compliant mechanism flexes over irregular terrain while snapping securely. Multiple terrain types: water, land, forest, mountain.\n\n### Stubbed elements to complete\n\n- Full terrain type selector UI\n- Snap-force feedback visualization\n- Integration with HexIsle terrain layer\n\n### Dependencies\n\n- None (standalone stub completion)",
      authority_token: "AUTHORITY_GRANTED:urTih",
    },
    founder_fire_code_required: true,
    ts,
  },
  // urYod — MISS-011: Continuous Fluid Loop (#17)
  {
    directive_id: `LB-DIR-${randomUUID()}`,
    origin_session: "knight",
    origin_id: "BP021",
    directive_type: "analyze_platform_site",
    payload: {
      old_one_name: "urYod",
      innovation_id: "MISS-011",
      files_to_create: [
        "platform/src/components/hexisle/ContinuousFluidLoopEngine.tsx",
        "platform/src/hooks/useContinuousFluidLoop.ts",
      ],
      files_to_modify: ["platform/src/pages/HexIsle.tsx", "platform/src/lib/hexisleProjectSpec.ts", "platform/src/lib/hexislePhysicsLayer.ts"],
      component_spec: "## ContinuousFluidLoopEngine\n\n**Innovation**: #17 - Continuous Fluid Loop\n**Old One**: urYod\n**Complexity**: M (9K tokens)\n**Patent risk**: low\n\n### Implementation\n\nContinuous Fluid Loop - Water recirculates without external pumps. Uses height differential + Sawtooth60 directional flow + Golden Lotus timing to create a perpetual loop. Flow rate tracks with game turn.\n\n### Missing elements to implement\n\n- React component: ContinuousFluidLoopEngine\n- Pheromone event class: ContinuousFluidLoopState\n- hexisleProjectSpec.ts entry: innovation #17\n- Integration with HexIsle.tsx game loop\n\n### Dependencies\n\n- Requires `MISS-001` (Inverse Hydraulic Coupling) to be fixed first",
      authority_token: "AUTHORITY_GRANTED:urYod",
    },
    founder_fire_code_required: true,
    ts,
  },
  // urYod — STUB-004: Modular Canoe-to-Viking Ship Transform (#19)
  {
    directive_id: `LB-DIR-${randomUUID()}`,
    origin_session: "knight",
    origin_id: "BP021",
    directive_type: "analyze_platform_site",
    payload: {
      old_one_name: "urYod",
      innovation_id: "STUB-004",
      files_to_create: [
        "platform/src/components/hexisle/ModularCanoeToVikingShipEngine.tsx",
        "platform/src/hooks/useModularCanoeToVikingShip.ts",
      ],
      files_to_modify: ["platform/src/pages/HexIsle.tsx", "platform/src/lib/hexisleProjectSpec.ts"],
      component_spec: "## ModularCanoeToVikingShipEngine\n\n**Innovation**: #19 - Modular Canoe-to-Viking Ship Transform\n**Old One**: urYod\n**Complexity**: M (8K tokens)\n**Patent risk**: low\n\n### Implementation\n\nModular Canoe-to-Viking Ship Transform - Ships grow by snapping additional hull segments each tide cycle. Start as canoe (1 segment), grow to Viking longship (5 segments) over 4 tide turns. Each segment adds speed + cargo capacity.\n\n### Stubbed elements to complete\n\n- Full hull segment progression UI (1 to 5 segments)\n- Speed + cargo capacity scaling\n- Snap-fit animation\n- Integration with Ouralis tide cycle clock\n\n### Dependencies\n\n- Requires `MISS-001` to be fixed first",
      authority_token: "AUTHORITY_GRANTED:urYod",
    },
    founder_fire_code_required: true,
    ts,
  },
  // urNol — MISS-004: Universal Scale Adapter (#9)
  {
    directive_id: `LB-DIR-${randomUUID()}`,
    origin_session: "knight",
    origin_id: "BP021",
    directive_type: "analyze_platform_site",
    payload: {
      old_one_name: "urNol",
      innovation_id: "MISS-004",
      files_to_create: [
        "platform/src/components/hexisle/UniversalScaleAdapterEngine.tsx",
        "platform/src/hooks/useUniversalScaleAdapter.ts",
      ],
      files_to_modify: ["platform/src/pages/HexIsle.tsx", "platform/src/lib/hexisleProjectSpec.ts"],
      component_spec: "## UniversalScaleAdapterEngine\n\n**Innovation**: #9 - Universal Scale Adapter\n**Old One**: urNol\n**Complexity**: M (7K tokens)\n**Patent risk**: low\n\n### Implementation\n\nUniversal Scale Adapter - 25mm/28mm/32mm compatibility via adapter rings. Three concentric adapter rings snap onto Hexel tile base, each step adding 1.5mm height. Visual snap indicator shows which scale is active.\n\n### Missing elements to implement\n\n- React component: UniversalScaleAdapterEngine\n- Pheromone event class: UniversalScaleAdapterState\n- hexisleProjectSpec.ts entry: innovation #9\n- Scale ring selector UI (25mm/28mm/32mm)\n- Integration with HexIsle.tsx game loop\n\n### Dependencies\n\n- None (standalone innovation)",
      authority_token: "AUTHORITY_GRANTED:urNol",
    },
    founder_fire_code_required: true,
    ts,
  },
  // urNol — MISS-012: Water Table Gravity Engine (#22)
  {
    directive_id: `LB-DIR-${randomUUID()}`,
    origin_session: "knight",
    origin_id: "BP021",
    directive_type: "analyze_platform_site",
    payload: {
      old_one_name: "urNol",
      innovation_id: "MISS-012",
      files_to_create: [
        "platform/src/components/hexisle/WaterTableGravityEngine.tsx",
        "platform/src/hooks/useWaterTableGravity.ts",
      ],
      files_to_modify: ["platform/src/pages/HexIsle.tsx", "platform/src/lib/hexisleProjectSpec.ts", "platform/src/lib/hexislePhysicsLayer.ts"],
      component_spec: "## WaterTableGravityEngine\n\n**Innovation**: #22 - Water Table Gravity Engine\n**Old One**: urNol\n**Complexity**: L (12K tokens)\n**Patent risk**: low\n\n### Implementation\n\nWater Table Gravity Engine - 5+ gallon reservoir at elevation provides sustained hydraulic power. Pressure output = reservoir_volume_gallons x gravity_factor x elevation_cm. Depletes over time; refill mechanic via rainfall events tied to tide cycle.\n\n### Missing elements to implement\n\n- React component: WaterTableGravityEngine\n- Pheromone event class: WaterTableGravityState\n- hexisleProjectSpec.ts entry: innovation #22\n- Reservoir level visualization + depletion tracking\n- Rainfall refill events\n- Integration with HexIsle.tsx game loop\n\n### Dependencies\n\n- Requires `MISS-006` (AC Pressure Generation) to be fixed first",
      authority_token: "AUTHORITY_GRANTED:urNol",
    },
    founder_fire_code_required: true,
    ts,
  },
  // urNol — STUB-005: Lithographic Dual-Process Design (#28)
  {
    directive_id: `LB-DIR-${randomUUID()}`,
    origin_session: "knight",
    origin_id: "BP021",
    directive_type: "analyze_platform_site",
    payload: {
      old_one_name: "urNol",
      innovation_id: "STUB-005",
      files_to_create: [
        "platform/src/components/hexisle/LithographicDualProcessEngine.tsx",
        "platform/src/hooks/useLithographicDualProcess.ts",
      ],
      files_to_modify: ["platform/src/pages/HexIsle.tsx", "platform/src/lib/hexisleProjectSpec.ts"],
      component_spec: "## LithographicDualProcessEngine\n\n**Innovation**: #28 - Lithographic Dual-Process Design\n**Old One**: urNol\n**Complexity**: M (8K tokens)\n**Patent risk**: low\n\n### Implementation\n\nLithographic Dual-Process Design - Two-step lithographic production. Step 1: mold impression (pattern layer). Step 2: material casting (functional layer). Each step uses different materials. Enables complex pattern/color combos without painting.\n\n### Stubbed elements to complete\n\n- Full dual-process selector UI (pattern + material layer)\n- Material compatibility matrix\n- Process preview visualization\n- Integration with HexIsle manufacturing layer\n\n### Dependencies\n\n- None (standalone stub completion)",
      authority_token: "AUTHORITY_GRANTED:urNol",
    },
    founder_fire_code_required: true,
    ts,
  },
];

for (const d of directives) {
  appendFileSync(DIRECTIVES, JSON.stringify(d) + "\n", "utf-8");
  console.log(`Written directive ${d.directive_id.slice(0, 20)} for ${d.payload.old_one_name}/${d.payload.innovation_id}`);
}
console.log(`\nWave 3 directives complete: ${directives.length} new entries`);
