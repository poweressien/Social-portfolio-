import { drawDev, drawBrand } from './coverfx.js';
import { asset, reduced } from '../lib/format.js';

// Two cover pictures. The desk scene and the studio mark take turns every 15 seconds,
// crossfading. Each one carries live effects drawn on a canvas in the picture's own pixels.

const LAYERS = [
  { src: 'cover-dev.jpg', nw: 736, nh: 977, fx: 300, fy: 500, draw: drawDev, label: 'a developer at work' },
  { src: 'cover-brand.jpg', nw: 896, nh: 1200, fx: 448, fy: 548, draw: drawBrand, label: 'the iNWEKOBONG Studios mark' },
];
const HOLD = 15000;
const FADE = 1800;

export function mountCover(root) {
  root.innerHTML = `
    ${LAYERS.map((l, i) => `
      <div class="layer${i === 0 ? ' is-on' : ''}" data-i="${i}">
        <div class="stage" style="width:${l.nw}px;height:${l.nh}px">
          <img src="${asset(l.src)}" alt="" draggable="false"${i === 0 ? ' fetchpriority="high"' : ''}>
          <canvas width="${l.nw * 2}" height="${l.nh * 2}"></canvas>
        </div>
      </div>`).join('')}
    <div class="cover-shade"></div>
    <div class="cover-dots" role="group" aria-label="Cover pictures">
      ${LAYERS.map((l, i) => `<button type="button" class="cdot${i === 0 ? ' is-on' : ''}" data-i="${i}" aria-label="Show ${l.label}"></button>`).join('')}
    </div>`;

  const layers = [...root.querySelectorAll('.layer')];
  const dots = [...root.querySelectorAll('.cdot')];
  const stages = layers.map((l) => l.querySelector('.stage'));
  const ctxs = layers.map((l) => {
    const c = l.querySelector('canvas').getContext('2d');
    c.scale(2, 2);
    return c;
  });
  const fadingUntil = [0, 0];

  let cur = 0;
  let visible = true;
  let raf = 0;
  let nextAt = performance.now() + HOLD;
  const t0 = performance.now();

  function layout() {
    const cw = root.clientWidth;
    const ch = root.clientHeight;
    if (!cw || !ch) return;
    LAYERS.forEach((l, i) => {
      const s = Math.max(cw / l.nw, ch / l.nh);
      const w = l.nw * s;
      const h = l.nh * s;
      const tx = Math.min(0, Math.max(cw - w, cw / 2 - l.fx * s));
      const ty = Math.min(0, Math.max(ch - h, ch / 2 - l.fy * s));
      stages[i].style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
    });
  }

  function show(i) {
    if (i === cur) return;
    fadingUntil[cur] = performance.now() + FADE + 150; // keep animating while it fades out
    cur = i;
    layers.forEach((l, k) => l.classList.toggle('is-on', k === i));
    dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
    nextAt = performance.now() + HOLD;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) {
      nextAt += 16; // pausing the page pauses the 15 second clock
      return;
    }
    const t = (now - t0) / 1000;
    if (!reduced() && now >= nextAt) show((cur + 1) % LAYERS.length);
    LAYERS.forEach((l, k) => {
      if (k === cur || now < fadingUntil[k]) l.draw(ctxs[k], t);
    });
  }

  dots.forEach((d) => d.addEventListener('click', () => show(+d.dataset.i)));
  new ResizeObserver(layout).observe(root);
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(root);
  layout();

  // Paint one frame of each straight away so even reduced-motion visitors see the scenes.
  LAYERS.forEach((l, k) => l.draw(ctxs[k], 1.2));
  raf = requestAnimationFrame(frame);

  return { destroy: () => cancelAnimationFrame(raf) };
}
