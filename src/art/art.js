// Generated preview artwork (inline SVG, 960x540).
// Each project gets three slides: a scene that says what it is, a UI mock, and a
// "stack" card. Real screenshots dropped in src/shots/<slug>/ replace all of this.

import { esc } from '../lib/format.js';

const FONT = "Chakra Petch, system-ui, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const rng = (seed) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};
const hash = (str) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const cut = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

const txt = (x, y, s, size = 22, fill = '#fff', o = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-family="${o.mono ? MONO : FONT}" font-weight="${o.w || 600}" text-anchor="${o.a || 'start'}"${o.o != null ? ` opacity="${o.o}"` : ''}${o.cls ? ` class="${o.cls}"` : ''}>${esc(s)}</text>`;

function frame(u, [a, b, c], inner) {
  return `<svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
<linearGradient id="g${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
<radialGradient id="r${u}" cx=".78" cy=".12" r=".9"><stop offset="0" stop-color="${c}" stop-opacity=".42"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
<radialGradient id="v${u}" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
<pattern id="p${u}" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#fff" stroke-opacity=".045"/></pattern>
</defs>
<rect width="960" height="540" fill="url(#g${u})"/><rect width="960" height="540" fill="url(#p${u})"/><rect width="960" height="540" fill="url(#r${u})"/>
${inner}
<rect width="960" height="540" fill="url(#v${u})"/>
</svg>`;
}

/* ------------------------------------------------------------------ scenes */

const scenes = {
  tower(p, [a, b, c]) {
    const r = rng(hash(p.slug));
    let stars = '';
    for (let i = 0; i < 70; i++) stars += `<circle cx="${r() * 960}" cy="${r() * 300}" r="${0.6 + r() * 1.4}" fill="#fff" opacity="${0.25 + r() * 0.6}" class="tw" style="animation-delay:${(r() * 4).toFixed(2)}s"/>`;
    let wins = '';
    for (let row = 0; row < 15; row++)
      for (let k = 0; k < 5; k++)
        if ((row * 7 + k * 3) % 5 !== 0) wins += `<rect x="${404 + k * 30 - row * 0.9}" y="${112 + row * 24}" width="17" height="9" rx="2" fill="${c}" opacity="${0.2 + ((row + k * 2) % 4) * 0.2}"/>`;
    return `${stars}<ellipse cx="480" cy="500" rx="360" ry="30" fill="${c}" opacity=".14"/>
<path d="M392 100H568L604 500H356Z" fill="#05121b" stroke="${c}" stroke-opacity=".7" stroke-width="2"/>${wins}
<path d="M480 100V34" stroke="${c}" stroke-width="3"/><circle cx="480" cy="30" r="8" fill="${c}" class="blink"/>
<circle cx="480" cy="30" r="22" fill="none" stroke="${c}" stroke-opacity=".5" class="pulse-r"/>
<ellipse cx="480" cy="300" rx="260" ry="62" fill="none" stroke="${c}" stroke-opacity=".35" stroke-dasharray="4 8" class="spin-slow"/>
<circle cx="740" cy="180" r="9" fill="#fff" opacity=".9"/><circle cx="740" cy="180" r="16" fill="${c}" opacity=".18"/>`;
  },

  rooms(p, [a, b, c]) {
    let bars = '';
    for (let i = 0; i < 26; i++) bars += `<rect x="${196 + i * 22}" y="${440 - 6}" width="12" height="12" rx="3" fill="${c}" opacity=".85" class="eq" style="animation-delay:${(i * 0.09).toFixed(2)}s;transform-origin:${202 + i * 22}px 446px"/>`;
    let grooves = '';
    for (let i = 1; i < 8; i++) grooves += `<circle cx="480" cy="230" r="${32 + i * 15}" fill="none" stroke="#fff" stroke-opacity="${0.05 + (i % 2) * 0.05}"/>`;
    const heads = [0, 1, 2, 3, 4].map((i) => `<circle cx="${400 + i * 40}" cy="${352}" r="15" fill="${['#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#c77dff'][i]}" stroke="#04140d" stroke-width="3"/>`).join('');
    return `<circle cx="480" cy="230" r="150" fill="#040f0a" stroke="${c}" stroke-opacity=".5" stroke-width="2"/>${grooves}
<g class="spin-slow" style="transform-origin:480px 230px"><circle cx="480" cy="230" r="52" fill="${c}"/><circle cx="480" cy="230" r="9" fill="#04140d"/><path d="M480 178a52 52 0 0 1 36 15" stroke="#04140d" stroke-opacity=".35" stroke-width="3" fill="none"/></g>
${heads}${txt(480, 400, 'Room: Late night Afrobeats', 17, '#d6f7e6', { a: 'middle', w: 500 })}${bars}`;
  },

  scan(p, [a, b, c]) {
    const r = rng(7);
    let nodes = '', lines = '';
    const pts = Array.from({ length: 16 }, () => [120 + r() * 720, 60 + r() * 380]);
    pts.forEach(([x, y], i) => {
      const [x2, y2] = pts[(i * 5 + 3) % pts.length];
      lines += `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-opacity=".22"/>`;
      nodes += `<circle cx="${x}" cy="${y}" r="${3 + (i % 3) * 2}" fill="${c}" opacity=".7"/>`;
    });
    const chips = [['domain', 200, 110], ['+234 phone', 640, 150], ['email', 160, 380], ['company', 700, 400]].map(([s, x, y]) => `<g><rect x="${x}" y="${y}" width="${s.length * 11 + 34}" height="34" rx="17" fill="#04101a" stroke="${c}" stroke-opacity=".7"/><circle cx="${x + 18}" cy="${y + 17}" r="4" fill="${c}"/>${txt(x + 30, y + 22, s, 15, '#dff3ff', { w: 500 })}</g>`).join('');
    return `${lines}${nodes}${chips}
<g class="sweep" style="transform-origin:480px 270px"><circle cx="480" cy="270" r="96" fill="#04101a" fill-opacity=".6" stroke="${c}" stroke-width="3"/><circle cx="480" cy="270" r="70" fill="none" stroke="${c}" stroke-opacity=".4" stroke-dasharray="3 7"/><path d="M552 342l62 62" stroke="${c}" stroke-width="12" stroke-linecap="round"/></g>
${txt(480, 280, '92% match', 26, '#fff', { a: 'middle', w: 700 })}`;
  },

  launcher(p, [a, b, c]) {
    const tiles = [];
    for (let row = 0; row < 3; row++)
      for (let k = 0; k < 4; k++) tiles.push(`<rect x="${236 + k * 118}" y="${196 + row * 100}" width="92" height="92" rx="26" fill="#c9ced6" opacity="${0.92 - row * 0.08}"/><circle cx="${282 + k * 118}" cy="${242 + row * 100}" r="${14 + ((k + row) % 3) * 3}" fill="#8e97a4" opacity=".6"/>`);
    let wave = '';
    for (let i = 0; i < 3; i++) wave += `<path d="M236 ${150 + i * 6}c60-${18 + i * 4} 100 ${18 + i * 4} 160 0s100-${18 + i * 4} 160 0 100 ${18 + i * 4} 160 0" stroke="${c}" stroke-opacity="${0.8 - i * 0.25}" stroke-width="3" fill="none" class="wave" style="animation-delay:${i * 0.4}s"/>`;
    return `<rect x="196" y="40" width="568" height="460" rx="44" fill="#9aa3b0" opacity=".16"/>
<rect x="386" y="58" width="188" height="36" rx="18" fill="#05080c" class="island"/><circle cx="548" cy="76" r="6" fill="${c}"/>
${txt(480, 138, '9:41', 34, '#e8eef7', { a: 'middle', w: 700 })}${wave}${tiles.join('')}`;
  },

  builder(p, [a, b, c]) {
    const blocks = [['Button', 120, 120], ['List', 120, 200], ['Database', 120, 280], ['Logic', 120, 360]].map(([s, x, y]) => `<g><rect x="${x}" y="${y}" width="150" height="56" rx="14" fill="#fff" opacity=".08" stroke="${c}" stroke-opacity=".45"/>${txt(x + 20, y + 35, s, 18, '#efe6ff', { w: 500 })}</g>`).join('');
    return `${blocks}
<rect x="380" y="60" width="200" height="400" rx="28" fill="#0c0618" stroke="${c}" stroke-opacity=".6" stroke-width="2"/>
<rect x="400" y="110" width="160" height="40" rx="10" fill="${c}" opacity=".85" class="drop"/><rect x="400" y="170" width="160" height="26" rx="8" fill="#fff" opacity=".12"/><rect x="400" y="206" width="160" height="26" rx="8" fill="#fff" opacity=".12"/><rect x="400" y="260" width="160" height="90" rx="12" fill="#fff" opacity=".07"/>
<path d="M270 148C330 148 330 130 400 130M270 308C340 308 340 300 400 300" stroke="${c}" stroke-width="2.5" fill="none" stroke-dasharray="6 6" class="flow"/>
<g transform="translate(650 110)"><rect width="190" height="260" rx="18" fill="#fff" opacity=".06" stroke="${c}" stroke-opacity=".4"/>${txt(20, 40, 'APK', 22, '#fff', { w: 700 })}<rect x="20" y="64" width="150" height="10" rx="5" fill="#fff" opacity=".14"/><rect x="20" y="64" width="110" height="10" rx="5" fill="${c}" class="load"/>${txt(20, 120, 'Signing…', 16, '#d9c8ff', { w: 500 })}<rect x="20" y="190" width="150" height="48" rx="24" fill="${c}"/>${txt(95, 221, 'Install', 18, '#150c26', { a: 'middle', w: 700 })}</g>`;
  },

  shield(p, [a, b, c]) {
    let dots = '';
    const r = rng(11);
    for (let i = 0; i < 22; i++) {
      const ang = r() * Math.PI * 2, rad = 60 + r() * 190;
      dots += `<circle cx="${480 + Math.cos(ang) * rad}" cy="${270 + Math.sin(ang) * rad * 0.8}" r="${3 + r() * 4}" fill="${c}" opacity=".8" class="tw" style="animation-delay:${(r() * 3).toFixed(2)}s"/>`;
    }
    const rings = [90, 160, 230].map((rad) => `<circle cx="480" cy="270" r="${rad}" fill="none" stroke="${c}" stroke-opacity=".25"/>`).join('');
    return `${rings}${dots}
<g class="sweep" style="transform-origin:480px 270px"><path d="M480 270L480 40A230 230 0 0 1 640 104Z" fill="${c}" opacity=".22"/></g>
<path d="M480 190l62 24v52c0 40-28 66-62 82-34-16-62-42-62-82v-52z" fill="#031316" stroke="${c}" stroke-width="3"/>
<path d="M452 270l22 22 40-46" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  },

  neural(p, [a, b, c]) {
    const layers = [4, 7, 8, 7, 4];
    let lines = '', nodes = '';
    const pos = layers.map((n, li) => Array.from({ length: n }, (_, i) => [140 + li * 170, 270 + (i - (n - 1) / 2) * 54]));
    pos.forEach((L, li) => {
      if (li === pos.length - 1) return;
      L.forEach(([x, y], i) => pos[li + 1].forEach(([x2, y2], j) => {
        if ((i + j + li) % 3 === 0) lines += `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-opacity=".16"/>`;
      }));
    });
    pos.forEach((L, li) => L.forEach(([x, y], i) => (nodes += `<circle cx="${x}" cy="${y}" r="9" fill="#05050f" stroke="${c}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4" fill="${c}" class="tw" style="animation-delay:${((i * 3 + li * 5) % 9) * 0.35}s"/>`)));
    const toks = ['how', 'far', 'na', 'wetin'].map((s, i) => `<g transform="translate(${60 + i * 8} ${66 + i * 0})"></g>`);
    return `${lines}${nodes}${txt(140, 56, 'tokens', 15, c, { w: 500, o: 0.85 })}${txt(820, 56, 'next token', 15, c, { a: 'end', w: 500, o: 0.85 })}
<g transform="translate(300 466)">${['wetin', 'dey', 'happen', '?'].map((s, i) => `<rect x="${i * 94}" y="0" width="82" height="34" rx="10" fill="#fff" opacity=".07" stroke="${c}" stroke-opacity=".5"/>${txt(i * 94 + 41, 23, s, 16, '#e6e8ff', { a: 'middle', w: 500 })}`).join('')}</g>`;
  },

  live(p, [a, b, c]) {
    let hearts = '';
    for (let i = 0; i < 6; i++) hearts += `<path d="M0 0c-2-3-7-1-5 3 1 2 5 5 5 5s4-3 5-5c2-4-3-6-5-3z" transform="translate(${560 + (i % 3) * 14} 400) scale(${1.6 + (i % 3) * 0.4})" fill="${c}" class="floaty" style="animation-delay:${i * 0.5}s"/>`;
    return `<rect x="338" y="30" width="284" height="480" rx="40" fill="#10060b" stroke="${c}" stroke-opacity=".6" stroke-width="2"/>
<rect x="352" y="46" width="256" height="448" rx="30" fill="url(#g${'LIVE'})"/>
<rect x="352" y="46" width="256" height="448" rx="30" fill="${c}" opacity=".14"/>
<circle cx="480" cy="230" r="54" fill="#fff" opacity=".1"/><circle cx="480" cy="208" r="22" fill="#fff" opacity=".18"/><path d="M432 290c10-34 66-34 96 0v20h-96z" fill="#fff" opacity=".18"/>
<rect x="372" y="64" width="62" height="26" rx="13" fill="#ff2e63"/><circle cx="388" cy="77" r="5" fill="#fff" class="blink"/>${txt(398, 83, 'LIVE', 13, '#fff', { w: 700 })}
<rect x="372" y="396" width="150" height="14" rx="7" fill="#fff" opacity=".2"/><rect x="372" y="420" width="110" height="14" rx="7" fill="#fff" opacity=".14"/>
<rect x="372" y="452" width="196" height="30" rx="15" fill="#fff" opacity=".12"/>${hearts}`;
  },

  ussd(p, [a, b, c]) {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
    const k = keys.map((s, i) => `<g><rect x="${340 + (i % 3) * 94}" y="${196 + Math.floor(i / 3) * 70}" width="82" height="58" rx="16" fill="#fff" opacity="${s === '*' || s === '#' ? 0.14 : 0.07}"/>${txt(381 + (i % 3) * 94, 235 + Math.floor(i / 3) * 70, s, 26, '#f1ffd6', { a: 'middle', w: 600 })}</g>`).join('');
    return `<rect x="310" y="34" width="340" height="474" rx="40" fill="#0b1204" stroke="${c}" stroke-opacity=".55" stroke-width="2"/>
<rect x="334" y="62" width="292" height="108" rx="18" fill="#000" opacity=".4"/>${txt(480, 118, '*123#', 40, c, { a: 'middle', w: 700 })}${txt(480, 150, 'Dialling…', 15, '#d9f5a0', { a: 'middle', w: 500, o: 0.7 })}${k}
<rect x="410" y="468" width="140" height="8" rx="4" fill="${c}" opacity=".6"/>`;
  },

  road(p, [a, b, c]) {
    let dashes = '';
    for (let i = 0; i < 7; i++) dashes += `<path d="M480 ${300 + i * 36}l${i * 2 + 4} 14" stroke="#fff" stroke-width="${3 + i * 1.2}" opacity=".7" class="dash" style="animation-delay:${i * 0.12}s"/>`;
    let speed = '';
    for (let i = 0; i < 16; i++) speed += `<line x1="${60 + i * 56}" y1="${210 + (i % 4) * 14}" x2="${60 + i * 56 + 22}" y2="${210 + (i % 4) * 14}" stroke="${c}" stroke-opacity=".4" stroke-width="2" class="zoom" style="animation-delay:${(i % 5) * 0.2}s"/>`;
    return `<rect y="250" width="960" height="290" fill="#0b0602"/><path d="M0 250H960" stroke="${c}" stroke-opacity=".7" stroke-width="2"/>
<path d="M430 250L130 540H830L530 250Z" fill="#1a1009"/><path d="M430 250L130 540" stroke="${c}" stroke-width="3" opacity=".8"/><path d="M530 250L830 540" stroke="${c}" stroke-width="3" opacity=".8"/>${dashes}${speed}
<circle cx="480" cy="230" r="64" fill="${c}" opacity=".35"/><circle cx="480" cy="230" r="46" fill="#ffe3b0" opacity=".8"/>
<g class="bounce"><path d="M404 470h152l-14-58c-6-20-24-30-44-30h-36c-20 0-38 10-44 30z" fill="#0f0a06" stroke="${c}" stroke-width="2"/><rect x="428" y="398" width="104" height="30" rx="8" fill="#ffcf8a" opacity=".25"/><rect x="408" y="446" width="34" height="14" rx="5" fill="#ff3b30"/><rect x="518" y="446" width="34" height="14" rx="5" fill="#ff3b30"/></g>
${txt(480, 70, 'DRIFT', 64, '#fff', { a: 'middle', w: 700 })}`;
  },

  city(p, [a, b, c]) {
    const r = rng(19);
    let b1 = '';
    for (let i = 0; i < 22; i++) {
      const h = 70 + r() * 240, w = 26 + r() * 26;
      b1 += `<rect x="${40 + i * 40}" y="${440 - h}" width="${w}" height="${h}" fill="#0a0703" stroke="${c}" stroke-opacity=".35"/>`;
      for (let k = 0; k < 6; k++) b1 += `<rect x="${46 + i * 40}" y="${450 - h + k * 38}" width="6" height="8" fill="${c}" opacity="${r() > 0.5 ? 0.8 : 0.15}" class="tw" style="animation-delay:${(r() * 4).toFixed(2)}s"/>`;
    }
    const sl = [['Oil price', 0.62], ['AI adoption', 0.8], ['Electricity', 0.35]].map(([s, v], i) => `<g transform="translate(70 ${70 + i * 40})">${txt(0, 0, s, 15, '#ffeccb', { w: 500 })}<rect x="130" y="-12" width="200" height="6" rx="3" fill="#fff" opacity=".15"/><rect x="130" y="-12" width="${200 * v}" height="6" rx="3" fill="${c}"/><circle cx="${130 + 200 * v}" cy="-9" r="9" fill="${c}"/></g>`).join('');
    return `<rect y="440" width="960" height="100" fill="#050301"/>${b1}${sl}${txt(890, 70, '2050', 40, c, { a: 'end', w: 700 })}`;
  },

  mall(p, [a, b, c]) {
    const dep = [['Supermarket', '#e8f0ff'], ['Clothing', '#ffd9a0'], ['Salon & Spa', '#ffc4d6'], ['Event Hall', '#c8f0d8']];
    return dep.map(([s, col], i) => `<g transform="translate(${130 + (i % 2) * 360} ${86 + Math.floor(i / 2) * 200})"><rect width="320" height="170" rx="6" fill="#0a111e" stroke="${c}" stroke-opacity=".5"/><rect width="320" height="8" fill="${col}"/><circle cx="52" cy="84" r="26" fill="${col}" opacity=".9"/>${txt(100, 80, s, 26, '#fff', { w: 700 })}${txt(100, 112, 'Hangers Mall, Uyo', 15, '#aab6d0', { w: 500 })}</g>`).join('') + txt(480, 508, 'Shop. Style. Shine.', 22, c, { a: 'middle', w: 600 });
  },

  points(p, [a, b, c]) {
    let bars = '';
    for (let i = 0; i < 7; i++) bars += `<rect x="${100 + i * 38}" y="${420 - (40 + ((i * 53) % 90))}" width="24" height="${40 + ((i * 53) % 90)}" rx="6" fill="${c}" opacity="${0.4 + i * 0.08}"/>`;
    return `${txt(480, 150, '12,480', 96, '#fff', { a: 'middle', w: 700 })}${txt(480, 190, 'PMP points', 22, c, { a: 'middle', w: 500 })}
<g transform="translate(250 230)"><rect width="460" height="64" rx="32" fill="#fff" opacity=".08" stroke="${c}" stroke-opacity=".5"/><rect x="6" y="6" width="320" height="52" rx="26" fill="${c}" class="load"/>${txt(230, 42, 'Banking survey 70%', 20, '#04202e', { a: 'middle', w: 700 })}</g>
${bars}${txt(700, 360, '= ₦', 60, c, { w: 700 })}${txt(780, 360, '12,480', 40, '#fff', { w: 600 })}`;
  },

  tiles(p, [a, b, c]) {
    const r = rng(23);
    const T = 40, ox = 140, oy = 60;
    let g = '';
    for (let y = 0; y < 11; y++)
      for (let x = 0; x < 20; x++) {
        const v = r();
        const px = ox + x * T, py = oy + y * T;
        if (v < 0.5) g += `<rect x="${px}" y="${py}" width="${T - 2}" height="${T - 2}" rx="4" fill="#3b2a12" stroke="#5b4220"/>`;
        else if (v < 0.62) g += `<circle cx="${px + 19}" cy="${py + 19}" r="16" fill="#6b6b73" stroke="#9a9aa5" stroke-width="2"/>`;
        else if (v < 0.72) g += `<path d="M${px + 19} ${py + 4}l14 14-14 18-14-18z" fill="${c}" class="tw" style="animation-delay:${(r() * 3).toFixed(2)}s"/>`;
      }
    return `${g}<g class="bounce"><rect x="${ox + 9 * T + 8}" y="${oy + 5 * T + 6}" width="24" height="30" rx="6" fill="#ffcf8a"/><rect x="${ox + 9 * T + 12}" y="${oy + 5 * T + 12}" width="16" height="8" fill="#222"/></g>`;
  },

  repo(p, [a, b, c]) {
    const r = rng(hash(p.slug));
    let bars = '';
    for (let i = 0; i < 40; i++) bars += `<rect x="${130 + i * 18}" y="${470 - (8 + r() * 80)}" width="12" height="${8 + r() * 80}" rx="3" fill="${c}" opacity="${0.25 + r() * 0.6}"/>`;
    const letter = (p.title || '?').slice(0, 2).toUpperCase();
    return `${txt(480, 280, letter, 190, '#fff', { a: 'middle', w: 700, o: 0.92 })}${txt(480, 346, p.language || 'GitHub repository', 26, c, { a: 'middle', w: 500 })}${bars}`;
  },
};

