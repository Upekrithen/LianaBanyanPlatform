/**
 * Modular Manufacturing Service — The Forge
 * ==========================================
 * Swappable stations. Expert operators. Continuous production.
 * Crew Call: "We Need You To Do What You're Already Good At"
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export type ModuleType = "slip_casting" | "sand_casting" | "sls" | "sla" | "injection_mold" | "desktop_extrusion" | "cnc" | "laser_cutting";
export type ModuleStatus = "active" | "inactive" | "maintenance";
export type CrewRole = "primary" | "secondary" | "backup";
export type ApplicationStatus = "applied" | "accepted" | "rejected" | "waitlisted";

export interface ManufacturingModule {
  id: string;
  moduleType: ModuleType;
  displayName: string;
  description: string;
  primaryOperatorUserId: string | null;
  secondaryOperatorUserId: string | null;
  backupOperatorUserId: string | null;
  capacityPerDay: number;
  currentQueue: number;
  processPioneerUserId: string | null;
  processPioneerName: string | null;
  status: ModuleStatus;
  location: string | null;
  createdAt: string;
}

export interface CrewApplication {
  id: string;
  userId: string;
  moduleId: string;
  roleRequested: CrewRole;
  experienceDescription: string;
  equipmentOwned: string | null;
  availability: string;
  status: ApplicationStatus;
  createdAt: string;
  reviewedAt: string | null;
}

// ============================================================================
// MODULE ICONS (Lucide icon names)
// ============================================================================

export const MODULE_ICONS: Record<ModuleType, string> = {
  slip_casting: "Droplets",
  sand_casting: "Mountain",
  sls: "Zap",
  sla: "Layers",
  injection_mold: "Box",
  desktop_extrusion: "Printer",
  cnc: "Cog",
  laser_cutting: "Scissors",
};

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const SAMPLE_MODULES: ManufacturingModule[] = [
  { id: "m1", moduleType: "slip_casting", displayName: "Slip Casting", description: "Ceramic slip casting for water-safe terrain tiles", primaryOperatorUserId: "u1", secondaryOperatorUserId: null, backupOperatorUserId: null, capacityPerDay: 40, currentQueue: 12, processPioneerUserId: null, processPioneerName: "CeramicMaster Kim", status: "active", location: "Boise, ID", createdAt: "2026-01-01" },
  { id: "m2", moduleType: "sla", displayName: "SLA — Stereolithography", description: "High-precision resin printing for Tereno Certified components", primaryOperatorUserId: "u1", secondaryOperatorUserId: "u2", backupOperatorUserId: null, capacityPerDay: 25, currentQueue: 8, processPioneerUserId: null, processPioneerName: "Founder", status: "active", location: "Boise, ID", createdAt: "2026-01-01" },
  { id: "m3", moduleType: "injection_mold", displayName: "Injection Molding", description: "Mass production plastics — requires tooling commitment", primaryOperatorUserId: null, secondaryOperatorUserId: null, backupOperatorUserId: null, capacityPerDay: 200, currentQueue: 0, processPioneerUserId: null, processPioneerName: null, status: "inactive", location: null, createdAt: "2026-01-01" },
  { id: "m4", moduleType: "desktop_extrusion", displayName: "Desktop Extrusion (FDM)", description: "Standard FDM 3D printing for prototypes and HexIsle Compatible pieces", primaryOperatorUserId: "u3", secondaryOperatorUserId: "u1", backupOperatorUserId: "u2", capacityPerDay: 50, currentQueue: 22, processPioneerUserId: null, processPioneerName: null, status: "active", location: "Portland, OR", createdAt: "2026-01-01" },
  { id: "m5", moduleType: "cnc", displayName: "CNC Machining", description: "Subtractive manufacturing for high-precision components", primaryOperatorUserId: null, secondaryOperatorUserId: null, backupOperatorUserId: null, capacityPerDay: 15, currentQueue: 0, processPioneerUserId: null, processPioneerName: null, status: "maintenance", location: "Denver, CO", createdAt: "2026-01-01" },
  { id: "m6", moduleType: "laser_cutting", displayName: "Laser Cutting", description: "Flat stock cutting for packaging, signage, and adapter rings", primaryOperatorUserId: "u1", secondaryOperatorUserId: null, backupOperatorUserId: null, capacityPerDay: 100, currentQueue: 5, processPioneerUserId: null, processPioneerName: "LaserPro Dan", status: "active", location: "Boise, ID", createdAt: "2026-01-01" },
  { id: "m7", moduleType: "sand_casting", displayName: "Sand Casting", description: "Traditional sand casting for metal terrain pieces", primaryOperatorUserId: null, secondaryOperatorUserId: null, backupOperatorUserId: null, capacityPerDay: 10, currentQueue: 0, processPioneerUserId: null, processPioneerName: null, status: "inactive", location: null, createdAt: "2026-01-01" },
  { id: "m8", moduleType: "sls", displayName: "SLS — Selective Laser Sintering", description: "Powder-bed fusion for complex geometries", primaryOperatorUserId: null, secondaryOperatorUserId: null, backupOperatorUserId: null, capacityPerDay: 20, currentQueue: 0, processPioneerUserId: null, processPioneerName: null, status: "inactive", location: null, createdAt: "2026-01-01" },
];

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

export async function fetchModules(): Promise<ManufacturingModule[]> {
  try {
    const { data, error } = await supabase
      .from("manufacturing_modules")
      .select("*")
      .order("display_name", { ascending: true });
    if (error || !data?.length) return SAMPLE_MODULES;
    return data.map(mapModule);
  } catch { return SAMPLE_MODULES; }
}

export async function fetchCrewApplications(): Promise<CrewApplication[]> {
  try {
    const { data, error } = await supabase
      .from("forge_crew_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data?.length) return [];
    return data.map(row => ({
      id: row.id, userId: row.user_id, moduleId: row.module_id,
      roleRequested: row.role_requested, experienceDescription: row.experience_description,
      equipmentOwned: row.equipment_owned, availability: row.availability,
      status: row.status, createdAt: row.created_at, reviewedAt: row.reviewed_at,
    }));
  } catch { return []; }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export async function applyForCrew(application: {
  userId: string; moduleId: string; roleRequested: CrewRole;
  experienceDescription: string; availability: string; equipmentOwned?: string;
}): Promise<CrewApplication | null> {
  try {
    const { data, error } = await supabase.from("forge_crew_applications").insert({
      user_id: application.userId,
      module_id: application.moduleId,
      role_requested: application.roleRequested,
      experience_description: application.experienceDescription,
      availability: application.availability,
      equipment_owned: application.equipmentOwned || null,
    }).select().single();
    if (error || !data) return null;
    return mapApplication(data);
  } catch { return null; }
}

export async function reviewCrewApplication(
  applicationId: string,
  status: "accepted" | "rejected" | "waitlisted",
): Promise<boolean> {
  try {
    const { error } = await supabase.from("forge_crew_applications").update({
      status,
      reviewed_at: new Date().toISOString(),
    }).eq("id", applicationId);
    return !error;
  } catch { return false; }
}

export async function updateModuleStatus(moduleId: string, status: ModuleStatus): Promise<boolean> {
  try {
    const { error } = await supabase.from("manufacturing_modules").update({ status }).eq("id", moduleId);
    return !error;
  } catch { return false; }
}

// ============================================================================
// STATS
// ============================================================================

export async function fetchForgeStats(): Promise<{
  activeStations: number; totalCapacity: number; totalQueue: number; pioneers: number;
}> {
  try {
    const { data, error } = await supabase
      .from("manufacturing_modules")
      .select("status, capacity_per_day, current_queue, process_pioneer_name");
    if (error || !data?.length) {
      return { activeStations: 4, totalCapacity: 215, totalQueue: 47, pioneers: 2 };
    }
    const active = data.filter(m => m.status === "active");
    return {
      activeStations: active.length,
      totalCapacity: active.reduce((sum, m) => sum + (m.capacity_per_day || 0), 0),
      totalQueue: data.reduce((sum, m) => sum + (m.current_queue || 0), 0),
      pioneers: data.filter(m => m.process_pioneer_name).length,
    };
  } catch {
    return { activeStations: 4, totalCapacity: 215, totalQueue: 47, pioneers: 2 };
  }
}

// ============================================================================
// MAPPERS
// ============================================================================

function mapApplication(row: any): CrewApplication {
  return {
    id: row.id, userId: row.user_id, moduleId: row.module_id,
    roleRequested: row.role_requested, experienceDescription: row.experience_description,
    equipmentOwned: row.equipment_owned, availability: row.availability,
    status: row.status, createdAt: row.created_at, reviewedAt: row.reviewed_at,
  };
}

function mapModule(row: any): ManufacturingModule {
  return {
    id: row.id, moduleType: row.module_type, displayName: row.display_name,
    description: row.description, primaryOperatorUserId: row.primary_operator_user_id,
    secondaryOperatorUserId: row.secondary_operator_user_id,
    backupOperatorUserId: row.backup_operator_user_id,
    capacityPerDay: row.capacity_per_day, currentQueue: row.current_queue,
    processPioneerUserId: row.process_pioneer_user_id,
    processPioneerName: row.process_pioneer_name,
    status: row.status, location: row.location, createdAt: row.created_at,
  };
}
