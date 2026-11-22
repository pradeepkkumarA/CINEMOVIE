import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchMovies } from '../services/movieService';
import { useRatings } from '../context/RatingsContext';
import { useDecorateMovie } from './useDecorateMovie';

const INITIAL_STATE = {
  items: [],
  page: 0,
  totalPages: 0,
  totalResults: 0,
  status: 'loading', // 'loading' | 'loadingMore' | 'ready' | 'error'
  error: null,
};

// When the rating filter hides every result of a page, fetch a few more pages automatically.
const MAX_AUTO_PAGES = 4;

/**
 * Loads movies from the catalogue service, handles paging, and applies the
 * final genre / year / rating filters against the rating that includes the user's vote.
 */
export function useMovieCatalog({ query, genreId, year, minRating }) {
  const { ratings } = useRatings();
  const decorate = useDecorateMovie();
  const [state, setState] = useState(INITIAL_STATE);
  const requestIdRef = useRef(0);
  const controllerRef = useRef(null);
  const autoPagesRef = useRef(0);

  const load = useCallback(
    async (page) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const requestId = ++requestIdRef.current;

      setState((prev) => ({
        ...prev,
        status: page === 1 ? 'loading' : 'loadingMore',
        error: null,
      }));

      try {
        const data = await fetchMovies(
          { query, genreId: genreId || undefined, year: year || undefined, minRating, page },
          controller.signal,
        );
        if (requestId !== requestIdRef.current) return;

        setState((prev) => {
          const base = page === 1 ? [] : prev.items;
          const seen = new Set(base.map((m) => m.id));
          const fresh = data.results.filter((m) => !seen.has(m.id));
          return {
            items: [...base, ...fresh],
            page: data.page,
            totalPages: data.totalPages,
            totalResults: data.totalResults,
            status: 'ready',
            error: null,
          };
        });
      } catch (error) {
        if (error?.name === 'AbortError' || requestId !== requestIdRef.current) return;
        setState((prev) => ({ ...prev, status: 'error', error }));
      }
    },
    [query, genreId, year, minRating],
  );

  useEffect(() => {
    autoPagesRef.current = 0;
    load(1);
    return () => controllerRef.current?.abort();
  }, [load]);

  const movies = useMemo(() => {
    const genre = Number(genreId) || 0;
    const releaseYear = Number(year) || 0;
    return state.items
      .map((movie) => decorate(movie, ratings[movie.id] || 0))
      .filter(
        (movie) =>
          (!genre || movie.genreIds.includes(genre)) &&
          (!releaseYear || movie.year === releaseYear) &&
          (!minRating || movie.average >= minRating),
      );
  }, [state.items, ratings, decorate, genreId, year, minRating]);

  const hasMore = state.status !== 'error' && state.page > 0 && state.page < state.totalPages;

  const loadMore = useCallback(() => {
    if (state.status === 'ready' && hasMore) load(state.page + 1);
  }, [state.status, state.page, hasMore, load]);

  useEffect(() => {
    if (
      state.status === 'ready' &&
      movies.length === 0 &&
      hasMore &&
      autoPagesRef.current < MAX_AUTO_PAGES
    ) {
      autoPagesRef.current += 1;
      load(state.page + 1);
    }
  }, [state.status, state.page, movies.length, hasMore, load]);

  const retry = useCallback(() => load(1), [load]);

  return {
    movies,
    status: state.status,
    error: state.error,
    isInitialLoading: state.status === 'loading' && state.items.length === 0,
    isRefreshing: state.status === 'loading' && state.items.length > 0,
    isLoadingMore: state.status === 'loadingMore',
    hasMore,
    loadMore,
    retry,
  };
}
