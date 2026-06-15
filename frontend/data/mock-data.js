// ── Shared utility functions ──────────────────────────────────
function fmtCurrency(n, compact = false) {
  if (typeof n !== 'number') return '—';
  if (compact) {
    if (n >= 1e7) return '$' + (n / 1e7).toFixed(1) + 'M';
    if (n >= 1e5) return '$' + (n / 1e3).toFixed(0) + 'K';
    return '$' + n.toLocaleString();
  }
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

// Deterministic avatar color from name
const AVATAR_COLORS = [
  '#6366F1','#8B5CF6','#EC4899','#EF4444','#F59E0B',
  '#10B981','#06B6D4','#3B82F6','#F97316','#84CC16',
];

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Departments ───────────────────────────────────────────────
const DEPARTMENTS = [
  { id: 'ENG',  name: 'Engineering',  color: '#6366F1', headcount: 82 },
  { id: 'HR',   name: 'Human Resources', color: '#22C55E', headcount: 18 },
  { id: 'FIN',  name: 'Finance',      color: '#F59E0B', headcount: 24 },
  { id: 'MKT',  name: 'Marketing',    color: '#60A5FA', headcount: 31 },
  { id: 'OPS',  name: 'Operations',   color: '#EC4899', headcount: 45 },
  { id: 'SALES',name: 'Sales',        color: '#10B981', headcount: 47 },
];

// ── Employees ─────────────────────────────────────────────────
const EMPLOYEES = [
  { id: 'E001', name: 'Arjun Sharma',      dept: 'Engineering',    role: 'Senior Engineer',  salary: 128000, status: 'active',   startDate: '2020-03-15', email: 'arjun.sharma@hrflow.io' },
  { id: 'E002', name: 'Priya Mehta',       dept: 'Marketing',      role: 'Marketing Lead',   salary: 96000,  status: 'active',   startDate: '2019-07-22', email: 'priya.mehta@hrflow.io' },
  { id: 'E003', name: 'David Chen',        dept: 'Engineering',    role: 'Frontend Dev',     salary: 112000, status: 'active',   startDate: '2021-01-10', email: 'david.chen@hrflow.io' },
  { id: 'E004', name: 'Fatima Al-Rashid',  dept: 'Finance',        role: 'Finance Analyst',  salary: 89000,  status: 'leave',    startDate: '2021-09-05', email: 'fatima.r@hrflow.io' },
  { id: 'E005', name: 'Marcus Johnson',    dept: 'Sales',          role: 'Account Executive',salary: 74000,  status: 'active',   startDate: '2022-02-14', email: 'marcus.j@hrflow.io' },
  { id: 'E006', name: 'Aiko Tanaka',       dept: 'Operations',     role: 'Ops Manager',      salary: 105000, status: 'active',   startDate: '2018-11-20', email: 'aiko.t@hrflow.io' },
  { id: 'E007', name: 'Liam O\'Brien',     dept: 'Engineering',    role: 'DevOps Engineer',  salary: 118000, status: 'active',   startDate: '2020-06-30', email: 'liam.ob@hrflow.io' },
  { id: 'E008', name: 'Sofia Rossi',       dept: 'Human Resources',role: 'HR Business Partner',salary: 82000, status: 'active', startDate: '2021-04-12', email: 'sofia.r@hrflow.io' },
  { id: 'E009', name: 'Kwame Asante',      dept: 'Sales',          role: 'Sales Manager',    salary: 98000,  status: 'active',   startDate: '2019-03-08', email: 'kwame.a@hrflow.io' },
  { id: 'E010', name: 'Emma Williams',     dept: 'Marketing',      role: 'Brand Designer',   salary: 87000,  status: 'inactive', startDate: '2022-08-01', email: 'emma.w@hrflow.io' },
  { id: 'E011', name: 'Ravi Patel',        dept: 'Engineering',    role: 'Backend Engineer', salary: 122000, status: 'active',   startDate: '2020-10-15', email: 'ravi.p@hrflow.io' },
  { id: 'E012', name: 'Chloe Martin',      dept: 'Finance',        role: 'Controller',       salary: 115000, status: 'active',   startDate: '2017-05-20', email: 'chloe.m@hrflow.io' },
  { id: 'E013', name: 'Daniel Park',       dept: 'Operations',     role: 'Supply Chain Mgr', salary: 93000,  status: 'leave',    startDate: '2021-12-01', email: 'daniel.p@hrflow.io' },
  { id: 'E014', name: 'Amara Diallo',      dept: 'Human Resources',role: 'Recruiter',        salary: 71000,  status: 'active',   startDate: '2023-01-09', email: 'amara.d@hrflow.io' },
  { id: 'E015', name: 'James Fischer',     dept: 'Engineering',    role: 'Principal Arch.',  salary: 165000, status: 'active',   startDate: '2016-09-01', email: 'james.f@hrflow.io' },
];

// Enrich employees with computed fields
EMPLOYEES.forEach(e => {
  e.initials = getInitials(e.name);
  e.color    = avatarColor(e.name);
  const gross = e.salary;
  const ded   = Math.round(gross * 0.22);
  e.gross  = gross;
  e.ded    = ded;
  e.net    = gross - ded;
  e.tax    = Math.round(ded * 0.6);
  e.benefits = ded - e.tax;
});

// ── Payroll runs ──────────────────────────────────────────────
function genPayrollRun(period, status, totalMultiplier = 1) {
  const base = EMPLOYEES.reduce((a, e) => a + e.gross, 0);
  const gross = Math.round(base * totalMultiplier);
  const ded   = Math.round(gross * 0.22);
  return {
    period,
    status,
    totalGross: gross,
    totalDed:   ded,
    totalNet:   gross - ded,
    headcount:  EMPLOYEES.length,
    processedOn: status === 'paid' ? period.slice(0, 7) + '-28' : null,
    lineItems: EMPLOYEES.map(e => ({
      empId:   e.id,
      empName: e.name,
      dept:    e.dept,
      gross:   e.gross,
      ded:     e.ded,
      net:     e.net,
      tax:     e.tax,
      benefits:e.benefits,
      status:  status === 'paid' ? 'paid' : 'pending',
    })),
  };
}

const PAYROLL_RUNS = [
  genPayrollRun('June 2025',     'current',   1.00),
  genPayrollRun('May 2025',      'paid',      0.98),
  genPayrollRun('April 2025',    'paid',      0.97),
  genPayrollRun('March 2025',    'paid',      0.99),
  genPayrollRun('February 2025', 'paid',      0.95),
  genPayrollRun('January 2025',  'paid',      0.96),
];

// ── Trend data (last 6 months) for charts ─────────────────────
const PAYROLL_TREND = PAYROLL_RUNS.slice().reverse().map((r, i) => ({
  label: r.period.split(' ')[0].slice(0, 3),
  gross: r.totalGross,
  net:   r.totalNet,
  hc:    r.headcount,
}));

// ── Department cost breakdown ─────────────────────────────────
const DEPT_COSTS = DEPARTMENTS.map(d => ({
  label: d.name,
  value: EMPLOYEES.filter(e => e.dept === d.name).reduce((a, e) => a + e.gross, 0),
  color: d.color,
})).filter(d => d.value > 0);

// ── Recent activity feed ──────────────────────────────────────
const RECENT_ACTIVITIES = [
  { id: 1, type: 'payroll',  text: 'May 2025 payroll processed — $1.54M disbursed',    time: '2 days ago', color: '#22C55E' },
  { id: 2, type: 'hire',     text: 'Amara Diallo joined as Recruiter in HR',            time: '5 days ago', color: '#6366F1' },
  { id: 3, type: 'leave',    text: 'Daniel Park approved for 14 days medical leave',    time: '1 week ago', color: '#F59E0B' },
  { id: 4, type: 'payroll',  text: 'April 2025 payroll approved by Finance',            time: '2 weeks ago',color: '#22C55E' },
  { id: 5, type: 'offboard', text: 'Emma Williams offboarded — deactivated',            time: '3 weeks ago',color: '#EF4444' },
  { id: 6, type: 'report',   text: 'Q1 2025 compliance report exported by Admin',       time: '1 month ago',color: '#60A5FA' },
];

// ── Report catalog ────────────────────────────────────────────
const REPORTS_CATALOG = [
  {
    id: 'monthly-payroll', title: 'Monthly Payroll Summary',
    icon: 'fa-money-bill-wave', description: 'Gross, net, and deductions per employee per month',
    category: 'Payroll', lastRun: 'Jun 1, 2025',
  },
  {
    id: 'dept-cost', title: 'Department Cost Analysis',
    icon: 'fa-chart-pie', description: 'Total compensation spend broken down by department',
    category: 'Finance', lastRun: 'May 31, 2025',
  },
  {
    id: 'headcount', title: 'Headcount Over Time',
    icon: 'fa-users', description: 'Employee count trend across all departments',
    category: 'HR', lastRun: 'Jun 1, 2025',
  },
  {
    id: 'compliance', title: 'Compliance Status Report',
    icon: 'fa-shield-halved', description: 'PF, ESI, and TDS filing status per period',
    category: 'Compliance', lastRun: 'May 28, 2025',
  },
  {
    id: 'leave', title: 'Leave Utilization',
    icon: 'fa-calendar-days', description: 'Leave taken vs. balance by type and department',
    category: 'HR', lastRun: 'Jun 1, 2025',
  },
  {
    id: 'expense', title: 'Expense Breakdown',
    icon: 'fa-receipt', description: 'Reimbursements and company expense categories',
    category: 'Finance', lastRun: 'May 30, 2025',
  },
];

// ── Settings ──────────────────────────────────────────────────
const SETTINGS_DATA = {
  company: {
    name:         'HRFlow Technologies Pvt. Ltd.',
    registration: 'U72200MH2015PTC268432',
    address:      '4th Floor, Cyber City Tower B, Gurugram, HR 122002',
    website:      'https://hrflow.io',
    taxId:        'AABCH2702L',
    industry:     'Technology',
    size:         '201–500',
    fiscalStart:  'April',
  },
  paySchedule: {
    cycle:      'Monthly',
    payDay:     28,
    currency:   'USD',
    cutoff:     22,
    overTimeRate: 1.5,
    probationDays: 90,
  },
  notifications: {
    payrollApproval:   true,
    payrollProcessed:  true,
    newHire:           true,
    leaveRequest:      false,
    complianceDue:     true,
    expenseSubmitted:  false,
    systemAlerts:      true,
  },
  users: [
    { id: 'U001', name: 'Priya Kapoor',  email: 'priya@hrflow.io', role: 'Super Admin',     status: 'active' },
    { id: 'U002', name: 'Rohan Verma',   email: 'rohan@hrflow.io', role: 'Payroll Admin',   status: 'active' },
    { id: 'U003', name: 'Sneha Gupta',   email: 'sneha@hrflow.io', role: 'HR Manager',      status: 'active' },
    { id: 'U004', name: 'Anjali Singh',  email: 'anjali@hrflow.io',role: 'Finance Viewer',  status: 'inactive' },
  ],
};

// ── Expose all data globally ──────────────────────────────────
Object.assign(window, {
  DEPARTMENTS, EMPLOYEES, PAYROLL_RUNS, PAYROLL_TREND, DEPT_COSTS,
  RECENT_ACTIVITIES, REPORTS_CATALOG, SETTINGS_DATA,
  fmtCurrency, fmtDate, getInitials, avatarColor,
});
