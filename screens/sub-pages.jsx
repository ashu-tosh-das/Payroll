// ──────────────────────────────────────────────────────────────
// Combined sub-pages reached via buttons (not in sidebar)
// FAQ Library, Bot Training, Scheduled Reports, Custom Report
// Builder, Permission Audit, Filing Register, Help Center
// ──────────────────────────────────────────────────────────────

const BackButton = ({ onBack, label }) => (
  <div className="row gap-3 center" style={{ marginBottom: 8 }}>
    <button className="btn ghost sm" onClick={onBack}>
      <Icon name="chevron" size={11} style={{ transform: "rotate(180deg)" }}/>{label || "Back"}
    </button>
  </div>
);

// ── FAQ LIBRARY ───────────────────────────────────────────────
const FAQ_CATS = [
  { id: "payroll",  name: "Payroll & Pay",         icon: "payroll", color: "#10B981", count: 18 },
  { id: "leave",    name: "Leave & Attendance",    icon: "calendar", color: "#60A5FA", count: 14 },
  { id: "tax",      name: "Tax & Form 16",         icon: "shield", color: "#F59E0B", count: 22 },
  { id: "pf",       name: "PF, ESI & UAN",         icon: "coins",  color: "#A78BFA", count: 19 },
  { id: "exp",      name: "Reimbursements",        icon: "report", color: "#22D3EE", count: 11 },
  { id: "letters",  name: "Letters & Documents",   icon: "file",   color: "#FB7185", count: 9  },
];
const FAQ_ENTRIES = [
  { cat: "payroll", q: "When is salary credited each month?", a: "Source One processes payroll on the 28th of each calendar month. If the 28th falls on a weekend or public holiday, salary is credited on the preceding working day.", views: 1248, helpful: 96 },
  { cat: "payroll", q: "How is HRA exemption calculated?", a: "HRA exemption is the least of: (a) actual HRA received, (b) 50% of basic salary (metro) or 40% (non-metro), or (c) actual rent paid minus 10% of basic salary.", views: 982, helpful: 92 },
  { cat: "payroll", q: "Can I switch tax regime mid-year?", a: "Salaried employees can switch tax regimes once per financial year while filing income tax returns. Within payroll, you can update your declaration in the Employee Portal → Tax → Declarations.", views: 814, helpful: 88 },
  { cat: "tax",     q: "How do I download my Form 16?", a: "Form 16 is issued annually by Jun 15 for the previous FY. Download it from Employee Portal → Documents → Tax Documents, or it will be auto-emailed to your registered address.", views: 1842, helpful: 98 },
  { cat: "tax",     q: "What if there's an error in my Form 16?", a: "Raise a ticket via the Support Center within 30 days of receipt. Corrections are processed in batch within 7 business days.", views: 412, helpful: 84 },
  { cat: "leave",   q: "How many leaves do I get per year?", a: "Full-time employees accrue 24 PL, 12 CL, and 12 SL annually. WFH allowance is 60 days/year. Leave year follows the calendar year (Jan-Dec).", views: 2104, helpful: 99 },
  { cat: "leave",   q: "What if I exceed my leave balance?", a: "Excess leave beyond your balance is auto-marked as Leave Without Pay (LWP) and deducted from your monthly salary at the gross/working-days rate.", views: 678, helpful: 80 },
  { cat: "pf",      q: "How do I link my UAN to Source One PF?", a: "Atlas auto-files the UAN linkage when you join. If you have a previous UAN, go to Profile → PF → Consolidate to initiate transfer via EPFO portal.", views: 542, helpful: 86 },
  { cat: "exp",     q: "Can I submit reimbursements via WhatsApp?", a: "Yes. Send your receipt to +91 80470 18001 (Source One Payroll WhatsApp). Atlas OCR auto-parses the merchant, amount, and category — you'll get a confirmation in 30s.", views: 1124, helpful: 94 },
  { cat: "exp",     q: "How long do reimbursements take?", a: "Approved reimbursements are credited within 3 business days via the next available payroll cycle or instant ACH (above ₹5,000).", views: 482, helpful: 89 },
  { cat: "letters", q: "How do I request a salary certificate?", a: "Go to Self-Service Portal → Letters → Salary Certificate. Atlas generates and emails it instantly. For physical letterhead, allow 1 business day.", views: 632, helpful: 91 },
];

