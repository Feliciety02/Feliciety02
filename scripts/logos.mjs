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

export function logo(name) {
  const [g, pal] = LOGOS[name]();
  return [g.rows(), pal];
}
