/**
 * LiquidGlass — the refractive material for the mobile chrome.
 *
 * Four boxes, because the capture, the water line, the surface light
 * and the layout each need to be painted separately:
 *
 *   glass-shell        the caller's own classes — layout, rounding,
 *                      pointer events, ambient shadow
 *   ├ .glass-refract   z:-2 · THE glass: samples the page behind the
 *   │                    pill and bends it — `backdrop-filter: blur(0px)`
 *   │                    (the cheapest possible capture: a straight copy,
 *   │                    no blur pass) handed straight to
 *   │                    `filter: url(#lg-dist)`, whose own blur is what
 *   │                    frosts it. Definition lives in Base.astro.
 *   ├ .glass-reflect   z:-1 · OPTIONAL water line, painted only when the
 *   │                    caller passes `reflect`: a 26px band at the
 *   │                    edge where content meets the glass that MIRRORS
 *   │                    what lies beyond it — "bottom" for the top pills
 *   │                    (the page below, flipped up), "top" for the
 *   │                    taskbar (the page above, flipped down). Its own
 *   │                    capture + #lg-reflect-b flip — the strip's
 *   │                    geometry, not a second filter, picks which bank
 *   │                    mirrors — clipped by the shell to the band,
 *   │                    faded by a mask away from the line. Sits above
 *   │                    the refract layer, so the flip samples raw page
 *   │                    (the region past the line is outside the
 *   │                    silhouette, where refract is not painted)
 *   │                    rather than the already-warped copy.
 *   ├ .glass-surface   z:-1 · the flat part: tint, hairline, the
 *   │                    specular rim that says the light is on it
 *   └ children         paint above the glass — full contrast, never
 *                       tinted, never blurred
 *
 * The frost cannot sit on `backdrop-filter`: measured in Chromium, any
 * real blur there stops the backdrop being passed through the filter at
 * all and the refraction vanishes with it (0.7/255 of pixels move,
 * against 84/255 with the blur moved inside the filter). So the order is
 * fixed — capture sharp, blur, displace — and it is all one filter.
 *
 * `.glass-refract` is inset well past the silhouette (60px, against a
 * worst-case diagonal displacement of 49.5px): displacement samples the
 * filter region, and a region ending at the pill's edge would pull
 * transparent pixels into the rim. The shell's `overflow: hidden` clips
 * the overscan back to the rounded shape.
 *
 * The negative z-index needs a stacking context to stay local, which is
 * why the shell carries `position: relative; z-index: 0` in CSS — a plain
 * z-index context, NOT `isolation: isolate`: isolation forms a *backdrop
 * root* and would hide the page from the capture, leaving the glass to
 * refract nothing.
 *
 * A browser that captures but does not route the backdrop through a
 * filter reference gets the tint, hairline and rim over a sharp page —
 * clear glass rather than a broken pill.
 *
 * Above 768px the effect stands down completely: global.css gives every
 * material layer `display: none` outside the media gate, and the shell
 * keeps its original single-layer styling — tablets (769–1023px) and
 * desktop are byte-identical to before this component existed.
 *
 * Ref is a normal prop (React 19), so `ref={tabRef}` passes straight
 * through to the rendered tag for the taskbar's indicator measuring.
 */
export default function LiquidGlass({
  as: Tag = "div",
  className = "",
  reflect,
  children,
  ...rest
}) {
  return (
    <Tag className={`glass-shell ${className}`} {...rest}>
      <span aria-hidden="true" className="glass-refract" />
      {reflect ? (
        <span
          aria-hidden="true"
          className={`glass-reflect glass-reflect-${reflect === "top" ? "t" : "b"}`}
        />
      ) : null}
      <span aria-hidden="true" className="glass-surface" />
      {children}
    </Tag>
  );
}
