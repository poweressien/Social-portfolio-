import { profile, waLink } from '../data/profile.js';
import { buildPosts, snapshotRepos, loadLiveRepos } from '../lib/github.js';
import { slidesFor } from '../art/art.js';
import { icon } from '../lib/icons.js';
import { esc, asset, timeAgo, fullDate, builtLabel, compact, host, clamp } from '../lib/format.js';
import { store } from '../lib/store.js';
import { Carousel } from './carousel.js';
import { profileHTML, mountProfile, renderStats } from './profile.js';
import { burstHearts, toast, sharePost, dmLink, postUrl } from './fx.js';

/* ------------------------------------------------------------ real screenshots */

// Drop images in src/shots/<post-slug>/ and they replace the generated artwork.
const shotFiles = import.meta.glob('../shots/*/*.{png,jpg,jpeg,webp,avif}', { eager: true, query: '?url', import: 'default' });
const shots = {};
Object.keys(shotFiles)
  .sort()
  .forEach((k) => (shots[k.split('/')[2]] ||= []).push(shotFiles[k]));

function slidesOf(p) {
  if (shots[p.slug]) {
    const imgs = shots[p.slug].map((u) => `<img class="shot" src="${u}" alt="${esc(p.title)} screenshot" loading="lazy" draggable="false">`);
    return imgs.length > 1 ? imgs : [...imgs, slidesFor(p)[2]];
  }
  if (p.images) return p.images.map((n, i) => `<img class="shot photo p${i}" src="${asset(n)}" alt="" loading="${i ? 'lazy' : 'eager'}" draggable="false">`);
  return slidesFor(p);
}

/* ------------------------------------------------------------ state */

const KINDS = [
  ['all', 'Everything'],
  ['web', 'Web'],
  ['android', 'Android'],
  ['game', 'Games'],
  ['ai', 'AI'],
  ['tools', 'Tools'],
];

let posts = [];
let repoCount = 70;
let filter = { kind: 'all', tech: '' };
const PAGE = 8;
let shown = PAGE;
let moreIO = null;
const carousels = new Map();
const mediaIO = new IntersectionObserver(onMediaVisible, { threshold: [0, 0.6] });
const viewTimers = new Map();
let scrubbers = [];
const $ = (s, r = document) => r.querySelector(s);
const bySlug = (slug) => posts.find((p) => p.slug === slug);

/* ------------------------------------------------------------ templates */

const statusClass = (s) => (s || '').toLowerCase().replace(/[^a-z]+/g, '-');

function actionsHTML(p) {
  return `
  <div class="actions">
    <button type="button" class="act like" data-act="like" aria-pressed="false" aria-label="Like ${esc(p.title)}">${icon('heart', 20)}<span class="n" data-likes="${p.slug}"></span></button>
    <a class="act dm" href="${dmLink(p)}" target="_blank" rel="noopener" aria-label="Message me on WhatsApp about ${esc(p.title)}">${icon('whatsapp', 20)}<span class="lbl">Message</span></a>
    <span class="act views" title="Views on this device and beyond">${icon('eye', 20)}<span class="n" data-views="${p.slug}">0</span></span>
    <button type="button" class="act share" data-act="share" aria-label="Share ${esc(p.title)}">${icon('share', 20)}<span class="lbl">Share</span></button>
  </div>`;
}

