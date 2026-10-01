import {ARCHIVO_BLACK} from './archivo-black.mjs';

// Derived from the user's pro-thermal.svg. Default output is tested byte-for-byte.
const PATH = 'M0 2.7h56.5q22.8 0 33.8 10.1q11.1 10.2 11.1 28.2q0 8.3-2.8 15.3q-2.7 7.2-8 13q-5.3 5.8-12.7 8.8q-8.3 3.1-18.5 3.1h-29v45.1h-30.4v-123.6zM30.4 27.5v28.8h19.8q10.7 0 15.5-3.4q4.7-3.3 4.7-10.6q0-7.4-4.7-11q-4.8-3.8-15.5-3.8h-19.8zM108.3 2.7h66.8q6.8 0 13.4 2.5q7.1 2.5 12.1 7.2q4.8 4.6 7.2 10.9q2.4 6 2.4 14.2q0 24.9-17.8 35.2q2.8 1 4.4 1.9q4.3 2.2 6.2 5.9q1.8 3.3 2.5 9.7q.5 4.7 .8 19.3q0 3.1 .9 4.7q.9 1.4 3.3 2.6l1.5 .8v8.7h-32.2l-.6-1.4q-2.1-4.7-2.8-8.9q-.6-4.1-.6-12.6v-.1l.3-11.5q0-4.8-2.3-6.8q-2.3-2.1-7.9-2.1h-27v43.4h-30.6v-123.6zM138.9 27.8v30h28.2q7.2 0 9.8-3.8q2.1-3.3 2.1-12.3q0-8.3-2.2-11q-2.6-2.9-9.7-2.9h-28.2zM275.6 0q13.4 0 24.8 4.6q11.2 4.5 19.6 12.8q8.2 8.3 12.6 20.3q4.4 12.7 4.4 27.3q0 14.3-4.4 26.8q-4.4 11.7-12.6 19.9q-8.4 8.3-19.6 12.7q-11.3 4.6-24.6 4.6q-13.5 0-24.8-4.6q-11.1-4.5-19.4-12.8q-8.1-8.3-12.4-20.2q-4.3-12.6-4.3-27.2q0-14.1 4.3-26.4q4.3-11.9 12.3-20.1q8.3-8.4 19.3-13q11.4-4.7 24.8-4.7zM275.8 24.6q-6.8 0-12.4 2.6q-5.5 2.5-9.4 7.6q-4.1 5.4-6.2 12.7q-2.3 7.6-2.3 16.7q0 9.4 2.3 17.1q2.1 7.5 6.1 12.8q4 5.1 9.5 7.5q5.6 2.5 12.4 2.5q6.7 0 12.3-2.5q5.5-2.4 9.5-7.5q4-5.2 6.2-12.5q2.3-7.6 2.3-16.7q0-9.4-2.2-17.2q-2.2-7.5-6.2-12.8q-3.9-5.3-9.4-7.7q-5.7-2.6-12.5-2.6z';

export const DEFAULTS = Object.freeze({
  word: 'PRO', dur: 4.4, angle: -35, edge: 8, heat: 7.3, grain: 0.14,
  period: 486, seed: 0, path: null, bounds: Object.freeze([0, 0, 337, 129]), fillRule: 'nonzero',
  palette: Object.freeze(['#050611', '#050822', '#050c3b', '#030f55', '#031a6e', '#063f92', '#0b70c0', '#1aa6ea', '#6ccbf6', '#c6e0ee', '#f0d4a8', '#f4a95c', '#ee5a2a', '#e8456a', '#ee5cb3', '#f39ae0', '#ffffff']),
  stops: Object.freeze(['#323232', '#353535', '#545454', '#9f9f9f', '#cccccc', '#9f9f9f', '#545454', '#353535', '#323232']),
});

export const LIMITS = Object.freeze({dur: [.2, 60], angle: [-180, 180], edge: [0, 32], heat: [0, 32], grain: [0, 1], period: [48, 2000], seed: [0, 9999]});
const num = (value, digits = 2) => String(+value.toFixed(digits)).replace(/^(-?)0\./, '$1.');
export const escapeXml = value => String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[char]));

