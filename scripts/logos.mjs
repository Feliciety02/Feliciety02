// 16x16 pixel-art takes on the tech logos, drawn in the same style as the farm.
import { Grid, GLYPHS } from './pixel.mjs';

function glyph(g, ch, x, y, color) {
  (GLYPHS[ch] || []).forEach((row, r) => [...row].forEach((c, i) => c === '#' && g.set(x + i, y + r, color)));
}
function roundedSquare(fill, shade) {
  const g = new Grid(16, 16).rect(1, 0, 14, 16, fill).rect(0, 1, 16, 14, fill);
  g.rect(1, 15, 14, 1, shade).rect(15, 1, 1, 14, shade);
  return g;
}

const LOGOS = {
  ts: () => {
    const g = roundedSquare('b', 'B');
    glyph(g, 'T', 3, 7, 'w'); glyph(g, 'S', 9, 7, 'w');
    return [g, { b: '#3178c6', B: '#235a99', w: '#ffffff' }];
  },
  js: () => {
    const g = roundedSquare('y', 'Y');
    glyph(g, 'J', 3, 7, 'k'); glyph(g, 'S', 9, 7, 'k');
    return [g, { y: '#f7df1e', Y: '#c9b40f', k: '#2b2b2b' }];
  },
  python: () => {
    const blue = ['....bbbbbbb', '...bbwbbbbbb', '...bbbbbbbbb', '.........bbb', '.bbbbbbbbbbb', 'bbbbbbbbbbbb', 'bbbbbbbbbbb', 'bbbbb', 'bbbb', 'bbbb', '.bbb'];
    const g = new Grid(16, 16);
    blue.forEach((row, y) => [...row].forEach((c, x) => {
      if (c === '.') return;
      g.set(x, y, c === 'w' ? 'w' : 'b');
      g.set(15 - x, 15 - y, c === 'w' ? 'w' : 'y');
    }));
    return [g, { b: '#3772a4', y: '#ffd43b', w: '#ffffff' }];
  },
  php: () => {
    const g = new Grid(16, 16);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const d = ((x + 0.5 - 8) / 8) ** 2 + ((y + 0.5 - 8) / 5.5) ** 2;
      if (d <= 1) g.set(x, y, d > 0.72 ? 'P' : 'p');
    }
    const mini = { p: ['###', '#.#', '###', '#..', '#..'], h: ['#..', '#..', '###', '#.#', '#.#'] };
    [['p', 2], ['h', 6], ['p', 10]].forEach(([ch, x]) => mini[ch].forEach((row, r) => [...row].forEach((c, i) => c === '#' && g.set(x + i, 5 + r, 'w'))));
    return [g, { p: '#8892bf', P: '#4f5b93', w: '#ffffff' }];
  },
  html: () => {
    const g = new Grid(16, 16);
    for (let y = 0; y < 16; y++) {
      const inset = y < 11 ? 1 : 1 + (y - 10) * 1.5;
      for (let x = Math.ceil(inset); x < 16 - Math.ceil(inset); x++) g.set(x, y, x < 8 ? 'o' : 'O');
    }
    glyph(g, '5', 6, 3, 'w');
    for (let y = 3; y < 10; y++) for (let x = 8; x < 11; x++) if (g.get(x, y) === 'w') g.set(x, y, 'W');
    return [g, { o: '#e34f26', O: '#f06529', w: '#ffffff', W: '#ebebeb' }];
  },
  vue: () => {
    const g = new Grid(16, 16);
    for (let y = 0; y < 14; y++) for (let x = 0; x < 16; x++) {
      const d = Math.abs(x + 0.5 - 8);
      const outer = 8 * (1 - y / 14), dark = 5 * (1 - y / 9), hole = 2.2 * (1 - y / 4);
      if (d < hole) continue;
      if (d < dark) g.set(x, y + 1, 'n');
      else if (d < outer) g.set(x, y + 1, 'g');
    }
    return [g, { g: '#41b883', n: '#35495e' }];
  },
  java: () => {
    const rows = ['......o...o', '.....o...o', '.....o...o', '......o...o', '', '..uuuuuuuuuu', '..uUUUUUUUUuuu', '..uUUUUUUUUu.u', '..uUUUUUUUUuuu', '...uUUUUUUu', '....uuuuuu', '', '.uuuuuuuuuuuuu', '..uuuuuuuuuuu'];
    const g = new Grid(16, 16);
    rows.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && g.set(x, y + 1, c)));
    return [g, { o: '#e76f00', u: '#5382a1', U: '#ffffff' }];
  },
  dart: () => {
    const g = new Grid(16, 16);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const d = Math.abs(x + 0.5 - 8) + Math.abs(y + 0.5 - 8);
      if (d <= 8) g.set(x, y, d > 6 ? 'D' : x + y < 15 ? 'c' : 'C');
    }
    return [g, { c: '#40c4ff', C: '#0175c2', D: '#01579b' }];
  },
  figma: () => {
    const g = new Grid(16, 16);
    const cell = (cx, cy, ch, round) => {
      g.disc(cx, cy, 2.6, ch);
      if (round !== 'all') g.rect(round === 'left' ? cx : cx - 2, cy - 2, 3, 5, ch);
    };
    cell(5.5, 2.5, 'r', 'left'); cell(10.5, 2.5, 'o', 'right');
    cell(5.5, 7.5, 'p', 'left'); cell(10.5, 7.5, 'b', 'all');
    cell(5.5, 12.5, 'g', 'left');
    g.rect(8, 10, 1, 3, 'g');
    return [g, { r: '#f24e1e', o: '#ff7262', p: '#a259ff', b: '#1abcfe', g: '#0acf83' }];
  },
};

