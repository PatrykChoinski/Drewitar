import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { z } from 'zod';

const load = (f) => JSON.parse(readFileSync(`src/_data/${f}`, 'utf8'));
const slug = z.string().regex(/^[a-z0-9-]+$/);

describe('dane firmy', () => {
  it('company.json ma poprawne dane kontaktowe', () => {
    const c = z.object({
      name: z.string().min(3),
      street: z.string(),
      postalCode: z.string().regex(/^\d{2}-\d{3}$/),
      nip: z.string().regex(/^\d{10}$/),
      phones: z.array(z.object({ display: z.string(), tel: z.string().regex(/^\+48\d{9}$/) })).min(1),
      facebook: z.string().url(),
      siteUrl: z.string().url().refine((u) => !u.endsWith('/'), 'bez końcowego /'),
    }).passthrough();
    expect(() => c.parse(load('company.json'))).not.toThrow();
  });

  it('NIP ma poprawną sumę kontrolną', () => {
    const d = load('company.json').nip.split('').map(Number);
    const w = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    expect(w.reduce((s, x, i) => s + x * d[i], 0) % 11).toBe(d[9]);
  });
});

for (const file of ['products.json', 'services.json']) {
  describe(file, () => {
    const items = load(file);
    it('pozycje mają wymagane pola', () => {
      const schema = z.array(z.object({ slug, name: z.string().min(3) }).passthrough()).min(1);
      expect(() => schema.parse(items)).not.toThrow();
    });
    it('slugi są unikalne', () => {
      expect(new Set(items.map((i) => i.slug)).size).toBe(items.length);
    });
    it('każda pozycja ma obrazek', () => {
      for (const i of items) expect(existsSync(`src/assets/img/placeholders/${i.slug}.svg`), i.slug).toBe(true);
    });
  });
}

describe('zdjęcia', () => {
  it('pliki z products/services/gallery istnieją', () => {
    const paths = [
      ...load('products.json').map((p) => p.image),
      ...load('services.json').map((s) => s.image),
      ...load('gallery.json').flatMap((g) => [g.src, g.thumb]),
    ].filter(Boolean);
    for (const p of paths) expect(existsSync(`src${p}`), p).toBe(true);
  });
});
