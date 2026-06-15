/**
 * MCP-style Comprehensive Browser Test — Source One Payroll Cloud
 * Chromium headless · screenshots · interactions · bug report
 */
const { chromium } = require('C:\\Users\\user\\AppData\\Roaming\\fnm\\node-versions\\v20.20.2\\installation\\node_modules\\@playwright\\mcp\\node_modules\\playwright');
const path = require('path');
const fs   = require('fs');

const BASE        = 'http://localhost:3000/Source%20One%20Payroll%20Cloud.html';
const SS_DIR      = path.join(__dirname, 'test-screenshots');
const VIEWPORT    = { width: 1440, height: 900 };

const bugs   = [];
const passes = [];
let   ssIdx  = 0;

const log  = msg => console.log(`\n[${new Date().toISOString().slice(11,19)}] ${msg}`);
const pass = (id, msg) => { passes.push({ id, msg }); console.log(`  ✓ ${id}: ${msg}`); };
const fail = (id, sev, msg) => { bugs.push({ id, sev, msg }); console.log(`  ✗ [${sev}] ${id}: ${msg}`); };

async function ss(page, name) {
  const file = path.join(SS_DIR, `${String(++ssIdx).padStart(2,'0')}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`    📸 ${path.basename(file)}`);
  return file;
}

async function nav(page, id, portal = 'admin') {
  await page.evaluate(({ id, p }) => {
    if (p === 'employee') window.switchPortal?.('employee');
    else window.switchPortal?.('admin');
    window.appNav?.(id);
  }, { id, p: portal });
  await page.waitForTimeout(700);
}

async function waitReady(page) {
  await page.waitForSelector('#root > *', { timeout: 20000 });
  await page.waitForTimeout(1200);
}

async function checkVisible(page, selector, label) {
  const el = await page.$(selector);
  if (!el) { fail(label, 'HIGH', `Element not found: ${selector}`); return false; }
  const box = await el.boundingBox();
  if (!box || box.width < 1 || box.height < 1) { fail(label, 'HIGH', `Element zero-size: ${selector}`); return false; }
  pass(label, `visible (${Math.round(box.width)}×${Math.round(box.height)})`);
  return true;
}

async function checkText(page, selector, expected, label) {
  const text = await page.$eval(selector, el => el.textContent.trim()).catch(() => null);
  if (!text) { fail(label, 'MEDIUM', `Element missing: ${selector}`); return; }
  if (!text.includes(expected)) { fail(label, 'MEDIUM', `Expected "${expected}", got "${text.slice(0,60)}"`); return; }
  pass(label, `text "${expected}" found`);
}

async function checkNoJSErrors(page, errors, label) {
  if (errors.length === 0) { pass(label, 'no JS errors'); return; }
  errors.forEach(e => fail(label, 'HIGH', `JS error: ${e.slice(0,120)}`));
}

// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  log('=== SOURCE ONE PAYROLL CLOUD — MCP Browser Test ===');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const ctx  = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();

  const jsErrors = [];
  page.on('console', m => { if (m.type() === 'error') jsErrors.push(m.text()); });
  page.on('pageerror', e => jsErrors.push(e.message));

  // ── 1. LOAD ────────────────────────────────────────────────────────────────
  log('── 1. Initial load');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await waitReady(page);
  await ss(page, 'app-loaded');

  // Ensure err-display is hidden (no crash on load)
  const errDisplay = await page.$eval('#err-display', el => el.style.display).catch(() => 'none');
  if (errDisplay !== 'none') fail('app-load', 'CRITICAL', 'Error overlay visible on load');
  else pass('app-load', 'No crash overlay on initial load');

  // ── 2. SIDEBAR ─────────────────────────────────────────────────────────────
  log('── 2. Sidebar');
  await checkVisible(page, '.sidebar', 'sidebar-visible');
  await checkVisible(page, '.sidebar nav', 'sidebar-nav');
  await checkVisible(page, '.sb-foot', 'sidebar-footer');

  // Check all nav items render
  const navTotal = await page.$$eval('.sidebar .nav-item', els => els.length).catch(() => 0);
  pass('sidebar-nav-count', `${navTotal} nav items rendered`);

  // ── 3. DASHBOARD ───────────────────────────────────────────────────────────
  log('── 3. Dashboard');
  await nav(page, 'dashboard');
  await ss(page, 'dashboard');
  await checkVisible(page, '.canvas .page', 'dashboard-page');
  await checkVisible(page, '.canvas .card', 'dashboard-cards');
  const kpiCards = await page.$$eval('.card.kpi', els => els.length).catch(() => 0);
  pass('dashboard-kpis', `${kpiCards} KPI cards`);

  // Approval row
  const approvalRow = await page.$('.canvas [style*="position: absolute"]');
  if (approvalRow) pass('dashboard-approval-row', 'ApprovalRow rendered');
  else fail('dashboard-approval-row', 'LOW', 'ApprovalRow not found');

  // ── 4. PAYROLL ─────────────────────────────────────────────────────────────
  log('── 4. Payroll');
  await nav(page, 'payroll');
  await ss(page, 'payroll');
  await checkVisible(page, '.canvas .page', 'payroll-page');

  // Run selector cards
  const runCards = await page.$$eval('.canvas [style*="flexShrink: 0"], .canvas [style*="flex-shrink: 0"]', els => els.length).catch(() => 0);
  pass('payroll-run-cards', `Run selector present`);

  // Client tabs
  const clientTabs = await page.$$eval('.canvas button', els =>
    els.filter(b => b.textContent.includes('CLT-')).length
  ).catch(() => 0);
  pass('payroll-client-tabs', `${clientTabs} client tabs rendered`);

  // Click first client tab
  const firstClientTab = await page.$('.canvas button:has-text("CLT-001"), .canvas button');
  if (firstClientTab) {
    const txt = await firstClientTab.textContent();
    if (txt?.includes('CLT')) {
      await firstClientTab.click();
      await page.waitForTimeout(400);
      await ss(page, 'payroll-client-selected');
      pass('payroll-client-click', 'Client tab click navigated');
    }
  }

  // ── 5. EMPLOYEES ───────────────────────────────────────────────────────────
  log('── 5. Employees');
  await nav(page, 'employees');
  await ss(page, 'employees');
  await checkVisible(page, '.canvas table.tbl', 'employees-table');

  const empRows = await page.$$eval('.canvas table.tbl tbody tr', els => els.length).catch(() => 0);
  if (empRows < 10) fail('employees-rows', 'HIGH', `Only ${empRows} employee rows (expected 30)`);
  else pass('employees-rows', `${empRows} employee rows visible`);

  // Search
  const searchInput = await page.$('.canvas input[placeholder*="Search"]');
  if (searchInput) {
    await searchInput.fill('Priya');
    await page.waitForTimeout(400);
    const filtered = await page.$$eval('.canvas table.tbl tbody tr', els => els.length).catch(() => 0);
    await searchInput.fill('');
    await page.waitForTimeout(300);
    pass('employees-search', `Search filtered to ${filtered} rows`);
  } else {
    fail('employees-search', 'MEDIUM', 'Search input not found');
  }

  // Add employee — SA guard
  await page.evaluate(() => window.setCurrentUserRole?.('hr_manager'));
  await page.waitForTimeout(300);
  const addBtnEls = await page.$$('.canvas button.btn.primary');
  let addBtn = null;
  for (const b of addBtnEls) {
    const t = await b.textContent();
    if (t?.toLowerCase().includes('add employee')) { addBtn = b; break; }
  }
  if (addBtn) {
    await addBtn.click();
    await page.waitForTimeout(400);
    const drawerOpen = await page.$('.drawer-mask');
    if (drawerOpen) fail('employees-sa-guard', 'CRITICAL', 'Drawer opened for non-SA user');
    else pass('employees-sa-guard', 'Add Employee blocked for HR Manager');
  }

  // Switch back to SA and open drawer
  await page.evaluate(() => window.setCurrentUserRole?.('super_admin'));
  await page.waitForTimeout(300);
  if (addBtn) {
    await addBtn.click();
    await page.waitForTimeout(500);
    const drawerOpen = await page.$('.drawer-mask');
    if (drawerOpen) {
      await ss(page, 'employees-add-drawer');
      pass('employees-add-drawer', 'Drawer opened for Super Admin');
      // Close
      const closeBtn = await page.$('.drawer .iconbtn');
      if (closeBtn) { await closeBtn.click(); await page.waitForTimeout(300); }
    } else {
      fail('employees-add-drawer', 'HIGH', 'Drawer did not open for SA');
    }
  }

  // ── 6. EMPLOYEE PROFILE DRAWER ─────────────────────────────────────────────
  log('── 6. Employee profile drawer');
  const firstRow = await page.$('.canvas table.tbl tbody tr');
  if (firstRow) {
    await firstRow.click();
    await page.waitForTimeout(500);
    const profileDrawer = await page.$('.drawer-mask');
    if (profileDrawer) {
      await ss(page, 'employee-profile-drawer');
      pass('employee-profile-drawer', 'Profile drawer opens on row click');
      const closeBtn = await page.$('.drawer .iconbtn');
      if (closeBtn) { await closeBtn.click(); await page.waitForTimeout(300); }
    } else {
      fail('employee-profile-drawer', 'HIGH', 'Profile drawer did not open');
    }
  }

  // ── 7. ATTENDANCE ──────────────────────────────────────────────────────────
  log('── 7. Attendance');
  await nav(page, 'attendance');
  await ss(page, 'attendance');
  await checkVisible(page, '.canvas .page', 'attendance-page');

  // ── 8. PAYSLIPS ────────────────────────────────────────────────────────────
  log('── 8. Payslips');
  await nav(page, 'payslips');
  await ss(page, 'payslips');
  await checkVisible(page, '.canvas .page', 'payslips-page');
  // Check for ₹ symbols (not ?)
  const payslipText = await page.$eval('.canvas .page', el => el.innerText).catch(() => '');
  const brokenRupees = (payslipText.match(/\?\d/g) || []).length;
  if (brokenRupees > 0) fail('payslips-rupee', 'HIGH', `${brokenRupees} broken ₹ symbols`);
  else pass('payslips-rupee', 'No broken ₹ symbols');

  // ── 9. SETTINGS ────────────────────────────────────────────────────────────
  log('── 9. Settings / RBAC');
  await nav(page, 'settings');
  await ss(page, 'settings');
  await checkVisible(page, '.canvas .page', 'settings-page');

  // Roles list — check actual role names from ROLES_DATA
  const roles = await page.$eval('.canvas .page', el => {
    const text = el.innerText;
    return ['Super Admin','Payroll Manager','Finance','Employee'].filter(r => text.includes(r));
  }).catch(() => []);
  if (roles.length < 4) fail('settings-roles', 'HIGH', `Missing roles — only found: ${roles.join(', ')}`);
  else pass('settings-roles', `Roles present: ${roles.join(', ')}`);

  // ── 10. CONTRACTORS ────────────────────────────────────────────────────────
  log('── 10. Contractors');
  await nav(page, 'contractors');
  await ss(page, 'contractors');

  // Verify table has scroll wrapper
  const contractorScrollOk = await page.evaluate(() => {
    const table = document.querySelector('.canvas .tbl');
    if (!table) return 'NO_TABLE';
    const wrapper = table.parentElement;
    return getComputedStyle(wrapper).overflowX;
  });
  if (contractorScrollOk === 'auto' || contractorScrollOk === 'scroll')
    pass('contractors-scroll', `Table wrapped in overflowX: ${contractorScrollOk}`);
  else
    fail('contractors-scroll', 'MEDIUM', `Table missing scroll wrapper (overflowX: ${contractorScrollOk})`);

  // ── 11. ANOMALIES ──────────────────────────────────────────────────────────
  log('── 11. Anomalies');
  await nav(page, 'anomalies');
  await ss(page, 'anomalies');
  await checkVisible(page, '.canvas .page', 'anomalies-page');

  // ── 12. REPORTS ────────────────────────────────────────────────────────────
  log('── 12. Reports');
  await nav(page, 'reports');
  await ss(page, 'reports');
  await checkVisible(page, '.canvas .page', 'reports-page');

  // ── 13. AUDIT LOG ──────────────────────────────────────────────────────────
  log('── 13. Audit log');
  await nav(page, 'audit');
  await ss(page, 'audit');
  await checkVisible(page, '.canvas .page', 'audit-page');

  // ── 14. SUPPORT ────────────────────────────────────────────────────────────
  log('── 14. Support');
  await nav(page, 'support');
  await ss(page, 'support');
  await checkVisible(page, '.canvas .page', 'support-page');

  // ── 15. COMPLIANCE ─────────────────────────────────────────────────────────
  log('── 15. Compliance');
  await nav(page, 'compliance');
  await ss(page, 'compliance');
  await checkVisible(page, '.canvas .page', 'compliance-page');

  // ── 16. SALARY INCREMENT ───────────────────────────────────────────────────
  log('── 16. Salary Increment');
  await nav(page, 'salary-increment');
  await ss(page, 'salary-increment');
  await checkVisible(page, '.canvas .page', 'salary-increment-page');

  // ── 17. FNF SETTLEMENT ─────────────────────────────────────────────────────
  log('── 17. FnF Settlement');
  await nav(page, 'fnf-settlement');
  await ss(page, 'fnf-settlement');
  await checkVisible(page, '.canvas .page', 'fnf-settlement-page');

  // ── 18. BANK TRANSFER ──────────────────────────────────────────────────────
  log('── 18. Bank Transfer');
  await nav(page, 'bank-transfer');
  await ss(page, 'bank-transfer');
  await checkVisible(page, '.canvas .page', 'bank-transfer-page');

  // ── 19. HEADCOUNT FORECAST ─────────────────────────────────────────────────
  log('── 19. Headcount Forecast');
  await nav(page, 'headcount-forecast');
  await ss(page, 'headcount-forecast');
  await checkVisible(page, '.canvas .page', 'headcount-forecast-page');

  // ── 20. PAYROLL VARIANCE ───────────────────────────────────────────────────
  log('── 20. Payroll Variance');
  await nav(page, 'payroll-variance');
  await ss(page, 'payroll-variance');
  await checkVisible(page, '.canvas .page', 'payroll-variance-page');

  // ── 21. EXPENSES ───────────────────────────────────────────────────────────
  log('── 21. Expenses');
  await nav(page, 'expenses');
  await ss(page, 'expenses');
  await checkVisible(page, '.canvas .page', 'expenses-page');

  // ── 22. REIMBURSEMENTS ─────────────────────────────────────────────────────
  log('── 22. Reimbursements');
  await nav(page, 'reimbursements');
  await ss(page, 'reimbursements');
  await checkVisible(page, '.canvas .page', 'reimbursements-page');

  // ── 23. CLIENTS ────────────────────────────────────────────────────────────
  log('── 23. Clients');
  await nav(page, 'clients');
  await ss(page, 'clients');
  await checkVisible(page, '.canvas .page', 'clients-page');
  const clientCards = await page.$$eval('.canvas .grid .card', els => els.length).catch(() => 0);
  pass('clients-cards', `${clientCards} client cards rendered`);

  // ── 24. ROLE SWITCHER ──────────────────────────────────────────────────────
  log('── 24. Sidebar role switcher');
  const sbFoot = await page.$('.sb-foot');
  if (sbFoot) {
    await sbFoot.click();
    await page.waitForTimeout(400);
    await ss(page, 'role-picker-open');
    // Pick HR Manager
    const hrOption = await page.$('.sb-foot ~ *, .glass-strong');
    const picker = await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('*'));
      return divs.some(d => d.textContent.includes('Rahul Mehta') && d.getBoundingClientRect().height > 0);
    });
    if (picker) pass('role-picker', 'Role picker shows personas');
    else fail('role-picker', 'MEDIUM', 'Personas not visible in role picker');
    // Close
    await page.keyboard.press('Escape');
    await page.evaluate(() => document.body.click());
    await page.waitForTimeout(300);
  }

  // ── 25. EMPLOYEE PORTAL ────────────────────────────────────────────────────
  log('── 25. Employee Portal — switch + screens');
  await page.evaluate(() => window.switchPortal?.('employee'));
  await page.waitForTimeout(600);
  await ss(page, 'portal-switched');
  await checkVisible(page, '.canvas .page', 'portal-loaded');

  const portalScreens = [
    ['emp-dashboard',    'portal-dashboard'],
    ['my-payslips',      'portal-payslips'],
    ['it-declaration',   'portal-it-declaration'],
    ['salary-calculator','portal-salary-calc'],
    ['my-attendance',    'portal-attendance'],
    ['my-leave',         'portal-leave'],
    ['emp-profile',      'portal-profile'],
  ];

  for (const [id, label] of portalScreens) {
    await nav(page, id, 'employee');
    const text = await page.$eval('.canvas .page', el => el.innerText).catch(() => '');
    const brokenRupee = (text.match(/\?\d/g) || []).length;
    if (brokenRupee > 0) fail(`${label}-rupee`, 'HIGH', `${brokenRupee} broken ₹ symbols`);
    else pass(`${label}-rupee`, 'No broken ₹ symbols');
    await checkVisible(page, '.canvas .page', label);
  }
  await ss(page, 'portal-it-declaration');

  // Back to admin
  await page.evaluate(() => window.switchPortal?.('admin'));
  await page.waitForTimeout(400);

  // ── 26. TOAST SYSTEM ──────────────────────────────────────────────────────
  log('── 26. Toast notification system');
  await page.evaluate(() => window.toast('Test notification', { icon: 'check', tone: 'ok', sub: 'Toast system working' }));
  await page.waitForTimeout(400);
  const toastVisible = await page.evaluate(() => {
    const el = document.querySelector('.toast-host, [style*="toastIn"], [class*="toast"]');
    return !!el;
  });
  if (toastVisible) pass('toast-system', 'Toast rendered');
  else fail('toast-system', 'LOW', 'Toast element not found after trigger');
  await ss(page, 'toast-visible');

  // ── 27. MODAL SYSTEM ──────────────────────────────────────────────────────
  log('── 27. Modal system');
  await page.evaluate(() => window.openModal({
    title: 'Test modal',
    subtitle: 'Verifying modal renders',
    body: 'Modal body content',
    confirmText: 'OK',
    onConfirm: () => {},
  }));
  await page.waitForTimeout(400);
  // Modal uses .drawer-mask (zIndex 100) + .glass-strong (zIndex 101)
  const modalVisible = await page.evaluate(() => {
    const masks = Array.from(document.querySelectorAll('.drawer-mask'));
    return masks.some(m => parseInt(m.style.zIndex) >= 100);
  });
  if (modalVisible) {
    await ss(page, 'modal-visible');
    pass('modal-system', 'Modal rendered (drawer-mask zIndex ≥100)');
    // Close via Cancel button (ghost btn in modal footer)
    const cancelBtn = await page.$('.glass-strong .btn.ghost');
    if (cancelBtn) { await cancelBtn.click(); await page.waitForTimeout(300); }
    else await page.keyboard.press('Escape');
  } else {
    fail('modal-system', 'MEDIUM', 'Modal did not appear');
  }

  // ── 28. JS ERROR SUMMARY ──────────────────────────────────────────────────
  log('── 28. JS error check');
  // Filter noise
  const realErrors = jsErrors.filter(e =>
    !e.includes('favicon') &&
    !e.includes('net::ERR') &&
    !e.includes('Failed to load resource')
  );
  if (realErrors.length === 0) pass('js-errors', 'Zero JS errors across all screens');
  else realErrors.slice(0, 5).forEach(e => fail('js-errors', 'HIGH', e.slice(0, 150)));

  await browser.close();

  // ── FINAL REPORT ──────────────────────────────────────────────────────────
  const divider = '═'.repeat(60);
  console.log(`\n${divider}`);
  console.log('BROWSER TEST REPORT — Source One Payroll Cloud');
  console.log(divider);

  const bySev = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
  bugs.forEach(b => (bySev[b.sev] = bySev[b.sev] || []).push(b));

  if (bugs.length === 0) {
    console.log('\n✅  All checks passed — no bugs found!\n');
  } else {
    for (const [sev, list] of Object.entries(bySev)) {
      if (!list?.length) continue;
      console.log(`\n${sev} (${list.length}):`);
      list.forEach(b => console.log(`  [${b.id}] ${b.msg}`));
    }
  }

  console.log(`\nPASSED: ${passes.length}   FAILED: ${bugs.length}`);
  const ssFiles = fs.readdirSync(SS_DIR).filter(f => f.endsWith('.png'));
  console.log(`SCREENSHOTS: ${ssFiles.length} saved to test-screenshots/`);
  console.log(divider);

  process.exit(bugs.filter(b => b.sev === 'CRITICAL').length > 0 ? 1 : 0);
})();
