import { useCallback, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import AmbientBackground from './components/AmbientBackground';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import MovieGrid from './components/MovieGrid';
import MovieDetailsModal from './components/MovieDetailsModal';
import ErrorBoundary from './components/ErrorBoundary';
import { useDebounce } from './hooks/useDebounce';
import { useMovieCatalog } from './hooks/useMovieCatalog';
import { GENRES, GENRE_NAMES, YEARS } from './services/movieService';

const DEFAULT_FILTERS = { genreId: '', year: '', minRating: 0 };

export default function App() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selected, setSelected] = useState(null);

  const debouncedQuery = useDebounce(query.trim(), 400);
  const catalog = useMovieCatalog({ query: debouncedQuery, ...filters });

  const updateFilters = useCallback((patch) => setFilters((prev) => ({ ...prev, ...patch })), []);
  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);
  const clearAll = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setQuery('');
  }, []);
  const closeModal = useCallback(() => setSelected(null), []);

  const activeCount =
    Number(Boolean(filters.genreId)) + Number(Boolean(filters.year)) + Number(filters.minRating > 0);

  const heading = useMemo(() => {
    if (debouncedQuery) return `Results for “${debouncedQuery}”`;
    const parts = [];
    if (filters.genreId) parts.push(GENRE_NAMES.get(Number(filters.genreId)) || 'Genre');
    if (filters.year) parts.push(filters.year);
    if (parts.length || filters.minRating) {
      return `${parts.join(' · ') || 'Movies'}${filters.minRating ? ` · ${filters.minRating}★+` : ''}`;
    }
    return 'Featured movies';
  }, [debouncedQuery, filters]);

  const isTyping = query.trim() !== debouncedQuery;

  return (
    <div className="flex min-h-dvh flex-col">
      <AmbientBackground />
      <Header
        query={query}
        onQueryChange={setQuery}
        isSearching={isTyping || catalog.isRefreshing}
        onHome={clearAll}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <FilterBar
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
            genres={GENRES}
            years={YEARS}
            activeCount={activeCount}
          />
        </div>

        <div className="mb-4 flex items-baseline justify-between gap-4 sm:mb-6">
          <h1 className="font-display truncate text-xl font-semibold text-white sm:text-2xl">{heading}</h1>
          <p className="flex shrink-0 items-center gap-2 text-sm text-white/45" aria-live="polite">
            {catalog.isRefreshing && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {catalog.status === 'ready' && `${catalog.movies.length} shown`}
          </p>
        </div>

        <ErrorBoundary onReset={clearAll}>
          <MovieGrid
            catalog={catalog}
            onSelect={setSelected}
            onClearAll={clearAll}
            hasActiveCriteria={Boolean(query.trim()) || activeCount > 0}
          />
        </ErrorBoundary>
      </main>

      <footer className="glass relative rounded-none py-6 text-center text-xs text-white/40">
        <p className="px-4">
          Poster images courtesy of{' '}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/55 underline underline-offset-2 hover:text-gold"
          >
            TMDB
          </a>
          . Your ratings are saved in this browser.
        </p>
      </footer>

      <MovieDetailsModal movie={selected} onClose={closeModal} />
    </div>
  );
}
