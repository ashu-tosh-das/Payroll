// Dashboard — payroll analytics overview with client-integrated reporting

const DASH_MONTHS = [
  "Nov 2025", "Oct 2025", "Sep 2025", "Aug 2025",
  "Jul 2025", "Jun 2025", "May 2025", "Apr 2025",
];

// Monthly KPI data keyed by period
const MONTH_KPI = {
  "Nov 2025": { cost: 4.82, hc: 247, anomalies: 3, compliance: 98, delta: "+0.83%", hcDelta: "+3" },
  "Oct 2025": { cost: 4.78, hc: 244, anomalies: 0, compliance: 99, delta: "+0.43%", hcDelta: "+2" },
  "Sep 2025": { cost: 4.71, hc: 241, anomalies: 1, compliance: 98, delta: "+1.51%", hcDelta: "+3" },
  "Aug 2025": { cost: 4.64, hc: 238, anomalies: 2, compliance: 97, delta: "+1.31%", hcDelta: "+6" },
  "Jul 2025": { cost: 4.58, hc: 232, anomalies: 0, compliance: 99, delta: "+1.45%", hcDelta: "+3" },
  "Jun 2025": { cost: 4.51, hc: 229, anomalies: 1, compliance: 98, delta: "+1.48%", hcDelta: "+5" },
  "May 2025": { cost: 4.42, hc: 224, anomalies: 0, compliance: 99, delta: "+0.91%", hcDelta: "+4" },
  "Apr 2025": { cost: 4.38, hc: 220, anomalies: 2, compliance: 96, delta: "+0.69%", hcDelta: "+2" },
};

// Per-client dashboard figures for any given month
function getClientDashData(month) {
  const seed  = DASH_MONTHS.indexOf(month);
  const scale = 1 - seed * 0.008;
  return CLIENTS.filter(c => c.status === "Active").map((c, ci) => {
    const base  = [1.48, 1.22, 1.04, 0.96][ci] || 1.0;
    const gross = parseFloat((base * scale).toFixed(2));
    const ded   = parseFloat((gross * 0.18).toFixed(2));
    const net   = parseFloat((gross - ded).toFixed(2));
    return { client: c, gross, ded, net, emps: c.empCount || 0 };
  });
}

