import { memo, useCallback, useRef } from 'react';
import { Star } from 'lucide-react';
import PosterImage from './PosterImage';
import { StarDisplay } from './StarRating';
import { formatRating } from '../utils/rating';

const MAX_TILT = 9; // degrees
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function MovieCard({ movie, onSelect, index = 0 }) {
  const { title, year, genreNames, average, userRating, posterPath } = movie;
  const ref = useRef(null);
  const frame = useRef(0);

  // Pointer-driven 3D tilt + glare. Writes CSS vars directly to avoid re-rendering.
  const handlePointerMove = useCallback((event) => {
    if (event.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      el.dataset.tilting = 'true';
      el.style.setProperty('--ry', `${(px - 0.5) * MAX_TILT * 2}deg`);
      el.style.setProperty('--rx', `${(0.5 - py) * MAX_TILT * 2}deg`);
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      el.style.setProperty('--lift', '-6px');
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.dataset.tilting = 'false';
    ['--rx', '--ry', '--lift'].forEach((v) => el.style.removeProperty(v));
  }, []);

  return (
    <article
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      // Cards skip live backdrop blur (costly at grid scale); the tinted gradient reads as glass.
      style={{
        animationDelay: `${(index % 12) * 55}ms`,
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        backgroundColor: 'rgb(22 22 31 / 0.72)',
      }}
      className="animate-card-in tilt-card glass group relative flex h-full flex-col overflow-hidden rounded-2xl hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(245,197,24,0.25)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-t-2xl bg-white/5">
        <PosterImage
          path={posterPath}
          title={title}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.08]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <span className="glass-chip absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white transition-transform duration-300 group-hover:scale-110">
          <Star className="h-3 w-3 text-gold" fill="currentColor" strokeWidth={0} aria-hidden="true" />
          {formatRating(average)}
        </span>
        {userRating > 0 && (
          <span
            key={userRating}
            className="animate-star-pop absolute right-2 top-2 rounded-full bg-gold/90 px-2 py-0.5 text-[11px] font-bold text-ink-950 shadow-[0_0_18px_rgba(245,197,24,0.55)] backdrop-blur"
          >
            You · {userRating}★
          </span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="font-display line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-gold sm:text-[15px]">
          {title}
        </h3>
        <div className="flex items-center justify-between gap-2 text-xs text-white/55">
          <span>{year || 'TBA'}</span>
          <StarDisplay value={average} size="sm" />
        </div>
        {genreNames.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1 pt-1" aria-label="Genres">
            {genreNames.slice(0, 2).map((genre) => (
              <li
                key={genre}
                className="max-w-full truncate rounded-full bg-white/[0.07] px-2 py-0.5 text-[11px] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
              >
                {genre}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pointer-following glare */}
      <div className="glare pointer-events-none absolute inset-0 z-[5] rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Stretched button makes the whole card clickable while keeping valid markup. */}
      <button
        type="button"
        data-ripple
        onClick={() => onSelect(movie)}
        className="absolute inset-0 z-10 cursor-pointer overflow-hidden rounded-2xl focus:outline-none"
        aria-label={`${title}${year ? ` (${year})` : ''}, rated ${formatRating(average)} out of 5${
          userRating ? `, your rating ${userRating}` : ''
        }. View details`}
      />
    </article>
  );
}

export default memo(MovieCard);
