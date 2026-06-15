// AI Anomalies — detection + review
const Anomalies = ({ onNav }) => {
  const { useState, useEffect, useRef, useMemo } = React;
  const [resolved, setResolved] = useState(() => window.loadStore('anomaly_resolutions', {})); // { id: "dismissed" | "held" }
  const visible = ANOMALIES.filter(a => !resolved[a.id]);
  const [selected, setSelected] = useState(ANOMALIES[0]);
  const [explanationKey, setExplanationKey] = useState(0);

  // If selected gets resolved, jump to the next still-visible flag. Bail when
  // nothing's left so we don't ping-pong onto an already-resolved fallback.
  useEffect(() => {
    if (!resolved[selected.id]) return;
    const next = ANOMALIES.find(a => !resolved[a.id] && a.id !== selected.id);
    if (next) setSelected(next);
  }, [resolved, selected.id]);

  const dismissAnomaly = () => {
    const anomaly = selected;
    setResolved(r => { const next = { ...r, [anomaly.id]: "dismissed" }; window.persist('anomaly_resolutions', next); return next; });
    window.toast(`${anomaly.id} dismissed`, { icon: "x", tone: "info", sub: "Atlas will use this signal to learn" });
    const auditEntry = {
      id: "AUD-" + Date.now(),
      actor: "Priya Kapoor",
      action: "Dismissed anomaly",
      target: anomaly.emp + " · " + anomaly.category,
      at: "Just now",
      ip: "192.168.1.45",
      risk: "low",
    };
    window.AUDIT_LOG = [auditEntry, ...(window.AUDIT_LOG || AUDIT_LOG || [])];
    window.persist('AUDIT_LOG', window.AUDIT_LOG);
  };
  const holdAnomaly = () => {
    const anomaly = selected;
    setResolved(r => { const next = { ...r, [anomaly.id]: "held" }; window.persist('anomaly_resolutions', next); return next; });
    window.toast(`${anomaly.id} held for review`, { icon: "alert", tone: "warn", sub: `Manager will be notified · ${anomaly.delta} held` });
    const auditEntry = {
      id: "AUD-" + Date.now(),
      actor: "Priya Kapoor",
      action: "Held for review anomaly",
      target: anomaly.emp + " · " + anomaly.category,
      at: "Just now",
      ip: "192.168.1.45",
      risk: "low",
    };
    window.AUDIT_LOG = [auditEntry, ...(window.AUDIT_LOG || AUDIT_LOG || [])];
    window.persist('AUDIT_LOG', window.AUDIT_LOG);
  };
  const escalateAnomaly = () => {
    const anomaly = selected;
    window.toast("Anomaly escalated to Nov payroll run", { icon: "payroll", tone: "warn", sub: anomaly.emp + " · " + anomaly.category });
    const auditEntry = {
      id: "AUD-" + Date.now(),
      actor: "Priya Kapoor",
      action: "Escalated anomaly to payroll",
      target: anomaly.emp + " · " + anomaly.category,
      at: "Just now",
      ip: "192.168.1.45",
      risk: "low",
    };
    window.AUDIT_LOG = [auditEntry, ...(window.AUDIT_LOG || AUDIT_LOG || [])];
    window.persist('AUDIT_LOG', window.AUDIT_LOG);
  };

  const sevTone = (s) => s === "high" ? "danger" : s === "medium" ? "warn" : "info";
  const sevColor = (s) => s === "high" ? "#F43F5E" : s === "medium" ? "#F59E0B" : "#60A5FA";

  // FEA-036: plain-English explanation generator
  const generateExplanation = (anomaly, seed) => {
    const conf = Math.round(anomaly.confidence * 100);
    const devPct = Math.round((anomaly.confidence - 0.5) * 100 * 2);
    const dept = anomaly.emp ? anomaly.emp.split(" ")[0] : (anomaly.employee ? anomaly.employee.split(" ")[0] : "employee");
    const empName = anomaly.emp || anomaly.employee || "the employee";
    const category = anomaly.category || "pay component";
    const delta = anomaly.delta || "variance";

    if (anomaly.severity === "high") {
      return `Atlas detected that ${empName}'s ${category} of ${delta} exceeds the 6-month average by ${devPct}%. This triggered a high-confidence flag (${conf}%) based on peer comparison across ${dept}'s department. Recommended: hold pending skip-level verification.`;
    } else if (anomaly.severity === "medium") {
      return `A medium-confidence pattern (${conf}%) was detected in ${empName}'s recent records. The ${category} anomaly of ${delta} is unusual but may have a valid business reason. Recommended: request clarification.`;
    } else {
      return `Low-priority flag on ${empName}. The ${delta} variance in ${category} is within acceptable range but noted for audit trail completeness.`;
    }
  };

  // FEA-048: preview alert email modal
  const openAlertEmailModal = (anomaly) => {
    const empName = anomaly.emp || anomaly.employee || "Unknown Employee";
    const category = anomaly.category || "Pay Anomaly";
    const delta = anomaly.delta || "—";
    const conf = Math.round(anomaly.confidence * 100);
    const empRec = EMPLOYEES.find(e => e.id === anomaly.empId);
    const managerName = empRec ? (empRec.manager || "Reporting Manager") : "Reporting Manager";

    const emailBody = React.createElement("div", { style: { fontFamily: "inherit" } },
      // Email chrome
      React.createElement("div", {
        style: {
          border: "1px solid var(--border)",
          borderRadius: 10,
          overflow: "hidden",
          background: "var(--inset-1)",
        }
      },
        // Email header meta
        React.createElement("div", {
          style: {
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            background: "var(--inset-2)",
          }
        },
          React.createElement("div", { className: "col gap-3", style: { fontSize: 12 } },
            React.createElement("div", { className: "row gap-3" },
              React.createElement("span", { className: "muted fw-600", style: { width: 50 } }, "To:"),
              React.createElement("span", null, managerName)
            ),
            React.createElement("div", { className: "row gap-3" },
              React.createElement("span", { className: "muted fw-600", style: { width: 50 } }, "From:"),
              React.createElement("span", { className: "mono" }, "atlas-alerts@sourceone.in")
            ),
            React.createElement("div", { className: "row gap-3" },
              React.createElement("span", { className: "muted fw-600", style: { width: 50 } }, "Subject:"),
              React.createElement("span", { style: { fontWeight: 500 } }, `⚠ Payroll Anomaly Alert: ${empName} — ${category}`)
            ),
          )
        ),

        // Email body
        React.createElement("div", { style: { padding: "20px 24px" } },
          // Logo
          React.createElement("div", {
            style: {
              width: 40, height: 40, borderRadius: 10, marginBottom: 16,
              background: "linear-gradient(135deg, #10B981, #34D399)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14, color: "#052E1A",
            }
          }, "S1"),

          // Greeting
          React.createElement("div", { style: { fontSize: 13.5, marginBottom: 14, lineHeight: 1.55 } },
            React.createElement("b", null, `Dear ${managerName},`),
            React.createElement("br", null),
            "Atlas AI has flagged a payroll anomaly in the current disbursement cycle that requires your attention."
          ),

          // Summary table
          React.createElement("table", { className: "tbl", style: { marginBottom: 18, fontSize: 12.5 } },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", null, "Field"),
                React.createElement("th", null, "Value")
              )
            ),
            React.createElement("tbody", null,
              React.createElement("tr", null,
                React.createElement("td", { className: "muted" }, "Employee"),
                React.createElement("td", { className: "fw-600" }, empName)
              ),
              React.createElement("tr", null,
                React.createElement("td", { className: "muted" }, "Employee ID"),
                React.createElement("td", { className: "mono" }, anomaly.empId || "—")
              ),
              React.createElement("tr", null,
                React.createElement("td", { className: "muted" }, "Anomaly Category"),
                React.createElement("td", null, category)
              ),
              React.createElement("tr", null,
                React.createElement("td", { className: "muted" }, "Variance"),
                React.createElement("td", { className: "mono fw-600", style: { color: "#F43F5E" } }, delta)
              ),
              React.createElement("tr", null,
                React.createElement("td", { className: "muted" }, "Severity"),
                React.createElement("td", null,
                  React.createElement("span", { className: `chip ${sevTone(anomaly.severity)}` },
                    React.createElement("span", { className: "dot" }),
                    anomaly.severity
                  )
                )
              ),
              React.createElement("tr", null,
                React.createElement("td", { className: "muted" }, "Confidence"),
                React.createElement("td", { className: "mono" }, `${conf}%`)
              ),
            )
          ),

          // Atlas recommendation
          React.createElement("div", {
            style: {
              padding: "12px 14px", borderRadius: 8, marginBottom: 16,
              background: "linear-gradient(160deg, rgba(16,185,129,0.10), rgba(96,165,250,0.04))",
              border: "1px solid rgba(16,185,129,0.20)",
              fontSize: 12.5, lineHeight: 1.55,
            }
          },
            React.createElement("div", { className: "row gap-3 center", style: { marginBottom: 6 } },
              React.createElement("span", { style: { fontWeight: 600, fontSize: 12, color: "#10B981" } }, "Atlas Recommendation")
            ),
            anomaly.suggestion || "Review the flagged variance before approving disbursement."
          ),

          // CTA
          React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-muted)" } },
            "Review in Payroll Cloud → ",
            React.createElement("span", {
              className: "mono",
              style: { color: "#60A5FA", textDecoration: "underline", cursor: "pointer" }
            }, "https://app.sourceone.in")
          ),
        ),

        // Footer
        React.createElement("div", {
          style: {
            padding: "10px 16px", borderTop: "1px solid var(--border)",
            background: "var(--inset-2)", fontSize: 11, color: "var(--text-muted)",
            textAlign: "center",
          }
        }, "This is an automated alert from Atlas AI · Source One Payroll Cloud")
      )
    );

    window.openModal({
      title: "Alert Email Preview",
      subtitle: `Anomaly ${anomaly.id} · ${empName}`,
      width: 600,
      body: emailBody,
      confirmText: "Send Alert",
      onConfirm: () => {
        window.toast("Alert email sent to manager", { icon: "send", tone: "ok", sub: `Notified: ${managerName}` });
      },
    });
  };

  return (
    <div className="page">
      <PageHead title="AI Anomaly Detection" subtitle="3 flags require review before Nov 28 disbursement · Atlas v2.4">
        <button className="btn ghost"><Icon name="filter"/>Filters</button>
        <button className="btn ghost"><Icon name="download"/>Export findings</button>
      </PageHead>

      <div className="grid g-cols-4">
        <SeverityKpi count={2} label="High severity" tone="danger" color="#F43F5E" sub="Block disbursement"/>
        <SeverityKpi count={1} label="Medium severity" tone="warn" color="#F59E0B" sub="Manual review"/>
        <SeverityKpi count={1} label="Low severity" tone="info" color="#60A5FA" sub="Informational"/>
        <div className="card kpi" style={{ background: "linear-gradient(160deg, rgba(16,185,129,0.10), rgba(96,165,250,0.04))", borderColor: "rgba(16,185,129,0.20)" }}>
          <div className="kpi-label"><Icon name="shield" size={11}/>Detection rate</div>
          <div className="kpi-value">99.4<small>%</small></div>
          <div className="muted fs-xs">Trained on 4.2M payslips · 0.06% false positive</div>
        </div>
      </div>

      {/* History */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head">
          <div className="card-title">Anomaly trend
            <small>Last 6 months · stacked by severity</small>
          </div>
          <div className="row gap-3">
            <LegendDot color="#F43F5E" label="High"/>
            <LegendDot color="#F59E0B" label="Medium"/>
            <LegendDot color="#60A5FA" label="Low"/>
          </div>
        </div>
        <StackedBars data={ANOMALY_HISTORY} height={120}
          keys={[
            { key: "low", label: "Low", color: "#60A5FA" },
            { key: "med", label: "Medium", color: "#F59E0B" },
            { key: "high", label: "High", color: "#F43F5E" },
          ]}/>
      </div>

      <div className="grid g-cols-3" style={{ marginTop: 12, gap: 14 }}>
        {/* List */}
        <div className="col gap-4">
          <div className="row between">
            <div className="fs-sm muted fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Active flags · {visible.length}</div>
            <div className="tabs" style={{ padding: 2 }}>
              <button data-active="true" style={{ padding: "3px 8px", fontSize: 10.5 }}>All</button>
              <button style={{ padding: "3px 8px", fontSize: 10.5 }}>Mine</button>
            </div>
          </div>
          {ANOMALIES.map(a => {
            const isSel = a.id === selected.id;
            const status = resolved[a.id];
            return (
              <div key={a.id} onClick={() => setSelected(a)} className="card" style={{
                padding: "12px 14px", cursor: "default",
                opacity: status ? 0.5 : 1,
                borderColor: isSel ? `${sevColor(a.severity)}66` : "var(--border)",
                background: isSel ? `linear-gradient(180deg, ${sevColor(a.severity)}10, var(--inset-1))` : "var(--surface)",
                boxShadow: isSel ? `0 0 0 1px ${sevColor(a.severity)}33, 0 0 16px ${sevColor(a.severity)}22` : "none",
                transition: "all 180ms",
              }}>
                <div className="row between" style={{ marginBottom: 6 }}>
                  <span className={`chip ${sevTone(a.severity)}`}><span className="dot"/>{a.severity}</span>
                  {status ? (
                    <span className="chip">{status === "dismissed" ? "Dismissed" : "Held"}</span>
                  ) : (
                    <span className="mono fs-xs muted">{(a.confidence * 100).toFixed(0)}% conf</span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.3, marginBottom: 4, textDecoration: status ? "line-through" : "none" }}>{a.title}</div>
                {/* FEA-019: clickable employee name in list card */}
                <div className="row gap-3" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  <Avatar name={a.employee} size={18}/>
                  <span
                    title="View employee profile"
                    onClick={e => { e.stopPropagation(); onNav && onNav("employees"); }}
                    style={{ cursor: "pointer", textDecoration: "underline", textDecorationStyle: "dotted", textDecorationColor: "var(--text-muted)" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "var(--accent-bright)"; e.currentTarget.style.textDecorationColor = "var(--accent-bright)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.textDecorationColor = "var(--text-muted)"; }}
                  >
                    {a.employee}
                  </span>
                  <span className="dim">·</span>
                  <span className="mono">{a.empId}</span>
                </div>
                <div className="row between" style={{ marginTop: 8 }}>
                  <span className="chip">{a.category}</span>
                  <span className="mono fs-xs" style={{ color: sevColor(a.severity) }}>{a.delta}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail */}
        <div className="card" style={{ gridColumn: "span 2", padding: 0, display: "flex", flexDirection: "column" }}>
          <div className="row between" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div className="row gap-3 center" style={{ marginBottom: 6 }}>
                <span className={`chip ${sevTone(selected.severity)}`}><span className="dot"/>{selected.severity.toUpperCase()}</span>
                <span className="mono fs-xs muted">{selected.id}</span>
                <span className="dim">·</span>
                <span className="fs-xs muted">{selected.category}</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em" }}>{selected.title}</div>
            </div>
            <div className="row gap-3">
              {/* FEA-048: preview alert email button */}
              <button className="btn ghost sm" onClick={() => openAlertEmailModal(selected)}>
                <Icon name="send"/>Preview alert email
              </button>
              <button className="btn ghost sm" onClick={escalateAnomaly}><Icon name="payroll"/>Escalate to payroll</button>
              <button className="btn ghost sm" onClick={dismissAnomaly}>Dismiss</button>
              <button className="btn primary sm" onClick={holdAnomaly}><Icon name="check"/>Hold & review</button>
            </div>
          </div>

          <div style={{ padding: 18 }}>
            {/* Employee summary */}
            {(() => {
              const empRec = EMPLOYEES.find(e => e.id === selected.empId);
              return (
                <div className="row gap-5" style={{ padding: 14, borderRadius: 12, background: "var(--inset-2)", border: "1px solid var(--border)", marginBottom: 16 }}>
                  <Avatar name={selected.employee} size={44}/>
                  <div className="flex-1">
                    {/* FEA-019: clickable employee name in detail panel */}
                    <div
                      className="row gap-2 center"
                      style={{ fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                      title="View employee profile"
                      onClick={() => onNav && onNav("employees")}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--accent-bright)"; e.currentTarget.style.textDecoration = "underline"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = ""; e.currentTarget.style.textDecoration = "none"; }}
                    >
                      {selected.employee}
                      <Icon name="arrowRight" size={13}/>
                    </div>
                    <div className="muted fs-xs">
                      {selected.empId}
                      {empRec && <> · <span style={{ color: empRec.deptColor }}>{empRec.deptName}</span> · {empRec.role} · {empRec.level}</>}
                    </div>
                  </div>
                  <div className="col" style={{ textAlign: "right" }}>
                    <div className="muted fs-xs">Net pay variance</div>
                    <div className="mono fw-600" style={{ fontSize: 15, color: sevColor(selected.severity) }}>{selected.delta}</div>
                  </div>
                </div>
              );
            })()}

            {/* Atlas explanation */}
            <div style={{
              padding: 14, borderRadius: 12, marginBottom: 16,
              background: "linear-gradient(160deg, rgba(16,185,129,0.10), rgba(96,165,250,0.04))",
              border: "1px solid rgba(16,185,129,0.20)",
            }}>
              <div className="row gap-3 center" style={{ marginBottom: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg, #10B981, #34D399)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="sparkle" size={11} color="#052E1A"/>
                </div>
                <b style={{ fontSize: 12 }}>Atlas reasoning</b>
                <span className="chip" style={{ marginLeft: "auto" }}>Model v2.4 · 12ms</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-mid)", lineHeight: 1.55 }}>{selected.detail}</div>
              <div className="divider"/>
              <div className="row gap-3 center" style={{ fontSize: 12 }}>
                <Icon name="check" size={13} color="#34D399"/>
                <span><b style={{ color: "var(--accent-bright)" }}>Suggested action:</b> {selected.suggestion}</span>
              </div>
            </div>

            {/* FEA-036: Atlas Analysis section */}
            <div style={{
              padding: 14, borderRadius: 12, marginBottom: 16,
              background: "linear-gradient(160deg, rgba(16,185,129,0.10), rgba(96,165,250,0.04))",
              border: "1px solid rgba(16,185,129,0.20)",
            }}>
              <div className="row gap-3 center" style={{ marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg, #10B981, #34D399)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="ai" size={11} color="#052E1A"/>
                </div>
                <b style={{ fontSize: 12 }}>Atlas Analysis</b>
                <button
                  className="btn ghost sm"
                  style={{ marginLeft: "auto", fontSize: 11, padding: "2px 8px" }}
                  onClick={() => setExplanationKey(k => k + 1)}
                  title="Regenerate explanation"
                >
                  <Icon name="sparkle" size={11}/>Regenerate
                </button>
              </div>
              {/* Explanation narrative */}
              <div style={{ fontSize: 12.5, color: "var(--text-mid)", lineHeight: 1.65, marginBottom: 12 }}>
                {generateExplanation(selected, explanationKey)}
              </div>
              {/* Confidence meter */}
              <div>
                <div className="row between" style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                  <span>Confidence score</span>
                  <span className="mono">{Math.round(selected.confidence * 100)}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "var(--inset-3)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.round(selected.confidence * 100)}%`,
                    borderRadius: 99,
                    background: selected.severity === "high"
                      ? "linear-gradient(90deg, #F43F5E, #FB7185)"
                      : selected.severity === "medium"
                        ? "linear-gradient(90deg, #F59E0B, #FCD34D)"
                        : "linear-gradient(90deg, #60A5FA, #93C5FD)",
                    transition: "width 500ms cubic-bezier(0.4,0,0.2,1)",
                  }}/>
                </div>
              </div>
            </div>

            {/* Evidence */}
            <div className="section-head" style={{ margin: "0 0 10px" }}>
              <h3>Evidence</h3>
              <small>Last 6 months · current value highlighted</small>
            </div>

            <EvidenceChart anomaly={selected}/>

            <div className="grid g-cols-3" style={{ marginTop: 16 }}>
              <SignalCard label="Confidence" value={`${(selected.confidence * 100).toFixed(0)}%`} sub="Model output"
                color={sevColor(selected.severity)}/>
              <SignalCard label="Deviation" value="3.4σ" sub="From rolling baseline"
                color="#F59E0B"/>
              <SignalCard label="Comparable cases" value="47" sub="42 confirmed anomalies"
                color="#60A5FA"/>
            </div>

            <div className="section-head" style={{ marginTop: 20 }}>
              <h3>Decision history</h3>
            </div>
            <div className="col gap-3">
              <DecisionRow actor="Atlas" role="AI Reviewer" at="Nov 24, 11:21" action="Flagged"
                note="Pattern matches 'unauthorized OT' signature with 94% confidence"/>
              <DecisionRow actor="Meera Iyer" role="Payroll Analyst" at="Nov 24, 14:08" action="Acknowledged"
                note="Forwarded to skip-level manager (Deepak Verma) for review"/>
              <DecisionRow actor="—" role="Waiting" at="—" action="Pending"
                note="Skip-level approval required"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SeverityKpi = ({ count, label, tone, color, sub }) => (
  <div className="card kpi" style={{ overflow: "hidden", position: "relative" }}>
    <div style={{ position: "absolute", right: -20, top: -20, width: 80, height: 80, borderRadius: "50%",
      background: `radial-gradient(circle, ${color}25, transparent 70%)` }}/>
    <div className="row between">
      <div className="kpi-label"><Icon name="alert" size={11} color={color}/>{label}</div>
      <span className={`chip ${tone}`}><span className="dot"/>{count > 0 ? "Active" : "Clear"}</span>
    </div>
    <div className="kpi-value" style={{ color }}>{count}</div>
    <div className="muted fs-xs">{sub}</div>
  </div>
);

const EvidenceChart = ({ anomaly }) => {
  // Synthesize a baseline + spike
  const baseline = [27, 24, 31, 28, 26, 30, 92];
  const max = Math.max(...baseline);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110, padding: "8px 0" }}>
        {baseline.map((v, i) => {
          const isCurrent = i === baseline.length - 1;
          const h = (v / max) * 90;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div className="mono" style={{ fontSize: 9.5, color: isCurrent ? "#FCA5B0" : "var(--text-muted)" }}>{v}h</div>
              <div style={{
                width: "100%", maxWidth: 28, height: h,
                background: isCurrent
                  ? "linear-gradient(180deg, #F43F5E, #be1a3a)"
                  : "linear-gradient(180deg, rgba(96,165,250,0.7), rgba(96,165,250,0.3))",
                borderRadius: "4px 4px 2px 2px",
                boxShadow: isCurrent ? "0 0 14px rgba(244,63,94,0.5)" : "none",
              }}/>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{["May","Jun","Jul","Aug","Sep","Oct","Nov"][i]}</div>
            </div>
          );
        })}
      </div>
      <div className="muted fs-xs" style={{ marginTop: 6, textAlign: "center" }}>
        Median OT (last 6 months): <b style={{ color: "var(--text-mid)" }}>27 hrs/mo</b> · Current: <b style={{ color: "#FCA5B0" }}>92 hrs (3.4× baseline)</b>
      </div>
    </div>
  );
};

const SignalCard = ({ label, value, sub, color }) => (
  <div style={{ padding: 12, borderRadius: 10, background: "var(--inset-2)", border: "1px solid var(--border)" }}>
    <div className="muted fs-xs fw-600" style={{ letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 600, color, letterSpacing: "-0.02em" }}>{value}</div>
    <div className="muted fs-xs">{sub}</div>
  </div>
);

const DecisionRow = ({ actor, role, at, action, note }) => (
  <div className="row gap-4" style={{ padding: "10px 12px", borderRadius: 10, background: "var(--inset-1)", border: "1px solid var(--border)" }}>
    {actor === "—"
      ? <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--inset-3)", border: "1px dashed var(--border-strong)" }}/>
      : actor === "Atlas"
        ? <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #10B981, #34D399)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="sparkle" size={13} color="#052E1A"/></div>
        : <Avatar name={actor} size={28}/>}
    <div className="flex-1">
      <div className="row gap-3 center" style={{ fontSize: 12 }}>
        <b style={{ fontWeight: 500 }}>{actor}</b>
        <span className="muted fs-xs">{role}</span>
        <span className="chip" style={{ fontSize: 9.5 }}>{action}</span>
        <span className="muted fs-xs" style={{ marginLeft: "auto" }}>{at}</span>
      </div>
      <div className="fs-xs muted" style={{ marginTop: 4 }}>{note}</div>
    </div>
  </div>
);

Object.assign(window, { Anomalies, SeverityKpi, EvidenceChart, SignalCard, DecisionRow });
