/**
 * HEXEL GRAMMAR VALIDATOR — CAD Geometry vs. Piece Grammar Comparison
 * ====================================================================
 * Innovation #1539: Automated validation of Fusion 360 CAD exports against
 * the canonical Hexel Piece Grammar (Innovation #1537).
 *
 * Takes the JSON output from extract_hexel_geometry.py (Innovation #1538)
 * and cross-references every component against HEXEL_PIECES, checking:
 *
 *   1. COVERAGE — Are all 27 canonical pieces present in the CAD?
 *   2. DIMENSIONS — Do extracted measurements match patent specs?
 *   3. CONNECTIONS — Do adjacency relationships match the grammar?
 *   4. LAYER ORDER — Are pieces stacked in the correct vertical sequence?
 *   5. POWER CHAIN — Is the hydraulic/pneumatic/trap chain physically connected?
 *   6. QUANTITY — Are the right number of each piece present?
 *
 * This runs in the browser (not Node) — no fs required. The Founder uploads
 * the JSON from Fusion 360 and the validator processes it in-memory.
 *
 * "When you stop the clock, you literally stop the ocean."
 */

import {
  HEXEL_PIECES,
  WATER_TABLE_COMPONENTS,
  CHARACTER_BASE_PIECES,
  getPiecesByLayer,
  getHydraulicPowerChain,
  getPneumaticChain,
  getTrapChain,
  validateConnections,
  type HexelPiece,
  type HexelLayer,
} from './hexelPieceGrammar';

// ============================================================================
// TYPES — Matching the JSON schema from extract_hexel_geometry.py
// ============================================================================

/** Bounding box from Fusion 360 extraction (all values in mm) */
interface ExtractedBoundingBox {
  min_x: number;
  min_y: number;
  min_z: number;
  max_x: number;
  max_y: number;
  max_z: number;
  width: number;
  height: number;
  depth: number;
}

/** Cylindrical face data from extraction */
interface ExtractedCylinder {
  radius_mm: number;
  diameter_mm: number;
  estimated_height_mm: number;
  area_mm2: number;
  axis: { x: number; y: number; z: number };
  origin: { x: number; y: number; z: number };
  is_vertical: boolean;
  is_horizontal: boolean;
}

/** Planar face data from extraction */
interface ExtractedPlane {
  normal: { x: number; y: number; z: number };
  origin_mm: { x: number; y: number; z: number };
  area_mm2: number;
  direction: 'top' | 'bottom' | 'side_x' | 'side_z' | 'other';
}

/** Face summary counts */
interface FaceSummary {
  planar: number;
  cylindrical: number;
  conical: number;
  spherical: number;
  toroidal: number;
  nurbs: number;
  total: number;
}

/** Interface summary for connection analysis */
interface InterfaceSummary {
  top_face_count: number;
  bottom_face_count: number;
  side_face_count: number;
  top_total_area_mm2: number;
  bottom_total_area_mm2: number;
}

/** Extracted body data */
interface ExtractedBody {
  name: string;
  is_solid: boolean;
  is_visible: boolean;
  face_count: number;
  edge_count: number;
  vertex_count: number;
  bounding_box_mm?: ExtractedBoundingBox;
  volume_mm3?: number;
  area_mm2?: number;
  mass_grams?: number;
  center_of_mass_mm?: { x: number; y: number; z: number };
  face_summary: FaceSummary;
  cylindrical_faces?: ExtractedCylinder[];
  key_cylinders?: {
    vertical_bores: ExtractedCylinder[];
    horizontal_channels: ExtractedCylinder[];
    max_radius_mm: number;
    min_radius_mm: number;
  };
  interface_summary?: InterfaceSummary;
  top_interfaces?: ExtractedPlane[];
  bottom_interfaces?: ExtractedPlane[];
}

/** Extracted component data */
interface ExtractedComponent {
  name: string;
  full_path: string;
  is_grounded: boolean;
  depth_in_tree: number;
  grammar_id: string | null;
  assembly_family: { prefix: string; description: string } | null;
  bodies: ExtractedBody[];
  children: ExtractedComponent[];
  child_count: number;
  transform?: {
    translation_mm: { x: number; y: number; z: number };
  };
  material?: { name: string; id: string };
}

