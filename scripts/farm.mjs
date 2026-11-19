// The animated farm. Every day of the contribution calendar is a tilled plot;
// busier days grow bigger crops. The year runs left to right through the four
// seasons, a little farmer waters each plot, and the sky turns from day to a
// starry night and back.
import { sprite, text, textWidth, rng, hash, Grid, snowify } from './pixel.mjs';

const P = 16;

// ---------------------------------------------------------------- palettes
const CP = { // crops
  g: '#93e25c', G: '#52b03a', h: '#2e7a28', H: '#1f5520',
  r: '#ff5a5f', R: '#c22f3f', l: '#ffc3c3',
  o: '#ffa13a', O: '#e06e1c', D: '#9a4512', a: '#ffd08a',
  y: '#ffe25a', Y: '#eba61c', B: '#6b3d1a', n: '#8a5326',
  p: '#ff9fca', P: '#e05f9c', u: '#7f9bff', U: '#3e55c4',
  m: '#a6ea78', M: '#3f9b3a', t: '#d2a85e', T: '#8f6a2e',
  e: '#fff09a', E: '#e2bf35', w: '#ffffff', W: '#d6e4f0', x: '#20160e', q: '#ff8a3d',
  K: '#2d1b10', i: '#c8f0ff', I: '#5aa9e6',
};
const FP = { // farmer
  T: '#c9973a', t: '#f4d27a', H: '#d94a5a', n: '#7a4428', N: '#55301b', s: '#ffd6b3', S: '#d9776a',
  x: '#2a1d14', q: '#ff9aa8', r: '#ea6b74', u: '#5486d6', U: '#355ea6', f: '#5a3a1e', m: '#c7d2d9', M: '#7d8b95',
};

const SEASON = {
  spring: { base: '#7fcb52', a: '#62b13c', b: '#a6e27a', dot: '#ffb3d1', icon: 'flower' },
  summer: { base: '#5db63d', a: '#46992c', b: '#82d457', dot: '#fff27a', icon: 'sun' },
  fall: { base: '#c2a743', a: '#a28733', b: '#dcc260', dot: '#e8742c', icon: 'leaf' },
  winter: { base: '#e9f1fa', a: '#c9d8ea', b: '#ffffff', dot: '#bcd3ea', icon: 'flake' },
};
const seasonOf = (iso) => {
  const m = +iso.slice(5, 7);
  return m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'fall' : 'winter';
};

// ------------------------------------------------------------------ sprites
const CROPS = {
  sprout: ['', '', '', '', '', '', '', '', '', '.....gg..gg', '....gGGg.gGg', '.....gGGGGg', '.......GG', '.......hG'],
  young: ['', '', '', '', '', '.......gg', '......gGGg', '...gg..GG..gg', '..gGGg.Gh.gGGg', '...gGGgGhgGGg', '....hGGGGGGh', '......hGGh', '.......Gh', '.......hh'],
  tulip: ['', '...rr....pp', '..rRrr..pPpp', '..rRRr..pPPp', '...rr....pp', '....G.....G', '..g.G..g..G', '.gGgGg.gG.G.g', '..gGgG..gGgGgG', '...hGG...GhGh', '....hG....h', '.....hGGGGh', '.......hh'],
  strawberry: ['', '', '', '.....gg.gg', '....gGGgGGg', '...gGhGGGhGg', '..gGGwGhGGGGg', '..GrRGGGGGrRG', '.gGRrGhGrRGGg', '.GGRRGGGRrGGh', '..hGGgrRGGGh', '...hGGRRGhh', '....hhhhhh'],
  cabbage: ['', '', '', '', '.....HHHHHH', '...HHGgggggGHH', '..HGgggGGgggGH', '..HgggGggGgggH', '.HGggGgggggGggH', '.HGgGggGGgggGGH', '.HGGgggggggGGH', '..HGGGgggGGGH', '...HHGGGGGHH', '.....HHHHH'],
  blueberry: ['', '', '......gg', '....gGGGgg', '...gGGuUGGg', '..gGuUGGGuUG', '..GGUUGGuGUGg', '.gGGGGuUGGGGg', '.GuUGGUUGGuUG', '.GUUGGGGGGUUG', '..hGGGuUGGGh', '...hhGUUGhh', '.....hhhh'],
  sunflower: ['.....yyYyy', '...yyYYYYYyy', '..yYYyyyyyYYy', '..yYyBBBBByYy', '.yYyBBnBBBByYy', '.yYyBBBBnBByYy', '..yYyBnBBByYy', '..yYYyBBByYYy', '...yyYYYYYyy', '.....yyYyy', '.......G', '...gg..G', '..gGGg.G..gg', '...gGGgG.gGGg', '.....hGGgGGg', '.......Gh', '.......Gh', '.......hh'],
  tomato: ['.......tT', '.....g.tT.g', '....gGgtTgGg', '...gGrRtTGGg', '...GrrRtTgrRg', '..gGRRgtTGrrR', '..GGgGgtTGRRG', '...grRGtTgGGg', '..gGrrRtTGgrR', '..GGRRGtTGGRR', '...hGGgtTGGh', '....hhGtThh', '.......tT'],
  melon: ['', '', '', '......h', '.....hGg', '..gg..h', '.gGGg.hMMMMM', '..hGGmMmMmMmM', '....mMmMmMmMmM', '...MmMmMmMmMmM', '...mMmMmMmMmMm', '...MmMmMmMmMmM', '....MmMmMmMmM', '.....MMMMMMM'],
  wheat: ['', '', '....e.e..e', '...eEeEeeE.e', '...eE.eE.eEeE', '....E.E..E.E', '....Y.Y..Y.Y', '...Y.Y.YY.Y', '....Y.YY.Y', '.....YYYY', '......YY', '......YY'],
  corn: ['........g', '.......gG', '.......gGh', '..g....GGh..g', '..gG...GGh.gG', '...gG.gGGh.G', '....gGgGGhG', '......eEGhe', '...ggGeEGhEGg', '..gG..eEGh..gG', '..g...eEGh...g', '......eEGh', '......hGGh', '.....hGGGGh', '.......hh'],
  pumpkin: ['', '', '', '........TT', '.......TTh', '.....gGhTh', '....gGGgh', '..DOOOOOOOOOD', '.DOooOoooOooOD', 'DOoaOooaoOoaoOD', 'DOooOoooOooOoOD', 'DOooOoooOooOoOD', 'DOooOoooOooOoOD', '.DOoOoooOooOOD', '..DDOOOOOOODD', '....DDDDDDD'],
  holly: ['', '', '', '', '.....W.WW', '....hGhWWhG', '...hGGhGhGGh', '..hGrhGGGhrGh', '..GrRrGhGrRrG', '..hGrGGrGGrGh', '...hGGrRrGGh', '....hhGrGhh', '......hhh'],
  snowman: ['', '......KKKK', '......KKKK', '.....KKKKKK', '.....wwwwww', '....wwxwwxww', '....wwwwqqww', '....Wwwwwwww', '.....rRRRRRr', '...wwwwwrwwwww', '..wwwwwwrwwwwWw', '..wwwwwxwwwwwWw', '..Wwwwwwwwwwwww', '..WWwwwxwwwwwWW', '...WWWwwwwwWWW', '.....WWWWWWW'],
  crystal: ['', '.......I', '......IiI', '....I.IiI.I', '.....IiiiI', '...IIiiwiiII', '.....IiiiI', '....I.IiI.I', '......IiI', '.......G', '....gg.G.gg', '...gGGgGgGGg', '....hGGGGGh', '......hhh'],
};
CROPS.frostSprout = snowify(CROPS.sprout);
CROPS.frostYoung = snowify(CROPS.young);
const BY_SEASON = {
  spring: [[], ['sprout'], ['young'], ['tulip'], ['strawberry', 'cabbage']],
  summer: [[], ['sprout'], ['young'], ['blueberry'], ['sunflower', 'tomato', 'melon']],
  fall: [[], ['sprout'], ['young'], ['wheat'], ['pumpkin', 'corn']],
  winter: [[], ['frostSprout'], ['frostYoung'], ['holly'], ['snowman', 'crystal']],
};