function postHTML(p) {
  const when = timeAgo(p.date);
  const live = p.links?.live;
  const chips = (p.stack || []).slice(0, 5).map((s) => `<button type="button" class="tag" data-act="tech" data-tech="${esc(s)}">${esc(s)}</button>`).join('');
  return `
  <article class="post" id="post-${p.slug}" data-slug="${p.slug}">
    <header class="post-head">
      <img class="mini-av" src="${asset('avatar-sm.jpg')}" alt="" width="46" height="46">
      <div class="who">
        <strong>${esc(profile.name)}</strong>
        <span class="handle">${esc(profile.handle)}</span>
        <time datetime="${p.date || ''}" title="${esc(p.date ? builtLabel(p.date) : 'Date comes from GitHub')}">${p.date ? when : 'earlier'}</time>
      </div>
      <span class="pill st-${statusClass(p.status)}">${esc(p.status)}</span>
    </header>
    ${p.pinned ? `<p class="pinned">${icon('pin', 14)}Pinned</p>` : ''}
    <p class="caption" data-act="open">${esc(p.caption)}</p>
    <div class="media" data-slug="${p.slug}" data-mode="${p.motion || 'slide'}" role="group" aria-label="Pictures of ${esc(p.title)}"></div>
    <button type="button" class="linkbar" data-act="open">
      <span class="lb-text"><b>${esc(p.title)}</b><span>${esc(p.tagline)}</span></span>
      <span class="lb-host">${live ? host(live) : p.links?.repo ? 'github.com' : ''}${icon('right', 16)}</span>
    </button>
    <div class="tags">${chips}</div>
    ${actionsHTML(p)}
  </article>`;
}

function emptyHTML() {
  return `<div class="empty"><p>No builds match this filter.</p><button type="button" class="btn ghost" data-act="reset">Show everything</button></div>`;
}

function storiesHTML() {
  const items = posts.filter((p) => p.pinned || p.status === 'In progress' || p.status === 'Closed testing').slice(0, 10);
  return `<div class="stories-row" role="list">${items
    .map((p) => {
      const pal = p.pal || ['#0c1116', '#18222b', '#2ce28a'];
      const mark = p.pinned ? `<img src="${asset('avatar-sm.jpg')}" alt="">` : `<span>${esc((p.title.match(/[A-Za-z0-9]/g) || ['?']).slice(0, 2).join('').toUpperCase())}</span>`;
      return `<button type="button" class="story" role="listitem" data-act="open" data-slug="${p.slug}" aria-label="Open ${esc(p.title)}">
        <i class="story-ring"></i><b class="story-in" style="background:linear-gradient(135deg,${pal[0]},${pal[1]});color:${pal[2]}">${mark}</b>
        <em>${esc(p.pinned ? 'Start here' : p.title.length > 12 ? `${p.title.slice(0, 11)}…` : p.title)}</em></button>`;
    })
    .join('')}</div>`;
}

function filtersHTML() {
  const count = (k) => (k === 'all' ? posts.length : posts.filter((p) => p.kind === k).length);
  return `<div class="filters-row" role="tablist" aria-label="Filter builds">
    ${KINDS.filter(([k]) => k === 'all' || count(k)).map(([k, l]) => `<button type="button" role="tab" aria-selected="${filter.kind === k}" class="fchip${filter.kind === k ? ' is-on' : ''}" data-act="kind" data-kind="${k}">${l}<small>${count(k)}</small></button>`).join('')}
    ${filter.tech ? `<button type="button" class="fchip is-on tech-on" data-act="tech-clear">${esc(filter.tech)}${icon('close', 14)}</button>` : ''}
  </div>`;
}

function topStack() {
  const m = new Map();
  posts.forEach((p) => (p.stack || []).forEach((s) => m.set(s, (m.get(s) || 0) + 1)));
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10);
}

