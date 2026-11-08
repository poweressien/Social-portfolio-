// Live effects drawn over the two cover pictures. Everything is drawn in the picture's
// own pixel coordinates, so it stays glued to the artwork at any size.

const rnd = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ------------------------------------------------------------- dev at desk (736 x 977) */

const SCREENS = [
  // main curved monitor, with a cut-out where the developer's head is
  { poly: [[248, 403], [441, 396], [441, 436], [380, 440], [372, 468], [378, 500], [412, 532], [250, 571]], x0: 254, y0: 410, cols: 150, rows: 27, typing: true },
  // left monitor
  { poly: [[184, 429], [246, 424], [246, 571], [192, 594]], x0: 188, y0: 434, cols: 52, rows: 26, typing: false },
];
const CODE_COLORS = ['#e9eeff', '#9df08c', '#ffd27a', '#8fd4ff', '#c9b6ff'];

const LEDS = [
  [79, 378, '#ff3b2f'], [94, 374, '#ff3b2f'], [139, 401, '#ff3b2f'], [149, 398, '#ff5a3b'], [190, 382, '#7dff8a'],
  [302, 338, '#ff3b2f'], [570, 498, '#ff3b2f'], [568, 573, '#9aff4a'], [634, 670, '#ff3b2f'], [638, 673, '#ff3b2f'],
  [55, 751, '#ff4a2a'], [126, 752, '#ffe05a'], [116, 755, '#ffe05a'], [132, 758, '#ffe05a'], [94, 771, '#ffe05a'],
  [732, 799, '#ff4a2a'], [733, 811, '#ff4a2a'], [26, 813, '#ff6a4a'], [727, 834, '#ff5a3a'], [104, 842, '#ff6a2a'],
  [168, 855, '#5affc0'], [178, 846, '#ffd05a'], [610, 903, '#ff5a3a'], [236, 668, '#fff09a'], [392, 570, '#ffe66a'],
  [492, 488, '#ffd08a'], [487, 491, '#d6ff7a'], [118, 199, '#ff7a6a'], [78, 389, '#ff7a3a'], [64, 391, '#ff7a3a'],
];

const dust = Array.from({ length: 46 }, (_, i) => ({ x: rnd(i) * 736, y: rnd(i + 90) * 977, s: 0.6 + rnd(i + 7) * 1.6, v: 6 + rnd(i + 3) * 18, a: 0.2 + rnd(i + 5) * 0.5 }));

function drawScreen(ctx, sc, t, fast) {
  ctx.save();
  ctx.beginPath();
  sc.poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.clip();
  const g = ctx.createLinearGradient(0, sc.poly[0][1], 0, 580);
  g.addColorStop(0, '#2c46b9');
  g.addColorStop(1, '#2238a0');
  ctx.fillStyle = g;
  ctx.fillRect(170, 390, 290, 220);

  const pitch = 5.6;
  const rate = sc.typing ? 3.4 : 1.4;
  const total = t * rate;
  const row0 = Math.floor(total);
  const frac = total - row0;
  const first = Math.max(0, row0 - sc.rows + 1);
  const scroll = row0 >= sc.rows ? frac * pitch : 0;

  for (let r = first; r <= row0; r++) {
    const y = sc.y0 + (r - first) * pitch - scroll;
    const seed = r * 13.37 + (sc.typing ? 1 : 50);
    const indent = Math.floor(rnd(seed) * 4) * 9;
    const segs = 1 + Math.floor(rnd(seed + 1) * 4);
    const blank = rnd(seed + 9) < 0.12;
    const limit = r === row0 && sc.typing ? frac : 1;
    if (blank) continue;
    let x = sc.x0 + indent;
    for (let s = 0; s < segs; s++) {
      const w = (6 + rnd(seed + s * 3.1) * 34) * (sc.cols / 150);
      const draw = Math.max(0, Math.min(w, (w * segs * limit) - s * w * limit));
      ctx.fillStyle = CODE_COLORS[Math.floor(rnd(seed + s * 7) * CODE_COLORS.length)];
      ctx.globalAlpha = 0.92;
      ctx.fillRect(x, y, sc.typing && r === row0 ? Math.min(w, w * limit * segs) : w, 2.3);
      x += w + 3.2;
    }
  }
  if (sc.typing && Math.floor(t * 2.2) % 2 === 0) {
    const y = sc.y0 + (row0 - first) * pitch - scroll;
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sc.x0 + 14 + frac * 60, y - 0.6, 3, 3.6);
  }
  // glass sheen
  ctx.globalAlpha = 0.07 + (fast ? 0 : 0.03 * Math.sin(t * 1.7));
  const sh = ctx.createLinearGradient(sc.x0, 0, sc.x0 + 200, 0);
  sh.addColorStop(0, '#fff');
  sh.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(170, 390, 290, 220);
  ctx.restore();
}

