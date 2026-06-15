// ── Persistence layer ─────────────────────────────────────────────────────────
// All data stores use localStorage for cross-refresh persistence.
// window.persist(key, data)   — save + update global
// window.loadStore(key, seed) — load from localStorage or fall back to seed
// window.resetAll()           — clear all persisted data and reload (dev tool)
//
// !! IMPORTANT: This IIFE MUST remain at the very top of data.jsx.
// !! All loadStore() calls below depend on window.loadStore being defined first.
(function() {
  window.persist = function(key, data) {
    try { localStorage.setItem('so_' + key, JSON.stringify(data)); } catch(e) {}
    window[key] = data;
    return data;
  };
  window.loadStore = function(key, fallback) {
    try {
      const raw = localStorage.getItem('so_' + key);
      if (raw !== null) { const d = JSON.parse(raw); if (d !== null) return d; }
    } catch(e) {}
    return typeof fallback === 'function' ? fallback() : fallback;
  };
  window.resetAll = function() {
    Object.keys(localStorage).filter(k => k.startsWith('so_')).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };
})();

// ──────────────────────────────────────────────────────────────
// Sample data for Source One — 240 employees, headquartered Bengaluru
// All figures in INR. Names are common Indian names.
// ──────────────────────────────────────────────────────────────

const COMPANY = {
  name: "Source One",
  legal: "Source One Technologies Pvt. Ltd.",
  hq: "Bengaluru, IN",
  cin: "U72200KA2019PTC129481",
  pan: "AAFCS9421K",
  tan: "BLRS18472E",
  employees: 247,
  payCycle: "Monthly · 28th",
};

const COMPANIES = window.loadStore('COMPANIES', [
  { id: "CO-001", name: "Source One Technologies Pvt. Ltd.", short: "Source One", code: "S1", pan: "AAFCS9421K", employees: 247, active: true },
  { id: "CO-002", name: "Source One Digital Labs LLP", short: "Digital Labs", code: "SD", pan: "AAFCS1234B", employees: 23, active: true },
  { id: "CO-003", name: "Source One HR Services Ltd.", short: "HR Services", code: "SH", pan: "AAFCS5678C", employees: 47, active: false },
]);

const DEPARTMENTS = [
  { id: "ENG",  name: "Engineering",         headcount: 84, cost: 6_82_40_000, color: "#10B981" },
  { id: "PRD",  name: "Product & Design",    headcount: 22, cost: 1_84_60_000, color: "#60A5FA" },
  { id: "GTM",  name: "Sales & GTM",         headcount: 41, cost: 3_27_10_000, color: "#A78BFA" },
  { id: "MKT",  name: "Marketing",           headcount: 14, cost:   98_70_000, color: "#F59E0B" },
  { id: "OPS",  name: "Operations",          headcount: 28, cost: 1_46_20_000, color: "#F43F5E" },
  { id: "FIN",  name: "Finance & Legal",     headcount: 12, cost: 1_08_40_000, color: "#22D3EE" },
  { id: "HR",   name: "People & HR",         headcount:  9, cost:   71_20_000, color: "#FB7185" },
  { id: "CS",   name: "Customer Success",    headcount: 37, cost: 2_24_80_000, color: "#34D399" },
];

const LOCATIONS = [
  { code: "BLR", name: "Bengaluru (HQ)", count: 162 },
  { code: "MUM", name: "Mumbai",         count:  41 },
  { code: "DEL", name: "Gurgaon",        count:  28 },
  { code: "RMT", name: "Remote (India)", count:  16 },
];

const ROLES = [
  "Senior Engineer", "Engineering Manager", "Engineer II", "Engineer I",
  "Product Manager", "Senior Designer", "Designer",
  "Account Executive", "Sales Manager", "SDR",
  "Marketing Manager", "Content Lead",
  "Ops Analyst", "Finance Manager", "FP&A Analyst",
  "HRBP", "Recruiter", "Customer Success Manager",
];

