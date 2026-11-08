import { icon } from '../lib/icons.js';
import { waLink } from '../data/profile.js';

let toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), 2200);
}

// A small burst of hearts from the point that was tapped.
export function burstHearts(x, y, n = 9) {
  const layer = document.getElementById('fx');
  for (let i = 0; i < n; i++) {
    const h = document.createElement('span');
    h.className = 'heart-fx';
    h.innerHTML = icon('heart', 14 + Math.random() * 18);
    const dx = (Math.random() - 0.5) * 140;
    const dy = -(70 + Math.random() * 120);
    h.style.cssText = `left:${x}px;top:${y}px;--dx:${dx}px;--dy:${dy}px;--r:${(Math.random() - 0.5) * 50}deg;animation-delay:${Math.random() * 0.12}s`;
    layer.appendChild(h);
    setTimeout(() => h.remove(), 1400);
  }
}

/* --------------------------------------------------------------------- share */

let pop;
function closePop() {
  pop?.remove();
  pop = null;
}
document.addEventListener('click', (e) => {
  if (pop && !pop.contains(e.target) && !e.target.closest('[data-act="share"]')) closePop();
});
document.addEventListener('keydown', (e) => e.key === 'Escape' && closePop());

export const postUrl = (slug) => {
  const u = new URL(location.href);
  u.hash = `#/p/${slug}`;
  return u.toString();
};

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Link copied');
  } catch {
    const t = document.createElement('textarea');
    t.value = text;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    t.remove();
    toast('Link copied');
  }
}

export async function sharePost(p, anchor) {
  const url = postUrl(p.slug);
  const text = `${p.title}: ${p.tagline}`;
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    try {
      await navigator.share({ title: p.title, text, url });
      return;
    } catch (e) {
      if (e?.name === 'AbortError') return;
    }
  }
  closePop();
  const enc = encodeURIComponent;
  const items = [
    ['Copy link', 'link', null],
    ['WhatsApp', 'whatsapp', `https://wa.me/?text=${enc(`${text} ${url}`)}`],
    ['X', 'x', `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}`],
    ['LinkedIn', 'linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`],
    ['Telegram', 'telegram', `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`],
  ];
  pop = document.createElement('div');
  pop.className = 'share-pop';
  pop.setAttribute('role', 'menu');
  pop.innerHTML = items
    .map(([l, ic, href]) => (href ? `<a role="menuitem" href="${href}" target="_blank" rel="noopener">${icon(ic, 18)}<span>${l}</span></a>` : `<button role="menuitem" type="button" data-copy>${icon(ic, 18)}<span>${l}</span></button>`))
    .join('');
  document.body.appendChild(pop);
  const r = anchor.getBoundingClientRect();
  const w = pop.offsetWidth;
  const h = pop.offsetHeight;
  let left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), innerWidth - w - 12);
  let top = r.top - h - 10;
  if (top < 12) top = r.bottom + 10;
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
  pop.querySelector('[data-copy]')?.addEventListener('click', () => {
    copy(url);
    closePop();
  });
  pop.querySelector('a,button')?.focus();
}

export const dmLink = (p) => waLink(`Hi iNWEKOBONG, I saw "${p.title}" on your portfolio (${postUrl(p.slug)}) and I'd like to talk about it.`);
