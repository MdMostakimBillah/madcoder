/**
 * Renders a plain string with `**bold**` markers as <strong>,
 * matching the original site's `<b>` tags.
 */
export default function RichText({ text }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);

  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
  );
}
