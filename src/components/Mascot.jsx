/**
 * Mascot — the animated avatar in the mobile identity pill.
 *
 * Stands in for the 28px portrait that used to sit there: same footprint
 * (`h-7 w-7`, so the pill's layout doesn't move by a pixel), drawn instead
 * of photographed — because the whole point is that it can move.
 *
 * Three tones, chosen for 28px: an amber disc (the same amber the tab
 * bar's active pill carries), an ink bust and paper features. That is a
 * full contrast ladder — disc → silhouette → eyes — where a photo at this
 * size is mush, and it survives both palettes because the art carries
 * literal light values rather than theme tokens. It's a badge, not chrome:
 * like the amber under it, it doesn't invert on dark.
 *
 * The two loops live in global.css (`.mascot-bob`, `.mascot-eyes`) — two
 * elements, one property each, so no two animations ever contend, and the
 * reduced-motion rule that already ships can flatten both to a still frame.
 *
 * The shoulders deliberately run past the bottom of the viewBox: they are
 * clipped by the disc, and extending them past its edge means the bob can
 * never lift a sliver of amber out from under them.
 */
export default function Mascot() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="28"
      height="28"
      aria-hidden="true"
      focusable="false"
      className="h-7 w-7 shrink-0"
    >
      <defs>
        <clipPath id="mascot-disc">
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>

      <g clipPath="url(#mascot-disc)">
        <circle cx="16" cy="16" r="16" fill="#fcca24" />

        {/* The character — bust + face, idling on `.mascot-bob`. */}
        <g className="mascot-bob">
          <path
            d="M16 19.8c-7.6 0-13.8 5.3-14.7 17.2h29.4C29.8 25.1 23.6 19.8 16 19.8Z"
            fill="#14110d"
          />
          <circle cx="16" cy="13.4" r="7.6" fill="#14110d" />

          {/* Both eyes blink as one — one animation on one element. */}
          <g className="mascot-eyes">
            <ellipse cx="13.1" cy="13.6" rx="1.45" ry="1.85" fill="#faf8f4" />
            <ellipse cx="18.9" cy="13.6" rx="1.45" ry="1.85" fill="#faf8f4" />
          </g>

          <path
            d="M13.6 16.9q2.4 1.9 4.8 0"
            fill="none"
            stroke="#faf8f4"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
}
