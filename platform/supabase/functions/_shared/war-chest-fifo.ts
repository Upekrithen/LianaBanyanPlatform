import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type FifoDeduction = { id: string; delta: number };

/**
 * FIFO: increase allocated_amount across funded mark_work_records until `amount` is covered.
 * Returns the first record touched (for source_work_record_id) and deltas for rollback.
 */
export async function deductEligibleMarksFifo(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
): Promise<{ firstRecordId: string; deductions: FifoDeduction[] }> {
  const target = round2(amount);
  if (target <= 0) {
    throw new Error("Amount must be positive");
  }

  const { data: rows, error } = await supabase
    .from("mark_work_records")
    .select("id, eligible_amount, allocated_amount, created_at")
    .eq("user_id", userId)
    .eq("is_funded", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!rows?.length) {
    throw new Error("Insufficient eligible marks");
  }

  let remaining = target;
  let firstRecordId = "";
  const deductions: FifoDeduction[] = [];

  for (const row of rows) {
    const eligible = round2(Number(row.eligible_amount));
    const allocated = round2(Number(row.allocated_amount));
    const available = round2(eligible - allocated);
    if (available <= 0) continue;

    const take = round2(Math.min(remaining, available));
    if (take <= 0) continue;

    if (!firstRecordId) firstRecordId = row.id;
    deductions.push({ id: row.id, delta: take });
    remaining = round2(remaining - take);
    if (remaining <= 0) break;
  }

  if (remaining > 0.001) {
    throw new Error("Insufficient eligible marks");
  }

  for (const d of deductions) {
    const row = rows.find((r) => r.id === d.id);
    if (!row) throw new Error("FIFO state error");
    const newAllocated = round2(Number(row.allocated_amount) + d.delta);
    const { error: upErr } = await supabase
      .from("mark_work_records")
      .update({
        allocated_amount: newAllocated,
        updated_at: new Date().toISOString(),
      })
      .eq("id", d.id);
    if (upErr) throw upErr;
  }

  return { firstRecordId, deductions };
}

export async function rollbackFifoDeductions(
  supabase: SupabaseClient,
  deductions: FifoDeduction[],
): Promise<void> {
  for (const d of deductions) {
    const { data: row, error: fetchErr } = await supabase
      .from("mark_work_records")
      .select("allocated_amount")
      .eq("id", d.id)
      .single();
    if (fetchErr || !row) throw fetchErr ?? new Error("Rollback fetch failed");
    const newAllocated = round2(Number(row.allocated_amount) - d.delta);
    const { error: upErr } = await supabase
      .from("mark_work_records")
      .update({
        allocated_amount: newAllocated,
        updated_at: new Date().toISOString(),
      })
      .eq("id", d.id);
    if (upErr) throw upErr;
  }
}
