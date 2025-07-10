import { expect, test } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Navigation', () => {
  test('should display home page with correct title and content', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigateToHome();

    // Check page title
    expect(await homePage.getTitle()).toBe('Bodoge');

    // Check hero section
    expect(await homePage.getHeroTitle()).toBe('Bodoge!（ボドゲ！）');
    expect(await homePage.getHeroSubtitle()).toContain('Play board games with AI powered by WebAssembly');

    // Check game cards are visible
    expect(await homePage.isGameCardVisible('Tic Tac Toe')).toBeTruthy();
    expect(await homePage.isGameCardVisible('Connect Four')).toBeTruthy();
    expect(await homePage.isGameCardVisible('Mancala')).toBeTruthy();
  });

  test('should navigate between pages using navbar', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigateToHome();

    // Navigate to Tic Tac Toe
    await homePage.clickNavLink('Tic Tac Toe');
    await expect(page).toHaveURL(/.*\/tic-tac-toe/);

    // Navigate to Connect Four
    await homePage.clickNavLink('Connect Four');
    await expect(page).toHaveURL(/.*\/connect-four/);

    // Navigate to Mancala
    await homePage.clickNavLink('Mancala');
    await expect(page).toHaveURL(/.*\/mancala/);

    // Navigate back to Home
    await homePage.clickNavLink('Home');
    await expect(page).toHaveURL(/.*\/bodoge\/?$/);
  });

  test('should navigate to games from home page cards', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigateToHome();

    // Click Tic Tac Toe card
    await homePage.clickGameCard('Tic Tac Toe');
    await expect(page).toHaveURL(/.*\/tic-tac-toe/);

    // Go back and click Connect Four card
    await homePage.navigateToHome();
    await homePage.clickGameCard('Connect Four');
    await expect(page).toHaveURL(/.*\/connect-four/);

    // Go back and click Mancala card
    await homePage.navigateToHome();
    await homePage.clickGameCard('Mancala');
    await expect(page).toHaveURL(/.*\/mancala/);
  });

  test('should open GitHub link in new tab', async ({ page, context }) => {
    const homePage = new HomePage(page);
    await homePage.navigateToHome();

    // Listen for new page
    const pagePromise = context.waitForEvent('page');
    await homePage.clickGitHubLink();
    const newPage = await pagePromise;

    // Check the new page URL
    await expect(newPage).toHaveURL('https://github.com/hinohi/bodoge');
    await newPage.close();
  });
});
