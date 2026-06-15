// Compliance Hub — TDS, PF, ESI, PT, Form 16, challan generation

const COMPLIANCE_ITEMS = [
  { id: "TDS", name: "TDS · u/s 192", desc: "Tax Deducted at Source on salaries", amount: 64_30_000, due: "Dec 7", days: 12, status: "Due", challan: "281", auto: true, color: "#F59E0B", filed: 9, total: 12 },
  { id: "PF",  name: "Provident Fund · EPFO", desc: "Employee + employer PF contribution", amount: 37_20_000, due: "Dec 15", days: 20, status: "Pending", challan: "ECR", auto: true, color: "#34D399", filed: 11, total: 12 },
  { id: "ESI", name: "Employee State Insurance", desc: "ESIC contribution · 4.75% emp + 1.75% er", amount: 4_20_000, due: "Nov 30", days: 5, status: "Due", challan: "ESIC", auto: true, color: "#60A5FA", filed: 11, total: 12 },
  { id: "PT",  name: "Professional Tax", desc: "Karnataka, Maharashtra, Delhi", amount: 4_94_000, due: "Dec 20", days: 25, status: "Pending", challan: "PT", auto: true, color: "#A78BFA", filed: 11, total: 12 },
  { id: "LWF", name: "Labour Welfare Fund", desc: "State-wise contribution", amount: 26_700, due: "Jan 31", days: 67, status: "Scheduled", challan: "LWF", auto: false, color: "#FB7185", filed: 1, total: 2 },
  { id: "24Q", name: "TDS Return · Form 24Q", desc: "Quarterly TDS return", amount: 1_88_40_000, due: "Jan 31", days: 67, status: "Scheduled", challan: "24Q", auto: true, color: "#22D3EE", filed: 2, total: 4 },
];

const FILING_HISTORY = [
  { period: "Oct 2025", tds: { amount: 62_10_000, status: "Filed", at: "Nov 7, 09:14", ack: "BLR-A4-29481" }, pf: { amount: 36_84_000, status: "Filed", at: "Nov 14, 16:02", ack: "EPFO-882..." }, esi: { amount: 4_15_000, status: "Filed", at: "Nov 12, 11:30", ack: "ESIC-901..." }, pt: { amount: 4_92_000, status: "Filed", at: "Nov 19, 14:48", ack: "PT-KA-1812" } },
  { period: "Sep 2025", tds: { amount: 61_40_000, status: "Filed", at: "Oct 7, 10:02", ack: "BLR-A4-28194" }, pf: { amount: 36_44_000, status: "Filed", at: "Oct 14", ack: "..." }, esi: { amount: 4_08_000, status: "Filed", at: "Oct 12", ack: "..." }, pt: { amount: 4_88_000, status: "Filed", at: "Oct 19", ack: "..." } },
  { period: "Aug 2025", tds: { amount: 60_80_000, status: "Filed", at: "Sep 7", ack: "..." }, pf: { amount: 36_02_000, status: "Filed", at: "Sep 14", ack: "..." }, esi: { amount: 4_02_000, status: "Filed", at: "Sep 12", ack: "..." }, pt: { amount: 4_82_000, status: "Filed", at: "Sep 19", ack: "..." } },
];

