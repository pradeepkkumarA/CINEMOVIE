import { GENRES, MOVIES } from '../data/movies';
import { getYear } from '../utils/format';

const PAGE_SIZE = 12;
const LATENCY_MS = 350;

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

/** Search + genre/year filtering with paging. Rating is filtered by the caller (it depends on user votes). */
export async function fetchMovies({ query, genreId, year, page = 1 }, signal) {
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

export async function fetchMovieDetails(id, signal) {
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

export { GENRES };

export const YEARS = [...new Set(MOVIES.map((m) => getYear(m.releaseDate)))]
  .filter(Boolean)
  .sort((a, b) => b - a);
