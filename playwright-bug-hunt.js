// Playwright bug-hunting script for Source One Payroll Cloud
// Run: node playwright-bug-hunt.js

const { chromium } = require('C:\\Users\\user\\AppData\\Roaming\\fnm\\node-versions\\v20.20.2\\installation\\node_modules\\@playwright\\mcp\\node_modules\\playwright');

const BASE = 'http://localhost:3000/Source%20One%20Payroll%20Cloud.html';

const ADMIN_SCREENS = [
  'dashboard', 'payroll', 'employees', 'attendance', 'payslips',
  'compliance', 'letters', 'copilot', 'anomalies', 'reports',
  'audit', 'support', 'settings', 'expenses', 'reimbursements',
  'fnf-settlement', 'salary-increment', 'headcount-forecast',
  'bank-transfer', 'payroll-variance', 'contractors', 'clients'
];

const EMP_SCREENS = [
  'emp-dashboard', 'my-attendance', 'my-leave', 'my-payslips',
  'it-declaration', 'salary-calculator', 'my-reimbursements',
  'raise-ticket', 'wfh-booking', 'emp-profile', 'biometric-sync'
];

const bugs = [];
const screenshots = [];

function log(msg) { console.log(`[${new Date().toISOString().slice(11,19)}] ${msg}`); }
function bug(screen, severity, desc, extra = '') {
  bugs.push({ screen, severity, desc, extra });
  console.log(`  🐛 [${severity}] ${screen}: ${desc}${extra ? ' — ' + extra : ''}`);
}

async function waitForApp(page) {
  // Wait for React to mount: look for .app-shell or .sidebar
  await page.waitForSelector('.app-shell, .sidebar, #root > *', { timeout: 15000 });
  await page.waitForTimeout(800); // let React settle
}

async function navigateTo(page, screenId, portal = 'admin') {
  await page.evaluate(({ id, p }) => {
    if (p === 'employee' && window.switchPortal) window.switchPortal('employee');
    else if (p === 'admin' && window.switchPortal) window.switchPortal('admin');
    if (window.appNav) window.appNav(id);
  }, { id: screenId, p: portal });
  await page.waitForTimeout(600);
}

async function getConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

async function checkOverflow(page, screenId) {
  const overflows = await page.evaluate(() => {
    const results = [];
    const canvas = document.querySelector('.canvas');
    if (!canvas) return results;
    const canvasRight = canvas.getBoundingClientRect().right;
    const els = canvas.querySelectorAll('*');
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > canvasRight + 10) {
        results.push(el.tagName + '.' + (el.className || '').toString().trim().split(' ')[0] + ` (right: ${Math.round(r.right)}, canvas: ${Math.round(canvasRight)})`);
      }
    }
    return results.slice(0, 5);
  });
  if (overflows.length > 0) {
    bug(screenId, 'MEDIUM', 'Horizontal overflow detected', overflows.join(' | '));
  }
}

async function checkBrokenImages(page, screenId) {
  const broken = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => img.src || img.alt || 'unknown');
  });
  if (broken.length > 0) bug(screenId, 'LOW', 'Broken images', broken.slice(0,3).join(', '));
}

async function checkEmptyContainers(page, screenId) {
  const empty = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('.card, .page').forEach(el => {
      const text = el.innerText.trim();
      if (text.length < 3 && el.children.length === 0) {
        results.push(el.className.split(' ')[0]);
      }
    });
    return results.slice(0, 3);
  });
  if (empty.length > 0) bug(screenId, 'LOW', 'Empty card/container elements', empty.join(', '));
}

async function checkRupeeSymbols(page, screenId) {
  const bad = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const results = [];
    let node;
    while ((node = walker.nextNode())) {
      const t = node.textContent;
      // Look for ? immediately before digits (indicates broken ₹)
      if (/\?\d/.test(t) || /\?\s*\d{3,}/.test(t)) {
        const parent = node.parentElement;
        if (parent && !parent.closest('script') && !parent.closest('style')) {
          results.push(t.trim().slice(0, 60));
        }
      }
    }
    return results.slice(0, 5);
  });
  if (bad.length > 0) bug(screenId, 'HIGH', 'Broken ₹ symbols (? before digits)', bad.join(' | '));
}

async function checkReplacementChars(page, screenId) {
  const bad = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const results = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.includes('�')) {
        results.push(node.textContent.trim().slice(0, 60));
      }
    }
    return results.slice(0, 3);
  });
  if (bad.length > 0) bug(screenId, 'HIGH', 'U+FFFD replacement characters visible', bad.join(' | '));
}

