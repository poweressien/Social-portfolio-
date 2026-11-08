// npm run sync
// Saves your public repos into src/data/github.snapshot.json. The site also reads GitHub live
// in the visitor's browser, so this file is only the fallback for when the API is rate-limited
// or offline. Run it before you deploy so the fallback is current.

import { writeFileSync } from 'node:fs';

const USER = process.env.GH_USER || 'poweressien';
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'inwekobong-feed' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const out = [];
for (let page = 1; page < 10; page++) {
  const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&page=${page}&sort=created&direction=desc`, { headers });
  if (!res.ok) {
    console.error(`GitHub answered ${res.status}. Set GITHUB_TOKEN if you are rate limited.`);
    process.exit(1);
  }
  const rows = await res.json();
  out.push(...rows);
  if (rows.length < 100) break;
}

const slim = out.map((r) => ({
  name: r.name,
  description: r.description,
  language: r.language,
  homepage: r.homepage,
  html_url: r.html_url,
  created_at: r.created_at,
  pushed_at: r.pushed_at,
  topics: r.topics || [],
  stargazers_count: r.stargazers_count,
  fork: r.fork,
  archived: r.archived,
  private: r.private,
}));

writeFileSync(new URL('../src/data/github.snapshot.json', import.meta.url), JSON.stringify(slim, null, 1));
console.log(`Saved ${slim.length} repos for ${USER}.`);