// ----- more languages + social icons
Object.assign(LOGOS, {
  css: () => {
    const [g] = LOGOS.html();
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const v = g.get(x, y);
      if (v === 'o') g.set(x, y, 'b'); else if (v === 'O') g.set(x, y, 'B');
    }
    for (let y = 3; y < 10; y++) for (let x = 5; x < 11; x++) if ('wW'.includes(g.get(x, y))) g.set(x, y, x < 8 ? 'b' : 'B');
    glyph(g, '3', 6, 3, 'w');
    return [g, { b: '#1572b6', B: '#33a9dc', w: '#ffffff' }];
  },
  jupyter: () => {
    const g = new Grid(16, 16);
    for (let x = 2; x < 14; x++) { const d = Math.round(Math.abs(x - 7.5) / 3); g.set(x, 4 + d, 'o').set(x, 11 - d, 'o'); g.set(x, 5 + d, 'O').set(x, 10 - d, 'O'); }
    g.rect(1, 1, 2, 2, 'g').rect(13, 0, 2, 2, 'g').rect(2, 13, 2, 2, 'g');
    return [g, { o: '#f37626', O: '#d65b0f', g: '#767677' }];
  },
  linkedin: () => {
    const g = roundedSquare('b', 'B');
    g.rect(3, 6, 2, 7, 'w').rect(3, 3, 2, 2, 'w');
    g.rect(7, 6, 2, 7, 'w').rect(9, 6, 3, 2, 'w').rect(11, 7, 2, 6, 'w');
    return [g, { b: '#0a66c2', B: '#074a8c', w: '#ffffff' }];
  },
  instagram: () => {
    const g = new Grid(16, 16);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (!((x < 1 || x > 14) && (y < 1 || y > 14))) g.set(x, y, x + y < 10 ? 'a' : x + y < 20 ? 'b' : 'c');
    g.rect(3, 3, 10, 1, 'w').rect(3, 12, 10, 1, 'w').rect(3, 3, 1, 10, 'w').rect(12, 3, 1, 10, 'w');
    for (let y = 5; y < 11; y++) for (let x = 5; x < 11; x++) { const d = Math.hypot(x - 7.5, y - 7.5); if (d > 1.6 && d < 2.9) g.set(x, y, 'w'); }
    g.set(10, 5, 'w');
    return [g, { a: '#feda75', b: '#d62976', c: '#7e3aaf', w: '#ffffff' }];
  },
  facebook: () => {
    const g = new Grid(16, 16).disc(7.5, 7.5, 7.8, 'b');
    g.rect(8, 4, 3, 2, 'w').rect(7, 5, 2, 11, 'w').rect(5, 8, 6, 2, 'w');
    return [g, { b: '#1877f2', w: '#ffffff' }];
  },
  x: () => {
    const g = roundedSquare('k', 'k');
    for (let i = 0; i < 10; i++) { g.set(3 + i, 3 + i, 'w').set(4 + i, 3 + i, 'w'); g.set(12 - i, 3 + i, 'w'); }
    return [g, { k: '#111111', w: '#ffffff' }];
  },
  youtube: () => {
    const g = new Grid(16, 16).rect(1, 3, 14, 10, 'r').rect(0, 4, 16, 8, 'r');
    for (let i = 0; i < 4; i++) g.rect(6, 5 + i, 1 + i, 1, 'w').rect(6, 10 - i, 1 + i, 1, 'w');
    return [g, { r: '#ff0000', w: '#ffffff' }];
  },
  mail: () => {
    const g = new Grid(16, 16).rect(1, 3, 14, 10, 'w').rect(1, 3, 14, 1, 'k').rect(1, 12, 14, 1, 'k').rect(1, 3, 1, 10, 'k').rect(14, 3, 1, 10, 'k');
    for (let i = 0; i < 6; i++) g.set(2 + i, 4 + i, 'k').set(13 - i, 4 + i, 'k');
    g.rect(10, 9, 3, 2, 'r');
    return [g, { w: '#fff3d6', k: '#4a2a14', r: '#d94a5a' }];
  },
});

const BY_LANGUAGE = {
  typescript: 'ts', javascript: 'js', python: 'python', php: 'php', html: 'html', css: 'css', vue: 'vue',
  java: 'java', dart: 'dart', 'jupyter notebook': 'jupyter', figma: 'figma',
};
const BY_PROVIDER = { LINKEDIN: 'linkedin', INSTAGRAM: 'instagram', FACEBOOK: 'facebook', TWITTER: 'x', YOUTUBE: 'youtube' };

/** Any language: a known pixel logo, or a coloured tile with its initials. */
function generic(label, color = '#8a8a8a') {
  const g = roundedSquare('c', 'C');
  const words = label.replace(/[^A-Za-z0-9+# ]/g, '').split(/\s+/).filter(Boolean);
  const ab = (words.length > 1 ? words[0][0] + words[1][0] : (words[0] || '?').slice(0, 2)).toUpperCase();
  const hex = color.replace('#', '');
  const [r, gg, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) || 0);
  const ink = r * 0.299 + gg * 0.587 + b * 0.114 > 150 ? 'k' : 'w';
  glyph(g, ab[0], 2, 7, ink); if (ab[1]) glyph(g, ab[1], 8, 7, ink);
  return [g, { c: color, C: '#00000033', w: '#ffffff', k: '#2b2b2b' }];
}

export function logoFor(label, color) {
  const key = BY_LANGUAGE[String(label).toLowerCase()];
  const [g, pal] = key ? LOGOS[key]() : generic(label, color);
  return [g.rows(), pal];
}
export function socialIcon(provider) {
  const [g, pal] = LOGOS[BY_PROVIDER[provider] || 'mail']();
  return [g.rows(), pal];
}

export function logo(name) {
  const [g, pal] = LOGOS[name]();
  return [g.rows(), pal];
}
