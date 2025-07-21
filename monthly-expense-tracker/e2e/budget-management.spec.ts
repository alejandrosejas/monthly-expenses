import { test, expect } from '@playwright/test';

test.describe('Budget Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="expense-form"]', { timeout: 10000 });
  });

  test('should set monthly budget', async ({ page }) => {
    // Navigate to budget section
    await page.click('[data-testid="budget-tab"]');
    
    // Set overall budget
    await page.fill('[data-testid="total-budget-input"]', '1000');
    await page.click('[data-testid="save-budget-button"]');
    
    // Verify budget is saved
    await expect(page.locator('[data-testid="budget-display"]')).toContainText('$1,000');
  });

  test('should show budget warnings', async ({ page }) => {
    // Set a low budget
    await page.click('[data-testid="budget-tab"]');
    await page.fill('[data-testid="total-budget-input"]', '100');
    await page.click('[data-testid="save-budget-button"]');
    
    // Go back to expenses and add expenses that exceed 80% of budget
    await page.click('[data-testid="expenses-tab"]');
    
    // Add expense that brings us to 85% of budget
    await page.fill('[data-testid="expense-amount"]', '85');
    await page.fill('[data-testid="expense-description"]', 'Large expense');
    await page.selectOption('[data-testid="expense-category"]', 'Shopping');
    await page.click('[data-testid="add-expense-button"]');
    
    // Check for budget warning
    await expect(page.locator('[data-testid="budget-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="budget-warning"]')).toContainText('80%');
  });

  test('should show budget exceeded alert', async ({ page }) => {
    // Set budget
    await page.click('[data-testid="budget-tab"]');
    await page.fill('[data-testid="total-budget-input"]', '50');
    await page.click('[data-testid="save-budget-button"]');
    
    // Add expense that exceeds budget
    await page.click('[data-testid="expenses-tab"]');
    await page.fill('[data-testid="expense-amount"]', '60');
    await page.fill('[data-testid="expense-description"]', 'Over budget expense');
    await page.selectOption('[data-testid="expense-category"]', 'Shopping');
    await page.click('[data-testid="add-expense-button"]');
    
    // Check for budget exceeded alert
    await expect(page.locator('[data-testid="budget-exceeded"]')).toBeVisible();
    await expect(page.locator('[data-testid="budget-exceeded"]')).toContainText('exceeded');
  });

  test('should set category-specific budgets', async ({ page }) => {
    await page.click('[data-testid="budget-tab"]');
    
    // Set category budget for Food
    await page.fill('[data-testid="category-budget-food"]', '200');
    await page.fill('[data-testid="category-budget-transportation"]', '150');
    await page.click('[data-testid="save-budget-button"]');
    
    // Verify category budgets are displayed
    await expect(page.locator('[data-testid="food-budget-display"]')).toContainText('$200');
    await expect(page.locator('[data-testid="transportation-budget-display"]')).toContainText('$150');
  });
});