function railHTML() {
  const building = posts.filter((p) => p.status === 'In progress' || p.status === 'Closed testing').slice(0, 5);
  const stack = topStack();
  const max = stack[0]?.[1] || 1;
  return `
  <section class="rcard"><h2>Building now</h2>
    <ul class="rlist">${building.map((p) => `<li><button type="button" data-act="open" data-slug="${p.slug}"><span class="rdot"></span><span><b>${esc(p.title)}</b><small>${esc(p.status)}</small></span></button></li>`).join('')}</ul>
  </section>
  <section class="rcard"><h2>Most used</h2>
    <ul class="rbars">${stack.map(([s, n]) => `<li><button type="button" data-act="tech" data-tech="${esc(s)}"><span>${esc(s)}</span><i style="--w:${(n / max) * 100}%"></i><small>${n}</small></button></li>`).join('')}</ul>
  </section>
  <section class="rcard talk"><h2>Got an idea?</h2>
    <p>Tell me what you want to build, or just think out loud with me.</p>
    <a class="btn primary wide" href="${waLink("Hi iNWEKOBONG, I have an idea I'd like to talk through.")}" target="_blank" rel="noopener">${icon('whatsapp', 18)}<span>Start a chat</span></a>
    <button type="button" class="btn ghost wide" data-act="birds">${icon('bird', 18)}<span>Release the birds</span></button>
  </section>`;
}

function detailHTML(p) {
  const feats = (p.features || []).map((f) => `<li>${icon('check', 18)}<span>${esc(f)}</span></li>`).join('');
  const chips = (p.stack || []).map((s) => `<button type="button" class="tag" data-act="tech-close" data-tech="${esc(s)}">${esc(s)}</button>`).join('');
  const links = [
    p.links?.live && `<a class="btn primary" href="${p.links.live}" target="_blank" rel="noopener">${icon('external', 18)}<span>Open live site</span></a>`,
    p.links?.repo && `<a class="btn ghost" href="${p.links.repo}" target="_blank" rel="noopener">${icon('github', 18)}<span>${p.links.repo.includes('tab=repositories') ? 'Find on GitHub' : 'View code'}</span></a>`,
    p.links?.docs && `<a class="btn ghost" href="${p.links.docs}" target="_blank" rel="noopener">${icon('repo', 18)}<span>Docs</span></a>`,
  ].filter(Boolean).join('');
  const idx = posts.indexOf(p);
  const more = [1, 2, 3].map((d) => posts[(idx + d) % posts.length]).filter((q) => q && q !== p);
  const meta = [
    p.date ? `${icon('calendar', 16)}<span>${builtLabel(p.date)}</span>` : `${icon('calendar', 16)}<span>Earlier build</span>`,
    p.pushed ? `${icon('code', 16)}<span>Last push ${fullDate(p.pushed)}</span>` : '',
    p.language ? `${icon('code', 16)}<span>${esc(p.language)}</span>` : '',
    p.stars ? `${icon('star', 16)}<span>${p.stars} stars</span>` : '',
  ].filter(Boolean).map((m) => `<li>${m}</li>`).join('');
  return `
  <div class="sheet-in" data-slug="${p.slug}">
    <div class="sheet-top">
      <button type="button" class="round" data-act="close" aria-label="Close">${icon('close', 20)}</button>
      <div class="sheet-nav">
        <button type="button" class="round" data-act="nav" data-d="-1" aria-label="Previous build">${icon('left', 20)}</button>
        <button type="button" class="round" data-act="nav" data-d="1" aria-label="Next build">${icon('right', 20)}</button>
      </div>
    </div>
    <div class="media big" data-slug="${p.slug}" data-mode="slide" role="group" aria-label="Pictures of ${esc(p.title)}"></div>
    <div class="sheet-body">
      <div class="sheet-head"><span class="pill st-${statusClass(p.status)}">${esc(p.status)}</span><ul class="smeta">${meta}</ul></div>
      <h2 id="sheet-title">${esc(p.title)}</h2>
      <p class="lede">${esc(p.tagline)}</p>
      <p class="detail">${esc(p.details || p.caption)}</p>
      ${feats ? `<h3>What it does</h3><ul class="feat">${feats}</ul>` : ''}
      ${chips ? `<h3>Built with</h3><div class="chips">${chips}</div>` : ''}
      ${links ? `<div class="links">${links}</div>` : ''}
      ${actionsHTML(p)}
      ${more.length ? `<h3>More builds</h3><div class="more">${more.map((q) => `<button type="button" class="mini" data-act="open" data-slug="${q.slug}"><b>${esc(q.title)}</b><span>${esc(q.tagline)}</span></button>`).join('')}</div>` : ''}
    </div>
  </div>`;
}

