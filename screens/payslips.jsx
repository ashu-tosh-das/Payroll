// Payslip viewer
const Payslips = () => {
  const [selected, setSelected] = useState(EMPLOYEES[0]);
  const [period, setPeriod] = useState("Nov 2025");

  const e = selected;
  const basic = Math.round(e.base * 0.50);
  const hra   = Math.round(e.base * 0.25);
  const sa    = Math.round(e.base * 0.18);
  const lta   = Math.round(e.base * 0.04);
  const tel   = Math.round(e.base * 0.03);
  const gross = basic + hra + sa + lta + tel;
  const pf    = Math.round(basic * 0.12);
  const pt    = 200;
  const tds   = Math.round(gross * 0.10);
  const totalDed = pf + pt + tds;
  const netPay   = gross - totalDed;

  return (
    <div className="page">
      <PageHead title="Payslips" subtitle="Bulk generate, preview & e-deliver employee payslips · Nov 2025">
        <button className="btn ghost"><Icon name="filter"/>Filters</button>
        <button className="btn ghost"><Icon name="download"/>Bulk download (247)</button>
        <button className="btn primary"><Icon name="send"/>E-mail all (247)</button>
      </PageHead>

      <div className="grid g-cols-4">
        <MiniMetric icon="payslip" label="Generated" value="247" delta="100% complete" tone="up"/>
        <MiniMetric icon="send"    label="E-delivered" value="241" delta="6 bouncebacks" tone=""/>
        <MiniMetric icon="eye"     label="Opened" value="218" delta="88% open rate" tone="up"/>
        <MiniMetric icon="alert"   label="Disputes raised" value="2" delta="1 resolved" tone=""/>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "320px 1fr", gap: 14, marginTop: 14 }}>
        {/* Employee list */}
        <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 280px)" }}>
          <div style={{ padding: 12, borderBottom: "1px solid var(--border)" }}>
            <div className="search">
              <Icon name="search" size={13}/>
              <input className="input" style={{ border: 0, background: "transparent", padding: 0, height: 18, flex: 1, color: "var(--text)" }} placeholder="Search..." />
            </div>
            <div className="row between" style={{ marginTop: 8 }}>
              <select className="select" value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: "100%" }}>
                {PAYROLL_RUNS.map(r => <option key={r.period}>{r.period}</option>)}
              </select>
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {EMPLOYEES.slice(0, 18).map(emp => {
              const isSel = emp.id === selected.id;
              return (
                <div key={emp.id} onClick={() => setSelected(emp)} style={{
                  padding: "9px 12px",
                  cursor: "default",
                  borderLeft: `2px solid ${isSel ? "var(--accent)" : "transparent"}`,
                  background: isSel ? "rgba(16,185,129,0.06)" : "transparent",
                  borderBottom: "1px solid var(--inset-3)",
                }}>
                  <div className="row gap-3 center">
                    <Avatar name={emp.name} size={24}/>
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.name}</div>
                      <div className="fs-xs muted">{emp.id} · {emp.deptName}</div>
                    </div>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--text-mid)" }}>{fmtINR(emp.base, { compact: true })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payslip preview */}
        <div className="col gap-5">
          <div className="row between">
            <div className="row gap-4">
              <Avatar name={e.name} size={40}/>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{e.name}</div>
                <div className="muted fs-xs">{e.id} · {e.role} · {e.deptName}</div>
              </div>
            </div>
            <div className="row gap-3">
              <button className="btn ghost sm"><Icon name="eye"/>Preview PDF</button>
              <button className="btn ghost sm"><Icon name="download"/>Download</button>
              <button className="btn primary sm"><Icon name="send"/>E-mail</button>
            </div>
          </div>

          {/* PDF-style payslip */}
          <div style={{
            background: "linear-gradient(180deg, #FAFAF7, #F1F1EC)",
            color: "#1A1A1A",
            borderRadius: 14, padding: 32,
            border: "1px solid var(--border-strong)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.1)",
            fontFamily: "var(--font)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #10B981, #047857)" }}/>

            {/* Header */}
            <div className="row between" style={{ marginBottom: 24, paddingBottom: 14, borderBottom: "1px solid #DDD" }}>
              <div className="row gap-4">
                <div style={{ width: 38, height: 38, borderRadius: 8, background: "linear-gradient(135deg, #10B981, #047857)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>S1</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>Source One Technologies Pvt. Ltd.</div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>4th Floor, Prestige Pinnacle, Koramangala, Bengaluru 560034</div>
                  <div style={{ fontSize: 10, color: "#888", marginTop: 1 }}>CIN: U72200KA2019PTC129481 · TAN: BLRS18472E</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase" }}>Payslip</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{period}</div>
                <div style={{ fontSize: 10, color: "#666", marginTop: 1 }}>Generated Nov 24, 2025</div>
              </div>
            </div>

            {/* Employee block */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, fontSize: 11.5, marginBottom: 24 }}>
              <PsRow label="Employee" value={e.name}/>
              <PsRow label="Employee ID" value={e.id} mono/>
              <PsRow label="Designation" value={`${e.role} · ${e.level}`}/>
              <PsRow label="Department" value={e.deptName}/>
              <PsRow label="Location" value={e.locName}/>
              <PsRow label="Date of joining" value={`${e.doj} · ${e.tenure} yrs`}/>
              <PsRow label="PAN" value={e.pan} mono/>
              <PsRow label="Bank A/c" value={e.bank} mono/>
              <PsRow label="UAN" value={`1011${e.id.slice(-4)}48${e.id.slice(-3)}`} mono/>
              <PsRow label="Days worked" value={`22 / 22`} mono/>
            </div>

            {/* Earnings + deductions table */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#666", marginBottom: 8, borderBottom: "1px solid #ddd", paddingBottom: 4 }}>Earnings</div>
                <PsLine label="Basic"             amount={basic}/>
                <PsLine label="HRA"               amount={hra}/>
                <PsLine label="Special allowance" amount={sa}/>
                <PsLine label="LTA"               amount={lta}/>
                <PsLine label="Telephone"         amount={tel}/>
                <PsLine label="Total earnings" amount={gross} total/>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#666", marginBottom: 8, borderBottom: "1px solid #ddd", paddingBottom: 4 }}>Deductions</div>
                <PsLine label="Provident Fund (12% of Basic)" amount={pf}/>
                <PsLine label="Professional Tax (Karnataka)"  amount={pt}/>
                <PsLine label="TDS (Income Tax)"              amount={tds}/>
                <PsLine label="—"                              amount={0} blank/>
                <PsLine label="—"                              amount={0} blank/>
                <PsLine label="Total deductions" amount={totalDed} total/>
              </div>
            </div>

            {/* Net pay box */}
            <div style={{ marginTop: 24, padding: "14px 18px", background: "linear-gradient(180deg, #F0F9F4, #E0F2E9)", border: "1px solid #10B981", borderRadius: 8 }}>
              <div className="row between">
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#047857" }}>Net Pay for {period}</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{numberToINRWords(netPay)} only</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: "#047857", fontVariantNumeric: "tabular-nums" }}>
                  ₹{netPay.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, fontSize: 9.5, color: "#888", borderTop: "1px solid #eee", paddingTop: 12, lineHeight: 1.5 }}>
              This is a system-generated payslip and does not require a signature. For queries, raise a ticket via Source One People Portal or email payroll@sourceone.in within 7 days.
              Source One Payroll Cloud · Generated by Atlas v2.4 · Hash: 0x4f8a2…b91c
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PsRow = ({ label, value, mono }) => (
  <div style={{ display: "flex", gap: 8 }}>
    <span style={{ color: "#888", width: 110, flexShrink: 0, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
    <span className={mono ? "mono" : ""} style={{ fontWeight: 500 }}>{value}</span>
  </div>
);

const PsLine = ({ label, amount, total, blank }) => (
  <div style={{
    display: "flex", justifyContent: "space-between",
    padding: "5px 0",
    borderBottom: total ? "0" : blank ? "1px dashed transparent" : "1px dashed #eee",
    borderTop: total ? "1.5px solid #999" : "0",
    fontWeight: total ? 700 : 400,
    marginTop: total ? 6 : 0,
    color: blank ? "transparent" : "inherit",
    fontSize: 11.5,
  }}>
    <span>{label}</span>
    <span className="mono">₹{amount.toLocaleString("en-IN")}</span>
  </div>
);

// Convert number to Indian rupee words (simplified)
function numberToINRWords(n) {
  if (n === 0) return "Zero rupees";
  const lakh = Math.floor(n / 100000);
  const thou = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  const parts = [];
  if (lakh) parts.push(`${lakh} Lakh`);
  if (thou) parts.push(`${thou} Thousand`);
  if (rest) parts.push(`${rest}`);
  return `Indian Rupees ${parts.join(" ")}`;
}

window.Payslips = Payslips;
