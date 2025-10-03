/**
 * Generate consistent colors for regime visualization
 * @param k Number of regimes
 * @returns Array of HSL color strings
 */
export function generateRegimeColors(k: number): string[] {
  return Array.from({ length: k }, (_, i) => `hsl(${(i * 360) / k}, 85%, 55%)`)
}
