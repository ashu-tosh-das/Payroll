// Admin Reimbursements — review, approve, and reject all employee claims

const AdminReimbursements = () => {
  // Initialise from shared global store; admin sees ALL employees
  const [items,       setItems]       = useState(() => window.loadStore('REIMBURSEMENT_STORE', window.REIMBURSEMENT_STORE || []));
  const [filter,      setFilter]      = useState("all");
  const [empFilter,   setEmpFilter]   = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [selected,    setSelected]    = useState(null);
  const [adminNote,   setAdminNote]   = useState("");
  const [processing,  setProcessing]  = useState(false);

  // Re-read global store when component mounts (picks up employee submissions)
  useEffect(() => {
    setItems([...(window.REIMBURSEMENT_STORE || [])]);
  }, []);

  // ── Derived data ─────────────────────────────────────────────
  const filtered = items.filter(r => {
    const statusOk = filter      === "all" || r.status.toLowerCase() === filter;
    const empOk    = empFilter   === "all" || r.empId === empFilter;
    const monthOk  = monthFilter === "all" || r.month === monthFilter;
    return statusOk && empOk && monthOk;
  });

  const uniqueEmployees = [...new Map(items.map(r => [r.empId, { id: r.empId, name: r.empName }])).values()];
  const uniqueMonths    = [...new Set(items.map(r => r.month))];

  const pendingCount   = items.filter(r => r.status === "Pending").length;
  const flaggedCount   = items.filter(r => r.status === "Flagged").length;
  const pendingAmt     = items.filter(r => r.status === "Pending" || r.status === "Flagged").reduce((a, r) => a + r.amount, 0);
  const approvedAmt    = items.filter(r => r.status === "Approved").reduce((a, r) => a + r.amount, 0);

  // ── Approve / Reject action ──────────────────────────────────
  const processAction = (action) => {
    if (!selected) return;
    setProcessing(true);
    setTimeout(() => {
      const newStatus = action === "approve" ? "Approved" : "Rejected";
      const note      = adminNote.trim()
        || (action === "approve" ? "Approved by admin — policy compliant." : "Rejected by admin.");

      // Sync back to global store
      const gIdx = (window.REIMBURSEMENT_STORE || []).findIndex(r => r.id === selected.id);
      if (gIdx !== -1) {
        window.REIMBURSEMENT_STORE[gIdx] = { ...window.REIMBURSEMENT_STORE[gIdx], status: newStatus, notes: note };
      }

      const updated = { ...selected, status: newStatus, notes: note };
      setItems(prev => { const next = prev.map(r => r.id === selected.id ? updated : r); window.persist('REIMBURSEMENT_STORE', next); window.REIMBURSEMENT_STORE = next; return next; });
      setSelected(updated);
      setAdminNote("");
      setProcessing(false);

      window.toast(`${selected.id} ${newStatus.toLowerCase()}`, {
        icon: action === "approve" ? "check" : "x",
        tone: action === "approve" ? "ok" : "warn",
        sub: `${selected.empName} · ${fmtINR(selected.amount)}`,
      });
    }, 800);
  };

  const bulkApprove = () => {
    const pending = filtered.filter(r => r.status === "Pending");
    if (!pending.length) { window.toast("No pending claims in current view", { icon: "check", tone: "ok" }); return; }
    pending.forEach(r => {
      const idx = (window.REIMBURSEMENT_STORE || []).findIndex(x => x.id === r.id);
      if (idx !== -1) {
        window.REIMBURSEMENT_STORE[idx].status = "Approved";
        window.REIMBURSEMENT_STORE[idx].notes  = "Bulk approved by admin.";
      }
    });
    setItems(prev => { const next = prev.map(r => pending.find(p => p.id === r.id) ? { ...r, status: "Approved", notes: "Bulk approved by admin." } : r); window.persist('REIMBURSEMENT_STORE', next); window.REIMBURSEMENT_STORE = next; return next; });
    if (selected && pending.find(p => p.id === selected.id)) {
      setSelected(s => ({ ...s, status: "Approved", notes: "Bulk approved by admin." }));
    }
    window.toast(`${pending.length} claims approved`, { icon: "check", tone: "ok",
      sub: `Total: ${fmtINR(pending.reduce((a, r) => a + r.amount, 0))}` });
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="page">
      <PageHead title="Reimbursements"
        subtitle="Review, approve, or reject employee expense claims across all clients">
        <button className="btn ghost"><Icon name="download"/>Export CSV</button>
        <button className="btn primary" onClick={bulkApprove}>
          <Icon name="check"/>Approve All Pending
        </button>
      </PageHead>

      {/* KPI strip */}
      <div className="grid g-cols-4">
        <MiniMetric icon="coins"   label="Pending approval"   value={fmtINR(pendingAmt, { compact: true })}    delta={`${pendingCount} claims`}                                              tone=""/>
        <MiniMetric icon="alert"   label="AI flagged"         value={flaggedCount}                              delta="Possible duplicates"                                                   tone="down"/>
        <MiniMetric icon="check"   label="Approved (MTD)"     value={fmtINR(approvedAmt, { compact: true })}   delta={`${items.filter(r => r.status === "Approved").length} claims`}          tone="up"/>
        <MiniMetric icon="report"  label="Total claims"       value={items.length}                              delta={`${uniqueEmployees.length} employees`}                                  tone=""/>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.65fr 1fr", gap: 14, marginTop: 14 }}>
        {/* ── Claims table ─────────────────────────────────────── */}
        <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Toolbar */}
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
            <div className="row between center">
              <div className="card-title">All claims<small>{filtered.length} shown</small></div>
              <div className="row gap-2">
                <select className="select" value={empFilter}
                  onChange={e => setEmpFilter(e.target.value)}>
                  <option value="all">All employees</option>
                  {uniqueEmployees.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
                <select className="select" value={monthFilter}
                  onChange={e => setMonthFilter(e.target.value)}>
                  <option value="all">All months</option>
                  {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="tabs" style={{ marginTop: 8 }}>
              {["all","pending","approved","rejected","flagged"].map(s => (
                <button key={s} data-active={filter === s} onClick={() => setFilter(s)}
                  style={{ textTransform: "capitalize" }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto", flex: 1 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Client</th>
                  <th>Category</th>
                  <th className="right">Amount</th>
                  <th>Date</th>
                  <th>Proof</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "28px 0", color: "var(--text-muted)" }}>
                      No claims match the selected filters
                    </td>
                  </tr>
                ) : filtered.map(r => (
                  <tr key={r.id}
                    data-selected={selected?.id === r.id}
                    onClick={() => { setSelected(r); setAdminNote(""); }}
                    style={{ cursor: "default" }}>
                    <td className="mono muted fs-sm">{r.id}</td>
                    <td>
                      <div className="row-emp">
                        <Avatar name={r.empName} size={24}/>
                        <div>
                          <div className="row-emp-name">{r.empName}</div>
                          <div className="row-emp-meta">{r.empId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                        background: "rgba(16,185,129,0.12)", color: "#34D399",
                      }}>{r.clientCode}</span>
                    </td>
                    <td><span className="chip" style={{ fontSize: 9.5 }}>{r.category}</span></td>
                    <td className="right num">{fmtINR(r.amount)}</td>
                    <td className="muted fs-sm">{r.date}</td>
                    <td>
                      <span style={{
                        padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 800,
                        background: r.proofType === "pdf" ? "rgba(244,63,94,0.12)" : "rgba(96,165,250,0.12)",
                        color: r.proofType === "pdf" ? "#FCA5B0" : "#93C5FD",
                      }}>
                        {r.proofType === "pdf" ? "PDF" : "IMG"}
                      </span>
                    </td>
                    <td>
                      {r.status === "Flagged"
                        ? <span className="chip warn"><Icon name="alert" size={9}/>Flagged</span>
                        : <StatusChip status={
                            r.status === "Approved" ? "Approved" :
                            r.status === "Rejected" ? "Rejected" : "Pending"
                          }/>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 600 }}>
                  <td colSpan={4}>Total · {filtered.length} claims</td>
                  <td className="right num">{fmtINR(filtered.reduce((a, r) => a + r.amount, 0))}</td>
                  <td colSpan={3}/>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Detail panel ─────────────────────────────────────── */}
        {selected ? (
          <ClaimDetailPanel
            claim={selected}
            adminNote={adminNote}
            setAdminNote={setAdminNote}
            processing={processing}
            onAction={processAction}
          />
        ) : (
          <div className="card" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 8, color: "var(--text-muted)", minHeight: 320,
          }}>
            <Icon name="file" size={34} color="var(--text-muted)"/>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>Select a claim to review</div>
            <div className="fs-xs">Click any row to see full details and take action</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Claim detail + approval panel ──────────────────────────────
const ClaimDetailPanel = ({ claim: r, adminNote, setAdminNote, processing, onAction }) => {
  const isActionable = r.status === "Pending" || r.status === "Flagged";

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        background: "linear-gradient(180deg, rgba(16,185,129,0.07), transparent)",
      }}>
        <div className="row between center">
          <div>
            <div className="fw-600" style={{ fontSize: 13.5 }}>{r.id}</div>
            <div className="muted fs-xs">{r.submittedAt} · {r.month}</div>
          </div>
          {r.status === "Flagged"
            ? <span className="chip warn"><Icon name="alert" size={9}/>AI Flagged</span>
            : <StatusChip status={
                r.status === "Approved" ? "Approved" :
                r.status === "Rejected" ? "Rejected" : "Pending"
              }/>
          }
        </div>
      </div>

      <div className="col gap-5" style={{ padding: 16 }}>
        {/* Employee */}
        <div style={{ padding: "10px 12px", borderRadius: 9, background: "var(--inset-2)", border: "1px solid var(--border)" }}>
          <div className="row gap-4 center">
            <Avatar name={r.empName} size={34}/>
            <div style={{ flex: 1 }}>
              <div className="fw-600" style={{ fontSize: 12.5 }}>{r.empName}</div>
              <div className="muted fs-xs">{r.empId} · {r.clientName}</div>
            </div>
            <span style={{
              padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
              background: "rgba(16,185,129,0.12)", color: "#34D399",
            }}>{r.clientCode}</span>
          </div>
        </div>

        {/* Claim details */}
        <div className="col gap-3" style={{ fontSize: 12 }}>
          <div className="row between">
            <span className="muted">Category</span>
            <span className="chip" style={{ fontSize: 9.5 }}>{r.category}</span>
          </div>
          <div className="row between">
            <span className="muted">Amount</span>
            <span className="fw-600 mono" style={{ fontSize: 15 }}>{fmtINR(r.amount)}</span>
          </div>
          <div className="row between">
            <span className="muted">Expense date</span>
            <span>{r.date}</span>
          </div>
          <div>
            <div className="muted" style={{ marginBottom: 4 }}>Description</div>
            <div style={{ lineHeight: 1.5, color: "var(--text-mid)" }}>{r.description}</div>
          </div>
        </div>

        {/* Proof document */}
        <div style={{
          padding: "10px 12px", borderRadius: 9,
          background: r.proofType === "pdf" ? "rgba(244,63,94,0.06)" : "rgba(96,165,250,0.06)",
          border: `1px solid ${r.proofType === "pdf" ? "rgba(244,63,94,0.18)" : "rgba(96,165,250,0.18)"}`,
        }}>
          <div className="row between center">
            <div className="row gap-3 center">
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: r.proofType === "pdf" ? "rgba(244,63,94,0.18)" : "rgba(96,165,250,0.18)",
                color: r.proofType === "pdf" ? "#FCA5B0" : "#93C5FD",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 800,
              }}>
                {r.proofType === "pdf" ? "PDF" : "IMG"}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{r.proof}</div>
                <div className="muted fs-xs">{r.proofSize} · Document valid ✓</div>
              </div>
            </div>
            <button className="btn ghost sm"
              onClick={() => window.toast(`Downloading ${r.proof}`, { icon: "download", tone: "info" })}>
              <Icon name="download" size={10}/>View
            </button>
          </div>
        </div>

        {/* AI risk alert for flagged claims */}
        {r.status === "Flagged" && (
          <div style={{
            padding: "10px 12px", borderRadius: 9,
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
          }}>
            <div className="row gap-3 center" style={{ marginBottom: 5 }}>
              <Icon name="sparkle" size={12} color="#F59E0B"/>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#F59E0B" }}>
                Atlas AI · Risk detected
              </span>
            </div>
            <div className="fs-xs" style={{ color: "var(--text-mid)", lineHeight: 1.5 }}>
              {r.notes || "Possible duplicate or policy violation detected. Review carefully before approving."}
            </div>
          </div>
        )}

        {/* Prior admin note (resolved claims) */}
        {!isActionable && r.notes && (
          <div style={{
            padding: "10px 12px", borderRadius: 9, background: "var(--inset-2)", border: "1px solid var(--border)",
          }}>
            <div className="fs-xs muted fw-600" style={{ marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Admin Note
            </div>
            <div className="fs-xs" style={{ lineHeight: 1.5, color: "var(--text-mid)" }}>{r.notes}</div>
          </div>
        )}

        {/* Admin note input (actionable claims) */}
        {isActionable && (
          <div>
            <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Admin Note (optional)
            </div>
            <textarea className="input"
              style={{ width: "100%", height: 64, padding: 8, resize: "none", fontSize: 11.5 }}
              placeholder="Add a note for the employee — reason for approval or rejection…"
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}/>
          </div>
        )}

        {/* Action buttons */}
        {isActionable ? (
          <div className="row gap-3">
            <button className="btn primary" style={{ flex: 1 }}
              onClick={() => onAction("approve")} disabled={processing}>
              <Icon name={processing ? "sparkle" : "check"} size={11}/>
              {processing ? "Processing…" : "Approve"}
            </button>
            <button style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              padding: "0 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: "rgba(244,63,94,0.10)",
              border: "1px solid rgba(244,63,94,0.30)",
              color: "#FCA5B0",
              cursor: "default", fontFamily: "inherit",
              opacity: processing ? 0.5 : 1,
            }}
              onClick={() => onAction("reject")} disabled={processing}>
              <Icon name="x" size={11}/>Reject
            </button>
          </div>
        ) : (
          <div style={{
            padding: "10px 12px", borderRadius: 9,
            background: r.status === "Approved"
              ? "rgba(16,185,129,0.08)" : "rgba(244,63,94,0.08)",
            border: `1px solid ${r.status === "Approved" ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)"}`,
          }}>
            <div className="row gap-3 center">
              <Icon name={r.status === "Approved" ? "check" : "x"} size={13}
                color={r.status === "Approved" ? "#34D399" : "#FCA5B0"}/>
              <span style={{
                fontSize: 12.5, fontWeight: 600,
                color: r.status === "Approved" ? "#34D399" : "#FCA5B0",
              }}>
                Claim {r.status === "Approved" ? "approved" : "rejected"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { AdminReimbursements, ClaimDetailPanel });
