/**
 * LiquidGlass — the layered translucent material for the mobile chrome.
 *
 * Three boxes, because `backdrop-filter` can only ever blur what is
 * painted *behind* an element: a single element could blur the page but
 * never animate a data field of its own. So:
 *
 *   glass-shell     the caller's own classes — layout, rounding,
 *                   pointer events, ambient shadow
 *   ├ .glass-data    z:-2 · dot grid + tick lanes drifting behind
 *   ├ .glass-surface z:-1 · THE glass: backdrop blur + saturate, tint,
 *   │                       hairline, rim light, sheen
 *   └ children       paint above the glass — full contrast, never
 *                     tinted, never blurred
 *
 * The negative z-indices need a stacking context to stay local, which
 * is why the shell carries `position: relative; z-index: 0` in CSS —
 * a plain z-index context, NOT `isolation: isolate`: isolation forms
 * a *backdrop root* and would hide the page from the surface's blur.
 *
 * Above 768px the effect stands down completely: global.css gives
 * `.glass-data` and `.glass-surface` `display: none` outside its media
 * gate, and the shell keeps its original single-layer styling — tablets
 * and desktop are byte-identical to before this component existed.
 *
 * Ref is a normal prop (React 19), so `ref={tabRef}` passes straight
 * through to the rendered tag for the taskbar's indicator measuring.
 */
export default function LiquidGlass({
  as: Tag = "div",
  className = "",
  children,
  ...rest
}) {
  return (
    <Tag className={`glass-shell ${className}`} {...rest}>
      <span aria-hidden="true" className="glass-data" />
      <span aria-hidden="true" className="glass-surface" />
      {children}
    </Tag>
  );
}
