import { GENRES, MOVIES } from '../data/movies';
import { getYear } from '../utils/format';

const PAGE_SIZE = 12;
const LATENCY_MS = 350;
const API = '/.netlify/functions/tmdb';

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

const genreById = new Map(GENRES.map((g) => [g.id, g]));

export const GENRE_NAMES = new Map(GENRES.map((g) => [g.id, g.name]));

/** Calls the Netlify proxy (which holds the TMDB key). Throws if the live API is unreachable. */
async function tmdb(path, params = {}, signal) {
  const url = new URL(API, window.location.origin);
  url.searchParams.set('path', path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`TMDB request failed (${res.status})`);
  const data = await res.json();
  if (typeof data !== 'object' || data === null || data.success === false) {
    throw new Error('Unexpected TMDB response');
  }
  return data;
}

const isAbort = (error) => error?.name === 'AbortError';

const mapListItem = (m) => ({
  id: m.id,
  title: m.title,
  overview: m.overview || '',
  posterPath: m.poster_path,
  releaseDate: m.release_date || '',
  genreIds: m.genre_ids || [],
  voteAverage: m.vote_average || 0,
  voteCount: m.vote_count || 0,
});

/** Live TMDB: popular titles, or title search; genre/year are sent to TMDB when browsing. */
async function fetchMoviesLive({ query, genreId, year, page }, signal) {
  const q = (query || '').trim();
  const data = q
    ? await tmdb('/search/movie', { query: q, page, year: year || undefined, include_adult: 'false' }, signal)
    : await tmdb(
        '/discover/movie',
        {
          page,
          sort_by: 'popularity.desc',
          'vote_count.gte': 200,
          with_genres: genreId || undefined,
          primary_release_year: year || undefined,
          include_adult: 'false',
        },
        signal,
      );
  return {
    results: data.results.map(mapListItem),
    page: data.page,
    totalPages: Math.max(1, Math.min(data.total_pages || 1, 500)),
    totalResults: data.total_results || 0,
  };
}

async function fetchMoviesLocal({ query, genreId, year, page = 1 }, signal) {
  await wait(LATENCY_MS, signal);
  const q = (query || '').trim().toLowerCase();

  const filtered = MOVIES.filter((movie) => {
    if (q && !movie.title.toLowerCase().includes(q)) return false;
    if (genreId && !movie.genreIds.includes(Number(genreId))) return false;
    if (year && getYear(movie.releaseDate) !== Number(year)) return false;
    return true;
  });

  if (q) {
    // Titles that start with the query rank first (stable sort keeps the rest in order).
    filtered.sort(
      (a, b) =>
        Number(b.title.toLowerCase().startsWith(q)) - Number(a.title.toLowerCase().startsWith(q)),
    );
  }

  const start = (page - 1) * PAGE_SIZE;
  return {
    results: filtered.slice(start, start + PAGE_SIZE),
    page,
    totalPages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
    totalResults: filtered.length,
  };
}

/** Search + genre/year filtering with paging. Rating is filtered by the caller (it depends on user votes). */
export async function fetchMovies(params, signal) {
  const page = params.page || 1;
  try {
    return await fetchMoviesLive({ ...params, page }, signal);
  } catch (error) {
    if (isAbort(error)) throw error;
    // Live API unreachable (offline, local dev without functions, blocked): use the built-in list.
    return fetchMoviesLocal({ ...params, page }, signal);
  }
}

async function fetchDetailsLive(id, signal) {
  const m = await tmdb(`/movie/${Number(id)}`, { append_to_response: 'credits' }, signal);
  return {
    id: m.id,
    title: m.title,
    tagline: m.tagline || '',
    overview: m.overview || '',
    posterPath: m.poster_path,
    backdropPath: m.backdrop_path,
    releaseDate: m.release_date || '',
    runtime: m.runtime || 0,
    genreIds: (m.genres || []).map((g) => g.id),
    genres: m.genres || [],
    voteAverage: m.vote_average || 0,
    voteCount: m.vote_count || 0,
    language: m.original_language,
    status: m.status,
    cast: (m.credits?.cast || []).slice(0, 12).map((p) => ({
      id: p.credit_id || `${m.id}-${p.id}`,
      name: p.name,
      character: p.character,
      profilePath: p.profile_path,
    })),
    castUnavailable: false,
  };
}

async function fetchDetailsLocal(id, signal) {
  await wait(LATENCY_MS / 2, signal);
  const movie = MOVIES.find((m) => m.id === Number(id));
  if (!movie) throw new Error('Movie not found.');
  return {
    ...movie,
    backdropPath: null,
    genres: movie.genreIds.map((gid) => genreById.get(gid)).filter(Boolean),
    cast: movie.cast.map((person, index) => ({ ...person, id: `${movie.id}-${index}` })),
    castUnavailable: false,
  };
}

export async function fetchMovieDetails(id, signal) {
  try {
    return await fetchDetailsLive(id, signal);
  } catch (error) {
    if (isAbort(error)) throw error;
    return fetchDetailsLocal(id, signal);
  }
}

export { GENRES };

// TMDB covers every release year, so offer a fixed range (newest first).
const THIS_YEAR = new Date().getFullYear();
export const YEARS = Array.from({ length: THIS_YEAR - 1949 }, (_, i) => THIS_YEAR - i);