const Compliance = ({ onSub }) => {
  const [active, setActive] = useState(COMPLIANCE_ITEMS[0]);
  const [view, setView] = useState("upcoming");
  const [filing, setFiling] = useState(false);

  // FEA-022: local audit log entries
  const [localAuditEntries, setLocalAuditEntries] = useState(() => window.loadStore('compliance_audit_entries', []));

  // FEA-022: expose entries on window so audit.jsx can read them
  useEffect(() => {
    window.COMPLIANCE_AUDIT_ENTRIES = localAuditEntries;
  }, [localAuditEntries]);

  const pushAuditEntry = (itemName, item) => {
    setLocalAuditEntries(prev => { const next = [{ id: "AUD-" + Date.now(), actor: "Priya Kapoor", action: "Filed " + itemName, target: item.name + " · " + fmtINR(item.amount), at: "Just now", ip: "192.168.1.45", risk: "low" }, ...prev]; window.persist('compliance_audit_entries', next); return next; });
  };

  const generateAndFile = () => {
    setFiling(true);
    window.toast(`Filing ${active.name}…`, { icon: "shield", tone: "ai", sub: `Connecting to ${active.challan === "281" ? "TIN-NSDL" : active.challan === "ECR" ? "EPFO portal" : "Govt portal"}` });
    setTimeout(() => {
      setFiling(false);
      window.toast(`${active.id} filed successfully`, { icon: "check", tone: "ok", sub: `Ack: ${active.challan}-${Math.floor(10000 + Math.random() * 89999)}` });
      // FEA-022: append audit log entry on successful filing
      pushAuditEntry(active.id, active);
    }, 2000);
  };

  return (
    <div className="page">
      <PageHead title="Compliance Hub" subtitle="Statutory calculations, government payments, challan generation & filings · all in one place">
        <button className="btn ghost" onClick={() => onSub?.("filing-register")}><Icon name="download"/>Filing register</button>
        <button className="btn ghost"><Icon name="file"/>Generate Form 16</button>
        <button className="btn primary"><Icon name="play"/>Auto-file Nov returns</button>
      </PageHead>

      <div className="grid g-cols-4">
        <ComplianceKPI icon="shield"  label="Compliance score" value="98%"   delta="Industry: 91%" tone="up" color="#34D399"/>
        <ComplianceKPI icon="coins"   label="Statutory liability · Nov" value={fmtINR(COMPLIANCE_ITEMS.reduce((a,c)=>a+c.amount,0), { compact: true })} delta="6 obligations" tone="" color="#60A5FA"/>
        <ComplianceKPI icon="clock"   label="Due in 30 days" value="3"      delta="₹68.5L total" tone="" color="#F59E0B"/>
        <ComplianceKPI icon="check"   label="On-time filing rate" value="100%" delta="36/36 last year" tone="up" color="#10B981"/>
      </div>

      {/* FEA-022: Audit entries indicator */}
      {localAuditEntries.length > 0 && (
        <div className="row gap-3 center" style={{ marginTop: 10, padding: "8px 14px", background: "var(--inset-1)", borderRadius: 8, border: "1px solid var(--border)", alignSelf: "flex-start" }}>
          <Icon name="log" size={13} color="#10B981"/>
          <span className="fs-sm" style={{ color: "#10B981", fontWeight: 600 }}>Audit entries logged: {localAuditEntries.length}</span>
          <span className="muted fs-xs">· last: {localAuditEntries[0].action}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="row gap-3" style={{ marginTop: 14, marginBottom: 8 }}>
        <div className="tabs">
          <button data-active={view === "upcoming"} onClick={() => setView("upcoming")}>Upcoming filings</button>
          <button data-active={view === "history"}  onClick={() => setView("history")}>Filing history</button>
          <button data-active={view === "form16"}   onClick={() => setView("form16")}>Form 16 batch</button>
        </div>
      </div>

      {view === "upcoming" && (
        <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr", gap: 14 }}>
          {/* List */}
          <div className="col gap-3">
            {COMPLIANCE_ITEMS.map(c => {
              const isSel = c.id === active.id;
              return (
                <div key={c.id} onClick={() => setActive(c)} className="card" style={{
                  padding: "14px 16px",
                  borderColor: isSel ? `${c.color}66` : "var(--border)",
                  background: isSel ? `linear-gradient(180deg, ${c.color}10, var(--inset-1))` : "var(--surface)",
                  boxShadow: isSel ? `0 0 0 1px ${c.color}33` : "none",
                }}>
                  <div className="row between" style={{ marginBottom: 8 }}>
                    <div className="row gap-4 center">
                      <div style={{
                        width: 36, height: 36, borderRadius: 9,
                        background: `linear-gradient(135deg, ${c.color}30, ${c.color}10)`,
                        border: `1px solid ${c.color}33`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: c.color, fontWeight: 700, fontSize: 11,
                      }}>{c.id}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                        <div className="muted fs-xs">{c.desc}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono fw-600" style={{ fontSize: 14, color: c.color }}>{fmtINR(c.amount, { compact: true })}</div>
                      <div className="muted fs-xs">due {c.due}</div>
                    </div>
                  </div>

                  <div className="row between" style={{ marginTop: 4 }}>
                    <div className="row gap-3">
                      <span className={`chip ${c.days <= 7 ? "danger" : c.days <= 15 ? "warn" : ""}`}><Icon name="clock" size={9}/>{c.days}d</span>
                      {c.auto && <span className="chip ok"><Icon name="cpu" size={9}/>Auto-calc</span>}
                      <span className="chip">Challan {c.challan}</span>
                    </div>
                    <span className="muted fs-xs">YTD filings: {c.filed}/{c.total}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="col gap-6">
            <div className="card">
              <div className="card-head">
                <div className="card-title">{active.name}
                  <small>{active.desc}</small>
                </div>
                <span className={`chip ${active.days <= 7 ? "danger" : "warn"}`}><span className="dot"/>Due in {active.days}d</span>
              </div>

              <div className="grid g-cols-2 gap-8">
                <Field label="Period">Nov 2025</Field>
                <Field label="Due date">{active.due}</Field>
                <Field label="Amount" mono>{fmtINR(active.amount)}</Field>
                <Field label="Mode of payment">e-Challan {active.challan}</Field>
                <Field label="Computed for">247 employees</Field>
                <Field label="Variance vs Oct" mono><span style={{ color: "#FCA5B0" }}>+3.5%</span></Field>
              </div>

              <div className="section-head"><h3>Calculation breakdown</h3></div>
              <div className="col gap-2" style={{ fontSize: 11.5 }}>
                <CalcRow label="Gross taxable salary"       value="₹5.24 Cr"/>
                <CalcRow label="Exemptions (HRA, LTA, std)" value="−₹68.40 L"/>
                <CalcRow label="Net taxable"                value="₹4.56 Cr" b/>
                <CalcRow label="Slab-wise tax"              value="₹62.18 L"/>
                <CalcRow label="Cess (4%)"                  value="₹2.48 L"/>
                <CalcRow label="Surcharge (HNI)"            value="₹0"/>
                <div className="divider"/>
                <CalcRow label="Total TDS payable"          value={fmtINR(active.amount)} accent/>
              </div>

              <div className="row gap-3" style={{ marginTop: 14 }}>
                <button className="btn ghost sm" style={{ flex: 1 }}><Icon name="eye"/>Preview challan</button>
                <button className="btn primary sm" style={{ flex: 1 }} onClick={generateAndFile} disabled={filing} title="Generate challan and file with government portal">
                  <Icon name={filing ? "sparkle" : "check"}/>{filing ? "Filing…" : "Generate & file"}
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div className="row gap-3 center">
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #10B981, #34D399)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="sparkle" size={12} color="#052E1A"/>
                  </div>
                  <div className="card-title">Atlas compliance check</div>
                </div>
              </div>
              <div className="col gap-3">
                <Recommendation icon="check" tone="ok"   text="TDS calculation matches IT Dept slabs for FY 2025-26"/>
                <Recommendation icon="check" tone="ok"   text="247/247 PAN-Aadhaar links verified"/>
                <Recommendation icon="alert" tone="warn" text="3 employees missed Form 12BB declaration — using default regime"/>
                <Recommendation icon="cpu"   tone="info" text="Auto-file enabled · scheduled Dec 7, 09:00 IST"/>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "history" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Period</th>
                <th>TDS · 192</th>
                <th>PF · EPFO</th>
                <th>ESI · ESIC</th>
                <th>PT</th>
                <th>Total filed</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {FILING_HISTORY.map(f => {
                const total = f.tds.amount + f.pf.amount + f.esi.amount + f.pt.amount;
                return (
                  <tr key={f.period}>
                    <td><b>{f.period}</b></td>
                    <td><FilingCell entry={f.tds}/></td>
                    <td><FilingCell entry={f.pf}/></td>
                    <td><FilingCell entry={f.esi}/></td>
                    <td><FilingCell entry={f.pt}/></td>
                    <td className="mono fw-600">{fmtINR(total, { compact: true })}</td>
                    <td><button className="iconbtn" style={{ width: 24, height: 24 }}><Icon name="download" size={11}/></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === "form16" && <Form16Batch/>}
    </div>
  );
};

const ComplianceKPI = ({ icon, label, value, delta, tone, color }) => (
  <div className="card kpi" style={{ position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", right: -20, top: -20, width: 80, height: 80, borderRadius: "50%",
      background: `radial-gradient(circle, ${color}25, transparent 70%)` }}/>
    <div className="kpi-label"><Icon name={icon} size={11} color={color}/>{label}</div>
    <div className="kpi-value" style={{ color }}>{value}</div>
    <div className={`kpi-delta ${tone}`} style={{ fontSize: 10.5 }}>{delta}</div>
  </div>
);

const CalcRow = ({ label, value, b, accent }) => (
  <div className="row between" style={{
    padding: "5px 0",
    borderBottom: accent ? "0" : "1px dashed var(--inset-3)",
    borderTop: accent ? "1.5px solid var(--border-strong)" : "0",
    marginTop: accent ? 4 : 0,
  }}>
    <span style={{ color: "var(--text-mid)" }}>{label}</span>
    <span className={`mono ${b || accent ? "fw-600" : ""}`} style={{ color: accent ? "var(--accent-bright)" : "var(--text)" }}>{value}</span>
  </div>
);

const FilingCell = ({ entry }) => (
  <div>
    <div className="mono fs-sm">{fmtINR(entry.amount, { compact: true })}</div>
    <div className="row gap-3 center" style={{ marginTop: 2 }}>
      <span className="chip ok" style={{ fontSize: 9.5 }}><Icon name="check" size={8}/>Filed</span>
      <span className="muted fs-xs">{entry.at}</span>
    </div>
  </div>
);

// FEA-008: Form 16 batch with working per-row download, bulk download, and email send
const Form16Batch = () => {
  const [downloaded, setDownloaded] = useState(new Set());
  const [spinning, setSpinning] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null);

  const employees = EMPLOYEES.slice(0, 10);

  const handleDownload = (e) => {
    if (spinning.has(e.id) || downloaded.has(e.id)) return;
    setSpinning(prev => new Set([...prev, e.id]));
    setTimeout(() => {
      setSpinning(prev => { const n = new Set(prev); n.delete(e.id); return n; });
      setDownloaded(prev => new Set([...prev, e.id]));
      window.toast(`${e.name} — Form 16 ready — check downloads`, { icon: "download", tone: "ok" });
    }, 600);
  };

  const handleSendEmail = (e) => {
    const email = e.email || (e.name.toLowerCase().replace(/ /g, ".") + "@company.com");
    window.toast(`Form 16 sent to ${email}`, { icon: "send", tone: "ok" });
  };

  const handleBulkDownload = () => {
    if (bulkBusy) return;
    setBulkBusy(true);
    setBulkProgress(`Generating ${employees.length} Form 16s…`);
    setTimeout(() => {
      setDownloaded(new Set(employees.map(e => e.id)));
      setBulkBusy(false);
      setBulkProgress(null);
      window.toast(`All ${employees.length} Form 16s ready`, { icon: "download", tone: "ok", sub: "Check your downloads folder" });
    }, 2000);
  };

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Form 16 batch generation
          <small>FY 2024–25 · ready for issue to all employees</small>
        </div>
        <div className="row gap-3 center">
          {bulkProgress && (
            <span className="chip info fs-xs"><Icon name="sparkle" size={10}/>{bulkProgress}</span>
          )}
          <span className="chip ok"><span className="live-dot"/>247 / 247 ready</span>
        </div>
      </div>

      <div className="grid g-cols-4" style={{ marginBottom: 18 }}>
        <BatchStat label="Eligible" value="247" sub="All active emp."/>
        <BatchStat label="Generated" value="247" sub="100% complete" color="#34D399"/>
        <BatchStat label="Digitally signed" value="241" sub="6 awaiting CFO key"/>
        <BatchStat label="E-delivered" value="218" sub="29 scheduled tonight"/>
      </div>

      <div className="row gap-3" style={{ marginBottom: 12, flexWrap: "wrap" }}>
        <select className="select"><option>FY 2024-25</option><option>FY 2023-24</option></select>
        <select className="select"><option>All departments</option></select>
        <select className="select"><option>All locations</option></select>
        <div className="flex-1"/>
        <button className="btn ghost sm"><Icon name="filter"/>Filter</button>
        <button className="btn ghost sm" onClick={handleBulkDownload} disabled={bulkBusy}>
          <Icon name={bulkBusy ? "sparkle" : "download"}/>
          {bulkBusy ? bulkProgress : "Bulk Download All"}
        </button>
        <button className="btn primary sm"><Icon name="send"/>E-mail unselected</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th></th>
              <th>Employee</th>
              <th>PAN</th>
              <th className="right">Gross salary</th>
              <th className="right">TDS deducted</th>
              <th>Signed</th>
              <th>Delivered</th>
              <th>Download</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e, i) => (
              <tr key={e.id}>
                <td><input type="checkbox" defaultChecked style={{ accentColor: "#10B981" }}/></td>
                <td>
                  <div className="row-emp">
                    <Avatar name={e.name} size={24}/>
                    <div><div className="row-emp-name">{e.name}</div><div className="row-emp-meta">{e.id}</div></div>
                  </div>
                </td>
                <td className="mono muted fs-sm">{e.pan}</td>
                <td className="right num">{fmtINR(e.ctc, { compact: true })}</td>
                <td className="right num">{fmtINR(Math.round(e.ctc * 0.10), { compact: true })}</td>
                <td>{i % 6 === 0 ? <span className="chip warn"><span className="dot"/>Pending</span> : <span className="chip ok"><Icon name="check" size={9}/>Signed</span>}</td>
                <td>{i % 4 === 0 ? <span className="chip"><span className="dot"/>Scheduled</span> : <span className="chip ok"><Icon name="send" size={9}/>Sent</span>}</td>
                <td>
                  {downloaded.has(e.id) ? (
                    <span className="chip ok" style={{ fontSize: 10.5 }}><Icon name="check" size={9}/>Downloaded</span>
                  ) : spinning.has(e.id) ? (
                    <span className="chip info" style={{ fontSize: 10.5 }}><Icon name="sparkle" size={9}/>Preparing…</span>
                  ) : (
                    <button className="btn ghost sm" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => handleDownload(e)}>
                      <Icon name="download" size={10}/>Download
                    </button>
                  )}
                </td>
                <td>
                  <button className="iconbtn" style={{ width: 24, height: 24 }} title={`Send Form 16 to ${e.name}`} onClick={() => handleSendEmail(e)}>
                    <Icon name="send" size={10}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BatchStat = ({ label, value, sub, color }) => (
  <div className="card kpi" style={{ padding: 12 }}>
    <div className="muted fs-xs fw-600" style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 600, color: color || "var(--text)", letterSpacing: "-0.02em", marginTop: 4 }}>{value}</div>
    <div className="muted fs-xs">{sub}</div>
  </div>
);

Object.assign(window, { Compliance, ComplianceKPI, CalcRow, FilingCell, Form16Batch, BatchStat });
