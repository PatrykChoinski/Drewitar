// Konwersja zdjęć źródłowych (np. z Facebooka firmy) do webp w kilku rozmiarach.
// Użycie: node scripts/optimize-images.mjs <katalog-ze-zdjeciami>
import sharp from 'sharp';
import { join } from 'node:path';

const src = process.argv[2];
if (!src) throw new Error('Podaj katalog ze zdjęciami źródłowymi');
const out = 'src/assets/img/photos';

// [plik źródłowy, nazwa docelowa, szerokość, wysokość, pozycja kadru]
const jobs = [
  ['p4.jpg', 'klody', 1200, 800, 'centre'],
  ['p4.jpg', 'hero', 1600, 1000, 'centre'],
  ['p1.jpg', 'deski-elewacyjne-1', 1200, 800, 'centre'],
  ['p2.jpg', 'deski-elewacyjne-2', 1200, 800, 'centre'],
  ['p3.jpg', 'deski-elewacyjne-3', 1200, 800, 'south'],
  ['cover.jpg', 'baner', 1600, 800, 'centre'],
];

for (const [file, name, w, h, position] of jobs) {
  await sharp(join(src, file)).resize(w, h, { fit: 'cover', position }).webp({ quality: 78 }).toFile(join(out, `${name}.webp`));
  await sharp(join(src, file)).resize(Math.round(w / 2), Math.round(h / 2), { fit: 'cover', position }).webp({ quality: 74 }).toFile(join(out, `${name}-sm.webp`));
}

// logo: przycięte do treści, na białym tle
await sharp(join(src, 'profile.jpg')).trim({ threshold: 20 }).extend({ top: 24, bottom: 24, left: 24, right: 24, background: '#fff' })
  .resize({ width: 480 }).webp({ quality: 90 }).toFile('src/assets/img/logo.webp');
console.log('OK');
