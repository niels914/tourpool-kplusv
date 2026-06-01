// TypeScript mirror van de PostgreSQL scoring functies

export const STAGE_FINISH_POINTS: number[] = [0, 15, 10, 8, 7, 6, 5, 4, 3, 2, 1];

export const JERSEY_POINTS: Record<string, number[]> = {
  gc_standing:       [0, 5, 3, 1],
  mountain_standing: [0, 3, 2, 1],
  sprint_standing:   [0, 3, 2, 1],
  white_standing:    [0, 3, 2, 1],
};

export const FINAL_BONUS_POINTS: Record<string, number[]> = {
  final_gc:       [0, 40, 30, 22, 16, 12, 10, 8, 6, 4, 2],
  final_mountain: [0, 12, 8, 6, 4, 2],
  final_sprint:   [0, 12, 8, 6, 4, 2],
  final_white:    [0, 12, 8, 6, 4, 2],
};

export const JERSEY_LABELS: Record<string, string> = {
  gc_standing:       "Geel",
  mountain_standing: "Bolletjes",
  sprint_standing:   "Groen",
  white_standing:    "Wit",
  final_gc:          "Eindklassement",
  final_mountain:    "Bergklassement",
  final_sprint:      "Puntenklassement",
  final_white:       "Jongerenklassement",
};

export function stageFinishPoints(position: number): number {
  return STAGE_FINISH_POINTS[position] ?? 0;
}

export function jerseyPoints(resultType: string, position: number): number {
  return (JERSEY_POINTS[resultType] ?? [])[position] ?? 0;
}

export function finalBonusPoints(resultType: string, position: number): number {
  return (FINAL_BONUS_POINTS[resultType] ?? [])[position] ?? 0;
}

export function weightedPoints(rawPoints: number, pickCount: number): number {
  if (pickCount <= 0) return 0;
  return rawPoints / Math.sqrt(pickCount);
}

export function formatPoints(points: number): string {
  return points % 1 === 0 ? points.toString() : points.toFixed(2);
}
