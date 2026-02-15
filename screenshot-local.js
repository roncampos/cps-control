const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('📸 Taking screenshots from local dev server...');
  
  // Navigate to localhost
  await page.goto('http://localhost:3000');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('✅ Page loaded');
  
  // Screenshot 1: EOS Dashboard
  await page.screenshot({ path: 'final-1-eos-dashboard.png', fullPage: false });
  console.log('✅ Screenshot 1: EOS Dashboard');
  
  // Screenshot 2: Mission Control (click sidebar item)
  const mcButton = page.locator('text=Mission Control').first();
  await mcButton.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'final-2-mission-control.png', fullPage: false });
  console.log('✅ Screenshot 2: Mission Control');
  
  // Screenshot 3: Agents tab
  await page.locator('text=Agents').first().click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'final-3-mc-agents.png', fullPage: false });
  console.log('✅ Screenshot 3: Mission Control Agents');
  
  // Screenshot 4: Back to EOS, show Rocks
  await page.locator('text=EOS Dashboard').first().click();
  await page.waitForTimeout(800);
  await page.locator('text=Rocks').first().click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'final-4-eos-rocks.png', fullPage: false });
  console.log('✅ Screenshot 4: EOS Rocks');
  
  await browser.close();
  console.log('\n🎉 All screenshots captured successfully!');
})();
