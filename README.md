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

- `src/assets/img/logo.webp` i `src/assets/img/photos/*.webp` – z publicznego profilu firmy na Facebooku (do potwierdzenia zgody właściciela).
- Nowe zdjęcia: wrzuć oryginały do katalogu, dopisz je w `scripts/optimize-images.mjs`, uruchom `node scripts/optimize-images.mjs <katalog>`.
- Produkt/usługa bez pola `image` w JSON dostaje placeholder z `src/assets/img/placeholders/`.
- Galeria: `src/_data/gallery.json`.

## Filmy i posty z Facebooka

- **Filmy** (`src/_data/videos.json`, pliki w `src/assets/video/`): HDS, cięcie trakiem, wiązary, deska elewacyjna – z profilu FB, skompresowane do 720p (`ffmpeg-static`).
- **Aktualności** (`src/_includes/partials/fb-posts.njk`):
  - bez tokenu → oficjalna wtyczka Facebooka (Page Plugin), zawsze aktualna,
  - z tokenem → 3 najnowsze posty jako własne karty, pobierane przy buildzie (`src/_data/fbPosts.js`); deploy przebudowuje stronę codziennie o 5:00 UTC.
- Token: w Meta for Developers utwórz aplikację, wygeneruj **Page Access Token** (uprawnienia `pages_read_engagement`, `pages_show_list`) dla strony Drewitar i zapisz go w repo jako sekret **`FB_PAGE_TOKEN`** (*Settings → Secrets and variables → Actions*). Opcjonalnie zmienna `FB_PAGE_ID`.

## Do uzupełnienia

- [ ] `formspreeId` w `company.json` (konto na formspree.io → formularz → ID)
- [ ] `email` w `company.json` (teraz przykładowy `kontakt@drewitar.com`)
- [ ] `geo` w `company.json` – dokładne współrzędne
- [ ] zdjęcia pozostałych produktów (więźba, wiązary, łaty, belki…) i filmy
- [ ] domena drewitar.com: plik `CNAME` (dodać passthrough w `eleventy.config.js`), `siteUrl` w `company.json`, usunąć `PATH_PREFIX` z `deploy.yml`

## Deploy

Push na `main` → workflow **CI** (testy) → po sukcesie **Deploy na GitHub Pages**.
Jednorazowo: *Settings → Pages → Source: GitHub Actions*.
