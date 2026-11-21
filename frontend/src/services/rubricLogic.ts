/**
 * Pure domain logic for Rubric & Case Quality Evaluation (BE-033 / OPD-011).
 * Completely dependency-free for high-speed node testing and UI components.
 */

/**
 * Calculates the average score from a list of criteria.
 * Returns 0 if criteria list is empty.
 */
export function calculateAverageScore(criteria: Array<{ score: number }>): number {
  if (!criteria || criteria.length === 0) return 0;
  const sum = criteria.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const avg = sum / criteria.length;
  return Math.round(avg * 10) / 10;
}

/**
 * Validates a criterion name against a list of existing criteria names.
 * Returns null if valid, or an error key if invalid.
 */
export function validateCriterion(
  name: string,
  existingNames: string[],
  currentIndex?: number,
): "EMPTY" | "DUPLICATE" | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return "EMPTY";
  }
  const isDuplicate = existingNames.some((n, idx) => {
    if (currentIndex !== undefined && idx === currentIndex) return false;
    return n.trim().toLowerCase() === trimmed.toLowerCase();
  });
  if (isDuplicate) {
    return "DUPLICATE";
  }
  return null;
}

