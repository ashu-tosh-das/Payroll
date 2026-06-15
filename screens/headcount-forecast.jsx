// Headcount & Payroll Forecast — 6-month forward projection


// ── Month labels for the 6-month projection window ────────────
const FC_MONTHS = ["Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026"];

// ── Starting values from global trend data ───────────────────
function getStartValues() {
  const startHC   = HEADCOUNT_TREND[HEADCOUNT_TREND.length - 1].v; // 247
  const startCost = COST_TREND[COST_TREND.length - 1].v;           // 4.82 Cr
  return { startHC, startCost };
}

// ── Core projection engine ───────────────────────────────────
function buildProjection({ startHC, startCostCr, attritionRate, joinersPerMonth, incrementMonth, incrementPct, avgNewCTC }) {
  const rows = [];
  let hc       = startHC;
  let avgCTC   = (startCostCr * 1e7) / startHC; // per-person annual CTC in INR

  for (let i = 0; i < 6; i++) {
    const openingHC = hc;
    const joiners   = joinersPerMonth;
    const exits     = Math.round(openingHC * (attritionRate / 100));
    const closingHC = openingHC + joiners - exits;

    // In month i+1 (1-indexed) if it matches incrementMonth, apply increment
    let newAvgCTC = avgCTC;
    if (i + 1 === incrementMonth) {
      newAvgCTC = avgCTC * (1 + incrementPct / 100);
    }

    // Blend new joiners' CTC into average
    const blendedCTC = closingHC > 0
      ? (openingHC * newAvgCTC + joiners * avgNewCTC - exits * newAvgCTC) / closingHC
      : newAvgCTC;

    const monthlyPayroll = (blendedCTC / 12) * closingHC;
    const prevPayroll    = rows.length > 0 ? rows[rows.length - 1].monthlyPayroll : (startCostCr * 1e7) / 12;
    const momPct         = ((monthlyPayroll - prevPayroll) / prevPayroll) * 100;

    rows.push({
      month:          FC_MONTHS[i],
      openingHC,
      joiners,
      exits,
      closingHC,
      avgCTC:         blendedCTC,
      monthlyPayroll,
      momPct,
    });

    hc     = closingHC;
    avgCTC = blendedCTC;
  }
  return rows;
}

