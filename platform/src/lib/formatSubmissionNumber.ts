export function formatSubmissionNumber(n: number): string {
  return n.toString().padStart(8, '0');
}
