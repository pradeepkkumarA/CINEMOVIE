import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CalendarDays, Clock, Globe, RefreshCw, Trash2, Users, X } from 'lucide-react';
import PosterImage, { PosterFallback } from './PosterImage';
import StarRating, { StarDisplay } from './StarRating';
import Avatar from './Avatar';
import ErrorBoundary from './ErrorBoundary';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { useDecorateMovie } from '../hooks/useDecorateMovie';
import { useRatings } from '../context/RatingsContext';
import { imageUrl } from '../utils/image';
import { formatRating } from '../utils/rating';
import { formatDate, formatLanguage, formatRuntime } from '../utils/format';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useModalBehaviour(open, onClose, dialogRef, initialFocusRef) {
  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    initialFocusRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const nodes = [...dialogRef.current.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus({ preventScroll: true });
    };
  }, [open, onClose, dialogRef, initialFocusRef]);
}

function MetaItem({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="glass group relative flex min-w-0 items-start gap-2.5 rounded-2xl p-3 transition duration-300 ease-[var(--ease-spring)] hover:-translate-y-1 hover:bg-white/[0.06]">
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-gold transition-transform duration-500 ease-[var(--ease-spring)] group-hover:scale-125 group-hover:-rotate-12"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <dt className="text-[11px] uppercase tracking-wider text-white/40">{label}</dt>
        <dd className="truncate text-sm text-white/90">{value}</dd>
      </div>
    </div>
  );
}