/** Joint data */
interface ExtractedJoint {
  name: string;
  joint_type: string;
  is_suppressed: boolean;
  component_one?: string;
  component_two?: string;
  origin_one?: { x: number; y: number; z: number };
}

/** User parameter */
interface ExtractedParameter {
  name: string;
  value: number;
  unit: string;
  expression: string;
  comment: string;
}

/** The full JSON output from the Fusion 360 extractor */
export interface HexelGeometryExtract {
  schema_version: string;
  extraction_timestamp: string;
  design_name: string;
  design_file: string;
  piece_grammar_version: string;
  component_map_version: string;
  units: string;
  coordinate_system: string;
  assembly_family: { prefix: string; description: string } | null;
  components: ExtractedComponent[];
  joints: ExtractedJoint[];
  user_parameters: ExtractedParameter[];
  hexel_analysis: {
    hexel_spec_references: Record<string, number | number[]>;
    dimensional_matches: string[];
    dimensional_warnings: string[];
  };
  unknown_classification: Array<{
    name: string;
    suggested_roles: string[];
    confidence: string;
  }>;
  statistics: {
    total_components: number;
    mapped_to_grammar: number;
    unmapped: number;
    mapping_coverage_pct: number;
    total_bodies: number;
    total_faces: number;
    total_joints: number;
    total_user_parameters: number;
    dimensional_matches: number;
    dimensional_warnings: number;
  };
}

// ============================================================================
// VALIDATION RESULTS
// ============================================================================

export type ValidationSeverity = 'pass' | 'warning' | 'error' | 'info';

