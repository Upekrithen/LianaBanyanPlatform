/**
 * Congress.gov bill number normalization utility.
 * Converts display formats ("HR-2024", "S-3456") into API-ready components.
 */

export interface ParsedBill {
  congress: number;
  billType: string;
  billNumber: number;
  display: string;
}

const CURRENT_CONGRESS = 119;

const BILL_TYPE_MAP: Record<string, string> = {
  hr: 'hr',
  s: 's',
  hjres: 'hjres',
  sjres: 'sjres',
  hconres: 'hconres',
  sconres: 'sconres',
  hres: 'hres',
  sres: 'sres',
};

export function normalizeBillNumber(billNumber: string, congress?: number): ParsedBill {
  const cleaned = billNumber.replace(/[\s\-\.]+/g, '').toLowerCase();
  const match = cleaned.match(/^([a-z]+)(\d+)$/);
  if (!match) {
    return { congress: congress || CURRENT_CONGRESS, billType: 'hr', billNumber: 0, display: billNumber };
  }
  const rawType = match[1];
  const num = parseInt(match[2], 10);
  const billType = BILL_TYPE_MAP[rawType] || rawType;
  const c = congress || CURRENT_CONGRESS;
  return {
    congress: c,
    billType,
    billNumber: num,
    display: `${billType.toUpperCase()}-${num}`,
  };
}

export function formatBillDisplay(billType: string, billNumber: number): string {
  return `${(billType || '').toUpperCase()}-${billNumber}`;
}