/* ------------------------------------------------------------------ UI mocks */

function phoneUI(p, [a, b, c]) {
  const ui = p.ui || { title: p.title, items: p.features?.slice(0, 4) || [], cta: 'Open' };
  const rows = ui.items.slice(0, 4).map((s, i) => `<g><rect x="396" y="${164 + i * 58}" width="168" height="46" rx="14" fill="#fff" opacity=".07"/><circle cx="418" cy="${187 + i * 58}" r="9" fill="${c}" opacity="${0.95 - i * 0.14}"/>${txt(436, 192 + i * 58, cut(s, 15), 14, '#eaf7f0', { w: 500 })}</g>`).join('');
  return `<rect x="368" y="30" width="224" height="480" rx="36" fill="#020805" stroke="${c}" stroke-opacity=".6" stroke-width="2"/>
<rect x="378" y="42" width="204" height="456" rx="28" fill="#06120d"/><rect x="454" y="50" width="52" height="12" rx="6" fill="#000"/>
${txt(396, 126, cut(ui.title, 16), 21, '#fff', { w: 700 })}${rows}
<rect x="396" y="434" width="168" height="40" rx="20" fill="${c}"/>${txt(480, 460, ui.cta || 'Open', 15, '#04140c', { a: 'middle', w: 700 })}
${txt(70, 236, cut(p.title, 18), 46, '#fff', { w: 700 })}${txt(70, 276, cut(p.tagline, 36), 18, c, { w: 500 })}${txt(70, 306, cut(p.tagline.slice(34), 36), 18, c, { w: 500 })}
${txt(890, 480, p.stack?.[0] || '', 20, '#fff', { a: 'end', w: 500, o: 0.55 })}`;
}

