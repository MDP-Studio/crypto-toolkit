import fs from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

interface AssuranceEntry {
  id: string;
  title: string;
}

const assurancePath = path.resolve(process.cwd(), 'src', 'data', 'module-assurance.json');
const assuranceModules = JSON.parse(fs.readFileSync(assurancePath, 'utf8')) as AssuranceEntry[];

const routes = [
  { id: 'home', title: 'CryptoToolkit', path: '/' },
  ...assuranceModules.map(module => ({
    id: module.id,
    title: module.title,
    path: `/#/${module.id}`,
  })),
  { id: 'challenges', title: 'Challenge Hub', path: '/#/challenges' },
  { id: 'assurance', title: 'Assurance Matrix', path: '/#/assurance' },
];

for (const route of routes) {
  test(`route smoke: ${route.id}`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', error => consoleErrors.push(error.message));

    await page.goto(route.path);
    await page.getByText(route.title).first().waitFor({ state: 'visible' });
    await expect(page.locator('#main-content')).not.toContainText('Loading...');
    await expect(page.getByText('Something went wrong')).toHaveCount(0);
    await expect(page.locator('#main-content')).toContainText(route.title);

    const accessibility = await new AxeBuilder({ page })
      .include('#main-content')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      accessibility.violations.map(violation => ({
        id: violation.id,
        impact: violation.impact,
        targets: violation.nodes.map(node => node.target.join(' ')),
      })),
      `Accessibility violations on ${route.id}`,
    ).toEqual([]);

    const snapshot = await page.locator('#main-content').evaluate(element => {
      const textOf = (selector: string) => Array.from(element.querySelectorAll(selector))
        .map(node => node.textContent?.replace(/\s+/g, ' ').trim() ?? '')
        .filter(Boolean)
        .slice(0, 20);
      return {
        header: textOf('header span').slice(0, 2),
        headings: textOf('h1, h2, h3'),
        buttons: textOf('button').slice(0, 12),
        links: textOf('a').slice(0, 8),
        textLength: element.textContent?.replace(/\s+/g, ' ').trim().length ?? 0,
      };
    });

    expect(snapshot.textLength).toBeGreaterThan(100);
    expect(consoleErrors).toEqual([]);
    expect(`${JSON.stringify(snapshot, null, 2)}\n`).toMatchSnapshot(`${route.id}.json`);
  });
}

test.describe('mobile route smoke', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true });

  for (const route of [
    { id: 'hmac', title: 'HMAC-SHA256 Walkthrough', path: '/#/hmac' },
    { id: 'assurance', title: 'Assurance Matrix', path: '/#/assurance' },
  ]) {
    test(`mobile route smoke: ${route.id}`, async ({ page }) => {
      await page.goto(route.path);
      await page.getByText(route.title).first().waitFor({ state: 'visible' });
      await expect(page.locator('#main-content')).not.toContainText('Loading...');
      await expect(page.getByText('Something went wrong')).toHaveCount(0);

      const viewport = page.viewportSize();
      const mainBox = await page.locator('#main-content').boundingBox();
      expect(viewport).not.toBeNull();
      expect(mainBox).not.toBeNull();
      expect(mainBox!.width).toBeLessThanOrEqual(viewport!.width);

      const snapshot = await page.locator('#main-content').evaluate(element => ({
        headingText: Array.from(element.querySelectorAll('h1, h2, h3'))
          .map(node => node.textContent?.replace(/\s+/g, ' ').trim() ?? '')
          .filter(Boolean)
          .slice(0, 10),
        textLength: element.textContent?.replace(/\s+/g, ' ').trim().length ?? 0,
      }));

      expect(snapshot.textLength).toBeGreaterThan(100);
      expect(`${JSON.stringify(snapshot, null, 2)}\n`).toMatchSnapshot(`mobile-${route.id}.json`);
    });
  }
});

test('crypto-agility lab explains unsafe and safe migration decisions', async ({ page }) => {
  await page.goto('/#/crypto-agility');
  const firstScenario = page
    .getByRole('heading', { name: '1. Change an encrypted-record format' })
    .locator('xpath=ancestor::*[@data-slot="card"]');

  await firstScenario.getByLabel('Silently replace the primitive under the existing format version').check();
  await firstScenario.getByRole('button', { name: 'Check migration decision' }).click();
  await expect(firstScenario.getByRole('status')).toContainText('Trust gap.');

  await firstScenario.getByLabel(/Add a new algorithm ID and version/).check();
  await firstScenario.getByRole('button', { name: 'Check migration decision' }).click();
  await expect(firstScenario.getByRole('status')).toContainText('Safe decision.');
});

test('primary learning flow works with a keyboard', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();

  const search = page.getByLabel('Search modules');
  await search.focus();
  await page.keyboard.type('elliptic curve');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/ec-calculator$/);
  await expect(page.getByText('Elliptic Curve Calculator').first()).toBeVisible();

  await page.goto('/');
  const startPath = page.getByRole('button', { name: 'Start build the foundations' });
  await startPath.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/converter$/);
  await expect(page.getByText('Base & Text Converter').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Next: Modular Arithmetic/ })).toBeVisible();
});
