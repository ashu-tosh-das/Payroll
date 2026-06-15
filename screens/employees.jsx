// Employees — directory + profile drawer

const Employees = ({ onNav }) => {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(0);
  const [bankRequests, setBankRequests] = useState(() => window.loadStore('BANK_CHANGE_REQUESTS', window.BANK_CHANGE_REQUESTS || []));
  const [showAddForm, setShowAddForm] = useState(false);
  const [empVersion, setEmpVersion] = useState(0);
  const PER_PAGE = 30;

  useEffect(() => { setBankRequests(window.BANK_CHANGE_REQUESTS || []); }, []);

  const filtered = useMemo(() => {
    let r = EMPLOYEES.filter(e =>
      (deptFilter === "all" || e.dept === deptFilter) &&
      (statusFilter === "all" || e.status === statusFilter) &&
      (!search || e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()))
    );
    if (sortBy === "name") r = r.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "ctc") r = r.sort((a, b) => b.ctc - a.ctc);
    if (sortBy === "tenure") r = r.sort((a, b) => b.tenure - a.tenure);
    return r;
  }, [search, deptFilter, statusFilter, sortBy, empVersion]);

  useEffect(() => { setPage(0); }, [search, deptFilter, statusFilter, sortBy]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageStart = page * PER_PAGE;
  const visible = filtered.slice(pageStart, pageStart + PER_PAGE);
  const showingTo = Math.min(pageStart + PER_PAGE, filtered.length);

  const activeCount = EMPLOYEES.filter(e => e.status === "Active").length;
  const onLeave = EMPLOYEES.filter(e => e.status === "On Leave").length;
  const notice = EMPLOYEES.filter(e => e.status === "Notice").length;

  return (
    <div className="page" style={{ position: "relative" }}>
      <PageHead title="Employees" subtitle={`${EMPLOYEES_TOTAL} active employees across 8 departments and 4 locations`}>
        <button className="btn ghost"><Icon name="download"/>Export</button>
        <button className="btn ghost"><Icon name="upload"/>Bulk import</button>
        <button className="btn primary" onClick={() => {
          if (!window.isSuperAdmin) {
            window.toast("Access denied", { icon: "lock", tone: "danger", sub: "Only Super Admins can create employee accounts" });
            return;
          }
          setShowAddForm(true);
        }}>
          <Icon name="plus"/>Add employee
        </button>
      </PageHead>

      {/* Quick stats */}
      <div className="grid g-cols-5">
        <MiniMetric icon="employees" label="Total active" value={EMPLOYEES_TOTAL} delta="+3 this month" tone="up"/>
        <MiniMetric icon="user" label="On leave today" value={onLeave + 17} delta="7.7% of HC" tone=""/>
        <MiniMetric icon="alert" label="In notice" value={notice + 2} delta="2 due Dec" tone="down"/>
        <MiniMetric icon="sparkle" label="Open positions" value="14" delta="3 closing soon" tone=""/>
        <MiniMetric icon="coins" label="Avg CTC (LPA)" value="₹19.4L" delta="+2.1% YoY" tone="up"/>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ marginTop: 12, padding: "10px 14px" }}>
        <div className="row gap-4" style={{ flexWrap: "wrap" }}>
          <div className="search" style={{ maxWidth: 280 }}>
            <Icon name="search" size={13}/>
            <input className="input" style={{ border: 0, background: "transparent", padding: 0, height: 18, flex: 1, color: "var(--text)" }}
              placeholder="Search name or ID…" value={search} onChange={(e) => setSearch(e.target.value)}/>
          </div>

          <FilterPill icon="building" label="Department" value={deptFilter === "all" ? "All" : DEPARTMENTS.find(d => d.id === deptFilter)?.name}>
            {[{id:"all",name:"All departments"}, ...DEPARTMENTS].map(d => (
              <div key={d.id} onClick={() => setDeptFilter(d.id)} style={{ padding: "5px 10px", fontSize: 11.5, cursor: "default", borderRadius: 5, color: deptFilter === d.id ? "var(--accent-bright)" : "var(--text-mid)" }}>
                {d.name}
              </div>
            ))}
          </FilterPill>

          <FilterPill icon="check" label="Status" value={statusFilter === "all" ? "All" : statusFilter}>
            {["all","Active","On Leave","Notice"].map(s => (
              <div key={s} onClick={() => setStatusFilter(s)} style={{ padding: "5px 10px", fontSize: 11.5, cursor: "default", borderRadius: 5, color: statusFilter === s ? "var(--accent-bright)" : "var(--text-mid)" }}>
                {s === "all" ? "All statuses" : s}
              </div>
            ))}
          </FilterPill>

          <FilterPill icon="sort" label="Sort" value={sortBy === "name" ? "Name" : sortBy === "ctc" ? "CTC ↓" : "Tenure ↓"}>
            {[["name","Name (A–Z)"],["ctc","Highest CTC"],["tenure","Longest tenure"]].map(([v,l]) => (
              <div key={v} onClick={() => setSortBy(v)} style={{ padding: "5px 10px", fontSize: 11.5, cursor: "default", borderRadius: 5, color: sortBy === v ? "var(--accent-bright)" : "var(--text-mid)" }}>
                {l}
              </div>
            ))}
          </FilterPill>

          {bankRequests.filter(r => r.status === "pending").length > 0 && (
            <button className="btn ghost sm" style={{ color: "#FBBF24", borderColor: "rgba(251,191,36,0.35)", background: "rgba(251,191,36,0.08)" }}
              onClick={() => window.toast(`${bankRequests.filter(r => r.status === "pending").length} pending bank change request(s)`, { icon: "bank", tone: "warn", sub: "Open an employee profile to review" })}>
              <Icon name="bank" size={12}/>
              Bank Changes
              <span style={{ marginLeft: 2, background: "#FBBF24", color: "#000", borderRadius: 9, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
                {bankRequests.filter(r => r.status === "pending").length}
              </span>
            </button>
          )}
          <div className="flex-1"/>
          <span className="muted fs-xs">Showing <b style={{ color: "var(--text)" }}>{filtered.length}</b> of {EMPLOYEES.length}</span>
          <button className="btn ghost sm"><Icon name="grid" size={11}/></button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ marginTop: 12, padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ paddingLeft: 16 }}>
                  <input type="checkbox" style={{ accentColor: "#10B981" }} />
                </th>
                <th>Employee</th>
                <th>ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Location</th>
                <th className="right">CTC</th>
                <th className="right">Tenure</th>
                <th>Bank</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(e => (
                <tr key={e.id} onClick={() => setSelected(e)} style={{ cursor: "default" }}>
                  <td style={{ paddingLeft: 16 }}>
                    <input type="checkbox" style={{ accentColor: "#10B981" }} onClick={(ev) => ev.stopPropagation()} />
                  </td>
                  <td>
                    <div className="row-emp">
                      <Avatar name={e.name}/>
                      <div>
                        <div className="row-emp-name">{e.name}</div>
                        <div className="row-emp-meta">{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="mono muted">{e.id}</td>
                  <td>
                    <span className="chip" style={{ color: e.deptColor, borderColor: `${e.deptColor}40`, background: `${e.deptColor}14` }}>
                      <span className="dot"/>{e.deptName}
                    </span>
                  </td>
                  <td>
                    <div>{e.role}</div>
                    <div className="row-emp-meta">{e.level}</div>
                  </td>
                  <td className="muted">{e.loc}</td>
                  <td className="right num">{fmtINR(e.ctc, { compact: true })}</td>
                  <td className="right num muted">{e.tenure}y</td>
                  <td className="muted mono" style={{ fontSize: 10.5 }}>{e.bank}</td>
                  <td><StatusChip status={e.status}/></td>
                  <td>
                    <button className="iconbtn" style={{ width: 24, height: 24 }} onClick={(ev) => { ev.stopPropagation(); setSelected(e); }}>
                      <Icon name="arrowRight" size={11}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row between" style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", fontSize: 11.5, color: "var(--text-muted)" }}>
          <span>Showing {filtered.length === 0 ? 0 : pageStart + 1}–{showingTo} of {filtered.length}{filtered.length !== EMPLOYEES.length && <span className="dim"> · filtered from {EMPLOYEES.length}</span>}</span>
          <div className="row gap-3">
            <button className="btn ghost sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ opacity: page === 0 ? 0.5 : 1 }}>Prev</button>
            <span className="mono">{page + 1} / {totalPages}</span>
            <button className="btn ghost sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ opacity: page >= totalPages - 1 ? 0.5 : 1 }}>Next</button>
          </div>
        </div>
      </div>

      {selected && <EmployeeDrawer employee={selected} onClose={() => setSelected(null)} onNav={onNav} bankRequests={bankRequests} setBankRequests={setBankRequests}/>}
      {showAddForm && <AddEmployeeForm onClose={() => setShowAddForm(false)} onSuccess={() => setEmpVersion(v => v + 1)}/>}
    </div>
  );
};