/* ------------------------------------------------------------ mounting */

function visiblePosts() {
  return posts.filter((p) => (filter.kind === 'all' || p.kind === filter.kind || p.pinned) && (!filter.tech || p.pinned || (p.stack || []).includes(filter.tech)));
}

function mountMedia(root, p, opts = {}) {
  const el = $('.media', root);
  if (!el) return;
  const old = carousels.get(el);
  old?.destroy();
  const mode = opts.big ? 'slide' : p.motion || 'slide';
  const c = new Carousel(el, slidesOf(p), { mode, autoplay: !opts.big, arrows: true });
  c.slug = p.slug;
  carousels.set(el, c);
  mediaIO.observe(el);
  if (mode === 'scrub') scrubbers.push({ el, c });
}

function renderFeed() {
  carousels.forEach((c, el) => {
    c.destroy();
    mediaIO.unobserve(el);
  });
  carousels.clear();
  scrubbers = [];
  viewTimers.forEach((t) => clearTimeout(t));
  viewTimers.clear();

  const feed = $('#feed');
  const list = visiblePosts();
  feed.innerHTML = list.length ? list.slice(0, shown).map(postHTML).join('') : emptyHTML();
  feed.querySelectorAll('.post').forEach((art) => mountMedia(art, bySlug(art.dataset.slug)));
  $('#filters').innerHTML = filtersHTML();
  renderMore(list.length);
  syncCounters();
  onScroll();
}

// Posts arrive in pages as you scroll, so 70+ repos never mount at once.
function renderMore(total) {
  moreIO?.disconnect();
  $('#more')?.remove();
  if (shown >= total) return;
  const box = document.createElement('div');
  box.id = 'more';
  box.className = 'more-sentinel';
  box.innerHTML = `<button type="button" class="btn ghost" data-act="more">Show ${Math.min(PAGE, total - shown)} more of ${total - shown}</button>`;
  $('#feed').after(box);
  moreIO = new IntersectionObserver(([e]) => e.isIntersecting && loadMore(), { rootMargin: '600px 0px' });
  moreIO.observe(box);
}

function loadMore() {
  const list = visiblePosts();
  if (shown >= list.length) return;
  const from = shown;
  shown = Math.min(list.length, shown + PAGE);
  const feed = $('#feed');
  feed.insertAdjacentHTML('beforeend', list.slice(from, shown).map(postHTML).join(''));
  list.slice(from, shown).forEach((p) => mountMedia($(`#post-${p.slug}`), p));
  syncCounters();
  renderMore(list.length);
}

function renderSide() {
  $('#stories').innerHTML = storiesHTML();
  $('#rail').innerHTML = railHTML();
  renderStats($('#stats'), posts, repoCount);
}

function syncCounters(root = document) {
  root.querySelectorAll('[data-likes]').forEach((n) => {
    const slug = n.dataset.likes;
    const v = store.likes(slug);
    n.textContent = v ? compact(v) : '';
    const btn = n.closest('.like');
    if (btn) {
      const on = store.isLiked(slug);
      btn.classList.toggle('is-liked', on);
      btn.setAttribute('aria-pressed', on);
    }
  });
  root.querySelectorAll('[data-views]').forEach((n) => (n.textContent = compact(store.views(n.dataset.views))));
}

/* ------------------------------------------------------------ visibility, views, scrub */