const FIRST = ["Aarav","Aditi","Akshay","Ananya","Arjun","Bhavya","Chitra","Deepak","Divya","Esha","Farhan","Gauri","Harsh","Ishita","Jay","Karthik","Kavya","Krishna","Mahesh","Meera","Neha","Nikhil","Pallavi","Pooja","Pranav","Priya","Raj","Rahul","Rakesh","Ravi","Riya","Rohan","Sahil","Sanya","Shreya","Siddharth","Sneha","Suresh","Tanvi","Tara","Uday","Varun","Vidya","Vikram","Vivek","Yash","Zara"];
const LAST  = ["Sharma","Patel","Kumar","Singh","Verma","Iyer","Reddy","Menon","Nair","Joshi","Mehta","Kapoor","Bhatia","Agarwal","Desai","Khanna","Shah","Mukherjee","Banerjee","Chatterjee","Pillai","Rao","Gupta","Malhotra","Chopra","Saxena"];

// Deterministic pseudo-random for stable rendering
function mulberry32(seed) {
  return function() {
    var t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const _r = mulberry32(42);
const pick = (arr) => arr[Math.floor(_r() * arr.length)];

function genEmployees(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const dept = pick(DEPARTMENTS);
    const role = pick(ROLES);
    const loc  = pick(LOCATIONS);
    const first = pick(FIRST);
    const last  = pick(LAST);
    const base  = 35_000 + Math.floor(_r() * 240_000);
    const ctc   = Math.round(base * 13.5);
    const tenure = (_r() * 6 + 0.1).toFixed(1);
    const statusRoll = _r();
    let status = "Active";
    if (statusRoll > 0.94) status = "On Leave";
    else if (statusRoll > 0.97) status = "Notice";
    out.push({
      id: `SO-${(1042 + i).toString()}`,
      name: `${first} ${last}`,
      first, last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@sourceone.in`,
      dept: dept.id,
      deptName: dept.name,
      deptColor: dept.color,
      role,
      level: ["L2","L3","L4","L5","L6","L7"][Math.floor(_r()*6)],
      loc: loc.code,
      locName: loc.name,
      base,
      ctc,
      tenure: parseFloat(tenure),
      status,
      pan: `${["A","B","C","D"][Math.floor(_r()*4)]}${["B","K","P","R","T"][Math.floor(_r()*5)]}XPS${Math.floor(1000+_r()*9000)}${["A","B","C","D","E","F","G","H","J","K"][Math.floor(_r()*10)]}`,
      bank: pick(["HDFC ••3421","ICICI ••8814","Kotak ••2207","Axis ••6628","SBI ••4901"]),
      doj: `${2018 + Math.floor(_r()*7)}-${String(1+Math.floor(_r()*12)).padStart(2,"0")}-${String(1+Math.floor(_r()*28)).padStart(2,"0")}`,
      manager: i > 0 ? `SO-${(1042 + Math.floor(_r() * Math.min(i, 30))).toString()}` : null,
    });
  }
  return out;
}

const EMPLOYEES = genEmployees(60); // Render 60 for the table; "247 total" displayed
// Merge any super-admin-created employees from localStorage
const _customEmpsCount = (function() {
  var custom = window.loadStore('custom_employees', []);
  for (var i = 0; i < custom.length; i++) EMPLOYEES.push(custom[i]);
  return custom.length;
})();
const EMPLOYEES_TOTAL = 247 + _customEmpsCount;

// ── Payroll runs ──────────────────────────────────────────────
const PAYROLL_RUNS = window.loadStore('PAYROLL_RUNS', [
  { period: "Nov 2025",  status: "In Review",  total: 4_82_30_000, processed: 247, anomalies: 3, due: "2025-11-28" },
  { period: "Oct 2025",  status: "Paid",       total: 4_78_60_000, processed: 244, anomalies: 0, due: "2025-10-28" },
  { period: "Sep 2025",  status: "Paid",       total: 4_71_20_000, processed: 241, anomalies: 1, due: "2025-09-28" },
  { period: "Aug 2025",  status: "Paid",       total: 4_64_90_000, processed: 238, anomalies: 2, due: "2025-08-28" },
  { period: "Jul 2025",  status: "Paid",       total: 4_58_10_000, processed: 232, anomalies: 0, due: "2025-07-28" },
  { period: "Jun 2025",  status: "Paid",       total: 4_51_70_000, processed: 229, anomalies: 1, due: "2025-06-28" },
  { period: "May 2025",  status: "Paid",       total: 4_42_30_000, processed: 224, anomalies: 0, due: "2025-05-28" },
  { period: "Apr 2025",  status: "Paid",       total: 4_38_50_000, processed: 220, anomalies: 2, due: "2025-04-28" },
]);

const APPROVAL_STEPS = window.loadStore('APPROVAL_STEPS', [
  { id: 1, name: "Payroll Prepared",    by: "Meera Iyer",   role: "Payroll Analyst",   at: "Nov 22, 14:02", status: "done" },
  { id: 2, name: "Finance Review",      by: "Vikram Singh", role: "Finance Manager",   at: "Nov 24, 11:18", status: "done" },
  { id: 3, name: "Anomaly Check (AI)",  by: "Atlas",        role: "AI Reviewer",       at: "Nov 24, 11:21", status: "done", note: "3 flagged" },
  { id: 4, name: "HR Verification",     by: "Priya Kapoor", role: "Head of People",    at: "Nov 25, 09:40", status: "active" },
  { id: 5, name: "CFO Sign-off",        by: "Ravi Menon",   role: "CFO",               at: "—",            status: "pending" },
  { id: 6, name: "Bank Disbursement",   by: "HDFC PayConnect", role: "Auto",           at: "Scheduled Nov 28, 06:00", status: "pending" },
]);

const PAYROLL_BREAKDOWN = [
  { label: "Gross Salary",     amount: 5_24_70_000, type: "earn" },
  { label: "Bonus & Incentives", amount:   28_40_000, type: "earn" },
  { label: "Reimbursements",   amount:    9_80_000, type: "earn" },
  { label: "PF (Employer)",    amount:   18_60_000, type: "stat" },
  { label: "ESI (Employer)",   amount:    4_20_000, type: "stat" },
  { label: "PF (Employee)",    amount:  -18_60_000, type: "ded" },
  { label: "TDS",              amount:  -64_30_000, type: "ded" },
  { label: "Professional Tax", amount:    -4_94_000, type: "ded" },
  { label: "Loan Recovery",    amount:    -2_60_000, type: "ded" },
];

// ── AI Anomalies ──────────────────────────────────────────────
const ANOMALIES = window.loadStore('ANOMALIES', [
  {
    id: "AN-2811", severity: "high", confidence: 0.94,
    title: "Overtime spike — 3.4× baseline",
    employee: "Akshay Sharma",  empId: "SO-1187",
    detail: "Logged 92 OT hours in Nov vs 27hr median over 6 months. Manager approval present but skip-level missing for 4 entries.",
    suggestion: "Hold OT line ₹38,400 pending skip-level sign-off.",
    delta: "+₹38,400", category: "Overtime",
  },
  {
    id: "AN-2812", severity: "high", confidence: 0.89,
    title: "Possible duplicate reimbursement",
    employee: "Pooja Mehta",    empId: "SO-1064",
    detail: "Two reimbursements of ₹14,200 within 4 days, both for 'Client travel — Mumbai'. Receipt hashes differ but vendor & amount identical.",
    suggestion: "Flag ₹14,200 for manual review.",
    delta: "+₹14,200", category: "Reimbursement",
  },
  {
    id: "AN-2813", severity: "medium", confidence: 0.76,
    title: "CTC vs. take-home variance",
    employee: "Karthik Reddy",  empId: "SO-1213",
    detail: "Variable component recalculated mid-cycle. Net pay would change by 14.2% vs Oct without a documented appraisal event.",
    suggestion: "Confirm appraisal letter in HRMS.",
    delta: "+₹52,800", category: "Variable",
  },
  {
    id: "AN-2814", severity: "low", confidence: 0.61,
    title: "Inconsistent bank account",
    employee: "Sahil Khanna",   empId: "SO-1098",
    detail: "Bank account last updated 2 days before payroll cut-off. New IFSC matches a different beneficiary on file.",
    suggestion: "Trigger ₹1 penny-test before disbursement.",
    delta: "—", category: "Bank",
  },
]);

// ── Anomaly history (last 6 months) ──
const ANOMALY_HISTORY = window.loadStore('ANOMALY_HISTORY', [
  { m: "Jun", high: 0, med: 1, low: 2 },
  { m: "Jul", high: 0, med: 0, low: 1 },
  { m: "Aug", high: 1, med: 1, low: 0 },
  { m: "Sep", high: 0, med: 1, low: 0 },
  { m: "Oct", high: 0, med: 0, low: 1 },
  { m: "Nov", high: 2, med: 1, low: 1 },
]);

// ── Trends ────────────────────────────────────────────────────
const COST_TREND = [
  { m: "May", v: 4.42 }, { m: "Jun", v: 4.51 }, { m: "Jul", v: 4.58 },
  { m: "Aug", v: 4.64 }, { m: "Sep", v: 4.71 }, { m: "Oct", v: 4.78 }, { m: "Nov", v: 4.82 },
];
const HEADCOUNT_TREND = [
  { m: "May", v: 224 }, { m: "Jun", v: 229 }, { m: "Jul", v: 232 },
  { m: "Aug", v: 238 }, { m: "Sep", v: 241 }, { m: "Oct", v: 244 }, { m: "Nov", v: 247 },
];

// ── Compliance/audit ──
const AUDIT_LOG = window.loadStore('AUDIT_LOG', [
  { id: "EVT-9914", at: "Nov 25 09:42", actor: "Priya Kapoor", action: "Approved", target: "Payroll Run · Nov 2025", ip: "10.41.20.18", risk: "low" },
  { id: "EVT-9913", at: "Nov 25 09:40", actor: "Priya Kapoor", action: "Viewed",   target: "Payroll Run · Nov 2025", ip: "10.41.20.18", risk: "low" },
  { id: "EVT-9912", at: "Nov 24 16:11", actor: "Atlas (AI)",  action: "Flagged",  target: "AN-2812 · Duplicate reimbursement", ip: "—", risk: "med" },
  { id: "EVT-9911", at: "Nov 24 11:21", actor: "Atlas (AI)",  action: "Scanned",  target: "247 payslips · 3 anomalies", ip: "—", risk: "low" },
  { id: "EVT-9910", at: "Nov 24 11:18", actor: "Vikram Singh", action: "Approved", target: "Finance review · Nov", ip: "10.41.20.04", risk: "low" },
  { id: "EVT-9909", at: "Nov 24 10:52", actor: "Meera Iyer",  action: "Recalculated", target: "SO-1213 variable pay", ip: "10.41.20.66", risk: "med" },
  { id: "EVT-9908", at: "Nov 24 10:18", actor: "Meera Iyer",  action: "Uploaded", target: "attendance_nov.csv · 247 rows", ip: "10.41.20.66", risk: "low" },
  { id: "EVT-9907", at: "Nov 23 17:30", actor: "System",      action: "Sync",     target: "HRMS ↔ Payroll · 247 employees", ip: "—", risk: "low" },
  { id: "EVT-9906", at: "Nov 23 14:02", actor: "Meera Iyer",  action: "Created",  target: "Payroll Run · Nov 2025", ip: "10.41.20.66", risk: "low" },
  { id: "EVT-9905", at: "Nov 22 18:41", actor: "Rohan Verma", action: "Login",    target: "2FA · TOTP",   ip: "203.0.113.7",  risk: "low" },
  { id: "EVT-9904", at: "Nov 22 11:08", actor: "External",    action: "Blocked",  target: "Failed 2FA · SO-1064", ip: "185.220.101.7", risk: "high" },
  { id: "EVT-9903", at: "Nov 21 22:14", actor: "System",      action: "Backup",   target: "Encrypted snapshot · 4.2GB", ip: "—", risk: "low" },
]);

// ── Reports ──
const REPORTS = [
  { id: "R-01", name: "Monthly Payroll Register",     period: "Nov 2025", size: "4.8 MB", type: "PDF",  cat: "Payroll",    icon: "doc" },
  { id: "R-02", name: "Form 16 — Annual Tax",         period: "FY 24–25", size: "118 MB", type: "ZIP",  cat: "Tax",        icon: "zip" },
  { id: "R-03", name: "PF/ESI Challan",               period: "Nov 2025", size: "412 KB", type: "PDF",  cat: "Statutory",  icon: "doc" },
  { id: "R-04", name: "TDS Quarterly (24Q)",          period: "Q3 FY26",  size: "2.1 MB", type: "XLSX", cat: "Tax",        icon: "xls" },
  { id: "R-05", name: "Department Cost Allocation",   period: "Nov 2025", size: "1.4 MB", type: "XLSX", cat: "Finance",    icon: "xls" },
  { id: "R-06", name: "Salary Distribution Histogram",period: "Nov 2025", size: "612 KB", type: "PDF",  cat: "Analytics",  icon: "doc" },
  { id: "R-07", name: "Headcount & Attrition",        period: "YTD 2025", size: "880 KB", type: "PDF",  cat: "Analytics",  icon: "doc" },
  { id: "R-08", name: "Bank Disbursement Advice",     period: "Nov 2025", size: "94 KB",  type: "CSV",  cat: "Payroll",    icon: "csv" },
  { id: "R-09", name: "Variable Pay Audit",           period: "Q3 FY26",  size: "1.1 MB", type: "PDF",  cat: "Audit",      icon: "doc" },
  { id: "R-10", name: "Leave Liability Provision",    period: "Nov 2025", size: "318 KB", type: "XLSX", cat: "Finance",    icon: "xls" },
];

// ── RBAC roles ──
const ROLES_DATA = window.loadStore('ROLES_DATA', [
  { id: "admin",   name: "Super Admin",     members: 2,  perms: { view: "all", edit: "all", approve: true,  export: true,  audit: true  } },
  { id: "payroll", name: "Payroll Manager", members: 4,  perms: { view: "all", edit: "payroll", approve: false, export: true,  audit: true  } },
  { id: "finance", name: "Finance",         members: 6,  perms: { view: "payroll+reports", edit: "limited", approve: true,  export: true,  audit: true  } },
  { id: "hr",      name: "HR Business Partner", members: 9, perms: { view: "people", edit: "people", approve: false, export: false, audit: false } },
  { id: "manager", name: "People Manager",  members: 34, perms: { view: "team", edit: "team-limited", approve: false, export: false, audit: false } },
  { id: "employee",name: "Employee",        members: 247,perms: { view: "self",  edit: "self", approve: false, export: false, audit: false } },
]);

const PERMISSIONS = [
  { id: "view_payslips_all",  label: "View all payslips" },
  { id: "edit_compensation",  label: "Edit compensation" },
  { id: "run_payroll",        label: "Run payroll cycle" },
  { id: "approve_payroll",    label: "Approve payroll run" },
  { id: "export_pii",         label: "Export PII data" },
  { id: "edit_bank",          label: "Edit bank details" },
  { id: "view_audit",         label: "View audit log" },
  { id: "manage_roles",       label: "Manage roles & access" },
];

// ── Attendance ──
const SHIFT_TODAY = { onShift: 218, onLeave: 19, holiday: 0, absent: 10, total: 247 };
const LEAVE_TYPES = [
  { id: "PL", label: "Privileged Leave",  total: 24, used: 11.5, color: "#10B981" },
  { id: "CL", label: "Casual Leave",      total: 12, used: 6,    color: "#60A5FA" },
  { id: "SL", label: "Sick Leave",        total: 12, used: 3,    color: "#F59E0B" },
  { id: "WFH",label: "Work From Home",    total: 60, used: 28,   color: "#A78BFA" },
];
const LEAVE_REQUESTS = window.loadStore('LEAVE_REQUESTS', [
  { id: "LR-2284", emp: "Aarav Sharma",  empId: "SO-1184", type: "PL", days: 5, from: "Dec 22", to: "Dec 26", status: "Pending", reason: "Family wedding" },
  { id: "LR-2283", emp: "Bhavya Patel",  empId: "SO-1129", type: "SL", days: 2, from: "Nov 25", to: "Nov 26", status: "Pending", reason: "Fever" },
  { id: "LR-2282", emp: "Chitra Iyer",   empId: "SO-1167", type: "WFH",days: 3, from: "Nov 27", to: "Nov 29", status: "Pending", reason: "Personal" },
  { id: "LR-2281", emp: "Deepak Verma",  empId: "SO-1042", type: "CL", days: 1, from: "Nov 28", to: "Nov 28", status: "Approved", reason: "Personal errand" },
  { id: "LR-2280", emp: "Esha Nair",     empId: "SO-1208", type: "PL", days: 7, from: "Dec 15", to: "Dec 21", status: "Approved", reason: "Vacation" },
  { id: "LR-2279", emp: "Farhan Khanna", empId: "SO-1051", type: "SL", days: 1, from: "Nov 24", to: "Nov 24", status: "Approved", reason: "Doctor visit" },
]);

// ── Notifications ──
const NOTIFICATIONS = window.loadStore('NOTIFICATIONS', [
  { id: 1,  type: "alert", text: "3 anomalies require review before Nov payroll run",               at: "2m ago" },
  { id: 2,  type: "info",  text: "PF challan due in 3 days — ₹64.3L deposit pending",               at: "18m ago" },
  { id: 3,  type: "alert", text: "Akshay Sharma's OT spike flagged for skip-level sign-off",        at: "1h ago" },
  { id: 4,  type: "info",  text: "ESI return filing deadline: Nov 30 via ESIC portal",               at: "2h ago" },
  { id: 5,  type: "ok",    text: "October payroll fully reconciled with HDFC",                       at: "yesterday" },
  { id: 6,  type: "ok",    text: "INFY timesheet uploaded — 15 employees synced for Nov",            at: "yesterday" },
  { id: 7,  type: "info",  text: "New reimbursement request from Deepak Verma (₹4,200)",             at: "2 days ago" },
  { id: 8,  type: "ok",    text: "TCS Digital Nov payroll generated successfully",                   at: "3 days ago" },
]);

// Format currency to Indian format
function fmtINR(amount, opts = {}) {
  const { compact = false, sign = false } = opts;
  if (compact) {
    if (Math.abs(amount) >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(2)} Cr`;
    if (Math.abs(amount) >= 1_00_000)    return `₹${(amount / 1_00_000).toFixed(2)} L`;
    if (Math.abs(amount) >= 1_000)       return `₹${(amount / 1_000).toFixed(1)}K`;
    return `₹${amount}`;
  }
  const s = Math.abs(amount).toLocaleString("en-IN");
  const prefix = amount < 0 ? "−" : sign ? "+" : "";
  return `${prefix}₹${s}`;
}

function initials(name) {
  return name.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();
}
function deptColorFor(deptId) {
  return DEPARTMENTS.find(d => d.id === deptId)?.color || "#94A3B8";
}
function avatarHueFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 360;
}

// ── Clients ──────────────────────────────────────────────────
const CLIENTS = [
  { id: "CLT-001", name: "Infosys BPO Ltd.",       code: "INFY",  industry: "IT Services",    location: "Bengaluru", contact: "Ankit Mehta",    email: "ankit.mehta@infosys.com",      status: "Active",   since: "Jan 2022" },
  { id: "CLT-002", name: "TCS Digital",            code: "TCS",   industry: "IT Services",    location: "Mumbai",    contact: "Sunita Rao",     email: "sunita.rao@tcs.com",           status: "Active",   since: "Mar 2021" },
  { id: "CLT-003", name: "Wipro Enterprises",      code: "WIPRO", industry: "IT Consulting",  location: "Hyderabad", contact: "Rajan Nair",     email: "rajan.nair@wipro.com",         status: "Active",   since: "Jun 2022" },
  { id: "CLT-004", name: "HCL Technologies",       code: "HCL",   industry: "Technology",     location: "Gurgaon",   contact: "Preethi Sharma", email: "preethi.s@hcltech.com",        status: "Active",   since: "Sep 2020" },
  { id: "CLT-005", name: "Cognizant India",        code: "COGI",  industry: "IT Services",    location: "Chennai",   contact: "Arun Kumar",     email: "arun.k@cognizant.com",         status: "Inactive", since: "Feb 2023" },
];

// Deterministic client assignment from employee index
function clientForEmployee(idx) {
  const activeClients = CLIENTS.filter(c => c.status === "Active");
  return activeClients[idx % activeClients.length];
}

// Enrich each employee with clientId + clientName
EMPLOYEES.forEach((e, i) => {
  const c = clientForEmployee(i);
  e.clientId   = c.id;
  e.clientName = c.name;
  e.clientCode = c.code;
});

// Per-client employee counts derived from EMPLOYEES array
CLIENTS.forEach(c => {
  c.empCount = EMPLOYEES.filter(e => e.clientId === c.id).length;
});

// ── Timesheet data (for upload UI) ───────────────────────────
const TIMESHEET_MONTHS = [
  "Jan 2025","Feb 2025","Mar 2025","Apr 2025","May 2025",
  "Jun 2025","Jul 2025","Aug 2025","Sep 2025","Oct 2025","Nov 2025",
];

// Sample timesheet rows shown after "upload" for a client
function genTimesheetRows(clientId) {
  const emps = EMPLOYEES.filter(e => e.clientId === clientId).slice(0, 8);
  return emps.map(e => ({
    empId: e.id, name: e.name, dept: e.deptName,
    workingDays: 22,
    present: 18 + Math.floor(avatarHueFor(e.name) % 5),
    leaveDays: 1 + Math.floor(avatarHueFor(e.name) % 3),
    overtime: Math.floor(avatarHueFor(e.name) % 12),
  }));
}

// ── Reimbursement store (shared mutable, simulates a live DB) ──
const REIMBURSEMENT_STORE = window.loadStore('REIMBURSEMENT_STORE', [
  {
    id: "RMB-001", empId: "SO-1042", empName: "Deepak Verma",
    clientName: "Infosys BPO Ltd.", clientCode: "INFY",
    category: "Travel", description: "Client visit to Mumbai office — cab and train fare",
    amount: 4200, date: "2025-11-15", submittedAt: "Nov 15, 2025",
    proof: "travel_receipt_nov15.pdf", proofType: "pdf", proofSize: "284 KB",
    status: "Pending", month: "Nov 2025", notes: "",
  },
  {
    id: "RMB-002", empId: "SO-1042", empName: "Deepak Verma",
    clientName: "Infosys BPO Ltd.", clientCode: "INFY",
    category: "Meals", description: "Team lunch with client stakeholders at Taj BLR",
    amount: 2800, date: "2025-11-10", submittedAt: "Nov 10, 2025",
    proof: "lunch_receipt_nov10.jpg", proofType: "jpg", proofSize: "1.2 MB",
    status: "Approved", month: "Nov 2025", notes: "Approved — within ₹3,000 team-lunch limit.",
  },
  {
    id: "RMB-003", empId: "SO-1042", empName: "Deepak Verma",
    clientName: "Infosys BPO Ltd.", clientCode: "INFY",
    category: "Travel", description: "Bengaluru to Delhi flight for Q3 review",
    amount: 15600, date: "2025-10-22", submittedAt: "Oct 22, 2025",
    proof: "flight_BLR_DEL.pdf", proofType: "pdf", proofSize: "512 KB",
    status: "Approved", month: "Oct 2025", notes: "Economy class. Policy compliant.",
  },
  {
    id: "RMB-004", empId: "SO-1042", empName: "Deepak Verma",
    clientName: "Infosys BPO Ltd.", clientCode: "INFY",
    category: "Office Supplies", description: "External keyboard for WFH setup",
    amount: 3500, date: "2025-10-10", submittedAt: "Oct 10, 2025",
    proof: "amazon_invoice.pdf", proofType: "pdf", proofSize: "164 KB",
    status: "Rejected", month: "Oct 2025", notes: "Policy: WFH setup already claimed Jan 2025. Not eligible.",
  },
  {
    id: "RMB-005", empId: "SO-1184", empName: "Aarav Sharma",
    clientName: "TCS Digital", clientCode: "TCS",
    category: "Travel", description: "Sales QBR trip to Mumbai — flight + hotel",
    amount: 38600, date: "2025-11-21", submittedAt: "Nov 21, 2025",
    proof: "indigo_91442.pdf", proofType: "pdf", proofSize: "218 KB",
    status: "Pending", month: "Nov 2025", notes: "",
  },
  {
    id: "RMB-006", empId: "SO-1129", empName: "Bhavya Patel",
    clientName: "Wipro Enterprises", clientCode: "WIPRO",
    category: "Meals", description: "Client dinner — Wipro leadership visit, 8 people",
    amount: 8400, date: "2025-11-19", submittedAt: "Nov 19, 2025",
    proof: "restaurant_bill.jpg", proofType: "jpg", proofSize: "842 KB",
    status: "Pending", month: "Nov 2025", notes: "",
  },
  {
    id: "RMB-007", empId: "SO-1064", empName: "Pooja Mehta",
    clientName: "HCL Technologies", clientCode: "HCL",
    category: "Travel", description: "Mumbai client visit — BlueSmart cab",
    amount: 14200, date: "2025-11-20", submittedAt: "Nov 20, 2025",
    proof: "blueSmart_3284.jpg", proofType: "jpg", proofSize: "1.4 MB",
    status: "Flagged", month: "Nov 2025", notes: "AI flagged: amount matches a prior duplicate claim. Verify before approving.",
  },
  {
    id: "RMB-008", empId: "SO-1167", empName: "Chitra Iyer",
    clientName: "TCS Digital", clientCode: "TCS",
    category: "Subscription", description: "Figma seat renewal — design team annual plan",
    amount: 24500, date: "2025-11-16", submittedAt: "Nov 16, 2025",
    proof: "figma_inv.pdf", proofType: "pdf", proofSize: "96 KB",
    status: "Approved", month: "Nov 2025", notes: "Pre-approved by design lead. Policy compliant.",
  },
  {
    id: "RMB-009", empId: "SO-1213", empName: "Karthik Reddy",
    clientName: "Infosys BPO Ltd.", clientCode: "INFY",
    category: "Accommodation", description: "Hotel stay Marriott BLR — customer summit 2 nights",
    amount: 16000, date: "2025-11-18", submittedAt: "Nov 18, 2025",
    proof: "marriott_44213.pdf", proofType: "pdf", proofSize: "384 KB",
    status: "Pending", month: "Nov 2025", notes: "",
  },
  {
    id: "RMB-010", empId: "SO-1098", empName: "Sahil Khanna",
    clientName: "HCL Technologies", clientCode: "HCL",
    category: "Internet & Phone", description: "Broadband bill reimbursement — Nov 2025",
    amount: 1200, date: "2025-11-05", submittedAt: "Nov 05, 2025",
    proof: "airtel_bill_nov.pdf", proofType: "pdf", proofSize: "48 KB",
    status: "Approved", month: "Nov 2025", notes: "Standard WFH internet policy.",
  },
]);

// WFH Requests — written by WFHBooking (employee portal), read by Attendance (admin)
const WFH_REQUESTS = window.loadStore('WFH_REQUESTS', [
  { id: "WFH-001", empId: "SO-1042", empName: "Deepak Verma", dates: ["Tue Nov 26", "Wed Nov 27"], status: "approved", submittedAt: "Nov 25, 09:00", approvedBy: "Neha K.", reason: "Focus work" },
  { id: "WFH-002", empId: "SO-1018", empName: "Priya Menon", dates: ["Mon Nov 25"], status: "pending", submittedAt: "Nov 24, 17:30", approvedBy: null, reason: "Child care" },
  { id: "WFH-003", empId: "SO-1031", empName: "Arjun Sharma", dates: ["Thu Nov 28", "Fri Nov 29"], status: "rejected", submittedAt: "Nov 23, 11:00", approvedBy: "Neha K.", reason: "Remote collaboration" },
]);

// IT Declarations — written by ITDeclaration (employee portal), read by Payroll (admin) for TDS
const IT_DECLARATIONS = window.loadStore('IT_DECLARATIONS', [
  { id: "ITD-001", empId: "SO-1042", empName: "Deepak Verma", fy: "2025-26", submittedAt: "Nov 20, 2025", status: "approved", total80C: 120000, totalHRA: 60000, total80D: 25000, otherDed: 12000, revisedTDS: 4200, baseTDS: 8400, saving: 4200 },
]);

// Bank Change Requests — written by EmployeeProfile, displayed in Employees admin (HR tab)
const BANK_CHANGE_REQUESTS = window.loadStore('BANK_CHANGE_REQUESTS', [
  { id: "BCR-001", empId: "SO-1042", empName: "Deepak Verma", field: "Account Number", oldValue: "XXXXXXXX4821", newValue: "XXXXXXXX9032", submittedAt: "Nov 20, 2025", status: "pending", approvedBy: null },
]);

Object.assign(window, {
  COMPANY, COMPANIES, DEPARTMENTS, LOCATIONS, EMPLOYEES, EMPLOYEES_TOTAL,
  PAYROLL_RUNS, APPROVAL_STEPS, PAYROLL_BREAKDOWN,
  ANOMALIES, ANOMALY_HISTORY,
  COST_TREND, HEADCOUNT_TREND,
  AUDIT_LOG, REPORTS, ROLES_DATA, PERMISSIONS,
  SHIFT_TODAY, LEAVE_TYPES, LEAVE_REQUESTS, NOTIFICATIONS,
  CLIENTS, clientForEmployee, genTimesheetRows, TIMESHEET_MONTHS,
  REIMBURSEMENT_STORE,
  WFH_REQUESTS, IT_DECLARATIONS, BANK_CHANGE_REQUESTS,
  fmtINR, initials, deptColorFor, avatarHueFor,
});
// Expose persist helpers so all screens can call window.persist()
