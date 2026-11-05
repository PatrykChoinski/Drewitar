import { test, expect } from '@playwright/test';

test('strona główna i nawigacja do oferty', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Drewno');
  if (isMobile) {
    await expect(page.locator('#main-nav')).toBeHidden();
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.locator('#main-nav')).toBeVisible();
  }
  await page.locator('#main-nav').getByRole('link', { name: 'Oferta' }).click();
  await expect(page).toHaveURL(/\/oferta\/$/);
  await expect(page.locator('.card')).toHaveCount(10);
});

test('podstrona produktu prowadzi do wyceny z wypełnionym produktem', async ({ page }) => {
  await page.goto('/oferta/wiezba-dachowa-cnc/');
  await page.getByRole('link', { name: 'Zapytaj o wycenę' }).first().click();
  await expect(page.locator('#product-field')).toHaveValue('wiezba dachowa cnc');
});

test('formularz blokuje wysyłkę bez wymaganych pól', async ({ page }) => {
  await page.goto('/kontakt/');
  await page.getByRole('button', { name: 'Wyślij zapytanie' }).click();
  await expect(page).toHaveURL(/\/kontakt\//);
  const valid = await page.locator('.quote-form').evaluate((f) => f.checkValidity());
  expect(valid).toBe(false);
});

test('linki telefoniczne', async ({ page }) => {
  await page.goto('/kontakt/');
  await expect(page.locator('a[href="tel:+48731741821"]').first()).toBeVisible();
  await expect(page.locator('a[href="tel:+48721107950"]').first()).toBeVisible();
});

test('lightbox w galerii', async ({ page }) => {
  await page.goto('/galeria/');
  await page.locator('[data-lightbox]').first().click();
  await expect(page.locator('dialog.lightbox')).toBeVisible();
  await page.getByRole('button', { name: 'Zamknij' }).click();
  await expect(page.locator('dialog.lightbox')).toBeHidden();
});

test('filtry i wyszukiwarka oferty', async ({ page }) => {
  await page.goto('/oferta/');
  await page.getByRole('button', { name: 'Deski' }).click();
  await expect(page.locator('[data-cards] .card:visible')).toHaveCount(4);
  await page.getByRole('button', { name: 'Wszystko' }).click();
  await page.getByPlaceholder('Szukaj').fill('łaty');
  await expect(page.locator('[data-cards] .card:visible')).toHaveCount(1);
  await page.getByPlaceholder('Szukaj').fill('xyz');
  await expect(page.locator('[data-empty]')).toBeVisible();
});

test('widget FB nie przechwytuje przewijania na telefonie', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'tylko mobile');
  await page.goto('/#aktualnosci');
  const iframe = page.locator('.fb-embed iframe');
  test.skip(await iframe.count() === 0, 'tryb z tokenem – brak widgetu');
  expect(await iframe.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('none');
  await expect(page.locator('.fb-shield')).toBeVisible();
});
