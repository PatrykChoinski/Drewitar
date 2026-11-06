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
- [ ] sekrety HOSTIDO_FTP_* (deploy na drewitar.pl)

## Deploy – drewitar.pl (Hostido)

Domena **drewitar.pl** ma DNS w Hostido (`ns1–3.hostido.net.pl`) i rekord A na serwer hostingu – **DNS nie trzeba zmieniać**, strona trafia na ten hosting przez FTPS.

Push na `main` → **CI** (testy) → **Deploy na drewitar.pl**: build, wgranie `_site/` przez FTPS, sprawdzenie strony na żywo. Dodatkowo codziennie o 5:00 UTC (świeże posty z FB).

Jednorazowo:
1. Panel Hostido → **Konta FTP** → nowe konto z katalogiem **`/domains/drewitar.pl/public_html`** (konto widzi tylko ten katalog – skrypt odmówi pracy na koncie z dostępem do całego hostingu).
2. GitHub → *Settings → Secrets and variables → Actions* → sekrety:
   - `HOSTIDO_FTP_HOST` – nazwa serwera z panelu Hostido (np. `host123456.hostido.net.pl`),
   - `HOSTIDO_FTP_USERNAME`, `HOSTIDO_FTP_PASSWORD` – dane konta z punktu 1.
3. *Actions → Deploy na drewitar.pl → Run workflow*.

Bez sekretów workflow pomija wgrywanie (ostrzeżenie zamiast błędu). Poczta (`mail.drewitar.pl`, MX) nie jest ruszana.