async function checkButtonsWork(page, screenId) {
  // Check that primary buttons exist and are visible
  const primaryBtns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.btn.primary, button.primary'))
      .filter(b => {
        const r = b.getBoundingClientRect();
        return r.width === 0 || r.height === 0;
      })
      .map(b => b.textContent.trim().slice(0, 30));
  });
  if (primaryBtns.length > 0) bug(screenId, 'MEDIUM', 'Zero-size primary buttons', primaryBtns.join(', '));
}

async function checkZeroSizeElements(page, screenId) {
  const zeros = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('.card').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height < 10) {
        results.push(`card height=${Math.round(r.height)}px`);
      }
    });
    return results.slice(0, 3);
  });
  if (zeros.length > 0) bug(screenId, 'LOW', 'Suspiciously thin cards', zeros.join(', '));
}

async function checkInputsAccessible(page, screenId) {
  const broken = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select, textarea'))
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.height < 8;
      })
      .map(el => el.type || el.tagName);
  });
  if (broken.length > 0) bug(screenId, 'MEDIUM', 'Inputs too thin to interact with', broken.join(', '));
}

async function testAddEmployeeGuard(page) {
  log('Testing Add Employee role guard...');
  await navigateTo(page, 'employees');
  await page.waitForTimeout(500);

  // Switch to HR Manager (non-super-admin)
  const switched = await page.evaluate(() => {
    if (window.setCurrentUserRole) { window.setCurrentUserRole('hr_manager'); return true; }
    return false;
  });
  if (!switched) { bug('employees', 'HIGH', 'window.setCurrentUserRole not accessible'); return; }
  await page.waitForTimeout(400);

  // Click Add employee button
  const addBtn = await page.$('button.btn.primary');
  if (!addBtn) { bug('employees', 'MEDIUM', 'Add employee button not found'); return; }
  await addBtn.click();
  await page.waitForTimeout(400);

  // Should NOT show a drawer — check that drawer is not visible
  const drawerVisible = await page.evaluate(() => {
    const mask = document.querySelector('.drawer-mask');
    if (!mask) return false;
    const r = mask.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  if (drawerVisible) {
    bug('employees', 'CRITICAL', 'Add Employee drawer opened for non-Super-Admin (role guard bypassed)');
  } else {
    log('  ✓ Role guard working: drawer blocked for HR Manager');
  }

  // Check toast appeared
  const toastVisible = await page.evaluate(() => !!document.querySelector('[style*="toastIn"]'));
  if (!toastVisible) log('  ⚠ No toast shown on blocked add employee');

  // Switch back to Super Admin
  await page.evaluate(() => window.setCurrentUserRole && window.setCurrentUserRole('super_admin'));
  await page.waitForTimeout(300);
}

async function testAddEmployeeForm(page) {
  log('Testing Add Employee form (Super Admin)...');
  await navigateTo(page, 'employees');
  await page.waitForTimeout(500);

  // Find and click the Add employee button
  const btns = await page.$$('button.btn.primary');
  let addBtn = null;
  for (const btn of btns) {
    const txt = await btn.textContent();
    if (txt && txt.toLowerCase().includes('add employee')) { addBtn = btn; break; }
  }
  if (!addBtn) {
    // Try PageHead buttons
    const allBtns = await page.$$('.page button.btn.primary');
    for (const btn of allBtns) {
      const txt = await btn.textContent();
      if (txt && txt.toLowerCase().includes('add')) { addBtn = btn; break; }
    }
  }
  if (!addBtn) { bug('employees', 'HIGH', 'Add employee button not found for SA test'); return; }

  await addBtn.click();
  await page.waitForTimeout(600);

  const drawerOpen = await page.evaluate(() => !!document.querySelector('.drawer-mask'));
  if (!drawerOpen) { bug('employees', 'HIGH', 'Add Employee drawer did not open for Super Admin'); return; }
  log('  ✓ Drawer opened for Super Admin');

  // Try submitting empty form — should show validation errors
  const submitBtn = await page.$('.drawer button.btn.primary');
  if (submitBtn) {
    await submitBtn.click();
    await page.waitForTimeout(300);
    const errors = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.drawer div[style*="F87171"]')).map(e => e.textContent.trim());
    });
    if (errors.length === 0) {
      bug('employees', 'MEDIUM', 'Empty form submission shows no validation errors');
    } else {
      log(`  ✓ Validation triggered: ${errors.join(', ')}`);
    }
  }

  // Fill in the form
  const nameInput = await page.$('.drawer input[placeholder*="Kapoor"], .drawer input[placeholder*="Aanya"]');
  if (nameInput) {
    await nameInput.fill('Test Employee');
    const ctcInput = await page.$('.drawer input[type="number"]');
    if (ctcInput) await ctcInput.fill('1500000');
    const desigInput = await page.$('.drawer input[placeholder*="Engineer"]');
    if (desigInput) await desigInput.fill('QA Engineer');

    await submitBtn?.click();
    await page.waitForTimeout(600);

    const drawerGone = await page.evaluate(() => !document.querySelector('.drawer-mask'));
    if (!drawerGone) {
      bug('employees', 'MEDIUM', 'Drawer did not close after successful employee creation');
    } else {
      log('  ✓ Employee created and drawer closed');
    }
  }
}

