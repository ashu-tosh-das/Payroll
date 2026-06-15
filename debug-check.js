const { chromium } = require('C:\\Users\\user\\AppData\\Roaming\\fnm\\node-versions\\v20.20.2\\installation\\node_modules\\@playwright\\mcp\\node_modules\\playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const allConsole = [];
  page.on('console', m => {
    if (m.type() === 'error' || (m.type() === 'warning' && m.text().includes('key'))) {
      allConsole.push({ type: m.type(), text: m.text() });
    }
  });

  await page.goto('http://localhost:3000/Source%20One%20Payroll%20Cloud.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#root > *', { timeout: 15000 });
  await page.waitForTimeout(1500);

  const screens = ['dashboard','payroll','employees','attendance','payslips','compliance',
    'letters','copilot','anomalies','reports','audit','support','settings','expenses',
    'reimbursements','fnf-settlement','salary-increment','headcount-forecast',
    'bank-transfer','payroll-variance','contractors','clients'];
  for (const s of screens) {
    await page.evaluate(({ id }) => window.appNav?.(id), { id: s });
    await page.waitForTimeout(350);
  }

  // Employee portal
  await page.evaluate(() => window.switchPortal?.('employee'));
  await page.waitForTimeout(400);
  for (const s of ['emp-dashboard','my-payslips','it-declaration','salary-calculator','my-attendance','my-leave']) {
    await page.evaluate(({ id }) => window.appNav?.(id), { id: s });
    await page.waitForTimeout(350);
  }

  // Settings text
  await page.evaluate(() => { window.switchPortal?.('admin'); window.appNav?.('settings'); });
  await page.waitForTimeout(1000);
  const settingsText = await page.evaluate(() => document.querySelector('.canvas .page')?.innerText?.slice(0, 800) || 'MISSING');
  console.log('=== SETTINGS PAGE TEXT ===');
  console.log(settingsText);

  // Nav items actual class
  const navHTML = await page.evaluate(() => {
    const nav = document.querySelector('.sidebar');
    return nav ? nav.innerHTML.slice(0, 600) : 'MISSING';
  });
  console.log('\n=== SIDEBAR HTML (first 600) ===');
  console.log(navHTML);

  // Modal test with correct selectors
  await page.evaluate(() => window.openModal({ title: 'Test', body: 'Test body', confirmText: 'OK', onConfirm: () => {} }));
  await page.waitForTimeout(400);
  const modalInfo = await page.evaluate(() => {
    const masks = document.querySelectorAll('.drawer-mask');
    const glasses = document.querySelectorAll('.glass-strong');
    return {
      maskCount: masks.length,
      glassCount: glasses.length,
      highZMask: Array.from(masks).some(m => parseInt(m.style.zIndex) >= 100),
    };
  });
  console.log('\n=== MODAL STATE ===');
  console.log(JSON.stringify(modalInfo, null, 2));

  console.log('\n=== CONSOLE ERRORS / KEY WARNINGS ===');
  if (allConsole.length === 0) console.log('None captured');
  allConsole.forEach(c => console.log(`[${c.type}] ${c.text}`));

  await browser.close();
})();
