import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cinerate:user-ratings:v1';
const RatingsContext = createContext(null);

const isValidRating = (value) => Number.isInteger(value) && value >= 1 && value <= 5;

function readStoredRatings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    // Drop anything malformed so a corrupted entry can never break rendering.
    return Object.fromEntries(Object.entries(parsed).filter(([, v]) => isValidRating(v)));
  } catch {
    return {};
  }
}

export function RatingsProvider({ children }) {
  const [ratings, setRatings] = useState(readStoredRatings);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
    } catch {
      // Storage may be full or disabled (private mode); ratings still work for this session.
    }
  }, [ratings]);

  // Keep multiple open tabs in sync.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) setRatings(readStoredRatings());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setRating = useCallback((movieId, value) => {
    if (!isValidRating(value)) return;
    setRatings((prev) => ({ ...prev, [movieId]: value }));
  }, []);

  const removeRating = useCallback((movieId) => {
    setRatings((prev) => {
      if (!(movieId in prev)) return prev;
      const next = { ...prev };
      delete next[movieId];
      return next;
    });
  }, []);

  const getRating = useCallback((movieId) => ratings[movieId] || 0, [ratings]);

  const value = useMemo(
    () => ({ ratings, getRating, setRating, removeRating, ratedCount: Object.keys(ratings).length }),
    [ratings, getRating, setRating, removeRating],
  );

  return <RatingsContext.Provider value={value}>{children}</RatingsContext.Provider>;
}

export function useRatings() {
  const ctx = useContext(RatingsContext);
  if (!ctx) throw new Error('useRatings must be used inside <RatingsProvider>');
  return ctx;
}
