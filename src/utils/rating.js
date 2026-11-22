/** Convert a 10-point community score to a 5-star scale. */
export const toFiveStar = (voteAverage) => {
  const value = Number(voteAverage) || 0;
  return Math.min(5, Math.max(0, value / 2));
};

/**
 * Weighted average that folds the current user's rating into the community
 * score: (base * votes + user) / (votes + 1).
 */
export const computeAverage = (voteAverage, voteCount, userRating) => {
  const base = toFiveStar(voteAverage);
  const votes = Math.max(0, Number(voteCount) || 0);
  if (!userRating) return { average: base, count: votes };
  return { average: (base * votes + userRating) / (votes + 1), count: votes + 1 };
};

export const formatRating = (value) => (value > 0 ? value.toFixed(1) : '—');

export const formatCount = (count) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(count || 0);
