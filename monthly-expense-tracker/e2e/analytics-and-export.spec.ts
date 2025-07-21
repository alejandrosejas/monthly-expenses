import { test, expect } from '@playwright/test';

test.describe('Analytics and Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="expense-form"]', { timeout: 10000 });
    
    // Add some test data
    const expenses = [
      { amount: '50', description: 'Groceries', category: 'Food' },
      { amount: '25', description: 'Gas', category: 'Transportation' },
      { amount: '30', description: 'Movie', category: 'Entertainment' },
      { amount: '75', description: 'Dinner out', category: 'Food' }
    ];
    
    for (const expense of expenses) {
      await page.fill('[data-testid="expense-amount"]', expense.amount);
      await page.fill('[data-testid="expense-description"]', expense.description);
      await page.selectOption('[data-testid="expense-category"]', expense.category);
      await page.click('[data-testid="add-expense-button"]');
      await page.waitForTimeout(500); // Small delay between additions
    }
  });

  test('should display category breakdown chart', async ({ page }) => {
    // Navigate to analytics
    await page.click('[data-testid="analytics-tab"]');
    
    // Wait for chart to load
    await page.waitForSelector('[data-testid="category-chart"]', { timeout: 10000 });
    
    // Verify chart is visible
    await expect(page.locator('[data-testid="category-chart"]')).toBeVisible();
    
    // Check if chart legend shows categories
    await expect(page.locator('[data-testid="chart-legend"]')).toContainText('Food');
    await expect(page.locator('[data-testid="chart-legend"]')).toContainText('Transportation');
    await expect(page.locator('[data-testid="chart-legend"]')).toContainText('Entertainment');
  });

  test('should display spending trends', async ({ page }) => {
    await page.click('[data-testid="analytics-tab"]');
    
    // Switch to trends view
    await page.click('[data-testid="trends-tab"]');
    
    // Wait for trend chart
    await page.waitForSelector('[data-testid="trend-chart"]', { timeout: 10000 });
    
    // Verify trend chart is visible
    await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();
  });

  test('should export data as CSV', async ({ page }) => {
    // The export button should be visible in the dashboard/expenses view
    // Start CSV download
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-csv-button"]');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should export data as PDF', async ({ page }) => {
    // Start PDF download
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-pdf-button"]');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should show monthly summary', async ({ page }) => {
    // Check monthly summary display
    await expect(page.locator('[data-testid="monthly-total"]')).toContainText('$180'); // Sum of test expenses
    await expect(page.locator('[data-testid="expense-count"]')).toContainText('4'); // Number of expenses
    
    // Check category breakdown in summary
    await expect(page.locator('[data-testid="food-total"]')).toContainText('$125'); // 50 + 75
    await expect(page.locator('[data-testid="transportation-total"]')).toContainText('$25');
    await expect(page.locator('[data-testid="entertainment-total"]')).toContainText('$30');
  });
});