const FaqLibrary = ({ onBack }) => {
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const filtered = FAQ_ENTRIES.filter(e =>
    (cat === "all" || e.cat === cat) &&
    (!search || e.q.toLowerCase().includes(search.toLowerCase()) || e.a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page">
      <BackButton onBack={onBack} label="Back to Support Center"/>
      <PageHead title="FAQ Library" subtitle="93 articles · 4,200 views this month · powering 71% of Atlas resolutions">
        <button className="btn ghost"><Icon name="download"/>Export</button>
        <button className="btn primary"><Icon name="plus"/>New article</button>
      </PageHead>

      <div className="grid g-cols-4">
        <MiniMetric icon="report" label="Articles" value="93" delta="+4 this week" tone="up"/>
        <MiniMetric icon="eye"    label="Views (30d)" value="4,218" delta="+18% vs prev" tone="up"/>
        <MiniMetric icon="check"  label="Helpful rate" value="93%" delta="Atlas-rated" tone="up"/>
        <MiniMetric icon="sparkle" label="Atlas-trained" value="89 / 93" delta="4 awaiting embedding" tone=""/>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="search" style={{ maxWidth: "none" }}>
          <Icon name="search" size={13}/>
          <input className="input" style={{ flex: 1, border: 0, background: "transparent", padding: 0, height: 20, color: "var(--text)" }}
            placeholder="Search articles by question or keyword…"
            value={search} onChange={(e) => setSearch(e.target.value)}/>
          {search && <button className="iconbtn" style={{ width: 22, height: 22 }} onClick={() => setSearch("")}><Icon name="x" size={10}/></button>}
        </div>
      </div>

      <div className="row gap-3" style={{ marginTop: 12, flexWrap: "wrap" }}>
        <button onClick={() => setCat("all")} className="btn ghost sm" data-active={cat === "all"} style={{
          background: cat === "all" ? "rgba(16,185,129,0.16)" : "var(--inset-2)",
          borderColor: cat === "all" ? "rgba(16,185,129,0.4)" : "var(--border)",
          color: cat === "all" ? "var(--accent-bright)" : "var(--text-mid)",
        }}>All ({FAQ_ENTRIES.length})</button>
        {FAQ_CATS.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} className="btn ghost sm" style={{
            background: cat === c.id ? `${c.color}22` : "var(--inset-2)",
            borderColor: cat === c.id ? `${c.color}55` : "var(--border)",
            color: cat === c.id ? c.color : "var(--text-mid)",
          }}>
            <Icon name={c.icon} size={11}/>{c.name} ({c.count})
          </button>
        ))}
      </div>

      <div className="col gap-3" style={{ marginTop: 14 }}>
        {filtered.length === 0 && (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <Icon name="search" size={28} color="var(--text-muted)"/>
            <div className="muted" style={{ marginTop: 10 }}>No articles match "{search}"</div>
          </div>
        )}
        {filtered.map((f, i) => {
          const isOpen = expanded === i;
          const catData = FAQ_CATS.find(c => c.id === f.cat);
          return (
            <div key={i} className="card" style={{ padding: 0, overflow: "hidden", cursor: "default" }}>
              <div onClick={() => setExpanded(isOpen ? null : i)} className="row gap-5 between" style={{
                padding: "14px 18px",
                background: isOpen ? "rgba(255,255,255,0.025)" : "transparent",
              }}>
                <div className="row gap-4 center">
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: `${catData.color}20`, color: catData.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name={catData.icon} size={13}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{f.q}</div>
                    <div className="row gap-3" style={{ marginTop: 3, fontSize: 10.5, color: "var(--text-muted)" }}>
                      <span>{f.views} views</span><span className="dot-sep"/>
                      <span style={{ color: "#34D399" }}>{f.helpful}% helpful</span>
                    </div>
                  </div>
                </div>
                <Icon name="chevron" size={12} color="var(--text-muted)" style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 200ms" }}/>
              </div>
              {isOpen && (
                <div style={{ padding: "0 18px 14px 60px" }}>
                  <div style={{ fontSize: 12.5, color: "var(--text-mid)", lineHeight: 1.6 }}>{f.a}</div>
                  <div className="row gap-3" style={{ marginTop: 10 }}>
                    <button className="btn ghost sm"><Icon name="edit"/>Edit</button>
                    <button className="btn ghost sm">View as employee</button>
                    <button className="btn ghost sm">Re-train Atlas</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── BOT TRAINING ─────────────────────────────────────────────
const PROMOTE_STEPS = [
  "Running safety checks…",
  "Validating eval metrics…",
  "Deploying…",
];

const V25_CHANGELOG = [
  { type: "+", text: "Improved PF/ESI query accuracy: 94.2% → 97.1%" },
  { type: "+", text: "Added leave balance intent (new)" },
  { type: "+", text: "Reduced hallucination rate: 3.1% → 1.8%" },
  { type: "~", text: "Updated salary query response format" },
  { type: "-", text: "Removed deprecated \"overtime query\" intent (merged into payroll)" },
];

const BotTraining = ({ onBack }) => {
  const [tab, setTab] = useState("intents");
  const [modelVersion, setModelVersion] = useState("v2.4");
  const [promoting, setPromoting] = useState(false);
  const [promoted, setPromoted] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [promoteStep, setPromoteStep] = useState(0);

  const handlePromote = () => {
    setPromoting(true);
    setPromoteStep(0);

    const stepDuration = 2200 / PROMOTE_STEPS.length;

    PROMOTE_STEPS.forEach((_, idx) => {
      setTimeout(() => {
        setPromoteStep(idx);
      }, idx * stepDuration);
    });

    setTimeout(() => {
      setPromoting(false);
      setPromoted(true);
      setModelVersion("v2.5");
      setShowChangelog(true);
      window.toast("Atlas v2.5 deployed successfully", { icon: "sparkle", tone: "ok", sub: "Now live in production" });
    }, 2200);
  };

  const handleRollback = () => {
    window.openModal({
      title: "Rollback to v2.4?",
      subtitle: "This will revert production to Atlas v2.4 immediately.",
      confirmText: "Yes, rollback",
      onConfirm: () => {
        setModelVersion("v2.4");
        setPromoted(false);
        setShowChangelog(false);
        window.toast("Rolled back to v2.4", { icon: "alert", tone: "warn", sub: "v2.4 is now live in production" });
      },
    });
  };

  return (
    <div className="page">
      <BackButton onBack={onBack} label="Back to Support Center"/>
      <PageHead title="Atlas — Bot Training Studio" subtitle="Train, tune, and evaluate the AI employee assistant · model v2.4">
        <button className="btn ghost"><Icon name="upload"/>Import dataset</button>
        <button className="btn ghost"><Icon name="cpu"/>Run eval</button>
        <button className="btn primary"><Icon name="play"/>Deploy v2.5</button>
      </PageHead>

      <div className="grid g-cols-4">
        <MiniMetric icon="sparkle" label="Active intents"    value="142" delta="+8 in dev" tone=""/>
        <MiniMetric icon="cpu"     label="Resolution rate"   value="71%" delta="↑ 4 pts vs v2.3" tone="up"/>
        <MiniMetric icon="alert"   label="Fallback rate"     value="9.2%" delta="↓ 1.4 pts" tone="up"/>
        <MiniMetric icon="check"   label="CSAT (bot)"        value="4.6 / 5" delta="2,184 ratings" tone="up"/>
      </div>

      <div className="row gap-3" style={{ marginTop: 14 }}>
        <div className="tabs">
          {[["intents","Intents"],["dataset","Training data"],["eval","Evaluation"],["safety","Safety & guardrails"]].map(([k,l]) => (
            <button key={k} data-active={tab===k} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </div>

      {tab === "intents" && (
        <div className="grid g-cols-2" style={{ marginTop: 14 }}>
          {[
            { name: "Form 16 / Tax docs", utterances: 184, resolved: 96, fallback: 2, color: "#10B981" },
            { name: "Leave balance check", utterances: 142, resolved: 98, fallback: 1, color: "#60A5FA" },
            { name: "Salary credit query", utterances: 128, resolved: 94, fallback: 4, color: "#A78BFA" },
            { name: "Reimbursement status", utterances: 118, resolved: 91, fallback: 6, color: "#F59E0B" },
            { name: "PF / UAN linkage",    utterances: 89,  resolved: 84, fallback: 11, color: "#FB7185" },
            { name: "Bank account update", utterances: 64,  resolved: 72, fallback: 18, color: "#22D3EE" },
          ].map(i => (
            <div key={i.name} className="card">
              <div className="row between" style={{ marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{i.name}</div>
                  <div className="muted fs-xs">{i.utterances} sample utterances</div>
                </div>
                <span className="chip" style={{ color: i.color, background: `${i.color}18`, borderColor: `${i.color}40` }}>
                  {i.resolved}% resolved
                </span>
              </div>
              <div className="bar" style={{ height: 6 }}>
                <div style={{ width: `${i.resolved}%`, background: `linear-gradient(90deg, ${i.color}, ${i.color}80)`, boxShadow: `0 0 8px ${i.color}66` }}/>
              </div>
              <div className="row between" style={{ marginTop: 8, fontSize: 10.5 }}>
                <span className="muted">Fallback: <b style={{ color: i.fallback > 10 ? "#FCA5B0" : "#34D399" }}>{i.fallback}%</b></span>
                <button className="btn ghost sm"><Icon name="edit"/>Tune</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "dataset" && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-head">
            <div className="card-title">Training corpus<small>4.2M sentence pairs · last updated Nov 24</small></div>
            <button className="btn ghost sm"><Icon name="download"/>Export</button>
          </div>
          <div className="grid g-cols-3" style={{ marginBottom: 14 }}>
            <DatasetStat label="KB articles"        value="93"     sub="93 indexed, 0 stale"/>
            <DatasetStat label="Past tickets (sanitized)" value="18,420" sub="PII redacted"/>
            <DatasetStat label="Policy docs"        value="42"     sub="HR + Finance"/>
          </div>
          <table className="tbl">
            <thead><tr><th>Source</th><th>Type</th><th>Records</th><th>Last sync</th><th>Quality</th></tr></thead>
            <tbody>
              <tr><td>FAQ Library</td><td>KB</td><td className="mono">93</td><td className="muted fs-xs">Nov 25 09:00</td><td><span className="chip ok">A+</span></td></tr>
              <tr><td>Resolved tickets</td><td>Conversations</td><td className="mono">18,420</td><td className="muted fs-xs">Nov 25 04:00</td><td><span className="chip ok">A</span></td></tr>
              <tr><td>HR Policy Manual</td><td>PDF</td><td className="mono">142 pages</td><td className="muted fs-xs">Sep 12</td><td><span className="chip warn">B+</span></td></tr>
              <tr><td>Finance SOPs</td><td>Docs</td><td className="mono">42</td><td className="muted fs-xs">Oct 18</td><td><span className="chip ok">A</span></td></tr>
              <tr><td>Atlas eval set</td><td>Test cases</td><td className="mono">1,200</td><td className="muted fs-xs">Nov 22</td><td><span className="chip ok">Gold</span></td></tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === "eval" && (
        <div className="col gap-4" style={{ marginTop: 14 }}>
          {/* Production version chip */}
          <div className="row gap-3 center">
            <span className="chip ok" style={{ fontSize: 11.5, padding: "4px 12px" }}>
              <Icon name="globe" size={10}/>Production: {modelVersion}
            </span>
          </div>

          <div className="grid g-cols-2">
            <div className="card">
              <div className="card-head"><div className="card-title">Model comparison<small>v2.4 (current) vs v2.5 (canary)</small></div></div>
              <div className="col gap-5">
                {[
                  ["Resolution rate", 71, 76, true],
                  ["Accuracy",        92, 94, true],
                  ["Latency p50",     0.6, 0.7, false, "s"],
                  ["Hallucination rate", 1.2, 0.8, true, "%"],
                  ["Safety score",    99.1, 99.4, true, ""],
                ].map(([label, a, b, betterIsHigher, unit = "%"]) => {
                  const delta = b - a;
                  const better = (betterIsHigher ? delta > 0 : delta < 0);
                  return (
                    <div key={label}>
                      <div className="row between" style={{ marginBottom: 4 }}>
                        <span style={{ fontSize: 12 }}>{label}</span>
                        <span className="mono fs-sm" style={{ color: better ? "#34D399" : "#FCA5B0" }}>
                          {delta > 0 ? "+" : ""}{delta.toFixed(1)}{unit}
                        </span>
                      </div>
                      <div className="row gap-4" style={{ fontSize: 10.5 }}>
                        <span className="muted">v2.4: <b className="mono" style={{ color: "var(--text)" }}>{a}{unit}</b></span>
                        <span style={{ color: "#34D399" }}>v2.5: <b className="mono">{b}{unit}</b></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promotion area */}
              {!promoted && !promoting && (
                <button className="btn primary sm" style={{ width: "100%", marginTop: 14 }} onClick={handlePromote}>
                  <Icon name="play"/>Promote v2.5 to Production
                </button>
              )}

              {promoting && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--accent-bright)", marginBottom: 8 }}>
                    <Icon name="cpu" size={12}/> {PROMOTE_STEPS[promoteStep]}
                  </div>
                  <div className="bar" style={{ height: 6, background: "var(--inset-4)" }}>
                    <div style={{
                      width: `${((promoteStep + 1) / PROMOTE_STEPS.length) * 100}%`,
                      background: "linear-gradient(90deg, #10B981, #34D399)",
                      boxShadow: "0 0 8px #10B98166",
                      transition: "width 600ms ease",
                    }}/>
                  </div>
                  <div className="row gap-3" style={{ marginTop: 8 }}>
                    {PROMOTE_STEPS.map((step, idx) => (
                      <span key={idx} style={{
                        fontSize: 10,
                        color: idx <= promoteStep ? "#34D399" : "var(--text-muted)",
                        fontWeight: idx === promoteStep ? 600 : 400,
                      }}>
                        {idx < promoteStep ? <Icon name="check" size={9}/> : null} {step}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {promoted && (
                <div style={{ marginTop: 14 }}>
                  <div style={{
                    padding: "10px 14px",
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.35)",
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}>
                    <Icon name="check" size={14} color="#34D399"/>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#34D399" }}>Atlas v2.5 is now live in production</span>
                  </div>
                  <button className="btn ghost danger sm" style={{ width: "100%" }} onClick={handleRollback}>
                    <Icon name="alert"/>Rollback to v2.4
                  </button>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-head"><div className="card-title">Failed test cases<small>v2.5 · 12 failures out of 1,200 cases</small></div></div>
              <div className="col gap-3">
                {[
                  "Salary credited to old account — bot suggested wrong steps (intent: Bank update)",
                  "When does increment hit? — bot didn't know company-specific timing",
                  "How to claim mediclaim — outdated policy referenced",
                  "PT for Karnataka HQ employee living in TN — edge case",
                  "OT pay rate — model gave generic answer instead of SOP",
                ].map((c, i) => (
                  <div key={i} className="row gap-4" style={{ padding: "8px 10px", background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.20)", borderRadius: 8 }}>
                    <Icon name="x" size={11} color="#FCA5B0"/>
                    <span className="flex-1" style={{ fontSize: 11.5, lineHeight: 1.4 }}>{c}</span>
                    <button className="btn ghost sm" style={{ height: 22, fontSize: 10 }}>Fix</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Changelog diff card — shown after promotion */}
          {showChangelog && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">What changed in v2.5<small>Changelog diff · Atlas model</small></div>
                <button className="btn ghost sm" onClick={() => setShowChangelog(false)}><Icon name="x" size={10}/>Dismiss</button>
              </div>
              <div className="col gap-2" style={{ fontFamily: "monospace", fontSize: 12 }}>
                {V25_CHANGELOG.map((entry, idx) => {
                  const bgColor = entry.type === "+" ? "rgba(16,185,129,0.08)"
                                : entry.type === "~" ? "rgba(96,165,250,0.08)"
                                : "rgba(244,63,94,0.08)";
                  const borderColor = entry.type === "+" ? "rgba(16,185,129,0.30)"
                                    : entry.type === "~" ? "rgba(96,165,250,0.30)"
                                    : "rgba(244,63,94,0.30)";
                  const textColor = entry.type === "+" ? "#34D399"
                                  : entry.type === "~" ? "#60A5FA"
                                  : "#FCA5B0";
                  return (
                    <div key={idx} style={{
                      padding: "7px 12px",
                      background: bgColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 7,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}>
                      <span style={{ color: textColor, fontWeight: 700, fontSize: 14, lineHeight: 1.3, minWidth: 14 }}>{entry.type}</span>
                      <span style={{ color: "var(--text-mid)", lineHeight: 1.5 }}>{entry.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "safety" && (
        <div className="grid g-cols-2" style={{ marginTop: 14 }}>
          {[
            { label: "PII redaction",     desc: "Mask SSN, PAN, account numbers in all responses", on: true, icon: "shield" },
            { label: "Hallucination block",desc: "Refuse to answer when confidence < 70%",         on: true, icon: "cpu" },
            { label: "Off-topic filter",   desc: "Redirect non-payroll queries to human",          on: true, icon: "filter" },
            { label: "Tone moderation",    desc: "Block toxic / unprofessional language",          on: true, icon: "user" },
            { label: "Action confirmation",desc: "Require human confirm for >₹50K transactions",   on: true, icon: "check" },
            { label: "Source attribution", desc: "Cite KB article in every answer",                on: false,icon: "report" },
          ].map(s => (
            <div key={s.label} className="card row between" style={{ padding: 14 }}>
              <div className="row gap-4 center" style={{ flex: 1 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 7,
                  background: s.on ? "rgba(16,185,129,0.14)" : "var(--inset-4)",
                  color: s.on ? "#34D399" : "var(--text-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name={s.icon} size={12}/>
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.label}</div>
                  <div className="muted fs-xs">{s.desc}</div>
                </div>
              </div>
              <Toggle on={s.on}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DatasetStat = ({ label, value, sub }) => (
  <div style={{ padding: 12, borderRadius: 10, background: "var(--inset-2)", border: "1px solid var(--border)" }}>
    <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>{value}</div>
    <div className="muted fs-xs">{sub}</div>
  </div>
);

// ── SCHEDULED REPORTS ─────────────────────────────────────────
const SCHEDULES = [
  { id: "S-01", name: "Monthly Payroll Register",   cadence: "Monthly · 28th, 18:00", nextRun: "Nov 28, 18:00", recipients: ["finance@sourceone.in","cfo@sourceone.in"], lastRun: "Oct 28, 18:02 ✓", active: true,  format: "PDF" },
  { id: "S-02", name: "Compliance Filings Status",  cadence: "Weekly · Mon, 09:00",   nextRun: "Mon Dec 01, 09:00", recipients: ["compliance@sourceone.in"], lastRun: "Nov 24, 09:01 ✓", active: true,  format: "XLSX" },
  { id: "S-03", name: "Headcount & Attrition",     cadence: "Monthly · 1st, 08:00",   nextRun: "Dec 01, 08:00", recipients: ["board@sourceone.in"], lastRun: "Nov 01, 08:00 ✓", active: true,  format: "PDF" },
  { id: "S-04", name: "Anomaly Daily Digest",       cadence: "Daily · 07:30",         nextRun: "Tomorrow, 07:30", recipients: ["payroll@sourceone.in"], lastRun: "Today 07:30 ✓", active: true,  format: "Email" },
  { id: "S-05", name: "Q4 Variable Pay Audit",      cadence: "Quarterly",             nextRun: "Jan 05, 09:00", recipients: ["finance@sourceone.in","audit@sourceone.in"], lastRun: "Oct 05, 09:02 ✓", active: false, format: "PDF" },
];

const ScheduledReports = ({ onBack }) => (
  <div className="page">
    <BackButton onBack={onBack} label="Back to Reports"/>
    <PageHead title="Scheduled Reports" subtitle="Reports that run on a cadence and email automatically to stakeholders">
      <button className="btn ghost"><Icon name="download"/>Export schedule list</button>
      <button className="btn primary"><Icon name="plus"/>New schedule</button>
    </PageHead>

    <div className="grid g-cols-4">
      <MiniMetric icon="clock"  label="Active schedules" value={SCHEDULES.filter(s => s.active).length} delta={`${SCHEDULES.length} total`} tone=""/>
      <MiniMetric icon="send"   label="Runs (30d)"       value="62" delta="100% success" tone="up"/>
      <MiniMetric icon="alert"  label="Last failure"     value="—"  delta="None in 90 days" tone="up"/>
      <MiniMetric icon="user"   label="Recipients"       value="18" delta="Internal + auditors" tone=""/>
    </div>

    <div className="card" style={{ marginTop: 14, padding: 0, overflow: "hidden" }}>
      <table className="tbl">
        <thead>
          <tr>
            <th></th>
            <th>Report</th>
            <th>Cadence</th>
            <th>Next run</th>
            <th>Recipients</th>
            <th>Last run</th>
            <th>Format</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {SCHEDULES.map(s => (
            <tr key={s.id}>
              <td style={{ paddingLeft: 16 }}>
                <Toggle on={s.active}/>
              </td>
              <td>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.name}</div>
                <div className="muted fs-xs">{s.id}</div>
              </td>
              <td className="fs-sm">{s.cadence}</td>
              <td className="fs-sm" style={{ color: s.active ? "var(--accent-bright)" : "var(--text-muted)" }}>{s.nextRun}</td>
              <td>
                <div className="col gap-2">
                  {s.recipients.slice(0, 2).map(r => <span key={r} className="mono" style={{ fontSize: 10.5, color: "var(--text-mid)" }}>{r}</span>)}
                  {s.recipients.length > 2 && <span className="muted fs-xs">+{s.recipients.length - 2} more</span>}
                </div>
              </td>
              <td className="muted fs-sm">{s.lastRun}</td>
              <td><span className="chip">{s.format}</span></td>
              <td>
                <div className="row gap-3">
                  <button className="iconbtn" style={{ width: 24, height: 24 }}><Icon name="play" size={10}/></button>
                  <button className="iconbtn" style={{ width: 24, height: 24 }}><Icon name="edit" size={10}/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ── REPORT BUILDER ──────────────────────────────────────────
const REPORT_FIELDS = {
  payroll: ["Period", "Department", "Location", "Gross salary", "Net pay", "TDS", "PF", "ESI", "Loan recovery"],
  emp: ["Employee ID", "Name", "Email", "Designation", "Level", "Department", "Manager", "DOJ", "Status"],
  comp: ["Annual CTC", "Monthly basic", "HRA", "Special allow.", "Variable pay", "Stock grant"],
  attendance: ["Days present", "Days on leave", "WFH days", "OT hours", "Average hours/day"],
};

const ReportBuilder = ({ onBack }) => {
  const [name, setName] = useState("Custom Payroll Cost by Department · Q3 FY26");
  const [period, setPeriod] = useState("Q3 FY26");
  const [selectedFields, setSelectedFields] = useState(["Period","Department","Gross salary","Net pay","TDS","PF"]);

  const toggleField = (f) => {
    setSelectedFields(arr => arr.includes(f) ? arr.filter(x => x !== f) : [...arr, f]);
  };

  return (
    <div className="page">
      <BackButton onBack={onBack} label="Back to Reports"/>
      <PageHead title="Custom Report Builder" subtitle="Compose any cut of payroll, people, or compensation data — exportable & schedulable">
        <button className="btn ghost"><Icon name="eye"/>Preview</button>
        <button className="btn ghost"><Icon name="clock"/>Save as schedule</button>
        <button className="btn primary"><Icon name="download"/>Generate report</button>
      </PageHead>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1.2fr", gap: 14, marginTop: 8 }}>
        {/* Left: builder */}
        <div className="card">
          <div className="card-head"><div className="card-title">Configuration</div></div>

          <div className="col gap-5">
            <div>
              <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Report name</div>
              <input className="input" style={{ width: "100%", height: 32 }} value={name} onChange={(e) => setName(e.target.value)}/>
            </div>

            <div className="grid g-cols-2 gap-8">
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Period</div>
                <select className="select" style={{ width: "100%", height: 32 }} value={period} onChange={(e) => setPeriod(e.target.value)}>
                  <option>Nov 2025</option><option>Q3 FY26</option><option>FY 2025-26</option><option>YTD 2025</option><option>Custom range…</option>
                </select>
              </div>
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Group by</div>
                <select className="select" style={{ width: "100%", height: 32 }}>
                  <option>Department</option><option>Location</option><option>Level</option><option>Manager</option>
                </select>
              </div>
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Format</div>
                <select className="select" style={{ width: "100%", height: 32 }}>
                  <option>Excel (.xlsx)</option><option>PDF</option><option>CSV</option><option>Google Sheets</option>
                </select>
              </div>
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Currency</div>
                <select className="select" style={{ width: "100%", height: 32 }}>
                  <option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Fields to include · {selectedFields.length} selected</div>
              {Object.entries(REPORT_FIELDS).map(([group, fields]) => (
                <div key={group} style={{ marginBottom: 12 }}>
                  <div className="fs-xs muted" style={{ marginBottom: 4, textTransform: "capitalize", fontWeight: 600 }}>{group}</div>
                  <div className="row gap-2" style={{ flexWrap: "wrap" }}>
                    {fields.map(f => {
                      const on = selectedFields.includes(f);
                      return (
                        <button key={f} onClick={() => toggleField(f)} className="chip" style={{
                          cursor: "default",
                          padding: "4px 10px",
                          background: on ? "rgba(16,185,129,0.16)" : "var(--inset-2)",
                          borderColor: on ? "rgba(16,185,129,0.4)" : "var(--border)",
                          color: on ? "var(--accent-bright)" : "var(--text-mid)",
                        }}>
                          {on && <Icon name="check" size={9}/>}{f}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Filters</div>
              <div className="row gap-3" style={{ flexWrap: "wrap" }}>
                <span className="chip solid">Status = Active</span>
                <span className="chip solid">Location ∈ [Bengaluru, Mumbai]</span>
                <span className="chip solid">CTC ≥ ₹15L</span>
                <button className="btn ghost sm"><Icon name="plus" size={10}/>Add filter</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: preview */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="row between" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div className="card-title">Live preview</div>
              <div className="muted fs-xs">{period} · {selectedFields.length} columns · grouped by Department</div>
            </div>
            <span className="chip ok"><span className="live-dot"/>Live</span>
          </div>
          <div style={{ padding: "0 18px 18px" }}>
            <div style={{ marginTop: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{name}</div>
              <div className="muted fs-xs">Source One Technologies Pvt. Ltd. · Generated Nov 25, 2025 14:32 IST</div>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  {selectedFields.slice(0, 6).map(f => <th key={f}>{f}</th>)}
                </tr>
              </thead>
              <tbody>
                {DEPARTMENTS.slice(0, 7).map(d => (
                  <tr key={d.id}>
                    {selectedFields.slice(0, 6).map(f => (
                      <td key={f}>
                        {f === "Period" && period}
                        {f === "Department" && <span style={{ color: d.color, fontWeight: 500 }}>{d.name}</span>}
                        {f === "Gross salary" && <span className="mono">{fmtINR(d.cost, { compact: true })}</span>}
                        {f === "Net pay" && <span className="mono">{fmtINR(Math.round(d.cost * 0.82), { compact: true })}</span>}
                        {f === "TDS" && <span className="mono">{fmtINR(Math.round(d.cost * 0.10), { compact: true })}</span>}
                        {f === "PF" && <span className="mono">{fmtINR(Math.round(d.cost * 0.12), { compact: true })}</span>}
                        {!["Period","Department","Gross salary","Net pay","TDS","PF"].includes(f) && <span className="muted">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid var(--border-strong)", background: "rgba(16,185,129,0.06)" }}>
                  <td className="fw-600">TOTAL</td>
                  <td colSpan={selectedFields.length > 1 ? Math.min(selectedFields.length - 1, 5) : 0} className="muted">8 departments · 247 employees</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── PERMISSION AUDIT ─────────────────────────────────────────
const PermissionAudit = ({ onBack }) => (
  <div className="page">
    <BackButton onBack={onBack} label="Back to Roles & Access"/>
    <PageHead title="Permission Audit" subtitle="Quarterly access review · who can do what · last review: Sep 2025">
      <button className="btn ghost"><Icon name="download"/>Export findings</button>
      <button className="btn primary"><Icon name="play"/>Start Q4 review</button>
    </PageHead>

    <div className="grid g-cols-4">
      <MiniMetric icon="user"   label="Users reviewed" value="302"  delta="Current cycle" tone=""/>
      <MiniMetric icon="alert"  label="Flagged"        value="14"   delta="Excessive access" tone="down"/>
      <MiniMetric icon="check"  label="Compliant"      value="287"  delta="95.0%" tone="up"/>
      <MiniMetric icon="clock"  label="Stale (90d+)"   value="6"    delta="Recommend revoke" tone=""/>
    </div>

    <div className="card" style={{ marginTop: 14 }}>
      <div className="card-head">
        <div className="card-title">Flagged users<small>14 with potentially excessive access</small></div>
        <div className="tabs">
          <button data-active="true">Flagged (14)</button>
          <button>Stale (6)</button>
          <button>Compliant (287)</button>
        </div>
      </div>
      <table className="tbl">
        <thead><tr><th>User</th><th>Role</th><th>Issue</th><th>Last activity</th><th>Risk</th><th></th></tr></thead>
        <tbody>
          {[
            { name: "Akshay Sharma", role: "Payroll Manager", issue: "Has 'Edit Compensation' but is L4 (typically L6+)", at: "2h ago", risk: "high" },
            { name: "Pooja Mehta",   role: "Finance",         issue: "Has 'Export PII' permission, last used 8mo ago",  at: "Today",  risk: "med" },
            { name: "Sahil Khanna",  role: "HRBP",           issue: "Member of 4 roles · principle of least privilege violation", at: "Yesterday", risk: "med" },
            { name: "Karthik Reddy", role: "Payroll Manager", issue: "Has access to 3 departments — usually scoped to 1", at: "Yesterday", risk: "high" },
            { name: "Tara Wilson",   role: "Super Admin",     issue: "Inactive (notice period) but admin retained",      at: "5d ago",   risk: "high" },
            { name: "Bhavya Patel",  role: "Finance",         issue: "Self-approval — can approve own reimbursements",   at: "Today",    risk: "med" },
          ].map((u, i) => (
            <tr key={i}>
              <td>
                <div className="row-emp">
                  <Avatar name={u.name} size={24}/>
                  <div><div className="row-emp-name">{u.name}</div><div className="row-emp-meta">SO-10{42 + i}</div></div>
                </div>
              </td>
              <td><span className="chip">{u.role}</span></td>
              <td style={{ fontSize: 11.5, color: "var(--text-mid)" }}>{u.issue}</td>
              <td className="muted fs-xs">{u.at}</td>
              <td><span className={`chip ${u.risk === "high" ? "danger" : "warn"}`}><span className="dot"/>{u.risk}</span></td>
              <td>
                <div className="row gap-3">
                  <button className="btn ghost sm">Acknowledge</button>
                  <button className="btn primary sm">Revoke</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ── FILING REGISTER ──────────────────────────────────────────
const FilingRegister = ({ onBack }) => (
  <div className="page">
    <BackButton onBack={onBack} label="Back to Compliance Hub"/>
    <PageHead title="Filing Register" subtitle="Complete statutory filing history · 7-year retention · audit-ready">
      <button className="btn ghost"><Icon name="filter"/>Filters</button>
      <button className="btn primary"><Icon name="download"/>Export FY register</button>
    </PageHead>

    <div className="grid g-cols-4">
      <MiniMetric icon="check"  label="Filings (FY 25-26)" value="48" delta="100% on-time" tone="up"/>
      <MiniMetric icon="coins"  label="Total paid"        value="₹18.92 Cr" delta="To govt" tone=""/>
      <MiniMetric icon="shield" label="Acknowledgements"  value="48 / 48" delta="All verified" tone="up"/>
      <MiniMetric icon="clock"  label="Avg filing time"   value="3.2 days" delta="Before due" tone="up"/>
    </div>

    <div className="card" style={{ marginTop: 14, padding: 0, overflow: "hidden" }}>
      <table className="tbl">
        <thead>
          <tr><th>Period</th><th>Type</th><th>Amount</th><th>Challan #</th><th>Filed by</th><th>Ack date</th><th>Receipt</th></tr>
        </thead>
        <tbody>
          {[
            ["Nov 2025","TDS","₹64.30 L","281","Atlas (Auto)","—","Pending"],
            ["Oct 2025","TDS","₹62.10 L","281","Atlas (Auto)","Nov 07, 09:14","BLR-A4-29481"],
            ["Oct 2025","PF","₹36.84 L","ECR","Atlas (Auto)","Nov 14, 16:02","EPFO-882142"],
            ["Oct 2025","ESI","₹4.15 L","ESIC","Atlas (Auto)","Nov 12, 11:30","ESIC-901284"],
            ["Oct 2025","PT","₹4.92 L","PT-KA","Meera Iyer","Nov 19, 14:48","PT-KA-1812"],
            ["Q2 FY26","24Q","₹1.84 Cr","24Q","Meera Iyer","Oct 31, 17:22","TRACES-09182"],
            ["Sep 2025","TDS","₹61.40 L","281","Atlas (Auto)","Oct 07, 10:02","BLR-A4-28194"],
            ["Sep 2025","PF","₹36.44 L","ECR","Atlas (Auto)","Oct 14, 15:48","EPFO-880241"],
            ["Sep 2025","ESI","₹4.08 L","ESIC","Atlas (Auto)","Oct 12, 09:22","ESIC-899142"],
            ["Aug 2025","TDS","₹60.80 L","281","Atlas (Auto)","Sep 07, 08:32","BLR-A4-26841"],
          ].map((r, i) => (
            <tr key={i}>
              <td className="fw-600">{r[0]}</td>
              <td><span className="chip">{r[1]}</span></td>
              <td className="mono">{r[2]}</td>
              <td className="mono muted fs-sm">{r[3]}</td>
              <td>
                {r[4].includes("Atlas") ? (
                  <span className="chip ok"><Icon name="sparkle" size={9}/>Atlas</span>
                ) : (
                  <div className="row-emp" style={{ alignItems: "center" }}><Avatar name={r[4]} size={20}/><span style={{ fontSize: 11 }}>{r[4]}</span></div>
                )}
              </td>
              <td className="muted fs-sm">{r[5]}</td>
              <td>
                {r[6] === "Pending" ? <span className="chip warn"><span className="dot"/>Pending</span>
                                    : <span className="mono fs-xs" style={{ color: "var(--accent-bright)" }}>{r[6]}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ── HELP CENTER ──────────────────────────────────────────────
const HelpCenter = ({ onBack }) => (
  <div className="page">
    <BackButton onBack={onBack} label="Back"/>
    <PageHead title="Help Center" subtitle="Documentation, tutorials and direct support · we're here 24/7">
      <button className="btn ghost"><Icon name="globe"/>Status page</button>
      <button className="btn primary"><Icon name="send"/>Contact support</button>
    </PageHead>

    <div className="search" style={{ maxWidth: "none", marginTop: 8 }}>
      <Icon name="search" size={14}/>
      <input className="input" style={{ border: 0, background: "transparent", flex: 1, height: 22, color: "var(--text)" }} placeholder="Search docs, tutorials, troubleshooting…"/>
    </div>

    <div className="grid g-cols-3" style={{ marginTop: 18 }}>
      {[
        { icon: "play", title: "Getting Started", sub: "Set up Source One in 30 minutes", count: "12 articles", color: "#10B981" },
        { icon: "payroll", title: "Running Payroll", sub: "Monthly cycle, anomalies, approval flows", count: "24 articles", color: "#60A5FA" },
        { icon: "shield", title: "Statutory Compliance", sub: "TDS, PF, ESI, PT, Form 16 — India specific", count: "18 articles", color: "#A78BFA" },
        { icon: "sparkle", title: "AI · Atlas", sub: "Co-pilot, anomaly detection, chatbot setup", count: "9 articles", color: "#34D399" },
        { icon: "user", title: "Employee Self-Service", sub: "Portal usage, mobile app, WhatsApp ingestion", count: "15 articles", color: "#F59E0B" },
        { icon: "log", title: "Integrations & API", sub: "HRMS, ERP, accounting systems", count: "11 articles", color: "#22D3EE" },
      ].map(c => (
        <div key={c.title} className="card" style={{ padding: 18, cursor: "default" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: `linear-gradient(135deg, ${c.color}33, ${c.color}10)`,
            border: `1px solid ${c.color}40`,
            color: c.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 12,
          }}>
            <Icon name={c.icon} size={16}/>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</div>
          <div className="muted fs-xs" style={{ marginTop: 4, marginBottom: 8 }}>{c.sub}</div>
          <div className="row between">
            <span className="muted fs-xs">{c.count}</span>
            <Icon name="arrowRight" size={11} color="var(--text-muted)"/>
          </div>
        </div>
      ))}
    </div>

    <div className="grid g-cols-2" style={{ marginTop: 18 }}>
      <div className="card">
        <div className="card-head"><div className="card-title">Contact options</div></div>
        <div className="col gap-4">
          {[
            { icon: "send", title: "Email", sub: "support@sourceone.in · response within 4 hrs", chip: "Always available" },
            { icon: "user", title: "Phone", sub: "+91 80 4707 1800 · Mon-Fri 9 AM–9 PM IST", chip: "Mon–Fri" },
            { icon: "sparkle", title: "Atlas Chat", sub: "AI assistant available 24/7 · instant", chip: "Live now", tone: "ok" },
            { icon: "user", title: "Dedicated CSM", sub: "Vikram Singh · vikram@sourceone.in", chip: "Premium" },
          ].map(c => (
            <div key={c.title} className="row gap-4" style={{ padding: 10, borderRadius: 8, background: "var(--inset-1)", border: "1px solid var(--border)" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(16,185,129,0.14)", color: "#34D399", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={c.icon} size={13}/>
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{c.title}</div>
                <div className="muted fs-xs">{c.sub}</div>
              </div>
              <span className={`chip ${c.tone || ""}`}>{c.chip}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title">System status<small>All systems operational</small></div></div>
        <div className="col gap-3">
          {[
            ["Payroll Engine",   "Operational", 99.99],
            ["Atlas (AI)",       "Operational", 99.98],
            ["Bank Connect (HDFC)", "Operational", 99.95],
            ["EPFO Gateway",     "Operational", 99.78],
            ["TIN-NSDL",         "Degraded",    97.42],
            ["Mobile App",       "Operational", 99.99],
          ].map(([name, status, up]) => (
            <div key={name} className="row between" style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <div className="row gap-3 center">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: status === "Operational" ? "#10B981" : "#F59E0B", boxShadow: `0 0 6px ${status === "Operational" ? "#10B981" : "#F59E0B"}80` }}/>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{name}</span>
              </div>
              <div className="row gap-4 center">
                <span className={`chip ${status === "Operational" ? "ok" : "warn"}`} style={{ fontSize: 9.5 }}>{status}</span>
                <span className="mono fs-xs muted">{up}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, {
  FaqLibrary, BotTraining, ScheduledReports, ReportBuilder,
  PermissionAudit, FilingRegister, HelpCenter,
});
