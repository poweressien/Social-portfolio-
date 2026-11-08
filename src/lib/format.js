export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const asset = (name) => `${import.meta.env.BASE_URL}img/${name}`;

export function parseDate(d) {
  if (!d) return null;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : t;
}

export function timeAgo(d, now = Date.now()) {
  const t = parseDate(d);
  if (!t) return 'earlier';
  const s = Math.max(0, (now - t.getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = s / 60;
  if (m < 60) return `${Math.floor(m)}m`;
  const h = m / 60;
  if (h < 24) return `${Math.floor(h)}h`;
  const day = h / 24;
  if (day < 30) return `${Math.floor(day)}d`;
  const mo = day / 30.44;
  if (mo < 12) return `${Math.floor(mo)}mo`;
  return `${Math.floor(mo / 12)}y`;
}

export function fullDate(d) {
  const t = parseDate(d);
  if (!t) return 'Date unknown';
  return t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function builtLabel(d) {
  const t = parseDate(d);
  if (!t) return 'Earlier build';
  return `Built ${t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export function compact(n) {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  if (n < 1e6) return `${Math.round(n / 1000)}k`;
  return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}m`;
}

export function host(url) {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isMobile = () => matchMedia('(max-width: 720px), (pointer: coarse)').matches;
