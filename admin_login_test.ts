import { chromium, expect } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:80/control-room-7f92x/login');

    console.log('Filling in credentials...');
    await page.fill('input[name="email"]', 'admin@centralcalendar.org');
    await page.fill('input[name="password"]', 'CentralCalendar2024!');

    console.log('Clicking AUTHENTICATE button...');
    await page.click('button:has-text("AUTHENTICATE")');

    console.log('Waiting for redirection...');
    await page.waitForURL('**/control-room-7f92x/events', { timeout: 10000 });
    console.log('Redirected to:', page.url());

    console.log('Verifying dashboard elements...');
    const sidebar = page.locator('aside');
    await expect(sidebar).toContainText('CONTROL ROOM');
    
    // Look for event listing or management UI
    const eventsHeader = page.locator('h1, h2, h3').filter({ hasText: /Events|Dashboard/i });
    await expect(eventsHeader.first()).toBeVisible({ timeout: 5000 });

    console.log('Checking localStorage...');
    const token = await page.evaluate(() => localStorage.getItem('cc_admin_token'));
    if (!token) {
        throw new Error('cc_admin_token not found in localStorage');
    }
    console.log('Token found in localStorage.');

    console.log('SUCCESS: Admin login verified.');
  } catch (error) {
    console.error('FAILURE:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
