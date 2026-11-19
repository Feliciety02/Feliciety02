// The dialogue box ("Hi, I'm Fe Anne") and the backpack inventory.
import { sprite, text, textWidth } from './pixel.mjs';
import { logo } from './logos.mjs';

const W = 896;
const DARK = '#4a2a14';

function woodFrame(w, h) {
  const stud = (x, y) => `<rect x="${x}" y="${y}" width="6" height="6" fill="${DARK}"/><rect x="${x + 1}" y="${y + 1}" width="4" height="4" fill="#ffd75a"/><rect x="${x + 1}" y="${y + 1}" width="2" height="2" fill="#fff3b0"/>`;
  return `<rect width="${w}" height="${h}" rx="10" fill="${DARK}"/>
    <rect x="4" y="4" width="${w - 8}" height="${h - 8}" rx="7" fill="#c8924f"/>
    <rect x="6" y="5" width="${w - 12}" height="2" fill="#efc488"/><rect x="6" y="${h - 7}" width="${w - 12}" height="2" fill="#a8733d"/>
    <rect x="11" y="11" width="${w - 22}" height="${h - 22}" fill="${DARK}"/>
    <rect x="13" y="13" width="${w - 26}" height="${h - 26}" fill="#fff1cf"/>
    <rect x="13" y="13" width="${w - 26}" height="3" fill="#f0dcae"/>
    ${stud(5, 5)}${stud(w - 11, 5)}${stud(5, h - 11)}${stud(w - 11, h - 11)}`;
}

export function renderDialogue(lines, { portrait, name = 'Fe Anne' } = {}) {
  const H = 288;
  const tx = 40, ty = 46, lh = 34, adv = 12;
  const totalChars = lines.reduce((n, l) => n + l.length, 0);
  const cps = 34;
  const T = +(totalChars / cps + 6).toFixed(2);
  let clock = 0.5, clips = '', body = '';
  lines.forEach((line, i) => {
    const y = ty + i * lh;
    const kt = ['0'], vals = ['0'];
    for (let k = 1; k <= line.length; k++) { kt.push(((clock + k / cps) / T).toFixed(4)); vals.push(String(k * adv)); }
    kt.push('0.985'); vals.push('0');
    clock += line.length / cps + 0.3;
    clips += `<clipPath id="l${i}"><rect x="${tx}" y="${y - 2}" height="${lh}" width="0"><animate attributeName="width" dur="${T}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${kt.join(';')}" values="${vals.join(';')}"/></rect></clipPath>`;
    body += `<g clip-path="url(#l${i})">${text(line, tx, y, 2, '#4a2a14', '#ecd4a4')}</g>`;
  });
  const cx = tx + textWidth(lines.at(-1), 2) + 10, cy = ty + (lines.length - 1) * lh + 4;
  const cursor = `<g opacity="0"><g class="hop">${sprite(['#####', '.###.', '..#..'], { '#': '#c23a4c' }, 2, cx, cy)}</g>
    <animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${(clock / T).toFixed(3)};0.985" values="0;1;0"/></g>`;

  // portrait panel on the right: thick wooden frame, tan backdrop with notched
  // inner border, portrait cropped at the shoulders, name plate underneath
  const ps = 184, bw = 12, fy = 18, fx = W - 26 - ps - bw * 2;
  const ix = fx + bw, iy = fy + bw;
  let pic = '';
  if (portrait) {
    const png = Buffer.from(portrait, 'base64');
    const pw = png.readUInt32BE(16), ph = png.readUInt32BE(20);
    const k = Math.max(1, Math.floor(ps / pw));
    const px = ix + Math.round((ps - pw * k) / 2), py = iy + Math.max(10, ps - ph * k);
    pic = `<image href="data:image/png;base64,${portrait}" x="${px}" y="${py}" width="${pw * k}" height="${ph * k}" style="image-rendering:pixelated;image-rendering:crisp-edges"/>`;
  }
  // notched inner border (light line inset 6px, corners cut in)
  const n = 6, m = 10, L = ix + n, R = ix + ps - n, Tp = iy + n, B = iy + ps - n;
  const border = `M${L + m} ${Tp}H${R - m}V${Tp + 3}H${R - 3}V${Tp + m}H${R}V${B - m}H${R - 3}V${B - 3}H${R - m}V${B}H${L + m}V${B - 3}H${L + 3}V${B - m}H${L}V${Tp + m}H${L + 3}V${Tp + 3}H${L + m}Z`;
  const plateY = fy + ps + bw * 2 + 6, plateW = ps + bw * 2;
  const panel = `<rect x="${fx - 16}" y="18" width="2" height="${H - 36}" fill="#e3c992"/>
    <clipPath id="pf"><rect x="${ix}" y="${iy}" width="${ps}" height="${ps}"/></clipPath>
    <rect x="${fx}" y="${fy}" width="${ps + bw * 2}" height="${ps + bw * 2}" rx="4" fill="#5a2e12"/>
    <rect x="${fx + 3}" y="${fy + 3}" width="${ps + bw * 2 - 6}" height="${ps + bw * 2 - 6}" rx="2" fill="#c97a32"/>
    <rect x="${fx + 3}" y="${fy + 3}" width="${ps + bw * 2 - 6}" height="3" fill="#eaa55a"/><rect x="${fx + 3}" y="${fy + 3}" width="3" height="${ps + bw * 2 - 6}" fill="#eaa55a"/>
    <rect x="${fx + 3}" y="${fy + ps + bw * 2 - 6}" width="${ps + bw * 2 - 6}" height="3" fill="#94531f"/><rect x="${fx + ps + bw * 2 - 6}" y="${fy + 3}" width="3" height="${ps + bw * 2 - 6}" fill="#94531f"/>
    <rect x="${ix - 2}" y="${iy - 2}" width="${ps + 4}" height="${ps + 4}" fill="#7a4318"/>
    <rect x="${ix}" y="${iy}" width="${ps}" height="${ps}" fill="#d9b27a"/>
    <path d="${border}" fill="none" stroke="#ecd1a0" stroke-width="2"/>
    <g clip-path="url(#pf)"><g class="bob">${pic}</g></g>
    <rect x="${fx}" y="${plateY}" width="${plateW}" height="32" rx="4" fill="#5a2e12"/>
    <rect x="${fx + 3}" y="${plateY + 3}" width="${plateW - 6}" height="26" rx="2" fill="#c97a32"/><rect x="${fx + 3}" y="${plateY + 3}" width="${plateW - 6}" height="3" fill="#eaa55a"/>
    ${text(name, Math.round(fx + plateW / 2 - textWidth(name, 2) / 2), plateY + 10, 2, '#fff3d6', '#6a3415')}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges" role="img" aria-labelledby="t">
<title id="t">${lines.join(' ').replace(/\*/g, '').replace(/&/g, '&amp;').replace(/'/g, '&#39;')}</title>
<defs>${clips}</defs>
<style>.bob{animation:bob 2.4s steps(1) infinite}@keyframes bob{50%{transform:translateY(2px)}}
.hop{animation:hop .8s steps(1) infinite}@keyframes hop{50%{transform:translateY(3px)}}
@media (prefers-reduced-motion:reduce){.bob,.hop{animation:none}}</style>
${woodFrame(W, H)}
${body}${cursor}
${panel}
</svg>`;
}