function onMediaVisible(entries) {
  for (const e of entries) {
    const c = carousels.get(e.target);
    if (!c) continue;
    c.setVisible(e.isIntersecting);
    const art = e.target.closest('.post');
    if (!art) continue;
    const slug = art.dataset.slug;
    if (e.intersectionRatio >= 0.6 && !viewTimers.has(slug)) {
      viewTimers.set(slug, setTimeout(() => store.addView(slug), 1200));
    } else if (e.intersectionRatio < 0.6 && viewTimers.has(slug)) {
      clearTimeout(viewTimers.get(slug));
      viewTimers.delete(slug);
    }
  }
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const vh = innerHeight;
    for (const { el, c } of scrubbers) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) continue;
      const center = r.top + r.height / 2;
      c.scrub(clamp((vh * 0.95 - center) / (vh * 0.75), 0, 1));
    }
    const bar = $('#progress');
    if (bar) bar.style.transform = `scaleX(${clamp(scrollY / (document.documentElement.scrollHeight - vh || 1), 0, 1)})`;
  });
}

/* ------------------------------------------------------------ detail sheet */

let sheet;
let currentSlug = null;

function openDetail(slug, fromRoute = false) {
  const p = bySlug(slug);
  if (!p) return;
  currentSlug = slug;
  sheet.innerHTML = detailHTML(p);
  const wrap = sheet.querySelector('.sheet-in');
  mountMedia(wrap, p, { big: true });
  syncCounters(sheet);
  const c = carousels.get($('.media', wrap));
  c?.setVisible(true);
  if (!sheet.open) {
    sheet.showModal();
    document.documentElement.classList.add('locked');
  }
  sheet.scrollTop = 0;
  sheet.querySelector('.sheet-in')?.scrollTo?.(0, 0);
  store.addView(slug);
  const target = `#/p/${slug}`;
  if (!fromRoute && location.hash !== target) history.pushState(null, '', target);
}

function closeDetail(fromRoute = false) {
  if (sheet.open) sheet.close();
  document.documentElement.classList.remove('locked');
  const m = $('.media', sheet);
  if (m) {
    carousels.get(m)?.destroy();
    carousels.delete(m);
  }
  currentSlug = null;
  if (!fromRoute && location.hash.startsWith('#/p/')) history.replaceState(null, '', location.pathname + location.search);
}

function route() {
  const m = location.hash.match(/^#\/p\/([^/]+)/);
  if (m && bySlug(m[1])) openDetail(m[1], true);
  else if (sheet?.open) closeDetail(true);
}

/* ------------------------------------------------------------ events */

let mediaClickTimer = null;

function bindEvents(world) {
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t) return;
    const act = t.dataset.act;
    const slug = t.dataset.slug || t.closest('[data-slug]')?.dataset.slug;

    if (act === 'like') {
      const on = store.toggleLike(slug);
      if (on) {
        const r = t.getBoundingClientRect();
        burstHearts(r.left + r.width / 2, r.top + r.height / 2);
      }
    } else if (act === 'share') {
      sharePost(bySlug(slug), t);
    } else if (act === 'open') {
      if (t.classList.contains('media')) return;
      openDetail(slug);
    } else if (act === 'close') {
      closeDetail();
    } else if (act === 'nav') {
      const i = posts.findIndex((p) => p.slug === currentSlug);
      openDetail(posts[(i + +t.dataset.d + posts.length) % posts.length].slug);
    } else if (act === 'more') {
      loadMore();
    } else if (act === 'kind') {
      shown = PAGE;
      filter.kind = t.dataset.kind;
      renderFeed();
      document.getElementById('filters').scrollIntoView({ block: 'start', behavior: 'smooth' });
    } else if (act === 'tech' || act === 'tech-close') {
      shown = PAGE;
      filter.tech = filter.tech === t.dataset.tech && act === 'tech' ? '' : t.dataset.tech;
      if (act === 'tech-close') closeDetail();
      renderFeed();
      document.getElementById('filters').scrollIntoView({ block: 'start', behavior: 'smooth' });
    } else if (act === 'tech-clear') {
      shown = PAGE;
      filter.tech = '';
      renderFeed();
    } else if (act === 'reset') {
      shown = PAGE;
      filter = { kind: 'all', tech: '' };
      renderFeed();
    } else if (act === 'birds') {
      world.birds.release();
      toast('Birds released');
    }
  });

  // Tap a picture to open it; double tap to like it.
  document.addEventListener('click', (e) => {
    const m = e.target.closest('.post .media');
    if (!m || e.target.closest('button')) return;
    const slug = m.dataset.slug;
    if (mediaClickTimer) {
      clearTimeout(mediaClickTimer);
      mediaClickTimer = null;
      if (!store.isLiked(slug)) store.toggleLike(slug);
      burstHearts(e.clientX, e.clientY, 12);
      return;
    }
    mediaClickTimer = setTimeout(() => {
      mediaClickTimer = null;
      openDetail(slug);
    }, 260);
  });

  sheet.addEventListener('click', (e) => {
    if (e.target === sheet) closeDetail();
  });
  sheet.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeDetail();
  });
  sheet.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') $('.car-arrow.next', sheet)?.click();
    if (e.key === 'ArrowLeft') $('.car-arrow.prev', sheet)?.click();
  });

  addEventListener('hashchange', route);
  addEventListener('popstate', route);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  store.subscribe(() => syncCounters());

  // J and K move between posts, like a feed.
  addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea') || e.metaKey || e.ctrlKey || sheet.open) return;
    if (e.key !== 'j' && e.key !== 'k') return;
    const arts = [...document.querySelectorAll('.post')];
    const mid = innerHeight * 0.35;
    const i = arts.findIndex((a) => a.getBoundingClientRect().bottom > mid);
    const next = arts[clamp((i < 0 ? 0 : i) + (e.key === 'j' ? 1 : -1), 0, arts.length - 1)];
    next?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ------------------------------------------------------------ boot */

