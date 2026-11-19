#!/usr/bin/env node
// Builds assets/farm.svg, assets/dialogue.svg and assets/backpack.svg.
//   node scripts/build.mjs            -> live data (needs GITHUB_TOKEN)
//   node scripts/build.mjs --sample   -> made-up data, for previewing offline
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchCalendar, sampleCalendar, renderFarm } from './farm.mjs';
import { renderDialogue, renderInventory } from './cards.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'assets');
mkdirSync(out, { recursive: true });

const login = process.env.GH_LOGIN || 'Feliciety02';
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const useSample = process.argv.includes('--sample') || !token;
if (useSample && !process.argv.includes('--sample')) console.warn('No GITHUB_TOKEN set, using sample data.');

const calendar = useSample ? sampleCalendar() : await fetchCalendar(login, token);
writeFileSync(join(out, 'farm.svg'), renderFarm(calendar, { name: "Fe Anne's Farm", fieldScale: 2, season: process.env.FARM_SEASON }));

const portrait = existsSync(join(out, 'portrait.png')) ? readFileSync(join(out, 'portrait.png')).toString('base64') : null;
writeFileSync(join(out, 'dialogue.svg'), renderDialogue([
  "Hi there! I'm Fe Anne *",
  'BS Computer Science student, Univ. of Mindanao.',
  'UI/UX designer and full-stack web developer.',
  'I build AI tools, web apps & Chrome extensions.',
  'Into machine learning, clean code and good UX.',
  'Now building: AIVERA + an ML leaf scanner.',
], { portrait }));

writeFileSync(join(out, 'backpack.svg'), renderInventory([
  { label: 'TypeScript', logo: 'ts', count: 8 },
  { label: 'JavaScript', logo: 'js', count: 6 },
  { label: 'Python', logo: 'python', count: 5 },
  { label: 'PHP', logo: 'php', count: 3 },
  { label: 'HTML5', logo: 'html', count: 2 },
  { label: 'Vue', logo: 'vue', count: 1 },
  { label: 'Java', logo: 'java', count: 1 },
  { label: 'Dart', logo: 'dart', count: 1 },
  { label: 'Figma', logo: 'figma', count: null, note: 'UI/UX design' },
]));

console.log(`Built farm (${calendar.total} contributions, ${calendar.weeks.length} weeks${useSample ? ', sample data' : ''}).`);
