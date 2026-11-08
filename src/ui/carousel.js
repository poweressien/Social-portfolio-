import { icon } from '../lib/icons.js';
import { reduced } from '../lib/format.js';

// One animation-frame loop drives every carousel, and it only runs while at least one
// carousel is on screen. 78 posts cost the same as one.
const live = new Set();
let ticker = 0;
let lastT = 0;
function pump(now) {
  const dt = Math.min(100, now - lastT);
  lastT = now;
  if (!document.hidden) live.forEach((c) => c.tick(dt));
  ticker = live.size ? requestAnimationFrame(pump) : 0;
}
function join(c) {
  live.add(c);
  if (!ticker) {
    lastT = performance.now();
    ticker = requestAnimationFrame(pump);
  }
}

// Slide transitions. "slide" always travels left to right.
const EASE = 'cubic-bezier(.22,.8,.2,1)';

export class Carousel {
  constructor(root, slides, { mode = 'slide', autoplay = true, interval = 4600, arrows = true, onTap } = {}) {
    this.root = root;
    this.slides = slides;
    this.mode = mode;
    this.i = 0;
    this.interval = interval;
    this.autoplay = autoplay && slides.length > 1 && mode !== 'scrub' && !reduced();
    this.acc = 0;
    this.visible = false;
    this.hover = false;
    this.busy = false;
    this.onTap = onTap;

    root.classList.add('car', `mode-${mode}`);
    root.innerHTML = `
      <div class="car-stage">${slides.map((s, n) => `<div class="car-slide${n === 0 ? ' is-on' : ''}" data-n="${n}">${s}</div>`).join('')}</div>
      ${slides.length > 1 ? `
      <div class="car-dots" role="tablist">${slides.map((_, n) => `<button type="button" class="car-dot${n === 0 ? ' is-on' : ''}" data-dot="${n}" aria-label="Show picture ${n + 1}"></button>`).join('')}</div>
      <div class="car-count" aria-hidden="true"><span>1</span>/${slides.length}</div>
      ${arrows ? `<button type="button" class="car-arrow prev" aria-label="Previous picture">${icon('left', 20)}</button><button type="button" class="car-arrow next" aria-label="Next picture">${icon('right', 20)}</button>` : ''}
      <div class="car-progress"><i></i></div>` : ''}
    `;
    this.els = [...root.querySelectorAll('.car-slide')];
    this.dots = [...root.querySelectorAll('.car-dot')];
    this.count = root.querySelector('.car-count span');
    this.bar = root.querySelector('.car-progress i');

    if (slides.length > 1) this.bind();
    this.setInitial();
  }

  setInitial() {
    this.els.forEach((el, n) => {
      el.style.zIndex = n === 0 ? 2 : 1;
      el.style.opacity = n === 0 ? 1 : 0;
      el.style.transform = '';
      el.style.clipPath = '';
    });
    if (this.mode === 'stack') this.els.forEach((el, n) => (el.style.opacity = n === 0 ? 1 : 0));
  }

  bind() {
    const r = this.root;
    r.addEventListener('click', (e) => {
      const d = e.target.closest('[data-dot]');
      if (d) {
        e.stopPropagation();
        return this.go(+d.dataset.dot);
      }
      if (e.target.closest('.prev')) {
        e.stopPropagation();
        return this.go(this.i - 1, -1);
      }
      if (e.target.closest('.next')) {
        e.stopPropagation();
        return this.go(this.i + 1, 1);
      }
    });
    r.addEventListener('pointerenter', () => (this.hover = true));
    r.addEventListener('pointerleave', () => (this.hover = false));

    // Swipe
    let sx = 0, sy = 0, down = false, moved = false;
    r.addEventListener('pointerdown', (e) => {
      down = true;
      moved = false;
      sx = e.clientX;
      sy = e.clientY;
    });
    r.addEventListener('pointermove', (e) => {
      if (down && Math.abs(e.clientX - sx) > 10) moved = true;
    });
    const up = (e) => {
      if (!down) return;
      down = false;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) {
        this.go(this.i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
        r._swiped = true;
        setTimeout(() => (r._swiped = false), 60);
      }
    };
    r.addEventListener('pointerup', up);
    r.addEventListener('pointercancel', () => (down = false));
    r.addEventListener('click', (e) => {
      if (r._swiped || moved) e.stopPropagation();
    }, true);
  }