// ── Add Employee Form (SA-04, SA-05, SA-06) ────────────────────
const AddEmployeeForm = ({ onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [dept, setDept] = useState(DEPARTMENTS[0]?.id || "");
  const [designation, setDesignation] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]?.code || "");
  const [ctc, setCtc] = useState("");
  const [doj, setDoj] = useState("2025-12-01");
  const [roleId, setRoleId] = useState("");
  const [grantAccess, setGrantAccess] = useState(true);
  const [errors, setErrors] = useState({});

  const roles = typeof ROLES_DATA !== "undefined" ? ROLES_DATA : [];
  // Compute once at mount so displayed ID and submitted ID are identical
  const [nextId] = useState(() => "SO-" + (1102 + window.loadStore('custom_employees', []).length));

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!designation.trim()) errs.designation = "Designation is required";
    const ctcNum = Number(ctc);
    if (!ctc || isNaN(ctcNum) || ctcNum <= 0) errs.ctc = "Enter a valid annual CTC (e.g. 1840000)";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const customEmps = window.loadStore('custom_employees', []);
    const id = nextId;
    // Normalize accents/diacritics so email is always pure ASCII
    const toAscii = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z\s]/g, "");
    const nameParts = toAscii(name.trim()).split(/\s+/);
    const first = nameParts[0] || "emp";
    const last = nameParts.slice(1).join("") || "x";
    const deptObj = DEPARTMENTS.find(d => d.id === dept) || DEPARTMENTS[0];
    const locObj = LOCATIONS.find(l => l.code === location) || LOCATIONS[0];
    const ctcNum = Math.round(Number(ctc));

    const newEmp = {
      id,
      name: name.trim(),
      first, last,
      email: (first + "." + last).toLowerCase() + "@sourceone.in",
      dept: deptObj.id,
      deptName: deptObj.name,
      deptColor: deptObj.color,
      role: designation.trim(),
      level: "L3",
      loc: locObj.code,
      locName: locObj.name,
      base: Math.round(ctcNum / 13.5),
      ctc: ctcNum,
      tenure: 0,
      status: "Active",
      pan: "PENDING",
      bank: "Not provided",
      doj,
      manager: EMPLOYEES[0]?.id || null,
      _custom: true,
    };

    EMPLOYEES.push(newEmp);
    window.persist('custom_employees', [...customEmps, newEmp]);
    onSuccess && onSuccess();

    if (roleId) {
      const memberships = window.loadStore('role_memberships', {});
      const existing = memberships[roleId] || [];
      if (!existing.includes(id)) {
        memberships[roleId] = [...existing, id];
        window.persist('role_memberships', memberships);
      }
    }

    window.toast(name.trim() + " onboarded successfully", {
      icon: "sparkle", tone: "ok",
      sub: "Employee ID: " + id + " · Welcome kit dispatched",
    });
    onClose();
  };

  const fieldLabel = (text) => (
    <label style={{ display: "block", marginBottom: 6, fontSize: 10.5, fontWeight: 600,
      color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {text}
    </label>
  );

  return (
    <>
      <div className="drawer-mask" onClick={onClose}/>
      <div className="drawer" style={{ width: 520 }}>
        {/* Header */}
        <div className="row between" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>Add new employee</div>
            <div className="muted fs-xs">Onboard to Source One · ID auto-generated</div>
          </div>
          <button className="iconbtn" onClick={onClose}><Icon name="x"/></button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Personal details */}
          <div>
            <div className="section-head" style={{ marginBottom: 12 }}><h3>Personal details</h3></div>
            <div className="grid g-cols-2" style={{ gap: 12 }}>
              <div style={{ gridColumn: "span 2" }}>
                {fieldLabel("Full name *")}
                <input className="input" style={{ width: "100%", height: 34, borderColor: errors.name ? "#F87171" : "" }}
                  placeholder="e.g. Aanya Kapoor" value={name}
                  onChange={e => { setName(e.target.value); setErrors(er => ({...er, name: ""})); }}/>
                {errors.name && <div style={{ fontSize: 11, color: "#F87171", marginTop: 3 }}>{errors.name}</div>}
              </div>
              <div>
                {fieldLabel("Department")}
                <select className="select" style={{ width: "100%", height: 34 }} value={dept} onChange={e => setDept(e.target.value)}>
                  {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                {fieldLabel("Designation *")}
                <input className="input" style={{ width: "100%", height: 34, borderColor: errors.designation ? "#F87171" : "" }}
                  placeholder="e.g. Engineer II" value={designation}
                  onChange={e => { setDesignation(e.target.value); setErrors(er => ({...er, designation: ""})); }}/>
                {errors.designation && <div style={{ fontSize: 11, color: "#F87171", marginTop: 3 }}>{errors.designation}</div>}
              </div>
              <div>
                {fieldLabel("Location")}
                <select className="select" style={{ width: "100%", height: 34 }} value={location} onChange={e => setLocation(e.target.value)}>
                  {LOCATIONS.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
              </div>
              <div>
                {fieldLabel("Annual CTC (₹) *")}
                <input className="input" style={{ width: "100%", height: 34, borderColor: errors.ctc ? "#F87171" : "" }}
                  placeholder="e.g. 1840000" value={ctc} type="number" min="0"
                  onChange={e => { setCtc(e.target.value); setErrors(er => ({...er, ctc: ""})); }}/>
                {errors.ctc && <div style={{ fontSize: 11, color: "#F87171", marginTop: 3 }}>{errors.ctc}</div>}
              </div>
              <div>
                {fieldLabel("Date of joining")}
                <input className="input" type="date" style={{ width: "100%", height: 34 }} value={doj}
                  onChange={e => setDoj(e.target.value)}/>
              </div>
            </div>
          </div>

          {/* Role assignment — Super Admin only */}
          <div>
            <div className="section-head" style={{ marginBottom: 12 }}>
              <h3>Role assignment</h3>
              <span className="chip" style={{ background: "rgba(16,185,129,0.12)", color: "#34D399", borderColor: "rgba(16,185,129,0.25)", fontSize: 10 }}>
                <Icon name="lock" size={9}/>Super Admin
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                {fieldLabel("System role")}
                <select className="select" style={{ width: "100%", height: 34 }} value={roleId} onChange={e => setRoleId(e.target.value)}>
                  <option value="">No role assigned yet</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 4 }}>
                  Determines what this employee can access in the admin portal
                </div>
              </div>
              <div className="row between" style={{ padding: "10px 12px", borderRadius: 8, background: "var(--inset-1)", border: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>Grant portal access</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Employee can log in to Source One portal</div>
                </div>
                <div onClick={() => setGrantAccess(g => !g)}
                  style={{ width: 38, height: 22, borderRadius: 11, cursor: "default", position: "relative", flexShrink: 0,
                    background: grantAccess ? "#10B981" : "var(--inset-3)", transition: "background 0.2s" }}>
                  <div style={{ position: "absolute", top: 3, left: grantAccess ? 19 : 3,
                    width: 16, height: 16, borderRadius: 8, background: "#fff",
                    transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}/>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-gen notice */}
          <div style={{ padding: 12, borderRadius: 8, background: "linear-gradient(160deg,rgba(16,185,129,0.10),rgba(96,165,250,0.04))", border: "1px solid rgba(16,185,129,0.20)" }}>
            <div className="row gap-3" style={{ marginBottom: 4, alignItems: "center" }}>
              <Icon name="sparkle" size={12} color="#34D399"/>
              <b style={{ fontSize: 11.5 }}>Atlas will auto-generate</b>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Employee ID ({nextId}) · Work email · UAN application · Offer + appointment letters · Bank verification kit · Welcome email
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="row between" style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.15)" }}>
          <button className="btn ghost sm" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSubmit}>
            <Icon name="sparkle" size={13}/>Create &amp; send invite
          </button>
        </div>
      </div>
    </>
  );
};

