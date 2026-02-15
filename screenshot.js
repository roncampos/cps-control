const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // Navigate to the app
  await page.goto('https://cps-control-yft5qlly0-ranulfo-campos-projects.vercel.app');
  
  // Wait for content to load
  await page.waitForTimeout(3000);
  
  // Screenshot 1: EOS Dashboard
  await page.screenshot({ path: 'screenshot-1-eos-dashboard.png', fullPage: false });
  console.log('✅ Captured: EOS Dashboard');
  
  // Click Mission Control
  await page.click('text=Mission Control');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot-2-mission-control-board.png', fullPage: false });
  console.log('✅ Captured: Mission Control Board');
  
  // Click Agents tab
  await page.click('text=◎ Agents');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot-3-mission-control-agents.png', fullPage: false });
  console.log('✅ Captured: Mission Control Agents');
  
  // Click Heartbeat tab
  await page.click('text=♡ Heartbeat');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot-4-mission-control-heartbeat.png', fullPage: false });
  console.log('✅ Captured: Mission Control Heartbeat');
  
  // Go back to EOS and check Rocks
  await page.click('text=EOS Dashboard');
  await page.waitForTimeout(500);
  await page.click('text=Rocks');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot-5-eos-rocks.png', fullPage: false });
  console.log('✅ Captured: EOS Rocks');
  
  await browser.close();
  console.log('\n🎉 All screenshots captured!');
})();
