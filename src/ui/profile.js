import { profile, waLink } from '../data/profile.js';
import { icon } from '../lib/icons.js';
import { asset, esc, reduced } from '../lib/format.js';
import { mountCover } from './cover.js';

export function profileHTML() {
  const wa = waLink(`Hi ${profile.brand}, I found your portfolio and I'd like to connect.`);
  return `
  <section class="profile" aria-label="Profile">
    <div class="cover" id="cover"></div>
    <div class="head-row">
      <div class="avatar">
        <svg class="ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" stroke-width="2.2" stroke-dasharray="14 9" stroke-linecap="round"/></svg>
        <img src="${asset('avatar.jpg')}" width="132" height="132" alt="Black and white portrait of ${esc(profile.name)}">
        <span class="live-dot" title="Open for connections"></span>
      </div>
      <div class="head-cta">
        <a class="btn primary" href="${wa}" target="_blank" rel="noopener">${icon('whatsapp', 18)}<span>Message on WhatsApp</span></a>
        <a class="btn ghost" href="https://github.com/${profile.github}" target="_blank" rel="noopener">${icon('github', 18)}<span>Follow</span></a>
      </div>
    </div>

    <div class="who-block">
      <h1>${esc(profile.name)}</h1>
      <p class="sub"><span class="brandmark">${esc(profile.brand)}</span> <span class="dim">${esc(profile.handle)}</span></p>
      <p class="role">${esc(profile.headline)}</p>
      <p class="bio" aria-label="${esc(profile.bio.join(' '))}"><span id="typed" aria-hidden="true"></span><i class="caret" aria-hidden="true"></i></p>
      <ul class="meta">
        <li>${icon('pin', 16)}${esc(profile.location)}</li>
        <li class="open"><span class="pulse-dot"></span>Open for connections</li>
        <li>${icon('clock', 16)}<span id="clock">--:--</span> in Nigeria</li>
      </ul>
    </div>

    <div class="socials" aria-label="Find me online">
      ${profile.socials
        .map(
          (s) => `<a class="soc soc-${s.id}" href="${s.id === 'whatsapp' ? wa : s.url}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">${icon(s.icon, 18)}<span>${esc(s.label)}</span></a>`
        )
        .join('')}
    </div>

    <dl class="stats" id="stats"></dl>
  </section>`;
}

export function mountProfile(root) {
  mountCover(root.querySelector('#cover'));
  typeBio(root.querySelector('#typed'));
  const clock = root.querySelector('#clock');
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: profile.timezone });
  const tick = () => (clock.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 20000);
}

export function renderStats(root, posts, repoCount) {
  const tech = new Set(posts.flatMap((p) => p.stack || [])).size;
  const live = posts.filter((p) => p.status === 'Live' || p.status === 'Closed testing').length;
  root.innerHTML = `
    <div><dt>Builds</dt><dd>${posts.length}</dd></div>
    <div><dt>Technologies</dt><dd>${tech}</dd></div>
    <div><dt>Live or in testing</dt><dd>${live}</dd></div>
    <div><dt>Repos on GitHub</dt><dd>${repoCount}</dd></div>`;
}

function typeBio(el) {
  const lines = profile.bio;
  if (reduced()) {
    el.textContent = lines.join(' ');
    return;
  }
  let li = 0, ci = 0, del = false;
  const step = () => {
    const full = lines[li];
    if (!del) {
      ci++;
      el.textContent = full.slice(0, ci);
      if (ci === full.length) return setTimeout(() => { del = true; step(); }, 2300);
      return setTimeout(step, 34 + Math.random() * 40);
    }
    ci -= 2;
    if (ci <= 0) {
      ci = 0;
      del = false;
      li = (li + 1) % lines.length;
      el.textContent = '';
      return setTimeout(step, 320);
    }
    el.textContent = full.slice(0, ci);
    setTimeout(step, 16);
  };
  step();
}
