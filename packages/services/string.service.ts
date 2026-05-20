export function includesIgnoreCase(a?: string, b?: string): boolean {
  if (a === undefined || a === null || b === undefined || b === null) {
    return false;
  }
  return a.toLowerCase().includes(b.toLowerCase());
}