export function drawDev(ctx, t) {
  ctx.clearRect(0, 0, 736, 977);
  SCREENS.forEach((s) => drawScreen(ctx, s, t));

  // glow of the monitors on the desk
  const gl = ctx.createRadialGradient(330, 610, 10, 330, 610, 180);
  const pulse = 0.1 + 0.04 * Math.sin(t * 2.3);
  gl.addColorStop(0, `rgba(80,120,255,${pulse})`);
  gl.addColorStop(1, 'rgba(80,120,255,0)');
  ctx.fillStyle = gl;
  ctx.fillRect(120, 480, 400, 300);

  // keyboard: keys flicker as the typing happens
  const burst = Math.floor(t * 13);
  ctx.fillStyle = '#e8f0ff';
  for (let k = 0; k < 5; k++) {
    const sd = burst * 5.1 + k * 17;
    const kx = 276 + rnd(sd) * 100;
    const ky = 582 + rnd(sd + 3) * 46 - (kx - 276) * 0.07;
    ctx.globalAlpha = 0.35 + rnd(sd + 5) * 0.5;
    ctx.fillRect(kx, ky, 4, 2.4);
  }

  // rack LEDs
  LEDS.forEach(([x, y, col], i) => {
    const on = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (1.2 + (i % 5) * 0.55) + i * 1.9));
    const hard = Math.sin(t * (3 + (i % 4)) + i) > 0.6 ? 1 : 0.55;
    ctx.globalAlpha = on * hard;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 9, y - 9, 18, 18);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = on * 0.9;
    ctx.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
  });

  // dust and data motes rising through the room
  ctx.fillStyle = '#bcd4ff';
  dust.forEach((d) => {
    const y = (d.y - t * d.v + 977 * 10) % 977;
    const x = d.x + Math.sin(t * 0.6 + d.y) * 6;
    ctx.globalAlpha = d.a * (0.5 + 0.5 * Math.sin(t * 1.5 + d.x));
    ctx.fillRect(x, y, d.s, d.s);
  });

  // slow scan line
  const sy = ((t * 70) % 1300) - 160;
  const sg = ctx.createLinearGradient(0, sy - 40, 0, sy + 40);
  sg.addColorStop(0, 'rgba(90,160,255,0)');
  sg.addColorStop(0.5, 'rgba(90,160,255,0.07)');
  sg.addColorStop(1, 'rgba(90,160,255,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = sg;
  ctx.fillRect(0, sy - 40, 736, 80);
  ctx.globalAlpha = 1;
}

/* ------------------------------------------------------------- brand (896 x 1200) */

const SPARKS = Array.from({ length: 70 }, (_, i) => {
  const corner = i % 2 ? [800, 1080] : [90, 150];
  return { x: corner[0] + (rnd(i) - 0.5) * 360, y: corner[1] + (rnd(i + 40) - 0.5) * 300, s: 0.8 + rnd(i + 9) * 2, ph: rnd(i + 3) * 6.28, v: 3 + rnd(i + 11) * 9 };
});

export function drawBrand(ctx, t) {
  ctx.clearRect(0, 0, 896, 1200);
  const cx = 448, cy = 600;

  // radar sweep inside the rings
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 660, 0, Math.PI * 2);
  ctx.clip();
  if (ctx.createConicGradient) {
    const cg = ctx.createConicGradient(t * 0.8, cx, cy);
    cg.addColorStop(0, 'rgba(44,226,138,0.28)');
    cg.addColorStop(0.07, 'rgba(44,226,138,0.0)');
    cg.addColorStop(1, 'rgba(44,226,138,0)');
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, 896, 1200);
  }
  ctx.restore();

  // pulse rings
  ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) {
    const p = ((t * 0.16 + k / 3) % 1);
    ctx.strokeStyle = `rgba(60,255,140,${(1 - p) * 0.32})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 40 + p * 640, 0, Math.PI * 2);
    ctx.stroke();
  }

  // logo mark breathing
  const br = 0.22 + 0.1 * Math.sin(t * 1.6);
  const lg = ctx.createRadialGradient(cx, 430, 10, cx, 430, 230);
  lg.addColorStop(0, `rgba(44,226,138,${br})`);
  lg.addColorStop(1, 'rgba(44,226,138,0)');
  ctx.fillStyle = lg;
  ctx.fillRect(150, 200, 600, 460);

  // targeting ring on the green O
  ctx.save();
  ctx.translate(505, 634);
  ctx.rotate(t * 0.9);
  ctx.strokeStyle = 'rgba(80,255,150,0.85)';
  ctx.lineWidth = 2;
  ctx.setLineDash([9, 7]);
  ctx.beginPath();
  ctx.arc(0, 0, 50, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.rotate(-t * 1.8);
  for (let k = 0; k < 4; k++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(56, 0);
    ctx.lineTo(66, 0);
    ctx.stroke();
  }
  ctx.restore();

  // shimmer travelling across the wordmark
  const sx = (((t * 0.22) % 1.6) - 0.3) * 1000;
  ctx.save();
  ctx.beginPath();
  ctx.rect(80, 578, 740, 150);
  ctx.clip();
  const sh = ctx.createLinearGradient(sx - 90, 0, sx + 90, 0);
  sh.addColorStop(0, 'rgba(255,255,255,0)');
  sh.addColorStop(0.5, 'rgba(190,255,220,0.32)');
  sh.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(80, 578, 740, 150);
  ctx.restore();

  // sparks drifting from the light flares
  ctx.fillStyle = '#9bffc4';
  SPARKS.forEach((s) => {
    const y = (s.y - t * s.v + 3600) % 1200;
    ctx.globalAlpha = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2 + s.ph));
    ctx.fillRect(s.x + Math.sin(t * 0.5 + s.ph) * 8, y, s.s, s.s);
  });
  ctx.globalAlpha = 1;
}
