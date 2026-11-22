const IMAGE_BASE = 'https://image.tmdb.org/t/p';

/** Builds a poster/profile URL from a stored path; returns null when there is no image. */
export const imageUrl = (path, size = 'w500') => {
  if (!path) return null;
  if (/^(https?:|data:)/.test(path)) return path;
  return `${IMAGE_BASE}/${size}${path}`;
};
