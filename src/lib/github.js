// Turns your GitHub repositories into posts.
//
//  1. Curated posts (src/data/projects.js) are matched to a repo and enriched with its
//     real created date, last push, stars and links.
//  2. Every other non-fork repo becomes its own post automatically.
//
// Repos come from the live GitHub API when the visitor's browser can reach it (cached for
// 30 minutes), otherwise from src/data/github.snapshot.json, written by `npm run sync`.

import snapshot from '../data/github.snapshot.json';
import { profile, hiddenRepos } from '../data/profile.js';
import { projects as curated } from '../data/projects.js';

const API = `https://api.github.com/users/${profile.github}/repos?per_page=100&sort=created&direction=desc`;
const CACHE = 'inw.gh.v1';
const TTL = 30 * 60 * 1000;

const LANG_PAL = {
  Kotlin: ['#12081c', '#3b1d6b', '#a97bff'],
  Java: ['#1a0c08', '#5a2414', '#ff8a5c'],
  Python: ['#0b1420', '#16385a', '#ffd43b'],
  JavaScript: ['#17140a', '#4a3f0c', '#f7df1e'],
  TypeScript: ['#07121f', '#103a6b', '#3b9cff'],
  HTML: ['#1b0d07', '#5a2410', '#ff7a3d'],
  CSS: ['#0a0f1c', '#1a2d6b', '#6b8bff'],
  Dart: ['#06161c', '#0c4a62', '#4dd0ff'],
  Shell: ['#0a140a', '#1c4a1c', '#7dff7d'],
};
const MOTIONS = ['slide', 'fade', 'wipe', 'stack', 'kenburns'];

const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

function kindFor(r) {
  const n = `${r.name} ${r.description || ''} ${(r.topics || []).join(' ')}`.toLowerCase();
  if (/\b(game|drift|puzzle|rush|racing)\b/.test(n)) return 'game';
  if (/\b(ai|llm|gpt|model|neural|nlp|ml)\b/.test(n)) return 'ai';
  if (['Kotlin', 'Java', 'Dart', 'Swift'].includes(r.language) || /android|apk|flutter/.test(n)) return 'android';
  if (['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Svelte'].includes(r.language)) return 'web';
  return 'tools';
}

const pretty = (name) =>
  name
    .replace(/[-_.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());

function fromRepo(r) {
  const lang = r.language || '';
  const desc = (r.description || '').trim();
  return {
    slug: `gh-${r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    auto: true,
    title: pretty(r.name),
    tagline: desc || 'A repository on GitHub',
    kind: kindFor(r),
    status: r.homepage ? 'Live' : 'Open source',
    date: r.created_at,
    pushed: r.pushed_at,
    caption: desc ? `${desc}${/[.!?]$/.test(desc) ? '' : '.'}${lang ? ` Written in ${lang}.` : ''}` : `New on GitHub: ${r.name}.${lang ? ` Written in ${lang}.` : ''}`,
    details: desc || `${r.name} is a public repository on GitHub.`,
    features: [lang && `Written in ${lang}`, r.stargazers_count ? `${r.stargazers_count} stars on GitHub` : '', ...(r.topics || []).slice(0, 4)].filter(Boolean),
    stack: [lang, ...(r.topics || []).slice(0, 4)].filter(Boolean),
    links: { live: r.homepage || '', repo: r.html_url },
    motion: MOTIONS[hash(r.name) % MOTIONS.length],
    scene: 'repo',
    language: lang,
    stars: r.stargazers_count || 0,
    pal: LANG_PAL[lang] || ['#0c1116', '#18222b', '#2ce28a'],
    ui: { type: hash(r.name) % 2 ? 'phone' : 'browser', title: pretty(r.name), items: (r.topics || []).slice(0, 3).length ? (r.topics || []).slice(0, 3) : [lang || 'Code', 'Commits', 'README'], cta: 'Open' },
    cta: 'Open',
  };
}

export function buildPosts(repos) {
  const posts = curated.map((p) => ({ ...p, links: { ...p.links }, stack: [...(p.stack || [])] }));
  const claimed = new Set();
  const list = (repos || [])
    .filter((r) => !hiddenRepos.some((h) => h.toLowerCase() === r.name.toLowerCase()))
    .filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== profile.github.toLowerCase())
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const exact = (r) => posts.find((p) => p.repoName && p.repoName.toLowerCase() === r.name.toLowerCase());
  const fuzzy = (r) => posts.find((p) => !claimed.has(p.slug) && p.match?.some((re) => re.test(r.name)));

  const extra = [];
  for (const r of list) {
    const p = exact(r) || fuzzy(r);
    if (p && !claimed.has(p.slug)) {
      claimed.add(p.slug);
      p.links.repo = r.html_url;
      if (r.homepage && !p.links.live) p.links.live = r.homepage;
      if (r.created_at) p.date = r.created_at;
      p.pushed = r.pushed_at;
      p.stars = r.stargazers_count || 0;
      p.language = r.language || p.language;
      p.fromGithub = true;
    } else {
      extra.push(fromRepo(r));
    }
  }
  const all = [...posts, ...extra];
  const pinned = all.filter((p) => p.pinned);
  const rest = all
    .filter((p) => !p.pinned)
    .sort((a, b) => (new Date(b.date || 0).getTime() || 0) - (new Date(a.date || 0).getTime() || 0));
  return [...pinned, ...rest];
}

export const snapshotRepos = Array.isArray(snapshot) ? snapshot : [];

export async function loadLiveRepos() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(CACHE) || 'null');
    if (raw && Date.now() - raw.t < TTL && Array.isArray(raw.repos)) return raw.repos;
  } catch {
    /* ignore */
  }
  try {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 6000);
    const res = await fetch(API, { headers: { Accept: 'application/vnd.github+json' }, signal: ctl.signal });
    clearTimeout(to);
    if (!res.ok) return null;
    const repos = await res.json();
    if (!Array.isArray(repos)) return null;
    try {
      sessionStorage.setItem(CACHE, JSON.stringify({ t: Date.now(), repos }));
    } catch {
      /* ignore */
    }
    return repos;
  } catch {
    return null;
  }
}
