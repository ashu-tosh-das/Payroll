// Payroll Variance Report

const PV_MONTHS = ["Nov 2025","Oct 2025","Sep 2025","Aug 2025","Jul 2025","Jun 2025","May 2025","Apr 2025"];

const PayrollVariance = ({ onNav, onSub }) => {
  const [monthA, setMonthA] = useState("Nov 2025");
  const [monthB, setMonthB] = useState("Oct 2025");
  const [compared, setCompared] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sortDir, setSortDir] = useState("desc");

  const employees = useMemo(() => (window.EMPLOYEES || []).slice(0, 30), []);

  const varianceData = useMemo(() => {
    if (!compared) return [];
    const monthAIdx = PV_MONTHS.indexOf(monthA);
    const monthBIdx = PV_MONTHS.indexOf(monthB);

    return employees.map(e => {
      const grossA = Math.round(e.base * (1 + Math.sin(e.base * 0.0001 + monthAIdx * 0.3) * 0.05));
      const grossB = Math.round(e.base * (1 + Math.sin(e.base * 0.0001 + monthBIdx * 0.3) * 0.05));
      const change = grossB - grossA;
      const changePct = grossA > 0 ? ((change / grossA) * 100) : 0;
      let status;
      if (monthBIdx < 0) {
        status = "New Joiner";
      } else if (Math.abs(changePct) < 0.01) {
        status = "No Change";
      } else if (change > 0) {
        status = "Increase";
      } else {
        status = "Decrease";
      }
      return { ...e, grossA, grossB, change, changePct, status };
    });
  }, [compared, monthA, monthB, employees]);

  const sorted = useMemo(() => {
    return [...varianceData].sort((a, b) => {
      const absA = Math.abs(a.change);
      const absB = Math.abs(b.change);
      return sortDir === "desc" ? absB - absA : absA - absB;
    });
  }, [varianceData, sortDir]);

  const filtered = useMemo(() => {
    if (filter === "all") return sorted;
    if (filter === "increases") return sorted.filter(r => r.status === "Increase");
    if (filter === "decreases") return sorted.filter(r => r.status === "Decrease");
    if (filter === "new") return sorted.filter(r => r.status === "New Joiner");
    if (filter === "nochange") return sorted.filter(r => r.status === "No Change");
    return sorted;
  }, [sorted, filter]);

  const kpis = useMemo(() => {
    if (!compared) return null;
    const totalA = varianceData.reduce((s, r) => s + r.grossA, 0);
    const totalB = varianceData.reduce((s, r) => s + r.grossB, 0);
    const increased = varianceData.filter(r => r.status === "Increase").length;
    const decreased = varianceData.filter(r => r.status === "Decrease").length;
    const newJoiners = varianceData.filter(r => r.status === "New Joiner").length;
    const exits = 0;
    const totalPct = totalA > 0 ? (((totalB - totalA) / totalA) * 100).toFixed(2) : "0.00";
    return { totalA, totalB, increased, decreased, newJoiners, exits, totalPct, total: varianceData.length };
  }, [compared, varianceData]);

  const deptSummary = useMemo(() => {
    if (!compared) return [];
    const map = {};
    varianceData.forEach(r => {
      const dept = r.dept || "Unknown";
      if (!map[dept]) map[dept] = { dept, employees: 0, totalA: 0, totalB: 0 };
      map[dept].employees += 1;
      map[dept].totalA += r.grossA;
      map[dept].totalB += r.grossB;
    });
    return Object.values(map).map(d => ({ ...d, delta: d.totalB - d.totalA })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }, [compared, varianceData]);

  function handleCompare() {
    if (monthA === monthB) {
      window.toast("Please select two different months to compare.", { icon: "alert", tone: "warn" });
      return;
    }
    setFilter("all");
    setCompared(true);
  }

  function handleExport() {
    window.toast("Exporting variance report…", { icon: "download", tone: "info", sub: `${monthA} vs ${monthB} · ${filtered.length} employees` });
  }

  const statusChipClass = (status) => {
    if (status === "Increase") return "chip ok";
    if (status === "Decrease") return "chip danger";
    if (status === "New Joiner") return "chip info";
    return "chip";
  };

  const FILTER_PILLS = [
    { key: "all", label: "All" },
    { key: "increases", label: "Increases" },
    { key: "decreases", label: "Decreases" },
    { key: "new", label: "New Joiners" },
    { key: "nochange", label: "No Change" },
  ];

  return (
    <div className="page">
      <PageHead
        title="Payroll Variance Report"
        subtitle="Month-over-month salary change analysis"
      >
        <button className="btn ghost" onClick={handleExport}><Icon name="download"/>Export</button>
      </PageHead>

      {/* Config row */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <div className="card-title">Configure Comparison<small>Select two months to compare payroll data</small></div>
        </div>
        <div className="row gap-4" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="col gap-2">
            <span className="fs-xs fw-600 muted" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Month A (Base)</span>
            <select
              className="select"
              value={monthA}
              onChange={e => { setMonthA(e.target.value); setCompared(false); }}
              style={{ minWidth: 130 }}
            >
              {PV_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ paddingBottom: 6, color: "var(--text-muted)", fontSize: 18, fontWeight: 300 }}>vs</div>
          <div className="col gap-2">
            <span className="fs-xs fw-600 muted" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Month B (Compare)</span>
            <select
              className="select"
              value={monthB}
              onChange={e => { setMonthB(e.target.value); setCompared(false); }}
              style={{ minWidth: 130 }}
            >
              {PV_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button className="btn primary" style={{ marginBottom: 1 }} onClick={handleCompare}>
            <Icon name="chart"/>Compare
          </button>
        </div>
      </div>

      {/* Post-compare content */}
      {compared && kpis && (
        <>
          {/* KPI cards */}
          <div className="grid g-cols-4" style={{ marginBottom: 20 }}>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="employees"/>Employees Compared</div>
              <div className="kpi-value">{kpis.total}</div>
              <div className="row between"><span className="kpi-delta" style={{ color: "var(--text-muted)" }}>{monthA} vs {monthB}</span></div>
            </div>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="arrowUp"/>Salary Increased</div>
              <div className="kpi-value" style={{ color: "#10B981" }}>{kpis.increased}</div>
              <div className="row between"><span className="kpi-delta up"><Icon name="arrowUp" size={11}/>employees</span></div>
            </div>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="arrowDown"/>Salary Decreased</div>
              <div className="kpi-value" style={{ color: "#F87171" }}>{kpis.decreased}</div>
              <div className="row between"><span className="kpi-delta down"><Icon name="arrowDown" size={11}/>employees</span></div>
            </div>
            <div className="card kpi">
              <div className="kpi-label"><Icon name="plus"/>New Joiners / Exits</div>
              <div className="kpi-value">{kpis.newJoiners + kpis.exits}</div>
              <div className="row between"><span className="kpi-delta" style={{ color: "var(--text-muted)" }}>{kpis.newJoiners} new · {kpis.exits} exits</span></div>
            </div>
          </div>

          {/* Summary bar */}
          <div className="card" style={{ marginBottom: 20, padding: "14px 20px" }}>
            <div className="row gap-6" style={{ alignItems: "center", flexWrap: "wrap" }}>
              <div className="col gap-1">
                <span className="fs-xs muted fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>{monthA} Total Gross</span>
                <span className="kpi-value" style={{ fontSize: 22 }}>{fmtINR(kpis.totalA, { compact: true })}</span>
              </div>
              <div style={{ fontSize: 24, color: "var(--text-muted)", fontWeight: 200 }}>→</div>
              <div className="col gap-1">
                <span className="fs-xs muted fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>{monthB} Total Gross</span>
                <span className="kpi-value" style={{ fontSize: 22 }}>{fmtINR(kpis.totalB, { compact: true })}</span>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <div className="col gap-1" style={{ alignItems: "flex-end" }}>
                  <span className="fs-xs muted fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Net Change</span>
                  <div className="row gap-3 center">
                    <span style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: kpis.totalB >= kpis.totalA ? "#10B981" : "#F87171"
                    }}>
                      {kpis.totalB >= kpis.totalA ? "+" : ""}{fmtINR(kpis.totalB - kpis.totalA, { compact: true })}
                    </span>
                    <span className={`chip ${kpis.totalB >= kpis.totalA ? "ok" : "danger"}`} style={{ fontSize: 13, padding: "3px 10px" }}>
                      {kpis.totalB >= kpis.totalA ? "+" : ""}{kpis.totalPct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bar" style={{ height: 6, marginTop: 14, borderRadius: 99, background: "var(--inset-2)", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, Math.abs(parseFloat(kpis.totalPct)) * 10 + 50)}%`,
                background: kpis.totalB >= kpis.totalA
                  ? "linear-gradient(90deg, #10B981, #34D399)"
                  : "linear-gradient(90deg, #EF4444, #F87171)",
                borderRadius: 99,
                transition: "width 0.6s ease"
              }}/>
            </div>
          </div>

          {/* Variance table */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-head">
              <div className="card-title">
                Employee Variance Detail
                <small>{filtered.length} employees · sorted by absolute change</small>
              </div>
              <div className="row gap-3">
                <button className="btn ghost sm" onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}>
                  <Icon name="sort" size={11}/>{sortDir === "desc" ? "Largest first" : "Smallest first"}
                </button>
              </div>
            </div>

            {/* Filter pills */}
            <div className="row gap-3" style={{ marginBottom: 14, flexWrap: "wrap" }}>
              {FILTER_PILLS.map(p => (
                <button
                  key={p.key}
                  className="btn ghost sm"
                  onClick={() => setFilter(p.key)}
                  style={{
                    background: filter === p.key ? "rgba(16,185,129,0.12)" : "var(--inset-2)",
                    borderColor: filter === p.key ? "rgba(16,185,129,0.4)" : "var(--border)",
                    color: filter === p.key ? "var(--accent-bright)" : "var(--text-mid)",
                  }}
                >
                  {p.label}
                  {p.key !== "all" && (
                    <span style={{
                      marginLeft: 4,
                      background: "var(--inset-3)",
                      borderRadius: 99,
                      padding: "1px 6px",
                      fontSize: 9.5,
                    }}>
                      {p.key === "increases" ? kpis.increased
                       : p.key === "decreases" ? kpis.decreased
                       : p.key === "new" ? kpis.newJoiners
                       : sorted.filter(r => r.status === "No Change").length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Dept</th>
                    <th className="right">{monthA} Gross</th>
                    <th className="right">{monthB} Gross</th>
                    <th className="right">Change (₹)</th>
                    <th className="right">Change (%)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
                        No employees match this filter.
                      </td>
                    </tr>
                  )}
                  {filtered.map(r => {
                    const isPositive = r.change > 0;
                    const isNegative = r.change < 0;
                    const changeColor = isPositive ? "#10B981" : isNegative ? "#F87171" : "var(--text-muted)";
                    return (
                      <tr key={r.id}>
                        <td>
                          <div className="row-emp">
                            <Avatar name={r.name}/>
                            <div>
                              <div className="row-emp-name">{r.name}</div>
                              <div className="row-emp-meta">{r.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="chip" style={{ fontSize: 10.5 }}>{r.dept}</span>
                        </td>
                        <td className="right mono fs-sm">{fmtINR(r.grossA)}</td>
                        <td className="right mono fs-sm">{fmtINR(r.grossB)}</td>
                        <td className="right mono fs-sm fw-600" style={{ color: changeColor }}>
                          <span className="row gap-1" style={{ justifyContent: "flex-end", alignItems: "center" }}>
                            {isPositive && <Icon name="arrowUp" size={10}/>}
                            {isNegative && <Icon name="arrowDown" size={10}/>}
                            {isPositive ? "+" : ""}{fmtINR(r.change)}
                          </span>
                        </td>
                        <td className="right mono fs-sm" style={{ color: changeColor }}>
                          {isPositive ? "+" : ""}{r.changePct.toFixed(2)}%
                        </td>
                        <td>
                          <span className={statusChipClass(r.status)} style={{ fontSize: 10.5 }}>{r.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dept-wise variance summary */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                Department-wise Variance Summary
                <small>{deptSummary.length} departments</small>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th className="right">Employees</th>
                    <th className="right">{monthA} Total</th>
                    <th className="right">{monthB} Total</th>
                    <th className="right">Delta (₹)</th>
                    <th style={{ width: 140 }}>Change Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {deptSummary.map(d => {
                    const isPos = d.delta >= 0;
                    const maxDelta = Math.max(...deptSummary.map(x => Math.abs(x.delta)));
                    const barPct = maxDelta > 0 ? (Math.abs(d.delta) / maxDelta) * 100 : 0;
                    return (
                      <tr key={d.dept}>
                        <td>
                          <span className="fw-600">{d.dept}</span>
                        </td>
                        <td className="right mono fs-sm">{d.employees}</td>
                        <td className="right mono fs-sm">{fmtINR(d.totalA, { compact: true })}</td>
                        <td className="right mono fs-sm">{fmtINR(d.totalB, { compact: true })}</td>
                        <td className="right mono fs-sm fw-600" style={{ color: isPos ? "#10B981" : "#F87171" }}>
                          {isPos ? "+" : ""}{fmtINR(d.delta, { compact: true })}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div className="bar" style={{ flex: 1, height: 6, borderRadius: 99, background: "var(--inset-2)", overflow: "hidden" }}>
                              <div style={{
                                height: "100%",
                                width: `${barPct}%`,
                                background: isPos
                                  ? "linear-gradient(90deg, #10B981, #34D399)"
                                  : "linear-gradient(90deg, #EF4444, #F87171)",
                                borderRadius: 99,
                              }}/>
                            </div>
                            <span className="mono fs-xs muted" style={{ minWidth: 36, textAlign: "right" }}>
                              {barPct.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Empty state before compare */}
      {!compared && (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ marginBottom: 12, opacity: 0.35 }}>
            <Icon name="chart" size={48}/>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Select two months and click Compare</div>
          <div className="muted fs-sm">Side-by-side salary analysis for all employees will appear here.</div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { PayrollVariance });
