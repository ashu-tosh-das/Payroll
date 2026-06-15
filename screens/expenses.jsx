// Expense Management — reimbursements with WhatsApp/Slack ingestion

const EXPENSES = [
  { id: "EX-1842", emp: "Aarav Sharma",   empId: "SO-1184", amount: 12_400, cat: "Travel · Cab",        date: "Nov 22", channel: "WhatsApp", merchant: "Uber India", status: "Pending", policy: "ok", auto: true, project: "Client visit · MUM", receipt: "ola_2842.jpg", risk: 0.12 },
  { id: "EX-1841", emp: "Bhavya Patel",   empId: "SO-1129", amount: 38_600, cat: "Travel · Flight",     date: "Nov 21", channel: "Slack",    merchant: "IndiGo",      status: "Pending", policy: "ok", auto: false, project: "Sales QBR", receipt: "indigo_91442.pdf", risk: 0.08 },
  { id: "EX-1840", emp: "Pooja Mehta",    empId: "SO-1064", amount: 14_200, cat: "Travel · Cab",        date: "Nov 20", channel: "WhatsApp", merchant: "BlueSmart",   status: "Flagged", policy: "duplicate", auto: false, project: "Mumbai client", receipt: "blueSmart_3284.jpg", risk: 0.89 },
  { id: "EX-1839", emp: "Chitra Iyer",    empId: "SO-1167", amount: 2_840,  cat: "Meals",               date: "Nov 19", channel: "Web",      merchant: "Swiggy",      status: "Approved", policy: "ok", auto: true, project: "Team lunch", receipt: "swiggy_9821.pdf", risk: 0.03 },
  { id: "EX-1838", emp: "Karthik Reddy",  empId: "SO-1213", amount: 1_28_000, cat: "Travel · Hotel",   date: "Nov 18", channel: "Email",    merchant: "Marriott BLR",status: "Approved", policy: "over",   auto: false, project: "Customer summit", receipt: "marriott_44213.pdf", risk: 0.34 },
  { id: "EX-1837", emp: "Sahil Khanna",   empId: "SO-1098", amount: 8_900,  cat: "Office supplies",    date: "Nov 17", channel: "Slack",    merchant: "Amazon Business", status: "Approved", policy: "ok", auto: true, project: "Standing desk", receipt: "amazon_88291.pdf", risk: 0.05 },
  { id: "EX-1836", emp: "Nikhil Verma",   empId: "SO-1142", amount: 24_500, cat: "Subscription",        date: "Nov 16", channel: "Web",      merchant: "Figma Org",   status: "Reimbursed", policy: "ok", auto: true, project: "Design team", receipt: "figma_inv.pdf", risk: 0.02 },
  { id: "EX-1835", emp: "Vidya Rao",      empId: "SO-1071", amount: 4_120,  cat: "Meals",               date: "Nov 15", channel: "WhatsApp", merchant: "Cafe Coffee Day", status: "Pending", policy: "ok", auto: true, project: "Vendor meeting", receipt: "ccd_2841.jpg", risk: 0.07 },
];

const POLICY_RULES = [
  { id: "P-01", category: "Travel · Cab",    rule: "Max ₹15,000 / claim", limit: "15000", per: "trip",  notes: "Applies to all cab bookings via any platform", scope: "All employees",  exceptions: "L6+ unlimited", active: true },
  { id: "P-02", category: "Travel · Flight", rule: "Economy only · L≤5",  limit: "",      per: "trip",  notes: "Business class only for L6+ band", scope: "All employees",  exceptions: "Business class L6+", active: true },
  { id: "P-03", category: "Travel · Hotel",  rule: "Max ₹8,000 / night",  limit: "8000",  per: "day",   notes: "Applies to Tier-1 cities only", scope: "Tier-1 cities",  exceptions: "Customer summits", active: true },
  { id: "P-04", category: "Meals",           rule: "Max ₹500 / day · self",limit: "500",  per: "day",   notes: "Team lunches have separate cap", scope: "All employees",  exceptions: "Team lunch up to ₹3,000", active: true },
  { id: "P-05", category: "Subscription",    rule: "Pre-approval required",limit: "10000",per: "month", notes: "Requires manager sign-off above ₹10K", scope: ">₹10,000",      exceptions: "—", active: true },
];