export function normalize(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Parameters must be a JSON object.');
  for (const key of Object.keys(input)) if (!Object.hasOwn(DEFAULTS, key)) throw new TypeError(`Unknown parameter: ${key}`);
  const p = {...DEFAULTS, ...input};
  for (const [key, [min, max]] of Object.entries(LIMITS)) {
    if (typeof p[key] !== 'number' || !Number.isFinite(p[key]) || p[key] < min || p[key] > max) throw new RangeError(`${key} must be a number between ${min} and ${max}.`);
  }
  if (!Number.isInteger(p.seed)) throw new TypeError('seed must be an integer.');
  if (typeof p.word !== 'string' || !p.word.trim() || [...p.word].length > 32) throw new TypeError('word must contain 1–32 characters.');
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(p.word)) throw new TypeError('word contains invalid control characters.');
  for (const key of ['palette', 'stops']) {
    if (!Array.isArray(p[key]) || p[key].length < 2 || p[key].length > 32 || p[key].some(c => typeof c !== 'string' || !/^#[\da-f]{6}$/i.test(c))) throw new TypeError(`${key} must contain 2–32 #RRGGBB colors.`);
    p[key] = [...p[key]];
  }
  if (!Array.isArray(p.bounds) || p.bounds.length !== 4 || p.bounds.some(n => !Number.isFinite(n)) || p.bounds[2] <= 0 || p.bounds[3] <= 0) throw new TypeError('bounds must be [x, y, positive width, positive height].');
  p.bounds = [...p.bounds];
  if (!['nonzero', 'evenodd'].includes(p.fillRule)) throw new TypeError('fillRule must be nonzero or evenodd.');
  if (p.path !== null && (typeof p.path !== 'string' || !/^\s*[Mm][\s\S]*$/.test(p.path) || !/^[\s\d.eE+,MmZzLlHhVvCcSsQqTtAa-]+$/.test(p.path))) throw new TypeError('path must be SVG path data, not SVG markup.');
  return p;
}

const profileCache = new WeakMap();
function outlineProfile(commands) {
  if (profileCache.has(commands)) return profileCache.get(commands);
  const rows = new Map();
  let x = 0, y = 0, startX = 0, startY = 0;
  const sample = (row, px) => {
    const span = rows.get(row) ?? [Infinity, -Infinity];
    rows.set(row, [Math.min(span[0], px), Math.max(span[1], px)]);
  };
  const line = (nx, ny) => {
    if (ny === y) {sample(Math.round(y), x); sample(Math.round(y), nx);}
    else for (let row = Math.ceil(Math.min(y, ny)); row <= Math.floor(Math.max(y, ny)); row++) {
      sample(row, x + (nx - x) * (row - y) / (ny - y));
    }
    x = nx; y = ny;
  };
  for (const [command, ...p] of commands) {
    if (command === 'M') {
      x = startX = p[0]; y = startY = p[1];
      for (let i = 2; i < p.length; i += 2) line(p[i], p[i + 1]);
    } else if (command === 'L') {
      for (let i = 0; i < p.length; i += 2) line(p[i], p[i + 1]);
    } else if (command === 'H') p.forEach(nx => line(nx, y));
    else if (command === 'V') p.forEach(ny => line(x, ny));
    else if (command === 'Z') line(startX, startY);
    else if (command === 'Q' || command === 'C') {
      const ox = x, oy = y;
      // Glyphs have a 129-unit cap height; 32 segments keep contour fitting subpixel.
      for (let step = 1; step <= 32; step++) {
        const t = step / 32, u = 1 - t;
        if (command === 'Q') line(u*u*ox + 2*u*t*p[0] + t*t*p[2], u*u*oy + 2*u*t*p[1] + t*t*p[3]);
        else line(u*u*u*ox + 3*u*u*t*p[0] + 3*u*t*t*p[2] + t*t*t*p[4], u*u*u*oy + 3*u*u*t*p[1] + 3*u*t*t*p[3] + t*t*t*p[5]);
      }
    }
  }
  profileCache.set(commands, rows);
  return rows;
}

function outlineText(word) {
  const glyphs = [...word.normalize('NFC')].map(c => ARCHIVO_BLACK[c.codePointAt(0)]);
  // Let the browser shape scripts/combining marks outside the bundled font.
  if (glyphs.some(g => !g || g[0] === 0)) return null;
  const paths = [];
  let x = 0, left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  let previous = null;
  for (const [advance, ink, commands] of glyphs) {
    if (ink && commands.length) {
      const profile = outlineProfile(commands);
      if (previous) {
        let distance = -Infinity;
        for (const [row, [nextLeft]] of profile) {
          if (previous.profile.has(row)) distance = Math.max(distance, previous.profile.get(row)[1] - nextLeft);
        }
        // Match the traced PRO's P–R gap: thermal edges join without fusing the blue cores.
        x = previous.x + (Number.isFinite(distance) ? distance : previous.right - ink[0]) + 6.9;
      }
      // One compound path keeps the stripe continuous across all letters.
      paths.push(commands.map(([command, ...points]) => command + points.map((n, i) =>
        num(n + (command !== 'V' && (command === 'H' || i % 2 === 0) ? x : 0), 3)
      ).join(' ')).join(''));
      left = Math.min(left, x + ink[0]); top = Math.min(top, ink[1]);
      right = Math.max(right, x + ink[2]); bottom = Math.max(bottom, ink[3]);
      previous = {profile, x, right: ink[2]};
    } else {
      previous = null; // Explicit spaces retain their font advance between words.
    }
    x += advance;
  }
  return paths.length ? {path: paths.join(''), bounds: [left, top, right - left, bottom - top]} : null;
}

export function buildSvg(input = {}, stage = 5) {
  const p = normalize(input);
  if (!Number.isInteger(stage) || stage < 1 || stage > 5) throw new RangeError('stage must be an integer from 1 to 5.');
  const lettering = p.path === null && p.word !== 'PRO' ? outlineText(p.word) : null;
  const outlined = p.path !== null || p.word === 'PRO' || lettering !== null;
  const bounds = p.path !== null ? p.bounds : p.word === 'PRO' ? [0, 0, 337, 129] : lettering?.bounds ?? [0, 0, Math.ceil([...p.word].reduce((n, c) => n + (c.codePointAt(0) < 128 ? 1 : 1.2), 0) * 150), 180];
  const pad = outlined ? 12 : 20;
  const viewBox = [bounds[0] - pad, bounds[1] - pad, bounds[2] + pad * 2, bounds[3] + pad * 2].map(n => num(n, 3)).join(' ');
  const angle = p.angle * Math.PI / 180;
  const gx = Math.round(p.period * Math.cos(angle)), gy = Math.round(p.period * Math.sin(angle));
  const tables = [0, 1, 2].map(i => p.palette.map(c => num(parseInt(c.slice(1 + i * 2, 3 + i * 2), 16) / 255)).join(' '));
  const lines = [];
  const add = (from, indent, text) => lines.push({from, text: '  '.repeat(indent) + text});
  add(1, 0, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">`);
  if (stage >= 2) add(2, 1, '<defs>');
  if (stage >= 3) {
    add(3, 2, `<linearGradient id="stripe" x2="${gx}" y2="${gy}"`);
    add(3, 3, 'gradientUnits="userSpaceOnUse" spreadMethod="repeat">');
    p.stops.forEach((c, i) => add(3, 3, `<stop ${i ? `offset="${num(i / (p.stops.length - 1), 3)}" ` : ''}stop-color="${c}"/>`));
    add(3, 3, '<animateTransform attributeName="gradientTransform"');
    add(3, 4, `type="translate" to="${gx} ${gy}" dur="${num(p.dur, 3)}s"`);
    add(3, 4, 'repeatCount="indefinite"/>');
    add(3, 2, '</linearGradient>');
  }
  if (stage >= 2) {
    add(2, 2, '<filter id="material" color-interpolation-filters="sRGB">');
    add(2, 3, `<feGaussianBlur in="SourceAlpha" stdDeviation="${num(p.edge, 3)}"/>`);
    add(2, 3, '<feColorMatrix values="0 0 0 .616 0 0 0 0 .616 0 0 0 0 .616 0 0 0 0 0 1"/>');
    add(2, 3, '<feComposite in2="SourceAlpha" operator="in"/>');
    if (stage >= 3) add(3, 3, '<feBlend in="SourceGraphic" mode="overlay"/>');
    add(2, 2, '</filter>');
  }
  if (stage >= 4) {
    add(4, 2, '<filter id="color" color-interpolation-filters="sRGB"');
    add(4, 3, 'x="-20%" y="-50%" width="140%" height="200%">');
    add(4, 3, '<feFlood flood-color="#fff" result="paper"/>');
    if (stage >= 5) {
      add(5, 3, `<feGaussianBlur in="SourceGraphic" stdDeviation="${num(p.heat, 3)}"/>`);
      add(5, 3, '<feComposite in2="paper" result="heat"/>');
      add(5, 3, `<feTurbulence type="fractalNoise" baseFrequency="4"${p.seed ? ` seed="${p.seed}"` : ''}/>`);
      add(5, 3, '<feColorMatrix values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1"/>');
      add(5, 3, `<feComposite in="heat" operator="arithmetic" k2="2" k3="${num(p.grain, 3)}" k4="${num(-.38 - p.grain / 2, 3)}"/>`);
    } else {
      add(4, 3, '<feComposite in="SourceGraphic" in2="paper"/>');
      add(4, 3, '<feComposite in2="paper" operator="arithmetic" k2="2" k4="-.38"/>');
    }
    add(4, 3, '<feComponentTransfer>');
    ['R', 'G', 'B'].forEach((c, i) => add(4, 4, `<feFunc${c} type="table" tableValues="${tables[i]}"/>`));
    add(4, 3, '</feComponentTransfer>');
    add(4, 2, '</filter>');
  }
  if (stage >= 2) add(2, 1, '</defs>');
  const indent = stage >= 4 ? 2 : 1;
  if (stage >= 4) add(4, 1, '<g filter="url(#color)">');
  if (outlined) add(1, indent, `<path d="${escapeXml(p.path ?? lettering?.path ?? PATH)}"${p.fillRule === 'evenodd' ? ' fill-rule="evenodd"' : ''}`);
  else add(1, indent, '<text x="0" y="140" font-family="Arial Black, Noto Sans CJK SC, sans-serif" font-weight="900" font-size="150"');
  if (stage >= 2) add(2, indent + 1, 'filter="url(#material)"');
  add(stage >= 3 ? 3 : 1, indent + 1, `fill="${stage >= 3 ? 'url(#stripe)' : '#9d9d9d'}"${outlined ? '/>' : `>${escapeXml(p.word)}</text>`}`);
  if (stage >= 4) add(4, 1, '</g>');
  add(1, 0, '</svg>');
  return {source: lines.map(l => l.text).join('\n') + '\n', lines, params: p, outlined};
}
