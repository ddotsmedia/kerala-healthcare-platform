// ogImage.js — build 1200x630 social share cards as SVG (no external package).
// Served with image/svg+xml; crawlers (WhatsApp/FB/Twitter) render SVG OG cards.

const W = 1200;
const H = 630;
const BRAND = '#0f766e';
const BRAND_DARK = '#0d5c56';

/** Escape text for safe inclusion in SVG markup. */
function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Wrap a string to at most `max` chars/line, up to `lines` lines (last gets an ellipsis). */
function wrap(text, max, lines) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const out = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      if (out.length === lines - 1) { cur = `${cur} ${w}`; break; }
      out.push(cur.trim()); cur = w;
    } else {
      cur = `${cur} ${w}`.trim();
    }
  }
  if (cur) out.push(cur.length > max ? `${cur.slice(0, max - 1)}…` : cur);
  return out.slice(0, lines);
}

function tspans(lines, x, startY, lineH) {
  return lines.map((l, i) => `<tspan x="${x}" y="${startY + i * lineH}">${esc(l)}</tspan>`).join('');
}

/**
 * Compose an OG card.
 * @param {{eyebrow?:string, title:string, subtitle?:string, badge?:string, footer?:string}} o
 */
export function ogCard({ eyebrow = '', title = '', subtitle = '', badge = '', footer = 'malayalidoctor.com' }) {
  const titleLines = wrap(title, 26, 3);
  const titleStartY = 250 - (titleLines.length - 1) * 34;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BRAND}"/><stop offset="1" stop-color="${BRAND_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${W}" height="12" fill="#f59e0b"/>
  <text x="80" y="120" font-family="Arial, sans-serif" font-size="30" fill="#c9f0ec" font-weight="600">${esc(eyebrow)}</text>
  <text font-family="Arial, sans-serif" font-size="64" fill="#ffffff" font-weight="800">${tspans(titleLines, 80, titleStartY, 74)}</text>
  ${subtitle ? `<text x="80" y="${titleStartY + titleLines.length * 74 + 26}" font-family="Arial, sans-serif" font-size="34" fill="#e6fffb">${esc(subtitle)}</text>` : ''}
  ${badge ? `<rect x="80" y="500" width="${Math.min(560, 40 + badge.length * 18)}" height="56" rx="28" fill="#ffffff" opacity="0.16"/>
  <text x="108" y="537" font-family="Arial, sans-serif" font-size="28" fill="#ffffff" font-weight="600">${esc(badge)}</text>` : ''}
  <text x="${W - 80}" y="560" text-anchor="end" font-family="Arial, sans-serif" font-size="30" fill="#ffffff" font-weight="700">🩺 ${esc(footer)}</text>
</svg>`;
}

export function svgResponse(svg) {
  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
