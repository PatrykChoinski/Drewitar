import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const products = JSON.parse(readFileSync('src/_data/products.json', 'utf8'));
const read = (p) => readFileSync(`_site/${p}`, 'utf8');

beforeAll(() => {
  execSync('npx eleventy --quiet', { stdio: 'inherit' });
}, 60_000);

describe('build', () => {
  const pages = ['index.html', 'oferta/index.html', 'uslugi/index.html', 'galeria/index.html',
    'o-firmie/index.html', 'kontakt/index.html', 'polityka-prywatnosci/index.html', '404.html',
    'sitemap.xml', 'robots.txt'];

  it.each(pages)('generuje %s', (p) => expect(existsSync(`_site/${p}`)).toBe(true));

  it('generuje podstronę dla każdego produktu', () => {
    for (const p of products) expect(existsSync(`_site/oferta/${p.slug}/index.html`), p.slug).toBe(true);
  });

  it('każda strona ma title, description i lang=pl', () => {
    for (const p of pages.filter((x) => x.endsWith('.html'))) {
      const html = read(p);
      expect(html, p).toMatch(/<html lang="pl">/);
      expect(html, p).toMatch(/<title>[^<]{5,}<\/title>/);
      expect(html, p).toMatch(/<meta name="description" content="[^"]{20,}">/);
    }
  });

  it('JSON-LD LocalBusiness jest poprawnym JSON', () => {
    const m = read('index.html').match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const ld = JSON.parse(m[1]);
    expect(ld['@type']).toBe('LocalBusiness');
    expect(ld.address.postalCode).toBe('26-307');
  });

  it('strona główna ma klikalne telefony', () => {
    expect(read('index.html')).toContain('href="tel:+48731741821"');
  });

  it('sitemap zawiera produkty', () => {
    const sm = read('sitemap.xml');
    for (const p of products) expect(sm).toContain(`/oferta/${p.slug}/`);
  });

  it('formularz ma honeypot i zgodę RODO', () => {
    const html = read('kontakt/index.html');
    expect(html).toContain('name="_gotcha"');
    expect(html).toMatch(/name="consent" required/);
  });
});
