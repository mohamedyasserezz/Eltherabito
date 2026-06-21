// Parses the raw AI response string into a structured shape so it can be
// rendered as a heading + bullet list + disclaimer instead of one dense
// block of plain text.
//
// Typical raw shape coming back from the API:
// "**Suggestions for you** - point one. - point two. - point three. --
//  *These are community-sourced suggestions...*"
export function parseBotMessage(raw) {
  if (!raw || typeof raw !== 'string') {
    return { heading: '', bullets: [], disclaimer: '' };
  }

  // Split off the trailing disclaimer, which is separated by a standalone "--"
  const [mainPart, ...rest] = raw.split(/\s--\s*/);
  const disclaimer = rest.join(' ').replace(/\*/g, '').trim();

  let text = mainPart.trim();

  // Pull out a leading **Heading**
  let heading = '';
  const headingMatch = text.match(/^\*\*(.+?)\*\*/);
  if (headingMatch) {
    heading = headingMatch[1].trim();
    text = text.slice(headingMatch[0].length).trim();
  }

  // Remove a leading "-" left over after the heading
  text = text.replace(/^-\s*/, '');

  // Split remaining text into bullet points on " - " (but not "--")
  const bullets = text
    .split(/\s-\s(?!-)/)
    .map((s) => s.replace(/\*/g, '').trim())
    .filter(Boolean);

  // If nothing looked like bullets, just treat the whole thing as one block
  if (bullets.length === 0 && text) {
    bullets.push(text.replace(/\*/g, '').trim());
  }

  return { heading, bullets, disclaimer };
}

// Shortens a long quoted source excerpt for compact display, breaking on a
// word boundary rather than mid-word.
export function truncate(str, max = 110) {
  if (!str) return '';
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : max)}…`;
}

// Turns shouty ALL-CAPS source text into normal sentence case so it doesn't
// read like it's yelling.
export function toSentenceCase(str) {
  if (!str) return '';
  const isShouting = str === str.toUpperCase() && /[A-Z]/.test(str);
  if (!isShouting) return str;
  const lower = str.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
