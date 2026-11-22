import { useRef } from 'react';
import { Loader2, Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, isSearching }) {
  const inputRef = useRef(null);

  const clear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="group relative w-full">
      <label htmlFor="movie-search" className="sr-only">
        Search movies by title
      </label>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-white/40 transition-all duration-300 ease-[var(--ease-spring)] group-focus-within:scale-110 group-focus-within:text-gold"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id="movie-search"
        type="search"
        inputMode="search"
        autoComplete="off"
        spellCheck="false"
        placeholder="Search movies by title…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && value && clear()}
        className="glass-field h-11 w-full rounded-full pl-10 pr-20 text-[15px] text-white placeholder:text-white/40 [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {isSearching && (
          <Loader2 className="h-4 w-4 animate-spin text-white/40" aria-label="Searching" />
        )}
        {value && (
          <button
            type="button"
            onClick={clear}
            className="animate-star-pop rounded-full p-1.5 text-white/50 transition duration-300 hover:rotate-90 hover:bg-white/10 hover:text-white active:scale-75 focus-visible:outline-2 focus-visible:outline-gold"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