const HEAD = [
  '....TTTTTTTT....', '...TttttttttT...', '...TttttttttT...', '..THHHHHHHHHHT..', 'TTttttttttttttTT', '.TTTTTTTTTTTTTT.', '..nnnnnnnnnnnn..',
];
const FRONT = [...HEAD, '.nnNnsssssnNnnn.', '.nnsxxssssxxsnn.', '.nnsxxssssxxsnn.', '.nnqssssssssqnn.', '.nnssssSSssssnn.', '.nnn.ssssss.nnn.',
  '.nnrrrrrrrrrrnn.', '.nnrruurruurrnn.', '.srruuuuuuuurrs.', '.ss.uuuuuuuu.ss.', '....uuuUUuuu....', '....uuuUUuuu....', '....uuuuuuuu....'];
const BACK = [...HEAD, '.nnnnnnnnnnnnnn.', '.nnNnnnnnnnNnnn.', '.nnnnnnnnnnnnnn.', '.nnnNnnnnnnNnnn.', '.nnnnnnnnnnnnnn.', '.nnnnnnnnnnnnnn.',
  '.nnnnrrrrrrnnnn.', '.nnnrruUUurrnnn.', '.srrruuuuuuurrs.', '.ss.uuuuuuuu.ss.', '....uuuUUuuu....', '....uuuUUuuu....', '....uuuuuuuu....'];
const LEGS_A = ['....uuu..uuu....', '....UUU..fff....', '....fff.........'];
const LEGS_B = ['....uuu..uuu....', '....fff..UUU....', '.........fff....'];
const CAN = ['......mm', '.mmmmMm.', 'mMMMMm..', 'mMMMMm..', 'mMMMMm..', '.mmmm...'];

const CHICKEN = ['....rr', '...rRr', '...wwww', '..wwxwwW', '.yywwwww', '..wwwwwww..w', '..wwwwwwwwww', '..wWwwwwwwWw', '...wWWWWWWw', '....wwwwww', '.....y..y', '....yy.yy'];
const CHICK = ['.yyy', 'yyxyy', 'oyyyy.y', '.yyyyyy', '..yyyy', '..o.o'];
const CAT = ['...o.o', '...ooo..ooo', '..ooooooooOoo', '.oOoooooOooooo', '.ooooOoooooooo', '..oooooooooooo', '....oooooooo'];
const BUTTERFLY = ['pp.pp', 'pPkPp', '.pkp.', 'pp.pp'];
const FENCE = ['......kk........', '.....kttk.......', '.....kttk.......', 'kkkkkkTTkkkkkkkk', 'tttttttTtttttttt', 'TTTTTkTTkTTTTTTT', '.....ktTk.......', '.....kttk.......', 'kkkkkkTTkkkkkkkk', 'tttttttTtttttttt', 'TTTTTkTTkTTTTTTT', '.....kttk.......', '.....kttk.......', '.....kkkk.......'];
const FENCE_PAL = { k: '#4a2a14', t: '#d9a565', T: '#a8733d' };
const ICONS = {
  flower: ['...p...', '..pPp..', '.pPyPp.', '..pPp..', '...G...', '.gGG...', '...G...'],
  sun: ['y..y..y', '.yyyyy.', '.yYYYy.', 'yyYYYyy', '.yYYYy.', '.yyyyy.', 'y..y..y'],
  leaf: ['....OO.', '..OoOO.', '.OoOoO.', 'OoOoOO.', 'OOoOO..', '.OOO...', 'B......'],
  flake: ['I..I..I', '.I.I.I.', '..III..', 'IIIwIII', '..III..', '.I.I.I.', 'I..I..I'],
  coin: ['.YYYY.', 'YyyyyY', 'YyYYyY', 'YyYYyY', 'YyyyyY', '.YYYY.'],
  heart: ['.rr.rr.', 'rlrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'],
};

