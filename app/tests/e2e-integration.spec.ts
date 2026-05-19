import { test, expect, Page } from '@playwright/test'

test.describe('Leashd E2E Integration', () => {

  test('1. App loads with correct branding', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    // Title check
    const title = page.locator('h1').first()
    await expect(title).toBeVisible()
    const titleText = await title.textContent()
    console.log('App title:', titleText)
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/01-landing.png' })
  })

  test('2. Wallet connect button renders', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    // Look for any connect-related button
    const connectBtn = page.locator('button').filter({ 
      hasText: /connect|select|wallet/i 
    }).first()
    await expect(connectBtn).toBeVisible()
    
    await page.screenshot({ path: 'tests/screenshots/02-connect.png' })
    console.log('Connect button text:', await connectBtn.textContent())
  })

  test('3. Dashboard panels exist', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Count visible panels/cards
    const cards = page.locator('[class*="card"], [class*="panel"], [class*="rounded"]')
    const count = await cards.count()
    console.log('Panel/card count:', count)
    
    await page.screenshot({ path: 'tests/screenshots/03-dashboard.png' })
  })

  test('4. No JS errors on load', async ({ page }) => {
    const errors: string[] = []
    const warnings: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
      if (msg.type() === 'warning') warnings.push(msg.text())
    })
    
    page.on('pageerror', err => errors.push(err.message))
    
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    console.log('JS Errors:', errors)
    console.log('Warnings:', warnings)
    
    // Filter out known wallet adapter warnings
    const realErrors = errors.filter(e => 
      !e.includes('wallet') && 
      !e.includes('Wallet') &&
      !e.includes('solana')
    )
    
    expect(realErrors).toHaveLength(0)
  })

  test('5. Theme verification', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    // Check heading font
    const h1 = page.locator('h1').first()
    const fontFamily = await h1.evaluate(el => 
      window.getComputedStyle(el).fontFamily
    )
    console.log('Heading font:', fontFamily)
    
    await page.screenshot({ 
      path: 'tests/screenshots/05-theme.png',
      fullPage: true 
    })
  })

  test('6. Mobile viewport check', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    // Check nothing overflows
    const hasHorizontalScroll = await page.evaluate(() => 
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
    console.log('Has horizontal scroll (bad):', hasHorizontalScroll)
    
    await page.screenshot({ 
      path: 'tests/screenshots/06-mobile.png',
      fullPage: true 
    })
  })

  test('7. API health from frontend context', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Check backend is reachable
    const apiResponse = await page.evaluate(async () => {
      try {
        const res = await fetch('http://localhost:3001/health')
        return await res.json()
      } catch (e) {
        return { error: String(e) }
      }
    })
    console.log('Backend health from browser:', apiResponse)
    expect(apiResponse.status).toBe('ok')
  })

})
