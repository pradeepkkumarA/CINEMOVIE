/**
 * One delegated listener that adds a ripple to any element marked with `data-ripple`.
 * The element needs `position: relative|absolute` and `overflow: hidden`.
 */
export function installRipple() {
  if (typeof window === 'undefined') return () => {};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const onPointerDown = (event) => {
    if (reduced.matches || event.button > 0) return;
    const host = event.target.closest?.('[data-ripple]');
    if (!host || host.disabled) return;

    const rect = host.getBoundingClientRect();
    const size = Math.hypot(rect.width, rect.height) * 2;
    const ink = document.createElement('span');
    ink.className = 'ripple-ink';
    ink.style.width = `${size}px`;
    ink.style.height = `${size}px`;
    ink.style.left = `${event.clientX - rect.left}px`;
    ink.style.top = `${event.clientY - rect.top}px`;
    host.appendChild(ink);
    ink.addEventListener('animationend', () => ink.remove(), { once: true });
  };

  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  return () => document.removeEventListener('pointerdown', onPointerDown);
}
