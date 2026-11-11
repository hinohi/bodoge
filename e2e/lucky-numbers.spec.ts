import { expect, test } from '@playwright/test';

test('takes a discarded tile from the table without drawing', async ({ page }) => {
  await page.goto('/bodoge/');
  await page.getByRole('link', { name: /Lucky Numbers.*Fill your clover garden/ }).click();
  await expect(page.getByRole('heading', { name: 'Lucky Numbers' })).toBeVisible();

  await page.getByLabel('Player 2 controller').selectOption('human');
  await page.getByRole('button', { name: /Draw tile/ }).click();
  const discard = page.getByRole('button', { name: /Discard \d+/ });
  await expect(discard).toBeVisible();
  const tile = (await discard.textContent())?.split(' ')[1];
  await discard.click();

  await page.getByRole('button', { name: `Take ${tile}`, exact: true }).click();
  const garden = page.getByRole('region', { name: 'Player 2 garden' });
  const target = garden.getByRole('button', { name: /place tile|replace \d+/ }).first();
  await target.click();
  await expect(page.getByRole('status')).toHaveText('Draw a tile or choose one from the table.');
  await expect(page.getByRole('button', { name: /Draw tile.*31 left/ })).toBeEnabled();
});

test('plays Expert CPU turns and resets to the chosen starter', async ({ page }) => {
  await page.goto('/bodoge/lucky-numbers');
  await page.getByLabel('Players', { exact: true }).selectOption('4');
  await page.getByLabel('Player 2 controller').selectOption('expert');
  await page.getByRole('button', { name: /Draw tile/ }).click();
  const worker = page.waitForEvent('worker');
  await page.getByRole('button', { name: /Discard \d+/ }).click();
  await worker;
  await expect(page.getByRole('status')).toHaveText('Draw a tile or choose one from the table.');
  await expect(page.getByRole('region', { name: 'Player 4 garden' })).toBeVisible();

  await page.getByLabel('First player', { exact: true }).selectOption('1');
  await page.getByLabel('First player', { exact: true }).selectOption('0');
  await expect(page.getByRole('button', { name: /Draw tile.*64 left/ })).toBeEnabled();
  await expect(page.getByText('The table is empty.')).toBeVisible();
});