async function testSidebarRoleSwitcher(page) {
  log('Testing sidebar role switcher...');
  const footer = await page.$('.sb-foot');
  if (!footer) { bug('shell', 'HIGH', 'Sidebar footer not found'); return; }

  await footer.click();
  await page.waitForTimeout(400);

  const picker = await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('.glass-strong'));
    return divs.some(d => d.getBoundingClientRect().height > 50);
  });
  if (!picker) {
    bug('shell', 'MEDIUM', 'Role picker dropdown did not appear on footer click');
  } else {
    log('  ✓ Role picker visible');
    // Close it
    await page.keyboard.press('Escape');
    await page.evaluate(() => document.body.click());
    await page.waitForTimeout(300);
  }
}

async function testPayrollCards(page) {
  log('Testing payroll run cards...');
  await navigateTo(page, 'payroll');
  await page.waitForTimeout(600);

  const cards = await page.$$('.card');
  if (cards.length === 0) { bug('payroll', 'HIGH', 'No cards rendered on payroll screen'); return; }

  // Check card heights are consistent
  const heights = await page.evaluate(() => {
    // Find the run selector area
    const allCards = Array.from(document.querySelectorAll('.canvas .card'));
    return allCards.slice(0, 8).map(c => Math.round(c.getBoundingClientRect().height));
  });
  log(`  Card heights: ${heights.join(', ')}`);
}

async function testDashboardApprovalRow(page) {
  log('Testing dashboard approval row...');
  await navigateTo(page, 'dashboard');
  await page.waitForTimeout(600);

  const lineOverflow = await page.evaluate(() => {
    const approvalDivs = Array.from(document.querySelectorAll('.canvas [style*="position: absolute"][style*="height: 2"]'));
    const overflow = approvalDivs.filter(el => {
      const parent = el.parentElement;
      if (!parent) return false;
      const pr = parent.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      return er.right > pr.right + 5;
    });
    return overflow.length;
  });
  if (lineOverflow > 0) {
    bug('dashboard', 'MEDIUM', `ApprovalRow progress line overflows container (${lineOverflow} elements)`);
  } else {
    log('  ✓ Approval row line within bounds');
  }
}

async function testEmployeePortalRupees(page) {
  log('Testing employee portal for rupee symbols...');

  const empScreens = [
    { id: 'my-payslips',       label: 'My Payslips' },
    { id: 'it-declaration',    label: 'IT Declaration' },
    { id: 'salary-calculator', label: 'Salary Calculator' },
    { id: 'my-reimbursements', label: 'My Reimbursements' },
  ];

  await page.evaluate(() => window.switchPortal && window.switchPortal('employee'));
  await page.waitForTimeout(500);

  for (const s of empScreens) {
    await navigateTo(page, s.id, 'employee');
    await page.waitForTimeout(500);
    await checkRupeeSymbols(page, `portal:${s.id}`);
    await checkReplacementChars(page, `portal:${s.id}`);
  }

  // Switch back
  await page.evaluate(() => window.switchPortal && window.switchPortal('admin'));
  await page.waitForTimeout(300);
}

