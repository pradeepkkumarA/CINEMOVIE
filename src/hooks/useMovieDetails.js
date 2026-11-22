import { useCallback, useEffect, useState } from 'react';
import { fetchMovieDetails } from '../services/movieService';

/** Loads full details + cast for one movie. */
export function useMovieDetails(movieId) {
  const [state, setState] = useState({ status: 'idle', data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!movieId) {
      setState({ status: 'idle', data: null, error: null });
      return undefined;
    }
    const controller = new AbortController();
    setState({ status: 'loading', data: null, error: null });

    fetchMovieDetails(movieId, controller.signal)
      .then((data) => setState({ status: 'ready', data, error: null }))
      .catch((error) => {
        if (error?.name !== 'AbortError') setState({ status: 'error', data: null, error });
      });

    return () => controller.abort();
  }, [movieId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}
