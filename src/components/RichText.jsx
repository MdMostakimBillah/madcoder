/**
 * Renders a plain string with `**bold**` markers as <strong>,
 * matching the original site's `<b>` tags.
 * Non-bold segments are returned as bare strings — no wrapper element —
 * so the paragraph retains its natural text flow and screen readers
 * never encounter superfluous inline boxes.
 */
export default function RichText({ text }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);

  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  );
}