function browserUI(p, [a, b, c]) {
  const ui = p.ui || { title: p.title, items: p.features?.slice(0, 3) || [], cta: 'Open' };
  const cards = ui.items.slice(0, 3).map((s, i) => `<g transform="translate(${164 + i * 232} 332)"><rect width="212" height="128" rx="12" fill="#fff" opacity=".06" stroke="${c}" stroke-opacity=".35"/><rect x="16" y="16" width="40" height="40" rx="10" fill="${c}" opacity="${0.9 - i * 0.18}"/>${txt(16, 92, cut(s, 17), 17, '#fff', { w: 600 })}<rect x="16" y="104" width="${100 - i * 14}" height="6" rx="3" fill="#fff" opacity=".16"/></g>`).join('');
  return `<rect x="110" y="48" width="740" height="444" rx="16" fill="#04090c" stroke="${c}" stroke-opacity=".5" stroke-width="2"/>
<rect x="110" y="48" width="740" height="40" rx="16" fill="#fff" opacity=".06"/><circle cx="136" cy="68" r="6" fill="#ff5f57"/><circle cx="158" cy="68" r="6" fill="#febc2e"/><circle cx="180" cy="68" r="6" fill="#28c840"/>
<rect x="260" y="56" width="440" height="24" rx="12" fill="#fff" opacity=".07"/>${txt(480, 73, (p.links?.live || p.links?.repo || 'localhost').replace(/^https?:\/\//, '').slice(0, 44), 12, '#cfe', { a: 'middle', w: 500, o: 0.7 })}
${txt(164, 170, cut(ui.title, 28), 40, '#fff', { w: 700 })}${txt(164, 206, cut(p.tagline, 62), 18, c, { w: 500 })}
<rect x="164" y="236" width="150" height="46" rx="23" fill="${c}"/>${txt(239, 266, ui.cta || 'Open', 17, '#04140c', { a: 'middle', w: 700 })}${cards}`;
}

