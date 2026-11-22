/** Slowly drifting colour fields behind the UI, giving the glass something to refract. */
export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="animate-float-a absolute -left-[10%] -top-[15%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,rgb(245_197_24/0.20),transparent_65%)] blur-3xl" />
      <div className="animate-float-b absolute -right-[15%] top-[10%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgb(124_58_237/0.22),transparent_65%)] blur-3xl" />
      <div className="animate-float-c absolute -bottom-[25%] left-[20%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,rgb(14_165_233/0.16),transparent_65%)] blur-3xl" />
      {/* Fine grain keeps large gradients from banding. */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
