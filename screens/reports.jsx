// Reports & Exports
const Reports = ({ onSub }) => {
  const [cat, setCat] = useState("All");
  const cats = ["All", ...Array.from(new Set(REPORTS.map(r => r.cat)))];
  const filtered = cat === "All" ? REPORTS : REPORTS.filter(r => r.cat === cat);

  return (
    <div className="page">
      <PageHead title="Reports & Exports" subtitle="Pre-built finance, tax & analytics reports — ready to download or schedule">
        <button className="btn ghost" onClick={() => onSub?.("scheduled-reports")}><Icon name="clock"/>Scheduled (4)</button>
        <button className="btn primary" onClick={() => onSub?.("report-builder")}><Icon name="plus"/>Build custom report</button>
      </PageHead>

      {/* Quick KPI strip */}
      <div className="grid g-cols-4">
        <MiniMetric icon="report" label="Reports available" value="42" delta="Pre-built + custom" tone=""/>
        <MiniMetric icon="download" label="Downloads (Nov)" value="186" delta="+22 vs Oct" tone="up"/>
        <MiniMetric icon="clock" label="Auto-scheduled" value="4" delta="Next: Nov 30, 06:00" tone=""/>
        <MiniMetric icon="shield" label="Compliance ready" value="100%" delta="Form 16, 24Q, ECR" tone="up"/>
      </div>

      {/* Featured analytics cards */}
      <div className="section-head" style={{ marginTop: 18 }}>
        <h3>Live analytics</h3>
        <small>Click any chart to drill down</small>
      </div>

      <div className="grid g-cols-3">
        <AnalyticsCard title="Salary distribution" sub="247 employees · Nov">
          <SalaryHistogram/>
          <div className="row between" style={{ marginTop: 8, fontSize: 10.5 }}>
            <span className="muted">Median: <b style={{ color: "var(--text)" }}>₹1.42L</b></span>
            <span className="muted">P90: <b style={{ color: "var(--text)" }}>₹3.10L</b></span>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Department cost share" sub="Cost of payroll · Nov">
          <div className="col gap-3">
            {DEPARTMENTS.slice(0, 6).map(d => {
              const total = DEPARTMENTS.reduce((a, x) => a + x.cost, 0);
              const pct = (d.cost / total) * 100;
              return (
                <div key={d.id}>
                  <div className="row between" style={{ marginBottom: 2 }}>
                    <span style={{ fontSize: 11 }}>{d.name}</span>
                    <span className="mono fs-xs muted">{fmtINR(d.cost, { compact: true })}</span>
                  </div>
                  <div className="bar" style={{ height: 4 }}><div style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${d.color}, ${d.color}80)`, boxShadow: `0 0 8px ${d.color}50` }}/></div>
                </div>
              );
            })}
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Location distribution" sub="Across 4 sites + remote">
          <div className="col gap-4">
            {LOCATIONS.map((l, i) => {
              const pct = (l.count / 247) * 100;
              const colors = ["#10B981", "#60A5FA", "#A78BFA", "#F59E0B"];
              return (
                <div key={l.code}>
                  <div className="row between" style={{ marginBottom: 4 }}>
                    <div className="row gap-3 center">
                      <span className="chip" style={{ background: `${colors[i]}20`, color: colors[i], borderColor: `${colors[i]}40`, fontSize: 9.5 }}>{l.code}</span>
                      <span style={{ fontSize: 11.5 }}>{l.name.replace(" (HQ)", "")}</span>
                    </div>
                    <span className="mono fs-sm">{l.count}</span>
                  </div>
                  <div className="bar" style={{ height: 4 }}><div style={{ width: `${pct}%`, background: colors[i] }}/></div>
                </div>
              );
            })}
          </div>
        </AnalyticsCard>
      </div>

      {/* Report list */}
      <div className="section-head" style={{ marginTop: 18 }}>
        <h3>Reports library</h3>
        <small>{filtered.length} reports</small>
      </div>

      <div className="row gap-3" style={{ marginBottom: 12 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} className="btn ghost sm" data-active={cat === c} style={{
            background: cat === c ? "rgba(16,185,129,0.12)" : "var(--inset-2)",
            borderColor: cat === c ? "rgba(16,185,129,0.4)" : "var(--border)",
            color: cat === c ? "var(--accent-bright)" : "var(--text-mid)",
          }}>{c}</button>
        ))}
      </div>

      <div className="grid g-cols-2">
        {filtered.map(r => (
          <div key={r.id} className="card" style={{ padding: "14px 16px", cursor: "default" }}>
            <div className="row gap-4">
              <FileIcon kind={r.type} size={40}/>
              <div className="flex-1">
                <div className="row between">
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                  <span className="chip">{r.cat}</span>
                </div>
                <div className="row gap-4 muted fs-xs" style={{ marginTop: 4 }}>
                  <span>{r.period}</span>
                  <span className="dot-sep"/>
                  <span className="mono">{r.size}</span>
                  <span className="dot-sep"/>
                  <span>{r.type}</span>
                </div>
                <div className="row gap-3" style={{ marginTop: 10 }}>
                  <button className="btn ghost sm" onClick={() => window.toast(`Generating preview — ${r.name}`, { icon: "eye", tone: "info" })}>
                    <Icon name="eye" size={11}/>Preview
                  </button>
                  <button className="btn ghost sm" onClick={() => window.toast(`Downloading ${r.name} (${r.type})`, { icon: "download", tone: "info", sub: `${r.size} · ${r.period}` })}>
                    <Icon name="download" size={11}/>Download
                  </button>
                  <button className="btn ghost sm" onClick={() => window.toast(`Scheduled: ${r.name}`, { icon: "clock", tone: "ok", sub: "Next run: Nov 30, 06:00 IST" })}>
                    <Icon name="clock" size={11}/>Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsCard = ({ title, sub, children }) => (
  <div className="card">
    <div className="card-head">
      <div className="card-title">{title}<small>{sub}</small></div>
      <button className="iconbtn" style={{ width: 24, height: 24 }}><Icon name="arrowRight" size={11}/></button>
    </div>
    {children}
  </div>
);

const SalaryHistogram = () => {
  const buckets = [
    { range: "<50k",   v: 22 },
    { range: "50-1L",  v: 41 },
    { range: "1-1.5L", v: 58 },
    { range: "1.5-2L", v: 53 },
    { range: "2-3L",   v: 42 },
    { range: "3-5L",   v: 22 },
    { range: ">5L",    v: 9 },
  ];
  const max = Math.max(...buckets.map(b => b.v));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 110 }}>
        {buckets.map((b, i) => {
          const h = (b.v / max) * 100;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--text-muted)" }}>{b.v}</div>
              <div style={{
                width: "100%", height: h,
                background: i >= 2 && i <= 3
                  ? "linear-gradient(180deg, #34D399, #10B981)"
                  : "linear-gradient(180deg, rgba(96,165,250,0.6), rgba(96,165,250,0.2))",
                borderRadius: "3px 3px 1px 1px",
                boxShadow: i >= 2 && i <= 3 ? "0 0 8px rgba(16,185,129,0.4)" : "none",
              }}/>
            </div>
          );
        })}
      </div>
      <div className="row" style={{ marginTop: 6, gap: 4 }}>
        {buckets.map((b, i) => (
          <span key={i} style={{ flex: 1, fontSize: 9, color: "var(--text-muted)", textAlign: "center" }}>{b.range}</span>
        ))}
      </div>
    </div>
  );
};

window.Reports = Reports;
