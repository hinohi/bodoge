import type { Page } from '@playwright/test';

export class BasePage {
  constructor(public readonly page: Page) {}

  async navigate(path: string = '') {
    await this.page.goto(`/bodoge${path}`);
  }

  async clickNavLink(linkText: string) {
    // On mobile, we may need to open the burger menu first
    const isMobile = await this.page.locator('.navbar-burger').isVisible();
    if (isMobile) {
      const burger = this.page.locator('.navbar-burger');
      const isActive = await burger.evaluate((el) => el.classList.contains('is-active'));
      if (!isActive) {
        await burger.click();
        // Wait for menu to expand
        await this.page.waitForTimeout(200);
      }
    }

    // Click the navbar link specifically (not game cards)
    await this.page.locator('.navbar-item').filter({ hasText: linkText }).click();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle() {
    return await this.page.title();
  }

  async isNavLinkActive(linkText: string) {
    // Find the navbar link specifically (not game cards)
    const link = this.page.locator('.navbar-start .navbar-item').filter({ hasText: linkText });
    const classes = await link.getAttribute('class');
    return classes?.includes('is-active') ?? false;
  }
}
