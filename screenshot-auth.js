const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('📸 Taking authenticated screenshots...');
  
  // Navigate with bypass token
  const url = 'https://cps-control-yft5qlly0-ranulfo-campos-projects.vercel.app/?vercelProtectionBypass=AtPfMQKOHCOns3b4jYZmp36CIgUvrHKN';
  await page.goto(url);
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Screenshot 1: EOS Dashboard (initial view)
  await page.screenshot({ path: 'shot-1-eos-dashboard.png', fullPage: false });
  console.log('✅ Screenshot 1: EOS Dashboard');
  
  // Screenshot 2: Rocks page
  await page.click('text=Rocks');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'shot-2-eos-rocks.png', fullPage: false });
  console.log('✅ Screenshot 2: EOS Rocks');
  
  // Screenshot 3: Mission Control
  await page.click('text=Mission Control');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'shot-3-mission-control.png', fullPage: false });
  console.log('✅ Screenshot 3: Mission Control Board');
  
  // Screenshot 4: Agents view
  await page.click('text=◎ Agents');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'shot-4-mc-agents.png', fullPage: false });
  console.log('✅ Screenshot 4: MC Agents');
  
  // Screenshot 5: Heartbeat view
  await page.click('text=♡ Heartbeat');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'shot-5-mc-heartbeat.png', fullPage: false });
  console.log('✅ Screenshot 5: MC Heartbeat');
  
  await browser.close();
  console.log('\n🎉 All 5 screenshots captured!');
})();