export function startApp(world) {
  const app = $('#app');
  app.innerHTML = `
    <div id="progress" aria-hidden="true"></div>
    <header class="topbar" id="topbar">
      <a class="tb-id" href="#top" aria-label="Back to top"><img src="${asset('avatar-sm.jpg')}" alt="" width="32" height="32"><b>${esc(profile.brand)}</b></a>
      <a class="btn primary sm" href="${waLink(`Hi ${profile.brand}, I found your portfolio and I'd like to connect.`)}" target="_blank" rel="noopener">${icon('whatsapp', 16)}<span>Message</span></a>
    </header>
    <div class="shell" id="top">
      <main class="col">
        ${profileHTML()}
        <nav class="stories" id="stories" aria-label="Now building"></nav>
        <div class="filters" id="filters"></div>
        <div class="feed" id="feed" aria-live="polite"></div>
        <footer class="foot">
          <p>${esc(profile.name)} (${esc(profile.brand)}). Built with Three.js, no templates.</p>
          <p class="dim">Press J and K to move between builds. Double tap a picture to like it.</p>
        </footer>
      </main>
      <aside class="rail" id="rail" aria-label="Highlights"></aside>
    </div>
    <dialog class="sheet" id="sheet" aria-labelledby="sheet-title"></dialog>`;
  sheet = $('#sheet');

  mountProfile(app);
  posts = buildPosts(snapshotRepos);
  if (snapshotRepos.length) repoCount = snapshotRepos.length;
  renderSide();
  renderFeed();
  store.loadRemote(posts.map((p) => p.slug));
  bindEvents(world);

  // top bar appears once the name has scrolled away
  new IntersectionObserver(([e]) => $('#topbar').classList.toggle('on', !e.isIntersecting), { rootMargin: '-60px 0px 0px 0px' }).observe($('.who-block h1'));

  route();

  // Pull the live repo list; every repo you push becomes a post.
  loadLiveRepos().then((repos) => {
    if (!repos?.length) return;
    posts = buildPosts(repos);
    repoCount = repos.length;
    renderSide();
    renderFeed();
    store.loadRemote(posts.map((p) => p.slug));
    route();
  });
}
