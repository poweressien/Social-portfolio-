# iNWEKOBONG feed

A portfolio shaped like a social-media timeline. Every project you push to GitHub becomes a post with a like button, a WhatsApp message button, a view counter, a share menu and a date. Tap a post for the full details, links and tech stack.

Vite, vanilla JS and Three.js. No framework, about 34 KB of app code gzipped, and the 3D background loads after the feed has painted.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
npm run preview    # test the production build
```

`dist/` is also included in the zip, so you can upload it straight to any static host.

## Deploy

- **Vercel / Netlify:** import the repo. Build command `npm run build`, output directory `dist`.
- **Render (static site):** build command `npm install && npm run build`, publish directory `dist`.
- **GitHub Pages:** upload the contents of `dist/`. Links are relative, so subfolders work.

## How posts are made

1. The page reads your public repos from the GitHub API in the visitor's browser (cached for 30 minutes). Push a new repo and a new post appears. No rebuild needed.
2. If GitHub cannot be reached (rate limit, offline), it falls back to `src/data/github.snapshot.json`. Refresh that with `npm run sync` before you deploy.
3. `src/data/projects.js` holds the hand-written posts (captions, features, stacks). A curated post is matched to its repo by `repoName` / `match`, and then takes the repo's real created date, last push, stars and links.
4. Every other non-fork repo becomes an automatic post. Hide any repo by adding its exact name to `hiddenRepos` in `src/data/profile.js`.

To write a better caption for an automatic post, copy an entry in `projects.js`, set `repoName` to the repo name, and fill in the text.

## Pictures

- **Real screenshots:** put images in `src/shots/<post-slug>/` (`01.jpg`, `02.jpg`, ...). They replace the generated artwork for that post. The slug is `gh-` plus the lowercase repo name (`Hangers` is `hangers-mall`, see `projects.js`).
- **Capture them automatically from your live sites:**
  ```bash
  npm i -D playwright && npx playwright install chromium
  npm run shots                 # every repo with a live URL
  npm run shots -- hangers      # only repos whose name contains "hangers"
  ```
- **Until then**, each post shows generated preview artwork in its own colours.
- Picture motion per post is set by `motion` in `projects.js`: `slide` (left to right), `fade`, `wipe`, `stack`, `kenburns`, or `scrub` (the pictures slide as you scroll).

Included screenshots (SoundRoom, Bliss Bee, Emmanuel Styles, Souvenir Mart, Snake, Day-Night, 2048 Pro Max, Tic-Tac-Toe) were captured from the repos' own code. Sites that load styles from a CDN (Hangers, Fashion Plus, Reev's Event Kitchen, De-Shield, Daterbar) need `npm run shots` on your machine, where the live sites are reachable.

## Profile

Everything about you is in `src/data/profile.js`: name, bio lines (typed one after another), WhatsApp number and all social buttons.

- `public/img/avatar.jpg`: your photo, sharpened and black and white.
- `public/img/cover-dev.jpg` and `cover-brand.jpg`: the two covers. They swap every 15 seconds with a crossfade, and each has live effects drawn over it (code typing on the monitors, blinking rack lights, a radar sweep behind the logo). The effects are in `src/ui/coverfx.js`.

## Likes and views

By default they are stored in the visitor's own browser, so a number is something that really happened on that device. For counts shared across everyone, set `VITE_STATS_URL` at build time to an endpoint that does this:

- `POST` with JSON `{ "slug": "soundroom", "type": "like" | "unlike" | "view" }`
- `GET ?slugs=a,b,c` returns `{ "a": { "likes": 3, "views": 41 }, ... }`

A small Cloudflare Worker with KV or a Supabase table does it in a few lines. Nothing is faked: with no endpoint, the site shows only the visitor's own activity.

## Things to try

- Double tap or double click a picture to like it.
- `J` and `K` jump between posts.
- Tap a tech tag to filter every build that uses it.
- "Release the birds" in the side panel (a flock also crosses the page every 20 to 40 seconds).
- Deep links: `/#/p/soundroom` opens that post directly. Every share button copies one.
- Reduced-motion setting is respected: covers stay still and the birds stay home.

## Structure

```
src/data/        profile.js, projects.js, github.snapshot.json
src/lib/         github sync, like/view store, icons, helpers
src/ui/          app (feed, sheet), profile, cover + effects, carousel, share
src/art/         generated preview artwork
src/scene/       world.js (Three.js background), flyovers.js (birds)
src/shots/       your real screenshots
scripts/         sync-github.mjs, capture-shots.mjs
```
