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
- [ ] `email` w `company.json` (teraz `kontakt@drewitar.pl` – potwierdzić, że skrzynka istnieje)
- [ ] `geo` w `company.json` – dokładne współrzędne
- [ ] zdjęcia pozostałych produktów (więźba, wiązary, łaty, belki…) i filmy
- [ ] rekordy DNS drewitar.pl → GitHub Pages (tabela niżej) + Enforce HTTPS

## Deploy – drewitar.pl (GitHub Pages)

Push na `main` → **CI** (testy) → **Deploy na drewitar.pl (GitHub Pages)**; dodatkowo codziennie o 5:00 UTC (świeże posty z FB). Plik `src/static/CNAME` = `drewitar.pl`.

### Rekordy DNS (strefa drewitar.pl w panelu Hostido)

| Typ | Nazwa | Wartość | Uwagi |
|---|---|---|---|
| A | `drewitar.pl` (@) | `185.199.108.153` | zamiast obecnego `185.110.51.187` |
| A | `drewitar.pl` (@) | `185.199.109.153` | |
| A | `drewitar.pl` (@) | `185.199.110.153` | |
| A | `drewitar.pl` (@) | `185.199.111.153` | |
| AAAA | `drewitar.pl` (@) | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` | opcjonalnie (IPv6) |
| CNAME | `www` | `patrykchoinski.github.io.` | usunąć obecny rekord A dla `www` |

**Nie ruszać:** `mail.drewitar.pl` (A → 185.110.51.187), MX, TXT (SPF, DMARC), `*._domainkey` – poczta działa dalej na Hostido.

Po propagacji (zwykle do 1 h, TTL 120 s): GitHub → *Settings → Pages* → zaznaczyć **Enforce HTTPS** (certyfikat wystawia się automatycznie).

### Zapasowo: Hostido przez FTP

Workflow **Deploy zapasowy na Hostido** (uruchamiany ręcznie) wgrywa `_site/` przez FTPS – gdy domena zostaje na serwerze Hostido. Wymaga sekretów `HOSTIDO_FTP_HOST`, `HOSTIDO_FTP_USERNAME`, `HOSTIDO_FTP_PASSWORD` (konto FTP ograniczone do `/domains/drewitar.pl/public_html`).
