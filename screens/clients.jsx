// ──────────────────────────────────────────────────────────────
// ADM-001 · Clients — admin view of client companies
// ADM-002 · TimesheetUpload — sub-page
// ADM-003 · ClientPayroll — sub-page
// ──────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════
// ADM-001 · Clients screen
// ══════════════════════════════════════════════════════════════
const Clients = ({ onSub }) => {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = CLIENTS.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalEmp   = CLIENTS.filter(c => c.status === "Active").reduce((s, c) => s + c.empCount, 0);
  const activeClts = CLIENTS.filter(c => c.status === "Active").length;

  return (
    <div className="page" style={{ position: "relative" }}>
      <PageHead title="Clients" subtitle={`${activeClts} active clients · ${totalEmp} employees managed across all clients`}>
        <button className="btn ghost"><Icon name="download"/>Export</button>
        <button className="btn primary" onClick={() => window.openModal({
          title: "Add new client",
          subtitle: "Onboard a new client company to Source One payroll",
          body: (
            <div className="grid g-cols-2 gap-8" style={{ gap: 14 }}>
              <div style={{ gridColumn: "span 2" }}>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Company name</div>
                <input className="input" style={{ width: "100%", height: 34 }} placeholder="e.g. Infosys BPO Ltd."/>
              </div>
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Short code</div>
                <input className="input" style={{ width: "100%", height: 34 }} placeholder="e.g. INFY"/>
              </div>
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Industry</div>
                <select className="select" style={{ width: "100%", height: 34 }}>
                  {["IT Services","IT Consulting","Technology","Banking","Manufacturing","Healthcare"].map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>HQ Location</div>
                <input className="input" style={{ width: "100%", height: 34 }} placeholder="City"/>
              </div>
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Primary contact</div>
                <input className="input" style={{ width: "100%", height: 34 }} placeholder="Contact name"/>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Contact email</div>
                <input className="input" style={{ width: "100%", height: 34 }} placeholder="contact@company.com"/>
              </div>
            </div>
          ),
          confirmText: "Add client",
          onConfirm: () => window.toast("Client onboarded", { icon: "building", tone: "ok", sub: "Client ID generated · payroll config pending" }),
        })}><Icon name="plus"/>Add client</button>
      </PageHead>

      {/* KPIs */}
      <div className="grid g-cols-4">
        <MiniMetric icon="building"   label="Active clients"   value={activeClts}   delta={`${CLIENTS.length} total`}  tone="up"/>
        <MiniMetric icon="employees"  label="Emp. managed"     value={totalEmp}      delta="across active clients"       tone="up"/>
        <MiniMetric icon="payroll"    label="Payroll runs"     value="47"            delta="last 12 months"              tone=""/>
        <MiniMetric icon="coins"      label="Total billing"    value="₹6.2 Cr"       delta="+12% vs last year"           tone="up"/>
      </div>

      {/* Search */}
      <div className="card" style={{ marginTop: 12, padding: "10px 14px" }}>
        <div className="search" style={{ maxWidth: 300 }}>
          <Icon name="search" size={13}/>
          <input className="input" style={{ border: 0, background: "transparent", padding: 0, height: 18, flex: 1, color: "var(--text)" }}
            placeholder="Search client name or code…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
      </div>

      {/* Client cards */}
      <div className="grid g-cols-2" style={{ marginTop: 12, gap: 12 }}>
        {filtered.map(c => {
          const clientEmps = EMPLOYEES.filter(e => e.clientId === c.id);
          const depts = [...new Set(clientEmps.map(e => e.deptName))].slice(0, 3);
          const isSel = selected?.id === c.id;
          return (
            <div key={c.id} className="card" style={{
              cursor: "default", borderColor: isSel ? "rgba(16,185,129,0.45)" : c.status === "Inactive" ? "rgba(255,255,255,0.04)" : "var(--border)",
              opacity: c.status === "Inactive" ? 0.65 : 1,
            }} onClick={() => setSelected(isSel ? null : c)}>
              <div className="row between" style={{ marginBottom: 10 }}>
                <div className="row gap-4">
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: `linear-gradient(135deg, #${avatarHueFor(c.name).toString(16).padStart(6,"0").slice(0,3)}880, #10B98130)`,
                    border: "1px solid rgba(255,255,255,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: "#fff",
                  }}>{c.code.slice(0, 2)}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.name}</div>
                    <div className="muted fs-xs">{c.id} · {c.industry} · {c.location}</div>
                  </div>
                </div>
                <span className={`chip ${c.status === "Active" ? "ok" : "danger"}`}><span className="dot"/>{c.status}</span>
              </div>

              <div className="grid g-cols-3" style={{ gap: 8, marginBottom: 10 }}>
                <div style={{ padding: "8px 10px", borderRadius: 8, background: "var(--inset-2)", border: "1px solid var(--border)" }}>
                  <div className="muted fs-xs" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>Employees</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "#10B981", marginTop: 2 }}>{c.empCount}</div>
                </div>
                <div style={{ padding: "8px 10px", borderRadius: 8, background: "var(--inset-2)", border: "1px solid var(--border)" }}>
                  <div className="muted fs-xs" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>Client since</div>
                  <div style={{ fontSize: 12, fontWeight: 500, marginTop: 2 }}>{c.since}</div>
                </div>
                <div style={{ padding: "8px 10px", borderRadius: 8, background: "var(--inset-2)", border: "1px solid var(--border)" }}>
                  <div className="muted fs-xs" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>Contact</div>
                  <div style={{ fontSize: 11, fontWeight: 500, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.contact}</div>
                </div>
              </div>

              <div className="row between">
                <div className="row gap-2" style={{ flexWrap: "wrap" }}>
                  {depts.map(d => <span key={d} className="chip" style={{ fontSize: 9.5 }}>{d}</span>)}
                  {[...new Set(clientEmps.map(e => e.deptName))].length > 3 &&
                    <span className="chip" style={{ fontSize: 9.5 }}>+{[...new Set(clientEmps.map(e => e.deptName))].length - 3} more</span>}
                </div>
                <div className="row gap-2">
                  <button className="btn ghost sm" onClick={ev => { ev.stopPropagation(); onSub?.("timesheet-upload", { clientId: c.id, clientName: c.name }); }}>
                    <Icon name="upload" size={11}/>Timesheet
                  </button>
                  <button className="btn primary sm" onClick={ev => { ev.stopPropagation(); onSub?.("client-payroll", { clientId: c.id, clientName: c.name }); }}>
                    <Icon name="payroll" size={11}/>Payroll
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded client employees */}
      {selected && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-head">
            <div className="card-title">{selected.name} — Employees<small>{selected.empCount} employees · {selected.code}</small></div>
            <div className="row gap-3">
              <button className="btn ghost sm" onClick={() => onSub?.("timesheet-upload", { clientId: selected.id, clientName: selected.name })}>
                <Icon name="upload" size={11}/>Upload timesheet
              </button>
              <button className="btn primary sm" onClick={() => onSub?.("client-payroll", { clientId: selected.id, clientName: selected.name })}>
                <Icon name="payroll" size={11}/>Run payroll
              </button>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr><th>Employee</th><th>ID</th><th>Department</th><th>Designation</th><th>Location</th><th className="right">CTC</th><th>Status</th></tr>
              </thead>
              <tbody>
                {EMPLOYEES.filter(e => e.clientId === selected.id).slice(0, 15).map(e => (
                  <tr key={e.id}>
                    <td><div className="row-emp"><Avatar name={e.name}/><div><div className="row-emp-name">{e.name}</div><div className="row-emp-meta">{e.email}</div></div></div></td>
                    <td className="mono muted">{e.id}</td>
                    <td><span className="chip" style={{ color: e.deptColor, borderColor: `${e.deptColor}40`, background: `${e.deptColor}14` }}><span className="dot"/>{e.deptName}</span></td>
                    <td>{e.role}</td>
                    <td className="muted">{e.loc}</td>
                    <td className="right num">{fmtINR(e.ctc, { compact: true })}</td>
                    <td><StatusChip status={e.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {EMPLOYEES.filter(e => e.clientId === selected.id).length > 15 && (
            <div className="muted fs-xs" style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
              Showing 15 of {EMPLOYEES.filter(e => e.clientId === selected.id).length} employees
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// ADM-002 · Timesheet Upload
// ══════════════════════════════════════════════════════════════
const TimesheetUpload = ({ onBack, clientId, clientName }) => {
  const [selClient, setSelClient] = useState(clientId || CLIENTS[0].id);
  const [selMonth,  setSelMonth]  = useState("Nov 2025");
  const [stage,     setStage]     = useState("idle"); // idle | preview | done
  const [rows,      setRows]      = useState([]);

  const client = CLIENTS.find(c => c.id === selClient) || CLIENTS[0];

  const handleUpload = () => {
    setStage("preview");
    setRows(genTimesheetRows(selClient));
    window.toast("Timesheet parsed", { icon: "check", tone: "ok", sub: `${genTimesheetRows(selClient).length} records loaded · Review before confirming` });
  };

  const confirm = () => {
    setStage("done");
    window.toast("Attendance updated", {
      icon: "check", tone: "ok",
      sub: `${rows.length} employees' attendance synced for ${selMonth} · ${client.name}`,
    });
  };

  return (
    <div className="page">
      <div className="row gap-3 center" style={{ marginBottom: 8 }}>
        <button className="btn ghost sm" onClick={onBack}><Icon name="chevron" size={11} style={{ transform: "rotate(180deg)" }}/>Back to Clients</button>
      </div>

      <PageHead title="Timesheet Upload" subtitle={`Upload attendance CSV for a client and month — auto-updates attendance records`}>
        {stage === "preview" && <button className="btn ghost" onClick={() => { setStage("idle"); setRows([]); }}>Re-upload</button>}
        {stage === "preview" && <button className="btn primary" onClick={confirm}><Icon name="check"/>Confirm & sync attendance</button>}
      </PageHead>

      {/* Config row */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row gap-5" style={{ flexWrap: "wrap" }}>
          <div>
            <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Client</div>
            <select className="select" style={{ width: 200, height: 34 }} value={selClient}
              onChange={e => { setSelClient(e.target.value); setStage("idle"); setRows([]); }}>
              {CLIENTS.filter(c => c.status === "Active").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Month</div>
            <select className="select" style={{ width: 140, height: 34 }} value={selMonth} onChange={e => setSelMonth(e.target.value)}>
              {TIMESHEET_MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex-1"/>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div className="row gap-3">
              <span className="chip" style={{ fontSize: 10.5 }}><Icon name="employees" size={10}/>{client.empCount} employees</span>
              <span className="chip ok" style={{ fontSize: 10.5 }}><span className="dot"/>{client.status}</span>
            </div>
          </div>
        </div>
      </div>

      {stage === "idle" && (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: "rgba(96,165,250,0.12)", color: "#93C5FD",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
          }}>
            <Icon name="upload" size={26}/>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Upload attendance timesheet</div>
          <div className="muted fs-sm" style={{ marginBottom: 20, lineHeight: 1.6 }}>
            Upload a CSV with columns: Employee ID, Name, Present Days, Leave Days, OT Hours.<br/>
            Format: <span className="mono" style={{ color: "var(--accent-bright)" }}>emp_id, name, present, leave, overtime</span>
          </div>
          <div className="row gap-3" style={{ justifyContent: "center" }}>
            <button className="btn ghost" onClick={() => window.toast("Downloading template…", { icon: "download", tone: "info", sub: "timesheet_template.csv" })}>
              <Icon name="download"/>Download template
            </button>
            <button className="btn primary" onClick={handleUpload}>
              <Icon name="upload"/>Select & upload CSV
            </button>
          </div>
          <div className="muted fs-xs" style={{ marginTop: 14 }}>Supports .csv and .xlsx · max 5 MB</div>
        </div>
      )}

      {(stage === "preview" || stage === "done") && (
        <>
          {stage === "done" && (
            <div className="card" style={{ marginBottom: 14, background: "linear-gradient(160deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))", borderColor: "rgba(16,185,129,0.30)" }}>
              <div className="row gap-4">
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(16,185,129,0.18)", color: "#34D399", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="check" size={16}/>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Attendance updated successfully</div>
                  <div className="muted fs-xs" style={{ marginTop: 2 }}>
                    {rows.length} employees · {selMonth} · {client.name} · Audit event logged · Payroll will use this data
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary row */}
          <div className="grid g-cols-4" style={{ marginBottom: 14 }}>
            <MiniMetric icon="employees" label="Records loaded"   value={rows.length}       delta={`${client.name}`}       tone="up"/>
            <MiniMetric icon="check"     label="Avg present days" value={`${Math.round(rows.reduce((s,r)=>s+r.present,0)/rows.length)}/22`} delta="92% rate" tone="up"/>
            <MiniMetric icon="calendar"  label="Total leave days" value={rows.reduce((s,r)=>s+r.leaveDays,0)} delta="PL · SL · CL"         tone=""/>
            <MiniMetric icon="clock"     label="Total OT hours"   value={rows.reduce((s,r)=>s+r.overtime,0)}  delta="flagged for review"   tone=""/>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
              <div className="card-title">
                Preview — {client.name} · {selMonth}
                <small>{rows.length} employees · attendance data</small>
              </div>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Employee</th><th>ID</th><th>Department</th>
                  <th className="right">Working days</th><th className="right">Present</th>
                  <th className="right">Leave</th><th className="right">OT (hrs)</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const pct = (r.present / r.workingDays) * 100;
                  const flag = pct < 75;
                  return (
                    <tr key={i} data-selected={flag}>
                      <td><div className="row-emp"><Avatar name={r.name}/><div className="row-emp-name">{r.name}</div></div></td>
                      <td className="mono muted">{r.empId}</td>
                      <td className="muted">{r.dept}</td>
                      <td className="right num">{r.workingDays}</td>
                      <td className="right num" style={{ color: flag ? "#FCA5B0" : "#34D399" }}>{r.present}</td>
                      <td className="right num muted">{r.leaveDays}</td>
                      <td className="right num" style={{ color: r.overtime > 8 ? "#F59E0B" : "inherit" }}>{r.overtime}</td>
                      <td>
                        {flag
                          ? <span className="chip warn"><Icon name="alert" size={10}/>Low attendance</span>
                          : <span className="chip ok"><span className="dot"/>OK</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// ADM-003 · Client Payroll — generate + Excel download
// ══════════════════════════════════════════════════════════════
const ClientPayroll = ({ onBack, clientId, clientName }) => {
  const [selClient, setSelClient] = useState(clientId || CLIENTS[0].id);
  const [selMonth,  setSelMonth]  = useState("Nov 2025");
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const client = CLIENTS.find(c => c.id === selClient) || CLIENTS[0];
  const emps   = EMPLOYEES.filter(e => e.clientId === selClient);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      window.toast("Payroll report generated", {
        icon: "payroll", tone: "ok",
        sub: `${emps.length} employees · ${selMonth} · ${client.name}`,
      });
    }, 1400);
  };

  const downloadExcel = () => {
    window.toast(`Downloading ${client.name} · ${selMonth} payroll.xlsx`, {
      icon: "download", tone: "info",
      sub: "Excel file ready — check your downloads",
    });
  };

  // Generate payroll rows from employee data
  const payrollRows = emps.map(e => {
    const gross = Math.round(e.base * (1 + Math.sin(e.base * 0.0001) * 0.05));
    const pf    = Math.round(e.base * 0.5 * 0.12);
    const tds   = Math.round(gross * 0.10);
    const pt    = 200;
    const ded   = pf + tds + pt;
    const net   = gross - ded;
    return { ...e, gross, pf, tds, pt, ded, net };
  });

  const totalGross = payrollRows.reduce((s, r) => s + r.gross, 0);
  const totalDed   = payrollRows.reduce((s, r) => s + r.ded, 0);
  const totalNet   = payrollRows.reduce((s, r) => s + r.net, 0);
  const totalPF    = payrollRows.reduce((s, r) => s + r.pf, 0);

  return (
    <div className="page">
      <div className="row gap-3 center" style={{ marginBottom: 8 }}>
        <button className="btn ghost sm" onClick={onBack}><Icon name="chevron" size={11} style={{ transform: "rotate(180deg)" }}/>Back to Clients</button>
      </div>

      <PageHead title="Client Payroll" subtitle="Generate payroll for a specific client and download the Excel report">
        {generated && (
          <>
            <button className="btn ghost" onClick={() => { setGenerated(false); }}><Icon name="arrowRight" size={11} style={{ transform: "rotate(180deg)" }}/>Re-generate</button>
            <button className="btn primary" onClick={downloadExcel}><Icon name="download"/>Download Excel</button>
          </>
        )}
      </PageHead>

      {/* Config */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row gap-5 center" style={{ flexWrap: "wrap" }}>
          <div>
            <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Client</div>
            <select className="select" style={{ width: 220, height: 34 }} value={selClient}
              onChange={e => { setSelClient(e.target.value); setGenerated(false); }}>
              {CLIENTS.filter(c => c.status === "Active").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Pay period</div>
            <select className="select" style={{ width: 140, height: 34 }} value={selMonth}
              onChange={e => { setSelMonth(e.target.value); setGenerated(false); }}>
              {TIMESHEET_MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex-1"/>
          {!generated && (
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn primary" onClick={generate} disabled={generating} style={{ opacity: generating ? 0.65 : 1 }}>
                <Icon name={generating ? "sparkle" : "payroll"}/>{generating ? "Generating…" : "Generate payroll"}
              </button>
            </div>
          )}
        </div>
      </div>

      {!generated && !generating && (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(16,185,129,0.12)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Icon name="payroll" size={26}/>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Ready to generate payroll</div>
          <div className="muted fs-sm" style={{ lineHeight: 1.6 }}>
            Select a client and pay period, then click <b style={{ color: "var(--text)" }}>Generate payroll</b> to compute salary for all {emps.length} employees of <b style={{ color: "var(--accent-bright)" }}>{client.name}</b>.
          </div>
        </div>
      )}

      {generating && (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div className="shimmer" style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Icon name="sparkle" size={26} color="#34D399"/>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Computing payroll…</div>
          <div className="muted fs-sm">Applying salary structure, deductions, and TDS for {emps.length} employees</div>
        </div>
      )}

      {generated && (
        <>
          {/* Summary KPIs */}
          <div className="grid g-cols-4" style={{ marginBottom: 14 }}>
            <div className="card kpi" style={{ background: "linear-gradient(160deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))", borderColor: "rgba(16,185,129,0.25)" }}>
              <div className="kpi-label"><Icon name="employees" size={11}/>Employees</div>
              <div className="kpi-value" style={{ fontSize: 22, color: "#34D399" }}>{emps.length}</div>
              <div className="muted fs-xs">{client.name}</div>
            </div>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="coins" size={11}/>Gross payroll</div>
              <div className="kpi-value" style={{ fontSize: 18 }}>{fmtINR(totalGross, { compact: true })}</div>
              <div className="muted fs-xs">{selMonth}</div>
            </div>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="shield" size={11}/>Total deductions</div>
              <div className="kpi-value" style={{ fontSize: 18, color: "#FCA5B0" }}>−{fmtINR(totalDed, { compact: true })}</div>
              <div className="muted fs-xs">PF + TDS + PT</div>
            </div>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="bank" size={11}/>Net disbursement</div>
              <div className="kpi-value" style={{ fontSize: 18, color: "#10B981" }}>{fmtINR(totalNet, { compact: true })}</div>
              <div className="muted fs-xs">Credit on 28th</div>
            </div>
          </div>

          {/* Breakdown card */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-head">
              <div className="card-title">Payroll summary — {client.name} · {selMonth}</div>
              <button className="btn primary sm" onClick={downloadExcel}><Icon name="download"/>Download Excel</button>
            </div>
            <div className="grid g-cols-2" style={{ gap: 20 }}>
              <div>
                <div className="fs-xs muted fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Earnings</div>
                {[
                  ["Gross salary",      totalGross],
                  ["PF (Employer 12%)", Math.round(totalPF)],
                ].map(([l, v]) => (
                  <div key={l} className="row between" style={{ padding: "5px 0", borderBottom: "1px dashed var(--inset-3)" }}>
                    <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{l}</span>
                    <span className="mono fs-sm">{fmtINR(v)}</span>
                  </div>
                ))}
                <div className="row between" style={{ paddingTop: 8, marginTop: 4, borderTop: "1px solid var(--border)" }}>
                  <span className="fw-600">Total cost to client</span>
                  <span className="fw-600 mono" style={{ color: "#34D399" }}>{fmtINR(totalGross + totalPF)}</span>
                </div>
              </div>
              <div>
                <div className="fs-xs muted fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Deductions</div>
                {[
                  ["PF (Employee 12%)", totalPF],
                  ["TDS",              payrollRows.reduce((s, r) => s + r.tds, 0)],
                  ["Professional Tax", payrollRows.reduce((s, r) => s + r.pt, 0)],
                ].map(([l, v]) => (
                  <div key={l} className="row between" style={{ padding: "5px 0", borderBottom: "1px dashed var(--inset-3)" }}>
                    <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{l}</span>
                    <span className="mono fs-sm" style={{ color: "#FCA5B0" }}>−{fmtINR(v)}</span>
                  </div>
                ))}
                <div className="row between" style={{ paddingTop: 8, marginTop: 4, borderTop: "1px solid var(--border)" }}>
                  <span className="fw-600">Net payable</span>
                  <span className="fw-600 mono" style={{ color: "#10B981" }}>{fmtINR(totalNet)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Employee payroll table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
              <div className="card-title">
                Employee-wise payroll register
                <small>{emps.length} employees · {client.name} · {selMonth}</small>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Employee</th><th>ID</th><th>Dept</th>
                    <th className="right">Gross</th><th className="right">PF</th>
                    <th className="right">TDS</th><th className="right">PT</th>
                    <th className="right">Net pay</th><th>Bank</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRows.map(r => (
                    <tr key={r.id}>
                      <td><div className="row-emp"><Avatar name={r.name}/><div className="row-emp-name">{r.name}</div></div></td>
                      <td className="mono muted">{r.id}</td>
                      <td><span className="chip" style={{ color: r.deptColor, borderColor: `${r.deptColor}40`, background: `${r.deptColor}14`, fontSize: 9.5 }}>{r.deptName}</span></td>
                      <td className="right num">{fmtINR(r.gross)}</td>
                      <td className="right num muted" style={{ fontSize: 11 }}>−{fmtINR(r.pf)}</td>
                      <td className="right num muted" style={{ fontSize: 11 }}>−{fmtINR(r.tds)}</td>
                      <td className="right num muted" style={{ fontSize: 11 }}>−{fmtINR(r.pt)}</td>
                      <td className="right num fw-600" style={{ color: "#34D399" }}>{fmtINR(r.net)}</td>
                      <td className="muted mono" style={{ fontSize: 10.5 }}>{r.bank}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "rgba(16,185,129,0.06)", borderTop: "2px solid rgba(16,185,129,0.25)" }}>
                    <td colSpan={3} style={{ padding: "8px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td>
                    <td className="right num fw-600">{fmtINR(totalGross)}</td>
                    <td className="right num fw-600" style={{ color: "#FCA5B0", fontSize: 11 }}>−{fmtINR(totalPF)}</td>
                    <td className="right num fw-600" style={{ color: "#FCA5B0", fontSize: 11 }}>−{fmtINR(payrollRows.reduce((s,r)=>s+r.tds,0))}</td>
                    <td className="right num fw-600" style={{ color: "#FCA5B0", fontSize: 11 }}>−{fmtINR(payrollRows.reduce((s,r)=>s+r.pt,0))}</td>
                    <td className="right num fw-600" style={{ color: "#10B981", fontSize: 13 }}>{fmtINR(totalNet)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="row between" style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)" }}>
              <span>Generated: Nov 25, 2025 · Source One Payroll Cloud · Atlas v2.4</span>
              <button className="btn primary sm" onClick={downloadExcel}><Icon name="download"/>Download Excel (.xlsx)</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

Object.assign(window, { Clients, TimesheetUpload, ClientPayroll });