function CastSection({ status, cast, castUnavailable }) {
  return (
    <section aria-labelledby="cast-heading">
      <h3 id="cast-heading" className="font-display mb-4 flex items-center gap-2 text-lg font-semibold text-white">
        <Users className="h-5 w-5 text-gold" aria-hidden="true" /> Cast
      </h3>
      {status === 'loading' ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="shimmer h-12 w-12 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="shimmer h-3 w-4/5 rounded" />
                <div className="shimmer h-2.5 w-3/5 rounded" />
              </div>
            </li>
          ))}
        </ul>
      ) : cast?.length ? (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
          {cast.map((person) => (
            <li
              key={person.id}
              className="group flex min-w-0 items-center gap-3 rounded-2xl p-1.5 transition duration-300 hover:bg-white/[0.06]"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-ink-700 ring-1 ring-white/15 transition duration-500 ease-[var(--ease-spring)] group-hover:scale-110 group-hover:ring-2 group-hover:ring-gold/70">
                <Avatar path={person.profilePath} name={person.name} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{person.name}</p>
                {person.character && (
                  <p className="truncate text-xs text-white/50">{person.character}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-white/50">
          {castUnavailable ? 'Cast information could not be loaded.' : 'No cast information available.'}
        </p>
      )}
    </section>
  );
}

function DetailsBody({ movie, onClose, closeRef, titleId }) {
  const { status, data, error, retry } = useMovieDetails(movie.id);
  const { getRating, setRating, removeRating } = useRatings();
  const decorate = useDecorateMovie();

  const userRating = getRating(movie.id);
  // Prefer full details once loaded, but render list data immediately.
  const view = decorate(data ? { ...movie, ...data } : movie, userRating);
  const backdrop = imageUrl(view.backdropPath, 'w1280') || imageUrl(view.posterPath, 'w342') /* already cached by the grid; heavily blurred anyway */;
  const runtime = formatRuntime(view.runtime);
  const language = formatLanguage(view.language);

  return (
    <>
      {/* Hero / backdrop */}
      <div className="relative h-44 w-full overflow-hidden bg-ink-800 sm:h-64 md:h-72">
        {backdrop ? (
          <img
            src={backdrop}
            alt=""
            aria-hidden="true"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className={`h-full w-full object-cover ${view.backdropPath ? 'opacity-70' : 'scale-110 opacity-40 blur-xl'}`}
          />
        ) : (
          <PosterFallback title="" className="opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="glass-chip absolute right-3 top-3 z-10 rounded-full p-2.5 text-white/85 transition duration-300 ease-[var(--ease-spring)] hover:rotate-90 hover:scale-110 hover:text-white active:scale-90 focus-visible:outline-2 focus-visible:outline-gold"
          aria-label="Close details"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative -mt-20 px-4 pb-8 sm:-mt-28 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:gap-7">
          <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-2xl bg-ink-700 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.9)] ring-1 ring-white/15 transition duration-700 ease-[var(--ease-spring)] hover:-rotate-2 hover:scale-[1.04] sm:w-44 md:w-52">
            <PosterImage path={view.posterPath} title={view.title} size="w342" />
          </div>

          <div className="min-w-0 flex-1 sm:pt-28">
            <h2 id={titleId} className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
              {view.title}
              {view.year && <span className="ml-2 font-normal text-white/40">({view.year})</span>}
            </h2>
            {view.tagline && <p className="mt-1 text-sm italic text-white/55">“{view.tagline}”</p>}

            {view.genreNames.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Genres">
                {view.genreNames.map((g) => (
                  <li
                    key={g}
                    className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold ring-1 ring-gold/30 backdrop-blur transition duration-300 hover:scale-105 hover:bg-gold/20"
                  >
                    {g}
                  </li>
                ))}
              </ul>
            )}

            {/* Ratings */}
            <div className="glass relative mt-5 grid gap-4 rounded-3xl p-4 md:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/40">Average rating</p>
                <div className="mt-1.5 flex items-center gap-3" data-testid="rating-summary">
                  <span className="font-display text-3xl font-bold text-white">
                    {formatRating(view.average)}
                  </span>
                  <div>
                    <StarDisplay value={view.average} size="md" />
                    <p className="mt-0.5 text-xs text-white/45" title={`Precise average: ${view.average.toFixed(3)}`}>
                      {view.ratingCount.toLocaleString('en-US')}{' '}
                      {view.ratingCount === 1 ? 'rating' : 'ratings'}
                      {userRating > 0 && ' · incl. yours'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-wider text-white/40">Your rating</p>
                  {userRating > 0 && (
                    <button
                      type="button"
                      onClick={() => removeRating(movie.id)}
                      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-white/50 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" /> Remove
                    </button>
                  )}
                </div>
                <StarRating
                  value={userRating}
                  onChange={(value) => setRating(movie.id, value)}
                  label={`Rate ${view.title}`}
                />
              </div>
            </div>
          </div>
        </div>

        {status === 'error' && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-3 rounded-xl bg-red-500/10 p-4 text-sm text-red-200 ring-1 ring-red-500/25 sm:flex-row sm:items-center"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-300" aria-hidden="true" />
            <p className="flex-1">
              Full details could not be loaded{error?.message ? `: ${error.message}` : '.'}
            </p>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-1.5 self-start rounded-lg bg-white/10 px-3 py-1.5 font-medium text-white hover:bg-white/15"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Retry
            </button>
          </div>
        )}

        <section className="mt-8" aria-labelledby="overview-heading">
          <h3 id="overview-heading" className="font-display mb-2 text-lg font-semibold text-white">
            Overview
          </h3>
          <p className="max-w-3xl leading-relaxed text-white/75">
            {view.overview || 'No description is available for this title yet.'}
          </p>
        </section>

        <section className="mt-8" aria-label="Release details">
          <h3 className="font-display mb-3 text-lg font-semibold text-white">Release details</h3>
          <dl className="grid grid-cols-1 gap-2.5 min-[400px]:grid-cols-2 lg:grid-cols-4">
            <MetaItem icon={CalendarDays} label="Release date" value={formatDate(view.releaseDate)} />
            <MetaItem
              icon={Clock}
              label="Runtime"
              value={runtime || (status === 'loading' ? 'Loading…' : 'Unknown')}
            />
            <MetaItem icon={Globe} label="Language" value={language || 'Unknown'} />
            <MetaItem
              icon={RefreshCw}
              label="Status"
              value={view.status || (status === 'loading' ? 'Loading…' : 'Unknown')}
            />
          </dl>
        </section>

        <div className="mt-8">
          <CastSection
            status={status === 'loading' || status === 'idle' ? 'loading' : status}
            cast={data?.cast}
            castUnavailable={status === 'error' || data?.castUnavailable}
          />
        </div>
      </div>
    </>
  );
}

const EXIT_MS = 200;

export default function MovieDetailsModal({ movie, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const titleId = useId();
  const [closing, setClosing] = useState(false);
  const open = Boolean(movie);

  // Play the exit animation before unmounting.
  const requestClose = useCallback(() => setClosing(true), []);
  useEffect(() => {
    if (!closing) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(() => {
      setClosing(false);
      onClose();
    }, reduced ? 0 : EXIT_MS);
    return () => clearTimeout(timer);
  }, [closing, onClose]);

  useModalBehaviour(open, requestClose, dialogRef, closeRef);

  if (!open) return null;

  return createPortal(
    <div
      className={`${closing ? 'animate-fade-out' : 'animate-fade-in'} fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-md sm:items-center sm:p-6`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${closing ? 'animate-sheet-out' : 'animate-sheet-in'} relative max-h-[94dvh] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-t-3xl bg-ink-900/75 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-white/15 backdrop-blur-2xl backdrop-saturate-150 sm:rounded-3xl`}
      >
        <ErrorBoundary
          key={movie.id}
          fallback={({ reset }) => (
            <div role="alert" className="flex flex-col items-center px-6 py-16 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400" aria-hidden="true" />
              <h2 id={titleId} className="font-display mt-4 text-xl font-semibold text-white">
                Couldn’t display this movie
              </h2>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="h-11 rounded-xl bg-gold px-5 text-sm font-semibold text-ink-950"
                >
                  Try again
                </button>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={requestClose}
                  className="h-11 rounded-xl px-5 text-sm text-white/80 ring-1 ring-white/15"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        >
          <DetailsBody movie={movie} onClose={requestClose} closeRef={closeRef} titleId={titleId} />
        </ErrorBoundary>
      </div>
    </div>,
    document.body,
  );
}
