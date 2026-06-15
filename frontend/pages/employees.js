// ── Employees page ────────────────────────────────────────────
const { useState, useMemo } = React;

// ── Add / Edit Employee Modal ─────────────────────────────────
const EmployeeModal = ({ open, onClose, initial, onSave }) => {
  const EMPTY = { name: '', email: '', dept: '', role: '', salary: '', startDate: '', status: 'active' };
  const [form, setForm]     = useState(initial || EMPTY);
  const [errors, setErrors] = useState({});

  // Sync when initial changes (edit mode)
  React.useEffect(() => { setForm(initial || EMPTY); setErrors({}); }, [open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Full name required (min 2 chars)';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (!form.dept) e.dept = 'Select a department';
    if (!form.role.trim()) e.role = 'Job role required';
    if (!form.salary || isNaN(Number(form.salary)) || Number(form.salary) <= 0) e.salary = 'Valid annual salary required';
    if (!form.startDate) e.startDate = 'Start date required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, salary: Number(form.salary) });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}
      title={initial ? 'Edit Employee' : 'Add New Employee'}
      size="md"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Icon name="check" size={11}/>{initial ? 'Save Changes' : 'Add Employee'}
          </button>
        </>
      }>
      <div className="flex-col gap-4">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g. Priya Sharma"
              value={form.name} onChange={e => set('name', e.target.value)}/>
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="employee@company.com"
              value={form.email} onChange={e => set('email', e.target.value)}/>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Department *</label>
            <select className={`form-select ${errors.dept ? 'error' : ''}`}
              value={form.dept} onChange={e => set('dept', e.target.value)}>
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
            {errors.dept && <span className="form-error">{errors.dept}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Job Role *</label>
            <input className={`form-input ${errors.role ? 'error' : ''}`}
              placeholder="e.g. Senior Engineer"
              value={form.role} onChange={e => set('role', e.target.value)}/>
            {errors.role && <span className="form-error">{errors.role}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Annual Salary (USD) *</label>
            <input className={`form-input ${errors.salary ? 'error' : ''}`}
              type="number" placeholder="95000"
              value={form.salary} onChange={e => set('salary', e.target.value)}/>
            {errors.salary && <span className="form-error">{errors.salary}</span>}
            {form.salary && !errors.salary && (
              <span className="form-hint">Monthly: {fmtCurrency(Math.round(Number(form.salary) / 12))}</span>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input className={`form-input ${errors.startDate ? 'error' : ''}`}
              type="date"
              value={form.startDate} onChange={e => set('startDate', e.target.value)}/>
            {errors.startDate && <span className="form-error">{errors.startDate}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Employment Status</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};

// ── Employee detail panel ─────────────────────────────────────
const EmployeeDetailPanel = ({ employee: e, onEdit, onDelete, onClose }) => {
  if (!e) return null;
  const tenure = Math.floor((new Date() - new Date(e.startDate)) / (1000 * 60 * 60 * 24 * 365));

  return (
    <div className="card anim-slide-r" style={{ position: 'sticky', top: 0, padding: 0, overflow: 'hidden' }}>
      {/* Panel header */}
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-3)',
      }}>
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>Employee Detail</span>
        <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}>
          <Icon name="xmark" size={12}/>
        </button>
      </div>

      {/* Profile block */}
      <div style={{ padding: '20px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <Avatar name={e.name} size="xl" status={e.status} style={{ margin: '0 auto 10px' }}/>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{e.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{e.role} · {e.dept}</div>
        <StatusChip status={e.status}/>
      </div>

      {/* Info rows */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'Employee ID',  val: e.id },
          { key: 'Email',        val: e.email },
          { key: 'Start Date',   val: fmtDate(e.startDate) },
          { key: 'Tenure',       val: `${tenure} year${tenure !== 1 ? 's' : ''}` },
          { key: 'Annual Salary',val: fmtCurrency(e.salary) },
          { key: 'Monthly Net',  val: fmtCurrency(Math.round(e.net / 12)) },
        ].map(r => (
          <div key={r.key} className="info-row">
            <span className="info-key">{r.key}</span>
            <span className="info-val" style={{ fontFamily: r.key === 'Employee ID' ? 'var(--font-mono)' : 'inherit', fontSize: r.key === 'Employee ID' ? 11.5 : 13 }}>
              {r.val}
            </span>
          </div>
        ))}
      </div>

      {/* Compensation mini chart */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div className="card-section-label">Compensation Breakdown</div>
        {[
          { lbl: 'Gross Salary',  val: e.gross, pct: 100,               color: 'var(--accent)' },
          { lbl: 'Tax',           val: e.tax,   pct: e.tax/e.gross*100,  color: 'var(--danger)' },
          { lbl: 'Benefits Ded.', val: e.benefits, pct: e.benefits/e.gross*100, color: 'var(--warn)' },
          { lbl: 'Net Pay',       val: e.net,   pct: e.net/e.gross*100,  color: 'var(--success)' },
        ].map(c => (
          <div key={c.lbl} style={{ marginBottom: 10 }}>
            <div className="flex items-center justify-between mb-1" style={{ fontSize: 12 }}>
              <span style={{ color: 'var(--text-mid)' }}>{c.lbl}</span>
              <span style={{ fontWeight: 600 }}>{fmtCurrency(c.val)}</span>
            </div>
            <ProgressBar value={c.pct} max={100} color={c.color}/>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
        <button className="btn btn-secondary flex-1" style={{ justifyContent: 'center' }} onClick={() => onEdit(e)}>
          <Icon name="pen-to-square" size={11}/>Edit
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(e)}>
          <Icon name="trash" size={11}/>
        </button>
      </div>
    </div>
  );
};

// ── Employees main page ───────────────────────────────────────
const Employees = ({ searchQuery = '' }) => {
  const [employees, setEmployees] = useState(EMPLOYEES.map(e => ({ ...e })));
  const [search,    setSearch]    = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sync global search from topbar into local search state
  React.useEffect(() => {
    if (searchQuery !== search) setSearch(searchQuery);
  }, [searchQuery]);
  const [deptFilter,   setDeptFilter]   = useState('all');
  const [sortKey,  setSortKey]    = useState('name');
  const [sortDir,  setSortDir]    = useState('asc');
  const [selected, setSelected]   = useState(null);
  const [showAdd,  setShowAdd]    = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Filtered + sorted employees
  const filtered = useMemo(() => {
    let list = employees.filter(e => {
      const q = search.toLowerCase();
      const matchQ = !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
        || e.dept.toLowerCase().includes(q) || e.role.toLowerCase().includes(q);
      const matchS = statusFilter === 'all' || e.status === statusFilter;
      const matchD = deptFilter   === 'all' || e.dept   === deptFilter;
      return matchQ && matchS && matchD;
    });

    list.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 :  1;
      if (va > vb) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
    return list;
  }, [employees, search, statusFilter, deptFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }) => sortKey === k
    ? <Icon name={sortDir === 'asc' ? 'arrow-up' : 'arrow-down'} size={9} style={{ marginLeft: 3 }}/>
    : <Icon name="sort" size={9} style={{ marginLeft: 3, opacity: 0.35 }}/>;

  // CRUD handlers
  const handleAdd = (data) => {
    const newEmp = {
      ...data,
      id: 'E' + String(employees.length + 100).padStart(3, '0'),
      initials: getInitials(data.name),
      color: avatarColor(data.name),
      gross: data.salary,
      ded: Math.round(data.salary * 0.22),
      net: Math.round(data.salary * 0.78),
      tax: Math.round(data.salary * 0.13),
      benefits: Math.round(data.salary * 0.09),
    };
    setEmployees(prev => [newEmp, ...prev]);
    window.showToast(`${data.name} added successfully`, 'success', data.dept);
  };

  const handleEdit = (data) => {
    setEmployees(prev => prev.map(e => e.id === data.id ? { ...e, ...data } : e));
    if (selected?.id === data.id) setSelected(e => ({ ...e, ...data }));
    window.showToast(`${data.name} updated`, 'success');
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setEmployees(prev => prev.filter(e => e.id !== confirmDelete.id));
    if (selected?.id === confirmDelete.id) setSelected(null);
    window.showToast(`${confirmDelete.name} removed`, 'warn');
    setConfirmDelete(null);
  };

  const activeCount = employees.filter(e => e.status === 'active').length;
  const leaveCount  = employees.filter(e => e.status === 'leave').length;

  return (
    <div className="anim-fade">
      <PageHead title="Employees" subtitle={`${employees.length} total · ${activeCount} active · ${leaveCount} on leave`}>
        <button className="btn btn-ghost btn-sm"
          onClick={() => window.showToast('Employee list exported', 'success', 'employees_jun2025.csv')}>
          <Icon name="download" size={11}/>Export
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={11}/>Add Employee
        </button>
      </PageHead>

      {/* Filter bar */}
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: '1 1 220px', minWidth: 180 }}>
          <Icon name="magnifying-glass" size={12} color="var(--text-muted)"/>
          <input placeholder="Search by name, email, role…" value={search} onChange={e => setSearch(e.target.value)}/>
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)' }}>
              <Icon name="xmark" size={11}/>
            </button>
          )}
        </div>
        <select className="form-select" style={{ width: 160 }}
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="leave">On Leave</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="form-select" style={{ width: 180 }}
          value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="all">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
        {(search || statusFilter !== 'all' || deptFilter !== 'all') && (
          <button className="btn btn-ghost btn-sm"
            onClick={() => { setSearch(''); setStatusFilter('all'); setDeptFilter('all'); }}>
            <Icon name="xmark" size={10}/>Clear filters
          </button>
        )}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 'auto' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Main content split */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 300px' : '1fr', gap: 14 }}>
        {/* Table */}
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th className="sortable" onClick={() => toggleSort('id')}>ID <SortIcon k="id"/></th>
                <th className="sortable" onClick={() => toggleSort('name')}>Employee <SortIcon k="name"/></th>
                <th className="sortable" onClick={() => toggleSort('dept')}>Department <SortIcon k="dept"/></th>
                <th>Role</th>
                <th className="sortable td-right" onClick={() => toggleSort('salary')}>Salary <SortIcon k="salary"/></th>
                <th className="sortable" onClick={() => toggleSort('status')}>Status <SortIcon k="status"/></th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState icon="magnifying-glass" title="No employees found"
                      sub="Try adjusting your search filters"/>
                  </td>
                </tr>
              ) : filtered.map(e => (
                <tr key={e.id}
                  className={selected?.id === e.id ? 'selected' : ''}
                  onClick={() => setSelected(selected?.id === e.id ? null : e)}>
                  <td className="td-mono td-muted" style={{ fontSize: 11 }}>{e.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={e.name} size="sm" status={e.status}/>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12.5 }}>{e.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{e.dept}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-mid)' }}>{e.role}</td>
                  <td className="td-right td-mono" style={{ fontWeight: 600 }}>{fmtCurrency(e.salary)}</td>
                  <td><StatusChip status={e.status}/></td>
                  <td className="td-muted" style={{ fontSize: 11.5 }}>{fmtDate(e.startDate)}</td>
                  <td>
                    <div className="flex gap-1" onClick={ev => ev.stopPropagation()}>
                      <button className="icon-btn" style={{ width: 26, height: 26 }}
                        title="Edit" onClick={() => setEditTarget(e)}>
                        <Icon name="pen-to-square" size={11}/>
                      </button>
                      <button className="icon-btn" style={{ width: 26, height: 26, color: 'var(--danger)' }}
                        title="Remove" onClick={() => setConfirmDelete(e)}>
                        <Icon name="trash" size={11}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ color: 'var(--text-muted)' }}>
                  {filtered.length} employee{filtered.length !== 1 ? 's' : ''}
                </td>
                <td className="td-right td-mono">
                  {fmtCurrency(filtered.reduce((a, e) => a + e.salary, 0))}
                </td>
                <td colSpan={3}/>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Detail panel */}
        {selected && (
          <EmployeeDetailPanel
            employee={selected}
            onEdit={setEditTarget}
            onDelete={setConfirmDelete}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      {/* Modals */}
      <EmployeeModal open={showAdd} onClose={() => setShowAdd(false)} onSave={handleAdd}/>
      <EmployeeModal open={!!editTarget} initial={editTarget} onClose={() => setEditTarget(null)}
        onSave={data => handleEdit({ ...editTarget, ...data })}/>
      <ConfirmDialog
        open={!!confirmDelete}
        title="Remove Employee"
        message={`Remove ${confirmDelete?.name} from the system? This cannot be undone.`}
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

Object.assign(window, { Employees });
