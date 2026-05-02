export function today(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

export function fmt(n: number, decimals: number = 2): string {
  return n.toFixed(decimals);
}

export function fmtMT(n: number): string {
  return n.toFixed(2) + ' MT';
}