  setVisible(v) {
    this.visible = v;
    if (!this.autoplay) return;
    if (v) join(this);
    else live.delete(this);
  }

  tick(dt) {
    if (!this.visible || this.hover || this.busy) return;
    this.acc += dt;
    if (this.acc >= this.interval) {
      this.acc = 0;
      this.go(this.i + 1, 1);
    }
    if (this.bar) this.bar.style.transform = `scaleX(${Math.min(1, this.acc / this.interval)})`;
  }

  destroy() {
    live.delete(this);
  }

  // Scroll-driven mode: progress 0..1 picks the picture and slides it in.
  scrub(progress) {
    const n = this.els.length;
    const f = Math.min(n - 1, Math.max(0, progress * (n - 1) * 1.0));
    const a = Math.floor(f);
    const t = f - a;
    this.els.forEach((el, k) => {
      const d = k - f;
      el.style.zIndex = k === a || k === a + 1 ? 2 : 1;
      el.style.opacity = Math.abs(d) < 1 ? 1 - Math.abs(d) * 0.15 : 0;
      el.style.transform = `translateX(${(-d) * -100}%) scale(${1 - Math.min(1, Math.abs(d)) * 0.06})`;
    });
    this.i = Math.round(f);
    this.sync();
    this.root.style.setProperty('--scrub', t.toFixed(3));
  }

  sync() {
    this.dots.forEach((d, n) => d.classList.toggle('is-on', n === this.i));
    if (this.count) this.count.textContent = this.i + 1;
  }

  go(n, dir) {
    const len = this.els.length;
    n = ((n % len) + len) % len;
    if (n === this.i || this.busy || this.mode === 'scrub') {
      if (this.mode === 'scrub') return;
      return;
    }
    dir = dir || (n > this.i ? 1 : -1);
    const from = this.els[this.i];
    const to = this.els[n];
    this.i = n;
    this.sync();
    if (reduced()) {
      this.els.forEach((el, k) => (el.style.opacity = k === n ? 1 : 0));
      return;
    }
    this.busy = true;
    const dur = this.mode === 'wipe' ? 900 : this.mode === 'stack' ? 800 : 850;
    const done = () => {
      this.els.forEach((el, k) => {
        el.style.opacity = k === n ? 1 : 0;
        el.style.transform = '';
        el.style.clipPath = '';
        el.style.zIndex = k === n ? 2 : 1;
      });
      this.busy = false;
    };
    to.style.zIndex = 3;
    from.style.zIndex = 2;
    let a1, a2;
    const opt = { duration: dur, easing: EASE, fill: 'both' };

    switch (this.mode) {
      case 'fade':
      case 'kenburns':
        to.style.opacity = 0;
        a1 = to.animate([{ opacity: 0, transform: 'scale(1.06)' }, { opacity: 1, transform: 'scale(1)' }], opt);
        a2 = from.animate([{ opacity: 1 }, { opacity: 0 }], opt);
        break;
      case 'wipe':
        to.style.opacity = 1;
        a1 = to.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], opt);
        a2 = from.animate([{ transform: 'scale(1)', filter: 'brightness(1)' }, { transform: 'scale(1.06)', filter: 'brightness(.5)' }], opt);
        break;
      case 'stack':
        to.style.opacity = 1;
        a1 = to.animate([{ transform: 'translateY(6%) scale(.92)', opacity: 0 }, { transform: 'none', opacity: 1 }], opt);
        a2 = from.animate([{ transform: 'none', opacity: 1 }, { transform: `translateY(-14%) rotate(${dir * -4}deg) scale(.9)`, opacity: 0 }], opt);
        to.style.zIndex = 2;
        from.style.zIndex = 3;
        break;
      case 'slide':
      default:
        // left to right: the new picture arrives from the left
        to.style.opacity = 1;
        a1 = to.animate([{ transform: `translateX(${dir > 0 ? -100 : 100}%)` }, { transform: 'translateX(0)' }], opt);
        a2 = from.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dir > 0 ? 100 : -100}%)` }], opt);
    }
    Promise.allSettled([a1.finished, a2.finished]).then(() => {
      a1.cancel();
      a2.cancel();
      done();
    });
  }
}
