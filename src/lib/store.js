// Likes and views.
//
// By default these live in the visitor's own browser (localStorage), so a number
// you see is a number that really happened on this device. To get shared counts
// across all visitors, set VITE_STATS_URL at build time to an endpoint that
// implements the tiny contract in README.md ("Shared counters").

const KEY = 'inw.feed.v1';
const REMOTE = import.meta.env.VITE_STATS_URL || '';

let state = { liked: {}, views: {} };
const remote = {}; // slug -> { likes, views }
const subs = new Set();
const seenThisSession = new Set();

try {
  const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
  state = { liked: raw.liked || {}, views: raw.views || {} };
} catch {
  /* private mode: counts just reset on reload */
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emit() {
  subs.forEach((fn) => fn());
}

async function ping(body) {
  if (!REMOTE) return;
  try {
    await fetch(REMOTE, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    /* offline is fine */
  }
}

export const store = {
  subscribe(fn) {
    subs.add(fn);
    return () => subs.delete(fn);
  },
  isLiked: (slug) => !!state.liked[slug],
  likes(slug) {
    return (remote[slug]?.likes || 0) + (state.liked[slug] && !remote[slug]?.mine ? 1 : 0);
  },
  views(slug) {
    return (remote[slug]?.views || 0) + (state.views[slug] || 0);
  },
  toggleLike(slug) {
    const next = !state.liked[slug];
    if (next) state.liked[slug] = 1;
    else delete state.liked[slug];
    save();
    emit();
    ping({ slug, type: next ? 'like' : 'unlike' });
    return next;
  },
  // Counts once per visitor per page load.
  addView(slug) {
    if (seenThisSession.has(slug)) return;
    seenThisSession.add(slug);
    state.views[slug] = (state.views[slug] || 0) + 1;
    save();
    emit();
    ping({ slug, type: 'view' });
  },
  async loadRemote(slugs) {
    if (!REMOTE) return;
    try {
      const r = await fetch(`${REMOTE}?slugs=${encodeURIComponent(slugs.join(','))}`);
      if (!r.ok) return;
      const data = await r.json();
      Object.assign(remote, data);
      emit();
    } catch {
      /* ignore */
    }
  },
};
