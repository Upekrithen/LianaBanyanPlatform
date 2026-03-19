/**
 * Proteus Anchor Service — Innovation #1553
 * ==========================================
 * A "Proteus" is a product/system that can transform and adapt.
 * The Anchor ties it to the cooperative's manufacturing backbone.
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export type AnchorStatus = "draft" | "active" | "legacy";
export type CompatLevel = "full" | "partial" | "experimental";
export type TransformationType = "design_revision" | "material_change" | "process_upgrade" | "scale_shift" | "market_pivot";

export interface ProteusAnchor {
  id: string;
  name: string;
  slug: string;
  description: string;
  productType: string;
  manufacturingProcesses: string[];
  terenoTier: number | null;
  anchorStatus: AnchorStatus;
  hexisleCompatible: boolean;
  innovationNumber: number | null;
  ipLedgerHash: string | null;
  imageUrl: string | null;
  externalUrl: string | null;
  createdAt: string;
  activatedAt: string | null;
}

export interface ManufacturingCompat {
  id: string;
  proteusId: string;
  moduleType: string;
  compatibilityLevel: CompatLevel;
  notes: string | null;
  verifiedAt: string | null;
}

export interface ProteusTransformation {
  id: string;
  proteusId: string;
  title: string;
  description: string;
  transformationType: TransformationType;
  beforeState: Record<string, any>;
  afterState: Record<string, any>;
  createdAt: string;
}

// ============================================================================
// SAMPLE DATA (fallback when Supabase is empty)
// ============================================================================

const SAMPLE_ANCHORS: ProteusAnchor[] = [
  {
    id: "proto-hexisle",
    name: "HexIsle",
    slug: "hexisle",
    description: "The inaugural Proteus. A modular hexagonal tile system that transforms from tabletop game piece to cooperative manufacturing product. Slip-cast ceramics, 3D-printed prototypes, desktop-extruded variants — all interchangeable within the HexIsle ecosystem.",
    productType: "modular_tile_system",
    manufacturingProcesses: ["slip_casting", "sla", "sls", "desktop_extrusion"],
    terenoTier: 3,
    anchorStatus: "active",
    hexisleCompatible: true,
    innovationNumber: 1553,
    ipLedgerHash: null,
    imageUrl: null,
    externalUrl: "/hexisle",
    createdAt: "2026-03-19T00:00:00Z",
    activatedAt: "2026-03-19T00:00:00Z",
  },
];

const SAMPLE_COMPAT: ManufacturingCompat[] = [
  { id: "c1", proteusId: "proto-hexisle", moduleType: "slip_casting", compatibilityLevel: "full", notes: "Primary production method. Proven at scale.", verifiedAt: "2026-03-19T00:00:00Z" },
  { id: "c2", proteusId: "proto-hexisle", moduleType: "sla", compatibilityLevel: "full", notes: "High-detail prototyping. Excellent for master molds.", verifiedAt: "2026-03-19T00:00:00Z" },
  { id: "c3", proteusId: "proto-hexisle", moduleType: "sls", compatibilityLevel: "full", notes: "Nylon variants for outdoor/travel sets.", verifiedAt: "2026-03-19T00:00:00Z" },
  { id: "c4", proteusId: "proto-hexisle", moduleType: "desktop_extrusion", compatibilityLevel: "partial", notes: "PLA/PETG variants. Layer lines visible but functional.", verifiedAt: "2026-03-19T00:00:00Z" },
  { id: "c5", proteusId: "proto-hexisle", moduleType: "injection_mold", compatibilityLevel: "experimental", notes: "High-volume future path. Requires tooling investment.", verifiedAt: null },
  { id: "c6", proteusId: "proto-hexisle", moduleType: "cnc", compatibilityLevel: "experimental", notes: "Wood/metal luxury editions. Not yet prototyped.", verifiedAt: null },
];

const SAMPLE_TRANSFORMATIONS: ProteusTransformation[] = [
  { id: "t1", proteusId: "proto-hexisle", title: "Genesis: From Chess Variant to Cooperative Product", description: "HexIsle began as a chess variant designed in 1989. Transformed into a cooperative manufacturing showcase.", transformationType: "market_pivot", beforeState: { form: "board game concept", year: 1989 }, afterState: { form: "cooperative manufacturing product", year: 2026 }, createdAt: "2026-01-01T00:00:00Z" },
  { id: "t2", proteusId: "proto-hexisle", title: "Material Expansion: Ceramic + Polymer", description: "Added SLA and desktop extrusion alongside original slip-casting.", transformationType: "process_upgrade", beforeState: { processes: ["slip_casting"] }, afterState: { processes: ["slip_casting", "sla", "sls", "desktop_extrusion"] }, createdAt: "2026-02-01T00:00:00Z" },
  { id: "t3", proteusId: "proto-hexisle", title: "Slotted Top Innovation", description: "Snap-fit accessories, stackable terrain, modular game scenarios.", transformationType: "design_revision", beforeState: { features: ["flat_top"] }, afterState: { features: ["flat_top", "slotted_top", "snap_fit", "stackable"] }, createdAt: "2026-03-01T00:00:00Z" },
];

// ============================================================================
// DB → CLIENT MAPPERS
// ============================================================================

function mapAnchor(row: any): ProteusAnchor {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    productType: row.product_type,
    manufacturingProcesses: row.manufacturing_processes || [],
    terenoTier: row.tereno_tier,
    anchorStatus: row.anchor_status,
    hexisleCompatible: row.hexisle_compatible,
    innovationNumber: row.innovation_number,
    ipLedgerHash: row.ip_ledger_hash,
    imageUrl: row.image_url,
    externalUrl: row.external_url,
    createdAt: row.created_at,
    activatedAt: row.activated_at,
  };
}

function mapCompat(row: any): ManufacturingCompat {
  return {
    id: row.id,
    proteusId: row.proteus_id,
    moduleType: row.module_type,
    compatibilityLevel: row.compatibility_level,
    notes: row.notes,
    verifiedAt: row.verified_at,
  };
}

function mapTransformation(row: any): ProteusTransformation {
  return {
    id: row.id,
    proteusId: row.proteus_id,
    title: row.title,
    description: row.description,
    transformationType: row.transformation_type,
    beforeState: row.before_state || {},
    afterState: row.after_state || {},
    createdAt: row.created_at,
  };
}

// ============================================================================
// READ FUNCTIONS
// ============================================================================

export async function fetchAnchors(): Promise<ProteusAnchor[]> {
  const { data, error } = await supabase
    .from("proteus_anchors")
    .select("*")
    .order("activated_at", { ascending: true, nullsFirst: false });

  if (error || !data || data.length === 0) {
    console.log("Using sample Proteus anchors");
    return SAMPLE_ANCHORS;
  }
  return data.map(mapAnchor);
}

export async function fetchAnchorBySlug(slug: string): Promise<ProteusAnchor | null> {
  const { data, error } = await supabase
    .from("proteus_anchors")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return SAMPLE_ANCHORS.find((a) => a.slug === slug) || null;
  }
  return mapAnchor(data);
}

export async function fetchCompatMatrix(proteusId: string): Promise<ManufacturingCompat[]> {
  const { data, error } = await supabase
    .from("proteus_manufacturing_compat")
    .select("*")
    .eq("proteus_id", proteusId)
    .order("compatibility_level");

  if (error || !data || data.length === 0) {
    return SAMPLE_COMPAT.filter((c) => c.proteusId === proteusId);
  }
  return data.map(mapCompat);
}

export async function fetchTransformations(proteusId: string): Promise<ProteusTransformation[]> {
  const { data, error } = await supabase
    .from("proteus_transformations")
    .select("*")
    .eq("proteus_id", proteusId)
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) {
    return SAMPLE_TRANSFORMATIONS.filter((t) => t.proteusId === proteusId);
  }
  return data.map(mapTransformation);
}

// ============================================================================
// COMPUTED HELPERS
// ============================================================================

export function getCompatColor(level: CompatLevel): string {
  switch (level) {
    case "full": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "partial": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "experimental": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  }
}

export function getTransformIcon(type: TransformationType): string {
  switch (type) {
    case "design_revision": return "🔧";
    case "material_change": return "🧪";
    case "process_upgrade": return "⚙️";
    case "scale_shift": return "📐";
    case "market_pivot": return "🔄";
  }
}

export const MODULE_DISPLAY_NAMES: Record<string, string> = {
  slip_casting: "Slip Casting",
  sla: "SLA Resin",
  sls: "SLS Nylon",
  desktop_extrusion: "Desktop Extrusion (FDM)",
  injection_mold: "Injection Molding",
  cnc: "CNC Machining",
  laser_cutting: "Laser Cutting",
  sand_casting: "Sand Casting",
};