const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

// --------------------------------------------------------------------- data
export async function fetchCalendar(login, token) {
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{
    totalContributions weeks{contributionDays{date weekday contributionCount contributionLevel}}}}}}`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'pixel-farm' },
    body: JSON.stringify({ query, variables: { login } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GitHub API error: ${JSON.stringify(json.errors || json)}`);
  const cal = json.data.user.contributionsCollection.contributionCalendar;
  return {
    total: cal.totalContributions,
    weeks: cal.weeks.map((w) => w.contributionDays.map((d) => ({
      date: d.date, weekday: d.weekday, count: d.contributionCount, level: LEVEL[d.contributionLevel] ?? 0,
    }))),
  };
}

/** Made-up data with the same shape, for previewing without a token. */
export function sampleCalendar(endISO = new Date().toISOString().slice(0, 10)) {
  const rand = rng(hash(endISO));
  const end = new Date(endISO + 'T00:00:00Z');
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 364 - end.getUTCDay());
  const weeks = [];
  let total = 0;
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    if (d.getUTCDay() === 0) weeks.push([]);
    const count = rand() < 0.15 ? 0 : Math.floor(rand() ** 2.4 * 20) + 1;
    const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 11 ? 3 : 4;
    total += count;
    weeks[weeks.length - 1].push({ date: d.toISOString().slice(0, 10), weekday: d.getUTCDay(), count, level });
  }
  return { total, weeks };
}

function streak(weeks) {
  const days = weeks.flat();
  let i = days.length - 1;
  if (days[i] && days[i].count === 0) i--;
  let n = 0;
  while (i >= 0 && days[i].count > 0) { n++; i--; }
  return n;
}

// ------------------------------------------------------------ scenery parts
function soilTile(wet) {
  const g = new Grid(16, 16);
  const [a, b, c, k] = wet ? ['d', 'e', 'f', 'k'] : ['a', 'b', 'c', 'k'];
  g.rect(1, 0, 14, 16, a).rect(0, 1, 16, 14, a);
  g.rect(1, 0, 14, 1, c).rect(0, 1, 1, 13, c);
  [4, 8, 12].forEach((y) => { g.rect(2, y, 12, 1, b); g.rect(3, y - 1, 3, 1, c); g.rect(9, y - 1, 3, 1, c); });
  g.rect(1, 15, 14, 1, k).rect(15, 1, 1, 14, k).set(14, 14, k);
  return g.rows();
}
const SOIL_PAL = { a: '#b77a47', b: '#946036', c: '#cf9862', k: '#6e4322', d: '#7a4a28', e: '#5f381c', f: '#8f5a33' };

function oak() {
  const g = new Grid(44, 46);
  g.rect(18, 28, 8, 18, 'b').rect(18, 28, 2, 18, 'B').rect(14, 44, 16, 2, 'b');
  const blobs = [[22, 15, 13], [11, 21, 9], [33, 21, 9], [22, 25, 10], [14, 10, 7], [30, 10, 7]];
  blobs.forEach(([x, y, r]) => g.disc(x, y, r, 'h'));
  blobs.forEach(([x, y, r]) => g.disc(x - 1, y - 2, r - 1.5, 'G'));
  [[16, 7, 4], [9, 17, 3], [27, 9, 4], [20, 15, 3], [33, 17, 2.5]].forEach(([x, y, r]) => g.disc(x, y, r, 'g'));
  [[12, 22], [30, 24], [24, 12], [17, 18]].forEach(([x, y]) => g.rect(x, y, 2, 2, 'p'));
  return g.outline('k').rows();
}
const OAK_PAL = { b: '#8a5a33', B: '#6a4224', h: '#2f7a2e', G: '#4ca33d', g: '#7ccf55', p: '#ffb7d0', k: '#1f4a1e' };

function pine() {
  return ['.....h', '....hGh', '....GgG', '...hGgGh', '...GGgGG', '..hGgGGGh', '...GGGgG', '..hGGGGGh', '.hGgGGGgGh', '..GGGGGGG', '.hGGgGGGGh', 'hGGGGGgGGGh', '.hhGGGGGhh', '....bb', '....bb'];
}
const PINE_PAL = { h: '#1d5230', G: '#2c7440', g: '#4a9a52', b: '#5a3a22' };

