// Generuje placeholdery SVG w tonacji drewna dla każdej pozycji oferty, usług, hero i galerii.
// Podmiana na prawdziwe zdjęcia: wrzuć plik o tej samej nazwie (lub zmień ścieżkę w danych).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'src/assets/img/placeholders');
mkdirSync(out, { recursive: true });

const palettes = [
  ['#c8955f', '#a8713d', '#8a5a2e'],
  ['#d9b07a', '#b8864f', '#946536'],
  ['#b9824f', '#956238', '#744a28'],
  ['#e0bb88', '#c39560', '#9d7144'],
];

// prosty deterministyczny PRNG, żeby build był powtarzalny
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}
const hash = (str) => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function woodSvg(key, label, w = 1200, h = 800) {
  const r = rng(hash(key));
  const [base, mid, dark] = palettes[hash(key) % palettes.length];
  let grain = '';
  for (let i = 0; i < 38; i++) {
    const y = (i / 38) * h + r() * 12;
    const amp = 6 + r() * 18;
    const k = 2 + r() * 3;
    let d = `M0 ${y.toFixed(1)}`;
    for (let x = 0; x <= w; x += 60) {
      d += ` L${x} ${(y + Math.sin((x / w) * Math.PI * k + i) * amp).toFixed(1)}`;
    }
    grain += `<path d="${d}" stroke="${i % 3 ? mid : dark}" stroke-width="${(1 + r() * 2.5).toFixed(1)}" fill="none" opacity="${(0.25 + r() * 0.4).toFixed(2)}"/>`;
  }
  // sęk
  const kx = (0.2 + r() * 0.6) * w, ky = (0.2 + r() * 0.6) * h;
  const knot = [1, 0.7, 0.45, 0.2]
    .map((f, j) => `<ellipse cx="${kx.toFixed(0)}" cy="${ky.toFixed(0)}" rx="${(60 * f).toFixed(0)}" ry="${(26 * f).toFixed(0)}" fill="none" stroke="${dark}" stroke-width="${3 - j * 0.5}" opacity="0.55"/>`)
    .join('');
  const text = label
    ? `<rect x="0" y="${h - 140}" width="${w}" height="140" fill="#2b1a0e" opacity="0.55"/>
<text x="${w / 2}" y="${h - 58}" font-family="Georgia, serif" font-size="56" fill="#fff8ee" text-anchor="middle">${esc(label)}</text>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label || 'Drewno')}">
<rect width="${w}" height="${h}" fill="${base}"/>${grain}${knot}${text}</svg>
`;
}

const read = (f) => JSON.parse(readFileSync(join(root, 'src/_data', f), 'utf8'));
const items = [
  ...read('products.json').map((p) => [p.slug, '']),
  ...read('services.json').map((s) => [s.slug, '']),
  ['hero', ''],
  ['o-firmie', 'Tartak Drewitar'],
  ...Array.from({ length: 6 }, (_, i) => [`galeria-${i + 1}`, `Realizacja ${i + 1}`]),
];

for (const [slug, label] of items) {
  const [w, h] = slug === 'hero' ? [1920, 900] : [1200, 800];
  writeFileSync(join(out, `${slug}.svg`), woodSvg(slug, label, w, h));
}
console.log(`Wygenerowano ${items.length} placeholderów w ${out}`);
