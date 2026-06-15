// Contractors & Other Payments
const CONTRACTORS = [
  { id: "C-218", name: "Aniruddh Bose",     type: "Freelance",  service: "Frontend dev",       rate: 4500, unit: "hr", country: "IN", currency: "INR", status: "Active",      onboarded: "2024-08-12", thisMonth: 1_84_000, ytd: 18_64_000, channel: "WhatsApp" },
  { id: "C-217", name: "Priyanka Designs",  type: "Vendor",     service: "Brand design",       rate: 240000, unit: "month", country: "IN", currency: "INR", status: "Active",      onboarded: "2024-02-04", thisMonth: 2_40_000, ytd: 24_00_000, channel: "Email" },
  { id: "C-216", name: "Maya Krishnan",     type: "Freelance",  service: "Content writer",     rate: 2200, unit: "hr", country: "IN", currency: "INR", status: "Active",      onboarded: "2025-01-20", thisMonth: 88_000, ytd: 8_24_000, channel: "Slack" },
  { id: "C-215", name: "Lambda Cloud Inc.", type: "Vendor",     service: "Infrastructure",     rate: 3200, unit: "month", country: "US", currency: "USD", status: "Active",      onboarded: "2023-11-08", thisMonth: 2_68_800, ytd: 35_84_000, channel: "Email" },
  { id: "C-214", name: "Rashid Khan",       type: "Freelance",  service: "Mobile dev",         rate: 6000, unit: "hr", country: "IN", currency: "INR", status: "Pending review", onboarded: "2025-11-20", thisMonth: 2_88_000, ytd: 2_88_000, channel: "WhatsApp" },
  { id: "C-213", name: "Bright Audit LLP",  type: "Consultant", service: "Compliance audit",   rate: 1_80_000, unit: "engagement", country: "IN", currency: "INR", status: "Active",  onboarded: "2024-06-18", thisMonth: 1_80_000, ytd: 7_20_000, channel: "Email" },
  { id: "C-212", name: "Tara Wilson",       type: "Freelance",  service: "UX research",        rate: 3500, unit: "hr", country: "UK", currency: "GBP", status: "Inactive",     onboarded: "2024-04-02", thisMonth: 0, ytd: 4_20_000, channel: "Slack" },
  { id: "C-211", name: "Manish Logistics",  type: "Vendor",     service: "Office logistics",   rate: 65_000, unit: "month", country: "IN", currency: "INR", status: "Active",      onboarded: "2023-09-12", thisMonth: 65_000, ytd: 7_80_000, channel: "Email" },
];

function generateInvoices() {
  const all = [];
  CONTRACTORS.forEach(c => {
    const cId = c.id;
    all.push(
      { id: "INV-" + cId + "-001", contractorId: cId, amount: c.rate * 20, date: "Nov 15, 2025", desc: "Services - Nov 2025 (20 days)", status: "pending",  tds: Math.round(c.rate * 20 * 0.10) },
      { id: "INV-" + cId + "-002", contractorId: cId, amount: c.rate * 22, date: "Oct 15, 2025", desc: "Services - Oct 2025 (22 days)", status: "approved", tds: Math.round(c.rate * 22 * 0.10) },
      { id: "INV-" + cId + "-003", contractorId: cId, amount: c.rate * 18, date: "Sep 15, 2025", desc: "Services - Sep 2025 (18 days)", status: "paid",     tds: Math.round(c.rate * 18 * 0.10) }
    );
  });
  return all;
}

