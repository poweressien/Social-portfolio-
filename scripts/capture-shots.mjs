// npm run shots
// Opens every live demo URL from your repos (the "homepage" field) in a headless browser and
// saves three screenshots per project into src/shots/<post-slug>/. The feed picks them up
// automatically and uses them instead of the generated artwork.
//
// One-time setup on your computer:   npm i -D playwright && npx playwright install chromium
// Then:                              npm run shots            (all)
//                                    npm run shots -- hangers (only repos whose name contains "hangers")

import { readFileSync, mkdirSync } from 'node:fs';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const repos = JSON.parse(readFileSync(new URL('../src/data/github.snapshot.json', import.meta.url), 'utf8'));
const only = process.argv[2]?.toLowerCase();
const slugOf = (name) => `gh-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
// Curated posts use their own slugs. Add a line here if you want a curated post to use screenshots.
const CURATED = { Hangers: 'hangers-mall', 'X-x-Spotify-sound-room': 'soundroom', uyodriftt: 'uyo-drift', 'parallel-universe-': 'parallel-universe', 'iNWEKOBONGstudios.io': 'inwekobong-studios' };

const targets = repos.filter((r) => r.homepage && !r.fork && (!only || r.name.toLowerCase().includes(only)));
console.log(`${targets.length} live sites to capture`);

const browser = await chromium.launch();
for (const r of targets) {
  const slug = CURATED[r.name] || slugOf(r.name);
  const dir = new URL(`../src/shots/${slug}/`, import.meta.url);
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  try {
    await page.goto(r.homepage, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    const room = Math.max(0, h - 800);
    let n = 0;
    for (const y of [...new Set([0, Math.round(room * 0.4), Math.round(room * 0.8)])]) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: new URL(`${String(++n).padStart(2, '0')}.jpg`, dir).pathname.replace(/^\/([A-Z]:)/, '$1'), type: 'jpeg', quality: 80 });
    }
    console.log(`ok   ${r.name} -> ${slug} (${n})`);
  } catch (e) {
    console.log(`skip ${r.name}: ${e.message.split('\n')[0]}`);
  }
  await ctx.close();
}
await browser.close();
