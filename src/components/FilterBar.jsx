import { useId, useState } from 'react';
import { ChevronDown, RotateCcw, SlidersHorizontal, Star } from 'lucide-react';

const RATING_OPTIONS = [0, 1, 2, 3, 4, 5];

function SelectField({ id, label, value, onChange, children }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-white/45">
        {label}
      </label>
      <div className="group relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="glass-field h-11 w-full cursor-pointer appearance-none truncate rounded-xl pl-3.5 pr-9 text-sm text-white"
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 transition-transform duration-300 group-focus-within:rotate-180 group-focus-within:text-gold"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default function FilterBar({ filters, onChange, onReset, genres, years, activeCount }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const genreId = useId();
  const yearId = useId();

  const yearOptions =
    filters.year && !years.includes(Number(filters.year))
      ? [Number(filters.year), ...years]
      : years;

  return (
    <section aria-label="Filters" className="glass relative z-10 rounded-3xl p-3 sm:p-4">
      {/* Mobile toggle */}
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-medium text-white/85 transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-gold"
        >
          <SlidersHorizontal className="h-4 w-4 text-gold" aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-gold px-1.5 text-xs font-bold text-ink-950">
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </button>
        )}
      </div>

      <div
        id={panelId}
        className={`${open ? 'animate-drop-in mt-3 grid' : 'hidden'} grid-cols-1 gap-3 sm:mt-0 sm:grid sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end`}
      >
        <SelectField
          id={genreId}
          label="Genre"
          value={filters.genreId}
          onChange={(v) => onChange({ genreId: v })}
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g.id} value={String(g.id)}>
              {g.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          id={yearId}
          label="Release year"
          value={filters.year}
          onChange={(v) => onChange({ year: v })}
        >
          <option value="">Any year</option>
          {yearOptions.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </SelectField>

        <fieldset className="flex min-w-0 flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
          <legend className="mb-1.5 text-xs font-medium uppercase tracking-wider text-white/45">
            Minimum rating
          </legend>
          <div className="glass-field relative grid grid-cols-6 gap-1 rounded-xl p-1">
            {/* Liquid pill that springs to the selected option */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-1 top-1 rounded-lg bg-gradient-to-b from-[#ffd84a] to-gold shadow-[0_6px_20px_-4px_rgba(245,197,24,0.7),inset_0_1px_0_rgba(255,255,255,0.6)] transition-[left] duration-500 ease-[var(--ease-spring)]"
              style={{
                width: 'calc((100% - 1.75rem) / 6)',
                left: `calc(0.25rem + ${RATING_OPTIONS.indexOf(filters.minRating)} * ((100% - 1.75rem) / 6 + 0.25rem))`,
              }}
            />
            {RATING_OPTIONS.map((n) => {
              const active = filters.minRating === n;
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={active}
                  aria-label={n ? `${n} stars and up` : 'Any rating'}
                  onClick={() => onChange({ minRating: n })}
                  className={`relative z-[1] flex h-9 items-center justify-center gap-0.5 rounded-lg px-2 text-sm font-medium transition duration-300 active:scale-90 focus-visible:outline-2 focus-visible:outline-gold lg:px-2.5 ${
                    active ? 'text-ink-950' : 'text-white/65 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {n ? (
                    <>
                      {n}
                      <Star className="h-3 w-3" fill="currentColor" strokeWidth={0} aria-hidden="true" />
                    </>
                  ) : (
                    'Any'
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={onReset}
          disabled={activeCount === 0}
          data-ripple
          className="glass-field sheen group/reset relative hidden h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-white/80 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-2 sm:flex lg:col-span-1"
        >
          <RotateCcw
            className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-spring)] group-hover/reset:-rotate-180"
            aria-hidden="true"
          />
          Reset filters
        </button>
      </div>
    </section>
  );
}
