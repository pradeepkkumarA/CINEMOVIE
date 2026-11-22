import { useState } from 'react';
import { Star } from 'lucide-react';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Masterpiece'];
const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const SIZES = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-7 w-7 sm:h-8 sm:w-8',
};

/** Read-only stars that support fractional values (e.g. 3.7). */
export function StarDisplay({ value = 0, size = 'sm', className = '' }) {
  const label = `Rated ${value.toFixed(1)} out of 5`;
  return (
    <div className={`flex items-center gap-0.5 ${className}`} role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1))) * 100;
        return (
          <span key={n} className="relative inline-block">
            <Star className={`${SIZES[size]} text-white/15`} fill="currentColor" strokeWidth={0} />
            <span
              className="absolute inset-0 overflow-hidden transition-[width] duration-700 ease-[var(--ease-out-expo)]"
              style={{ width: `${fill}%` }}
            >
              <Star className={`${SIZES[size]} text-gold`} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

/** Interactive 1–5 star input with hover preview, pop/burst feedback and keyboard support. */
export default function StarRating({ value = 0, onChange, size = 'lg', label = 'Your rating' }) {
  const [hover, setHover] = useState(0);
  const [burst, setBurst] = useState({ star: 0, id: 0 });
  const preview = hover || value;

  const rate = (n) => {
    onChange(n);
    setBurst((b) => ({ star: n, id: b.id + 1 }));
  };

  const handleKeyDown = (event) => {
    const keys = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (event.key in keys) {
      event.preventDefault();
      const next = Math.min(5, Math.max(1, (value || 0) + keys[event.key]));
      rate(next);
      event.currentTarget.querySelector(`[data-star="${next}"]`)?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="radiogroup"
        aria-label={label}
        className="-ml-1.5 flex items-center"
        onPointerLeave={() => setHover(0)}
        onKeyDown={handleKeyDown}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= preview;
          const isTabStop = value ? n === value : n === 1;
          const bursting = burst.star === n && burst.id > 0;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              data-star={n}
              aria-checked={value === n}
              aria-label={`${n} star${n > 1 ? 's' : ''} – ${LABELS[n]}`}
              tabIndex={isTabStop ? 0 : -1}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(n)}
              onClick={() => rate(n)}
              className="relative rounded-lg p-1.5 transition-transform duration-300 ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:scale-125 focus-visible:outline-2 focus-visible:outline-gold active:scale-90"
            >
              <Star
                // Re-keying restarts the pop animation on every click.
                key={bursting ? `pop-${burst.id}` : 'idle'}
                className={`${SIZES[size]} transition-all duration-200 ${
                  active ? 'text-gold drop-shadow-[0_0_10px_rgba(245,197,24,0.6)]' : 'text-white/20'
                } ${bursting ? 'animate-star-pop' : ''}`}
                style={{ transitionDelay: active && hover ? `${(n - 1) * 25}ms` : '0ms' }}
                fill="currentColor"
                strokeWidth={active ? 0 : 1.5}
                stroke="currentColor"
              />
              {bursting && (
                <span key={`burst-${burst.id}`} aria-hidden="true">
                  {PARTICLE_ANGLES.map((angle) => (
                    <span key={angle} className="star-particle" style={{ '--angle': `${angle}deg` }} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="h-5 text-sm text-white/60" aria-live="polite">
        {hover
          ? `${hover}/5 · ${LABELS[hover]}`
          : value
            ? `You rated this ${value}/5 · ${LABELS[value]}`
            : 'Tap a star to rate'}
      </p>
    </div>
  );
}
