import { test, expect } from '@playwright/test'

test.describe('Admin Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should complete full business workflow', async ({ page }) => {
    // Add supplier
    await page.click('text=Suppliers')
    await page.click('text=Add Supplier')
    await page.fill('input[name="name"]', 'New Supplier')
    await page.fill('input[name="email"]', 'supplier@test.com')
    await page.click('button:has-text("Create")')
    
    // Add product
    await page.click('text=Products')
    await page.click('text=Add Product')
    await page.fill('input[name="name"]', 'New Product')
    await page.fill('input[name="basePrice"]', '100')
    await page.click('button:has-text("Create")')

    // Create purchase
    await page.click('text=Purchases')
    await page.click('text=New Purchase')
    // Fill purchase form...

    // Verify dashboard updates
    await page.click('text=Dashboard')
    await expect(page.locator('text=New Product')).toBeVisible()
    await expect(page.locator('text=Current Stock: 20')).toBeVisible()
  })
}) 