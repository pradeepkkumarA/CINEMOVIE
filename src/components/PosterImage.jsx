import { useState } from 'react';
import { Clapperboard } from 'lucide-react';
import { imageUrl } from '../utils/image';

const hueFromString = (text = '') =>
  [...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 360, 7);

export function PosterFallback({ title, className = '' }) {
  const hue = hueFromString(title);
  return (
    <div
      role="img"
      aria-label={`${title} (no poster available)`}
      className={`flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center ${className}`}
      style={{
        background: `linear-gradient(155deg, hsl(${hue} 45% 22%), hsl(${(hue + 40) % 360} 40% 9%))`,
      }}
    >
      <Clapperboard className="h-8 w-8 text-white/40" aria-hidden="true" />
      <span className="font-display line-clamp-3 text-sm font-semibold leading-snug text-white/80">
        {title}
      </span>
    </div>
  );
}

/** Poster with a fade-in and a generated placeholder if the image is missing or fails. */
export default function PosterImage({ path, title, size = 'w342', className = '' }) {
  const src = imageUrl(path, size);
  const [failedSrc, setFailedSrc] = useState(null);
  const [loadedSrc, setLoadedSrc] = useState(null);

  if (!src || failedSrc === src) return <PosterFallback title={title} className={className} />;

  return (
    <img
      src={src}
      alt={`${title} poster`}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoadedSrc(src)}
      onError={() => setFailedSrc(src)}
      className={`h-full w-full object-cover transition-opacity duration-500 ${
        loadedSrc === src ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    />
  );
}
