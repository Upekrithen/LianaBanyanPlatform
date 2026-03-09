/**
 * PHYSICAL MANUFACTURING PIPELINE — Design to Delivery
 * ======================================================
 * Innovation #1531: Physical Manufacturing Pipeline
 *
 * End-to-end system for physical product manufacturing:
 *   Design → Prototype → QC → Production → Fulfillment → Delivery
 *
 * Leverages:
 *   - Pioneer Nodes (distributed 3D printer/CNC network)
 *   - Blueprint Scroll (product journey visualization)
 *   - Guild system (quality oversight by craft guilds)
 *   - Seed Grant (Option C funding for first-time creators)
 *   - C+20% pricing floor (no race to the bottom)
 *   - Harper Guild (ethics and quality verification)
 *
 * Physical Capstone Manufacturing:
 *   The Hexel Spec defines the Capstone standard.
 *   Capstones are manufactured through this pipeline.
 *   Water table channel connections require precision QC.
 *
 * "I ALWAYS BUILD FOR THE LONG HAUL. No shortcuts, bandaids or wire twists."
 */

// ============================================================================
// TYPES
// ============================================================================

export type ManufacturingStage =
  | 'design'         // CAD/digital design phase
  | 'review'         // Design review by Guild experts
  | 'prototype'      // First physical prototype produced
  | 'testing'        // Quality testing and validation
  | 'revision'       // Design revisions based on test results
  | 'pre_production' // Final design locked, tooling prepared
  | 'production'     // Active production run
  | 'quality_check'  // Post-production quality inspection
  | 'packaging'      // Packaging and labeling
  | 'fulfillment'    // Ready for shipping / distribution
  | 'delivered';     // In customer's hands

export type ManufacturingMethod =
  | 'fdm_print'       // FDM 3D printing (most common)
  | 'sla_print'       // SLA resin printing (detail work)
  | 'cnc_routing'     // CNC router (wood, soft metals)
  | 'cnc_milling'     // CNC milling (hard metals)
  | 'laser_cutting'   // Laser cutting (flat materials)
  | 'injection_mold'  // Injection molding (mass production)
  | 'casting'         // Metal/resin casting
  | 'hand_craft'      // Manual/traditional craftsmanship
  | 'hybrid';         // Multiple methods combined

export type QualityGrade =
  | 'prototype'      // Functional but rough
  | 'standard'       // Meets basic quality bar
  | 'premium'        // Exceeds quality expectations
  | 'precision'      // Tight tolerances, high finish
  | 'artisan';       // Hand-finished, collector grade

export type ProductionScale =
  | 'one_off'        // Single unit (prototype or custom)
  | 'small_batch'    // 2-25 units
  | 'medium_run'     // 26-100 units
  | 'large_run'      // 101-500 units
  | 'mass';          // 500+ units