function cottage() {
  const g = new Grid(48, 44);
  g.rect(33, 0, 6, 14, 'c').rect(32, 0, 8, 2, 'C').rect(34, 3, 1, 1, 'C').rect(36, 7, 1, 1, 'C');
  for (let i = 0; i < 17; i++) {
    const l = Math.max(0, 17 - i), rgt = Math.min(47, 30 + i);
    g.rect(l, i + 2, rgt - l + 1, 1, i % 3 === 2 ? 'R' : 'r');
    g.set(l, i + 2, 'k').set(rgt, i + 2, 'k');
  }
  g.rect(17, 1, 14, 1, 'k');
  g.rect(0, 19, 48, 2, 'K');
  g.rect(4, 21, 40, 21, 'w');
  for (let y = 24; y < 42; y += 4) g.rect(4, y, 40, 1, 'W');
  g.rect(4, 21, 2, 21, 'b').rect(42, 21, 2, 21, 'b');
  g.rect(20, 28, 9, 14, 'b').rect(21, 29, 7, 13, 'd').rect(21, 35, 7, 1, 'b').set(26, 33, 'y');
  [8, 33].forEach((wx) => {
    g.rect(wx, 25, 8, 8, 'b').rect(wx + 1, 26, 6, 6, 'g').rect(wx + 1, 26, 2, 2, 'G');
    g.rect(wx + 4, 26, 1, 6, 'b').rect(wx + 1, 29, 6, 1, 'b');
    g.rect(wx - 1, 33, 10, 2, 'f');
    [0, 3, 6].forEach((o, j) => g.set(wx + o + 1, 32, j === 1 ? 'P' : 'p'));
  });
  g.rect(18, 42, 13, 2, 's');
  return g.rows();
}
const COTTAGE_PAL = { c: '#a0522d', C: '#7a3a1f', r: '#c4553f', R: '#9c3b2c', k: '#4a2214', K: '#6b2c1b', w: '#f3dcb0', W: '#dcc092', b: '#7a4a24', d: '#9a6234', y: '#ffd75a', g: '#9fd6f0', G: '#e6f7ff', f: '#6a8a3a', p: '#ff9fca', P: '#ffe066', s: '#a9a9a0' };

function barn() {
  const g = new Grid(40, 38);
  for (let i = 0; i < 14; i++) {
    const half = i < 6 ? 6 + i * 2 : 18 + Math.min(2, i - 6);
    g.rect(20 - half, i, half * 2, 1, i % 3 === 0 ? 'D' : 'd');
  }
  g.rect(0, 14, 40, 2, 'k');
  g.rect(2, 16, 36, 22, 'r');
  for (let x = 4; x < 38; x += 4) g.rect(x, 16, 1, 22, 'R');
  g.rect(12, 22, 16, 16, 'w').rect(14, 24, 12, 14, 'R');
  for (let i = 0; i < 12; i++) { g.set(14 + i, 24 + i, 'w'); g.set(25 - i, 24 + i, 'w'); }
  g.rect(17, 5, 6, 5, 'w').rect(18, 6, 4, 3, 'k');
  return g.rows();
}
const BARN_PAL = { d: '#8a2f2f', D: '#6e2222', k: '#4a1a14', r: '#c8433b', R: '#9e2f2a', w: '#f6efe2' };

function mountains(W, H, seed, peaks) {
  const r = rng(seed);
  const hs = new Array(W).fill(0);
  for (let k = 0; k < peaks; k++) {
    const cx = r() * W, ph = H * (0.45 + r() * 0.55), sl = 0.45 + r() * 0.5;
    for (let x = 0; x < W; x++) hs[x] = Math.max(hs[x], ph - Math.abs(x - cx) * sl);
  }
  const g = new Grid(W, H);
  for (let x = 0; x < W; x++) {
    const h = Math.round(hs[x]);
    const shade = hs[x] < (hs[x - 1] ?? hs[x]) ? 'M' : 'm';
    for (let y = H - h; y < H; y++) g.set(x, y, y < H - h + (h > H * 0.62 ? 5 : 0) ? (shade === 'M' ? 'W' : 'w') : shade);
  }
  return g.rows();
}

function cloud(seed) {
  const r = rng(seed);
  const g = new Grid(44, 16);
  const blobs = [[10, 10, 6], [20, 7, 7], [30, 9, 6], [36, 11, 4]].map(([x, y, rad]) => [x + r() * 2, y, rad]);
  blobs.forEach(([x, y, rad]) => g.disc(x, y + 1, rad, 'W'));
  blobs.forEach(([x, y, rad]) => g.disc(x, y, rad - 0.5, 'w'));
  for (let x = 0; x < 44; x++) for (let y = 13; y < 16; y++) if (g.get(x, y) === 'w') g.set(x, y, 'W');
  return g.rows();
}

function grassPattern(id, s) {
  return `<pattern id="${id}" width="32" height="32" patternUnits="userSpaceOnUse">
    <rect width="32" height="32" fill="${s.base}"/>
    <rect x="3" y="5" width="1" height="3" fill="${s.a}"/><rect x="5" y="4" width="1" height="4" fill="${s.a}"/><rect x="4" y="6" width="1" height="2" fill="${s.a}"/>
    <rect x="19" y="21" width="1" height="3" fill="${s.b}"/><rect x="21" y="20" width="1" height="4" fill="${s.b}"/>
    <rect x="25" y="8" width="2" height="1" fill="${s.a}"/><rect x="11" y="26" width="2" height="1" fill="${s.a}"/>
    <rect x="14" y="13" width="2" height="2" fill="${s.dot}"/><rect x="28" y="29" width="1" height="1" fill="${s.dot}"/>
  </pattern>`;
}