export function renderInventory(items) {
  const slot = 72, pitch = 80, cols = items.length;
  const gridW = cols * pitch - (pitch - slot);
  const x0 = Math.round((W - gridW) / 2), y0 = 52;
  const barY = y0 + slot + 14;
  const H = barY + 26 + 24;
  const step = 1.6, T = +(cols * step).toFixed(2);
  const kt = items.map((_, i) => (i / cols).toFixed(4));
  const onlyAt = (i) => `<animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${kt.join(';')}" values="${items.map((_, j) => (j === i ? 1 : 0)).join(';')}"/>`;

  let slots = '', names = '';
  items.forEach((it, i) => {
    const x = x0 + i * pitch;
    const [rows, pal] = logo(it.logo);
    const s = 3, iw = 16 * s;
    const icon = `<g transform="translate(${x + 7} ${y0 + 6})"><rect x="2" y="${iw - 1}" width="${iw - 4}" height="3" fill="#d9bd86"/>${sprite(rows, pal, s)}</g>`;
    const count = it.count != null ? text(String(it.count), x + slot - 5 - textWidth(String(it.count), 2), y0 + slot - 18, 2, '#ffffff', DARK) : '';
    slots += `<rect x="${x}" y="${y0}" width="${slot}" height="${slot}" fill="${DARK}"/><rect x="${x + 3}" y="${y0 + 3}" width="${slot - 6}" height="${slot - 6}" fill="#f6dfae"/>
      <rect x="${x + 3}" y="${y0 + 3}" width="${slot - 6}" height="3" fill="#dcbd83"/><rect x="${x + 3}" y="${y0 + 3}" width="3" height="${slot - 6}" fill="#dcbd83"/>
      <g class="it" style="animation-delay:${(i * 0.2).toFixed(2)}s">${icon}</g>${count}`;
    const label = `${it.label}  -  ${it.note || `${it.count} ${it.count === 1 ? 'repo' : 'repos'}`}`;
    names += `<g opacity="${i === 0 ? 1 : 0}">${text(label, Math.round(W / 2 - textWidth(label, 2) / 2), barY + 7, 2, '#4a2a14')}${onlyAt(i)}</g>`;
  });
  const vals = items.map((_, i) => `${x0 + i * pitch - 6} ${y0 - 6}`).join(';');
  const cursor = `<g><path fill="none" stroke="#c23a4c" stroke-width="4" d="M2 2h${slot + 8}v${slot + 8}h-${slot + 8}z"/>
    <path fill="#ffe066" d="M0 0h10v4h-6v6h-4zM${slot + 2} 0h10v10h-4v-6h-6zM0 ${slot + 2}h4v6h6v4h-10zM${slot + 8} ${slot + 2}h4v10h-10v-4h6z"/>
    <animateTransform attributeName="transform" type="translate" calcMode="discrete" dur="${T}s" repeatCount="indefinite" keyTimes="${kt.join(';')}" values="${vals}"/></g>`;

  const title = 'Inventory';
  const tag = 'Languages & tools I build with';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges" role="img" aria-labelledby="t">
<title id="t">Tech stack: ${items.map((i) => i.label).join(', ')}</title>
<style>.it{animation:it 2s steps(2) infinite}@keyframes it{50%{transform:translateY(-2px)}}@media (prefers-reduced-motion:reduce){.it{animation:none}}</style>
${woodFrame(W, H)}
${text(title, x0, 26, 2, '#c23a4c', '#f0d09a')}
${text(tag, x0 + gridW - textWidth(tag, 2), 26, 2, '#8a5a33')}
${slots}${cursor}
<rect x="${x0}" y="${barY}" width="${gridW}" height="26" fill="${DARK}"/><rect x="${x0 + 3}" y="${barY + 3}" width="${gridW - 6}" height="20" fill="#f6dfae"/>
${names}
</svg>`;
}
