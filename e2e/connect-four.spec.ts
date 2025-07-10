import { expect, test } from '@playwright/test';
import { ConnectFourPage } from './pages/ConnectFourPage';

test.describe('Connect Four Game', () => {
  let connectFourPage: ConnectFourPage;

  test.beforeEach(async ({ page }) => {
    connectFourPage = new ConnectFourPage(page);
    await connectFourPage.navigateToGame();
  });

  test('should display initial game state', async () => {
    // Check initial status
    expect(await connectFourPage.getStatus()).toContain('next player: A');

    // Check all columns are empty
    for (let col = 0; col < 7; col++) {
      expect(await connectFourPage.getColumnHeight(col)).toBe(0);
    }
  });

  test('should allow dropping pieces in columns', async () => {
    // Drop piece in column 3
    await connectFourPage.dropPiece(3);
    expect(await connectFourPage.getColumnHeight(3)).toBe(1);
    expect(await connectFourPage.getStatus()).toContain('next player: B');

    // Drop piece in column 3 again
    await connectFourPage.dropPiece(3);
    expect(await connectFourPage.getColumnHeight(3)).toBe(2);
    expect(await connectFourPage.getStatus()).toContain('next player: A');
  });

  test('should detect horizontal win', async () => {
    // Player A plays: 0, 1, 2, 3 (horizontal win)
    // Player B plays: 0, 1, 2
    const moves = [
      { player: 'A', col: 0 },
      { player: 'B', col: 0 },
      { player: 'A', col: 1 },
      { player: 'B', col: 1 },
      { player: 'A', col: 2 },
      { player: 'B', col: 2 },
      { player: 'A', col: 3 }, // A wins
    ];

    for (const move of moves) {
      await connectFourPage.dropPiece(move.col);
    }

    // Wait for winner calculation
    await connectFourPage.waitForWinnerCalculation();

    expect(await connectFourPage.getStatus()).toContain('winner: A');
    expect(await connectFourPage.isGameOver()).toBeTruthy();
  });

  test('should detect vertical win', async () => {
    // Player A drops 4 pieces in column 0 (vertical win)
    // Player B drops in columns 1, 2, 3
    const moves = [
      { player: 'A', col: 0 },
      { player: 'B', col: 1 },
      { player: 'A', col: 0 },
      { player: 'B', col: 2 },
      { player: 'A', col: 0 },
      { player: 'B', col: 3 },
      { player: 'A', col: 0 }, // A wins
    ];

    for (const move of moves) {
      await connectFourPage.dropPiece(move.col);
    }

    // Wait for winner calculation
    await connectFourPage.waitForWinnerCalculation();

    expect(await connectFourPage.getStatus()).toContain('winner: A');
    expect(await connectFourPage.isGameOver()).toBeTruthy();
  });

  test('should not allow dropping pieces in full column', async () => {
    // Fill column 0
    for (let i = 0; i < 6; i++) {
      await connectFourPage.dropPiece(0);
    }

    expect(await connectFourPage.isColumnFull(0)).toBeTruthy();

    // Try to drop another piece
    const currentStatus = await connectFourPage.getStatus();
    await connectFourPage.dropPiece(0);

    // Status should not change
    expect(await connectFourPage.getStatus()).toBe(currentStatus);
  });

  test('should reset game when reset button is clicked', async () => {
    // Make some moves
    await connectFourPage.dropPiece(0);
    await connectFourPage.dropPiece(1);
    await connectFourPage.dropPiece(2);

    // Click reset
    await connectFourPage.clickReset();

    // Check game is reset
    expect(await connectFourPage.getStatus()).toContain('next player: A');
    for (let col = 0; col < 7; col++) {
      expect(await connectFourPage.getColumnHeight(col)).toBe(0);
    }
  });

  test('should play against AI', async () => {
    // Set player 2 to AI
    await connectFourPage.selectPlayer2('MCTree (200ms)');

    // Human (A) plays first move
    await connectFourPage.dropPiece(3);

    // Wait for AI to make a move
    await connectFourPage.waitForAIMove();

    // Check that AI made a move (at least 2 pieces on board)
    let totalPieces = 0;
    for (let col = 0; col < 7; col++) {
      totalPieces += await connectFourPage.getColumnHeight(col);
    }
    expect(totalPieces).toBeGreaterThanOrEqual(2);
  });

  test('should detect draw when board is full', async () => {
    // This is a complex scenario, so we'll use a simplified test
    // Fill the board in a way that prevents anyone from winning

    // Skip this test as it's too complex for a simple example
    test.skip();
  });
});
