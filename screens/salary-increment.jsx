// Salary Increment / Revision Module

const SalaryIncrement = ({ onNav, onSub }) => {
  const [mode, setMode]               = useState("dept");       // "dept" | "individual"
  const [increments, setIncrements]   = useState({});           // deptId → %
  const [indivIncrements, setIndivIncrements] = useState({});   // empId → %
  const [search, setSearch]           = useState("");
  const [step, setStep]               = useState("configure");  // "configure" | "review" | "applied"
  const [effectiveDate, setEffectiveDate] = useState("2026-04-01");
  const [cycleLabel, setCycleLabel]   = useState("Annual Appraisal FY 2025-26");
  const [applyAll, setApplyAll]       = useState("");
  const [applying, setApplying]       = useState(false);

  // ── Derived: dept increment value helper ──────────────────────
  const deptPct = (deptId) => increments[deptId] !== undefined ? increments[deptId] : 0;
  const indivPct = (empId) => indivIncrements[empId] !== undefined ? indivIncrements[empId] : 0;

  // ── Dept stats ─────────────────────────────────────────────────
  const deptStats = useMemo(() => {
    return DEPARTMENTS.map(d => {
      const emps = EMPLOYEES.filter(e => e.dept === d.id || e.dept === d.name);
      const avgCTC = emps.length ? Math.round(emps.reduce((a, e) => a + (e.ctc || e.base || 0), 0) / emps.length) : 0;
      const pct = deptPct(d.id);
      const avgNewCTC = Math.round(avgCTC * (1 + pct / 100));
      const totalImpact = emps.reduce((a, e) => {
        const ctc = e.ctc || e.base || 0;
        return a + Math.round(ctc * (1 + pct / 100)) - ctc;
      }, 0);
      return { dept: d, emps, avgCTC, avgNewCTC, totalImpact, pct };
    });
  }, [increments]);

  // ── Payroll totals ─────────────────────────────────────────────
  const payrollBefore = useMemo(() =>
    EMPLOYEES.reduce((a, e) => a + (e.ctc || e.base || 0), 0),
  []);

  const payrollAfter = useMemo(() => {
    if (mode === "dept") {
      return EMPLOYEES.reduce((a, e) => {
        const ctc = e.ctc || e.base || 0;
        const dept = DEPARTMENTS.find(d => d.id === e.dept || d.name === e.dept);
        const pct = dept ? deptPct(dept.id) : 0;
        return a + Math.round(ctc * (1 + pct / 100));
      }, 0);
    } else {
      return EMPLOYEES.reduce((a, e) => {
        const ctc = e.ctc || e.base || 0;
        const pct = indivPct(e.id);
        return a + Math.round(ctc * (1 + pct / 100));
      }, 0);
    }
  }, [increments, indivIncrements, mode]);

  const netIncrease = payrollAfter - payrollBefore;
  const netPct = payrollBefore > 0 ? ((netIncrease / payrollBefore) * 100).toFixed(2) : "0.00";

  // ── Filtered employees (individual mode) ──────────────────────
  const filteredEmps = useMemo(() => {
    const base = EMPLOYEES.slice(0, 20);
    if (!search) return base;
    return EMPLOYEES.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 20);
  }, [search]);

  // ── Review rows ────────────────────────────────────────────────
  const reviewRows = useMemo(() => {
    if (mode === "dept") {
      return EMPLOYEES.map(e => {
        const ctc = e.ctc || e.base || 0;
        const dept = DEPARTMENTS.find(d => d.id === e.dept || d.name === e.dept);
        const pct = dept ? deptPct(dept.id) : 0;
        const newCTC = Math.round(ctc * (1 + pct / 100));
        return { emp: e, oldCTC: ctc, newCTC, pct, diff: newCTC - ctc };
      }).filter(r => r.pct > 0);
    } else {
      return EMPLOYEES.slice(0, 20).map(e => {
        const ctc = e.ctc || e.base || 0;
        const pct = indivPct(e.id);
        const newCTC = Math.round(ctc * (1 + pct / 100));
        return { emp: e, oldCTC: ctc, newCTC, pct, diff: newCTC - ctc };
      }).filter(r => r.pct > 0);
    }
  }, [increments, indivIncrements, mode]);

  const hasAnyIncrement = mode === "dept"
    ? Object.values(increments).some(v => Number(v) > 0)
    : Object.values(indivIncrements).some(v => Number(v) > 0);

  // ── Handlers ───────────────────────────────────────────────────
  const handleDeptPct = (deptId, val) => {
    const n = Math.min(30, Math.max(0, parseFloat(val) || 0));
    setIncrements(prev => ({ ...prev, [deptId]: n }));
  };

  const handleIndivPct = (empId, val) => {
    const n = Math.min(30, Math.max(0, parseFloat(val) || 0));
    setIndivIncrements(prev => ({ ...prev, [empId]: n }));
  };

  const handleApplyAll = () => {
    const n = Math.min(30, Math.max(0, parseFloat(applyAll) || 0));
    if (mode === "dept") {
      const next = {};
      DEPARTMENTS.forEach(d => { next[d.id] = n; });
      setIncrements(next);
    } else {
      const next = {};
      EMPLOYEES.slice(0, 20).forEach(e => { next[e.id] = n; });
      setIndivIncrements(next);
    }
    window.toast(`Set ${n}% increment for all`, { icon: "check", tone: "ok" });
  };

  const handlePreview = () => {
    if (!hasAnyIncrement) {
      window.toast("Set at least one increment % before previewing", { icon: "alert", tone: "warn" });
      return;
    }
    setStep("review");
  };

  const handleApply = () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setStep("applied");
      window.toast("Salary revisions applied successfully", {
        icon: "check",
        tone: "ok",
        sub: `${reviewRows.length} employees updated · Effective ${effectiveDate}`,
      });
    }, 1600);
  };

  const handleCancel = () => {
    setStep("configure");
  };

  const handleImportCSV = () => {
    window.toast("CSV import coming soon", { icon: "upload", tone: "info" });
  };

  const handleDownloadLetters = () => {
    window.toast("Generating revision letter batch…", { icon: "download", tone: "info", sub: `${reviewRows.length} letters queued` });
  };

  const handleReset = () => {
    setStep("configure");
    setIncrements({});
    setIndivIncrements({});
    setApplyAll("");
    setSearch("");
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="page">
      {/* ── Page Header ── */}
      <PageHead
        title="Salary Revision"
        subtitle="Apply increments by department or individual"
      >
        <button className="btn ghost" onClick={handleImportCSV}>
          <Icon name="upload" />Import CSV
        </button>
        <button
          className="btn primary"
          disabled={step !== "review" || !hasAnyIncrement}
          onClick={handleApply}
          style={{ opacity: step === "review" && hasAnyIncrement ? 1 : 0.45 }}
        >
          <Icon name="check" />Apply Revisions
        </button>
      </PageHead>

      {/* ── Applied Success Banner ── */}
      {step === "applied" && (
        <div className="card" style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))",
          border: "1.5px solid rgba(16,185,129,0.30)",
          padding: "18px 22px",
          marginBottom: 18,
        }}>
          <div className="row gap-4 center" style={{ marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(16,185,129,0.18)", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon name="check" size={18} color="#10B981" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#10B981" }}>
                Salary revisions applied successfully
              </div>
              <div className="muted fs-sm">
                {reviewRows.length} employees updated · Cycle: {cycleLabel} · Effective {effectiveDate}
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <button className="btn ghost sm" onClick={handleDownloadLetters}>
                <Icon name="download" />Download revision letter batch
              </button>
              <button className="btn ghost sm" style={{ marginLeft: 8 }} onClick={handleReset}>
                <Icon name="plus" />New revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Config Card ── */}
      {step !== "applied" && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <div className="card-title">
              Revision Configuration
              <small>Set effective date, cycle label and review mode</small>
            </div>
          </div>
          <div className="grid g-cols-3 gap-4" style={{ gap: 14, padding: "0 0 4px" }}>
            <div>
              <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Effective Date
              </div>
              <input
                type="date"
                className="input"
                style={{ width: "100%", height: 34 }}
                value={effectiveDate}
                onChange={e => setEffectiveDate(e.target.value)}
              />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Revision Cycle Label
              </div>
              <input
                type="text"
                className="input"
                style={{ width: "100%", height: 34 }}
                value={cycleLabel}
                placeholder="e.g. Annual Appraisal FY 2025-26"
                onChange={e => setCycleLabel(e.target.value)}
              />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Review Type
            </div>
            <div className="row gap-4">
              {[
                { val: "dept", label: "By Department", icon: "building" },
                { val: "individual", label: "By Individual", icon: "user" },
              ].map(opt => (
                <label
                  key={opt.val}
                  className="row gap-3 center"
                  style={{
                    cursor: "pointer", padding: "8px 16px", borderRadius: 8,
                    border: mode === opt.val ? "1.5px solid var(--accent)" : "1.5px solid var(--border)",
                    background: mode === opt.val ? "rgba(var(--accent-rgb,16,185,129),0.08)" : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="revisionMode"
                    value={opt.val}
                    checked={mode === opt.val}
                    onChange={() => { setMode(opt.val); setStep("configure"); }}
                    style={{ accentColor: "var(--accent)", marginRight: 2 }}
                  />
                  <Icon name={opt.icon} size={14} />
                  <span style={{ fontWeight: mode === opt.val ? 700 : 400, fontSize: 13.5 }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          STEP: CONFIGURE
      ══════════════════════════════════════ */}
      {step === "configure" && (
        <>
          {/* ── Dept Mode ── */}
          {mode === "dept" && (
            <>
              {/* Impact summary KPIs */}
              <div className="grid g-cols-3" style={{ marginBottom: 16 }}>
                <div className="card kpi">
                  <div className="kpi-label"><Icon name="coins" />Total Payroll Before</div>
                  <div className="kpi-value">{fmtINR(payrollBefore, { compact: true })}</div>
                  <div className="row between">
                    <span className="muted fs-xs">{EMPLOYEES.length} employees</span>
                  </div>
                </div>
                <div className="card kpi">
                  <div className="kpi-label"><Icon name="arrowUp" />Total Payroll After</div>
                  <div className="kpi-value" style={{ color: "var(--accent)" }}>{fmtINR(payrollAfter, { compact: true })}</div>
                  <div className="row between">
                    <span className="muted fs-xs">Projected</span>
                  </div>
                </div>
                <div className="card kpi">
                  <div className="kpi-label"><Icon name="chart" />Net Increase</div>
                  <div className="kpi-value">{fmtINR(netIncrease, { compact: true })}</div>
                  <div className="row between">
                    <span className={`kpi-delta ${netIncrease >= 0 ? "up" : "down"}`}>
                      <Icon name={netIncrease >= 0 ? "arrowUp" : "arrowDown"} size={11} />
                      {netIncrease >= 0 ? "+" : ""}{netPct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Dept table card */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">
                    Department Increments
                    <small>Edit increment % per department</small>
                  </div>
                  <div className="row gap-3 center">
                    <span className="muted fs-xs">Apply to all</span>
                    <input
                      type="number"
                      className="input"
                      min={0} max={30}
                      style={{ width: 70, height: 30, fontSize: 13 }}
                      placeholder="0%"
                      value={applyAll}
                      onChange={e => setApplyAll(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleApplyAll()}
                    />
                    <button className="btn ghost sm" onClick={handleApplyAll}>
                      <Icon name="check" />Apply
                    </button>
                  </div>
                </div>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th className="right">Employees</th>
                      <th className="right">Avg CTC</th>
                      <th style={{ textAlign: "center", width: 130 }}>Increment %</th>
                      <th className="right">Avg New CTC</th>
                      <th className="right">Total Impact (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptStats.map(({ dept, emps, avgCTC, avgNewCTC, totalImpact, pct }) => (
                      <tr key={dept.id}>
                        <td>
                          <div className="row gap-3 center">
                            <div style={{
                              width: 9, height: 9, borderRadius: "50%",
                              background: dept.color || "#60A5FA", flexShrink: 0,
                            }} />
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{dept.name}</span>
                          </div>
                        </td>
                        <td className="right mono fs-sm">{emps.length}</td>
                        <td className="right mono fs-sm">{fmtINR(avgCTC, { compact: true })}</td>
                        <td style={{ textAlign: "center" }}>
                          <div className="row gap-2 center" style={{ justifyContent: "center" }}>
                            <input
                              type="number"
                              className="input"
                              min={0} max={30} step={0.5}
                              style={{
                                width: 72, height: 30, fontSize: 13, textAlign: "center",
                                borderColor: pct > 0 ? "var(--accent)" : undefined,
                                background: pct > 0 ? "rgba(16,185,129,0.07)" : undefined,
                              }}
                              value={pct === 0 ? "" : pct}
                              placeholder="0"
                              onChange={e => handleDeptPct(dept.id, e.target.value)}
                            />
                            <span className="muted fs-xs">%</span>
                          </div>
                        </td>
                        <td className="right mono fs-sm" style={{ color: pct > 0 ? "var(--accent)" : undefined }}>
                          {fmtINR(avgNewCTC, { compact: true })}
                        </td>
                        <td className="right">
                          {totalImpact > 0 ? (
                            <span className="chip ok" style={{ fontSize: 11.5 }}>
                              +{fmtINR(totalImpact, { compact: true })}
                            </span>
                          ) : (
                            <span className="muted fs-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── Individual Mode ── */}
          {mode === "individual" && (
            <>
              {/* Impact summary KPIs */}
              <div className="grid g-cols-3" style={{ marginBottom: 16 }}>
                <div className="card kpi">
                  <div className="kpi-label"><Icon name="coins" />Total Payroll Before</div>
                  <div className="kpi-value">{fmtINR(payrollBefore, { compact: true })}</div>
                  <div className="row between">
                    <span className="muted fs-xs">{EMPLOYEES.length} employees</span>
                  </div>
                </div>
                <div className="card kpi">
                  <div className="kpi-label"><Icon name="arrowUp" />Total Payroll After</div>
                  <div className="kpi-value" style={{ color: "var(--accent)" }}>{fmtINR(payrollAfter, { compact: true })}</div>
                  <div className="row between">
                    <span className="muted fs-xs">Showing first 20</span>
                  </div>
                </div>
                <div className="card kpi">
                  <div className="kpi-label"><Icon name="chart" />Net Increase</div>
                  <div className="kpi-value">{fmtINR(netIncrease, { compact: true })}</div>
                  <div className="row between">
                    <span className={`kpi-delta ${netIncrease >= 0 ? "up" : "down"}`}>
                      <Icon name={netIncrease >= 0 ? "arrowUp" : "arrowDown"} size={11} />
                      {netIncrease >= 0 ? "+" : ""}{netPct}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <div className="card-title">
                    Individual Increments
                    <small>First 20 employees · search to find specific</small>
                  </div>
                  <div className="row gap-3 center">
                    <div className="row gap-2 center" style={{
                      background: "var(--surface2)", borderRadius: 8, padding: "4px 10px",
                      border: "1px solid var(--border)",
                    }}>
                      <Icon name="search" size={13} />
                      <input
                        className="input"
                        style={{ border: "none", background: "transparent", outline: "none", height: 24, width: 170, padding: 0, fontSize: 13 }}
                        placeholder="Search employees…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>
                    <span className="muted fs-xs">Apply to all</span>
                    <input
                      type="number"
                      className="input"
                      min={0} max={30}
                      style={{ width: 70, height: 30, fontSize: 13 }}
                      placeholder="0%"
                      value={applyAll}
                      onChange={e => setApplyAll(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleApplyAll()}
                    />
                    <button className="btn ghost sm" onClick={handleApplyAll}>
                      <Icon name="check" />Apply
                    </button>
                  </div>
                </div>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th className="right">Current CTC</th>
                      <th style={{ textAlign: "center", width: 130 }}>Increment %</th>
                      <th className="right">New CTC</th>
                      <th className="right">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmps.map(e => {
                      const ctc = e.ctc || e.base || 0;
                      const pct = indivPct(e.id);
                      const newCTC = Math.round(ctc * (1 + pct / 100));
                      const diff = newCTC - ctc;
                      const dept = DEPARTMENTS.find(d => d.id === e.dept || d.name === e.dept);
                      return (
                        <tr key={e.id}>
                          <td>
                            <div className="row-emp">
                              <Avatar name={e.name} />
                              <div>
                                <div className="row-emp-name">{e.name}</div>
                                <div className="row-emp-meta">{e.id} · {dept ? dept.name : e.dept}</div>
                              </div>
                            </div>
                          </td>
                          <td className="right mono fs-sm">{fmtINR(ctc, { compact: true })}</td>
                          <td style={{ textAlign: "center" }}>
                            <div className="row gap-2 center" style={{ justifyContent: "center" }}>
                              <input
                                type="number"
                                className="input"
                                min={0} max={30} step={0.5}
                                style={{
                                  width: 72, height: 30, fontSize: 13, textAlign: "center",
                                  borderColor: pct > 0 ? "var(--accent)" : undefined,
                                  background: pct > 0 ? "rgba(16,185,129,0.07)" : undefined,
                                }}
                                value={pct === 0 ? "" : pct}
                                placeholder="0"
                                onChange={ev => handleIndivPct(e.id, ev.target.value)}
                              />
                              <span className="muted fs-xs">%</span>
                            </div>
                          </td>
                          <td className="right mono fs-sm" style={{ color: pct > 0 ? "var(--accent)" : undefined }}>
                            {fmtINR(newCTC, { compact: true })}
                          </td>
                          <td className="right">
                            {diff > 0 ? (
                              <span className="chip ok" style={{ fontSize: 11.5 }}>+{fmtINR(diff, { compact: true })}</span>
                            ) : (
                              <span className="muted fs-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Preview button */}
          <div className="row" style={{ justifyContent: "flex-end", marginTop: 18, gap: 10 }}>
            <span className="muted fs-sm" style={{ alignSelf: "center" }}>
              {hasAnyIncrement
                ? `${reviewRows.length > 0 ? reviewRows.length : "—"} employees will be affected`
                : "Set increment % above to continue"}
            </span>
            <button
              className="btn primary"
              onClick={handlePreview}
              disabled={!hasAnyIncrement}
              style={{ opacity: hasAnyIncrement ? 1 : 0.45 }}
            >
              <Icon name="eye" />Preview Impact
            </button>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
          STEP: REVIEW
      ══════════════════════════════════════ */}
      {step === "review" && (
        <>
          {/* Impact summary KPIs */}
          <div className="grid g-cols-4" style={{ marginBottom: 16 }}>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="employees" />Employees Affected</div>
              <div className="kpi-value">{reviewRows.length}</div>
              <div className="row between"><span className="muted fs-xs">Out of {EMPLOYEES.length}</span></div>
            </div>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="coins" />Payroll Before</div>
              <div className="kpi-value">{fmtINR(payrollBefore, { compact: true })}</div>
              <div className="row between"><span className="muted fs-xs">Annual</span></div>
            </div>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="arrowUp" />Payroll After</div>
              <div className="kpi-value" style={{ color: "var(--accent)" }}>{fmtINR(payrollAfter, { compact: true })}</div>
              <div className="row between"><span className="muted fs-xs">Projected annual</span></div>
            </div>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="chart" />Net Increase</div>
              <div className="kpi-value">{fmtINR(netIncrease, { compact: true })}</div>
              <div className="row between">
                <span className="kpi-delta up">
                  <Icon name="arrowUp" size={11} />+{netPct}%
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">
                Review: Affected Employees
                <small>{reviewRows.length} employees · {cycleLabel} · Effective {effectiveDate}</small>
              </div>
              <div className="row gap-3">
                <span className="chip warn" style={{ fontSize: 11.5 }}>
                  <Icon name="alert" size={11} />Pending confirmation
                </span>
              </div>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th className="right">Old CTC</th>
                  <th className="right">New CTC</th>
                  <th className="right">Increment %</th>
                  <th className="right">Diff</th>
                  <th className="right">Effective Date</th>
                </tr>
              </thead>
              <tbody>
                {reviewRows.map(({ emp, oldCTC, newCTC, pct, diff }) => {
                  const dept = DEPARTMENTS.find(d => d.id === emp.dept || d.name === emp.dept);
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="row-emp">
                          <Avatar name={emp.name} />
                          <div>
                            <div className="row-emp-name">{emp.name}</div>
                            <div className="row-emp-meta">{emp.id} · {dept ? dept.name : emp.dept}</div>
                          </div>
                        </div>
                      </td>
                      <td className="right mono fs-sm">{fmtINR(oldCTC, { compact: true })}</td>
                      <td className="right mono fs-sm" style={{ color: "var(--accent)", fontWeight: 600 }}>
                        {fmtINR(newCTC, { compact: true })}
                      </td>
                      <td className="right">
                        <span className="chip ok" style={{ fontSize: 11.5 }}>{pct}%</span>
                      </td>
                      <td className="right mono fs-sm" style={{ color: "var(--accent)" }}>
                        +{fmtINR(diff, { compact: true })}
                      </td>
                      <td className="right">
                        <span className="muted fs-sm">{effectiveDate}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="row" style={{ justifyContent: "flex-end", marginTop: 18, gap: 10, padding: "0 0 4px" }}>
              <button className="btn ghost" onClick={handleCancel}>
                <Icon name="x" />Cancel
              </button>
              <button
                className="btn primary"
                onClick={handleApply}
                disabled={applying}
                style={{ minWidth: 152 }}
              >
                {applying ? (
                  <span className="row gap-2 center">
                    <span className="live-dot" style={{ background: "#fff" }} />
                    Applying…
                  </span>
                ) : (
                  <>
                    <Icon name="check" />Confirm &amp; Apply
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
          STEP: APPLIED — revision table
      ══════════════════════════════════════ */}
      {step === "applied" && (
        <>
          <div className="grid g-cols-4" style={{ marginBottom: 16 }}>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="employees" />Employees Revised</div>
              <div className="kpi-value">{reviewRows.length}</div>
              <div className="row between"><span className="muted fs-xs">{cycleLabel}</span></div>
            </div>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="coins" />Old Annual Payroll</div>
              <div className="kpi-value">{fmtINR(payrollBefore, { compact: true })}</div>
              <div className="row between"><span className="muted fs-xs">Before revision</span></div>
            </div>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="arrowUp" />New Annual Payroll</div>
              <div className="kpi-value" style={{ color: "var(--accent)" }}>{fmtINR(payrollAfter, { compact: true })}</div>
              <div className="row between"><span className="muted fs-xs">Effective {effectiveDate}</span></div>
            </div>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="chart" />Total Increment</div>
              <div className="kpi-value">{fmtINR(netIncrease, { compact: true })}</div>
              <div className="row between">
                <span className="kpi-delta up">
                  <Icon name="arrowUp" size={11} />+{netPct}%
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">
                Applied Revisions
                <small>{reviewRows.length} employees · {cycleLabel}</small>
              </div>
              <div className="row gap-3">
                <button className="btn ghost sm" onClick={handleDownloadLetters}>
                  <Icon name="download" />Download revision letter batch
                </button>
              </div>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th className="right">Old CTC</th>
                  <th className="right">New CTC</th>
                  <th className="right">Increment %</th>
                  <th className="right">Diff</th>
                  <th className="right">Effective Date</th>
                </tr>
              </thead>
              <tbody>
                {reviewRows.map(({ emp, oldCTC, newCTC, pct, diff }) => {
                  const dept = DEPARTMENTS.find(d => d.id === emp.dept || d.name === emp.dept);
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="row-emp">
                          <Avatar name={emp.name} />
                          <div>
                            <div className="row-emp-name">{emp.name}</div>
                            <div className="row-emp-meta">{emp.id} · {dept ? dept.name : emp.dept}</div>
                          </div>
                        </div>
                      </td>
                      <td className="right mono fs-sm">{fmtINR(oldCTC, { compact: true })}</td>
                      <td className="right mono fs-sm" style={{ color: "var(--accent)", fontWeight: 600 }}>
                        {fmtINR(newCTC, { compact: true })}
                      </td>
                      <td className="right">
                        <span className="chip ok" style={{ fontSize: 11.5 }}>{pct}%</span>
                      </td>
                      <td className="right mono fs-sm" style={{ color: "var(--accent)" }}>
                        +{fmtINR(diff, { compact: true })}
                      </td>
                      <td className="right">
                        <span className="muted fs-sm">{effectiveDate}</span>
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

Object.assign(window, { SalaryIncrement });
