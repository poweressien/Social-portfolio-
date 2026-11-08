// Birds and doves that cross the page, over the content. A flock appears every so often
// and the "Release the birds" button sends one on demand. Idle costs nothing: the canvas
// only runs while a flock is in the air.

const TAU = Math.PI * 2;

function wing(ctx, size, flap, sign) {
  const tipY = -Math.sin(flap) * size * 0.75;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(sign * size * 0.45, -size * 0.5 + tipY * 0.35, sign * size, tipY);
  ctx.quadraticCurveTo(sign * size * 0.52, size * 0.02 + tipY * 0.1, 0, size * 0.16);
  ctx.closePath();
  ctx.fill();
}

function drawBird(ctx, b, t) {
  const flap = t * b.rate + b.ph;
  ctx.save();
  ctx.translate(b.x, b.y + Math.sin(flap * 0.5) * b.size * 0.12);
  ctx.scale(b.dir, 1);
  ctx.rotate(Math.sin(flap * 0.5) * 0.05 - 0.04);
  if (b.dove) {
    ctx.shadowColor = 'rgba(240,245,244,.5)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = 'rgba(240,245,244,.96)';
  } else {
    ctx.shadowColor = 'rgba(44,226,138,.6)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(44,226,138,.95)';
  }
  wing(ctx, b.size, flap, -1);
  wing(ctx, b.size, flap, 1);
  // body and head
  ctx.beginPath();
  ctx.ellipse(0, 1, b.size * 0.2, b.size * 0.09, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(b.size * 0.2, -b.size * 0.02, b.size * 0.075, 0, TAU);
  ctx.fill();
  if (!b.dove) {
  }
  ctx.restore();
}

export function createFlyovers(canvas, { reduced = false } = {}) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1;
  let birds = [];
  let raf = 0;
  let timer = 0;
  let last = 0;
  let clock = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(kind) {
    const dove = kind ? kind === 'dove' : Math.random() < 0.3;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const n = 4 + Math.floor(Math.random() * 6);
    const baseY = h * (0.08 + Math.random() * 0.45);
    const speed = (w < 600 ? 70 : 100) + Math.random() * 70;
    const size = (w < 600 ? 14 : 20) + Math.random() * 14;
    const startX = dir > 0 ? -80 : w + 80;
    const wave = 30 + Math.random() * 50;
    const k = Math.random() * 6;
    for (let i = 0; i < n; i++) {
      const row = Math.ceil(i / 2);
      const side = i === 0 ? 0 : i % 2 ? 1 : -1;
      birds.push({
        x: startX - dir * row * size * 1.9,
        y: baseY + side * row * size * 0.95,
        baseY: baseY + side * row * size * 0.95,
        size: size * (0.85 + Math.random() * 0.2),
        dir,
        speed: speed * (0.97 + Math.random() * 0.06),
        ph: Math.random() * TAU,
        rate: 8 + Math.random() * 3,
        dove,
        wave,
        k,
      });
    }
    start();
  }

  function step(now) {
    raf = requestAnimationFrame(step);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    clock += dt;
    ctx.clearRect(0, 0, w, h);
    birds.forEach((b) => {
      b.x += b.dir * b.speed * dt;
      b.y = b.baseY + Math.sin(b.x * 0.006 + b.k) * b.wave;
      drawBird(ctx, b, clock);
    });
    birds = birds.filter((b) => (b.dir > 0 ? b.x < w + 120 : b.x > -120));
    if (!birds.length) {
      cancelAnimationFrame(raf);
      raf = 0;
      ctx.clearRect(0, 0, w, h);
    }
  }

  function start() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(step);
  }

  function schedule(first = false) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!document.hidden) spawn();
      schedule();
    }, first ? 5000 : 20000 + Math.random() * 20000);
  }

  addEventListener('resize', resize);
  resize();
  if (!reduced) schedule(true);

  return {
    release() {
      spawn(Math.random() < 0.5 ? 'dove' : 'bird');
      setTimeout(() => spawn(Math.random() < 0.5 ? 'dove' : 'bird'), 700);
    },
  };
}
