const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('📸 Taking screenshot of live deployment...');
  
  // Navigate to the app
  await page.goto('https://cps-control-yft5qlly0-ranulfo-campos-projects.vercel.app');
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'screenshot-full-page.png', 
    fullPage: true 
  });
  
  console.log('✅ Screenshot saved: screenshot-full-page.png');
  
  await browser.close();
})();