const CATEGORY_OPTIONS = ["Travel · Cab", "Travel · Flight", "Travel · Hotel", "Meals", "Subscription", "Office supplies", "Entertainment", "Training"];

const Expenses = ({ onNav }) => {
  const [selected, setSelected] = useState(EXPENSES[2]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [rulesState, setRulesState] = useState(() => window.loadStore('POLICY_RULES', POLICY_RULES));
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [pendingContractorCount, setPendingContractorCount] = useState(
    () => (window.PENDING_CONTRACTOR_INVOICES || []).length
  );
  const [approvedExpenses, setApprovedExpenses] = useState(() => window.loadStore('approved_expenses', {}));

  const filtered = statusFilter === "all" ? EXPENSES : EXPENSES.filter(e => e.status.toLowerCase() === statusFilter);

  const totalPending = EXPENSES.filter(e => e.status === "Pending").reduce((a, e) => a + e.amount, 0);
  const flagged = EXPENSES.filter(e => e.status === "Flagged").length;

  // FEA-016: Start editing a rule
  const startEdit = (rule) => {
    setEditingRuleId(rule.id);
    setEditDraft({ limit: rule.limit, notes: rule.notes, active: rule.active });
  };

  // FEA-016: Save edited rule
  const saveEdit = (ruleId) => {
    setRulesState(prev => {
      const next = prev.map(r =>
        r.id === ruleId
          ? { ...r, limit: editDraft.limit, notes: editDraft.notes, active: editDraft.active,
              rule: editDraft.limit ? `Max ₹${Number(editDraft.limit).toLocaleString("en-IN")} / ${r.per}` : r.rule }
          : r
      );
      window.persist('POLICY_RULES', next);
      return next;
    });
    setEditingRuleId(null);
    setEditDraft(null);
    window.toast && window.toast("Policy rule updated", { icon: "check", tone: "ok" });
  };

  // FEA-016: Cancel editing
  const cancelEdit = () => {
    setEditingRuleId(null);
    setEditDraft(null);
  };

  // FEA-016: Delete rule (only for rules beyond first 2)
  const deleteRule = (ruleId) => {
    setRulesState(prev => { const next = prev.filter(r => r.id !== ruleId); window.persist('POLICY_RULES', next); return next; });
    window.toast && window.toast("Policy rule deleted", { icon: "x", tone: "warn" });
  };

  // FEA-016: Add rule via modal
  const openAddRule = () => {
    let formData = { category: CATEGORY_OPTIONS[0], limit: "", per: "day", notes: "" };
    window.openModal({
      title: "Add Policy Rule",
      subtitle: "Define a new expense policy rule",
      width: 420,
      confirmText: "Add Rule",
      body: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-mid)", marginBottom: 4 }}>Category</div>
            <select className="select" style={{ width: "100%" }}
              defaultValue={CATEGORY_OPTIONS[0]}
              onChange={e => { formData.category = e.target.value; }}>
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="row gap-3">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--text-mid)", marginBottom: 4 }}>Limit (₹)</div>
              <input className="input" type="number" placeholder="e.g. 5000"
                onChange={e => { formData.limit = e.target.value; }}
                style={{ width: "100%" }}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--text-mid)", marginBottom: 4 }}>Per</div>
              <select className="select" style={{ width: "100%" }}
                defaultValue="day"
                onChange={e => { formData.per = e.target.value; }}>
                <option value="day">Day</option>
                <option value="trip">Trip</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-mid)", marginBottom: 4 }}>Notes</div>
            <input className="input" type="text" placeholder="Optional notes about this rule"
              onChange={e => { formData.notes = e.target.value; }}
              style={{ width: "100%" }}/>
          </div>
        </div>
      ),
      onConfirm: () => {
        const nextId = "P-" + String(rulesState.length + 1).padStart(2, "0");
        const newRule = {
          id: nextId,
          category: formData.category,
          rule: formData.limit ? `Max ₹${Number(formData.limit).toLocaleString("en-IN")} / ${formData.per}` : "Pre-approval required",
          limit: formData.limit,
          per: formData.per,
          notes: formData.notes,
          scope: "All employees",
          exceptions: "—",
          active: true,
        };
        setRulesState(prev => { const next = [...prev, newRule]; window.persist('POLICY_RULES', next); return next; });
        window.toast && window.toast("Policy rule added", { icon: "check", tone: "ok" });
      },
    });
  };

  // FEA-024: Approve & reimburse handler
  const handleApprove = (exp) => {
    const isVendorCategory = exp.cat && (exp.cat.includes("Travel") || exp.cat.includes("Subscription"));
    if (isVendorCategory) {
      const invoice = {
        expenseId: exp.id,
        vendor: exp.merchant,
        amount: exp.amount,
        category: exp.cat,
        date: exp.date,
        fromExpense: true,
      };
      window.PENDING_CONTRACTOR_INVOICES = [...(window.PENDING_CONTRACTOR_INVOICES || []), invoice];
      setPendingContractorCount((window.PENDING_CONTRACTOR_INVOICES || []).length);
      window.toast && window.toast("Expense approved · Vendor invoice entry created in Contractors", {
        icon: "check",
        tone: "ok",
        sub: `${exp.merchant} · ${fmtINR(exp.amount)}`,
      });
    } else {
      window.toast && window.toast("Expense approved & reimbursement queued", { icon: "check", tone: "ok" });
    }
    setApprovedExpenses(prev => { const next = { ...prev, [exp.id]: isVendorCategory }; window.persist('approved_expenses', next); return next; });
  };

  return (
    <div className="page">
      <PageHead title="Expense Management" subtitle="Reimbursements, vendor cards & corporate spend · with WhatsApp / Slack ingestion + AI fraud check">
        <button className="btn ghost"><Icon name="upload"/>Upload receipts</button>
        <button className="btn ghost"><Icon name="download"/>Export</button>
        <button className="btn primary"><Icon name="check"/>Approve selected</button>
      </PageHead>

      <div className="grid g-cols-4">
        <MiniMetric icon="coins"   label="Pending approval"   value={fmtINR(totalPending, { compact: true })} delta="4 claims" tone=""/>
        <MiniMetric icon="alert"   label="AI flags"           value={flagged} delta="1 high-risk duplicate" tone="down"/>
        <MiniMetric icon="cpu"     label="Auto-approved"      value="68%" delta="OCR + policy match" tone="up"/>
        <MiniMetric icon="report"  label="Nov spend"          value="₹6.84L" delta="−4.2% vs Oct" tone="up"/>
      </div>

      {/* Channel mix */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head">
          <div className="card-title">Ingestion channels
            <small>How employees are submitting expenses this month</small>
          </div>
          <span className="chip"><Icon name="cpu" size={10}/>OCR · 99.1% accuracy</span>
        </div>
        <div className="grid g-cols-4">
          <ChannelCard name="WhatsApp" count={84} pct={48} color="#25D366" icon="send" detail="Photo → OCR → auto-categorized"/>
          <ChannelCard name="Slack"    count={42} pct={24} color="#A78BFA" icon="sparkle" detail="/expense slash command"/>
          <ChannelCard name="Mobile app" count={28} pct={16} color="#60A5FA" icon="user" detail="iOS + Android"/>
          <ChannelCard name="Email + Web" count={21} pct={12} color="#F59E0B" icon="file" detail="Forwarded receipts"/>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 14, marginTop: 12 }}>
        {/* List */}
        <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="row between" style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
            <div className="card-title">All claims<small>{filtered.length} this month</small></div>
            <div className="tabs">
              {["all","pending","approved","flagged","reimbursed"].map(s => (
                <button key={s} data-active={statusFilter === s} onClick={() => setStatusFilter(s)} style={{ textTransform: "capitalize" }}>{s}</button>
              ))}
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Claim</th>
                <th>Employee</th>
                <th>Category</th>
                <th className="right">Amount</th>
                <th>Channel</th>
                <th>Policy</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} data-selected={e.id === selected.id} onClick={() => setSelected(e)}>
                  <td>
                    <div className="mono fs-sm">{e.id}</div>
                    <div className="muted fs-xs">{e.date}</div>
                  </td>
                  <td>
                    <div className="row-emp">
                      <Avatar name={e.emp} size={22}/>
                      <div>
                        <div style={{ fontSize: 12 }}>{e.emp}</div>
                        <div className="row-emp-meta">{e.empId}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{e.cat}</div>
                    <div className="muted fs-xs">{e.merchant}</div>
                  </td>
                  <td className="right num"><b>{fmtINR(e.amount)}</b></td>
                  <td>
                    <ChannelChip channel={e.channel}/>
                  </td>
                  <td>
                    {e.policy === "ok" ? <span className="chip ok"><Icon name="check" size={9}/>OK</span>
                      : e.policy === "duplicate" ? <span className="chip danger"><Icon name="alert" size={9}/>Duplicate</span>
                      : <span className="chip warn"><Icon name="alert" size={9}/>Over limit</span>}
                  </td>
                  <td><StatusChip status={e.status === "Flagged" ? "Rejected" : e.status === "Reimbursed" ? "Paid" : e.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">{selected.id}
              <small>{selected.cat} · {selected.merchant}</small>
            </div>
            {selected.risk > 0.5 && <span className="chip danger"><Icon name="alert" size={10}/>High risk · {(selected.risk*100).toFixed(0)}%</span>}
          </div>

          {selected.risk > 0.5 && (
            <div style={{ padding: 12, borderRadius: 10, marginBottom: 14,
              background: "linear-gradient(180deg, rgba(244,63,94,0.10), rgba(244,63,94,0.02))",
              border: "1px solid rgba(244,63,94,0.30)" }}>
              <div className="row gap-3 center" style={{ marginBottom: 6 }}>
                <Icon name="alert" size={12} color="#F43F5E"/>
                <b style={{ fontSize: 11.5, color: "#FCA5B0" }}>Atlas fraud detection</b>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-mid)", lineHeight: 1.5 }}>
                Identical amount & merchant submitted 4 days ago (EX-1827, ₹14,200, BlueSmart). Receipt timestamp delta: 26 min. Likely duplicate — hold pending review.
              </div>
            </div>
          )}

          <div className="row gap-5" style={{ padding: 12, borderRadius: 10, background: "var(--inset-2)", border: "1px solid var(--border)", marginBottom: 14 }}>
            <Avatar name={selected.emp} size={36}/>
            <div className="flex-1">
              <div style={{ fontSize: 13, fontWeight: 500 }}>{selected.emp}</div>
              <div className="muted fs-xs">{selected.empId} · Engineering</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono fw-600" style={{ fontSize: 17 }}>{fmtINR(selected.amount)}</div>
              <div className="muted fs-xs">{selected.date}</div>
            </div>
          </div>

          <div className="grid g-cols-2 gap-8">
            <Field label="Project">{selected.project}</Field>
            <Field label="Submitted via"><ChannelChip channel={selected.channel}/></Field>
            <Field label="Merchant">{selected.merchant}</Field>
            <Field label="OCR confidence" mono>{selected.auto ? "98.4%" : "Manual"}</Field>
          </div>

          {/* Receipt preview */}
          <div className="section-head"><h3>Receipt</h3><small>{selected.receipt}</small></div>
          <div style={{
            padding: 14, borderRadius: 10,
            background: "linear-gradient(180deg, #FAFAF7, #F1F1EC)",
            color: "#222",
            border: "1px solid rgba(255,255,255,0.10)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            lineHeight: 1.55,
          }}>
            <div style={{ textAlign: "center", fontWeight: 700, fontSize: 11, marginBottom: 4 }}>{selected.merchant.toUpperCase()}</div>
            <div style={{ textAlign: "center", color: "#666", fontSize: 9 }}>{selected.date}, 2025 · 14:32 IST</div>
            <div style={{ borderTop: "1px dashed #999", margin: "6px 0" }}/>
            <div className="row between"><span>Trip · MUM-T2 → Bandra</span><span>₹{(selected.amount - 1200).toLocaleString("en-IN")}</span></div>
            <div className="row between"><span>Tolls & GST</span><span>₹1,200</span></div>
            <div style={{ borderTop: "1px dashed #999", margin: "4px 0" }}/>
            <div className="row between" style={{ fontWeight: 700 }}><span>TOTAL</span><span>₹{selected.amount.toLocaleString("en-IN")}</span></div>
            <div style={{ textAlign: "center", color: "#888", fontSize: 8, marginTop: 4 }}>Pay via UPI · transactionid 8842•••0211</div>
          </div>

          {/* FEA-024: Show invoice created notice after approval */}
          {approvedExpenses[selected.id] && (
            <div style={{
              marginTop: 12, padding: "9px 12px", borderRadius: 8,
              background: "linear-gradient(180deg, rgba(34,197,94,0.10), rgba(34,197,94,0.03))",
              border: "1px solid rgba(34,197,94,0.30)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div className="row gap-3 center">
                <Icon name="check" size={11} color="#22C55E"/>
                <span style={{ fontSize: 11.5, color: "#86EFAC" }}>Invoice created in Contractors pipeline</span>
              </div>
              {onNav && (
                <button className="btn ghost sm" style={{ fontSize: 10, padding: "2px 8px" }}
                  onClick={() => onNav("contractors")}>
                  View <Icon name="arrowRight" size={9}/>
                </button>
              )}
            </div>
          )}

          <div className="row gap-3" style={{ marginTop: 14 }}>
            <button className="btn ghost sm danger" style={{ flex: 1 }}><Icon name="x" size={10}/>Reject</button>
            <button className="btn ghost sm" style={{ flex: 1 }}>Request info</button>
            <button className="btn primary sm" style={{ flex: 1.4 }}
              onClick={() => handleApprove(selected)}>
              <Icon name="check"/>Approve & reimburse
            </button>
          </div>
        </div>
      </div>

      {/* FEA-016: Policy rules with inline editing */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head">
          <div className="card-title">Active policy rules
            <small>Applied automatically before approval</small>
          </div>
          <div className="row gap-3">
            {/* FEA-024: Contractors badge in nav hint */}
            {pendingContractorCount > 0 && onNav && (
              <button className="btn ghost sm" onClick={() => onNav("contractors")}
                style={{ position: "relative" }}>
                <Icon name="file" size={11}/>Contractors
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  background: "#F43F5E", color: "#fff",
                  fontSize: 8, fontWeight: 700,
                  borderRadius: 99, padding: "1px 5px",
                  lineHeight: 1.4,
                }}>{pendingContractorCount} new</span>
              </button>
            )}
            <button className="btn ghost sm" onClick={openAddRule}><Icon name="plus"/>Add Rule</button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Rule</th>
                <th>Category</th>
                <th>Limit / Rule</th>
                <th>Scope</th>
                <th>Exceptions</th>
                <th>Notes</th>
                <th>Active</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {rulesState.map((r, idx) => {
                const isEditing = editingRuleId === r.id;
                return (
                  <tr key={r.id}>
                    <td className="mono muted">{r.id}</td>
                    <td>{r.category}</td>
                    <td className="fw-500">
                      {isEditing ? (
                        <input className="input" type="text" placeholder="e.g. 15000"
                          value={editDraft.limit}
                          onChange={e => setEditDraft(d => ({ ...d, limit: e.target.value }))}
                          style={{ width: 90, padding: "3px 7px", fontSize: 11 }}/>
                      ) : (
                        r.rule
                      )}
                    </td>
                    <td className="muted">{r.scope}</td>
                    <td className="muted fs-xs">{r.exceptions}</td>
                    <td className="muted fs-xs">
                      {isEditing ? (
                        <input className="input" type="text" placeholder="Notes..."
                          value={editDraft.notes}
                          onChange={e => setEditDraft(d => ({ ...d, notes: e.target.value }))}
                          style={{ width: 140, padding: "3px 7px", fontSize: 11 }}/>
                      ) : (
                        <span title={r.notes}>{r.notes ? (r.notes.length > 28 ? r.notes.slice(0, 28) + "…" : r.notes) : "—"}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                          <input type="checkbox"
                            checked={editDraft.active}
                            onChange={e => setEditDraft(d => ({ ...d, active: e.target.checked }))}/>
                          <span style={{ fontSize: 10 }}>{editDraft.active ? "On" : "Off"}</span>
                        </label>
                      ) : (
                        r.active
                          ? <span className="chip ok" style={{ fontSize: 9 }}><Icon name="check" size={8}/>On</span>
                          : <span className="chip" style={{ fontSize: 9 }}>Off</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="row gap-2">
                          <button className="btn primary sm" style={{ fontSize: 10, padding: "2px 8px" }}
                            onClick={() => saveEdit(r.id)}>
                            <Icon name="check" size={9}/>Save
                          </button>
                          <button className="btn ghost sm" style={{ fontSize: 10, padding: "2px 7px" }}
                            onClick={cancelEdit}>
                            <Icon name="x" size={9}/>
                          </button>
                        </div>
                      ) : (
                        <div className="row gap-2">
                          <button className="btn ghost sm" style={{ fontSize: 10, padding: "2px 7px" }}
                            title="Edit rule"
                            onClick={() => startEdit(r)}>
                            <Icon name="edit" size={11}/>
                          </button>
                          {idx >= 2 && (
                            <button className="btn ghost sm danger" style={{ fontSize: 10, padding: "2px 7px" }}
                              title="Delete rule"
                              onClick={() => deleteRule(r.id)}>
                              <Icon name="x" size={11}/>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* FEA-016: Policy last updated footer */}
        <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="clock" size={10} color="var(--text-muted)"/>
          <span className="muted fs-xs">Policy last updated: Nov 25, 2025</span>
        </div>
      </div>
    </div>
  );
};

const ChannelCard = ({ name, count, pct, color, icon, detail }) => (
  <div style={{
    padding: 12, borderRadius: 12,
    background: `linear-gradient(180deg, ${color}10, var(--inset-1))`,
    border: `1px solid ${color}33`,
  }}>
    <div className="row between center">
      <div className="row gap-3 center">
        <div style={{ width: 22, height: 22, borderRadius: 6, background: `${color}22`, color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={11}/>
        </div>
        <b style={{ fontSize: 12 }}>{name}</b>
      </div>
      <span className="mono fs-sm" style={{ color }}>{pct}%</span>
    </div>
    <div style={{ fontSize: 20, fontWeight: 600, marginTop: 6, color }}>{count}</div>
    <div className="muted fs-xs">{detail}</div>
    <div className="bar" style={{ height: 3, marginTop: 6 }}>
      <div style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}66` }}/>
    </div>
  </div>
);

const ChannelChip = ({ channel }) => {
  const map = {
    WhatsApp: { color: "#25D366", icon: "send" },
    Slack:    { color: "#A78BFA", icon: "sparkle" },
    Web:      { color: "#60A5FA", icon: "globe" },
    Email:    { color: "#F59E0B", icon: "file" },
  };
  const m = map[channel] || map.Web;
  return <span className="chip" style={{ background: `${m.color}18`, color: m.color, borderColor: `${m.color}40`, fontSize: 9.5 }}>
    <Icon name={m.icon} size={9}/>{channel}
  </span>;
};

Object.assign(window, { Expenses, ChannelChip, ChannelCard });