// ------------------------------------------------------------------ render
export function renderFarm({ total, weeks }, { name = "Fe Anne's Farm", scale = 1, season: forced } = {}) {
  const cols = weeks.length;
  const X0 = 24, Y0 = 158;
  const W = X0 * 2 + cols * P;
  const fieldB = Y0 + 7 * P;
  const laneY = fieldB + 16;
  const H = fieldB + 62;
  const KT = '0;0.5;0.6;0.68;0.75;0.9;0.96;1';

  // one season for the whole farm: the season of the latest day (or a forced one)
  const farmSeason = forced || seasonOf(weeks.flat().at(-1).date);
  const colSeason = weeks.map(() => farmSeason);

  // farmer route: down/up each week column, then home along the lane
  const pts = [];
  for (let c = 0; c < cols; c++) for (let k = 0; k < 7; k++) {
    const r = c % 2 === 0 ? k : 6 - k;
    pts.push([X0 + c * P + P / 2, Y0 + r * P + P / 2, c, r]);
  }
  const last = pts[pts.length - 1];
  const homeX = X0 - 12;
  const route = [...pts.map(([x, y]) => [x, y]), [last[0], laneY], [homeX, laneY], [homeX, Y0 + P / 2], [pts[0][0], pts[0][1]]];
  let len = 0;
  const at = [0];
  for (let i = 1; i < route.length; i++) {
    len += Math.abs(route[i][0] - route[i - 1][0]) + Math.abs(route[i][1] - route[i - 1][1]);
    at.push(len);
  }
  const T = +(len / 150).toFixed(2);
  const pathD = 'M' + route.map(([x, y]) => `${x} ${y}`).join('L');

  // facing: front when walking down / home, back when walking up
  const faceKT = ['0'], faceV = ['1'];
  for (let c = 1; c < cols; c++) { faceKT.push((at[c * 7] / len).toFixed(5)); faceV.push(c % 2 === 0 ? '1' : '0'); }
  faceKT.push((at[pts.length - 1] / len).toFixed(5)); faceV.push('1');
  const faceAnim = (inv) => `<animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${faceKT.join(';')}" values="${(inv ? faceV.map((v) => (v === '1' ? '0' : '1')) : faceV).join(';')}"/>`;

  // field
  const dayAt = new Map();
  weeks.forEach((w, c) => w.forEach((d) => dayAt.set(`${c},${d.weekday}`, d)));
  let soil = '', wet = '';
  const crops = [];
  pts.forEach(([x, y, c, r], i) => {
    const d = dayAt.get(`${c},${r}`);
    if (!d) return;
    const tx = x - P / 2, ty = y - P / 2;
    const delay = ((at[i] / len) * T - T).toFixed(2); // negative: the field starts grown
    const season = colSeason[c];
    soil += `<use href="#${season === 'winter' ? 'soilS' : 'soil'}" x="${tx}" y="${ty}"/>`;
    wet += `<use href="#wet" class="w" x="${tx}" y="${ty}" style="animation-delay:${delay}s"/>`;
    if (d.level > 0) {
      const opts = BY_SEASON[season][d.level];
      const kind = opts[hash(d.date) % opts.length];
      const h = CROPS[kind].length;
      const oy = ty + 15 - h;
      let g = '';
      if (d.level > 1) g += `<g class="sp" style="animation-delay:${delay}s"><use href="#${season === 'winter' ? 'frostSprout' : 'sprout'}" y="${ty + 15 - CROPS.sprout.length - oy}"/></g>`;
      g += `<g class="${d.level > 1 ? 'g2' : 'g'}" style="animation-delay:${delay}s"><use href="#${kind}"/></g>`;
      crops.push([r, c, `<g transform="translate(${tx} ${oy})">${g}</g>`]);
    }
  });
  crops.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  // ground strips by season + falling particles
  let ground = '', particles = '';
  const rp = rng(21);
  colSeason.forEach((s, c) => {
    const x = c === 0 ? 0 : X0 + c * P;
    const w = c === 0 ? X0 + P : c === cols - 1 ? W - x : P;
    ground += `<rect x="${x}" y="${Y0 - 10}" width="${w}" height="${H - Y0 + 10}" fill="url(#gr-${s})"/>`;
    if (s !== 'summer' && rp() < 0.55) {
      const cls = { winter: 'snow', spring: 'petal', fall: 'leafp' }[s];
      const px = X0 + c * P + Math.floor(rp() * P), dur = (6 + rp() * 5).toFixed(1), del = (-rp() * 10).toFixed(1);
      particles += `<rect class="pt ${cls}" x="${px}" y="${Y0 - 30}" width="${s === 'fall' ? 3 : 2}" height="2" style="animation-duration:${dur}s;animation-delay:${del}s"/>`;
    }
  });

  // season signposts on the top fence
  let signs = '';
  colSeason.forEach((s, c) => {
    if (c > 0 && s === colSeason[c - 1]) return;
    const x = X0 + c * P + 2;
    signs += `<g transform="translate(${x} ${Y0 - 34})"><rect x="7" y="10" width="3" height="16" fill="#7a4a24"/><rect x="0" y="0" width="17" height="13" fill="#4a2a14"/><rect x="1" y="1" width="15" height="11" fill="#d9a565"/>${sprite(ICONS[SEASON[s].icon], CP, 1, 5, 3)}</g>`;
  });

  // backdrop
  const hy = Y0 - 22;
  const far = sprite(mountains(W, 56, 4, 7), { m: '#9cc3e0', M: '#86afcf', w: '#f4f9ff', W: '#dbe8f4' }, 1, 0, hy - 74);
  const near = sprite(mountains(W, 40, 8, 10), { m: '#6fae6a', M: '#5c9858', w: '#86c27c', W: '#76b06e' }, 1, 0, hy - 40);
  const rpi = rng(3);
  let forest = '';
  for (let x = -6; x < W; x += 7 + Math.floor(rpi() * 5)) forest += `<use href="#pine" x="${x}" y="${hy - 16 - Math.floor(rpi() * 7)}"/>`;
  const meadow = `<rect x="0" y="${hy - 4}" width="${W}" height="${Y0 - hy + 4}" fill="url(#gr-${farmSeason})"/>`;

  const cotX = W - 250, cotY = hy - 34;
  const glow = [8, 33].map((wx) => `<rect x="${cotX + wx + 1}" y="${cotY + 26}" width="6" height="6" fill="#ffd36b"/>`).join('');
  const smoke = [0, 1.2, 2.4].map((d) => `<rect class="smoke" x="${cotX + 34}" y="${cotY - 4}" width="4" height="4" fill="#eef2f5" style="animation-delay:${d}s"/>`).join('');
  const scenery = `
    <g transform="translate(${W - 190} ${hy - 30})">${sprite(barn(), BARN_PAL, 1)}</g>
    <g transform="translate(${cotX} ${cotY})">${sprite(cottage(), COTTAGE_PAL, 1)}</g>${smoke}
    <g transform="translate(${X0 + 300} ${hy - 40})">${sprite(oak(), OAK_PAL, 1)}</g>
    <g transform="translate(${W - 100} ${hy - 36})">${sprite(oak(), OAK_PAL, 1)}</g>`;

  // sky
  let stars = '';
  const rs = rng(5);
  for (let i = 0; i < 50; i++) stars += `<rect x="${Math.floor(rs() * W)}" y="${Math.floor(rs() * (hy - 60))}" width="${rs() < 0.2 ? 2 : 1}" height="${rs() < 0.2 ? 2 : 1}" fill="#fff6c8" class="tw" style="animation-delay:${(rs() * 3).toFixed(2)}s"/>`;
  const sunArc = `M-30 ${hy} Q${W / 2} -90 ${W + 30} ${hy}`;
  const sunG = new Grid(26, 26).disc(12.5, 12.5, 12, 'o').disc(12.5, 12.5, 9, 'y').disc(10, 10, 4, 'Y');
  const moonG = new Grid(20, 20).disc(9.5, 9.5, 9, 'w').disc(13, 7, 7, '.');
  moonG.disc(6, 9, 1.5, 'W').disc(9, 14, 1, 'W');
  const sun = sprite(sunG.rows(), { o: '#fff3b0', y: '#ffe066', Y: '#fff7c9' }, 1, -13, -13);
  const moon = sprite(moonG.rows(), { w: '#fff6d5', W: '#e6d9a6' }, 1, -10, -10);
  const clouds = [[14, 0, 110, 1], [42, -45, 140, 2], [26, -90, 125, 3]].map(([cy, begin, dur, seed]) =>
    `<g>${sprite(cloud(seed), { w: '#ffffff', W: '#dce9f5' }, 2, 0, cy)}<animateTransform attributeName="transform" type="translate" from="-100 0" to="${W + 10} 0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></g>`).join('');

  // name sign (two planks, nails)
  const tw = textWidth(name, 3);
  const sw = tw + 30;
  const sign = `<g transform="translate(${X0} 12)">
    <rect x="18" y="44" width="6" height="${hy - 50}" fill="#6a4224"/><rect x="${sw - 24}" y="44" width="6" height="${hy - 50}" fill="#6a4224"/>
    <rect x="0" y="0" width="${sw}" height="48" rx="3" fill="#4a2a14"/>
    <rect x="3" y="3" width="${sw - 6}" height="20" fill="#d9a565"/><rect x="3" y="24" width="${sw - 6}" height="21" fill="#c8924f"/>
    <rect x="3" y="3" width="${sw - 6}" height="2" fill="#efc488"/><rect x="3" y="43" width="${sw - 6}" height="2" fill="#a8733d"/>
    <rect x="6" y="6" width="3" height="3" fill="#8f6a2e"/><rect x="${sw - 9}" y="6" width="3" height="3" fill="#8f6a2e"/><rect x="6" y="38" width="3" height="3" fill="#8f6a2e"/><rect x="${sw - 9}" y="38" width="3" height="3" fill="#8f6a2e"/>
    ${text(name, 15, 14, 3, '#fff3d6', '#5b3218')}
  </g>`;

  // HUD panel: date, season, harvest, streak + a dial that turns with the day
  const lastDay = weeks.flat().at(-1).date;
  const dt = new Date(lastDay + 'T00:00:00Z');
  const dateStr = dt.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }) + '. ' + dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const season = seasonOf(lastDay);
  const lines = [[null, dateStr], [SEASON[season].icon, season[0].toUpperCase() + season.slice(1)], ['coin', `${total.toLocaleString('en-US')} crops`], ['heart', `${streak(weeks)} day streak`]];
  const hudW = Math.max(...lines.map(([, s]) => textWidth(s, 2))) + 46;
  const hudH = 96;
  const hudX = W - hudW - 14, hudY = 10;
  const hud = `<g transform="translate(${hudX} ${hudY})">
    <rect width="${hudW}" height="${hudH}" rx="4" fill="#4a2a14"/><rect x="3" y="3" width="${hudW - 6}" height="${hudH - 6}" rx="2" fill="#c8924f"/>
    <rect x="7" y="7" width="${hudW - 14}" height="${hudH - 14}" fill="#fbe8c0"/><rect x="7" y="7" width="${hudW - 14}" height="2" fill="#e8cf9c"/>
    ${lines.map(([ic, s], i) => (ic ? sprite(ICONS[ic], CP, 2, 13, 14 + i * 20 - 1) : '') + text(s, ic ? 32 : 14, 14 + i * 20, 2, '#4a2a14')).join('')}
    <g transform="translate(${hudW - 22} 22)"><rect x="-10" y="-10" width="20" height="20" rx="10" fill="#4a2a14"/><rect x="-8" y="-8" width="16" height="16" rx="8" fill="#9ee0ff"/>
      <rect x="-1" y="-8" width="2" height="8" fill="#d94a5a"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="${T}s" repeatCount="indefinite"/></rect><rect x="-1" y="-1" width="2" height="2" fill="#4a2a14"/></g>
  </g>`;

  // critters
  const chY = laneY + 12;
  const critters = `
    <g transform="translate(${X0 + 220} ${chY})"><g class="ck"><g class="cf">${sprite(CHICKEN, { ...CP, r: '#e8434b', R: '#b8323b', y: '#f3a530', W: '#e2dccf' }, 1)}</g></g></g>
    <g transform="translate(${X0 + 200} ${chY + 6})"><g class="ck" style="animation-delay:.6s"><g class="cf" style="animation-delay:.6s">${sprite(CHICK, { ...CP, y: '#ffe066', o: '#f3a530' }, 1)}</g></g></g>
    <g transform="translate(${X0 + 620} ${chY + 2})">${sprite(CAT, { o: '#f0a050', O: '#c87830' }, 1)}<g class="zz">${text('z', 14, -8, 1, '#ffffff')}</g></g>`;
  const butterflies = [[0, '#ffb3d1'], [-11, '#9ad0ff'], [-6, '#fff27a']].map(([b, c]) =>
    `<g><g class="bf">${sprite(BUTTERFLY, { p: c, P: '#ffffff', k: '#2d1b10' }, 1, -2, -2)}</g><animateMotion dur="28s" begin="${b}s" repeatCount="indefinite" path="M${X0} ${Y0 + 20} C ${W * 0.3} ${Y0 - 50}, ${W * 0.5} ${Y0 + 120}, ${W - 40} ${Y0 + 10} S ${W * 0.3} ${Y0 + 110}, ${X0} ${Y0 + 20}"/></g>`).join('');
  const rf = rng(3);
  let flowers = '';
  for (let x = 6; x < W - 10; x += 18 + Math.floor(rf() * 26)) {
    const s = colSeason[Math.max(0, Math.min(cols - 1, Math.floor((x - X0) / P)))];
    const col = SEASON[s].dot;
    flowers += `<rect x="${x}" y="${fieldB + 33 + Math.floor(rf() * 8)}" width="3" height="3" fill="${col}"/><rect x="${x + 1}" y="${fieldB + 36 + Math.floor(rf() * 2)}" width="1" height="3" fill="#3f8a2e"/>`;
  }
  const rff = rng(9);
  let fireflies = '';
  for (let i = 0; i < 22; i++) fireflies += `<rect x="${Math.floor(rff() * W)}" y="${hy - 20 + Math.floor(rff() * 170)}" width="2" height="2" fill="#fff38a" class="ff" style="animation-delay:${(rff() * 4).toFixed(2)}s"/>`;

  const body = (rows) => [...rows, ...LEGS_A];
  const farmer = `<g>
    <g class="bob">
      <g>${faceAnim(false)}
        <g class="fa">${sprite(body(FRONT), FP, 1, -8, -21)}</g>
        <g class="fb">${sprite([...FRONT, ...LEGS_B], FP, 1, -8, -21)}</g>
      </g>
      <g opacity="0">${faceAnim(true)}
        <g class="fa">${sprite(body(BACK), FP, 1, -8, -21)}</g>
        <g class="fb">${sprite([...BACK, ...LEGS_B], FP, 1, -8, -21)}</g>
      </g>
      ${sprite(CAN, FP, 1, 5, -8)}
      <rect class="dr" x="12" y="-7" width="1" height="2" fill="#7cc7ff"/>
      <rect class="dr" x="13" y="-6" width="1" height="2" fill="#a8dcff" style="animation-delay:.15s"/>
      <rect class="dr" x="11" y="-5" width="1" height="2" fill="#7cc7ff" style="animation-delay:.3s"/>
    </g>
    <animateMotion dur="${T}s" repeatCount="indefinite" path="${pathD}"/>
  </g>`;

  const defs = `<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6ec3ff"><animate attributeName="stop-color" dur="${T}s" repeatCount="indefinite" keyTimes="${KT}" values="#6ec3ff;#6ec3ff;#f2a07a;#2d2f6e;#11143a;#11143a;#4a4a8a;#6ec3ff"/></stop>
      <stop offset="1" stop-color="#c8f0ff"><animate attributeName="stop-color" dur="${T}s" repeatCount="indefinite" keyTimes="${KT}" values="#c8f0ff;#c8f0ff;#ffd39a;#6a4f8f;#2a2d66;#2a2d66;#ffb7a0;#c8f0ff"/></stop>
    </linearGradient>
    <g id="soil">${sprite(soilTile(false), SOIL_PAL)}</g>
    <g id="soilS">${sprite(soilTile(false), SOIL_PAL)}<path fill="#ffffff" d="M2 1h3v1h-3zM9 0h4v1h-4zM6 7h2v1h-2zM11 11h3v1h-3zM1 13h2v1h-2z"/></g>
    <g id="wet">${sprite(soilTile(true), SOIL_PAL)}</g>
    <g id="pine">${sprite(pine(), PINE_PAL)}</g>
    ${Object.entries(CROPS).map(([k, rows]) => `<g id="${k}">${sprite(rows, CP)}</g>`).join('')}
    ${Object.entries(SEASON).map(([k, s]) => grassPattern('gr-' + k, s)).join('')}
    <pattern id="fence" width="16" height="14" patternUnits="userSpaceOnUse">${sprite(FENCE, FENCE_PAL)}</pattern>
    <pattern id="dirt" width="24" height="18" patternUnits="userSpaceOnUse">
      <rect width="24" height="18" fill="#d8b07a"/><rect x="3" y="4" width="2" height="1" fill="#bf955c"/><rect x="14" y="11" width="3" height="2" fill="#b9b2a2"/><rect x="14" y="11" width="3" height="1" fill="#d6d0c2"/><rect x="20" y="3" width="1" height="1" fill="#e9c995"/>
    </pattern>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="12"/></clipPath>
  </defs>`;

  const style = `<style>
    .w{animation:wet ${T}s linear infinite both}
    .g,.g2,.sp{animation:grow ${T}s linear infinite both;transform-box:fill-box;transform-origin:50% 100%}
    .g2{animation-name:grow2}.sp{animation-name:sprout}
    @keyframes wet{0%{opacity:0}.3%{opacity:.95}30%{opacity:.95}45%,100%{opacity:0}}
    @keyframes grow{0%,1.2%{transform:scale(0)}2.2%{transform:scale(1.2)}3%,99%{transform:scale(1)}99.5%,100%{transform:scale(0)}}
    @keyframes sprout{0%,1.2%{transform:scale(0)}2.2%{transform:scale(1.2)}3%,8%{transform:scale(1)}8.5%,100%{transform:scale(0)}}
    @keyframes grow2{0%,8.4%{transform:scale(0)}9.5%{transform:scale(1.2)}10.5%,99%{transform:scale(1)}99.5%,100%{transform:scale(0)}}
    .fa{animation:fa .36s steps(1) infinite}.fb{animation:fa .36s steps(1) infinite reverse}
    @keyframes fa{0%{opacity:1}50%{opacity:0}}
    .bob{animation:bob .36s steps(1) infinite}@keyframes bob{50%{transform:translateY(-1px)}}
    .dr{animation:drop .45s linear infinite}@keyframes drop{0%{transform:translateY(0);opacity:1}100%{transform:translateY(8px);opacity:0}}
    .tw{animation:tw 2.4s steps(2) infinite}@keyframes tw{50%{opacity:.25}}
    .ff{animation:ff 3s ease-in-out infinite}@keyframes ff{0%,100%{opacity:0;transform:translate(0,0)}50%{opacity:1;transform:translate(6px,-8px)}}
    .bf{animation:bf .3s steps(1) infinite;transform-box:fill-box;transform-origin:center}@keyframes bf{50%{transform:scaleX(.3)}}
    .ck{animation:ck 16s linear infinite}@keyframes ck{0%,8%{transform:translateX(0)}45%,55%{transform:translateX(300px)}92%,100%{transform:translateX(0)}}
    .cf{animation:cf 16s steps(1) infinite;transform-box:fill-box;transform-origin:center}@keyframes cf{0%{transform:scaleX(-1)}50%{transform:scaleX(1)}}
    .smoke{animation:smoke 3.6s linear infinite;opacity:0}@keyframes smoke{0%{transform:translate(0,0);opacity:.9}100%{transform:translate(10px,-26px) scale(1.6);opacity:0}}
    .zz{animation:zz 2.4s linear infinite}@keyframes zz{0%{transform:translate(0,0);opacity:0}30%{opacity:1}100%{transform:translate(6px,-10px);opacity:0}}
    .pt{animation:fall 8s linear infinite}.snow{fill:#ffffff}.petal{fill:#ffb3d1}.leafp{fill:#e8742c}
    @keyframes fall{0%{transform:translate(0,0);opacity:0}10%{opacity:1}50%{transform:translate(7px,80px)}90%{opacity:1}100%{transform:translate(-3px,165px);opacity:0}}
    @media (prefers-reduced-motion:reduce){.g,.g2,.w,.ck,.cf,.ff,.tw,.bf,.fa,.fb,.bob,.dr,.smoke,.zz,.pt,.sp{animation:none}.w,.fb,.sp{opacity:0}}
  </style>`;

  const night = (vals) => `<animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" keyTimes="${KT}" values="${vals}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * scale}" height="${H * scale}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">
<title id="t">${name.replace(/'/g, '&#39;')}</title>
<desc id="d">A pixel-art farm grown from ${total} GitHub contributions in the last year. Each day is a tilled plot; busier days grow bigger crops, the year runs through four seasons, and a little farmer waters the field from morning to night.</desc>
${defs}${style}
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <g opacity="0">${stars}${night('0;0;0;.6;1;1;.3;0')}</g>
  <g>${sun}<animateMotion dur="${T}s" repeatCount="indefinite" path="${sunArc}" keyPoints="0;1;1" keyTimes="0;0.64;1" calcMode="linear"/></g>
  <g>${moon}<animateMotion dur="${T}s" repeatCount="indefinite" path="${sunArc}" keyPoints="0;0;1;1" keyTimes="0;0.62;0.99;1" calcMode="linear"/></g>
  ${clouds}
  ${far}${near}${forest}${meadow}
  ${scenery}
  ${sign}${hud}
  ${ground}
  <rect x="0" y="${Y0 - 30}" width="${W}" height="14" fill="url(#fence)"/>
  ${signs}
  <g>${soil}</g><g>${wet}</g>
  <rect x="0" y="${laneY - 9}" width="${W}" height="18" fill="url(#dirt)"/><rect x="0" y="${laneY - 9}" width="${W}" height="1" fill="#b98f5a"/>
  ${flowers}${critters}
  <g>${crops.map((c) => c[2]).join('')}</g>
  ${farmer}
  ${particles}
  ${butterflies}
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="url(#fence)"/>
  <rect width="${W}" height="${H}" fill="#14163d" opacity="0" pointer-events="none">${night('0;0;.1;.4;.5;.5;.16;0')}</rect>
  <g opacity="0">${glow}${fireflies}${night('0;0;0;.7;1;1;.2;0')}</g>
</g>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="11" fill="none" stroke="#4a2a14" stroke-width="3"/>
</svg>`;
}

export { CROPS, CP, FRONT, FP, ICONS, HEAD };
