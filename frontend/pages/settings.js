// ── Settings page ─────────────────────────────────────────────
const { useState } = React;

const TABS = [
  { id: 'company',       label: 'Company Profile',    icon: 'building' },
  { id: 'pay-schedule',  label: 'Pay Schedule',        icon: 'calendar' },
  { id: 'users',         label: 'Roles & Users',       icon: 'users' },
  { id: 'notifications', label: 'Notifications',       icon: 'bell' },
];

// ── Company Profile tab ───────────────────────────────────────
const CompanyTab = () => {
  const [form, setForm]   = useState({ ...SETTINGS_DATA.company });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  const handleSave = () => {
    setSaved(true);
    window.showToast('Company profile saved', 'success');
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-col gap-4">
      <div className="card-section-label" style={{ marginBottom: 0 }}>Basic Information</div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Company Name</label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Website</label>
          <input className="form-input" value={form.website} onChange={e => set('website', e.target.value)}/>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Registration Number</label>
          <input className="form-input" value={form.registration} onChange={e => set('registration', e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Tax ID</label>
          <input className="form-input" value={form.taxId} onChange={e => set('taxId', e.target.value)}/>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Registered Address</label>
        <input className="form-input" value={form.address} onChange={e => set('address', e.target.value)}/>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Industry</label>
          <select className="form-select" value={form.industry} onChange={e => set('industry', e.target.value)}>
            {['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education'].map(i =>
              <option key={i} value={i}>{i}</option>
            )}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Company Size</label>
          <select className="form-select" value={form.size} onChange={e => set('size', e.target.value)}>
            {['1–10', '11–50', '51–200', '201–500', '501–1000', '1000+'].map(s =>
              <option key={s} value={s}>{s}</option>
            )}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Fiscal Year Start</label>
        <select className="form-select" style={{ maxWidth: 200 }} value={form.fiscalStart} onChange={e => set('fiscalStart', e.target.value)}>
          {['January', 'April', 'July', 'October'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <span className="form-hint">Affects annual reports and compliance calendar</span>
      </div>

      <div className="flex justify-end mt-2">
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? <Icon name="check" size={11}/> : <Icon name="floppy-disk" size={11}/>}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

// ── Pay Schedule tab ──────────────────────────────────────────
const PayScheduleTab = () => {
  const [form, setForm]   = useState({ ...SETTINGS_DATA.paySchedule });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  const handleSave = () => {
    setSaved(true);
    window.showToast('Pay schedule updated', 'success');
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-col gap-4">
      <div className="card-section-label" style={{ marginBottom: 0 }}>Payroll Configuration</div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Pay Cycle</label>
          <select className="form-select" value={form.cycle} onChange={e => set('cycle', e.target.value)}>
            <option value="Monthly">Monthly</option>
            <option value="Bi-Weekly">Bi-Weekly</option>
            <option value="Weekly">Weekly</option>
            <option value="Semi-Monthly">Semi-Monthly</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Pay Day (of month)</label>
          <input className="form-input" type="number" min="1" max="31"
            value={form.payDay} onChange={e => set('payDay', Number(e.target.value))}/>
          <span className="form-hint">Employees receive salary on this date each cycle</span>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Payroll Cutoff (day)</label>
          <input className="form-input" type="number" min="1" max="31"
            value={form.cutoff} onChange={e => set('cutoff', Number(e.target.value))}/>
          <span className="form-hint">No attendance changes accepted after this date</span>
        </div>
        <div className="form-group">
          <label className="form-label">Currency</label>
          <select className="form-select" value={form.currency} onChange={e => set('currency', e.target.value)}>
            {['USD', 'INR', 'EUR', 'GBP', 'SGD', 'AED'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Overtime Rate (×)</label>
          <input className="form-input" type="number" min="1" max="3" step="0.25"
            value={form.overTimeRate} onChange={e => set('overTimeRate', Number(e.target.value))}/>
        </div>
        <div className="form-group">
          <label className="form-label">Probation Period (days)</label>
          <input className="form-input" type="number" min="0" max="365"
            value={form.probationDays} onChange={e => set('probationDays', Number(e.target.value))}/>
        </div>
      </div>

      {/* Summary preview */}
      <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
        <div className="card-section-label mb-2">Preview</div>
        <div style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7 }}>
          Employees are paid <strong style={{ color: 'var(--text)' }}>{form.cycle}</strong> on day&nbsp;
          <strong style={{ color: 'var(--accent-light)' }}>{form.payDay}</strong>. Attendance cut-off is day&nbsp;
          <strong style={{ color: 'var(--accent-light)' }}>{form.cutoff}</strong>. Currency:&nbsp;
          <strong style={{ color: 'var(--text)' }}>{form.currency}</strong>.
          Probation: <strong style={{ color: 'var(--text)' }}>{form.probationDays} days</strong>.
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? <Icon name="check" size={11}/> : <Icon name="floppy-disk" size={11}/>}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

// ── Users & Roles tab ─────────────────────────────────────────
const UsersTab = () => {
  const [users, setUsers] = useState(SETTINGS_DATA.users.map(u => ({ ...u })));
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'HR Manager' });

  const ROLES = ['Super Admin', 'Payroll Admin', 'HR Manager', 'Finance Viewer', 'Read Only'];

  const handleInvite = () => {
    if (!inviteForm.name || !inviteForm.email) {
      window.showToast('Name and email are required', 'error');
      return;
    }
    const newUser = {
      id: 'U' + String(users.length + 10).padStart(3, '0'),
      ...inviteForm, status: 'active',
    };
    setUsers(u => [...u, newUser]);
    window.showToast(`Invite sent to ${inviteForm.email}`, 'success', inviteForm.role);
    setInviteForm({ name: '', email: '', role: 'HR Manager' });
    setShowInvite(false);
  };

  const toggleStatus = (uid) => {
    setUsers(u => u.map(x => x.id === uid
      ? { ...x, status: x.status === 'active' ? 'inactive' : 'active' }
      : x));
  };

  return (
    <div className="flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="card-section-label" style={{ marginBottom: 0 }}>Team Members</div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowInvite(true)}>
          <Icon name="user-plus" size={11}/>Invite User
        </button>
      </div>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Access</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <Avatar name={u.name} size="sm" status={u.status}/>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12.5 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <select className="form-select" style={{ width: 160, padding: '4px 8px', fontSize: 12 }}
                    value={u.role}
                    onChange={e => setUsers(us => us.map(x => x.id === u.id ? { ...x, role: e.target.value } : x))}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td><StatusChip status={u.status}/></td>
                <td>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {u.role === 'Super Admin' ? 'Full access' :
                     u.role === 'Payroll Admin' ? 'Payroll + Reports' :
                     u.role === 'HR Manager' ? 'Employees + Leave' :
                     'View only'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button className="icon-btn" style={{ width: 26, height: 26 }} title="Toggle status"
                      onClick={() => toggleStatus(u.id)}>
                      <Icon name={u.status === 'active' ? 'lock' : 'lock-open'} size={10}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Team Member" size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowInvite(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleInvite}>
              <Icon name="paper-plane" size={11}/>Send Invite
            </button>
          </>
        }>
        <div className="flex-col gap-3">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Jane Doe"
              value={inviteForm.name} onChange={e => setInviteForm(f => ({ ...f, name: e.target.value }))}/>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="jane@company.com"
              value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}/>
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={inviteForm.role}
              onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}>
              {['Payroll Admin', 'HR Manager', 'Finance Viewer', 'Read Only'].map(r =>
                <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ── Notifications tab ─────────────────────────────────────────
const NotificationsTab = () => {
  const [prefs, setPrefs] = useState({ ...SETTINGS_DATA.notifications });

  const toggle = (key) => {
    setPrefs(p => {
      const next = { ...p, [key]: !p[key] };
      window.showToast(
        `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications ${next[key] ? 'enabled' : 'disabled'}`,
        next[key] ? 'success' : 'warn',
      );
      return next;
    });
  };

  const NOTIF_ITEMS = [
    { key: 'payrollApproval',  label: 'Payroll Approval',       desc: 'When a payroll run requires your approval' },
    { key: 'payrollProcessed', label: 'Payroll Processed',      desc: 'Confirmation after salary disbursement' },
    { key: 'newHire',          label: 'New Employee Added',      desc: 'When a new employee is onboarded' },
    { key: 'leaveRequest',     label: 'Leave Requests',          desc: 'When an employee submits a leave request' },
    { key: 'complianceDue',    label: 'Compliance Due Dates',    desc: 'Reminders for upcoming filing deadlines' },
    { key: 'expenseSubmitted', label: 'Expense Submissions',     desc: 'When an expense claim is submitted' },
    { key: 'systemAlerts',     label: 'System Alerts',           desc: 'Critical errors and system notifications' },
  ];

  return (
    <div className="flex-col gap-3">
      <div className="card-section-label" style={{ marginBottom: 0 }}>Email Notification Preferences</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: -6 }}>
        Notifications are sent to <strong style={{ color: 'var(--text)' }}>priya@hrflow.io</strong>
      </div>

      {NOTIF_ITEMS.map(item => (
        <div key={item.key} className="flex items-center justify-between p-4 card card-sm"
          style={{ cursor: 'default' }} onClick={() => toggle(item.key)}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
          </div>
          <Toggle id={`notif-${item.key}`} checked={prefs[item.key]} onChange={() => toggle(item.key)}/>
        </div>
      ))}
    </div>
  );
};

// ── Settings main page ────────────────────────────────────────
const Settings = () => {
  const [activeTab, setActiveTab] = useState('company');

  const TAB_CONTENT = {
    company:       <CompanyTab/>,
    'pay-schedule': <PayScheduleTab/>,
    users:         <UsersTab/>,
    notifications: <NotificationsTab/>,
  };

  return (
    <div className="anim-fade">
      <PageHead title="Settings" subtitle="Configure company, payroll, and team preferences"/>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Tab sidebar */}
        <div className="card" style={{ padding: 8 }}>
          {TABS.map(t => (
            <button key={t.id}
              className={`nav-item ${activeTab === t.id ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left', borderRadius: 7, marginBottom: 2 }}
              onClick={() => setActiveTab(t.id)}>
              <span className="nav-item-icon"><Icon name={t.icon} size={12}/></span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="card" key={activeTab}>
          <div className="flex items-center gap-3 mb-5">
            {TABS.find(t => t.id === activeTab) && (
              <>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: 'var(--accent-dim)', color: 'var(--accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={TABS.find(t => t.id === activeTab).icon} size={14}/>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{TABS.find(t => t.id === activeTab).label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {activeTab === 'company'       && 'Legal entity and business details'}
                    {activeTab === 'pay-schedule'  && 'Payroll cycle and timing configuration'}
                    {activeTab === 'users'         && 'Manage admin access and roles'}
                    {activeTab === 'notifications' && 'Control which events trigger emails'}
                  </div>
                </div>
              </>
            )}
          </div>
          {TAB_CONTENT[activeTab]}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Settings });