export interface ManufacturingOrder {
  id: string;
  // Product
  productName: string;
  productDescription: string;
  blueprintScrollId?: string;    // Link to Blueprint Scroll path
  innovationNumber?: number;     // Linked innovation
  // Design files
  designFiles: DesignFile[];
  hexelSpecCompliant: boolean;   // Does this conform to Hexel Spec?
  capstoneProduct: boolean;      // Is this a Capstone hex piece?
  // Manufacturing
  stage: ManufacturingStage;
  method: ManufacturingMethod;
  qualityGrade: QualityGrade;
  productionScale: ProductionScale;
  quantity: number;
  // Materials
  materials: MaterialRequirement[];
  estimatedMaterialCost: number;
  actualMaterialCost?: number;
  // Pricing (C+20% minimum)
  costPerUnit: number;
  pricePerUnit: number;          // Must be >= costPerUnit * 1.2
  totalRevenue: number;
  // Pioneer Node assignment
  assignedNodeId?: string;       // Which Pioneer Node produces this
  nodeCapabilities: string[];    // Required capabilities
  // Guild oversight
  designReviewGuild: string;     // Which guild reviews design
  qualityCheckGuild: string;     // Which guild does QC
  designReviewerId?: string;     // Crown Advisor who reviewed
  qualityCheckerId?: string;     // QC inspector
  // Seed Grant (if applicable)
  seedGrantId?: string;          // Funded by Seed Grant?
  // Status tracking
  stageHistory: ManufacturingStageRecord[];
  currentIssues: QualityIssue[];
  // Fulfillment
  shippingMethod?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  // Creator
  creatorId: string;
  creatorName: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface DesignFile {
  id: string;
  fileName: string;
  fileType: 'stl' | 'step' | 'obj' | 'gcode' | 'svg' | 'dxf' | 'pdf' | 'blend' | 'f3d';
  fileUrl: string;
  version: number;
  uploadedAt: string;
  notes?: string;
}

export interface MaterialRequirement {
  name: string;
  type: string;                  // e.g., "PLA filament", "Aluminum 6061", "Birch plywood"
  quantityNeeded: number;
  unit: string;                  // kg, m, sheets, ml
  costPerUnit: number;
  supplier?: string;
  sourced: boolean;
}

export interface ManufacturingStageRecord {
  stage: ManufacturingStage;
  enteredAt: string;
  completedAt?: string;
  approvedBy?: string;
  notes?: string;
  qualityScore?: number;         // 0-100
}

export interface QualityIssue {
  id: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  detectedAt: string;
  detectedBy: string;
  resolvedAt?: string;
  resolution?: string;
  photosUrl?: string[];
}

// ============================================================================
// PIONEER NODE INTEGRATION
// ============================================================================

export interface PioneerNode {
  id: string;
  userId: string;
  nodeNumber: number;
  displayName: string;
  locationCity: string;
  locationState: string;
  equipmentType: ManufacturingMethod;
  capabilities: string[];
  verified: boolean;
  subsidyClaimed: boolean;
  // Capacity
  currentOrders: number;
  maxConcurrentOrders: number;
  averageCompletionDays: number;
  // Quality
  completedOrders: number;
  qualityRating: number;         // 0-5 stars
  returnRate: number;            // Percentage of returns
  // Pricing
  hourlyRate: number;            // Credits per hour of machine time
  materialMarkup: number;        // 1.0 = at cost, 1.2 = 20% markup
}

/**
 * Match a manufacturing order to the best available Pioneer Node.
 */
export function matchPioneerNode(
  order: ManufacturingOrder,
  nodes: PioneerNode[]
): PioneerNode | null {
  return nodes
    .filter(node => {
      // Must be verified
      if (!node.verified) return false;
      // Must have capacity
      if (node.currentOrders >= node.maxConcurrentOrders) return false;
      // Must have required equipment
      if (node.equipmentType !== order.method && order.method !== 'hybrid') return false;
      // Must have required capabilities
      return order.nodeCapabilities.every(cap => node.capabilities.includes(cap));
    })
    .sort((a, b) => {
      // Sort by quality rating (highest first), then by proximity (future: geo)
      return b.qualityRating - a.qualityRating;
    })[0] || null;
}

// ============================================================================
// PRICING VALIDATION
// ============================================================================

/**
 * Validate C+20% pricing compliance for a manufacturing order.
 */
export function validatePricing(order: ManufacturingOrder): {
  compliant: boolean;
  margin: number;
  errors: string[];
} {
  const errors: string[] = [];
  const margin = (order.pricePerUnit - order.costPerUnit) / order.costPerUnit;

  if (margin < 0.2) {
    errors.push(`Price per unit (${order.pricePerUnit}) is below C+20% minimum. Cost: ${order.costPerUnit}, minimum price: ${Math.ceil(order.costPerUnit * 1.2)}`);
  }

  if (order.pricePerUnit <= 0) {
    errors.push('Price per unit must be positive');
  }

  if (order.costPerUnit <= 0) {
    errors.push('Cost per unit must be positive');
  }

  return {
    compliant: errors.length === 0,
    margin: Math.round(margin * 100),
    errors,
  };
}

// ============================================================================
// CAPSTONE MANUFACTURING SPEC
// ============================================================================

export interface CapstoneManufacturingSpec {
  // Physical dimensions (from Hexel Spec)
  hexDiameter: number;          // mm
  totalHeight: number;          // mm
  wallThickness: number;        // mm
  channelDiameter: number;      // mm (water table channels)
  interlockDepth: number;       // mm (edge connection depth)
  // Quality tolerances
  dimensionalTolerance: number; // mm (+/-)
  surfaceFinish: string;        // e.g., "0.1mm layer lines acceptable"
  channelSealTest: boolean;     // Must pass water-tightness test
  interlockFitTest: boolean;    // Must interlock with reference Capstone
  // Materials
  approvedMaterials: string[];  // e.g., ["PLA", "PETG", "ABS", "Resin"]
  minimumInfill: number;        // Percentage (e.g., 20%)
  // Manufacturing
  recommendedMethod: ManufacturingMethod;
  estimatedPrintTimeMinutes: number;
  estimatedMaterialGrams: number;
}

export const CAPSTONE_SPEC: CapstoneManufacturingSpec = {
  // NOTE: These are PLACEHOLDER values until the Founder finalizes the Hexel Spec
  // The water table channel connection is still being completed
  hexDiameter: 50,              // 50mm (~2 inches)
  totalHeight: 30,              // 30mm (~1.2 inches)
  wallThickness: 2,             // 2mm walls
  channelDiameter: 5,           // 5mm internal channels
  interlockDepth: 3,            // 3mm interlock tabs
  dimensionalTolerance: 0.3,    // +/- 0.3mm
  surfaceFinish: '0.2mm layer lines acceptable for FDM; 0.05mm for SLA',
  channelSealTest: true,
  interlockFitTest: true,
  approvedMaterials: ['PLA', 'PETG', 'ABS', 'Resin', 'Nylon'],
  minimumInfill: 20,
  recommendedMethod: 'fdm_print',
  estimatedPrintTimeMinutes: 45,
  estimatedMaterialGrams: 25,
};

// ============================================================================
// STAGE TRANSITIONS
// ============================================================================

const VALID_TRANSITIONS: Record<ManufacturingStage, ManufacturingStage[]> = {
  design: ['review'],
  review: ['prototype', 'design'],        // Can go back to design if rejected
  prototype: ['testing'],
  testing: ['revision', 'pre_production'], // Pass → pre_production, fail → revision
  revision: ['review'],                    // Revised design goes back for review
  pre_production: ['production'],
  production: ['quality_check'],
  quality_check: ['packaging', 'revision'], // Pass → packaging, fail → revision
  packaging: ['fulfillment'],
  fulfillment: ['delivered'],
  delivered: [],                           // Terminal state
};

/**
 * Advance a manufacturing order to the next stage.
 */
export function advanceManufacturingStage(
  order: ManufacturingOrder,
  nextStage: ManufacturingStage,
  approvedBy?: string,
  notes?: string
): ManufacturingOrder | null {
  const validNext = VALID_TRANSITIONS[order.stage];
  if (!validNext.includes(nextStage)) return null;

  const now = new Date().toISOString();

  // Complete current stage
  const updatedHistory = [...order.stageHistory];
  const currentRecord = updatedHistory[updatedHistory.length - 1];
  if (currentRecord && !currentRecord.completedAt) {
    currentRecord.completedAt = now;
    currentRecord.approvedBy = approvedBy;
  }

  // Add new stage
  updatedHistory.push({
    stage: nextStage,
    enteredAt: now,
    notes,
  });

  return {
    ...order,
    stage: nextStage,
    stageHistory: updatedHistory,
    updatedAt: now,
  };
}

/**
 * Calculate estimated total cost for a manufacturing order.
 */
export function calculateOrderCost(order: ManufacturingOrder): {
  materialsCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  minimumPrice: number;     // C+20%
  suggestedPrice: number;   // C+25% (recommended margin)
} {
  const materialsCost = order.materials.reduce(
    (sum, m) => sum + (m.costPerUnit * m.quantityNeeded), 0
  );
  const laborCost = materialsCost * 0.3;   // Estimate: 30% of materials
  const overheadCost = materialsCost * 0.1; // Estimate: 10% overhead

  const totalCost = materialsCost + laborCost + overheadCost;
  const costPerUnit = totalCost / order.quantity;

  return {
    materialsCost,
    laborCost,
    overheadCost,
    totalCost,
    minimumPrice: Math.ceil(costPerUnit * 1.2),
    suggestedPrice: Math.ceil(costPerUnit * 1.25),
  };
}

export default {
  CAPSTONE_SPEC,
  matchPioneerNode,
  validatePricing,
  advanceManufacturingStage,
  calculateOrderCost,
};
