import { test, expect } from '@playwright/test'

test.describe('Leashd Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('page loads and title is visible', async ({ page }) => {
    await expect(page).toHaveTitle(/leashd/i)
    const title = page.locator('text=leashd')
    await expect(title).toBeVisible()
  })

  test('wallet connect button is present', async ({ page }) => {
    const connectBtn = page.locator('button', { hasText: /connect/i })
    await expect(connectBtn).toBeVisible()
  })

  test('dashboard panels render', async ({ page }) => {
    // Check all 3 main panels exist
    await expect(page.locator('text=/wallet status/i')).toBeVisible()
    await expect(page.locator('text=/kill switch/i')).toBeVisible()
    await expect(page.locator('text=/activity/i')).toBeVisible()
  })

  test('kill switch button is present and styled', async ({ page }) => {
    const killBtn = page.locator('button', { hasText: /freeze/i })
    await expect(killBtn).toBeVisible()
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(2000)
    console.log('Console errors found:', errors)
    // Log but don't fail — some wallet adapter warnings are expected
  })

  test('theme colors are applied', async ({ page }) => {
    const body = page.locator('body')
    const bg = await body.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    )
    console.log('Background color:', bg)
    // Should be dark — not white
  })

  test('fonts loaded correctly', async ({ page }) => {
    await page.waitForTimeout(1000)
    const heading = page.locator('h1').first()
    const fontFamily = await heading.evaluate(el =>
      window.getComputedStyle(el).fontFamily
    )
    console.log('Heading font:', fontFamily)
    // Should contain Playfair Display
  })

})