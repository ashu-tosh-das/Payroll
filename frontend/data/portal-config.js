// ── Portal configuration — role → nav + edit permissions ───────

const PORTAL_NAV = {
  super_admin:    ['dashboard', 'employees', 'payroll', 'reports', 'settings'],
  payroll_admin:  ['dashboard', 'employees', 'payroll', 'reports'],
  hr_manager:     ['dashboard', 'employees', 'reports'],
  finance_viewer: ['dashboard', 'payroll',   'reports'],
  read_only:      ['dashboard', 'reports'],
};

// Pages where the role can perform write/create/delete actions
const PORTAL_CAN_EDIT = {
  super_admin:    { dashboard: true,  employees: true,  payroll: true,  reports: true,  settings: true  },
  payroll_admin:  { dashboard: true,  employees: false, payroll: true,  reports: true                   },
  hr_manager:     { dashboard: true,  employees: true,  reports: false                                  },
  finance_viewer: { dashboard: true,  payroll: false,   reports: false                                  },
  read_only:      { dashboard: false, reports: false                                                    },
};

function getPortalNav(role) {
  return PORTAL_NAV[role] || ['dashboard'];
}

function canEditPage(role, page) {
  const perms = PORTAL_CAN_EDIT[role];
  if (!perms) return false;
  return perms[page] !== false;
}