// ── Dual-axis SVG line+area chart ────────────────────────────
function ForecastChart({ rows }) {
  const W = 700, H = 220, PL = 60, PR = 70, PT = 20, PB = 40;
  const iW = W - PL - PR;
  const iH = H - PT - PB;

  const hcVals      = rows.map(r => r.closingHC);
  const payrollVals = rows.map(r => r.monthlyPayroll / 1e6); // in lakhs

  const hcMin   = Math.min(...hcVals) * 0.97;
  const hcMax   = Math.max(...hcVals) * 1.03;
  const prMin   = Math.min(...payrollVals) * 0.95;
  const prMax   = Math.max(...payrollVals) * 1.05;

  const xOf   = i => PL + (i / (rows.length - 1)) * iW;
  const yOfHC = v => PT + iH - ((v - hcMin) / (hcMax - hcMin)) * iH;
  const yOfPR = v => PT + iH - ((v - prMin) / (prMax - prMin)) * iH;

  const hcPts = hcVals.map((v, i) => `${xOf(i)},${yOfHC(v)}`).join(" ");
  const prPts = payrollVals.map((v, i) => `${xOf(i)},${yOfPR(v)}`).join(" ");

  const hcArea = `M${xOf(0)},${yOfHC(hcVals[0])} ` +
    hcVals.slice(1).map((v, i) => `L${xOf(i + 1)},${yOfHC(v)}`).join(" ") +
    ` L${xOf(rows.length - 1)},${PT + iH} L${xOf(0)},${PT + iH} Z`;

  const prArea = `M${xOf(0)},${yOfPR(payrollVals[0])} ` +
    payrollVals.slice(1).map((v, i) => `L${xOf(i + 1)},${yOfPR(v)}`).join(" ") +
    ` L${xOf(rows.length - 1)},${PT + iH} L${xOf(0)},${PT + iH} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="hcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.02"/>
        </linearGradient>
        <linearGradient id="prGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.02"/>
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = PT + iH * (1 - f);
        return <line key={f} x1={PL} y1={y} x2={W - PR} y2={y} stroke="var(--border)" strokeWidth="0.7" strokeDasharray="3 3"/>;
      })}

      {/* Areas */}
      <path d={hcArea} fill="url(#hcGrad)"/>
      <path d={prArea} fill="url(#prGrad)"/>

      {/* Lines */}
      <polyline points={hcPts} fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/>
      <polyline points={prPts} fill="none" stroke="#10B981" strokeWidth="2" strokeLinejoin="round"/>

      {/* Dots + tooltips */}
      {rows.map((r, i) => (
        <g key={i}>
          <circle cx={xOf(i)} cy={yOfHC(hcVals[i])} r="4" fill="#1a2035" stroke="#60A5FA" strokeWidth="2"/>
          <circle cx={xOf(i)} cy={yOfPR(payrollVals[i])} r="4" fill="#1a2035" stroke="#10B981" strokeWidth="2"/>
          {/* X-axis label */}
          <text x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="9.5" fill="var(--muted)">{r.month.split(" ")[0]}</text>
        </g>
      ))}

      {/* Left Y-axis label (HC) */}
      <text x={PL - 8} y={PT} textAnchor="end" fontSize="9" fill="#60A5FA">{Math.round(hcMax)}</text>
      <text x={PL - 8} y={PT + iH} textAnchor="end" fontSize="9" fill="#60A5FA">{Math.round(hcMin)}</text>
      <text x={10} y={H / 2} textAnchor="middle" fontSize="9" fill="#60A5FA" transform={`rotate(-90, 10, ${H / 2})`}>HC</text>

      {/* Right Y-axis label (Payroll) */}
      <text x={W - PR + 8} y={PT} textAnchor="start" fontSize="9" fill="#10B981">{prMax.toFixed(0)}L</text>
      <text x={W - PR + 8} y={PT + iH} textAnchor="start" fontSize="9" fill="#10B981">{prMin.toFixed(0)}L</text>
      <text x={W - 8} y={H / 2} textAnchor="middle" fontSize="9" fill="#10B981" transform={`rotate(90, ${W - 8}, ${H / 2})`}>Payroll</text>

      {/* Legend */}
      <rect x={PL + iW / 2 - 70} y={PT - 14} width="8" height="8" rx="2" fill="#60A5FA"/>
      <text x={PL + iW / 2 - 58} y={PT - 6} fontSize="9.5" fill="var(--text)">Headcount</text>
      <rect x={PL + iW / 2 + 20} y={PT - 14} width="8" height="8" rx="2" fill="#10B981"/>
      <text x={PL + iW / 2 + 32} y={PT - 6} fontSize="9.5" fill="var(--text)">Payroll Cost</text>
    </svg>
  );
}

// ── Department breakdown bar chart ───────────────────────────
function DeptBreakdown({ rows }) {
  const finalMonthIdx = rows.length - 1;
  const growthFactor  = rows.length > 0 ? rows[finalMonthIdx].closingHC / rows[0].openingHC : 1;

  const depts = DEPARTMENTS.map(d => ({
    ...d,
    projected: Math.round(d.headcount * growthFactor),
    change:    Math.round(d.headcount * growthFactor) - d.headcount,
  }));

  const maxVal = Math.max(...depts.map(d => d.projected));

  return (
    <div className="col gap-4" style={{ paddingTop: 4 }}>
      {depts.map(d => (
        <div key={d.id}>
          <div className="row between" style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 500 }}>{d.name}</span>
            <div className="row gap-3">
              <span className="mono fs-xs muted">Now: {d.headcount}</span>
              <span className="mono fs-xs" style={{ color: d.change >= 0 ? "#10B981" : "#F43F5E" }}>
                {d.change >= 0 ? "+" : ""}{d.change} → {d.projected}
              </span>
            </div>
          </div>
          <div style={{ position: "relative", height: 8, background: "var(--surface2)", borderRadius: 4, overflow: "hidden" }}>
            {/* Current */}
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              width: `${(d.headcount / maxVal) * 100}%`,
              background: d.color + "60",
              borderRadius: 4,
            }}/>
            {/* Projected */}
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              width: `${(d.projected / maxVal) * 100}%`,
              background: d.color,
              borderRadius: 4,
              opacity: 0.85,
            }}/>
          </div>
        </div>
      ))}
      <div className="row gap-6" style={{ marginTop: 4, fontSize: 10.5 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "#60A5FA60", display: "inline-block" }}/>
          <span className="muted">Current (Nov 2025)</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "#60A5FA", display: "inline-block" }}/>
          <span className="muted">Projected (May 2026)</span>
        </span>
      </div>
    </div>
  );
}

// ── Scenario comparison card ─────────────────────────────────
function ScenarioCard({ baseParams }) {
  const { startHC, startCost } = getStartValues();

  const conservative = buildProjection({
    startHC,
    startCostCr:     startCost,
    attritionRate:   baseParams.attritionRate * 1.5,
    joinersPerMonth: Math.max(1, Math.floor(baseParams.joinersPerMonth / 2)),
    incrementMonth:  baseParams.incrementMonth,
    incrementPct:    baseParams.incrementPct,
    avgNewCTC:       baseParams.avgNewCTC,
  });

  const aggressive = buildProjection({
    startHC,
    startCostCr:     startCost,
    attritionRate:   baseParams.attritionRate * 0.5,
    joinersPerMonth: baseParams.joinersPerMonth * 2,
    incrementMonth:  baseParams.incrementMonth,
    incrementPct:    baseParams.incrementPct,
    avgNewCTC:       baseParams.avgNewCTC,
  });

  const consClosing = conservative[conservative.length - 1].closingHC;
  const aggrClosing = aggressive[aggressive.length - 1].closingHC;
  const consPayroll = conservative[conservative.length - 1].monthlyPayroll;
  const aggrPayroll = aggressive[aggressive.length - 1].monthlyPayroll;

  return (
    <div className="grid g-cols-2 gap-6">
      {/* Conservative */}
      <div style={{ background: "var(--surface2)", borderRadius: 10, padding: 16, border: "1px solid var(--border)" }}>
        <div className="row gap-2" style={{ marginBottom: 12 }}>
          <Icon name="moon" size={14} color="#F59E0B"/>
          <span className="fw-600" style={{ fontSize: 13 }}>Conservative</span>
          <span className="chip warn" style={{ fontSize: 10, marginLeft: "auto" }}>½ joiners · 1.5× attrition</span>
        </div>
        <div className="col gap-3">
          {conservative.map((r, i) => (
            <div key={i} className="row between">
              <span className="fs-xs muted">{r.month}</span>
              <span className="mono fs-xs">{r.closingHC} ppl</span>
              <span className="mono fs-xs muted">{fmtINR(r.monthlyPayroll, { compact: true })}/mo</span>
            </div>
          ))}
        </div>
        <div className="divider" style={{ margin: "10px 0" }}/>
        <div className="row between">
          <span className="fs-xs muted">Final HC</span>
          <span className="fw-600" style={{ fontSize: 15 }}>{consClosing}</span>
        </div>
        <div className="row between" style={{ marginTop: 4 }}>
          <span className="fs-xs muted">Final Monthly Payroll</span>
          <span className="fw-600" style={{ fontSize: 13 }}>{fmtINR(consPayroll, { compact: true })}</span>
        </div>
      </div>

      {/* Aggressive */}
      <div style={{ background: "var(--surface2)", borderRadius: 10, padding: 16, border: "1px solid var(--border)" }}>
        <div className="row gap-2" style={{ marginBottom: 12 }}>
          <Icon name="flame" size={14} color="#10B981"/>
          <span className="fw-600" style={{ fontSize: 13 }}>Aggressive</span>
          <span className="chip ok" style={{ fontSize: 10, marginLeft: "auto" }}>2× joiners · ½ attrition</span>
        </div>
        <div className="col gap-3">
          {aggressive.map((r, i) => (
            <div key={i} className="row between">
              <span className="fs-xs muted">{r.month}</span>
              <span className="mono fs-xs">{r.closingHC} ppl</span>
              <span className="mono fs-xs muted">{fmtINR(r.monthlyPayroll, { compact: true })}/mo</span>
            </div>
          ))}
        </div>
        <div className="divider" style={{ margin: "10px 0" }}/>
        <div className="row between">
          <span className="fs-xs muted">Final HC</span>
          <span className="fw-600" style={{ fontSize: 15 }}>{aggrClosing}</span>
        </div>
        <div className="row between" style={{ marginTop: 4 }}>
          <span className="fs-xs muted">Final Monthly Payroll</span>
          <span className="fw-600" style={{ fontSize: 13 }}>{fmtINR(aggrPayroll, { compact: true })}</span>
        </div>
      </div>

      {/* Delta summary */}
      <div style={{
        gridColumn: "1 / -1",
        background: "var(--surface2)",
        borderRadius: 8,
        padding: "10px 16px",
        border: "1px solid var(--border)",
        display: "flex",
        gap: 32,
        alignItems: "center",
      }}>
        <Icon name="chart" size={14} color="var(--muted)"/>
        <span className="fs-xs muted">Scenario Delta (May 2026)</span>
        <span className="fw-600 fs-sm" style={{ color: "#10B981" }}>HC: +{aggrClosing - consClosing} ({aggrClosing} vs {consClosing})</span>
        <span className="fw-600 fs-sm" style={{ color: "#F59E0B" }}>Payroll: {fmtINR(aggrPayroll - consPayroll, { compact: true })} higher in aggressive</span>
      </div>
    </div>
  );
}

// ── Risk flags engine ────────────────────────────────────────
function buildRisks(rows, startCostMonthly) {
  const risks = [];

  rows.forEach(r => {
    if (r.closingHC < r.openingHC) {
      risks.push({
        tone: "danger",
        icon: "arrowDown",
        text: `Headcount decline risk in ${r.month}`,
        detail: `Opening: ${r.openingHC} → Closing: ${r.closingHC} (net −${r.openingHC - r.closingHC})`,
      });
    }
  });

  // Check cumulative payroll growth from base
  const lastPayroll  = rows[rows.length - 1].monthlyPayroll;
  const totalGrowth  = ((lastPayroll - startCostMonthly) / startCostMonthly) * 100;
  if (totalGrowth > 15) {
    risks.push({
      tone: "warn",
      icon: "coins",
      text: "Payroll overshoot risk",
      detail: `Projected payroll growth of ${totalGrowth.toFixed(1)}% over 6 months exceeds 15% threshold`,
    });
  }

  // Check month-on-month spikes
  rows.forEach(r => {
    if (r.momPct > 8) {
      risks.push({
        tone: "warn",
        icon: "alert",
        text: `Payroll spike in ${r.month}`,
        detail: `MoM growth: +${r.momPct.toFixed(1)}% — likely driven by increment or high joiner volume`,
      });
    }
  });

  // Check if joiners are consistently low
  const avgJoiners = rows.reduce((s, r) => s + r.joiners, 0) / rows.length;
  const avgExits   = rows.reduce((s, r) => s + r.exits,   0) / rows.length;
  if (avgExits > avgJoiners * 1.2) {
    risks.push({
      tone: "danger",
      icon: "alert",
      text: "Net negative headcount trajectory",
      detail: `Average exits (${avgExits.toFixed(1)}/mo) exceed average joiners (${avgJoiners.toFixed(1)}/mo)`,
    });
  }

  if (risks.length === 0) {
    risks.push({
      tone: "ok",
      icon: "check",
      text: "No significant risks detected",
      detail: "Headcount and payroll projections look stable across all 6 months.",
    });
  }

  return risks;
}

// ── Assumption input row ─────────────────────────────────────
function AssumptionInput({ label, value, onChange, min, max, step, prefix, suffix }) {
  return (
    <div>
      <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>{label}</div>
      <div className="row gap-2" style={{ alignItems: "center" }}>
        {prefix && <span className="muted fs-xs">{prefix}</span>}
        <input
          type="number"
          className="input"
          value={value}
          min={min}
          max={max}
          step={step || 0.1}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          style={{ width: 100, height: 32, fontSize: 13 }}
        />
        {suffix && <span className="muted fs-xs">{suffix}</span>}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
const HeadcountForecast = ({ onNav, onSub }) => {
  const [assumptionsOpen,  setAssumptionsOpen]  = useState(true);
  const [attritionRate,    setAttritionRate]    = useState(1.0);
  const [joinersPerMonth,  setJoinersPerMonth]  = useState(4);
  const [incrementMonth,   setIncrementMonth]   = useState(3);
  const [incrementPct,     setIncrementPct]     = useState(8);
  const [avgNewCTC,        setAvgNewCTC]        = useState(1200000);

  const { startHC, startCost } = getStartValues();
  const startCostMonthly = (startCost * 1e7) / 12;

  const rows = useMemo(() => buildProjection({
    startHC,
    startCostCr:    startCost,
    attritionRate,
    joinersPerMonth,
    incrementMonth,
    incrementPct,
    avgNewCTC,
  }), [attritionRate, joinersPerMonth, incrementMonth, incrementPct, avgNewCTC]);

  const risks = useMemo(() => buildRisks(rows, startCostMonthly), [rows]);

  const finalHC      = rows[rows.length - 1].closingHC;
  const finalPayroll = rows[rows.length - 1].monthlyPayroll;
  const totalGrowth  = ((finalHC - startHC) / startHC * 100).toFixed(1);
  const payrollGrowth= ((finalPayroll - startCostMonthly) / startCostMonthly * 100).toFixed(1);

  const handleExport = () => {
    window.toast("Exporting headcount forecast…", {
      icon: "download",
      tone: "info",
      sub: "Excel with projection table will be ready in a few seconds",
    });
  };

  return (
    <div className="page">
      <PageHead
        title="Headcount Forecast"
        subtitle="6-month projection · Based on confirmed pipeline"
      >
        <button className="btn ghost" onClick={handleExport}>
          <Icon name="download"/>Export
        </button>
      </PageHead>

      {/* ── KPI Strip ─────────────────────────────────────────── */}
      <div className="grid g-cols-4">
        <div className="card kpi">
          <div className="kpi-label"><Icon name="employees"/>Starting HC (Nov 2025)</div>
          <div className="kpi-value">{startHC}<small> ppl</small></div>
          <div className="row between"><span className="muted fs-xs">Base for projection</span></div>
        </div>
        <div className="card kpi">
          <div className="kpi-label"><Icon name="arrowUp"/>Projected HC (May 2026)</div>
          <div className="kpi-value">{finalHC}<small> ppl</small></div>
          <div className="row between">
            <span className={`kpi-delta ${parseFloat(totalGrowth) >= 0 ? "up" : "down"}`}>
              <Icon name={parseFloat(totalGrowth) >= 0 ? "arrowUp" : "arrowDown"} size={11}/>
              {parseFloat(totalGrowth) >= 0 ? "+" : ""}{totalGrowth}%
            </span>
          </div>
        </div>
        <div className="card kpi">
          <div className="kpi-label"><Icon name="coins"/>Projected Monthly Payroll</div>
          <div className="kpi-value">{fmtINR(finalPayroll, { compact: true })}</div>
          <div className="row between">
            <span className={`kpi-delta ${parseFloat(payrollGrowth) >= 0 ? "up" : "down"}`}>
              <Icon name={parseFloat(payrollGrowth) >= 0 ? "arrowUp" : "arrowDown"} size={11}/>
              {parseFloat(payrollGrowth) >= 0 ? "+" : ""}{payrollGrowth}% vs Nov
            </span>
          </div>
        </div>
        <div className="card kpi">
          <div className="kpi-label"><Icon name="alert"/>Risk Flags</div>
          <div className="kpi-value">{risks.filter(r => r.tone !== "ok").length}<small> issues</small></div>
          <div className="row between">
            <span className={`chip ${risks.filter(r => r.tone === "danger").length > 0 ? "danger" : risks.filter(r => r.tone === "warn").length > 0 ? "warn" : "ok"}`}>
              {risks.filter(r => r.tone === "danger").length > 0 ? "Action needed" : risks.filter(r => r.tone === "warn").length > 0 ? "Monitor" : "All clear"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Assumptions Card (collapsible) ───────────────────── */}
      <div className="card" style={{ marginTop: 4 }}>
        <div className="card-head" style={{ cursor: "pointer" }} onClick={() => setAssumptionsOpen(o => !o)}>
          <div className="card-title">
            Projection Assumptions
            <small>Adjust inputs to recompute forecast in real-time</small>
          </div>
          <div className="row gap-3">
            <span className="chip info fs-xs">Live compute</span>
            <button className="btn ghost sm" onClick={e => { e.stopPropagation(); setAssumptionsOpen(o => !o); }}>
              <Icon name={assumptionsOpen ? "chevDown" : "chevron"} size={13}/>
              {assumptionsOpen ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>
        {assumptionsOpen && (
          <div style={{ padding: "0 0 4px 0" }}>
            <div className="grid g-cols-4 gap-6" style={{ gap: 20 }}>
              <AssumptionInput
                label="Monthly Attrition Rate"
                value={attritionRate}
                onChange={setAttritionRate}
                min={0} max={10} step={0.1}
                suffix="%"
              />
              <AssumptionInput
                label="Expected Monthly Joiners"
                value={joinersPerMonth}
                onChange={setJoinersPerMonth}
                min={0} max={50} step={1}
                suffix="ppl"
              />
              <AssumptionInput
                label="Planned Increment Month"
                value={incrementMonth}
                onChange={v => setIncrementMonth(Math.round(v))}
                min={1} max={6} step={1}
                suffix="(1–6)"
              />
              <AssumptionInput
                label="Increment Percentage"
                value={incrementPct}
                onChange={setIncrementPct}
                min={0} max={40} step={0.5}
                suffix="%"
              />
              <AssumptionInput
                label="Avg CTC of New Joiners"
                value={avgNewCTC}
                onChange={setAvgNewCTC}
                min={300000} max={10000000} step={100000}
                prefix="₹"
              />
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button className="btn ghost sm" onClick={() => {
                  setAttritionRate(1.0);
                  setJoinersPerMonth(4);
                  setIncrementMonth(3);
                  setIncrementPct(8);
                  setAvgNewCTC(1200000);
                  window.toast("Assumptions reset to defaults", { icon: "check", tone: "ok" });
                }}>
                  <Icon name="x" size={12}/>Reset defaults
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 6-Month Projection Table ──────────────────────────── */}
      <div className="card" style={{ marginTop: 4 }}>
        <div className="card-head">
          <div className="card-title">
            6-Month Projection
            <small>Dec 2025 – May 2026 · Computed from assumptions above</small>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Month</th>
              <th className="right">Opening HC</th>
              <th className="right">Joiners</th>
              <th className="right">Exits</th>
              <th className="right">Closing HC</th>
              <th className="right">Avg CTC (Ann.)</th>
              <th className="right">Monthly Payroll</th>
              <th className="right">MoM Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={i === incrementMonth - 1 ? { background: "var(--surface2)" } : {}}>
                <td>
                  <span className="fw-600">{r.month}</span>
                  {i === incrementMonth - 1 && (
                    <span className="chip info" style={{ marginLeft: 8, fontSize: 9.5 }}>Increment month</span>
                  )}
                </td>
                <td className="right num">{r.openingHC}</td>
                <td className="right">
                  <span style={{ color: "#10B981", fontWeight: 600 }}>+{r.joiners}</span>
                </td>
                <td className="right">
                  <span style={{ color: "#F43F5E", fontWeight: 500 }}>−{r.exits}</span>
                </td>
                <td className="right">
                  <span className="fw-600">{r.closingHC}</span>
                  {r.closingHC < r.openingHC && (
                    <Icon name="arrowDown" size={11} color="#F43F5E" style={{ marginLeft: 4 }}/>
                  )}
                </td>
                <td className="right num">{fmtINR(r.avgCTC, { compact: true })}</td>
                <td className="right num">{fmtINR(r.monthlyPayroll, { compact: true })}</td>
                <td className="right">
                  <span className={r.momPct >= 0 ? "kpi-delta up" : "kpi-delta down"} style={{ fontSize: 11 }}>
                    <Icon name={r.momPct >= 0 ? "arrowUp" : "arrowDown"} size={10}/>
                    {r.momPct >= 0 ? "+" : ""}{r.momPct.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Trend Chart ──────────────────────────────────────── */}
      <div className="card" style={{ marginTop: 4 }}>
        <div className="card-head">
          <div className="card-title">
            Forecast Trend
            <small>Headcount (blue, left axis) · Monthly payroll cost (green, right axis)</small>
          </div>
        </div>
        <div style={{ padding: "8px 4px 0" }}>
          <ForecastChart rows={rows}/>
        </div>
      </div>

      {/* ── Department Breakdown ──────────────────────────────── */}
      <div className="card" style={{ marginTop: 4 }}>
        <div className="card-head">
          <div className="card-title">
            Department Breakdown
            <small>Current vs projected headcount per department at 6-month horizon</small>
          </div>
        </div>
        <DeptBreakdown rows={rows}/>
      </div>

      {/* ── Scenario Comparison ───────────────────────────────── */}
      <div className="card" style={{ marginTop: 4 }}>
        <div className="card-head">
          <div className="card-title">
            Scenario Comparison
            <small>Conservative (½ joiners · 1.5× attrition) vs Aggressive (2× joiners · ½ attrition)</small>
          </div>
          <div className="row gap-3">
            <span className="chip info fs-xs">Based on current assumptions</span>
          </div>
        </div>
        <ScenarioCard baseParams={{ attritionRate, joinersPerMonth, incrementMonth, incrementPct, avgNewCTC }}/>
      </div>

      {/* ── Risk Flags ───────────────────────────────────────── */}
      <div className="card" style={{ marginTop: 4 }}>
        <div className="card-head">
          <div className="card-title">
            Risk Flags
            <small>Auto-generated based on current projection assumptions</small>
          </div>
          <span className={`chip ${risks.some(r => r.tone === "danger") ? "danger" : risks.some(r => r.tone === "warn") ? "warn" : "ok"}`}>
            {risks.filter(r => r.tone !== "ok").length} issue{risks.filter(r => r.tone !== "ok").length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="col gap-3">
          {risks.map((risk, i) => (
            <div key={i} style={{
              display: "flex",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 8,
              background: risk.tone === "danger" ? "rgba(244,63,94,0.08)"
                        : risk.tone === "warn"   ? "rgba(245,158,11,0.08)"
                        : "rgba(16,185,129,0.08)",
              border: `1px solid ${
                risk.tone === "danger" ? "rgba(244,63,94,0.2)"
              : risk.tone === "warn"   ? "rgba(245,158,11,0.2)"
              : "rgba(16,185,129,0.2)"}`,
              alignItems: "flex-start",
            }}>
              <Icon
                name={risk.icon}
                size={15}
                color={risk.tone === "danger" ? "#F43F5E" : risk.tone === "warn" ? "#F59E0B" : "#10B981"}
              />
              <div>
                <div className="fw-600" style={{
                  fontSize: 13,
                  color: risk.tone === "danger" ? "#F43F5E" : risk.tone === "warn" ? "#F59E0B" : "#10B981",
                }}>
                  {risk.text}
                </div>
                <div className="muted fs-xs" style={{ marginTop: 2 }}>{risk.detail}</div>
              </div>
              <span className={`chip ${risk.tone} fs-xs`} style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>
                {risk.tone === "danger" ? "Action needed" : risk.tone === "warn" ? "Monitor" : "Healthy"}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

Object.assign(window, { HeadcountForecast });