const Dashboard = ({ onNav, onSub }) => {
  const trend   = COST_TREND.map(d => d.v);
  const hcTrend = HEADCOUNT_TREND.map(d => d.v);
  const deptSegments = DEPARTMENTS.map(d => ({ label: d.name, value: d.cost, color: d.color }));
  const totalCost    = DEPARTMENTS.reduce((a, d) => a + d.cost, 0);

  const [trendRange,         setTrendRange]         = useState("7M");
  const [selectedMonth,      setSelectedMonth]      = useState("Nov 2025");
  const [showCombinedReport, setShowCombinedReport] = useState(false);

  const kpi        = MONTH_KPI[selectedMonth] || MONTH_KPI["Nov 2025"];
  const clientData = getClientDashData(selectedMonth);
  const consoGross = clientData.reduce((a, d) => a + d.gross, 0);
  const consoDed   = clientData.reduce((a, d) => a + d.ded,   0);
  const consoNet   = clientData.reduce((a, d) => a + d.net,   0);
  const consoEmps  = clientData.reduce((a, d) => a + d.emps,  0);

  return (
    <>
      <div className="page">
        <PageHead
          title="Good afternoon, Priya"
          subtitle={`${selectedMonth} payroll is awaiting your verification — ${kpi.anomalies} anomalies flagged`}
        >
          {/* DASH-001: Month selector */}
          <select
            className="select"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ minWidth: 110 }}
          >
            {DASH_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button className="btn ghost" onClick={() => {
            window.toast(`Exporting ${selectedMonth} payroll summary…`, {
              icon: "download", tone: "info",
              sub: "PDF will be ready in a few seconds",
            });
          }}><Icon name="download"/>Export</button>
          <button className="btn primary" onClick={() => onNav?.("payroll")}>
            <Icon name="play"/>Continue {selectedMonth.split(" ")[0]} run
          </button>
        </PageHead>

        {/* ── KPI Row ───────────────────────────────────────────── */}
        <div className="grid g-cols-4">
          <div className="card kpi">
            <div className="kpi-label"><Icon name="coins"/>{selectedMonth} payroll cost</div>
            <div className="kpi-value">₹{kpi.cost.toFixed(2)}<small>Cr</small></div>
            <div className="row between">
              <span className="kpi-delta up"><Icon name="arrowUp" size={11}/>{kpi.delta} vs prev</span>
              <span className="muted fs-xs">est ₹{(kpi.cost * 1.004).toFixed(2)} Cr</span>
            </div>
            <div className="kpi-spark"><Sparkline data={trend} width={220} height={32}/></div>
          </div>

          <div className="card kpi">
            <div className="kpi-label"><Icon name="employees"/>Headcount</div>
            <div className="kpi-value">{kpi.hc}</div>
            <div className="row between">
              <span className="kpi-delta up"><Icon name="arrowUp" size={11}/>{kpi.hcDelta} this month</span>
              <span className="muted fs-xs">2 in notice</span>
            </div>
            <div className="kpi-spark">
              <Sparkline data={hcTrend} color="#60A5FA" width={220} height={32}/>
            </div>
          </div>

          <div className="card kpi">
            <div className="kpi-label"><Icon name="sparkle"/>AI anomalies</div>
            <div className="kpi-value" style={{ color: "#FCA5B0" }}>{kpi.anomalies}</div>
            <div className="row between">
              <span className="kpi-delta down"><Icon name="arrowDown" size={11}/>−1 vs prev</span>
              <span className="muted fs-xs">₹52,800 held</span>
            </div>
            <div className="kpi-spark">
              <StackedBars data={ANOMALY_HISTORY} height={32} showLabels={false}
                keys={[
                  { key: "high", label: "High", color: "#F43F5E" },
                  { key: "med",  label: "Med",  color: "#F59E0B" },
                  { key: "low",  label: "Low",  color: "#60A5FA" },
                ]}/>
            </div>
          </div>

          <div className="card kpi">
            <div className="kpi-label"><Icon name="shield"/>Compliance score</div>
            <div className="kpi-value">{kpi.compliance}<small>/100</small></div>
            <div className="row between">
              <span className="chip ok"><span className="dot"/>PF · ESI · TDS · LWF</span>
            </div>
            <div className="bar" style={{ marginTop: 8 }}>
              <div style={{ width: `${kpi.compliance}%` }}/>
            </div>
          </div>
        </div>

        {/* ── Row 2 — cost trend + dept distribution ────────────── */}
        <div className="grid g-cols-3" style={{ marginTop: 12 }}>
          <div className="card" style={{ gridColumn: "span 2" }}>
            <div className="card-head">
              <div className="card-title">Payroll cost trend
                <small>Monthly outflow · last 7 months</small>
              </div>
              <div className="tabs">
                <button data-active={trendRange === "7M"} onClick={() => setTrendRange("7M")}>7M</button>
                <button data-active={trendRange === "12M"} onClick={() => setTrendRange("12M")}>12M</button>
                <button data-active={trendRange === "FY"}  onClick={() => setTrendRange("FY")}>FY</button>
              </div>
            </div>
            <CostTrendChart range={trendRange}/>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">Department mix
                <small>Cost share · {selectedMonth.split(" ")[0]}</small>
              </div>
              <span className="chip">{fmtINR(totalCost, { compact: true })}</span>
            </div>
            <div className="row gap-7 center" style={{ marginTop: 4 }}>
              <Donut segments={deptSegments} size={132} thickness={16}
                centerValue="8" centerLabel="Depts"/>
              <div className="col gap-3" style={{ flex: 1, fontSize: 11.5 }}>
                {DEPARTMENTS.slice(0, 5).map(d => {
                  const pct = (d.cost / totalCost * 100).toFixed(1);
                  return (
                    <div key={d.id} className="row between gap-3">
                      <div className="row gap-3 center">
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }}/>
                        <span style={{ color: "var(--text-mid)" }}>{d.name}</span>
                      </div>
                      <span className="mono muted">{pct}%</span>
                    </div>
                  );
                })}
                <div className="muted fs-xs" style={{ marginTop: 2 }}>+ 3 more</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 3 — approval status + AI insights ─────────────── */}
        <div className="grid g-cols-3" style={{ marginTop: 12 }}>
          <div className="card" style={{ gridColumn: "span 2" }}>
            <div className="card-head">
              <div className="card-title">{selectedMonth} payroll · approval workflow
                <small>3 of 6 stages complete · due {selectedMonth.split(" ")[0]} 28</small>
              </div>
              <span className="chip info"><span className="live-dot"/>In review</span>
            </div>
            <ApprovalRow steps={APPROVAL_STEPS}/>
            <div className="row gap-3" style={{ marginTop: 12, justifyContent: "flex-end" }}>
              <button className="btn ghost sm" onClick={() => onNav?.("anomalies")}>
                <Icon name="alert"/>View {kpi.anomalies} anomalies
              </button>
              <button className="btn primary sm" onClick={() => onNav?.("payroll")}>
                Open payroll run<Icon name="arrowRight" size={11}/>
              </button>
            </div>
          </div>

          <div className="card" style={{
            background: "linear-gradient(160deg, rgba(16,185,129,0.10), rgba(167,139,250,0.06))",
            borderColor: "rgba(16,185,129,0.20)",
          }}>
            <div className="card-head">
              <div className="row gap-3 center">
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: "linear-gradient(135deg, #10B981, #34D399)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 14px rgba(16,185,129,0.4)",
                }}>
                  <Icon name="sparkle" size={14} color="#052E1A"/>
                </div>
                <div className="card-title">Atlas insights<small>AI summary · just now</small></div>
              </div>
            </div>
            <div className="col gap-5" style={{ fontSize: 12 }}>
              <div style={{ color: "var(--text)", lineHeight: 1.5 }}>
                {selectedMonth} payroll is <b>0.8% above forecast</b> driven by 3 new joiners
                in Engineering. OT is concentrated in 4 employees — review Akshay Sharma's spike.
              </div>
              <div className="divider"/>
              <Recommendation icon="alert" tone="warn" text="Hold Akshay Sharma's OT pending skip-level sign-off"/>
              <Recommendation icon="coins" tone="ok"   text="Run TDS quarterly (24Q) — due in 11 days"/>
              <Recommendation icon="cpu"   tone="info" text="Bonus accrual on track — provision ₹38L for Q4"/>
            </div>
          </div>
        </div>

        {/* ── Row 4 — Quick stats ────────────────────────────────── */}
        <div className="grid g-cols-4" style={{ marginTop: 12 }}>
          <MiniStat label="Avg CTC"          value="₹19.4L" delta="+2.1% YoY"   tone="up" sub="across all bands"/>
          <MiniStat label="Median tenure"    value="2.8 yr" delta="+0.3 vs Q2"  tone="up" sub="60% > 2 yrs"/>
          <MiniStat label="Attrition (TTM)"  value="11.4%"  delta="−1.8 pts"    tone="up" sub="industry: 14.2%"/>
          <MiniStat label="Pay equity ratio" value="0.96"   delta="↑ improving" tone="up" sub="target 1.00"/>
        </div>

        {/* ── Row 5 — DASH-002/003: Client Payroll section ──────── */}
        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-head">
            <div className="card-title">Client payroll · {selectedMonth}
              <small>
                {CLIENTS.filter(c => c.status === "Active").length} active clients · {consoEmps} employees
              </small>
            </div>
            <div className="row gap-3">
              <span className="chip ok">
                <span className="live-dot"/>{clientData.length} clients active
              </span>
              <button className="btn primary sm" onClick={() => setShowCombinedReport(true)}>
                <Icon name="report" size={11}/>View Combined Report
              </button>
            </div>
          </div>

          {/* DASH-002: Per-client cards */}
          <div className="grid g-cols-4" style={{ gap: 10 }}>
            {clientData.map(d => (
              <div key={d.client.id} style={{
                padding: "12px 14px", borderRadius: 10,
                background: "linear-gradient(180deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))",
                border: "1px solid rgba(16,185,129,0.20)",
              }}>
                <div className="row between center" style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5 }}>{d.client.code}</div>
                  <span className="chip ok" style={{ fontSize: 9.5 }}>Active</span>
                </div>
                <div className="fs-xs muted" style={{ marginBottom: 10, lineHeight: 1.4 }}>
                  {d.client.name}
                </div>
                <div className="col gap-2" style={{ fontSize: 11 }}>
                  <div className="row between">
                    <span className="muted">Employees</span>
                    <span className="fw-600">{d.emps}</span>
                  </div>
                  <div className="row between">
                    <span className="muted">Gross</span>
                    <span className="mono">₹{d.gross.toFixed(2)} Cr</span>
                  </div>
                  <div className="row between">
                    <span className="muted">Deductions</span>
                    <span className="mono" style={{ color: "#FCA5B0" }}>−₹{d.ded.toFixed(2)} Cr</span>
                  </div>
                  <div className="row between">
                    <span className="muted">Net Pay</span>
                    <span className="mono fw-600" style={{ color: "var(--accent-bright)" }}>
                      ₹{d.net.toFixed(2)} Cr
                    </span>
                  </div>
                </div>
                <button className="btn ghost sm" style={{ width: "100%", marginTop: 10 }}
                  onClick={() => onSub?.("client-payroll", { clientId: d.client.id, clientName: d.client.name })}>
                  View payroll<Icon name="arrowRight" size={9}/>
                </button>
              </div>
            ))}
          </div>

          {/* DASH-003: Consolidated totals row */}
          <div style={{
            marginTop: 12, padding: "12px 16px", borderRadius: 10,
            background: "var(--inset-2)", border: "1px solid var(--border)",
          }}>
            <div className="row between center">
              <div className="row gap-4 center">
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Consolidated · All Clients</div>
                <span className="chip" style={{ fontSize: 9.5 }}>{consoEmps} employees</span>
                <span className="chip" style={{ fontSize: 9.5 }}>{selectedMonth}</span>
              </div>
              <div className="row gap-8">
                <div style={{ textAlign: "right" }}>
                  <div className="fs-xs muted">Total Gross</div>
                  <div className="mono fw-600" style={{ fontSize: 13 }}>₹{consoGross.toFixed(2)} Cr</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="fs-xs muted">Total Deductions</div>
                  <div className="mono" style={{ fontSize: 13, color: "#FCA5B0" }}>
                    −₹{consoDed.toFixed(2)} Cr
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="fs-xs muted">Total Net Pay</div>
                  <div className="mono fw-600" style={{ fontSize: 16, color: "var(--accent-bright)" }}>
                    ₹{consoNet.toFixed(2)} Cr
                  </div>
                </div>
                <button className="btn primary sm" onClick={() => setShowCombinedReport(true)}>
                  <Icon name="report" size={11}/>Combined Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 6 — Recent activity + Compliance calendar ─────── */}
        <div className="grid g-cols-3" style={{ marginTop: 12 }}>
          <div className="card" style={{ gridColumn: "span 2" }}>
            <div className="card-head">
              <div className="card-title">Recent activity</div>
              <button className="btn ghost sm" onClick={() => onNav?.("audit")}>
                View audit log<Icon name="arrowRight" size={11}/>
              </button>
            </div>
            <div className="col gap-4">
              {AUDIT_LOG.slice(0, 5).map(e => (
                <div key={e.id} className="row gap-5"
                  style={{ padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                  <Avatar name={e.actor} size={24}/>
                  <div className="flex-1">
                    <div className="row gap-3 center" style={{ fontSize: 12 }}>
                      <b style={{ fontWeight: 500 }}>{e.actor}</b>
                      <span className="muted">{e.action.toLowerCase()}</span>
                      <span>{e.target}</span>
                    </div>
                    <div className="fs-xs muted">{e.at} · {e.ip}</div>
                  </div>
                  <span className={`chip ${e.risk === "high" ? "danger" : e.risk === "med" ? "warn" : ""}`}>
                    {e.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">Compliance calendar<small>Next 30 days</small></div>
            </div>
            <div className="col gap-4">
              <DueRow date="Nov 28" days="3d"  title="Nov salary disbursement" sub="HDFC PayConnect · 247 emp" tone="info"/>
              <DueRow date="Nov 30" days="5d"  title="ESI return filing"       sub="ESIC portal"              tone="warn"/>
              <DueRow date="Dec 07" days="12d" title="TDS deposit (Nov)"       sub="Challan 281 · ₹64.3L"    tone="warn"/>
              <DueRow date="Dec 15" days="20d" title="PF ECR upload"           sub="EPFO · UAN-linked"        tone=""/>
              <DueRow date="Dec 25" days="30d" title="Dec payroll cut-off"     sub="Attendance freeze"        tone=""/>
            </div>
          </div>
        </div>
      </div>

      {/* ── DASH-004: Combined Report full-page overlay ─────────── */}
      {showCombinedReport && (
        <CombinedReportOverlay
          month={selectedMonth}
          clientData={clientData}
          consoGross={consoGross}
          consoDed={consoDed}
          consoNet={consoNet}
          consoEmps={consoEmps}
          onClose={() => setShowCombinedReport(false)}
        />
      )}
    </>
  );
};

// ── DASH-004: Combined Report overlay ──────────────────────────
const CombinedReportOverlay = ({ month, clientData, consoGross, consoDed, consoNet, consoEmps, onClose }) => (
  <div
    style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.72)",
      backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div style={{
      background: "var(--canvas)", borderRadius: 16, width: "100%", maxWidth: 880,
      border: "1px solid var(--border)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      maxHeight: "90vh", overflow: "auto",
    }}>
      {/* Modal header */}
      <div style={{
        padding: "20px 24px 16px",
        borderBottom: "1px solid var(--border)",
        background: "linear-gradient(180deg, rgba(16,185,129,0.08), transparent)",
      }}>
        <div className="row between center">
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>
              Combined Payroll Report · {month}
            </div>
            <div className="fs-xs muted" style={{ marginTop: 3 }}>
              All active clients · {consoEmps} employees · Source One Payroll Cloud
            </div>
          </div>
          <div className="row gap-3">
            <button className="btn ghost sm" onClick={() => window.toast(`Combined Payroll ${month}.xlsx`, { icon: "download", tone: "info", sub: "Excel file ready — check your downloads" })}>
              <Icon name="download"/>Download Excel
            </button>
            <button className="btn ghost sm" onClick={() => window.toast(`Combined Payroll ${month}.pdf`, { icon: "download", tone: "info", sub: "PDF rendering… will open in a new tab" })}>
              <Icon name="download"/>PDF
            </button>
            <button className="iconbtn" onClick={onClose} title="Close"
              style={{ width: 30, height: 30 }}>
              <Icon name="x" size={14}/>
            </button>
          </div>
        </div>

        {/* Consolidated KPI strip */}
        <div className="grid g-cols-4" style={{ marginTop: 16, gap: 10 }}>
          {[
            { label: "Total Employees",  value: consoEmps.toString(),            color: "var(--text)" },
            { label: "Total Gross",      value: `₹${consoGross.toFixed(2)} Cr`, color: "var(--text)" },
            { label: "Total Deductions", value: `₹${consoDed.toFixed(2)} Cr`,   color: "#FCA5B0" },
            { label: "Total Net Pay",    value: `₹${consoNet.toFixed(2)} Cr`,   color: "var(--accent-bright)" },
          ].map(k => (
            <div key={k.label} style={{
              padding: "10px 12px", borderRadius: 10,
              background: "var(--inset-2)", border: "1px solid var(--border)",
            }}>
              <div className="fs-xs muted">{k.label}</div>
              <div className="fw-600 mono" style={{ fontSize: 15, marginTop: 4, color: k.color }}>
                {k.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal body */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{
          fontSize: 11, fontWeight: 600, marginBottom: 12,
          textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)",
        }}>
          Client-wise Breakdown
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Client</th>
                <th>Industry</th>
                <th>Location</th>
                <th className="right">Employees</th>
                <th className="right">Gross (Cr)</th>
                <th className="right">Deductions (Cr)</th>
                <th className="right">Net Pay (Cr)</th>
                <th className="right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {clientData.map(d => {
                const pct = ((d.net / consoNet) * 100).toFixed(1);
                return (
                  <tr key={d.client.id}>
                    <td>
                      <div className="row gap-3 center">
                        <span style={{
                          padding: "2px 7px", borderRadius: 4,
                          fontSize: 10, fontWeight: 700,
                          background: "rgba(16,185,129,0.12)", color: "#34D399",
                        }}>
                          {d.client.code}
                        </span>
                        <span style={{ fontSize: 12 }}>{d.client.name}</span>
                      </div>
                    </td>
                    <td className="muted">{d.client.industry}</td>
                    <td className="muted">{d.client.location}</td>
                    <td className="right">{d.emps}</td>
                    <td className="right num">₹{d.gross.toFixed(2)}</td>
                    <td className="right num" style={{ color: "#FCA5B0" }}>−₹{d.ded.toFixed(2)}</td>
                    <td className="right num fw-600" style={{ color: "var(--accent-bright)" }}>
                      ₹{d.net.toFixed(2)}
                    </td>
                    <td className="right">
                      <div className="row gap-4 center" style={{ justifyContent: "flex-end" }}>
                        <div style={{
                          height: 5, width: 60, borderRadius: 3,
                          background: "var(--inset-3)", overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%", width: `${pct}%`,
                            background: "linear-gradient(90deg, #10B981, #34D399)",
                            borderRadius: 3,
                          }}/>
                        </div>
                        <span className="mono muted" style={{ fontSize: 10.5 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 600 }}>
                <td colSpan={3}>Total · All Clients</td>
                <td className="right">{consoEmps}</td>
                <td className="right num">₹{consoGross.toFixed(2)}</td>
                <td className="right num" style={{ color: "#FCA5B0" }}>−₹{consoDed.toFixed(2)}</td>
                <td className="right num" style={{ color: "var(--accent-bright)" }}>
                  ₹{consoNet.toFixed(2)}
                </td>
                <td className="right mono muted">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Gross vs Net stacked bars */}
        <div style={{ marginTop: 20 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, marginBottom: 12,
            textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)",
          }}>
            Gross vs Net Comparison
          </div>
          <div className="col gap-5">
            {clientData.map(d => {
              const netPct = Math.round((d.net / d.gross) * 100);
              return (
                <div key={d.client.id} className="row gap-4 center">
                  <div style={{ width: 56, fontSize: 11, fontWeight: 600 }}>{d.client.code}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", height: 20, borderRadius: 6, overflow: "hidden" }}>
                      <div style={{
                        width: `${netPct}%`,
                        background: "linear-gradient(90deg, #10B981, #34D399)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 700, color: "#052E1A",
                      }}>
                        Net {netPct}%
                      </div>
                      <div style={{
                        flex: 1,
                        background: "rgba(252,165,176,0.22)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, color: "#FCA5B0",
                      }}>
                        Ded {100 - netPct}%
                      </div>
                    </div>
                  </div>
                  <div className="mono muted" style={{ fontSize: 10.5, width: 80, textAlign: "right" }}>
                    ₹{d.gross.toFixed(2)} Cr
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="row gap-3" style={{ marginTop: 24, justifyContent: "flex-end" }}>
          <button className="btn ghost" onClick={onClose}>Close</button>
          <button className="btn primary" onClick={() => {
            window.toast(`Exporting full report for ${month}…`, {
              icon: "download", tone: "info",
              sub: "Consolidated_Payroll_" + month.replace(" ", "_") + ".xlsx — check your downloads",
            });
          }}>
            <Icon name="download"/>Export Full Report
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Sub-components ──────────────────────────────────────────────

const CostTrendChart = ({ range = "7M" }) => {
  const fullData   = COST_TREND;
  const fyData     = [
    { m: "Apr", v: 4.38 }, { m: "May", v: 4.42 }, { m: "Jun", v: 4.51 }, { m: "Jul", v: 4.58 },
    { m: "Aug", v: 4.64 }, { m: "Sep", v: 4.71 }, { m: "Oct", v: 4.78 }, { m: "Nov", v: 4.82 },
  ];
  const twelveData = [
    { m: "Dec'24", v: 4.21 }, { m: "Jan", v: 4.28 }, { m: "Feb", v: 4.31 }, { m: "Mar", v: 4.35 },
    { m: "Apr",    v: 4.38 }, { m: "May", v: 4.42 }, { m: "Jun", v: 4.51 }, { m: "Jul", v: 4.58 },
    { m: "Aug",    v: 4.64 }, { m: "Sep", v: 4.71 }, { m: "Oct", v: 4.78 }, { m: "Nov", v: 4.82 },
  ];
  const data = range === "FY" ? fyData : range === "12M" ? twelveData : fullData;
  const h = 160;
  const max = Math.max(...data.map(d => d.v));
  const min = Math.min(...data.map(d => d.v)) * 0.95;
  const yRange = max - min;
  return (
    <div style={{ position: "relative", height: 200 }}>
      <svg width="100%" height={h} viewBox={`0 0 700 ${h}`} preserveAspectRatio="none"
        style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#10B981" stopOpacity="0.32"/>
            <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="costLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#34D399"/>
            <stop offset="100%" stopColor="#10B981"/>
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1="0" x2="700" y1={20 + i * 35} y2={20 + i * 35}
            stroke="var(--inset-3)" strokeDasharray="2 4"/>
        ))}
        {(() => {
          const pts = data.map((d, i) => [
            (i / (data.length - 1)) * 680 + 10,
            h - 20 - ((d.v - min) / yRange) * (h - 40),
          ]);
          const d   = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
          const fillD = d + ` L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;
          return (
            <>
              <path d={fillD} fill="url(#costFill)"/>
              <path d={d} fill="none" stroke="url(#costLine)" strokeWidth="2" strokeLinecap="round"/>
              {pts.map((p, i) => (
                <g key={i}>
                  <circle cx={p[0]} cy={p[1]} r="4" fill="#0A0F1B" stroke="#10B981" strokeWidth="2"/>
                </g>
              ))}
              {pts.map((p, i) => (
                <text key={"t" + i} x={p[0]} y={p[1] - 12} fill="#E8ECF4"
                  fontSize="10" fontWeight="600" textAnchor="middle"
                  style={{ fontVariantNumeric: "tabular-nums" }}>
                  ₹{data[i].v.toFixed(2)}Cr
                </text>
              ))}
            </>
          );
        })()}
      </svg>
      <div className="row between"
        style={{ marginTop: 8, padding: "0 4px", fontSize: 10.5, color: "var(--text-muted)" }}>
        {data.map((d, i) => <span key={i}>{d.m}</span>)}
      </div>
    </div>
  );
};

const ApprovalRow = ({ steps }) => {
  const doneCount  = steps.filter(s => s.status === "done").length;
  const n          = steps.length;
  // Center of first/last node = half a column-width from each edge
  const edgePct    = n > 0 ? (50 / n) : 4;
  // Fill fraction: 0 when nothing done, 1 when all done — clamp strictly to [0,1]
  const fillFrac   = n > 1
    ? Math.min(1, Math.max(0, (doneCount - 1) / (n - 1)))
    : (doneCount > 0 ? 1 : 0);
  return (
    <div style={{ position: "relative", padding: "12px 0 6px", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: `${edgePct}%`, right: `${edgePct}%`, top: 21, height: 2,
                    background: "var(--inset-5)" }}/>
      <div style={{ position: "absolute", left: `${edgePct}%`, top: 21, height: 2,
                    width: `calc((100% - ${edgePct * 2}%) * ${fillFrac})`,
                    background: "linear-gradient(90deg, #10B981, #34D399)",
                    boxShadow: "0 0 8px rgba(16,185,129,0.5)",
                    transition: "width 360ms cubic-bezier(.4,0,.2,1)" }}/>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
                    gap: 4, position: "relative" }}>
        {steps.map((s, i) => {
          const isDone   = s.status === "done";
          const isActive = s.status === "active";
          return (
            <div key={s.id} className="col gap-3 center"
              style={{ textAlign: "center", padding: "0 4px" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isDone
                  ? "linear-gradient(135deg, #10B981, #047857)"
                  : isActive ? "rgba(16,185,129,0.10)" : "var(--inset-3)",
                border: `1.5px solid ${isDone ? "#10B981" : isActive ? "#34D399" : "rgba(255,255,255,0.10)"}`,
                boxShadow: isActive ? "0 0 0 4px rgba(16,185,129,0.15)"
                           : isDone ? "0 0 12px rgba(16,185,129,0.3)" : "none",
                color: isDone ? "#fff" : isActive ? "#34D399" : "var(--text-muted)",
                fontSize: 11, fontWeight: 600,
                animation: isActive ? "pulse-dot 2s ease-in-out infinite" : "none",
              }}>
                {isDone ? <Icon name="check" size={13}/> : s.id}
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.2,
                            color: isActive ? "var(--text)" : isDone ? "var(--text-mid)" : "var(--text-muted)" }}>
                {s.name}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.3 }}>
                {s.by}<br/><span className="dim">{s.at}</span>
                {s.note && (
                  <><br/>
                    <span className="chip warn" style={{ marginTop: 2, fontSize: 9 }}>{s.note}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Recommendation = ({ icon, tone, text }) => {
  const toneMap = {
    ok:   { color: "#34D399", bg: "rgba(16,185,129,0.10)" },
    warn: { color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
    info: { color: "#60A5FA", bg: "rgba(96,165,250,0.10)" },
  };
  const t = toneMap[tone] || toneMap.info;
  return (
    <div className="row gap-4" style={{ fontSize: 11.5, lineHeight: 1.4 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        background: t.bg, color: t.color, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}><Icon name={icon} size={12}/></div>
      <span style={{ color: "var(--text-mid)" }}>{text}</span>
    </div>
  );
};

const MiniStat = ({ label, value, delta, tone, sub }) => (
  <div className="card kpi" style={{ padding: "12px 14px" }}>
    <div className="kpi-label" style={{ marginBottom: 4 }}>{label}</div>
    <div className="row between" style={{ alignItems: "baseline" }}>
      <div className="kpi-value" style={{ fontSize: 20 }}>{value}</div>
      <span className={`kpi-delta ${tone}`} style={{ fontSize: 10.5 }}>{delta}</span>
    </div>
    <div className="muted fs-xs">{sub}</div>
  </div>
);

const DueRow = ({ date, days, title, sub, tone }) => {
  const toneMap = { warn: "warn", info: "info", danger: "danger" };
  return (
    <div className="row gap-4" style={{ padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ width: 48, textAlign: "center", flexShrink: 0 }}>
        <div className="fs-xs muted" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {date.split(" ")[0]}
        </div>
        <div className="fw-600" style={{ fontSize: 14, lineHeight: 1, marginTop: 2 }}>
          {date.split(" ")[1]}
        </div>
      </div>
      <div className="flex-1">
        <div style={{ fontSize: 12, fontWeight: 500 }}>{title}</div>
        <div className="fs-xs muted">{sub}</div>
      </div>
      <span className={`chip ${toneMap[tone] || ""}`}>{days}</span>
    </div>
  );
};

Object.assign(window, {
  Dashboard, ApprovalRow, MiniStat, DueRow, Recommendation,
  CostTrendChart, CombinedReportOverlay,
});
