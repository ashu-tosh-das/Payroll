// ── Auth data — managed exclusively by Super Admin ─────────────
// All user accounts are pre-seeded; end users cannot self-register.

const DEMO_USERS = [
  { id: 1, email: 'admin@sourceone.in',    password: 'Admin@123',    name: 'Priya Kapoor',  role: 'super_admin',    initials: 'PK' },
  { id: 2, email: 'payroll@sourceone.in',  password: 'Payroll@123',  name: 'Rahul Mehta',   role: 'payroll_admin',  initials: 'RM' },
  { id: 3, email: 'hr@sourceone.in',       password: 'Hr@1234',      name: 'Sneha Sharma',  role: 'hr_manager',     initials: 'SS' },
  { id: 4, email: 'finance@sourceone.in',  password: 'Finance@123',  name: 'Arjun Verma',   role: 'finance_viewer', initials: 'AV' },
  { id: 5, email: 'readonly@sourceone.in', password: 'Read@1234',    name: 'Kavya Reddy',   role: 'read_only',      initials: 'KR' },
];

const ROLE_META = {
  super_admin:    { label: 'Super Admin',    color: '#6366F1', badge: '●' },
  payroll_admin:  { label: 'Payroll Admin',  color: '#10B981', badge: '●' },
  hr_manager:     { label: 'HR Manager',     color: '#F59E0B', badge: '●' },
  finance_viewer: { label: 'Finance Viewer', color: '#3B82F6', badge: '●' },
  read_only:      { label: 'Read Only',      color: '#8B949E', badge: '●' },
};

function authLogin(email, password) {
  const user = DEMO_USERS.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return null;
  // Never store the raw password in session
  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

function authGetSession() {
  try {
    const raw = localStorage.getItem('hrflow_session');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function authSaveSession(user) {
  localStorage.setItem('hrflow_session', JSON.stringify(user));
}

function authClearSession() {
  localStorage.removeItem('hrflow_session');
}