// ── Filter pill (dropdown trigger) ─────────────────────────────
const FilterPill = ({ icon, label, value, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button className="btn ghost sm" onClick={() => setOpen(!open)} style={{ height: 28 }}>
        <Icon name={icon} size={12}/>
        <span className="muted">{label}:</span>
        <b style={{ color: "var(--text)", fontWeight: 500 }}>{value}</b>
        <Icon name="chevDown" size={11}/>
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 5 }} onClick={() => setOpen(false)}/>
          <div className="glass-strong" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 6, minWidth: 180, padding: 6 }}>
            <div onClick={() => setOpen(false)}>
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── Mini metric (used by multiple screens) ─────────────────────
const MiniMetric = ({ icon, label, value, delta, tone }) => (
  <div className="card kpi" style={{ padding: "12px 14px" }}>
    <div className="row between">
      <div className="kpi-label" style={{ fontSize: 10 }}><Icon name={icon} size={11}/>{label}</div>
    </div>
    <div className="kpi-value" style={{ fontSize: 22 }}>{value}</div>
    <div className={`kpi-delta ${tone}`} style={{ fontSize: 10.5 }}>{delta}</div>
  </div>
);

// ── Drawer ─────────────────────────────────────────────────────
const EmployeeDrawer = ({ employee, onClose, onNav, bankRequests, setBankRequests }) => {
  const [tab, setTab] = useState("overview");
  const [biometricKey, setBiometricKey] = React.useState(0);
  const e = employee;
  const empBankRequests = (bankRequests || []).filter(r => r.empId === e.id || r.empName === e.name);
  return (
    <>
      <div className="drawer-mask" onClick={onClose}/>
      <div className="drawer">
        <div className="row between" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <div className="row gap-4">
            <Avatar name={e.name} size={44}/>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{e.name}</div>
              <div className="muted fs-xs">{e.id} · {e.role} · {e.level}</div>
            </div>
          </div>
          <button className="iconbtn" onClick={onClose}><Icon name="x"/></button>
        </div>

        <div style={{ padding: "10px 18px 0" }}>
          <div className="tabs" style={{ width: "fit-content" }}>
            {[
              { id: "overview", label: "Overview" },
              { id: "compensation", label: "Compensation" },
              { id: "attendance", label: "Attendance" },
              { id: "documents", label: "Documents" },
              { id: "activity", label: "Activity" },
              { id: "biometric", label: "Biometric" },
            ].map(t => (
              <button key={t.id} data-active={tab === t.id} onClick={() => { setTab(t.id); if (t.id === "biometric") setBiometricKey(k => k + 1); }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "16px 18px", flex: 1 }}>
          {tab === "overview" && (
            <div className="col gap-7">
              <div className="grid g-cols-2">
                <Field label="Department"><span style={{ color: e.deptColor, fontWeight: 500 }}>{e.deptName}</span></Field>
                <Field label="Location">{e.locName}</Field>
                <Field label="Email">{e.email}</Field>
                <Field label="Manager">SO-1042 (Deepak Verma)</Field>
                <Field label="Date of joining">{e.doj} · {e.tenure} yrs</Field>
                <Field label="Status"><StatusChip status={e.status}/></Field>
              </div>
              <div className="section-head"><h3>Identity & banking</h3></div>
              <div className="grid g-cols-2">
                <Field label="PAN" mono>{e.pan}</Field>
                <Field label="UAN" mono>1011{e.id.slice(-4)}48{e.id.slice(-3)}</Field>
                <Field label="Bank account" mono>{e.bank}</Field>
                <Field label="IFSC" mono>HDFC0001847</Field>
              </div>
              {empBankRequests.length > 0 && (
                <div className="col gap-3">
                  <div className="section-head"><h3>Bank Change Requests</h3></div>
                  {empBankRequests.map((req, i) => (
                    <div key={req.id || i} className="card" style={{
                      padding: "12px 14px",
                      borderColor: req.status === "pending" ? "rgba(251,191,36,0.40)" : req.status === "approved" ? "rgba(16,185,129,0.30)" : "rgba(248,113,113,0.30)",
                      background: req.status === "pending" ? "rgba(251,191,36,0.06)" : req.status === "approved" ? "rgba(16,185,129,0.05)" : "rgba(248,113,113,0.05)",
                    }}>
                      <div className="row between" style={{ marginBottom: 8 }}>
                        <div className="row gap-3">
                          <Icon name="bank" size={14} color={req.status === "pending" ? "#FBBF24" : req.status === "approved" ? "#34D399" : "#F87171"}/>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>Pending bank detail change request</div>
                            <div className="muted fs-xs">Submitted: {req.submittedDate || req.date || "—"}</div>
                          </div>
                        </div>
                        <span className={`chip ${req.status === "pending" ? "warn" : req.status === "approved" ? "ok" : "danger"}`}>
                          {req.status === "pending" ? "Pending" : req.status === "approved" ? "Approved" : "Rejected"}
                        </span>
                      </div>
                      <div className="grid g-cols-2" style={{ gap: 8, marginBottom: req.status === "pending" ? 10 : 0 }}>
                        <div>
                          <div className="fs-xs muted fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>Current / Old</div>
                          <div className="mono fs-xs" style={{ color: "var(--text-mid)" }}>{req.oldValue || req.oldBank || "—"}</div>
                        </div>
                        <div>
                          <div className="fs-xs muted fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>Requested / New</div>
                          <div className="mono fs-xs" style={{ color: "var(--text)" }}>{req.newValue || req.newBank || "—"}</div>
                        </div>
                      </div>
                      {req.status === "pending" && (
                        <div className="row gap-3" style={{ paddingTop: 10, borderTop: "1px dashed var(--inset-3)" }}>
                          <button className="btn primary sm" onClick={() => {
                            const updated = (bankRequests || []).map(r => (r.id || r) === (req.id || req) ? { ...r, status: "approved" } : r);
                            if (window.BANK_CHANGE_REQUESTS) {
                              const wi = window.BANK_CHANGE_REQUESTS.findIndex(r => (r.id || r) === (req.id || req));
                              if (wi !== -1) window.BANK_CHANGE_REQUESTS[wi].status = "approved";
                            }
                            setBankRequests(updated);
                            window.persist('BANK_CHANGE_REQUESTS', updated);
                            window.toast("Bank details updated", { icon: "bank", tone: "ok", sub: `Change approved for ${e.name}` });
                          }}><Icon name="check" size={11}/>Approve</button>
                          <button className="btn ghost sm" style={{ color: "#F87171", borderColor: "rgba(248,113,113,0.35)" }} onClick={() => {
                            const updated = (bankRequests || []).map(r => (r.id || r) === (req.id || req) ? { ...r, status: "rejected" } : r);
                            if (window.BANK_CHANGE_REQUESTS) {
                              const wi = window.BANK_CHANGE_REQUESTS.findIndex(r => (r.id || r) === (req.id || req));
                              if (wi !== -1) window.BANK_CHANGE_REQUESTS[wi].status = "rejected";
                            }
                            setBankRequests(updated);
                            window.persist('BANK_CHANGE_REQUESTS', updated);
                            window.toast("Bank change request rejected", { icon: "x", tone: "danger", sub: `Request rejected for ${e.name}` });
                          }}><Icon name="x" size={11}/>Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="section-head"><h3>Documents</h3></div>
              <div className="col gap-3">
                <DocRow name="Aadhaar.pdf" verified at="Verified Aug 12, 2023"/>
                <DocRow name="PAN.pdf" verified at="Verified Aug 12, 2023"/>
                <DocRow name="Cancelled cheque.pdf" verified at="Verified Aug 14, 2023"/>
                <DocRow name="Relieving letter — prev.pdf" verified at="Verified Aug 18, 2023"/>
                <DocRow name="Form 12BB FY25.pdf" pending at="Pending · due Mar 31"/>
              </div>
            </div>
          )}

          {tab === "compensation" && (
            <div className="col gap-7">
              <div className="card" style={{
                background: "linear-gradient(160deg, rgba(16,185,129,0.10), rgba(96,165,250,0.04))",
                borderColor: "rgba(16,185,129,0.20)",
              }}>
                <div className="row between">
                  <div>
                    <div className="muted fs-xs">Annual CTC</div>
                    <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>{fmtINR(e.ctc)}</div>
                  </div>
                  <div className="col gap-3" style={{ textAlign: "right" }}>
                    <span className="chip ok">Level {e.level}</span>
                    <div className="muted fs-xs">Last revised Apr 2025</div>
                  </div>
                </div>
              </div>

              <div className="section-head"><h3>Monthly breakdown</h3></div>
              <div className="col gap-2">
                {[
                  { l: "Basic", v: e.base * 0.5 },
                  { l: "HRA", v: e.base * 0.25 },
                  { l: "Special allowance", v: e.base * 0.18 },
                  { l: "LTA", v: e.base * 0.04 },
                  { l: "Telephone", v: e.base * 0.03 },
                ].map(r => (
                  <div key={r.l} className="row between" style={{ padding: "5px 0", borderBottom: "1px dashed var(--inset-3)" }}>
                    <span style={{ fontSize: 12 }}>{r.l}</span>
                    <span className="mono fs-sm">{fmtINR(Math.round(r.v))}</span>
                  </div>
                ))}
                <div className="row between" style={{ paddingTop: 8, marginTop: 6, borderTop: "1px solid var(--border)" }}>
                  <span className="fw-600">Gross / month</span>
                  <span className="fw-600 mono">{fmtINR(e.base)}</span>
                </div>
              </div>

              <div className="section-head"><h3>Salary history</h3></div>
              <div className="col gap-3">
                {[
                  { d: "Apr 2025", ctc: e.ctc, change: "+12%", note: "Annual appraisal · Exceeds" },
                  { d: "Apr 2024", ctc: e.ctc * 0.89, change: "+9%", note: "Annual appraisal · Meets" },
                  { d: "Apr 2023", ctc: e.ctc * 0.82, change: "+18%", note: "Promotion · L4→L5" },
                ].map((r, i) => (
                  <div key={i} className="row between" style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{r.d}</div>
                      <div className="fs-xs muted">{r.note}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono fs-sm">{fmtINR(Math.round(r.ctc), { compact: true })}</div>
                      <div className="fs-xs" style={{ color: "#34D399" }}>{r.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "attendance" && (
            <div className="col gap-6">
              <div className="grid g-cols-3">
                <Field label="Present (Nov)" mono>21 / 24</Field>
                <Field label="Avg hours/day" mono>8h 42m</Field>
                <Field label="OT (Nov)" mono>14h</Field>
              </div>
              <div className="section-head"><h3>Leave balance</h3></div>
              {LEAVE_TYPES.map(l => (
                <div key={l.id} className="col gap-2">
                  <div className="row between">
                    <span style={{ fontSize: 12 }}>{l.label}</span>
                    <span className="mono fs-sm muted">{l.total - l.used} / {l.total}</span>
                  </div>
                  <div className="bar"><div style={{ width: `${(l.used / l.total) * 100}%`, background: l.color }}/></div>
                </div>
              ))}
            </div>
          )}

          {tab === "documents" && (
            <div className="col gap-3">
              <DocRow name="Form 16 — FY 24-25.pdf" verified at="Issued Jun 15, 2025"/>
              <DocRow name="Form 16 — FY 23-24.pdf" verified at="Issued Jun 14, 2024"/>
              <DocRow name="Offer letter.pdf" verified at="Signed Aug 02, 2023"/>
              <DocRow name="Appointment letter.pdf" verified at="Signed Aug 12, 2023"/>
              <DocRow name="Compensation revision — Apr 25.pdf" verified at="Issued Apr 02, 2025"/>
            </div>
          )}

          {tab === "activity" && (
            <div className="col gap-4">
              {[
                { a: "Apr 2 · Compensation revised", d: "+12% CTC · L4 → L5" },
                { a: "Mar 28 · Performance review", d: "Exceeds expectations" },
                { a: "Jan 12 · Address updated", d: "Profile change" },
                { a: "Aug 12, 2023 · Joined", d: "Welcomed by Priya Kapoor" },
              ].map((r, i) => (
                <div key={i} style={{ paddingLeft: 18, position: "relative", borderLeft: "1px dashed var(--border)", paddingBottom: 4 }}>
                  <div style={{ position: "absolute", left: -4, top: 4, width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }}/>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{r.a}</div>
                  <div className="fs-xs muted">{r.d}</div>
                </div>
              ))}
            </div>
          )}

          {tab === "biometric" && (
            <div key={biometricKey} className="col gap-6">
              {/* Employee biometric status card */}
              <div className="card" style={{
                background: "linear-gradient(160deg, rgba(16,185,129,0.10), rgba(96,165,250,0.04))",
                borderColor: "rgba(16,185,129,0.20)",
              }}>
                <div className="row between" style={{ marginBottom: 8 }}>
                  <div className="row gap-3">
                    <Icon name="fingerprint" size={18} color="#34D399"/>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Biometric Status</div>
                      <div className="muted fs-xs">Enrolled on 2 devices · Last punch: Today 09:14 AM</div>
                    </div>
                  </div>
                  <span className="chip ok"><Icon name="check" size={10}/>Active</span>
                </div>
                <button className="btn danger sm" onClick={() => window.openModal({
                  title: "Force Re-enroll",
                  subtitle: `This will revoke ${e.name}'s biometric credentials from all enrolled devices and require fresh enrollment.`,
                  confirmText: "Force re-enroll",
                  onConfirm: () => window.toast(`Re-enrollment initiated for ${e.name}`, { icon: "fingerprint", tone: "warn", sub: "Credentials revoked · Employee notified" }),
                })}><Icon name="fingerprint" size={11}/>Force re-enroll</button>
              </div>

              <div className="section-head"><h3>Devices</h3></div>

              {(window.BIOMETRIC_DEVICES || (typeof BIOMETRIC_DEVICES !== "undefined" ? BIOMETRIC_DEVICES : [])).map(dev => (
                <div key={dev.id} className="card" style={{ padding: "12px 14px" }}>
                  <div className="row between" style={{ marginBottom: 8 }}>
                    <div className="row gap-4">
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                        background: "rgba(99,102,241,0.12)", color: "#818CF8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1px solid rgba(99,102,241,0.25)",
                      }}>
                        <Icon name="cpu" size={16}/>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{dev.location}</div>
                        <div className="muted fs-xs">{dev.model || dev.id} · {dev.records !== undefined ? `${dev.records} records` : ""}</div>
                      </div>
                    </div>
                    <div className="row gap-3">
                      <span className={`chip ${dev.status === "online" ? "ok" : "danger"}`}>
                        <span className="live-dot" style={{ background: dev.status === "online" ? "#34D399" : "#F87171" }}/>
                        {dev.status}
                      </span>
                    </div>
                  </div>
                  <div className="row between" style={{ paddingTop: 8, borderTop: "1px dashed var(--inset-3)" }}>
                    <div className="muted fs-xs row gap-4">
                      <span><Icon name="clock" size={10}/> Last sync: {dev.lastSync || "—"}</span>
                      {dev.records !== undefined && <span><Icon name="fingerprint" size={10}/> {dev.records} records</span>}
                    </div>
                    <button className="btn ghost sm" onClick={() => window.toast(`Enrollment request sent to ${dev.location}`, { icon: "fingerprint", tone: "info", sub: `Device: ${dev.model || dev.id}` })}>
                      <Icon name="plus" size={11}/>Enroll on device
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="row between" style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.2)" }}>
          <button className="btn ghost sm" onClick={() => window.toast(`Editing ${e.name}`, { icon: "edit", tone: "info" })}><Icon name="edit"/>Edit</button>
          <div className="row gap-3">
            <button className="btn ghost sm" onClick={() => { onNav?.("payslips"); onClose(); }}>View payslips</button>
            <button className="btn primary sm" onClick={() => window.toast(`Opening ${e.name}'s full profile`, { icon: "user", tone: "info", sub: `${e.id} · ${e.role}` })}>Open full profile<Icon name="arrowRight" size={11}/></button>
          </div>
        </div>
      </div>
    </>
  );
};

const Field = ({ label, mono, children }) => (
  <div className="col gap-2">
    <div className="fs-xs muted fw-600" style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
    <div className={mono ? "mono" : ""} style={{ fontSize: 12 }}>{children}</div>
  </div>
);

const DocRow = ({ name, verified, pending, at }) => (
  <div className="row gap-4" style={{ padding: "8px 10px", borderRadius: 8, background: "var(--inset-1)", border: "1px solid var(--border)" }}>
    <div style={{
      width: 28, height: 28, borderRadius: 6, flexShrink: 0,
      background: "rgba(96,165,250,0.12)", color: "#93C5FD",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 8.5, fontWeight: 700, border: "1px solid rgba(96,165,250,0.25)",
    }}>PDF</div>
    <div className="flex-1">
      <div style={{ fontSize: 12, fontWeight: 500 }}>{name}</div>
      <div className="fs-xs muted">{at}</div>
    </div>
    {verified ? <span className="chip ok"><Icon name="check" size={10}/>Verified</span>
              : <span className="chip warn"><Icon name="alert" size={10}/>Pending</span>}
    <button className="iconbtn" style={{ width: 24, height: 24 }}><Icon name="download" size={11}/></button>
  </div>
);

Object.assign(window, { Employees, MiniMetric, Field, FilterPill, EmployeeDrawer, DocRow });
