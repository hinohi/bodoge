import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ConnectFourPage extends BasePage {
  private readonly board: Locator;
  private readonly status: Locator;
  private readonly resetButton: Locator;
  private readonly player1Select: Locator;
  private readonly player2Select: Locator;

  constructor(page: Page) {
    super(page);
    this.board = page.locator('svg').first();
    this.status = page.locator('p').filter({ hasText: /next player:|winner:|draw/i });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.player1Select = page.locator('select').first();
    this.player2Select = page.locator('select').nth(1);
  }

  async navigateToGame() {
    await this.navigate('/connect-four');
    await this.waitForBoardToLoad();
  }

  async waitForBoardToLoad() {
    await this.board.waitFor({ state: 'visible' });
  }

  async dropPiece(column: number) {
    // Click on any rect in the column - the game uses 100px sized cells
    // Each column has 6 rects (one for each row)
    const columnX = column * 100 + 50; // Center of column
    const y = 50; // Click near the top of the board
    await this.board.click({ position: { x: columnX, y } });
  }

  async getColumnHeight(column: number): Promise<number> {
    // Count pieces in the column
    // Circles are <circle> elements
    const circles = await this.board.locator('circle').all();
    // Crosses are <g> elements with fill="#53B0FF"
    const crosses = await this.board.locator('g[fill="#53B0FF"]').all();

    let count = 0;
    const columnX = column * 100 + 50; // Center of column

    // Count circles in this column
    for (const circle of circles) {
      const cx = await circle.getAttribute('cx');
      if (cx) {
        const x = parseFloat(cx);
        if (Math.abs(x - columnX) < 10) {
          count++;
        }
      }
    }

    // Count crosses in this column
    for (const cross of crosses) {
      const transform = await cross.getAttribute('transform');
      if (transform) {
        // Extract centerX from rotate transform: rotate(45 centerX centerY)
        const match = transform.match(/rotate\(45\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\)/);
        if (match) {
          const x = parseFloat(match[1]);
          if (Math.abs(x - columnX) < 10) {
            count++;
          }
        }
      }
    }

    return count;
  }

  async getStatus() {
    return await this.status.textContent();
  }

  async isGameOver() {
    const status = await this.getStatus();
    return status?.includes('winner') || status?.includes('draw') || false;
  }

  async clickReset() {
    // Force click to handle cases where other elements might intercept
    await this.resetButton.click({ force: true });
  }

  async selectPlayer1(playerType: string) {
    await this.player1Select.selectOption({ label: playerType });
  }

  async selectPlayer2(playerType: string) {
    await this.player2Select.selectOption({ label: playerType });
  }

  async waitForAIMove() {
    // Wait for AI to make a move
    await this.page.waitForTimeout(1000);
  }

  async waitForWinnerCalculation() {
    // Wait for the game to calculate winner after a move
    await this.page.waitForTimeout(200);
  }

  async isColumnFull(column: number): Promise<boolean> {
    const height = await this.getColumnHeight(column);
    return height >= 6;
  }
}
