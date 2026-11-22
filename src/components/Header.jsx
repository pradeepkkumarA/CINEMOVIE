import { Film, Star } from 'lucide-react';
import SearchBar from './SearchBar';
import { useRatings } from '../context/RatingsContext';

export default function Header({ query, onQueryChange, isSearching, onHome }) {
  const { ratedCount } = useRatings();

  return (
    <header className="glass sticky top-0 z-40 rounded-none bg-ink-950/40">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:gap-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onHome}
          className="group flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          aria-label="CineRate home, reset search and filters"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffe066] to-gold text-ink-950 shadow-[0_0_24px_rgba(245,197,24,0.4),inset_0_1px_0_rgba(255,255,255,0.7)] transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-12 group-hover:scale-110 group-active:scale-90">
            <Film className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Cine<span className="text-gold">Rate</span>
          </span>
        </button>

        {ratedCount > 0 && (
          <span
            key={ratedCount}
            className="glass-chip animate-star-pop ml-auto flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-white/80 sm:order-last sm:ml-0"
            title="Movies you have rated"
          >
            <Star className="h-3.5 w-3.5 text-gold" fill="currentColor" strokeWidth={0} aria-hidden="true" />
            {ratedCount} rated
          </span>
        )}

        <div className="w-full sm:ml-auto sm:max-w-md">
          <SearchBar value={query} onChange={onQueryChange} isSearching={isSearching} />
        </div>
      </div>
    </header>
  );
}
