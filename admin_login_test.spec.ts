import { test, expect } from '@playwright/test';

test('admin login works and redirects to dashboard', async ({ page }) => {
  // Navigate to login page
  console.log('Navigating to login page...');
  await page.goto('http://localhost:80/control-room-7f92x/login');

  // Fill in credentials
  console.log('Filling in credentials...');
  await page.fill('input[name="email"]', 'admin@centralcalendar.org');
  await page.fill('input[name="password"]', 'CentralCalendar2024!');

  // Click AUTHENTICATE button
  console.log('Clicking AUTHENTICATE button...');
  await page.click('button:has-text("AUTHENTICATE")');

  // Verify redirection to /control-room-7f92x/events
  console.log('Waiting for redirection...');
  await expect(page).toHaveURL(/.*\/control-room-7f92x\/events/, { timeout: 10000 });

  // Verify dashboard elements
  console.log('Verifying dashboard elements...');
  const sidebarText = page.locator('aside');
  await expect(sidebarText).toContainText('CONTROL ROOM');
  
  // Look for event listing/management UI (e.g., "Events" header or table)
  await expect(page.locator('h1, h2, h3')).toContainText(['Events', 'Dashboard'], { timeout: 5000 });

  // Check localStorage for cc_admin_token
  console.log('Checking localStorage...');
  const token = await page.evaluate(() => localStorage.getItem('cc_admin_token'));
  console.log('Token found in localStorage:', token ? 'Yes (hidden for security)' : 'No');
  expect(token).not.toBeNull();
  expect(token?.length).toBeGreaterThan(0);

  console.log('Admin login test passed successfully!');
});
