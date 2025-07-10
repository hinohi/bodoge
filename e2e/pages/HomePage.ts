import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  async navigateToHome() {
    await this.navigate('/');
  }

  async getHeroTitle() {
    return await this.page.locator('.hero .title.is-1').textContent();
  }

  async getHeroSubtitle() {
    return await this.page.locator('.hero .subtitle').textContent();
  }

  async clickGameCard(gameName: 'Tic Tac Toe' | 'Connect Four' | 'Mancala') {
    // Click on the game card (not the navbar link)
    await this.page.locator('.box').filter({ hasText: gameName }).click();
  }

  async isGameCardVisible(gameName: string) {
    // Check if the game card is visible (not the navbar link)
    return await this.page.locator('.box').filter({ hasText: gameName }).isVisible();
  }

  async clickGitHubLink() {
    const githubLink = this.page.getByRole('link', { name: 'View Source on GitHub' });
    await githubLink.click();
  }
}
