import { useState } from 'react';
import { imageUrl } from '../utils/image';
import { initials } from '../utils/format';

export default function Avatar({ path, name }) {
  const src = imageUrl(path, 'w185');
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div
        aria-hidden="true"
        className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-600 to-ink-800 font-display text-lg font-semibold text-white/70"
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
      className="h-full w-full object-cover"
    />
  );
}