async function testSettingsRBAC(page) {
  log('Testing Settings RBAC...');
  await navigateTo(page, 'settings');
  await page.waitForTimeout(700);

  // Check roles list is visible
  const roleItems = await page.$$('.card');
  if (roleItems.length < 2) { bug('settings', 'HIGH', 'Settings RBAC roles list not rendering'); return; }
  log(`  ✓ ${roleItems.length} cards visible in settings`);

  // Check Super Admin role cannot be deleted (button should be hidden)
  const deleteBtn = await page.evaluate(() => {
    const roleCards = Array.from(document.querySelectorAll('.canvas .card'));
    for (const card of roleCards) {
      if (card.textContent.includes('Super Admin')) {
        const del = card.querySelector('.btn.danger, button[style*="danger"]');
        return del ? 'DELETE_VISIBLE' : 'PROTECTED';
      }
    }
    return 'NOT_FOUND';
  });
  if (deleteBtn === 'DELETE_VISIBLE') {
    bug('settings', 'CRITICAL', 'Super Admin role has a visible delete button (should be protected)');
  } else {
    log(`  ✓ Super Admin delete protection: ${deleteBtn}`);
  }
}

(async () => {
  log('=== Source One Payroll Cloud — Playwright Bug Hunt ===');
  log(`Target: ${BASE}`);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push({ screen: 'unknown', msg: msg.text() });
    if (msg.type() === 'warning' && msg.text().includes('Icon')) consoleErrors.push({ screen: 'unknown', msg: '[WARN] ' + msg.text() });
  });
  page.on('pageerror', err => pageErrors.push(err.message));

  log('Loading app...');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await waitForApp(page);
  log('App loaded. Starting tests...\n');

  // ── 1. Admin screens sweep ──────────────────────────────────
  log('--- PHASE 1: Admin screens sweep ---');
  for (const screen of ADMIN_SCREENS) {
    process.stdout.write(`  Checking ${screen}... `);
    await navigateTo(page, screen);
    consoleErrors.forEach(e => { e.screen = screen; });

    await checkOverflow(page, screen);
    await checkBrokenImages(page, screen);
    await checkRupeeSymbols(page, screen);
    await checkReplacementChars(page, screen);
    await checkButtonsWork(page, screen);
    await checkZeroSizeElements(page, screen);
    process.stdout.write('done\n');
  }

  // ── 2. Employee portal screens ──────────────────────────────
  log('\n--- PHASE 2: Employee portal screens ---');
  await page.evaluate(() => window.switchPortal && window.switchPortal('employee'));
  await page.waitForTimeout(600);
  for (const screen of EMP_SCREENS) {
    process.stdout.write(`  Checking ${screen}... `);
    await navigateTo(page, screen, 'employee');
    await checkOverflow(page, `portal:${screen}`);
    await checkRupeeSymbols(page, `portal:${screen}`);
    await checkReplacementChars(page, `portal:${screen}`);
    await checkButtonsWork(page, `portal:${screen}`);
    process.stdout.write('done\n');
  }
  await page.evaluate(() => window.switchPortal && window.switchPortal('admin'));
  await page.waitForTimeout(400);

  // ── 3. Feature-specific tests ───────────────────────────────
  log('\n--- PHASE 3: Feature-specific tests ---');
  await testSidebarRoleSwitcher(page);
  await testDashboardApprovalRow(page);
  await testPayrollCards(page);
  await testAddEmployeeGuard(page);
  await testAddEmployeeForm(page);
  await testSettingsRBAC(page);
  await testEmployeePortalRupees(page);

  // ── 4. Console errors ────────────────────────────────────────
  log('\n--- PHASE 4: Console error summary ---');
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(e => bug(e.screen, 'HIGH', 'JS console error', e.msg.slice(0, 120)));
  }
  if (pageErrors.length > 0) {
    pageErrors.forEach(e => bug('app', 'CRITICAL', 'Uncaught page error', e.slice(0, 120)));
  }

  await browser.close();

  // ── Final report ─────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════');
  console.log('BUG HUNT RESULTS');
  console.log('══════════════════════════════════════════════════════');
  if (bugs.length === 0) {
    console.log('✅  No bugs found! App appears clean.');
  } else {
    const bySev = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
    bugs.forEach(b => (bySev[b.severity] || (bySev.LOW = bySev.LOW || [])).push(b));
    for (const [sev, list] of Object.entries(bySev)) {
      if (list.length === 0) continue;
      console.log(`\n${sev} (${list.length}):`);
      list.forEach(b => console.log(`  [${b.screen}] ${b.desc}${b.extra ? ' — ' + b.extra : ''}`));
    }
    console.log(`\nTotal: ${bugs.length} bugs`);
  }
  console.log('══════════════════════════════════════════════════════\n');
  process.exit(bugs.filter(b => b.severity === 'CRITICAL').length > 0 ? 1 : 0);
})();