const Contractors = () => {
  const { useState, useEffect, useRef, useMemo } = React;

  const [selected, setSelected] = useState(CONTRACTORS[0]);
  const [tab, setTab] = useState("all");
  const [invoices, setInvoices] = useState(() => window.loadStore('contractor_invoices', generateInvoices()));
  const [showAddInvoice, setShowAddInvoice] = useState(false);

  const totalMonth = CONTRACTORS.reduce((a, c) => a + c.thisMonth, 0);
  const active = CONTRACTORS.filter(c => c.status === "Active").length;
  const pending = CONTRACTORS.filter(c => c.status === "Pending review").length;

  const filtered = tab === "all" ? CONTRACTORS
    : tab === "freelance" ? CONTRACTORS.filter(c => c.type === "Freelance")
    : tab === "vendor" ? CONTRACTORS.filter(c => c.type === "Vendor" || c.type === "Consultant")
    : CONTRACTORS.filter(c => c.status === "Pending review");

  // Compute pipeline KPIs from invoice state
  const pipelineStats = useMemo(() => {
    const submitted = invoices.filter(i => i.status === "pending" || i.status === "rejected" || i.status === "approved" || i.status === "paid");
    const validated  = invoices.filter(i => i.status === "approved" || i.status === "paid");
    const approved   = invoices.filter(i => i.status === "approved" || i.status === "paid");
    const tdsApplied = invoices.filter(i => i.status === "approved" || i.status === "paid");
    const paid       = invoices.filter(i => i.status === "paid");

    const sumAmt = arr => arr.reduce((s, i) => s + i.amount, 0);

    return {
      submitted:  { count: submitted.length,  amount: fmtINR(sumAmt(submitted),  { compact: true }) },
      validated:  { count: validated.length,   amount: fmtINR(sumAmt(validated),  { compact: true }) },
      approved:   { count: approved.length,    amount: fmtINR(sumAmt(approved),   { compact: true }) },
      tdsApplied: { count: tdsApplied.length,  amount: fmtINR(sumAmt(tdsApplied), { compact: true }) },
      paid:       { count: paid.length,        amount: fmtINR(sumAmt(paid),       { compact: true }) },
    };
  }, [invoices]);

  const contractorInvoices = invoices.filter(i => i.contractorId === selected.id);

  function handleApprove(inv) {
    setInvoices(prev => { const next = prev.map(i => i.id === inv.id ? { ...i, status: "approved" } : i); window.persist('contractor_invoices', next); return next; });
    window.toast("Invoice approved — TDS ₹" + inv.tds.toLocaleString() + " deducted", { icon: "check", tone: "ok" });
  }

  function handleReject(inv) {
    setInvoices(prev => { const next = prev.map(i => i.id === inv.id ? { ...i, status: "rejected" } : i); window.persist('contractor_invoices', next); return next; });
    window.toast("Invoice rejected", { icon: "x", tone: "danger" });
  }

  function handleMarkPaid(inv) {
    setInvoices(prev => { const next = prev.map(i => i.id === inv.id ? { ...i, status: "paid" } : i); window.persist('contractor_invoices', next); return next; });
    window.toast("Payment processed", { icon: "coins", tone: "ok" });
  }

  function handleAddInvoice(e) {
    e.preventDefault();
    const form = e.target;
    const dateVal   = form.invDate.value;
    const amtVal    = parseFloat(form.invAmount.value) || 0;
    const descVal   = form.invDesc.value || "Custom services";
    const attachVal = form.invAttach.value || "";
    const cId = selected.id;
    const newId = "INV-" + cId + "-" + String(Date.now()).slice(-4);
    const newInv = {
      id: newId,
      contractorId: cId,
      amount: amtVal,
      date: dateVal,
      desc: descVal + (attachVal ? " · 📎 " + attachVal : ""),
      status: "pending",
      tds: Math.round(amtVal * 0.10),
    };
    setInvoices(prev => { const next = [newInv, ...prev]; window.persist('contractor_invoices', next); return next; });
    setShowAddInvoice(false);
    window.toast("Invoice " + newId + " added", { icon: "file", tone: "info" });
  }

  return (
    <div className="page">
      <PageHead title="Contractors & Other Payments" subtitle="Freelancers, vendors and consultants · separate from employee payroll, with TDS u/s 194J/194C">
        <button className="btn ghost"><Icon name="upload"/>Upload invoices</button>
        <button className="btn ghost"><Icon name="download"/>26Q export</button>
        <button className="btn primary"><Icon name="plus"/>Add contractor</button>
      </PageHead>

      <div className="grid g-cols-4">
        <MiniMetric icon="building" label="Active contractors" value={active} delta="+2 this month" tone="up"/>
        <MiniMetric icon="coins"    label="Nov payouts"        value={fmtINR(totalMonth, { compact: true })} delta="+8.4% vs Oct" tone=""/>
        <MiniMetric icon="alert"    label="Awaiting approval"  value={pending} delta="₹2.88L pending" tone=""/>
        <MiniMetric icon="shield"   label="TDS (194C/J)"       value="₹1.84L" delta="Auto-deducted" tone=""/>
      </div>

      {/* Approval pipeline */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head">
          <div className="card-title">Invoice pipeline
            <small>{pipelineStats.submitted.count} invoices in flight · Nov cycle</small>
          </div>
          <div className="tabs">
            {[["all","All"],["freelance","Freelance"],["vendor","Vendors"],["pending","Pending"]].map(([k,l]) => (
              <button key={k} data-active={tab===k} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="grid g-cols-5" style={{ gap: 10, marginBottom: 14 }}>
          <PipeStage label="Submitted"  count={pipelineStats.submitted.count}  amount={pipelineStats.submitted.amount}  color="#60A5FA"/>
          <PipeStage label="Validated"  count={pipelineStats.validated.count}  amount={pipelineStats.validated.amount}  color="#A78BFA"/>
          <PipeStage label="Approved"   count={pipelineStats.approved.count}   amount={pipelineStats.approved.amount}   color="#F59E0B"/>
          <PipeStage label="TDS applied" count={pipelineStats.tdsApplied.count} amount={pipelineStats.tdsApplied.amount} color="#34D399"/>
          <PipeStage label="Paid"       count={pipelineStats.paid.count}       amount={pipelineStats.paid.amount}       color="#10B981" filled/>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14, marginTop: 12 }}>
        {/* List */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Contractor</th>
                <th>Type</th>
                <th>Service</th>
                <th>Rate</th>
                <th className="right">This month</th>
                <th>Channel</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} data-selected={c.id === selected.id} onClick={() => setSelected(c)}>
                  <td>
                    <div className="row-emp">
                      <Avatar name={c.name}/>
                      <div>
                        <div className="row-emp-name">{c.name}</div>
                        <div className="row-emp-meta">{c.id} · {c.country} · {c.currency}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`chip ${c.type === "Vendor" ? "info" : c.type === "Consultant" ? "violet" : ""}`}>{c.type}</span></td>
                  <td>{c.service}</td>
                  <td className="mono fs-sm">{c.currency === "INR" ? "₹" : c.currency === "USD" ? "$" : "£"}{c.rate.toLocaleString()}<span className="muted">/{c.unit}</span></td>
                  <td className="right num">{c.thisMonth > 0 ? fmtINR(c.thisMonth, { compact: true }) : <span className="muted">—</span>}</td>
                  <td>
                    <span className="chip">
                      <Icon name={c.channel === "WhatsApp" ? "send" : c.channel === "Slack" ? "sparkle" : "file"} size={9}/>
                      {c.channel}
                    </span>
                  </td>
                  <td><StatusChip status={c.status === "Pending review" ? "Pending" : c.status === "Inactive" ? "Notice" : "Active"}/></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Detail */}
        <div className="card" style={{ overflowY: "auto", maxHeight: "calc(100vh - 260px)" }}>
          <div className="card-head">
            <div className="row gap-4">
              <Avatar name={selected.name} size={36}/>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{selected.name}</div>
                <div className="muted fs-xs">{selected.id} · {selected.type} · {selected.service}</div>
              </div>
            </div>
            <button className="iconbtn"><Icon name="more"/></button>
          </div>

          <div className="grid g-cols-2 gap-8">
            <Field label="Onboarded">{selected.onboarded}</Field>
            <Field label="Country">{selected.country}</Field>
            <Field label="Rate" mono>{selected.currency === "INR" ? "₹" : selected.currency === "USD" ? "$" : "£"}{selected.rate.toLocaleString()} / {selected.unit}</Field>
            <Field label="Status"><StatusChip status={selected.status === "Pending review" ? "Pending" : selected.status === "Inactive" ? "Notice" : "Active"}/></Field>
            <Field label="YTD payout" mono>{fmtINR(selected.ytd)}</Field>
            <Field label="TDS section" mono>{selected.type === "Freelance" ? "194J · 10%" : selected.type === "Consultant" ? "194J · 10%" : "194C · 2%"}</Field>
          </div>

          {/* Invoices Section */}
          <div className="section-head" style={{ marginTop: 16 }}>
            <h3>Invoices</h3>
            <button className="btn ghost sm" onClick={() => setShowAddInvoice(v => !v)}>
              <Icon name="plus" size={11}/>Add Invoice
            </button>
          </div>

          {/* Add Invoice Form */}
          {showAddInvoice && (
            <form onSubmit={handleAddInvoice} style={{
              padding: 12, borderRadius: 10,
              background: "var(--inset-2)",
              border: "1px solid var(--border)",
              marginBottom: 10,
            }}>
              <div className="grid g-cols-2 gap-3" style={{ marginBottom: 8 }}>
                <div>
                  <div className="muted fs-xs" style={{ marginBottom: 3 }}>Invoice Date</div>
                  <input name="invDate" className="input" type="text" placeholder="e.g. Dec 15, 2025" required style={{ width: "100%", fontSize: 12 }}/>
                </div>
                <div>
                  <div className="muted fs-xs" style={{ marginBottom: 3 }}>Amount (₹)</div>
                  <input name="invAmount" className="input" type="number" min="1" placeholder="0" required style={{ width: "100%", fontSize: 12 }}/>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div className="muted fs-xs" style={{ marginBottom: 3 }}>Description</div>
                <input name="invDesc" className="input" type="text" placeholder="Services rendered..." style={{ width: "100%", fontSize: 12 }}/>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div className="muted fs-xs" style={{ marginBottom: 3 }}>Attachment name</div>
                <input name="invAttach" className="input" type="text" placeholder="invoice.pdf" style={{ width: "100%", fontSize: 12 }}/>
              </div>
              <div className="row gap-3">
                <button type="button" className="btn ghost sm" style={{ flex: 1 }} onClick={() => setShowAddInvoice(false)}>Cancel</button>
                <button type="submit" className="btn primary sm" style={{ flex: 1 }}><Icon name="plus" size={11}/>Add</button>
              </div>
            </form>
          )}

          {/* Invoice Table */}
          <div style={{ overflowX: "auto" }}>
            <table className="tbl" style={{ fontSize: 11.5 }}>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Period</th>
                  <th className="right">Amount</th>
                  <th className="right">TDS</th>
                  <th className="right">Net</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contractorInvoices.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 16 }} className="muted fs-xs">No invoices found</td></tr>
                )}
                {contractorInvoices.map(inv => {
                  const net = inv.amount - inv.tds;
                  const statusColor = inv.status === "pending" ? "warn"
                    : inv.status === "approved" ? "info"
                    : inv.status === "paid" ? "ok"
                    : "danger";
                  return (
                    <tr key={inv.id}>
                      <td className="mono fs-xs fw-600">{inv.id}</td>
                      <td style={{ maxWidth: 130, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <div style={{ fontSize: 11 }}>{inv.desc}</div>
                        <div className="muted fs-xs">{inv.date}</div>
                      </td>
                      <td className="right num">{fmtINR(inv.amount, { compact: true })}</td>
                      <td className="right num muted">−{fmtINR(inv.tds, { compact: true })}</td>
                      <td className="right num fw-600">{fmtINR(net, { compact: true })}</td>
                      <td>
                        <span className={"chip " + statusColor} style={{ fontSize: 10, textTransform: "capitalize" }}>
                          {inv.status}
                        </span>
                      </td>
                      <td>
                        {inv.status === "pending" && (
                          <div className="row gap-2">
                            <button className="btn primary sm" style={{ fontSize: 10, padding: "2px 8px" }} onClick={() => handleApprove(inv)}>
                              <Icon name="check" size={10}/>Approve
                            </button>
                            <button className="btn ghost sm" style={{ fontSize: 10, padding: "2px 8px", color: "var(--danger)" }} onClick={() => handleReject(inv)}>
                              <Icon name="x" size={10}/>Reject
                            </button>
                          </div>
                        )}
                        {inv.status === "approved" && (
                          <button className="btn ghost sm" style={{ fontSize: 10, padding: "2px 8px" }} onClick={() => handleMarkPaid(inv)}>
                            <Icon name="coins" size={10}/>Mark Paid
                          </button>
                        )}
                        {inv.status === "paid" && (
                          <a href="#" className="btn ghost sm" style={{ fontSize: 10, padding: "2px 8px", textDecoration: "none" }}
                            onClick={e => { e.preventDefault(); window.toast("Downloading receipt for " + inv.id, { icon: "download", tone: "info" }); }}>
                            <Icon name="download" size={10}/>Receipt
                          </a>
                        )}
                        {inv.status === "rejected" && (
                          <span className="muted fs-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="section-head" style={{ marginTop: 14 }}><h3>Channel preview</h3></div>
          {selected.channel === "WhatsApp" && <WhatsAppCard/>}
          {selected.channel === "Slack" && <SlackCard/>}
          {selected.channel === "Email" && <EmailCard/>}
        </div>
      </div>
    </div>
  );
};

const PipeStage = ({ label, count, amount, color, filled }) => (
  <div style={{
    padding: "10px 12px", borderRadius: 10,
    background: filled
      ? `linear-gradient(180deg, ${color}22, ${color}08)`
      : "var(--inset-2)",
    border: `1px solid ${filled ? `${color}44` : "var(--border)"}`,
    position: "relative",
  }}>
    <div className="muted fs-xs fw-600" style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
    <div className="row gap-3" style={{ alignItems: "baseline", marginTop: 4 }}>
      <div style={{ fontSize: 20, fontWeight: 600, color }}>{count}</div>
      <span className="mono muted fs-xs">{amount}</span>
    </div>
  </div>
);

const InvoiceRow = ({ label, amount, muted, bold }) => (
  <div className="row between">
    <span className={muted ? "muted" : ""}>{label}</span>
    <span className={`mono ${bold ? "fw-600" : ""}`} style={{ color: bold ? "var(--accent-bright)" : muted ? "var(--text-muted)" : "var(--text)" }}>{amount}</span>
  </div>
);

const WhatsAppCard = () => (
  <div style={{
    padding: 12, borderRadius: 12,
    background: "linear-gradient(180deg, rgba(37,211,102,0.10), var(--inset-1))",
    border: "1px solid rgba(37,211,102,0.25)",
  }}>
    <div className="row gap-3 center" style={{ marginBottom: 8 }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="send" size={11} color="#fff"/>
      </div>
      <b style={{ fontSize: 12 }}>WhatsApp Business</b>
      <span className="chip ok" style={{ marginLeft: "auto", fontSize: 9.5 }}>Verified +91 80470 18001</span>
    </div>
    <div style={{ padding: "8px 12px", borderRadius: "12px 12px 12px 4px", background: "#1F2937", fontSize: 11.5, lineHeight: 1.4, maxWidth: "85%" }}>
      Hi Source One Payroll, please find November invoice attached. <br/>
      <span className="muted">📎 INV-C-218-Nov25.pdf</span>
    </div>
    <div className="muted fs-xs" style={{ marginTop: 4, marginLeft: 4 }}>Nov 22, 17:42 · Read 17:43</div>
  </div>
);

const SlackCard = () => (
  <div style={{
    padding: 12, borderRadius: 12,
    background: "linear-gradient(180deg, rgba(167,139,250,0.10), var(--inset-1))",
    border: "1px solid rgba(167,139,250,0.25)",
  }}>
    <div className="row gap-3 center" style={{ marginBottom: 8 }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: "#4A154B", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="sparkle" size={11} color="#fff"/>
      </div>
      <b style={{ fontSize: 12 }}>Slack</b>
      <span className="chip violet" style={{ marginLeft: "auto", fontSize: 9.5 }}>#payroll-contractors</span>
    </div>
    <div style={{ fontSize: 11.5, lineHeight: 1.5 }}>
      <b>Maya K.</b> <span className="muted">17:42</span><br/>
      Submitting Nov hours · 40h × ₹2,200<br/>
      <span style={{ display: "inline-block", marginTop: 4, padding: "4px 8px", borderRadius: 6, background: "var(--inset-4)", fontSize: 10 }}>📎 timesheet-nov.csv · 4 KB</span>
    </div>
  </div>
);

const EmailCard = () => (
  <div style={{
    padding: 12, borderRadius: 12,
    background: "linear-gradient(180deg, rgba(96,165,250,0.08), var(--inset-1))",
    border: "1px solid rgba(96,165,250,0.25)",
  }}>
    <div className="row gap-3 center" style={{ marginBottom: 8 }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(96,165,250,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="file" size={11} color="#93C5FD"/>
      </div>
      <b style={{ fontSize: 12 }}>Email · ap@sourceone.in</b>
    </div>
    <div style={{ fontSize: 11.5, lineHeight: 1.5 }}>
      <div className="muted fs-xs">From: billing@vendor.com</div>
      <div className="muted fs-xs">Subject: Invoice INV-Nov25</div>
      <div style={{ marginTop: 6 }}>Auto-parsed via OCR · 1 PDF attached · ✓ vendor matched</div>
    </div>
  </div>
);

Object.assign(window, { Contractors });
