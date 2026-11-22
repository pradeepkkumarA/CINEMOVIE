import { AlertTriangle, Loader2, RefreshCw, SearchX } from 'lucide-react';
import MovieCard from './MovieCard';
import SkeletonCard from './SkeletonCard';

const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5';

function StateMessage({ icon: Icon, title, children, action }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center sm:py-24">
      <div className="glass animate-star-pop relative mb-5 rounded-2xl p-4">
        <Icon className="h-8 w-8 text-gold" aria-hidden="true" />
      </div>
      <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/55">{children}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

const buttonClass =
  'sheen relative inline-flex h-11 items-center gap-2 rounded-full bg-gold px-6 text-sm font-semibold text-ink-950 shadow-[0_8px_30px_-6px_rgba(245,197,24,0.55)] transition duration-300 ease-[var(--ease-spring)] hover:scale-105 hover:brightness-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-60';

export default function MovieGrid({ catalog, onSelect, onClearAll, hasActiveCriteria }) {
  const { movies, status, error, isInitialLoading, isRefreshing, isLoadingMore, hasMore, loadMore, retry } =
    catalog;

  if (isInitialLoading) {
    return (
      <div className={GRID} aria-busy="true" aria-label="Loading movies">
        {Array.from({ length: 10 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <StateMessage
        icon={AlertTriangle}
        title="Something went wrong"
        action={
          <button type="button" data-ripple onClick={retry} className={buttonClass}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
          </button>
        }
      >
        {error?.message || 'We could not load movies right now.'}
      </StateMessage>
    );
  }

  if (movies.length === 0 && status === 'ready' && !hasMore) {
    return (
      <StateMessage
        icon={SearchX}
        title="No movies match"
        action={
          hasActiveCriteria && (
            <button type="button" data-ripple onClick={onClearAll} className={buttonClass}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Clear search & filters
            </button>
          )
        }
      >
        Try a different title, widen the release year, or lower the minimum rating.
      </StateMessage>
    );
  }

  return (
    <div>
      <ul
        className={`${GRID} transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}
        aria-busy={isRefreshing || isLoadingMore}
      >
        {movies.map((movie, index) => (
          <li key={movie.id} className="min-w-0">
            <MovieCard movie={movie} onSelect={onSelect} index={index} />
          </li>
        ))}
        {isLoadingMore &&
          Array.from({ length: 5 }, (_, i) => (
            <li key={`sk-${i}`} className="min-w-0">
              <SkeletonCard />
            </li>
          ))}
      </ul>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore || isRefreshing}
            data-ripple
            className="glass sheen relative inline-flex h-12 items-center gap-2 rounded-full px-8 text-sm font-semibold text-white transition duration-300 ease-[var(--ease-spring)] hover:scale-105 hover:text-gold active:scale-95 focus-visible:outline-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-60"
          >
            {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
