import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Piston areas by size (square inches)
const PISTON_AREAS: Record<string, number> = { S: 3.14, M: 7.07, L: 15.90, XL: 33.18 };

// Screw press mechanical advantage by handle length (inches)
const SCREW_MA: Record<number, number> = {
  6: 245,
  8: 327,
  10: 408,
};

const VACUUM_ASSIST_PSI = 7;

export interface CanisterMaterial {
  name: string;
  minPsi: number;
  maxPsi: number;
  category: 'casting' | 'marginal' | 'thermoplastic' | 'industrial';
}

export const MATERIALS: CanisterMaterial[] = [
  { name: 'Epoxy Resin', minPsi: 0, maxPsi: 15, category: 'casting' },
  { name: 'Polyurethane Resin', minPsi: 0, maxPsi: 30, category: 'casting' },
  { name: 'Casting Wax', minPsi: 5, maxPsi: 50, category: 'casting' },
  { name: 'Ceramic Slip', minPsi: 0, maxPsi: 10, category: 'casting' },
  { name: 'RTV Silicone', minPsi: 0, maxPsi: 20, category: 'casting' },
  { name: 'Low-Melt Alloy', minPsi: 5, maxPsi: 30, category: 'casting' },
  { name: 'Melted Salt', minPsi: 5, maxPsi: 20, category: 'casting' },
  { name: 'Hot Glue / EVA', minPsi: 30, maxPsi: 80, category: 'marginal' },
  { name: 'Polyethylene (LDPE)', minPsi: 500, maxPsi: 2000, category: 'thermoplastic' },
  { name: 'Polypropylene', minPsi: 1000, maxPsi: 3000, category: 'thermoplastic' },
  { name: 'ABS (high barrel temp)', minPsi: 3000, maxPsi: 5000, category: 'thermoplastic' },
  { name: 'Standard ABS', minPsi: 5000, maxPsi: 15000, category: 'thermoplastic' },
  { name: 'Nylon (heated)', minPsi: 3000, maxPsi: 8000, category: 'thermoplastic' },
  { name: 'Polycarbonate', minPsi: 10000, maxPsi: 20000, category: 'industrial' },
];

export type CanisterSize = 'S' | 'M' | 'L' | 'XL';
export type PressureMethod = 'gravity' | 'screw_press';
export type MaterialStatus = 'green' | 'yellow' | 'red';

export const SIZE_SPECS: Record<CanisterSize, { diameter: string; area: number; maxVolume: string; primaryMode: string; color: string }> = {
  S:  { diameter: '2" (50mm)', area: 3.14,  maxVolume: '25 cm³',   primaryMode: 'Screw Press', color: '#3b82f6' },
  M:  { diameter: '3" (76mm)', area: 7.07,  maxVolume: '100 cm³',  primaryMode: 'Gravity',     color: '#22c55e' },
  L:  { diameter: '4.5" (114mm)', area: 15.90, maxVolume: '400 cm³',  primaryMode: 'Gravity',     color: '#f59e0b' },
  XL: { diameter: '6.5" (165mm)', area: 33.18, maxVolume: '1200 cm³', primaryMode: 'Gravity',     color: '#a855f7' },
};

export function gravityPSI(weightKg: number, size: CanisterSize): number {
  const area = PISTON_AREAS[size] ?? PISTON_AREAS.M;
  return (weightKg * 2.205) / area + VACUUM_ASSIST_PSI;
}

export function screwPressPSI(forceLbs: number, handleInches: number, size: CanisterSize): number {
  const ma = SCREW_MA[handleInches] ?? SCREW_MA[8];
  const area = PISTON_AREAS[size] ?? PISTON_AREAS.S;
  return (forceLbs * ma) / area;
}

export function materialStatus(achievablePsi: number, material: CanisterMaterial): MaterialStatus {
  if (achievablePsi >= material.maxPsi) return 'green';
  if (achievablePsi >= material.minPsi) return 'yellow';
  return 'red';
}

export function usePressureCalculator(
  size: CanisterSize,
  method: PressureMethod,
  weightKg = 20,
  handleInches = 8,
  forceLbs = 30,
) {
  const psi = method === 'gravity'
    ? gravityPSI(weightKg, size)
    : screwPressPSI(forceLbs, handleInches, size);

  return { psi: Math.round(psi * 10) / 10, method, size };
}

export function useMaterialCompatibility(pressurePsi: number) {
  return MATERIALS.map(mat => ({
    ...mat,
    status: materialStatus(pressurePsi, mat),
  }));
}

export function useRecommendedSetup(targetMaterial: string) {
  const mat = MATERIALS.find(m => m.name === targetMaterial);
  if (!mat) return null;

  if (mat.category === 'casting' || mat.category === 'marginal') {
    return { size: 'M' as CanisterSize, method: 'gravity' as PressureMethod, handleInches: 8, reason: 'Gravity mode with M/L canisters ideal for casting materials' };
  }
  // Thermoplastic / industrial → S + screw press
  const neededPsi = mat.minPsi;
  let handle: number = 8;
  if (neededPsi > screwPressPSI(30, 8, 'S')) handle = 10;
  if (neededPsi <= screwPressPSI(30, 6, 'S')) handle = 6;

  return { size: 'S' as CanisterSize, method: 'screw_press' as PressureMethod, handleInches: handle, reason: `S + screw press needed for ${mat.name} (${mat.minPsi}–${mat.maxPsi} PSI)` };
}

export interface CanisterProduct {
  id: string;
  product_type: string;
  size: string;
  name: string;
  description: string | null;
  price_credits: number | null;
  price_usd: number;
  bom_cost: number;
  in_stock: boolean;
}

export function useCanisterProducts(size?: string, type?: string) {
  return useQuery({
    queryKey: ['canister-products', size, type],
    queryFn: async () => {
      let q = supabase.from('canister_products' as never).select('*');
      if (size) q = q.eq('size', size);
      if (type) q = q.eq('product_type', type);
      const { data, error } = q as { data: CanisterProduct[] | null; error: unknown };
      if (error) throw error;
      return (data ?? []) as CanisterProduct[];
    },
  });
}

export interface CanisterConfig {
  id: string;
  name: string;
  canister_size: CanisterSize;
  stack_count: number;
  pressure_method: PressureMethod;
  weight_kg: number | null;
  handle_length_inches: number;
  hand_force_lbs: number;
  materials_compatible: unknown;
  estimated_pressure_psi: number;
  total_cost_estimate: number;
  created_at: string;
}

export function useMyConfigurations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['canister-configs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase
        .from('canister_configurations' as never)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as { data: CanisterConfig[] | null; error: unknown });
      if (error) throw error;
      return (data ?? []) as CanisterConfig[];
    },
    enabled: !!user,
  });
}

export function useSaveConfiguration() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (config: {
      name: string;
      canister_size: CanisterSize;
      stack_count: number;
      pressure_method: PressureMethod;
      weight_kg?: number;
      handle_length_inches?: number;
      hand_force_lbs?: number;
      estimated_pressure_psi: number;
      materials_compatible: unknown;
      total_cost_estimate: number;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('canister_configurations' as never)
        .insert({ ...config, user_id: user.id } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['canister-configs'] });
    },
  });
}