function codeUI(p, [a, b, c]) {
  const stack = (p.stack || []).slice(0, 6);
  const feats = (p.features || []).slice(0, 4);
  let y = 118;
  let out = `<rect x="130" y="44" width="700" height="452" rx="14" fill="#03070a" stroke="${c}" stroke-opacity=".5" stroke-width="2"/><rect x="130" y="44" width="700" height="38" rx="14" fill="#fff" opacity=".05"/>${txt(156, 69, `${p.slug}.md`, 14, '#b9cfc4', { mono: 1, w: 500 })}`;
  out += txt(160, y, `// ${cut(p.title, 40)}`, 17, '#6c8b7d', { mono: 1, w: 500 });
  y += 36;
  out += txt(160, y, 'stack', 17, c, { mono: 1, w: 600 }) + txt(222, y, `= [${stack.map((s) => `"${s}"`).join(', ')}]`.slice(0, 58), 17, '#e9f5ee', { mono: 1, w: 500 });
  y += 44;
  feats.forEach((f) => {
    out += txt(160, y, '✓', 17, c, { mono: 1, w: 700 }) + txt(190, y, cut(f, 56), 17, '#d8e9df', { mono: 1, w: 500 });
    y += 36;
  });
  out += `<rect x="160" y="${y + 6}" width="11" height="20" fill="${c}" class="blink"/>`;
  return out;
}

const uiFor = (p, pal) => (p.ui?.type === 'phone' ? phoneUI(p, pal) : browserUI(p, pal));

/* ------------------------------------------------------------------ public */

export function slidesFor(p) {
  const pal = p.pal || ['#0c1116', '#18222b', '#2ce28a'];
  const scene = scenes[p.scene] || scenes.repo;
  const u = (n) => `${p.slug.replace(/[^a-z0-9]/gi, '')}${n}`;
  const sceneSvg = frame(u(0), pal, scene(p, pal)).replace('url(#gLIVE)', `url(#g${u(0)})`);
  return [
    sceneSvg,
    frame(u(1), pal, uiFor(p, pal)),
    frame(u(2), pal, codeUI(p, pal)),
  ];
}

export const hasScene = (name) => !!scenes[name];
