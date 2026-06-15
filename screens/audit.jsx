// Audit Log
const Audit = () => {
  const [riskFilter, setRiskFilter] = useState("all");
  const [verifying, setVerifying] = useState(false);
  const [lastVerified, setLastVerified] = useState("4m ago");
  const filtered = riskFilter === "all" ? AUDIT_LOG : AUDIT_LOG.filter(e => e.risk === riskFilter);

  const verifyIntegrity = () => {
    setVerifying(true);
    window.toast("Verifying audit chain…", { icon: "shield", tone: "ai", sub: "Re-hashing 18,294 blocks · SHA-256" });
    setTimeout(() => {
      setVerifying(false);
      setLastVerified("just now");
      window.toast("Integrity verified · 18,294 blocks", { icon: "check", tone: "ok", sub: "Chain head: 0x4f8a2c91…b91c · valid" });
    }, 1800);
  };

  return (
    <div className="page">
      <PageHead title="Audit Log" subtitle="Immutable, append-only activity trail · cryptographically signed · 7-year retention">
        <button className="btn ghost"><Icon name="filter"/>Filters</button>
        <button className="btn ghost"><Icon name="download"/>Export (SIEM)</button>
        <button className="btn primary" onClick={verifyIntegrity} disabled={verifying} style={{ opacity: verifying ? 0.65 : 1 }}>
          <Icon name="shield"/>{verifying ? "Verifying…" : "Verify integrity"}
        </button>
      </PageHead>

      <div className="grid g-cols-4">
        <MiniMetric icon="log"   label="Events (24h)" value="1,284" delta="+18% vs avg" tone=""/>
        <MiniMetric icon="alert" label="High risk" value="1" delta="Auto-quarantined" tone="down"/>
        <MiniMetric icon="user"  label="Active sessions" value="47" delta="3 privileged" tone=""/>
        <MiniMetric icon="shield" label="Integrity hash" value={verifying ? "CHECKING…" : "VALID"} delta={`Last verified ${lastVerified}`} tone={verifying ? "" : "up"}/>
      </div>

      {/* Filter row */}
      <div className="card" style={{ marginTop: 12, padding: "10px 14px" }}>
        <div className="row gap-4" style={{ flexWrap: "wrap" }}>
          <div className="search" style={{ maxWidth: 320 }}>
            <Icon name="search" size={13}/>
            <input className="input" style={{ border: 0, background: "transparent", padding: 0, height: 18, flex: 1, color: "var(--text)" }} placeholder="Search actor, target, IP…"/>
          </div>
          <select className="select"><option>All actions</option><option>Created</option><option>Approved</option><option>Login</option></select>
          <select className="select"><option>All actors</option><option>Humans only</option><option>System</option><option>AI (Atlas)</option></select>

          <div className="tabs" style={{ marginLeft: "auto" }}>
            {["all","high","med","low"].map(r => (
              <button key={r} data-active={riskFilter === r} onClick={() => setRiskFilter(r)} style={{ textTransform: "capitalize" }}>
                {r === "all" ? "All" : r === "high" ? "High risk" : r === "med" ? "Medium" : "Low"}
              </button>
            ))}
          </div>
          <span className="muted fs-xs">{filtered.length} events</span>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 320px", gap: 14, marginTop: 12 }}>
        {/* Event list */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Event</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Source IP</th>
                <th>Risk</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td className="mono muted" style={{ fontSize: 10.5 }}>{e.id}</td>
                  <td>
                    <div className="row gap-3 center">
                      {e.actor === "System" || e.actor === "External" ? (
                        <div style={{ width: 22, height: 22, borderRadius: 5, background: "var(--inset-4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon name={e.actor === "External" ? "globe" : "cpu"} size={11} color="var(--text-muted)"/>
                        </div>
                      ) : e.actor.includes("Atlas") ? (
                        <div style={{ width: 22, height: 22, borderRadius: 5, background: "linear-gradient(135deg, #10B981, #34D399)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon name="sparkle" size={11} color="#052E1A"/>
                        </div>
                      ) : (
                        <Avatar name={e.actor} size={22}/>
                      )}
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{e.actor}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`chip ${actionTone(e.action)}`} style={{ fontSize: 10 }}>{e.action}</span>
                  </td>
                  <td style={{ fontSize: 11.5 }}>{e.target}</td>
                  <td className="mono muted" style={{ fontSize: 10.5 }}>{e.ip}</td>
                  <td>
                    <span className={`chip ${e.risk === "high" ? "danger" : e.risk === "med" ? "warn" : ""}`} style={{ fontSize: 9.5 }}>
                      <span className="dot"/>{e.risk}
                    </span>
                  </td>
                  <td className="muted fs-xs" style={{ whiteSpace: "nowrap" }}>{e.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Side panel */}
        <div className="col gap-6">
          <div className="card">
            <div className="card-head"><div className="card-title">Integrity proof</div></div>
            <div className="col gap-4" style={{ fontSize: 11.5 }}>
              <div className="row between">
                <span className="muted fs-xs">Chain head</span>
                <span className="chip ok"><span className="dot"/>Valid</span>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--code-bg)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "var(--font-mono)", fontSize: 10, lineHeight: 1.5, color: "#34D399", wordBreak: "break-all" }}>
                0x4f8a2c91…b91c<br/>
                <span style={{ color: "rgba(255,255,255,0.55)" }}>Block 18,294 · Nov 25 09:42:18</span>
              </div>
              <div className="row between">
                <span className="muted fs-xs">Hash algorithm</span>
                <span className="mono">SHA-256</span>
              </div>
              <div className="row between">
                <span className="muted fs-xs">Anchored to</span>
                <span className="mono">AWS QLDB</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Risk distribution<small>Last 7 days</small></div></div>
            <div className="col gap-4">
              <RiskBar label="Critical" count={0} total={1284} color="#F43F5E"/>
              <RiskBar label="High"     count={4} total={1284} color="#FB7185"/>
              <RiskBar label="Medium"   count={32} total={1284} color="#F59E0B"/>
              <RiskBar label="Low"      count={1248} total={1284} color="#34D399"/>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Compliance</div></div>
            <div className="col gap-3">
              <ComplianceRow label="SOC 2 Type II"   ok at="Audited Sep 2025"/>
              <ComplianceRow label="ISO 27001"       ok at="Renewed Mar 2025"/>
              <ComplianceRow label="GDPR / DPDP"     ok at="Compliant"/>
              <ComplianceRow label="Data residency" ok at="India · ap-south-1"/>
              <ComplianceRow label="Encryption"     ok at="AES-256 at rest, TLS 1.3 in transit"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function actionTone(a) {
  if (["Approved","Login","Sync","Backup","Created","Scanned"].includes(a)) return "ok";
  if (["Viewed","Uploaded"].includes(a)) return "info";
  if (["Flagged","Recalculated"].includes(a)) return "warn";
  if (["Blocked","Rejected"].includes(a)) return "danger";
  return "";
}

const RiskBar = ({ label, count, total, color }) => {
  const pct = (count / total) * 100;
  return (
    <div>
      <div className="row between" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 11.5 }}>{label}</span>
        <span className="mono fs-xs muted">{count}</span>
      </div>
      <div className="bar" style={{ height: 4 }}>
        <div style={{ width: `${Math.max(pct, count > 0 ? 2 : 0)}%`, background: color, boxShadow: `0 0 8px ${color}80` }}/>
      </div>
    </div>
  );
};

const ComplianceRow = ({ label, ok, at }) => (
  <div className="row between" style={{ padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
    <div className="row gap-3 center">
      <Icon name="check" size={12} color="#34D399"/>
      <span style={{ fontSize: 12 }}>{label}</span>
    </div>
    <span className="muted fs-xs">{at}</span>
  </div>
);

window.Audit = Audit;
