const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('📸 Setting up authentication and taking screenshots...');
  
  const baseUrl = 'https://cps-control-yft5qlly0-ranulfo-campos-projects.vercel.app';
  
  // Set the bypass cookie
  await context.addCookies([{
    name: '_vercel_protection_bypass',
    value: 'AtPfMQKOHCOns3b4jYZmp36CIgUvrHKN',
    domain: '.vercel.app',
    path: '/',
    httpOnly: false,
    secure: true,
    sameSite: 'Lax'
  }]);
  
  // Navigate to the app
  await page.goto(baseUrl);
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log('Current URL:', page.url());
  console.log('Page title:', await page.title());
  
  // Take screenshot
  await page.screenshot({ path: 'shot-real-1.png', fullPage: false });
  console.log('✅ Screenshot saved: shot-real-1.png');
  
  // Also save the HTML to debug
  const html = await page.content();
  require('fs').writeFileSync('page-content.html', html);
  console.log('✅ HTML saved: page-content.html');
  
  await browser.close();
})();
