import { useEffect, useRef } from "react";

/**
 * A soft amber glow that trails the cursor.
 *
 * The old implementation animated `left`/`top` on a div with
 * `filter: blur(250px)`, which forced a layout + full repaint on every
 * mousemove. This version only ever writes `transform`, so the browser
 * composites it on the GPU with no layout or paint — and it uses a
 * pre-baked radial gradient instead of an expensive blur filter.
 *
 * Motion model (all on the compositor):
 *   - spring lag: each frame eases toward the pointer (x += dx * EASE),
 *     so the glow trails with a liquid settle instead of snapping 1:1;
 *   - velocity swell: it grows up to 1.3× while the cursor is moving
 *     fast and relaxes when it stops;
 *   - idle: once settled the rAF loop exits entirely — CPU at zero
 *     until the next mousemove;
 *   - breathing: a slow CSS pulse lives on `.glow-core`, a child, so
 *     JS and CSS never animate the same property.
 */
export default function Glow() {
  const layerRef = useRef(null);

  useEffect(() => {
    // Skip entirely for reduced-motion users and coarse pointers (touch).
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!motionOk || !finePointer) return;

    const layer = layerRef.current;
    if (!layer) return;

    const EASE = 0.11; // trailing lag — lower = floatier
    const GROW = 0.3; // max extra scale at speed
    const RADIUS = 272; // half of 34rem, keeps the bloom centred on the cursor

    let raf = 0;
    let primed = false;
    let shown = false;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let scale = 1;

    const paint = () => {
      layer.style.transform = `translate3d(${x - RADIUS}px, ${y - RADIUS}px, 0) scale(${scale.toFixed(3)})`;
    };

    const step = () => {
      const dx = tx - x;
      const dy = ty - y;
      x += dx * EASE;
      y += dy * EASE;

      // Swell with speed so a flick reads as a comet, a drift as a halo.
      const target = 1 + Math.min(Math.hypot(dx, dy) / 300, GROW);
      scale += (target - scale) * 0.12;

      paint();

      // Settled — park the loop; the next mousemove restarts it.
      if (Math.hypot(dx, dy) < 0.1 && Math.abs(target - scale) < 0.002) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(step);
    };

    const onMove = (event) => {
      tx = event.clientX;
      ty = event.clientY;

      // First sighting: place it under the cursor rather than sweeping
      // in from the origin — the fade-in covers the appearance.
      if (!primed) {
        primed = true;
        x = tx;
        y = ty;
        paint();
      }

      if (!shown) {
        shown = true;
        layer.style.opacity = "1";
      }

      if (!raf) raf = requestAnimationFrame(step);
    };

    // Cursor left the window: fade the bloom out, fade it back in later.
    const onLeave = (event) => {
      if (event.relatedTarget) return; // still inside the page
      shown = false;
      layer.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseout", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseout", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div ref={layerRef} className="glow-layer opacity-0">
        <div className="glow-core" />
      </div>
    </div>
  );
}
