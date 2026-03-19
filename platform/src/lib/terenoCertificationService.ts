/**
 * Tereno Certification Service — The Gold Standard
 * =================================================
 * Six tiers of compatibility. One ecosystem.
 * Piggy-Back Protocol for third-party makers.
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export type CertificationStatus = "submitted" | "reviewing" | "certified" | "rejected";

export interface TerenoCertification {
  id: string;
  productName: string;
  productDescription: string;
  designerUserId: string | null;
  designerName: string;
  tier: number;
  tierName: string;
  manufacturingProcess: string;
  dimensionsCompliant: boolean;
  waterSafe: boolean;
  stackCompatible: boolean;
  compliantMechanisms: boolean;
  costUnderCeiling: boolean;
  lithographicManufacturing: boolean;
  deviationNotes: string | null;
  status: CertificationStatus;
  rejectionReason: string | null;
  ipLedgerEntry: string | null;
  deferredPayment: number;
  imageUrl: string | null;
  createdAt: string;
  certifiedAt: string | null;
}

export interface TerenoExclusion {
  id: string;
  productName: string;
  designerName: string;
  exclusionReason: string;
  details: string;
  reviewedAt: string;
}

export interface TierDefinition {
  tier: number;
  name: string;
  label: string;
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
  icon: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TIER_DEFINITIONS: TierDefinition[] = [
  { tier: 1, name: "Tereno Certified", label: "Crown Standard", color: "text-yellow-400", borderColor: "border-yellow-500", bgColor: "bg-yellow-500/10", description: "All 6 criteria met: lithographic, compliant mechanisms, cost under ceiling, 60mm, water-safe, full stack compatible", icon: "Crown" },
  { tier: 2, name: "Tereno Approved", label: "Near Standard", color: "text-slate-300", borderColor: "border-slate-400", bgColor: "bg-slate-400/10", description: "Meets 5 of 6 criteria — minor deviation documented", icon: "Shield" },
  { tier: 3, name: "HexIsle Official", label: "Cooperative Made", color: "text-blue-400", borderColor: "border-blue-500", bgColor: "bg-blue-500/10", description: "Made within the LB cooperative, may deviate from Tereno spec", icon: "Hexagon" },
  { tier: 4, name: "HexIsle Compatible", label: "Third Party", color: "text-green-400", borderColor: "border-green-500", bgColor: "bg-green-500/10", description: "Third-party made, works with the ecosystem but not Tereno-spec", icon: "Puzzle" },
  { tier: 5, name: "HexIsle Adaptable", label: "Adapter Required", color: "text-amber-400", borderColor: "border-amber-500", bgColor: "bg-amber-500/10", description: "Works with the ecosystem only with an adapter piece", icon: "Wrench" },
  { tier: 6, name: "HexIsle Inspired", label: "Ecosystem", color: "text-slate-500", borderColor: "border-slate-600", bgColor: "bg-slate-600/10", description: "Thematic/aesthetic compatibility — no mechanical integration", icon: "Sparkles" },
];

export const PROCESS_TIER_MAP = [
  { process: "SLA / Injection Mold", tierRange: "1–3", notes: "Highest precision, best for Tereno spec" },
  { process: "FDM (Desktop Extrusion)", tierRange: "3–4", notes: "Good for prototyping and cooperative production" },
  { process: "CNC Machining", tierRange: "2–3", notes: "High precision, limited by material" },
  { process: "Slip Casting", tierRange: "2–3", notes: "Ceramic specialty, excellent for water-safe" },
  { process: "Sand Casting", tierRange: "3–4", notes: "Traditional metal casting, lower precision" },
  { process: "Laser Cutting", tierRange: "4–5", notes: "Flat stock only, good for adapters and accessories" },
];

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const SAMPLE_CERTIFICATIONS: TerenoCertification[] = [
  { id: "tc1", productName: "Founder's Compliant Mechanism Flip-Top", productDescription: "Original flip-top terrain tile with compliant mechanism lid", designerUserId: null, designerName: "Founder", tier: 1, tierName: "Tereno Certified", manufacturingProcess: "SLA", dimensionsCompliant: true, waterSafe: true, stackCompatible: true, compliantMechanisms: true, costUnderCeiling: true, lithographicManufacturing: true, deviationNotes: null, status: "certified", rejectionReason: null, ipLedgerEntry: "IP-001", deferredPayment: 0, imageUrl: null, createdAt: "2026-01-15", certifiedAt: "2026-01-20" },
  { id: "tc2", productName: "Standard River Channel Tile", productDescription: "Basic hexagonal river channel with water flow integration", designerUserId: null, designerName: "LB Cooperative", tier: 1, tierName: "Tereno Certified", manufacturingProcess: "Injection Mold", dimensionsCompliant: true, waterSafe: true, stackCompatible: true, compliantMechanisms: true, costUnderCeiling: true, lithographicManufacturing: true, deviationNotes: null, status: "certified", rejectionReason: null, ipLedgerEntry: "IP-002", deferredPayment: 0, imageUrl: null, createdAt: "2026-01-20", certifiedAt: "2026-01-25" },
  { id: "tc3", productName: "Near-Spec Mountain Tile", productDescription: "Mountain terrain hex — slightly over cost ceiling", designerUserId: null, designerName: "LB Cooperative", tier: 2, tierName: "Tereno Approved", manufacturingProcess: "SLA", dimensionsCompliant: true, waterSafe: true, stackCompatible: true, compliantMechanisms: true, costUnderCeiling: false, lithographicManufacturing: true, deviationNotes: "Slightly over cost ceiling ($3.80 vs $3.50 max)", status: "certified", rejectionReason: null, ipLedgerEntry: "IP-003", deferredPayment: 0, imageUrl: null, createdAt: "2026-02-01", certifiedAt: "2026-02-05" },
  { id: "tc4", productName: "Cooperative Forest Hex", productDescription: "Dense forest canopy tile made in-house", designerUserId: null, designerName: "LB Makers Guild", tier: 3, tierName: "HexIsle Official", manufacturingProcess: "FDM", dimensionsCompliant: true, waterSafe: true, stackCompatible: true, compliantMechanisms: true, costUnderCeiling: true, lithographicManufacturing: false, deviationNotes: null, status: "certified", rejectionReason: null, ipLedgerEntry: "IP-004", deferredPayment: 0, imageUrl: null, createdAt: "2026-02-10", certifiedAt: "2026-02-15" },
  { id: "tc5", productName: "@fusefoxdesign Magnetic Terrain", productDescription: "Third-party terrain with magnetic snap instead of compliant mechanisms", designerUserId: null, designerName: "@fusefoxdesign", tier: 4, tierName: "HexIsle Compatible", manufacturingProcess: "FDM", dimensionsCompliant: true, waterSafe: true, stackCompatible: true, compliantMechanisms: false, costUnderCeiling: true, lithographicManufacturing: false, deviationNotes: "Uses magnets instead of compliant mechanisms", status: "certified", rejectionReason: null, ipLedgerEntry: "IP-005", deferredPayment: 45, imageUrl: null, createdAt: "2026-02-20", certifiedAt: "2026-02-25" },
  { id: "tc6", productName: "Oversized Display Hex (80mm)", productDescription: "Large display piece requiring adapter ring for 60mm stack", designerUserId: null, designerName: "DisplayCraft", tier: 5, tierName: "HexIsle Adaptable", manufacturingProcess: "CNC", dimensionsCompliant: false, waterSafe: true, stackCompatible: false, compliantMechanisms: true, costUnderCeiling: true, lithographicManufacturing: false, deviationNotes: "80mm flat-to-flat requires adapter ring", status: "certified", rejectionReason: null, ipLedgerEntry: "IP-006", deferredPayment: 30, imageUrl: null, createdAt: "2026-03-01", certifiedAt: "2026-03-05" },
  { id: "tc7", productName: "Decorative Crystal Hex", productDescription: "Resin art piece — aesthetic compatibility only", designerUserId: null, designerName: "CrystalArtisan", tier: 6, tierName: "HexIsle Inspired", manufacturingProcess: "Resin Casting", dimensionsCompliant: false, waterSafe: false, stackCompatible: false, compliantMechanisms: false, costUnderCeiling: true, lithographicManufacturing: false, deviationNotes: null, status: "certified", rejectionReason: null, ipLedgerEntry: "IP-007", deferredPayment: 20, imageUrl: null, createdAt: "2026-03-05", certifiedAt: "2026-03-10" },
  { id: "tc8", productName: "Volcanic Vent Tile", productDescription: "Geothermal terrain piece with steam channel", designerUserId: null, designerName: "IndieHexMaker", tier: 1, tierName: "Tereno Certified", manufacturingProcess: "SLA", dimensionsCompliant: true, waterSafe: true, stackCompatible: true, compliantMechanisms: true, costUnderCeiling: true, lithographicManufacturing: true, deviationNotes: null, status: "submitted", rejectionReason: null, ipLedgerEntry: null, deferredPayment: 0, imageUrl: null, createdAt: "2026-03-15", certifiedAt: null },
];

export const SAMPLE_EXCLUSIONS: TerenoExclusion[] = [
  { id: "ex1", productName: "LED Water Hex", designerName: "TechHex Co", exclusionReason: "electronics_near_water", details: "Embedded LED circuitry in water channel path — electrical hazard", reviewedAt: "2026-03-01" },
  { id: "ex2", productName: "Sugar Crystal Terrain", designerName: "CandyCraft", exclusionReason: "water_soluble", details: "Sugar-based resin dissolves when exposed to water table", reviewedAt: "2026-03-05" },
];

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

export async function fetchCertifications(): Promise<TerenoCertification[]> {
  try {
    const { data, error } = await supabase
      .from("tereno_certifications")
      .select("*")
      .order("tier", { ascending: true });
    if (error || !data?.length) return SAMPLE_CERTIFICATIONS;
    return data.map(mapCert);
  } catch { return SAMPLE_CERTIFICATIONS; }
}

export async function fetchExclusions(): Promise<TerenoExclusion[]> {
  try {
    const { data, error } = await supabase
      .from("tereno_exclusions")
      .select("*")
      .order("reviewed_at", { ascending: false });
    if (error || !data?.length) return SAMPLE_EXCLUSIONS;
    return data.map(row => ({
      id: row.id, productName: row.product_name, designerName: row.designer_name,
      exclusionReason: row.exclusion_reason, details: row.details, reviewedAt: row.reviewed_at,
    }));
  } catch { return SAMPLE_EXCLUSIONS; }
}

function mapCert(row: any): TerenoCertification {
  return {
    id: row.id, productName: row.product_name, productDescription: row.product_description,
    designerUserId: row.designer_user_id, designerName: row.designer_name,
    tier: row.tier, tierName: row.tier_name, manufacturingProcess: row.manufacturing_process,
    dimensionsCompliant: row.dimensions_compliant, waterSafe: row.water_safe,
    stackCompatible: row.stack_compatible, compliantMechanisms: row.compliant_mechanisms,
    costUnderCeiling: row.cost_under_ceiling, lithographicManufacturing: row.lithographic_manufacturing,
    deviationNotes: row.deviation_notes, status: row.status, rejectionReason: row.rejection_reason,
    ipLedgerEntry: row.ip_ledger_entry, deferredPayment: Number(row.deferred_payment),
    imageUrl: row.image_url, createdAt: row.created_at, certifiedAt: row.certified_at,
  };
}
