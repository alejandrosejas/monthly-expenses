import { test, expect } from '@playwright/test';

test.describe('Expense Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('[data-testid="expense-form"]', { timeout: 10000 });
  });

  test('should add a new expense', async ({ page }) => {
    // Fill out the expense form
    await page.fill('[data-testid="expense-amount"]', '25.50');
    await page.fill('[data-testid="expense-description"]', 'Coffee and pastry');
    await page.selectOption('[data-testid="expense-category"]', 'Food');
    await page.selectOption('[data-testid="expense-payment-method"]', 'credit');
    
    // Submit the form
    await page.click('[data-testid="add-expense-button"]');
    
    // Verify the expense appears in the list
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('Coffee and pastry');
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('$25.50');
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('Food');
  });

  test('should edit an existing expense', async ({ page }) => {
    // First add an expense
    await page.fill('[data-testid="expense-amount"]', '15.00');
    await page.fill('[data-testid="expense-description"]', 'Lunch');
    await page.selectOption('[data-testid="expense-category"]', 'Food');
    await page.click('[data-testid="add-expense-button"]');
    
    // Wait for expense to appear
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('Lunch');
    
    // Click edit button
    await page.click('[data-testid="edit-expense-button"]');
    
    // Modify the expense
    await page.fill('[data-testid="expense-amount"]', '18.00');
    await page.fill('[data-testid="expense-description"]', 'Updated lunch');
    
    // Save changes
    await page.click('[data-testid="save-expense-button"]');
    
    // Verify changes
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('Updated lunch');
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('$18.00');
  });

  test('should delete an expense', async ({ page }) => {
    // Add an expense
    await page.fill('[data-testid="expense-amount"]', '10.00');
    await page.fill('[data-testid="expense-description"]', 'Snack');
    await page.selectOption('[data-testid="expense-category"]', 'Food');
    await page.click('[data-testid="add-expense-button"]');
    
    // Wait for expense to appear
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('Snack');
    
    // Click delete button
    await page.click('[data-testid="delete-expense-button"]');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Verify expense is removed
    await expect(page.locator('[data-testid="expense-list"]')).not.toContainText('Snack');
  });

  test('should validate expense form', async ({ page }) => {
    // Try to submit empty form
    await page.click('[data-testid="add-expense-button"]');
    
    // Check for validation errors
    await expect(page.locator('[data-testid="amount-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="description-error"]')).toBeVisible();
    
    // Fill invalid amount
    await page.fill('[data-testid="expense-amount"]', '-5');
    await page.click('[data-testid="add-expense-button"]');
    
    // Check for amount validation error
    await expect(page.locator('[data-testid="amount-error"]')).toContainText('positive');
  });

  test('should filter expenses by category', async ({ page }) => {
    // Add expenses in different categories
    await page.fill('[data-testid="expense-amount"]', '20.00');
    await page.fill('[data-testid="expense-description"]', 'Groceries');
    await page.selectOption('[data-testid="expense-category"]', 'Food');
    await page.click('[data-testid="add-expense-button"]');
    
    await page.fill('[data-testid="expense-amount"]', '50.00');
    await page.fill('[data-testid="expense-description"]', 'Gas');
    await page.selectOption('[data-testid="expense-category"]', 'Transportation');
    await page.click('[data-testid="add-expense-button"]');
    
    // Filter by Food category
    await page.selectOption('[data-testid="category-filter"]', 'Food');
    
    // Verify only food expenses are shown
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('Groceries');
    await expect(page.locator('[data-testid="expense-list"]')).not.toContainText('Gas');
  });

  test('should search expenses', async ({ page }) => {
    // Add some expenses
    await page.fill('[data-testid="expense-amount"]', '30.00');
    await page.fill('[data-testid="expense-description"]', 'Restaurant dinner');
    await page.selectOption('[data-testid="expense-category"]', 'Food');
    await page.click('[data-testid="add-expense-button"]');
    
    await page.fill('[data-testid="expense-amount"]', '15.00');
    await page.fill('[data-testid="expense-description"]', 'Movie tickets');
    await page.selectOption('[data-testid="expense-category"]', 'Entertainment');
    await page.click('[data-testid="add-expense-button"]');
    
    // Search for "restaurant"
    await page.fill('[data-testid="search-input"]', 'restaurant');
    
    // Verify search results
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('Restaurant dinner');
    await expect(page.locator('[data-testid="expense-list"]')).not.toContainText('Movie tickets');
  });
});