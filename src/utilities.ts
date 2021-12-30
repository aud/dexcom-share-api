export function extractNumber(str: string): number | null {
  const match = str.match(/\d+/g);
  return match ? parseInt(match[0]) : null;
}

// http://www.bcchildrens.ca/endocrinology-diabetes-site/documents/glucoseunits.pdf
// [BG (mmol/L) * 18] = BG (mg/dL)
//
// Return the normalized mmol/L
export function mgdlToMmol(mgdl: number): number {
  return +(mgdl / 18).toFixed(2);
}
