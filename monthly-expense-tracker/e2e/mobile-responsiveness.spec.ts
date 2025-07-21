import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="expense-form"]', { timeout: 10000 });
    
    // Check mobile menu is visible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Test mobile form interaction
    await page.fill('[data-testid="expense-amount"]', '25.00');
    await page.fill('[data-testid="expense-description"]', 'Mobile test expense');
    await page.selectOption('[data-testid="expense-category"]', 'Food');
    await page.click('[data-testid="add-expense-button"]');
    
    // Verify expense was added
    await expect(page.locator('[data-testid="expense-list"]')).toContainText('Mobile test expense');
  });

  test('should have touch-friendly buttons on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="expense-form"]', { timeout: 10000 });
    
    // Add an expense first
    await page.fill('[data-testid="expense-amount"]', '15.00');
    await page.fill('[data-testid="expense-description"]', 'Touch test');
    await page.selectOption('[data-testid="expense-category"]', 'Food');
    await page.click('[data-testid="add-expense-button"]');
    
    // Check button sizes are appropriate for touch
    const editButton = page.locator('[data-testid="edit-expense-button"]');
    const deleteButton = page.locator('[data-testid="delete-expense-button"]');
    
    await expect(editButton).toBeVisible();
    await expect(deleteButton).toBeVisible();
    
    // Buttons should be at least 44px (recommended touch target size)
    const editButtonBox = await editButton.boundingBox();
    const deleteButtonBox = await deleteButton.boundingBox();
    
    expect(editButtonBox?.height).toBeGreaterThanOrEqual(44);
    expect(deleteButtonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('should navigate properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-menu-button"]', { timeout: 10000 });
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Navigate to different sections
    await page.click('[data-testid="mobile-analytics-link"]');
    await expect(page.locator('[data-testid="analytics-section"]')).toBeVisible();
    
    // Open menu again and go to budget
    await page.click('[data-testid="mobile-menu-button"]');
    await page.click('[data-testid="mobile-budget-link"]');
    await expect(page.locator('[data-testid="budget-section"]')).toBeVisible();
  });
});