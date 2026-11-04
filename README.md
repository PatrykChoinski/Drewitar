# Drewitar – strona tartaku

Strona firmy **Drewitar Kamil Kocemba** (tartak i skład drewna, Sobień 72, 26-307 Białaczów).
Generator statyczny [Eleventy](https://www.11ty.dev/) (Node.js) → GitHub Pages.

## Start

```bash
npm install
npm run dev          # http://localhost:8080
```

| Skrypt | Co robi |
|---|---|
| `npm run build` | build do `_site/` |
| `npm test` | Vitest (dane + build) + html-validate + linkinator |
| `npm run test:e2e` | Playwright – desktop i mobile |
| `npm run placeholders` | generuje grafiki zastępcze SVG (słoje drewna) |

## Gdzie co jest

- `src/_data/company.json` – adres, telefony, NIP, Facebook, ID Formspree
- `src/_data/products.json` – oferta (każda pozycja = podstrona `/oferta/<slug>/`)
- `src/_data/services.json` – usługi
- `src/assets/img/placeholders/` – grafiki zastępcze

## Zdjęcia

Obecnie są **placeholdery**. Aby podmienić: wrzuć zdjęcie (najlepiej `.webp`, 1200×800) i zmień ścieżkę w szablonie
lub nadpisz plik o tej samej nazwie. Zdjęcia z Facebooka firmy – tylko za zgodą właściciela.

## Do uzupełnienia

- [ ] `formspreeId` w `company.json` (konto na formspree.io → formularz → ID)
- [ ] `email` w `company.json` (teraz przykładowy `kontakt@drewitar.com`)
- [ ] `geo` w `company.json` – dokładne współrzędne
- [ ] logo, prawdziwe zdjęcia i filmy
- [ ] domena drewitar.com: plik `CNAME` (dodać passthrough w `eleventy.config.js`), `siteUrl` w `company.json`, usunąć `PATH_PREFIX` z `deploy.yml`

## Deploy

Push na `main` → workflow **CI** (testy) → po sukcesie **Deploy na GitHub Pages**.
Jednorazowo: *Settings → Pages → Source: GitHub Actions*.
