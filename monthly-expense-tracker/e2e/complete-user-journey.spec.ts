import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('should complete full expense tracking workflow', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="expense-form"]', { timeout: 10000 });

    // Step 1: Set up monthly budget
    await page.click('[data-testid="budget-tab"]');
    await page.fill('[data-testid="total-budget-input"]', '500');
    await page.fill('[data-testid="category-budget-food"]', '200');
    await page.fill('[data-testid="category-budget-transportation"]', '100');
    await page.click('[data-testid="save-budget-button"]');
    
    // Verify budget is set
    await expect(page.locator('[data-testid="budget-display"]')).toContainText('$500');

    // Step 2: Add multiple expenses throughout the month
    await page.click('[data-testid="expenses-tab"]');
    
    const expenses = [
      { amount: '45.50', description: 'Weekly groceries', category: 'Food', method: 'credit' },
      { amount: '25.00', description: 'Gas fill-up', category: 'Transportation', method: 'debit' },
      { amount: '12.99', description: 'Netflix subscription', category: 'Entertainment', method: 'credit' },
      { amount: '85.00', description: 'Dinner with friends', category: 'Food', method: 'credit' },
      { amount: '15.50', description: 'Coffee shop', category: 'Food', method: 'cash' }
    ];

    for (const expense of expenses) {
      await page.fill('[data-testid="expense-amount"]', expense.amount);
      await page.fill('[data-testid="expense-description"]', expense.description);
      await page.selectOption('[data-testid="expense-category"]', expense.category);
      await page.selectOption('[data-testid="expense-payment-method"]', expense.method);
      await page.click('[data-testid="add-expense-button"]');
      
      // Wait for expense to appear
      await expect(page.locator('[data-testid="expense-list"]')).toContainText(expense.description);
    }

    // Step 3: Verify budget tracking
    await page.click('[data-testid="budget-tab"]');
    
    // Food category should show warning (145.99 out of 200)
    await expect(page.locator('[data-testid="food-budget-progress"]')).toBeVisible();
    
    // Step 4: Use search and filtering
    await page.click('[data-testid="expenses-tab"]');
    
    // Search for "coffee"
    await page.fill('[data-testid="search-input"]', 'coffee');
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('Coffee shop');
    await expect(page.locator('[data-testid="expense-list"]')).not.toContainText('Netflix');
    
    // Clear search and filter by Food category
    await page.fill('[data-testid="search-input"]', '');
    await page.selectOption('[data-testid="category-filter"]', 'Food');
    
    // Should show only food expenses
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('Weekly groceries');
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('Dinner with friends');
    await expect(page.locator('[data-testid="expense-list"]')).not.toContainText('Gas fill-up');

    // Step 5: Edit an expense
    await page.selectOption('[data-testid="category-filter"]', ''); // Clear filter
    
    // Find and edit the Netflix expense
    const netflixRow = page.locator('[data-testid="expense-item"]').filter({ hasText: 'Netflix' });
    await netflixRow.locator('[data-testid="edit-expense-button"]').click();
    
    // Change amount and description
    await page.fill('[data-testid="expense-amount"]', '15.99');
    await page.fill('[data-testid="expense-description"]', 'Netflix Premium subscription');
    await page.click('[data-testid="save-expense-button"]');
    
    // Verify changes
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('Netflix Premium subscription');
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('$15.99');

    // Step 6: View analytics
    await page.click('[data-testid="analytics-tab"]');
    
    // Wait for charts to load
    await page.waitForSelector('[data-testid="category-chart"]', { timeout: 10000 });
    
    // Verify analytics are displayed
    await expect(page.locator('[data-testid="category-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toContainText('Food');
    await expect(page.locator('[data-testid="chart-legend"]')).toContainText('Transportation');

    // Step 7: Export data (export button should be available in the current view)
    // Test CSV export
    const csvDownloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-csv-button"]');
    const csvDownload = await csvDownloadPromise;
    expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/);

    // Step 8: Navigate between months
    await page.click('[data-testid="expenses-tab"]');
    
    // Navigate to next month
    await page.click('[data-testid="next-month-button"]');
    
    // Should show empty state
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('No expenses');
    
    // Navigate back to current month
    await page.click('[data-testid="prev-month-button"]');
    
    // Should show expenses again
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('Weekly groceries');

    // Step 9: Verify monthly summary
    const monthlyTotal = await page.locator('[data-testid="monthly-total"]').textContent();
    expect(monthlyTotal).toContain('$183.99'); // Sum of all expenses after edit

    // Step 10: Delete an expense
    const coffeeRow = page.locator('[data-testid="expense-item"]').filter({ hasText: 'Coffee shop' });
    await coffeeRow.locator('[data-testid="delete-expense-button"]').click();
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Verify expense is removed
    await expect(page.locator('[data-testid="expense-list"]')).not.toContainText('Coffee shop');
    
    // Verify total is updated
    const updatedTotal = await page.locator('[data-testid="monthly-total"]').textContent();
    expect(updatedTotal).toContain('$168.49'); // Total minus deleted expense
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="expense-form"]', { timeout: 10000 });

    // Test form validation
    await page.click('[data-testid="add-expense-button"]');
    await expect(page.locator('[data-testid="amount-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="description-error"]')).toBeVisible();

    // Test invalid amount
    await page.fill('[data-testid="expense-amount"]', 'invalid');
    await page.fill('[data-testid="expense-description"]', 'Test expense');
    await page.click('[data-testid="add-expense-button"]');
    await expect(page.locator('[data-testid="amount-error"]')).toContainText('valid number');

    // Test negative amount
    await page.fill('[data-testid="expense-amount"]', '-10');
    await page.click('[data-testid="add-expense-button"]');
    await expect(page.locator('[data-testid="amount-error"]')).toContainText('positive');

    // Test very large amount
    await page.fill('[data-testid="expense-amount"]', '9999999');
    await page.click('[data-testid="add-expense-button"]');
    await expect(page.locator('[data-testid="amount-error"]')).toContainText('maximum');
  });
});