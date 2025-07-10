import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class TicTacToePage extends BasePage {
  private readonly board: Locator;
  private readonly status: Locator;
  private readonly resetButton: Locator;
  private readonly player1Select: Locator;
  private readonly player2Select: Locator;

  constructor(page: Page) {
    super(page);
    this.board = page.locator('svg').first();
    this.status = page.locator('p.subtitle');
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.player1Select = page.locator('select').first();
    this.player2Select = page.locator('select').nth(1);
  }

  async navigateToGame() {
    await this.navigate('/tic-tac-toe');
    await this.waitForBoardToLoad();
  }

  async waitForBoardToLoad() {
    await this.board.waitFor({ state: 'visible' });
  }

  async clickCell(row: number, col: number) {
    // Calculate the center of the cell
    const cellSize = 400 / 3;
    const x = col * cellSize + cellSize / 2;
    const y = row * cellSize + cellSize / 2;
    await this.board.click({ position: { x, y } });
  }

  async getCellMark(row: number, col: number): Promise<'X' | 'O' | null> {
    const cellSize = 400 / 3;
    const centerX = col * cellSize + cellSize / 2;
    const centerY = row * cellSize + cellSize / 2;

    // Check for X (cross) - which are <g> elements with fill="#53B0FF"
    const crosses = await this.board.locator('g[fill="#53B0FF"]').all();
    for (const cross of crosses) {
      const transform = await cross.getAttribute('transform');
      if (transform) {
        // Extract centerX and centerY from rotate transform: rotate(45 centerX centerY)
        const match = transform.match(/rotate\(45\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\)/);
        if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          if (Math.abs(x - centerX) < 10 && Math.abs(y - centerY) < 10) {
            return 'X';
          }
        }
      }
    }

    // Check for O (circle)
    const circles = await this.board.locator('circle').all();
    for (const circle of circles) {
      const cx = await circle.getAttribute('cx');
      const cy = await circle.getAttribute('cy');
      if (cx && cy && Math.abs(parseFloat(cx) - centerX) < 10 && Math.abs(parseFloat(cy) - centerY) < 10) {
        return 'O';
      }
    }

    return null;
  }

  async getStatus() {
    const text = await this.status.textContent();
    return text?.trim() || '';
  }

  async isGameOver() {
    const status = await this.getStatus();
    return status?.includes('Winner') || status?.includes('Draw') || false;
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

  async getPlayer1Selection() {
    return await this.player1Select.inputValue();
  }

  async getPlayer2Selection() {
    return await this.player2Select.inputValue();
  }

  async waitForAIMove() {
    // Wait for the status to change or a new mark to appear
    await this.page.waitForTimeout(500);
  }

  async waitForWinnerCalculation() {
    // Wait for the game to calculate winner after a move
    await this.page.waitForTimeout(200);
  }
}
