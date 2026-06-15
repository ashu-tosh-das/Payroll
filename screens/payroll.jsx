// Payroll Run — client-integrated approval workflow + per-client breakdown


// Pre-compute per-client payroll figures (deterministic, from EMPLOYEES assignment in data.jsx)
const CLIENT_PAYROLL_DATA = CLIENTS.filter(c => c.status === "Active").map(c => {
  const emps = EMPLOYEES.filter(e => e.clientId === c.id);
  const rows = emps.map(e => {
    const gross = Math.round(e.base * (1 + Math.sin(e.base) * 0.05));
    const ded   = Math.round(gross * 0.18);
    return { emp: e, gross, ded, net: gross - ded };
  });
  const totalGross = rows.reduce((a, p) => a + p.gross, 0);
  const totalDed   = rows.reduce((a, p) => a + p.ded,   0);
  return { client: c, rows, totalGross, totalDed, totalNet: totalGross - totalDed };
});

// ── Pre-flight shimmer animation style ──────────────────────────
const PREFLIGHT_SHIMMER_STYLE = `
@keyframes preflightShimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
`;

const Payroll = ({ onNav }) => {
  const [selectedRun,       setSelectedRun]       = useState(PAYROLL_RUNS[0]);
  const [steps,             setSteps]             = useState(() => window.loadStore('APPROVAL_STEPS', APPROVAL_STEPS));
  const [isApproving,       setIsApproving]       = useState(false);
  const [selectedClient,    setSelectedClient]    = useState(null); // null = All Clients
  const [generatedClients,  setGeneratedClients]  = useState(() => window.loadStore('generated_clients_nov', { "CLT-001": true, "CLT-002": true }));
  const [generatingClient,  setGeneratingClient]  = useState(null);

  // STUB-003: Payroll register filters
  const [regFilter,        setRegFilter]        = useState("all");   // "all" | "lop" | "normal"
  const [regDeptFilter,    setRegDeptFilter]    = useState("all");   // "all" | dept name
  const [showRegFilters,   setShowRegFilters]   = useState(false);

  // FEA-037: Pre-flight state
  const [preflightDone,     setPreflightDone]     = useState(() => !!window.loadStore('preflight_done_nov', false));
  const [preflightRunning,  setPreflightRunning]  = useState(false);
  const [preflightResults,  setPreflightResults]  = useState(() => window.loadStore('preflight_results_nov', []));

  // WIRE-004: IT Declarations state
  const [itDeclarations, setItDeclarations] = React.useState(() => window.IT_DECLARATIONS || (typeof IT_DECLARATIONS !== "undefined" ? IT_DECLARATIONS : []));
  useEffect(() => { setItDeclarations(window.IT_DECLARATIONS || []); }, []);

  // FEA-020: Reimbursement totals
  const pendingReimb = (window.REIMBURSEMENT_STORE || []).filter(r => r.status === "approved" && !r.payrollIncluded);
  const reimbTotal   = pendingReimb.reduce((s, r) => s + r.amount, 0);

  // WIRE-004: IT Declarations TDS adjustment
  const approvedDecls   = itDeclarations.filter(d => d.status === "approved" || d.status === "pending_approval");
  const tdsSaving       = approvedDecls.reduce((s, d) => s + (d.saving || 0), 0);
  const revisedTDSNote  = approvedDecls.length > 0
    ? `${approvedDecls.length} IT declaration(s) applied · ₹${tdsSaving.toLocaleString()} TDS saved`
    : null;

  // FEA-021: LOP deduction
  const lopEmployees  = EMPLOYEES.filter((e, i) => i % 7 === 0).slice(0, 3);
  const lopDeduction  = lopEmployees.length * 2300;
  const lopEmpIds     = new Set(lopEmployees.map(e => e.id));

  // ── Figures for current view ────────────────────────────────
  const viewData = selectedClient
    ? CLIENT_PAYROLL_DATA.find(d => d.client.id === selectedClient.id)
    : {
        rows:       CLIENT_PAYROLL_DATA.flatMap(d => d.rows),
        totalGross: CLIENT_PAYROLL_DATA.reduce((a, d) => a + d.totalGross, 0),
        totalDed:   CLIENT_PAYROLL_DATA.reduce((a, d) => a + d.totalDed,   0),
        totalNet:   CLIENT_PAYROLL_DATA.reduce((a, d) => a + d.totalNet,   0),
      };

  // Build per-view breakdown lines (scale global PAYROLL_BREAKDOWN when client selected)
  const bkScale = selectedClient
    ? (viewData.rows.length / Math.max(EMPLOYEES.length, 1))
    : 1;
  const breakdown = PAYROLL_BREAKDOWN.map(b => ({
    ...b,
    amount: Math.round(b.amount * bkScale),
  }));
  const bkEarnings    = breakdown.filter(b => b.amount >= 0);
  const bkDeductions  = breakdown.filter(b => b.amount < 0);
  const bkTotalEarn   = bkEarnings.reduce((a, b) => a + b.amount, 0);
  const bkTotalDed    = bkDeductions.reduce((a, b) => a + Math.abs(b.amount), 0);

  const allGenerated = CLIENT_PAYROLL_DATA.every(d => generatedClients[d.client.id]);

  // FEA-037: Pre-flight check results (hardcoded but realistic)
  const buildPreflightResults = () => [
    { check: "New joiners in payroll",  status: "pass", detail: "4 new joiners found · all mapped to payroll" },
    { check: "Employees on notice",     status: "warn", detail: "2 employees on notice · F&F pending" },
    { check: "Anomalies unresolved",    status: "warn", detail: "3 high anomalies unreviewed" },
    { check: "Compliance deadlines",    status: "pass", detail: "PF · ESI · TDS all current" },
    { check: "Bank account coverage",   status: "pass", detail: "247/247 employees have valid bank details" },
    {
      check: "Reimbursement claims",
      status: "info",
      detail: reimbTotal > 0
        ? `${pendingReimb.length} approved claims ₹${fmtINR(reimbTotal)} included`
        : "No pending claims",
    },
  ];

  // FEA-037: Auto-trigger pre-flight after 1s when in review step (step 1)
  useEffect(() => {
    if (selectedRun.status === "Paid") return;
    if (preflightDone || preflightRunning) return;
    const timer = setTimeout(() => {
      setPreflightRunning(true);
      setTimeout(() => {
        const results = buildPreflightResults();
        window.persist('preflight_results_nov', results);
        setPreflightResults(results);
        window.persist('preflight_done_nov', true);
        setPreflightDone(true);
        setPreflightRunning(false);
      }, 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedRun]);

  const preflightWarns = preflightResults.filter(r => r.status === "warn");

  // ── Actions ─────────────────────────────────────────────────
  const handleGenerate = (clientId) => {
    setGeneratingClient(clientId);
    setTimeout(() => {
      setGeneratedClients(prev => {
        const next = { ...prev, [clientId]: true };
        window.persist('generated_clients_nov', next);
        return next;
      });
      setGeneratingClient(null);
      const d = CLIENT_PAYROLL_DATA.find(d => d.client.id === clientId);
      window.toast(`${d.client.name} payroll generated`, {
        icon: "check", tone: "ok",
        sub: `${d.rows.length} employees · ${fmtINR(d.totalNet, { compact: true })} net`,
      });
    }, 1400);
  };

  const handleGenerateAll = () => {
    const pending = CLIENT_PAYROLL_DATA.filter(d => !generatedClients[d.client.id]);
    if (!pending.length) {
      window.toast("All clients already generated", { icon: "check", tone: "ok" });
      return;
    }
    pending.forEach((d, i) => {
      setTimeout(() => {
        setGeneratedClients(prev => {
          const next = { ...prev, [d.client.id]: true };
          window.persist('generated_clients_nov', next);
          return next;
        });
        window.toast(`${d.client.name} payroll generated`, { icon: "check", tone: "ok" });
      }, 900 * (i + 1));
    });
  };

  const advanceApproval = () => {
    const activeIdx = steps.findIndex(s => s.status === "active");
    if (activeIdx === -1) {
      window.toast("All stages already complete", { icon: "check", tone: "ok" });
      return;
    }
    setIsApproving(true);
    setTimeout(() => {
      setSteps(prev => {
        const next = prev.map((s, i) => {
          if (i === activeIdx)     return { ...s, status: "done", by: "Priya Kapoor", at: "Just now" };
          if (i === activeIdx + 1) return { ...s, status: "active" };
          return s;
        });
        window.persist('APPROVAL_STEPS', next);
        return next;
      });
      // FEA-020: Mark reimbursements as included after approval
      pendingReimb.forEach(r => r.payrollIncluded = true);
      window.toast(`Stage ${activeIdx + 1} approved — ${steps[activeIdx].name}`, {
        icon: "check", tone: "ok",
        sub: activeIdx + 1 < steps.length
          ? `Next: ${steps[activeIdx + 1]?.name}`
          : "Bank disbursement scheduled",
      });
      setIsApproving(false);
    }, 700);
  };

  const isCurrentRunActive = selectedRun.status !== "Paid";

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="page">
      {/* Inject shimmer keyframe */}
      <style>{PREFLIGHT_SHIMMER_STYLE}</style>

      <PageHead
        title={selectedClient ? `Payroll Run · ${selectedClient.name}` : "Payroll Run"}
        subtitle={selectedClient
          ? `${viewData.rows.length} employees · ${selectedClient.location} · Since ${selectedClient.since}`
          : `Process and disburse monthly payroll across ${CLIENT_PAYROLL_DATA.length} active clients`}
      >
        <button className="btn ghost"
          onClick={() => window.appSub?.("timesheet-upload", { clientId: selectedClient?.id })}>
          <Icon name="upload"/>Upload attendance
        </button>
        <button className="btn ghost" onClick={() => {
          window.toast("Payroll register exported", { icon: "download", tone: "ok", sub: "Nov_2025_PayrollRegister_247emp.xlsx · 284 KB" });
        }}><Icon name="download"/>Export register</button>
        {!selectedClient
          ? (
            <button className="btn primary" onClick={handleGenerateAll} disabled={allGenerated}
              style={{ opacity: allGenerated ? 0.65 : 1 }}>
              <Icon name={allGenerated ? "check" : "play"}/>
              {allGenerated ? "All Clients Generated" : "Generate All Clients"}
            </button>
          ) : (
            <button className="btn primary" onClick={advanceApproval}
              disabled={isApproving || (isCurrentRunActive && !preflightDone)}
              style={{ opacity: (isApproving || (isCurrentRunActive && !preflightDone)) ? 0.65 : 1 }}>
              <Icon name={isApproving ? "sparkle" : "check"}/>
              {isApproving ? "Approving…" : `Approve ${selectedRun.period.split(" ")[0]} run`}
            </button>
          )
        }
      </PageHead>

      {/* ── Run selector ──────────────────────────────────────── */}
      <div className="row gap-3" style={{ overflowX: "auto", paddingBottom: 10, paddingTop: 8, alignItems: "flex-start" }}>
        {PAYROLL_RUNS.map(r => {
          const isSel = r.period === selectedRun.period;
          return (
            <div key={r.period} onClick={() => setSelectedRun(r)} style={{
              flexShrink: 0, padding: "10px 14px", borderRadius: 10, cursor: "default",
              width: 164, height: 90, boxSizing: "border-box",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              background: isSel
                ? "linear-gradient(180deg, rgba(16,185,129,0.14), rgba(16,185,129,0.04))"
                : "var(--inset-2)",
              border: `1px solid ${isSel ? "rgba(16,185,129,0.35)" : "var(--border)"}`,
              boxShadow: isSel ? "0 4px 24px rgba(16,185,129,0.22)" : "none",
              transform: isSel ? "scale(1.06)" : "scale(1)",
              transformOrigin: "top center",
              transition: "transform 160ms ease, box-shadow 160ms ease",
              zIndex: isSel ? 1 : 0,
              position: "relative",
            }}>
              <div className="row between center">
                <div className="fw-600" style={{ fontSize: 12.5 }}>{r.period}</div>
                <StatusChip status={r.status}/>
              </div>
              <div className="row between">
                <span className="mono" style={{ fontSize: 11 }}>{fmtINR(r.total, { compact: true })}</span>
                <span className="muted fs-xs">{r.processed} emp</span>
              </div>
              <div style={{ height: 20 }}>
                {r.anomalies > 0 && (
                  <div className="chip warn" style={{ fontSize: 9.5 }}>
                    <Icon name="alert" size={9}/>{r.anomalies} flag{r.anomalies > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Client selector tabs ──────────────────────────────── */}
      <div className="row gap-2" style={{ marginTop: 12, flexWrap: "wrap" }}>
        {/* All Clients tab */}
        <button onClick={() => setSelectedClient(null)} style={{
          padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
          background: !selectedClient ? "rgba(16,185,129,0.14)" : "var(--inset-2)",
          border: `1px solid ${!selectedClient ? "rgba(16,185,129,0.40)" : "var(--border)"}`,
          color: !selectedClient ? "#34D399" : "var(--text-mid)",
          cursor: "default", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Icon name="employees" size={11}/>All Clients
          <span style={{
            padding: "1px 6px", borderRadius: 4, fontSize: 9.5,
            background: "rgba(255,255,255,0.07)", color: "var(--text-muted)",
          }}>
            {CLIENT_PAYROLL_DATA.length}
          </span>
        </button>

        {/* Per-client tabs */}
        {CLIENT_PAYROLL_DATA.map(d => {
          const isSel      = selectedClient?.id === d.client.id;
          const isGen      = generatedClients[d.client.id];
          const isGenning  = generatingClient === d.client.id;
          return (
            <button key={d.client.id} onClick={() => setSelectedClient(d.client)} style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: isSel ? "rgba(16,185,129,0.14)" : "var(--inset-2)",
              border: `1px solid ${isSel ? "rgba(16,185,129,0.40)" : "var(--border)"}`,
              color: isSel ? "#34D399" : "var(--text-mid)",
              cursor: "default", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {d.client.code}
              <span style={{
                padding: "1px 6px", borderRadius: 4, fontSize: 9.5,
                background: isGenning
                  ? "rgba(96,165,250,0.15)"
                  : isGen
                    ? "rgba(16,185,129,0.15)"
                    : "rgba(245,158,11,0.12)",
                color: isGenning ? "#93C5FD" : isGen ? "#34D399" : "#F59E0B",
                border: `1px solid ${isGenning ? "rgba(96,165,250,0.3)" : isGen ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
              }}>
                {isGenning ? "Generating…" : isGen ? "Generated" : "Pending"}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── All Clients: status overview grid ────────────────── */}
      {!selectedClient && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-head">
            <div className="card-title">Client payroll status · {selectedRun.period}
              <small>
                {CLIENT_PAYROLL_DATA.filter(d => generatedClients[d.client.id]).length} of {CLIENT_PAYROLL_DATA.length} generated
              </small>
            </div>
            {allGenerated
              ? <span className="chip ok"><Icon name="check" size={10}/>All clients ready</span>
              : <span className="chip warn">
                  <Icon name="alert" size={10}/>
                  {CLIENT_PAYROLL_DATA.filter(d => !generatedClients[d.client.id]).length} pending
                </span>
            }
          </div>

          <div className="grid g-cols-4" style={{ gap: 10 }}>
            {CLIENT_PAYROLL_DATA.map(d => {
              const isGen     = generatedClients[d.client.id];
              const isGenning = generatingClient === d.client.id;
              return (
                <div key={d.client.id} style={{
                  padding: "12px 14px", borderRadius: 10,
                  background: isGen
                    ? "linear-gradient(180deg, rgba(16,185,129,0.10), rgba(16,185,129,0.03))"
                    : "var(--inset-2)",
                  border: `1px solid ${isGen ? "rgba(16,185,129,0.28)" : "var(--border)"}`,
                }}>
                  <div className="row between center" style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 12.5 }}>{d.client.code}</div>
                    <span style={{
                      padding: "2px 7px", borderRadius: 4, fontSize: 9.5, fontWeight: 500,
                      background: isGenning
                        ? "rgba(96,165,250,0.15)"
                        : isGen
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(245,158,11,0.10)",
                      color: isGenning ? "#93C5FD" : isGen ? "#34D399" : "#F59E0B",
                    }}>
                      {isGenning ? "Generating…" : isGen ? "Generated" : "Pending"}
                    </span>
                  </div>
                  <div className="fs-xs muted" style={{ marginBottom: 10, lineHeight: 1.4 }}>
                    {d.client.name}
                  </div>
                  <div className="col gap-2" style={{ fontSize: 11 }}>
                    <div className="row between">
                      <span className="muted">Employees</span>
                      <span className="fw-600">{d.rows.length}</span>
                    </div>
                    <div className="row between">
                      <span className="muted">Gross</span>
                      <span className="mono">{fmtINR(d.totalGross, { compact: true })}</span>
                    </div>
                    <div className="row between">
                      <span className="muted">Deductions</span>
                      <span className="mono" style={{ color: "#FCA5B0" }}>−{fmtINR(d.totalDed, { compact: true })}</span>
                    </div>
                    <div className="row between">
                      <span className="muted">Net Pay</span>
                      <span className="mono fw-600" style={{ color: "var(--accent-bright)" }}>
                        {fmtINR(d.totalNet, { compact: true })}
                      </span>
                    </div>
                  </div>
                  {!isGen
                    ? (
                      <button className="btn primary sm"
                        style={{ width: "100%", marginTop: 10 }}
                        onClick={() => handleGenerate(d.client.id)}
                        disabled={!!generatingClient}
                      >
                        <Icon name={isGenning ? "sparkle" : "play"} size={10}/>
                        {isGenning ? "Generating…" : "Generate"}
                      </button>
                    ) : (
                      <div style={{ marginTop: 10, textAlign: "right" }}>
                        <button className="btn ghost sm" onClick={() => setSelectedClient(d.client)}>
                          View details<Icon name="arrowRight" size={9}/>
                        </button>
                      </div>
                    )
                  }
                </div>
              );
            })}
          </div>

          {/* Consolidated totals footer */}
          <div style={{
            marginTop: 12, padding: "12px 16px", borderRadius: 10,
            background: "var(--inset-2)", border: "1px solid var(--border)",
          }}>
            <div className="row between center">
              <div className="row gap-4 center">
                <div style={{ fontSize: 12, fontWeight: 600 }}>Consolidated · All Clients</div>
                <span className="chip" style={{ fontSize: 9.5 }}>
                  {CLIENT_PAYROLL_DATA.reduce((a, d) => a + d.rows.length, 0)} employees
                </span>
              </div>
              <div className="row gap-8">
                <div style={{ textAlign: "right" }}>
                  <div className="fs-xs muted">Total Gross</div>
                  <div className="mono fw-600" style={{ fontSize: 13 }}>
                    {fmtINR(CLIENT_PAYROLL_DATA.reduce((a, d) => a + d.totalGross, 0), { compact: true })}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="fs-xs muted">Total Deductions</div>
                  <div className="mono" style={{ fontSize: 13, color: "#FCA5B0" }}>
                    −{fmtINR(CLIENT_PAYROLL_DATA.reduce((a, d) => a + d.totalDed, 0), { compact: true })}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="fs-xs muted">Total Net Pay</div>
                  <div className="mono fw-600" style={{ fontSize: 15, color: "var(--accent-bright)" }}>
                    {fmtINR(CLIENT_PAYROLL_DATA.reduce((a, d) => a + d.totalNet, 0), { compact: true })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Single client: header info strip ─────────────────── */}
      {selectedClient && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="row between center">
            <div className="row gap-5 center">
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "linear-gradient(135deg, rgba(16,185,129,0.22), rgba(52,211,153,0.08))",
                border: "1px solid rgba(16,185,129,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#34D399",
              }}>
                {selectedClient.code.slice(0, 3)}
              </div>
              <div>
                <div className="fw-600" style={{ fontSize: 13 }}>{selectedClient.name}</div>
                <div className="fs-xs muted">
                  {selectedClient.industry} · {selectedClient.location} · Client since {selectedClient.since}
                </div>
              </div>
            </div>
            <div className="row gap-8 center">
              <div style={{ textAlign: "right" }}>
                <div className="fs-xs muted">Employees</div>
                <div className="fw-600">{viewData.rows.length}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="fs-xs muted">Gross</div>
                <div className="mono fw-600">{fmtINR(viewData.totalGross, { compact: true })}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="fs-xs muted">Deductions</div>
                <div className="mono" style={{ color: "#FCA5B0" }}>
                  −{fmtINR(viewData.totalDed, { compact: true })}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="fs-xs muted">Net Pay</div>
                <div className="mono fw-600" style={{ color: "var(--accent-bright)", fontSize: 15 }}>
                  {fmtINR(viewData.totalNet, { compact: true })}
                </div>
              </div>
              <div>
                {!generatedClients[selectedClient.id]
                  ? (
                    <button className="btn primary sm"
                      onClick={() => handleGenerate(selectedClient.id)}
                      disabled={generatingClient === selectedClient.id}
                    >
                      <Icon name={generatingClient === selectedClient.id ? "sparkle" : "play"} size={10}/>
                      {generatingClient === selectedClient.id ? "Generating…" : "Generate Payroll"}
                    </button>
                  ) : (
                    <span className="chip ok"><Icon name="check" size={10}/>Generated</span>
                  )
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FEA-037: Pre-flight check card ───────────────────────────── */}
      {isCurrentRunActive && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-head">
            <div className="card-title">
              <Icon name="shield"/>Atlas pre-flight check
              <small>Automated validation before payroll approval</small>
            </div>
            {preflightDone && preflightWarns.length > 0 && (
              <span className="chip warn">
                <Icon name="alert" size={10}/>{preflightWarns.length} warning{preflightWarns.length > 1 ? "s" : ""} — review before approving
              </span>
            )}
            {preflightDone && preflightWarns.length === 0 && (
              <span className="chip ok"><Icon name="check" size={10}/>All checks passed</span>
            )}
          </div>

          {preflightRunning && (
            <div style={{ padding: "14px 0" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", borderRadius: 10,
                background: "var(--inset-2)", border: "1px solid var(--border)",
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: "linear-gradient(90deg, rgba(96,165,250,0.2) 25%, rgba(96,165,250,0.5) 50%, rgba(96,165,250,0.2) 75%)",
                  backgroundSize: "400px 100%",
                  animation: "preflightShimmer 1.4s infinite linear",
                  flexShrink: 0,
                }}/>
                <span style={{ fontSize: 12.5, color: "var(--text-mid)" }}>Atlas pre-flight check running…</span>
                <div style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: "linear-gradient(90deg, rgba(96,165,250,0.2) 25%, rgba(96,165,250,0.55) 50%, rgba(96,165,250,0.2) 75%)",
                  backgroundSize: "400px 100%",
                  animation: "preflightShimmer 1.4s infinite linear",
                }}/>
              </div>
              <div className="col gap-2" style={{ marginTop: 8 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    height: 28, borderRadius: 6,
                    background: "linear-gradient(90deg, var(--inset-2) 25%, var(--inset-3) 50%, var(--inset-2) 75%)",
                    backgroundSize: "400px 100%",
                    animation: "preflightShimmer 1.4s infinite linear",
                    animationDelay: `${i * 0.1}s`,
                  }}/>
                ))}
              </div>
            </div>
          )}

          {preflightDone && (
            <div className="col gap-2" style={{ marginTop: 4 }}>
              {preflightResults.map((r, i) => (
                <PreflightRow key={i} result={r}/>
              ))}
              {preflightWarns.length > 0 && (
                <div style={{
                  marginTop: 8, padding: "10px 14px", borderRadius: 8,
                  background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.28)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 12, color: "#F59E0B" }}>
                    <Icon name="alert" size={12}/> {preflightWarns.length} warning{preflightWarns.length > 1 ? "s" : ""} — review before approving
                  </span>
                  <button className="btn ghost sm" onClick={advanceApproval}
                    disabled={isApproving}>
                    Approve anyway
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── FEA-021: LOP callout card ─────────────────────────── */}
      {lopDeduction > 0 && isCurrentRunActive && (
        <div style={{
          marginTop: 10, padding: "12px 16px", borderRadius: 10,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.28)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Icon name="alert" size={14}/>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#FCA5A5" }}>
              {lopEmployees.length} employees have leave shortfall — LOP applied
            </span>
            <span className="muted fs-xs" style={{ marginLeft: 10 }}>
              Total deduction: {fmtINR(lopDeduction)} ({lopEmployees.length} × ₹2,300/day)
            </span>
          </div>
          <span className="chip danger" style={{ fontSize: 10 }}>
            {lopEmployees.length} employees
          </span>
        </div>
      )}

      {/* ── WIRE-004: IT Declarations panel ──────────────────── */}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-head">
          <div className="card-title">
            <Icon name="shield"/>IT Declarations
            <small>Employee tax-saving declarations affecting TDS computation</small>
          </div>
          {approvedDecls.length > 0 && (
            <span className="chip info">
              <Icon name="shield" size={10}/>{approvedDecls.length} declaration{approvedDecls.length > 1 ? "s" : ""} · ₹{tdsSaving.toLocaleString()} TDS saved
            </span>
          )}
        </div>
        {itDeclarations.length === 0 ? (
          <div className="muted fs-sm" style={{ padding: "12px 0" }}>No IT declarations submitted for this period.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>FY</th>
                  <th>Submitted</th>
                  <th className="right">Old TDS</th>
                  <th className="right">New TDS</th>
                  <th className="right">Saving</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {itDeclarations.map((d, i) => (
                  <tr key={d.id || i}>
                    <td>
                      <div className="row-emp">
                        <Avatar name={d.employeeName || d.employee || "—"}/>
                        <div>
                          <div className="row-emp-name">{d.employeeName || d.employee || "—"}</div>
                          <div className="row-emp-meta">{d.employeeId || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="mono" style={{ fontSize: 11.5 }}>{d.fy || d.financialYear || "—"}</td>
                    <td className="muted fs-xs">{d.submittedOn || d.submitted || "—"}</td>
                    <td className="right num">{d.oldTDS != null ? fmtINR(d.oldTDS) : "—"}</td>
                    <td className="right num" style={{ color: "#34D399" }}>{d.newTDS != null ? fmtINR(d.newTDS) : "—"}</td>
                    <td className="right num" style={{ color: "#34D399", fontWeight: 600 }}>
                      {d.saving != null ? `₹${d.saving.toLocaleString()}` : "—"}
                    </td>
                    <td>
                      {d.status === "approved"
                        ? <span className="chip ok"><Icon name="check" size={10}/>Approved</span>
                        : d.status === "pending_approval"
                          ? <span className="chip warn"><Icon name="clock" size={10}/>Pending</span>
                          : d.status === "rejected"
                            ? <span className="chip danger"><Icon name="x" size={10}/>Rejected</span>
                            : <span className="chip">{d.status || "—"}</span>
                      }
                    </td>
                    <td>
                      {d.status === "pending_approval" && (
                        <button className="btn ghost sm" onClick={() => {
                          const updated = itDeclarations.map((x, j) =>
                            j === i ? { ...x, status: "approved" } : x
                          );
                          setItDeclarations(updated);
                          window.persist('IT_DECLARATIONS', updated);
                          if (window.IT_DECLARATIONS) {
                            const wi = window.IT_DECLARATIONS.findIndex((x) => (x.id || x) === (d.id || d));
                            if (wi !== -1) window.IT_DECLARATIONS[wi] = { ...window.IT_DECLARATIONS[wi], status: "approved" };
                          }
                          window.toast("IT Declaration approved", { icon: "shield", tone: "ok",
                            sub: `${d.employeeName || d.employee || ""} · ₹${(d.saving || 0).toLocaleString()} TDS saved` });
                        }}>
                          <Icon name="check" size={10}/>Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Approval workflow ─────────────────────────────────── */}
      <div className="card" style={{ marginTop: 14 }}>
        {selectedRun.status === "Paid" ? (
          <>
            <div className="card-head">
              <div className="card-title">{selectedRun.period} approval workflow
                <small>All 6 stages complete · disbursed via HDFC PayConnect</small>
              </div>
              <div className="row gap-3">
                <span className="chip ok"><Icon name="check" size={10}/>Settled</span>
                <span className="chip">Paid {selectedRun.due}</span>
              </div>
            </div>
            <ApprovalRow steps={steps.map(s => ({ ...s, status: "done" }))}/>
          </>
        ) : (
          <>
            <div className="card-head">
              <div className="card-title">{selectedRun.period} approval workflow
                <small>
                  Stage {steps.filter(s => s.status === "done").length + 1} of {steps.length}
                  {selectedClient ? ` · ${selectedClient.name}` : ""} · {selectedRun.status}
                </small>
              </div>
              <div className="row gap-3">
                <span className="chip">Cut-off: Nov 22</span>
                <span className="chip">Pay date: {selectedRun.due}</span>
              </div>
            </div>
            <ApprovalRow steps={steps}/>
            <div className="row gap-3" style={{ marginTop: 12, justifyContent: "flex-end" }}>
              <button className="btn ghost sm" onClick={() => onNav?.("anomalies")}>
                <Icon name="alert"/>View 3 anomalies
              </button>
              <button className="btn primary sm" onClick={advanceApproval}
                disabled={isApproving || !preflightDone}
                style={{ opacity: (isApproving || !preflightDone) ? 0.65 : 1 }}>
                <Icon name={isApproving ? "sparkle" : "check"}/>
                {isApproving ? "Approving…" : preflightDone ? "Approve stage" : "Pre-flight pending…"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Cost breakdown + run health ───────────────────────── */}
      <div className="grid g-cols-3" style={{ marginTop: 12 }}>
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-head">
            <div className="card-title">
              {selectedClient ? `${selectedClient.name} · cost breakdown` : "Cost breakdown · all clients"}
              <small>Earnings, employer contributions & deductions</small>
            </div>
            <div className="tabs">
              <button data-active="true">Summary</button>
              <button onClick={() => window.toast("Department breakdown", { icon: "chart", tone: "info", sub: "Engineering 42% · HR 12% · Finance 18% · Sales 28%" })}>By dept</button>
              <button onClick={() => window.toast("Location breakdown", { icon: "building", tone: "info", sub: "Mumbai 38% · Bangalore 31% · Hyderabad 19% · Chennai 12%" })}>By location</button>
            </div>
          </div>

          <div className="grid g-cols-2 gap-8" style={{ gap: 18 }}>
            <div>
              <div className="fs-xs muted fw-600"
                style={{ textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Earnings & contributions
              </div>
              {bkEarnings.map(b => <BreakdownRow key={b.label} {...b}/>)}
              {/* FEA-020: Reimbursements line item */}
              {reimbTotal > 0 && (
                <div style={{ padding: "5px 0", borderBottom: "1px dashed var(--inset-3)" }}>
                  <div className="row between">
                    <span style={{ fontSize: 12, color: "var(--text-mid)" }}>
                      Employee Reimbursements
                      <span className="chip ok" style={{ marginLeft: 6, fontSize: 9 }}>
                        {pendingReimb.length} approved claim{pendingReimb.length > 1 ? "s" : ""} included
                      </span>
                    </span>
                    <span className="mono" style={{ fontSize: 11.5, color: "#34D399" }}>
                      +{fmtINR(reimbTotal)}
                    </span>
                  </div>
                </div>
              )}
              <div className="divider"/>
              <div className="row between">
                <span className="fw-600">Total cost to company</span>
                <span className="fw-600 mono" style={{ color: "var(--accent-bright)" }}>
                  {fmtINR(bkTotalEarn + (reimbTotal > 0 ? reimbTotal : 0))}
                </span>
              </div>
            </div>
            <div>
              <div className="fs-xs muted fw-600"
                style={{ textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Deductions & statutory
              </div>
              {bkDeductions.map(b => <BreakdownRow key={b.label} {...b}/>)}
              {/* FEA-021: LOP deduction line item */}
              {lopDeduction > 0 && (
                <div style={{ padding: "5px 0", borderBottom: "1px dashed var(--inset-3)" }}>
                  <div className="row between">
                    <span style={{ fontSize: 12, color: "var(--text-mid)" }}>
                      Loss of Pay (LOP)
                      <span className="chip danger" style={{ marginLeft: 6, fontSize: 9 }}>
                        {lopEmployees.length} employees have LOP deductions
                      </span>
                    </span>
                    <span className="mono" style={{ fontSize: 11.5, color: "#FCA5B0" }}>
                      −{fmtINR(lopDeduction)}
                    </span>
                  </div>
                </div>
              )}
              {/* WIRE-004: IT Declarations TDS callout */}
              {revisedTDSNote && (
                <div className="card" style={{background:"rgba(96,165,250,0.06)", border:"1px solid rgba(96,165,250,0.2)", padding:"10px 14px", marginBottom:10}}>
                  <div className="row gap-3 fs-sm">
                    <Icon name="shield" size={13} color="#60A5FA"/>
                    <span>{revisedTDSNote}</span>
                    <button className="btn ghost sm" onClick={() => window.toast("IT Declaration report", {icon:"shield",tone:"info"})}>View details</button>
                  </div>
                </div>
              )}
              <div className="divider"/>
              <div className="row between">
                <span className="fw-600">Total deductions</span>
                <span className="fw-600 mono" style={{ color: "#FCA5B0" }}>
                  −{fmtINR(bkTotalDed + (lopDeduction > 0 ? lopDeduction : 0))}
                </span>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 16, padding: "12px 14px", borderRadius: 10,
            background: "linear-gradient(180deg, rgba(16,185,129,0.14), rgba(16,185,129,0.04))",
            border: "1px solid rgba(16,185,129,0.25)",
          }}>
            <div className="row between center">
              <div>
                <div className="fs-xs muted fw-600"
                  style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Net payable · {viewData.rows.length} employees
                  {selectedClient ? ` (${selectedClient.name})` : ""}
                </div>
                <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4,
                              fontVariantNumeric: "tabular-nums" }}>
                  {fmtINR(viewData.totalNet)}
                </div>
              </div>
              <div className="col gap-3" style={{ textAlign: "right" }}>
                <div className="fs-xs muted">Disbursement</div>
                <div className="fw-600" style={{ fontSize: 12 }}>HDFC PayConnect</div>
                <div className="fs-xs">Scheduled <b>Nov 28, 06:00 IST</b></div>
              </div>
            </div>
          </div>
        </div>

        {/* Run health + Variance */}
        <div className="col gap-6">
          <div className="card">
            <div className="card-head"><div className="card-title">Run health</div></div>
            <div className="col gap-4">
              <HealthRow ok label="Attendance imported"
                sub={`${viewData.rows.length} employees · 0 mismatches`}/>
              <HealthRow ok label="Tax recompute" sub="TDS · PT · LWF"/>
              <HealthRow warn label="3 AI anomalies" sub="₹52,800 held for review"/>
              <HealthRow ok label="Bank validation" sub="245/247 verified · 2 penny-tests pending"/>
              <HealthRow ok label="Compliance check" sub="PF · ESI · TDS within limits"/>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">Variance vs Oct</div></div>
            <div className="col gap-4">
              <VarianceRow label="Gross salary"     prev="₹5.19 Cr" cur="₹5.24 Cr" pct={1.04}  reason="3 new joiners"/>
              <VarianceRow label="Variable & bonus" prev="₹22.1L"   cur="₹28.4L"   pct={28.5}  reason="Q3 bonus payout"/>
              <VarianceRow label="Overtime"         prev="₹1.8L"    cur="₹2.4L"    pct={33.3}  reason="Anomaly: Akshay S."/>
              <VarianceRow label="Reimbursements"   prev="₹11.2L"   cur="₹9.8L"    pct={-12.5} reason="Travel restraint"/>
              <VarianceRow label="TDS"              prev="₹62.1L"   cur="₹64.3L"   pct={3.5}   reason="Higher gross"/>
            </div>
          </div>
        </div>
      </div>

      {/* ── Employee payslip register ─────────────────────────── */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head">
          <div className="card-title">Payslip register
            <small>
              {selectedClient
                ? `${selectedClient.name} · ${viewData.rows.length} employees`
                : `All clients · ${viewData.rows.length} employees (${CLIENT_PAYROLL_DATA.length} clients)`}
            </small>
          </div>
          <div className="row gap-3">
            <button className="btn ghost sm" onClick={() => setShowRegFilters(v => !v)}>
              <Icon name="filter"/>Filters
              {(regFilter !== "all" || regDeptFilter !== "all") && (
                <span style={{
                  marginLeft: 4, padding: "1px 5px", borderRadius: 4, fontSize: 9.5,
                  background: "rgba(16,185,129,0.18)", color: "#34D399",
                }}>active</span>
              )}
            </button>
            <button className="btn ghost sm" onClick={() => {
              const empCount = viewData.rows.length;
              window.toast("Payslip register exported", { icon: "download", tone: "ok", sub: `Nov_2025_PayslipRegister_${empCount}emp.csv · ${Math.round(empCount * 1.1)} KB` });
            }}><Icon name="download"/>CSV</button>
          </div>
        </div>
        {/* STUB-003: Filter pills */}
        {showRegFilters && (
          <div className="row gap-3" style={{ padding: "10px 0 6px", flexWrap: "wrap", alignItems: "center" }}>
            <span className="fs-xs muted fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Dept:</span>
            {["all", "Engineering", "HR", "Finance", "Sales"].map(d => (
              <button key={d} className="btn ghost sm"
                style={{
                  background: regDeptFilter === d ? "rgba(16,185,129,0.14)" : undefined,
                  border: regDeptFilter === d ? "1px solid rgba(16,185,129,0.40)" : undefined,
                  color: regDeptFilter === d ? "#34D399" : undefined,
                }}
                onClick={() => setRegDeptFilter(d)}>
                {d === "all" ? "All" : d}
              </button>
            ))}
            <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }}/>
            <span className="fs-xs muted fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Status:</span>
            {[["all", "All"], ["lop", "LOP"], ["normal", "Normal"]].map(([val, label]) => (
              <button key={val} className="btn ghost sm"
                style={{
                  background: regFilter === val ? "rgba(16,185,129,0.14)" : undefined,
                  border: regFilter === val ? "1px solid rgba(16,185,129,0.40)" : undefined,
                  color: regFilter === val ? "#34D399" : undefined,
                }}
                onClick={() => setRegFilter(val)}>
                {label}
              </button>
            ))}
            {(regFilter !== "all" || regDeptFilter !== "all") && (
              <button className="btn ghost sm" style={{ color: "#FCA5B0" }}
                onClick={() => { setRegFilter("all"); setRegDeptFilter("all"); }}>
                <Icon name="x" size={10}/>Clear
              </button>
            )}
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Employee</th>
                {!selectedClient && <th>Client</th>}
                <th>Department</th>
                <th>Location</th>
                <th className="right">Gross</th>
                <th className="right">Deductions</th>
                {/* FEA-021: LOP column */}
                <th className="right">LOP</th>
                <th className="right">Net pay</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {viewData.rows.filter(({ emp: e }) => {
                const deptOk = regDeptFilter === "all" || (e.deptName && e.deptName.toLowerCase().includes(regDeptFilter.toLowerCase()));
                const statusOk = regFilter === "all"
                  || (regFilter === "lop" && lopEmpIds.has(e.id))
                  || (regFilter === "normal" && !lopEmpIds.has(e.id));
                return deptOk && statusOk;
              }).slice(0, 10).map(({ emp: e, gross, ded, net }) => {
                const flagged  = ["SO-1187", "SO-1064", "SO-1213"].includes(e.id);
                const hasLop   = lopEmpIds.has(e.id);
                return (
                  <tr key={e.id} data-selected={flagged}>
                    <td>
                      <div className="row-emp">
                        <Avatar name={e.name}/>
                        <div>
                          <div className="row-emp-name">{e.name}</div>
                          <div className="row-emp-meta">{e.id} · {e.role}</div>
                        </div>
                      </div>
                    </td>
                    {!selectedClient && (
                      <td>
                        <span style={{
                          fontSize: 10.5, padding: "2px 7px", borderRadius: 4,
                          background: "var(--inset-3)", color: "var(--text-mid)", fontWeight: 500,
                        }}>
                          {e.clientCode}
                        </span>
                      </td>
                    )}
                    <td><span style={{ color: e.deptColor, fontWeight: 500 }}>{e.deptName}</span></td>
                    <td className="muted">{e.locName.replace(" (HQ)", "")}</td>
                    <td className="right num">{fmtINR(gross)}</td>
                    <td className="right num muted">−{fmtINR(ded)}</td>
                    {/* FEA-021: LOP cell */}
                    <td className="right num">
                      {hasLop
                        ? <span style={{ color: "#FCA5B0", fontWeight: 600 }}>−{fmtINR(2300)}</span>
                        : <span className="muted">—</span>
                      }
                    </td>
                    <td className="right num"><b>{fmtINR(hasLop ? net - 2300 : net)}</b></td>
                    <td>
                      {flagged
                        ? <span className="chip warn"><Icon name="alert" size={10}/>Flagged</span>
                        : hasLop
                          ? <span className="chip danger"><Icon name="alert" size={10}/>LOP</span>
                          : <span className="chip ok"><span className="dot"/>Ready</span>}
                    </td>
                    <td>
                      <button className="iconbtn" style={{ width: 24, height: 24 }}
                        onClick={() => window.toast(`${e.name} · payslip options`, { icon: "payslip", tone: "info", sub: `${e.id} · ${e.role} · Net ${fmtINR(hasLop ? net - 2300 : net)}` })}>
                        <Icon name="more" size={12}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 600 }}>
                <td colSpan={selectedClient ? 3 : 4}>
                  Total · {viewData.rows.length} employees
                </td>
                <td className="right num">{fmtINR(viewData.totalGross)}</td>
                <td className="right num" style={{ color: "#FCA5B0" }}>
                  −{fmtINR(viewData.totalDed)}
                </td>
                <td className="right num" style={{ color: "#FCA5B0" }}>
                  {lopDeduction > 0 ? `−${fmtINR(lopDeduction)}` : "—"}
                </td>
                <td className="right num" style={{ color: "var(--accent-bright)" }}>
                  {fmtINR(viewData.totalNet - lopDeduction)}
                </td>
                <td colSpan={2}/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────

const BreakdownRow = ({ label, amount, type }) => {
  const isDed  = type === "ded";
  const isStat = type === "stat";
  return (
    <div className="row between" style={{ padding: "5px 0", borderBottom: "1px dashed var(--inset-3)" }}>
      <span style={{ fontSize: 12, color: "var(--text-mid)" }}>
        {label}
        {isStat && <span className="chip" style={{ marginLeft: 6, fontSize: 9 }}>Employer</span>}
      </span>
      <span className="mono" style={{ fontSize: 11.5, color: isDed ? "#FCA5B0" : "var(--text)" }}>
        {isDed ? "−" : ""}{fmtINR(Math.abs(amount))}
      </span>
    </div>
  );
};

const HealthRow = ({ ok, warn, label, sub }) => (
  <div className="row gap-4">
    <div style={{
      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
      background: ok ? "rgba(16,185,129,0.16)" : "rgba(245,158,11,0.16)",
      color: ok ? "#34D399" : "#F59E0B",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon name={ok ? "check" : "alert"} size={10}/>
    </div>
    <div className="flex-1">
      <div style={{ fontSize: 11.5, fontWeight: 500 }}>{label}</div>
      <div className="fs-xs muted">{sub}</div>
    </div>
  </div>
);

const VarianceRow = ({ label, prev, cur, pct, reason }) => {
  const up = pct >= 0;
  return (
    <div className="col gap-2">
      <div className="row between">
        <span style={{ fontSize: 11.5, color: "var(--text-mid)" }}>{label}</span>
        <span className="mono" style={{ fontSize: 11, color: up ? "#FCA5B0" : "#34D399" }}>
          {up ? "+" : ""}{pct.toFixed(1)}%
        </span>
      </div>
      <div className="row between" style={{ fontSize: 10.5 }}>
        <span className="muted mono">{prev} → {cur}</span>
        <span className="dim">{reason}</span>
      </div>
    </div>
  );
};

// FEA-037: Pre-flight result row
const PreflightRow = ({ result }) => {
  const { check, status, detail } = result;
  const colorMap = {
    pass: { bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.24)", icon: "check",   iconColor: "#34D399", label: "Pass" },
    warn: { bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.28)", icon: "alert",   iconColor: "#F59E0B", label: "Warn" },
    info: { bg: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.24)", icon: "sparkle", iconColor: "#93C5FD", label: "Info" },
    fail: { bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.28)",  icon: "x",       iconColor: "#FCA5A5", label: "Fail" },
  };
  const c = colorMap[status] || colorMap.info;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 12px", borderRadius: 8,
      background: c.bg, border: `1px solid ${c.border}`,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        background: c.bg, color: c.iconColor, border: `1px solid ${c.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={c.icon} size={10}/>
      </div>
      <div className="flex-1">
        <span style={{ fontSize: 12, fontWeight: 600 }}>{check}</span>
        <span className="muted fs-xs" style={{ marginLeft: 8 }}>{detail}</span>
      </div>
      <span style={{
        fontSize: 9.5, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
        background: c.bg, color: c.iconColor, border: `1px solid ${c.border}`,
        textTransform: "uppercase", letterSpacing: "0.05em",
      }}>
        {c.label}
      </span>
    </div>
  );
};

Object.assign(window, { Payroll, BreakdownRow, HealthRow, VarianceRow, PreflightRow });