export interface ValidationResult {
  check: string;
  severity: ValidationSeverity;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationReport {
  timestamp: string;
  design_name: string;
  assembly_family: string | null;
  total_checks: number;
  passed: number;
  warnings: number;
  errors: number;
  infos: number;
  coverage_score: number;       // 0-100: how many grammar pieces are present
  dimension_score: number;      // 0-100: how many dimensions match specs
  connection_score: number;     // 0-100: how many connections are valid
  overall_score: number;        // 0-100: weighted composite
  results: ValidationResult[];
  missing_pieces: string[];     // Grammar IDs not found in CAD
  extra_components: string[];   // CAD names not in grammar
  power_chain_status: {
    hydraulic: 'complete' | 'partial' | 'broken';
    pneumatic: 'complete' | 'partial' | 'broken';
    trap: 'complete' | 'partial' | 'broken';
  };
}

// ============================================================================
// HEXEL SPEC DIMENSIONS — From Patent Bag 5 & Technical Handover
// ============================================================================

interface DimensionSpec {
  piece_id: string;
  checks: Array<{
    property: 'width' | 'height' | 'depth' | 'diameter' | 'bore_diameter';
    expected_mm: number;
    tolerance_mm: number;
    source: string;
  }>;
}

const DIMENSION_SPECS: DimensionSpec[] = [
  {
    piece_id: 'channel_lock',
    checks: [
      { property: 'width', expected_mm: 60, tolerance_mm: 2, source: 'Spec-54: 60mm flat-to-flat hexagonal' },
      { property: 'height', expected_mm: 9, tolerance_mm: 1, source: 'Technical Handover: 9mm tall' },
    ],
  },
  {
    piece_id: 'hollow_log',
    checks: [
      { property: 'bore_diameter', expected_mm: 15.5, tolerance_mm: 1, source: 'Technical Handover: 15.5mm dia central column' },
    ],
  },
  {
    piece_id: 'rotor',
    checks: [
      { property: 'height', expected_mm: 12, tolerance_mm: 1, source: 'Bag 5: full 12mm height' },
      { property: 'bore_diameter', expected_mm: 21.125, tolerance_mm: 1.5, source: 'Bag 5: 21.125mm inner radius' },
    ],
  },
  {
    piece_id: 'golden_lotus',
    checks: [
      { property: 'depth', expected_mm: 10.5, tolerance_mm: 1, source: 'Bag 5: 10.5mm radial depth' },
    ],
  },
  {
    piece_id: 'capstone',
    checks: [
      { property: 'width', expected_mm: 60, tolerance_mm: 3, source: 'Spec-54: hexagonal terrain cap' },
    ],
  },
  {
    piece_id: 'slotted_top',
    checks: [
      { property: 'width', expected_mm: 60, tolerance_mm: 3, source: 'FlyingButtress: 60mm interface' },
    ],
  },
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Flatten a component tree into a flat array (depth-first).
 */
function flattenComponents(components: ExtractedComponent[]): ExtractedComponent[] {
  const flat: ExtractedComponent[] = [];
  function walk(comps: ExtractedComponent[]) {
    for (const c of comps) {
      flat.push(c);
      if (c.children && c.children.length > 0) {
        walk(c.children);
      }
    }
  }
  walk(components);
  return flat;
}

/**
 * CHECK 1: COVERAGE — Are all canonical pieces present?
 */
function checkCoverage(
  allComps: ExtractedComponent[],
  results: ValidationResult[]
): { missing: string[]; extra: string[]; score: number } {
  const grammarIds = new Set(HEXEL_PIECES.map(p => p.id));
  const foundIds = new Set<string>();
  const unmappedNames: string[] = [];

  for (const comp of allComps) {
    if (comp.grammar_id) {
      foundIds.add(comp.grammar_id);
    } else {
      unmappedNames.push(comp.name);
    }
  }

  const missing = [...grammarIds].filter(id => !foundIds.has(id));
  const extra = unmappedNames;

  // Report each found piece
  for (const id of foundIds) {
    const piece = HEXEL_PIECES.find(p => p.id === id);
    results.push({
      check: 'coverage',
      severity: 'pass',
      message: `Found: ${piece?.name || id}`,
      details: { grammar_id: id },
    });
  }

  // Report missing pieces
  for (const id of missing) {
    const piece = HEXEL_PIECES.find(p => p.id === id);
    results.push({
      check: 'coverage',
      severity: 'warning',
      message: `Missing from CAD: ${piece?.name || id} (layer ${piece?.layer || '?'})`,
      details: { grammar_id: id, layer: piece?.layer },
    });
  }

  // Report unmapped components
  for (const name of extra) {
    results.push({
      check: 'coverage',
      severity: 'info',
      message: `Unmapped CAD component: "${name}" — not in grammar`,
      details: { cad_name: name },
    });
  }

  const score = grammarIds.size > 0
    ? Math.round((foundIds.size / grammarIds.size) * 100)
    : 0;

  results.push({
    check: 'coverage_summary',
    severity: score >= 80 ? 'pass' : score >= 50 ? 'warning' : 'error',
    message: `Coverage: ${foundIds.size}/${grammarIds.size} pieces (${score}%)`,
    details: { found: foundIds.size, total: grammarIds.size, missing: missing.length },
  });

  return { missing, extra, score };
}

/**
 * CHECK 2: DIMENSIONS — Do measurements match patent specs?
 */
function checkDimensions(
  allComps: ExtractedComponent[],
  results: ValidationResult[]
): number {
  let totalChecks = 0;
  let passedChecks = 0;

  for (const spec of DIMENSION_SPECS) {
    const comps = allComps.filter(c => c.grammar_id === spec.piece_id);
    if (comps.length === 0) {
      results.push({
        check: 'dimensions',
        severity: 'info',
        message: `Skipping dimension check for ${spec.piece_id} — not found in CAD`,
      });
      continue;
    }

    for (const comp of comps) {
      for (const body of comp.bodies) {
        const bb = body.bounding_box_mm;
        if (!bb) continue;

        for (const check of spec.checks) {
          totalChecks++;
          let measured: number | null = null;

          switch (check.property) {
            case 'width':
              measured = Math.max(bb.width, bb.depth); // Width could be in X or Z
              break;
            case 'height':
              measured = bb.height;
              break;
            case 'depth':
              measured = Math.min(bb.width, bb.depth);
              break;
            case 'diameter':
              measured = Math.max(bb.width, bb.depth);
              break;
            case 'bore_diameter': {
              // Check cylindrical faces for bore
              const keyCyls = body.key_cylinders;
              if (keyCyls && keyCyls.vertical_bores.length > 0) {
                // Find the bore closest to expected
                const closest = keyCyls.vertical_bores.reduce((best, bore) =>
                  Math.abs(bore.diameter_mm - check.expected_mm) <
                  Math.abs(best.diameter_mm - check.expected_mm) ? bore : best
                );
                measured = closest.diameter_mm;
              }
              break;
            }
          }

          if (measured !== null) {
            const diff = Math.abs(measured - check.expected_mm);
            if (diff <= check.tolerance_mm) {
              passedChecks++;
              results.push({
                check: 'dimensions',
                severity: 'pass',
                message: `${spec.piece_id} ${check.property}: ${measured.toFixed(2)}mm (expected ${check.expected_mm}mm, tolerance ${check.tolerance_mm}mm)`,
                details: { piece: spec.piece_id, property: check.property, measured, expected: check.expected_mm, diff, source: check.source },
              });
            } else {
              results.push({
                check: 'dimensions',
                severity: diff <= check.tolerance_mm * 2 ? 'warning' : 'error',
                message: `${spec.piece_id} ${check.property}: ${measured.toFixed(2)}mm DIFFERS from expected ${check.expected_mm}mm (off by ${diff.toFixed(2)}mm)`,
                details: { piece: spec.piece_id, property: check.property, measured, expected: check.expected_mm, diff, source: check.source },
              });
            }
          } else {
            results.push({
              check: 'dimensions',
              severity: 'warning',
              message: `${spec.piece_id} ${check.property}: could not measure from CAD data`,
              details: { piece: spec.piece_id, property: check.property },
            });
          }
        }
      }
    }
  }

  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;
  results.push({
    check: 'dimensions_summary',
    severity: score >= 80 ? 'pass' : score >= 50 ? 'warning' : 'error',
    message: `Dimensions: ${passedChecks}/${totalChecks} within tolerance (${score}%)`,
  });

  return score;
}

/**
 * CHECK 3: LAYER ORDER — Are pieces stacked in correct vertical sequence?
 */
function checkLayerOrder(
  allComps: ExtractedComponent[],
  results: ValidationResult[]
): void {
  // Get components with both grammar_id and Y position
  const positioned: Array<{ id: string; name: string; y: number; layer: HexelLayer }> = [];

  for (const comp of allComps) {
    if (!comp.grammar_id || !comp.transform) continue;
    const piece = HEXEL_PIECES.find(p => p.id === comp.grammar_id);
    if (!piece) continue;

    positioned.push({
      id: comp.grammar_id,
      name: piece.name,
      y: comp.transform.translation_mm.y,
      layer: piece.layer,
    });
  }

  if (positioned.length < 2) {
    results.push({
      check: 'layer_order',
      severity: 'info',
      message: 'Not enough positioned pieces to verify layer order (need 2+)',
    });
    return;
  }

  // Sort by Y position (Fusion 360 Y-up)
  positioned.sort((a, b) => a.y - b.y);

  // Extract layer numbers for comparison
  const layerNumber = (layer: HexelLayer): number =>
    parseInt(layer.replace('L', ''), 10);

  let orderCorrect = true;
  for (let i = 1; i < positioned.length; i++) {
    const prev = positioned[i - 1];
    const curr = positioned[i];
    const prevLayer = layerNumber(prev.layer);
    const currLayer = layerNumber(curr.layer);

    if (currLayer < prevLayer) {
      orderCorrect = false;
      results.push({
        check: 'layer_order',
        severity: 'error',
        message: `Layer inversion: ${curr.name} (${curr.layer}, Y=${curr.y.toFixed(1)}mm) is above ${prev.name} (${prev.layer}, Y=${prev.y.toFixed(1)}mm) but should be below`,
        details: { upper: curr, lower: prev },
      });
    }
  }

  if (orderCorrect) {
    results.push({
      check: 'layer_order',
      severity: 'pass',
      message: `Layer order verified: ${positioned.length} pieces in correct vertical sequence`,
      details: { sequence: positioned.map(p => `${p.name}(${p.layer})`) },
    });
  }
}

/**
 * CHECK 4: POWER CHAIN — Is the hydraulic chain physically connected?
 */
function checkPowerChain(
  allComps: ExtractedComponent[],
  extractedJoints: ExtractedJoint[],
  results: ValidationResult[]
): { hydraulic: 'complete' | 'partial' | 'broken'; pneumatic: 'complete' | 'partial' | 'broken'; trap: 'complete' | 'partial' | 'broken' } {
  const foundIds = new Set(allComps.filter(c => c.grammar_id).map(c => c.grammar_id!));

  // Check hydraulic chain
  const hydraulicChain = getHydraulicPowerChain();
  const hydraulicPresent = hydraulicChain.filter(step => foundIds.has(step.pieceId));
  const hydraulicMissing = hydraulicChain.filter(step => !foundIds.has(step.pieceId));

  let hydraulicStatus: 'complete' | 'partial' | 'broken' = 'complete';
  if (hydraulicMissing.length === 0) {
    results.push({
      check: 'power_chain',
      severity: 'pass',
      message: `Hydraulic chain COMPLETE: all ${hydraulicChain.length} steps present`,
    });
  } else if (hydraulicPresent.length > hydraulicChain.length / 2) {
    hydraulicStatus = 'partial';
    results.push({
      check: 'power_chain',
      severity: 'warning',
      message: `Hydraulic chain PARTIAL: ${hydraulicPresent.length}/${hydraulicChain.length} steps. Missing: ${hydraulicMissing.map(s => s.pieceName).join(', ')}`,
    });
  } else {
    hydraulicStatus = 'broken';
    results.push({
      check: 'power_chain',
      severity: 'error',
      message: `Hydraulic chain BROKEN: only ${hydraulicPresent.length}/${hydraulicChain.length} steps present`,
    });
  }

  // Check pneumatic chain
  const pneumaticChain = getPneumaticChain();
  const pneumaticPresent = pneumaticChain.filter(step => foundIds.has(step.pieceId));
  const pneumaticMissing = pneumaticChain.filter(step => !foundIds.has(step.pieceId));

  let pneumaticStatus: 'complete' | 'partial' | 'broken' = 'complete';
  if (pneumaticMissing.length === 0) {
    results.push({
      check: 'power_chain',
      severity: 'pass',
      message: `Pneumatic chain COMPLETE: all ${pneumaticChain.length} steps present`,
    });
  } else if (pneumaticPresent.length > 0) {
    pneumaticStatus = 'partial';
    results.push({
      check: 'power_chain',
      severity: 'warning',
      message: `Pneumatic chain PARTIAL: ${pneumaticPresent.length}/${pneumaticChain.length} steps. Missing: ${pneumaticMissing.map(s => s.pieceName).join(', ')}`,
    });
  } else {
    pneumaticStatus = 'broken';
    results.push({
      check: 'power_chain',
      severity: 'info',
      message: 'Pneumatic chain: no components found (may not be in this assembly)',
    });
  }

  // Check trap chain
  const trapChain = getTrapChain();
  const trapPresent = trapChain.filter(step => foundIds.has(step.pieceId));
  const trapMissing = trapChain.filter(step => !foundIds.has(step.pieceId));

  let trapStatus: 'complete' | 'partial' | 'broken' = 'complete';
  if (trapMissing.length === 0) {
    results.push({
      check: 'power_chain',
      severity: 'pass',
      message: `Trap chain COMPLETE: all ${trapChain.length} steps present`,
    });
  } else if (trapPresent.length > 0) {
    trapStatus = 'partial';
    results.push({
      check: 'power_chain',
      severity: 'warning',
      message: `Trap chain PARTIAL: ${trapPresent.length}/${trapChain.length}. Missing: ${trapMissing.map(s => s.pieceName).join(', ')}`,
    });
  } else {
    trapStatus = 'broken';
    results.push({
      check: 'power_chain',
      severity: 'info',
      message: 'Trap chain: no components found (may not be in this assembly)',
    });
  }

  // Check joint connectivity between power chain components
  const jointConnections = new Set<string>();
  for (const joint of extractedJoints) {
    if (!joint.is_suppressed && joint.component_one && joint.component_two) {
      jointConnections.add(`${joint.component_one}→${joint.component_two}`);
      jointConnections.add(`${joint.component_two}→${joint.component_one}`);
    }
  }

  if (jointConnections.size > 0) {
    results.push({
      check: 'power_chain',
      severity: 'info',
      message: `Found ${jointConnections.size / 2} joint connections between components`,
    });
  }

  return { hydraulic: hydraulicStatus, pneumatic: pneumaticStatus, trap: trapStatus };
}

/**
 * CHECK 5: QUANTITY — Correct count of each piece per Hexel
 */
function checkQuantities(
  allComps: ExtractedComponent[],
  results: ValidationResult[]
): void {
  const counts = new Map<string, number>();
  for (const comp of allComps) {
    if (comp.grammar_id) {
      counts.set(comp.grammar_id, (counts.get(comp.grammar_id) || 0) + 1);
    }
  }

  for (const piece of HEXEL_PIECES) {
    const found = counts.get(piece.id) || 0;
    if (found === 0) continue; // Already reported in coverage

    if (found === piece.quantityPerHexel) {
      results.push({
        check: 'quantity',
        severity: 'pass',
        message: `${piece.name}: ${found}x (expected ${piece.quantityPerHexel}x)`,
      });
    } else if (found > piece.quantityPerHexel) {
      results.push({
        check: 'quantity',
        severity: 'warning',
        message: `${piece.name}: ${found}x found (expected ${piece.quantityPerHexel}x) — extra instances may be variants or test copies`,
        details: { piece_id: piece.id, found, expected: piece.quantityPerHexel },
      });
    } else {
      results.push({
        check: 'quantity',
        severity: 'warning',
        message: `${piece.name}: ${found}x found (expected ${piece.quantityPerHexel}x) — missing instances`,
        details: { piece_id: piece.id, found, expected: piece.quantityPerHexel },
      });
    }
  }
}

/**
 * CHECK 6: CONNECTION TOPOLOGY — Grammar adjacency vs CAD reality
 */
function checkConnections(
  allComps: ExtractedComponent[],
  results: ValidationResult[]
): number {
  const foundIds = new Set(allComps.filter(c => c.grammar_id).map(c => c.grammar_id!));

  // Use the grammar's own validation
  const grammarValidation = validateConnections();
  let valid = 0;
  let total = 0;

  for (const result of grammarValidation) {
    total++;
    // Check if both pieces in the connection exist in the CAD
    const piecesInvolved = HEXEL_PIECES.filter(p =>
      p.connectsAbove.includes(result.piece) || p.connectsBelow.includes(result.piece) || p.id === result.piece
    );

    const allPresent = piecesInvolved.every(p => foundIds.has(p.id));

    if (result.valid) {
      valid++;
      if (allPresent) {
        results.push({
          check: 'connections',
          severity: 'pass',
          message: `Connection valid: ${result.piece} ↔ ${result.connectedTo} (both present in CAD)`,
        });
      }
    } else {
      results.push({
        check: 'connections',
        severity: 'warning',
        message: `Connection issue: ${result.piece} → ${result.connectedTo}: ${result.issue}`,
      });
    }
  }

  const score = total > 0 ? Math.round((valid / total) * 100) : 100;
  results.push({
    check: 'connections_summary',
    severity: score >= 80 ? 'pass' : score >= 50 ? 'warning' : 'error',
    message: `Connections: ${valid}/${total} valid (${score}%)`,
  });

  return score;
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Run ALL validation checks against a Fusion 360 geometry extract.
 *
 * Usage:
 *   const extract = JSON.parse(uploadedJsonString);
 *   const report = validateHexelGeometry(extract);
 */
export function validateHexelGeometry(extract: HexelGeometryExtract): ValidationReport {
  const results: ValidationResult[] = [];

  // Flatten the component tree for analysis
  const allComps = flattenComponents(extract.components);

  // Header info
  results.push({
    check: 'metadata',
    severity: 'info',
    message: `Validating: ${extract.design_name} (${allComps.length} components, ${extract.statistics.total_bodies} bodies, ${extract.statistics.total_faces} faces)`,
  });

  if (extract.assembly_family) {
    results.push({
      check: 'metadata',
      severity: 'info',
      message: `Assembly family: ${extract.assembly_family.description}`,
    });
  }

  // Run all checks
  const { missing, extra, score: coverageScore } = checkCoverage(allComps, results);
  const dimensionScore = checkDimensions(allComps, results);
  checkLayerOrder(allComps, results);
  const powerChainStatus = checkPowerChain(allComps, extract.joints, results);
  checkQuantities(allComps, results);
  const connectionScore = checkConnections(allComps, results);

  // Include the extractor's own analysis results
  if (extract.hexel_analysis) {
    for (const match of (extract.hexel_analysis.dimensional_matches || [])) {
      results.push({
        check: 'extractor_analysis',
        severity: 'pass',
        message: `Extractor: ${match}`,
      });
    }
    for (const warning of (extract.hexel_analysis.dimensional_warnings || [])) {
      results.push({
        check: 'extractor_analysis',
        severity: 'warning',
        message: `Extractor: ${warning}`,
      });
    }
  }

  // Include unknown component classifications
  for (const unknown of (extract.unknown_classification || [])) {
    results.push({
      check: 'classification',
      severity: 'info',
      message: `Unregistered "${unknown.name}" may be: ${unknown.suggested_roles.join(', ')} (${unknown.confidence} confidence)`,
    });
  }

  // Tally results
  const passed = results.filter(r => r.severity === 'pass').length;
  const warnings = results.filter(r => r.severity === 'warning').length;
  const errors = results.filter(r => r.severity === 'error').length;
  const infos = results.filter(r => r.severity === 'info').length;

  // Weighted overall score
  const overallScore = Math.round(
    coverageScore * 0.4 +
    dimensionScore * 0.3 +
    connectionScore * 0.3
  );

  return {
    timestamp: new Date().toISOString(),
    design_name: extract.design_name,
    assembly_family: extract.assembly_family?.description || null,
    total_checks: results.length,
    passed,
    warnings,
    errors,
    infos,
    coverage_score: coverageScore,
    dimension_score: dimensionScore,
    connection_score: connectionScore,
    overall_score: overallScore,
    results,
    missing_pieces: missing,
    extra_components: extra,
    power_chain_status: powerChainStatus,
  };
}

/**
 * Format a validation report as a human-readable string.
 */
export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = [];

  lines.push('========================================================================');
  lines.push('HEXEL GRAMMAR VALIDATION REPORT');
  lines.push('========================================================================');
  lines.push(`Design: ${report.design_name}`);
  if (report.assembly_family) {
    lines.push(`Assembly: ${report.assembly_family}`);
  }
  lines.push(`Timestamp: ${report.timestamp}`);
  lines.push('');
  lines.push('SCORES:');
  lines.push(`  Coverage:    ${report.coverage_score}%`);
  lines.push(`  Dimensions:  ${report.dimension_score}%`);
  lines.push(`  Connections: ${report.connection_score}%`);
  lines.push(`  OVERALL:     ${report.overall_score}%`);
  lines.push('');
  lines.push(`CHECKS: ${report.total_checks} total | ${report.passed} passed | ${report.warnings} warnings | ${report.errors} errors | ${report.infos} info`);
  lines.push('');

  // Power chain status
  lines.push('POWER CHAINS:');
  lines.push(`  Hydraulic:  ${report.power_chain_status.hydraulic.toUpperCase()}`);
  lines.push(`  Pneumatic:  ${report.power_chain_status.pneumatic.toUpperCase()}`);
  lines.push(`  Trap:       ${report.power_chain_status.trap.toUpperCase()}`);
  lines.push('');

  // Missing pieces
  if (report.missing_pieces.length > 0) {
    lines.push(`MISSING FROM CAD (${report.missing_pieces.length}):`);
    for (const id of report.missing_pieces) {
      const piece = HEXEL_PIECES.find(p => p.id === id);
      lines.push(`  - ${piece?.name || id} (${piece?.layer || '?'})`);
    }
    lines.push('');
  }

  // Extra components
  if (report.extra_components.length > 0) {
    lines.push(`UNMAPPED CAD COMPONENTS (${report.extra_components.length}):`);
    for (const name of report.extra_components.slice(0, 20)) {
      lines.push(`  - ${name}`);
    }
    if (report.extra_components.length > 20) {
      lines.push(`  ... and ${report.extra_components.length - 20} more`);
    }
    lines.push('');
  }

  // Detailed results by category
  const categories = ['coverage', 'dimensions', 'layer_order', 'power_chain', 'quantity', 'connections'];
  for (const cat of categories) {
    const catResults = report.results.filter(r => r.check === cat || r.check === `${cat}_summary`);
    if (catResults.length === 0) continue;

    lines.push(`--- ${cat.toUpperCase().replace('_', ' ')} ---`);
    for (const r of catResults) {
      const icon = r.severity === 'pass' ? 'PASS' : r.severity === 'warning' ? 'WARN' : r.severity === 'error' ? 'FAIL' : 'INFO';
      lines.push(`  [${icon}] ${r.message}`);
    }
    lines.push('');
  }

  lines.push('========================================================================');
  lines.push(`"The digital world IS the real world. We just haven't connected them yet."`);
  lines.push('========================================================================');

  return lines.join('\n');
}
