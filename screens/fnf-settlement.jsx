// Full & Final Settlement — calculate and generate F&F settlement for exiting employees


// ── Helpers ──────────────────────────────────────────────────────────────────

const tenureYears = (idx) => 1 + (idx % 8); // 1–8 years, seeded from employee index

const plBalance = (idx) => 24 - Math.floor(idx * 2.5) % 24;

const diffDays = (a, b) => {
  if (!a || !b) return 0;
  const ms = new Date(b) - new Date(a);
  return Math.max(0, Math.round(ms / 86400000));
};

const addDays = (dateStr, n) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const today = () => new Date().toISOString().slice(0, 10);

const fmtDate = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Settlement slip modal body ────────────────────────────────────────────────

const SlipBody = ({ emp, settle, resignDate, lastDay, docsChecked }) => {
  const settlementDate = addDays(today(), 30);
  return (
    <div style={{ fontFamily: "serif", fontSize: 13, lineHeight: 1.6, color: "var(--fg)" }}>
      {/* Letterhead */}
      <div style={{ textAlign: "center", borderBottom: "2px solid var(--accent)", paddingBottom: 10, marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {(window.COMPANY && window.COMPANY.name) || "Source One HR Solutions"}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
          {(window.COMPANY && window.COMPANY.address) || "Bengaluru, Karnataka"} &nbsp;|&nbsp; CIN: U74140KA2019PTC123456
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
        Full &amp; Final Settlement Statement
      </div>

      {/* Employee details */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 14, fontSize: 12 }}>
        <tbody>
          <tr>
            <td style={{ padding: "3px 0", width: "40%", color: "var(--muted)" }}>Employee Name</td>
            <td style={{ fontWeight: 600 }}>{emp.name}</td>
            <td style={{ padding: "3px 0", width: "25%", color: "var(--muted)" }}>Employee ID</td>
            <td style={{ fontWeight: 600 }}>{emp.id}</td>
          </tr>
          <tr>
            <td style={{ color: "var(--muted)" }}>Designation</td>
            <td>{emp.title || emp.designation || "—"}</td>
            <td style={{ color: "var(--muted)" }}>Department</td>
            <td>{emp.dept || "—"}</td>
          </tr>
          <tr>
            <td style={{ color: "var(--muted)" }}>Date of Joining</td>
            <td>{fmtDate(emp.doj)}</td>
            <td style={{ color: "var(--muted)" }}>Resignation Date</td>
            <td>{fmtDate(resignDate)}</td>
          </tr>
          <tr>
            <td style={{ color: "var(--muted)" }}>Last Working Day</td>
            <td>{fmtDate(lastDay)}</td>
            <td style={{ color: "var(--muted)" }}>Settlement Date</td>
            <td>{fmtDate(settlementDate)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ borderTop: "1px solid var(--border)", marginBottom: 10 }} />

      {/* Earnings */}
      <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
        Earnings
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 8 }}>
        <thead>
          <tr style={{ background: "var(--inset-1)" }}>
            <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: 600 }}>Component</th>
            <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 600 }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {settle.earnings.map((e, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "4px 6px" }}>{e.label}</td>
              <td style={{ padding: "4px 6px", textAlign: "right", fontFamily: "monospace" }}>{fmtINR(e.value)}</td>
            </tr>
          ))}
          <tr style={{ background: "var(--inset-1)", fontWeight: 700 }}>
            <td style={{ padding: "5px 6px" }}>Total Earnings</td>
            <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace" }}>{fmtINR(settle.totalEarnings)}</td>
          </tr>
        </tbody>
      </table>

      {/* Deductions */}
      <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
        Deductions
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 8 }}>
        <thead>
          <tr style={{ background: "var(--inset-1)" }}>
            <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: 600 }}>Component</th>
            <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 600 }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {settle.deductions.map((d, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "4px 6px" }}>{d.label}</td>
              <td style={{ padding: "4px 6px", textAlign: "right", fontFamily: "monospace" }}>{fmtINR(d.value)}</td>
            </tr>
          ))}
          <tr style={{ background: "var(--inset-1)", fontWeight: 700 }}>
            <td style={{ padding: "5px 6px" }}>Total Deductions</td>
            <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace" }}>{fmtINR(settle.totalDeductions)}</td>
          </tr>
        </tbody>
      </table>

      {/* Net */}
      <div style={{
        background: "linear-gradient(135deg, #05966914, #05966922)",
        border: "2px solid #059669",
        borderRadius: 8,
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>NET SETTLEMENT AMOUNT</div>
        <div style={{ fontWeight: 800, fontSize: 18, color: "#059669", fontFamily: "monospace" }}>
          {fmtINR(settle.netSettlement)}
        </div>
      </div>

      {/* Documents checklist */}
      <div style={{ fontSize: 12, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
          Exit Documents
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {["NOC", "Experience Letter", "Relieving Letter"].map(doc => (
            <span key={doc} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{
                width: 14, height: 14, borderRadius: 3, border: "1.5px solid",
                borderColor: docsChecked.has(doc) ? "#059669" : "var(--muted)",
                background: docsChecked.has(doc) ? "#059669" : "transparent",
                display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {docsChecked.has(doc) && <Icon name="check" size={9} style={{ color: "#fff" }} />}
              </span>
              {doc}
            </span>
          ))}
        </div>
      </div>

      {/* Signature area */}
      <div style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 140, borderBottom: "1px solid var(--muted)", marginBottom: 4 }} />
            <div>Employee Signature</div>
            <div>{emp.name}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 140, borderBottom: "1px solid var(--muted)", marginBottom: 4 }} />
            <div>HR Manager</div>
            <div>Authorized Signatory</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 140, borderBottom: "1px solid var(--muted)", marginBottom: 4 }} />
            <div>Finance Controller</div>
            <div>Authorized Signatory</div>
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: 10, color: "var(--muted)", marginTop: 14 }}>
          This is a computer-generated document. Settlement amount will be credited within 30 days of last working day.
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const FnfSettlement = ({ onNav, onSub }) => {
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState(null);
  const [resignDate,   setResignDate]   = useState("");
  const [lastDay,      setLastDay]      = useState("");
  const [loanRecovery, setLoanRecovery] = useState(0);
  const [bonusAmount,  setBonusAmount]  = useState(0);
  const [showSlip,     setShowSlip]     = useState(false);
  const [docsChecked,  setDocsChecked]  = useState(new Set());
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // All employees or filter to notice/resigned
  const allEmps = useMemo(() => EMPLOYEES || [], []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allEmps.filter(e =>
      !q ||
      e.name.toLowerCase().includes(q) ||
      (e.id || "").toLowerCase().includes(q)
    );
  }, [allEmps, search]);

  // Employee index in EMPLOYEES array (for seeded computations)
  const empIdx = useMemo(() =>
    selected ? allEmps.findIndex(e => e.id === selected.id) : -1,
    [selected, allEmps]
  );

  // Tenure in years
  const tenure = useMemo(() => {
    if (!selected) return 0;
    if (selected.doj) {
      const ms = Date.now() - new Date(selected.doj).getTime();
      return ms / (1000 * 60 * 60 * 24 * 365.25);
    }
    return tenureYears(empIdx < 0 ? 0 : empIdx);
  }, [selected, empIdx]);

  const tenureDisplay = useMemo(() => {
    const y = Math.floor(tenure);
    const m = Math.floor((tenure - y) * 12);
    if (y > 0 && m > 0) return `${y}y ${m}m`;
    if (y > 0) return `${y} yr${y > 1 ? "s" : ""}`;
    return `${m} month${m !== 1 ? "s" : ""}`;
  }, [tenure]);

  // Notice period served (days)
  const noticeDaysServed = useMemo(() => {
    if (!resignDate || !lastDay) return null;
    return diffDays(resignDate, lastDay);
  }, [resignDate, lastDay]);

  // Days worked in last month
  const daysWorkedLastMonth = useMemo(() => {
    if (!lastDay) return 26;
    const d = new Date(lastDay);
    return Math.min(d.getDate(), 26);
  }, [lastDay]);

  // Monthly basic = base * 0.40 (typical 40% basic of CTC)
  const monthlyBasic = useMemo(() => {
    if (!selected) return 0;
    const ctc = selected.ctc || selected.base || 0;
    return Math.round((ctc / 12) * 0.4);
  }, [selected]);

  // Pending approved reimbursements for this employee
  const pendingReimb = useMemo(() => {
    if (!selected) return 0;
    const store = window.REIMBURSEMENT_STORE || [];
    return store
      .filter(r => r.empId === selected.id && r.status === "Approved")
      .reduce((a, r) => a + (r.amount || 0), 0);
  }, [selected]);

  // Leave encashment
  const pl = useMemo(() => empIdx >= 0 ? plBalance(empIdx) : 0, [empIdx]);
  const leaveEncashment = useMemo(() =>
    Math.round(pl * monthlyBasic / 26),
    [pl, monthlyBasic]
  );

  // Gratuity (only if tenure >= 5 years)
  const gratuity = useMemo(() => {
    if (tenure < 5) return 0;
    const years = Math.floor(tenure);
    return Math.round((15 / 26) * monthlyBasic * years);
  }, [tenure, monthlyBasic]);

  // Pro-rated basic for last month
  const proRatedBasic = useMemo(() =>
    Math.round(monthlyBasic * daysWorkedLastMonth / 26),
    [monthlyBasic, daysWorkedLastMonth]
  );

  // Notice shortfall deduction (if served < 30 days)
  const noticeShortfallDays = useMemo(() => {
    if (noticeDaysServed === null) return 0;
    return Math.max(0, 30 - noticeDaysServed);
  }, [noticeDaysServed]);

  const noticeShortfallAmt = useMemo(() =>
    Math.round((monthlyBasic / 26) * noticeShortfallDays),
    [monthlyBasic, noticeShortfallDays]
  );

  // TDS on settlement (flat 10% for simplicity; professional estimate)
  const totalEarningsRaw = useMemo(() =>
    proRatedBasic + leaveEncashment + gratuity + pendingReimb + Number(bonusAmount || 0),
    [proRatedBasic, leaveEncashment, gratuity, pendingReimb, bonusAmount]
  );

  const tds = useMemo(() => Math.round(totalEarningsRaw * 0.10), [totalEarningsRaw]);

  const totalDeductionsRaw = useMemo(() =>
    noticeShortfallAmt + tds + Number(loanRecovery || 0),
    [noticeShortfallAmt, tds, loanRecovery]
  );

  const netSettlement = useMemo(() =>
    totalEarningsRaw - totalDeductionsRaw,
    [totalEarningsRaw, totalDeductionsRaw]
  );

  // Structured for slip
  const settle = useMemo(() => ({
    earnings: [
      { label: `Basic salary (pro-rated · ${daysWorkedLastMonth}/26 days)`, value: proRatedBasic },
      { label: `Leave encashment (${pl} PL days × ₹${fmtINR(monthlyBasic)} / 26)`, value: leaveEncashment },
      ...(gratuity > 0 ? [{ label: `Gratuity (15/26 × basic × ${Math.floor(tenure)} yrs)`, value: gratuity }] : []),
      ...(pendingReimb > 0 ? [{ label: "Pending approved reimbursements", value: pendingReimb }] : []),
      ...(Number(bonusAmount) > 0 ? [{ label: "Bonus (discretionary)", value: Number(bonusAmount) }] : []),
    ],
    totalEarnings: totalEarningsRaw,
    deductions: [
      ...(noticeShortfallAmt > 0 ? [{ label: `Notice shortfall (${noticeShortfallDays} days)`, value: noticeShortfallAmt }] : []),
      { label: "TDS on settlement (10%)", value: tds },
      ...(Number(loanRecovery) > 0 ? [{ label: "Loan recovery", value: Number(loanRecovery) }] : []),
    ],
    totalDeductions: totalDeductionsRaw,
    netSettlement,
  }), [proRatedBasic, pl, monthlyBasic, leaveEncashment, gratuity, pendingReimb, bonusAmount, tenure,
       totalEarningsRaw, noticeShortfallAmt, noticeShortfallDays, tds, loanRecovery, totalDeductionsRaw,
       netSettlement, daysWorkedLastMonth]);

  const toggleDoc = (doc) => {
    setDocsChecked(prev => {
      const next = new Set(prev);
      next.has(doc) ? next.delete(doc) : next.add(doc);
      return next;
    });
  };

  const handleSelectEmp = (emp) => {
    setSelected(emp);
    setSearch(emp.name);
    setShowDropdown(false);
    setDocsChecked(new Set());
    setLoanRecovery(0);
    setBonusAmount(0);
    // Pre-fill resignation date if employee has one
    if (emp.resignDate) setResignDate(emp.resignDate);
    else setResignDate("");
    setLastDay("");
  };

  const handleGenerateSlip = () => {
    if (!selected) {
      window.toast("Please select an employee first", { icon: "alert", tone: "warn" });
      return;
    }
    window.openModal({
      title: "F&F Settlement Slip",
      subtitle: `${selected.name} · ${selected.id} · Settlement date: ${fmtDate(addDays(today(), 30))}`,
      width: 680,
      confirmText: "Download PDF",
      onConfirm: () => {
        window.toast("Settlement slip exported", { icon: "download", tone: "ok", sub: `${selected.name} · ${fmtINR(netSettlement)} net settlement` });
      },
      body: (
        <SlipBody
          emp={selected}
          settle={settle}
          resignDate={resignDate}
          lastDay={lastDay}
          docsChecked={docsChecked}
        />
      ),
    });
  };

  const handleSendApproval = () => {
    if (!selected) {
      window.toast("Please select an employee first", { icon: "alert", tone: "warn" });
      return;
    }
    window.toast("Sent for approval", {
      icon: "send",
      tone: "ok",
      sub: `F&F for ${selected.name} — ${fmtINR(netSettlement)} pending HR Manager sign-off`,
    });
  };

  const handleExport = () => {
    window.toast("Exporting F&F report…", { icon: "download", tone: "info", sub: "All settlement records will be exported as CSV" });
  };

  // Status chip color helper
  const statusTone = (s) => {
    if (!s) return "info";
    const l = s.toLowerCase();
    if (l === "active") return "ok";
    if (l === "notice") return "warn";
    if (l === "inactive" || l === "resigned") return "danger";
    return "info";
  };

  const settlementDate = addDays(today(), 30);

  return (
    <div className="page">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <PageHead
        title="Full & Final Settlement"
        subtitle="Calculate settlement for exiting employees"
      >
        <button className="btn ghost" onClick={handleExport}>
          <Icon name="download" />Export
        </button>
      </PageHead>

      {/* ── KPI strip ────────────────────────────────────────────── */}
      <div className="grid g-cols-4" style={{ marginBottom: 20 }}>
        <div className="card kpi">
          <div className="kpi-label"><Icon name="employees" />On Notice</div>
          <div className="kpi-value">
            {EMPLOYEES.filter(e => (e.status || "").toLowerCase() === "notice").length}
          </div>
          <div className="row between">
            <span className="kpi-delta up"><Icon name="arrowUp" size={11} />Pending settlement</span>
          </div>
        </div>
        <div className="card kpi">
          <div className="kpi-label"><Icon name="coins" />Avg Settlement</div>
          <div className="kpi-value">₹1.4<small>L</small></div>
          <div className="row between">
            <span className="muted fs-xs">Per exiting employee</span>
          </div>
        </div>
        <div className="card kpi">
          <div className="kpi-label"><Icon name="clock" />Avg Processing</div>
          <div className="kpi-value">28<small>days</small></div>
          <div className="row between">
            <span className="kpi-delta up"><Icon name="arrowDown" size={11} />−2 vs last quarter</span>
          </div>
        </div>
        <div className="card kpi">
          <div className="kpi-label"><Icon name="check" />Settled YTD</div>
          <div className="kpi-value">14</div>
          <div className="row between">
            <span className="muted fs-xs">Full & final processed</span>
          </div>
        </div>
      </div>

      {/* ── Employee Selector Card ────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20, padding: 20 }}>
        <div className="card-head" style={{ marginBottom: 16 }}>
          <div className="card-title">
            Select Employee
            <small>Search by name or ID — shows all employees</small>
          </div>
        </div>

        <div className="grid g-cols-3" style={{ gap: 14, alignItems: "end" }}>
          {/* Employee search */}
          <div>
            <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Employee
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "relative" }}>
                <Icon name="search" size={14} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
                <input
                  ref={searchRef}
                  className="input"
                  style={{ width: "100%", paddingLeft: 30, boxSizing: "border-box" }}
                  placeholder="Search employee name or ID…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setShowDropdown(true); if (!e.target.value) setSelected(null); }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
                />
              </div>
              {showDropdown && filtered.length > 0 && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 8, boxShadow: "0 8px 24px #0004", zIndex: 99,
                  maxHeight: 240, overflowY: "auto",
                }}>
                  {filtered.slice(0, 20).map((emp, i) => {
                    const idx = allEmps.findIndex(e => e.id === emp.id);
                    const isNotice = (emp.status || "").toLowerCase() === "notice";
                    return (
                      <div
                        key={emp.id}
                        onMouseDown={() => handleSelectEmp(emp)}
                        style={{
                          padding: "9px 14px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          borderBottom: "1px solid var(--border)",
                          background: selected && selected.id === emp.id ? "var(--inset-1)" : "transparent",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--inset-1)"}
                        onMouseLeave={e => e.currentTarget.style.background = selected && selected.id === emp.id ? "var(--inset-1)" : "transparent"}
                      >
                        <Avatar name={emp.name} size={28} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="row-emp-name" style={{ fontSize: 13 }}>{emp.name}</div>
                          <div className="row-emp-meta">{emp.id} &middot; {emp.dept || "—"}</div>
                        </div>
                        {isNotice && (
                          <span className="chip warn" style={{ fontSize: 10 }}>Notice</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Resignation date */}
          <div>
            <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Resignation Date
            </div>
            <input
              type="date"
              className="input"
              style={{ width: "100%", boxSizing: "border-box" }}
              value={resignDate}
              onChange={e => setResignDate(e.target.value)}
            />
          </div>

          {/* Last working day */}
          <div>
            <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Last Working Day
            </div>
            <input
              type="date"
              className="input"
              style={{ width: "100%", boxSizing: "border-box" }}
              value={lastDay}
              onChange={e => setLastDay(e.target.value)}
            />
          </div>
        </div>

        {/* Notice period served indicator */}
        {noticeDaysServed !== null && (
          <div style={{
            marginTop: 14,
            padding: "10px 14px",
            borderRadius: 8,
            background: noticeDaysServed >= 30 ? "linear-gradient(90deg, #05966914, #05966908)" : "linear-gradient(90deg, #f5930014, #f5930008)",
            border: `1px solid ${noticeDaysServed >= 30 ? "#05966933" : "#f5930033"}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
          }}>
            <Icon name={noticeDaysServed >= 30 ? "check" : "alert"} size={15}
              style={{ color: noticeDaysServed >= 30 ? "#059669" : "#f59300", flexShrink: 0 }} />
            <span>
              Notice period served: <strong>{noticeDaysServed} days</strong>
              {noticeDaysServed >= 30
                ? " — Full notice period completed"
                : ` — Shortfall of ${30 - noticeDaysServed} days · recovery of ${fmtINR(noticeShortfallAmt)} will be deducted`}
            </span>
          </div>
        )}
      </div>

      {/* ── Main 2-column layout (shows after employee selected) ── */}
      {selected && (
        <div className="grid g-cols-2" style={{ gap: 20, alignItems: "start" }}>

          {/* ── LEFT: Settlement Calculator ─────────────────────── */}
          <div className="card" style={{ padding: 0 }}>
            <div className="card-head" style={{ padding: "16px 20px" }}>
              <div className="card-title">
                Settlement Calculator
                <small>Computed from salary, leave &amp; tenure</small>
              </div>
            </div>

            <div style={{ padding: "0 20px 20px" }}>
              {/* Earnings section */}
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                color: "var(--muted)", marginBottom: 10
              }}>
                Earnings
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Pro-rated basic */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Basic salary (pro-rated)</div>
                    <div className="muted fs-xs">{daysWorkedLastMonth} of 26 working days in last month</div>
                  </div>
                  <div className="mono fw-600" style={{ fontSize: 14 }}>{fmtINR(proRatedBasic)}</div>
                </div>

                {/* Leave encashment */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Leave encashment</div>
                    <div className="muted fs-xs">{pl} PL days × {fmtINR(monthlyBasic, { compact: true })} / 26</div>
                  </div>
                  <div className="mono fw-600" style={{ fontSize: 14 }}>{fmtINR(leaveEncashment)}</div>
                </div>

                {/* Gratuity */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      Gratuity
                      {tenure < 5 && <span className="chip info" style={{ marginLeft: 6, fontSize: 10 }}>Not eligible</span>}
                    </div>
                    <div className="muted fs-xs">
                      {tenure >= 5
                        ? `15/26 × ${fmtINR(monthlyBasic, { compact: true })} × ${Math.floor(tenure)} yrs`
                        : `Requires ≥ 5 years of service (${tenureDisplay})`}
                    </div>
                  </div>
                  <div className="mono fw-600" style={{ fontSize: 14, color: gratuity > 0 ? "var(--fg)" : "var(--muted)" }}>
                    {fmtINR(gratuity)}
                  </div>
                </div>

                {/* Pending reimbursements */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Pending reimbursements</div>
                    <div className="muted fs-xs">Approved claims from reimbursement portal</div>
                  </div>
                  <div className="mono fw-600" style={{ fontSize: 14 }}>{fmtINR(pendingReimb)}</div>
                </div>

                {/* Bonus */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Bonus (if applicable)</div>
                    <div className="muted fs-xs">Discretionary / pro-rated annual bonus</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="muted fs-xs">₹</span>
                    <input
                      type="number"
                      className="input"
                      style={{ width: 100, textAlign: "right", fontSize: 13 }}
                      value={bonusAmount}
                      min={0}
                      onChange={e => setBonusAmount(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                </div>
              </div>

              {/* Total Earnings */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "var(--inset-1)", borderRadius: 8, padding: "10px 14px",
                marginTop: 12, marginBottom: 18,
              }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Total Earnings</div>
                <div className="mono fw-600" style={{ fontSize: 15 }}>{fmtINR(totalEarningsRaw)}</div>
              </div>

              <div className="divider" style={{ marginBottom: 16 }} />

              {/* Deductions section */}
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                color: "var(--muted)", marginBottom: 10
              }}>
                Deductions
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Notice shortfall */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Notice period shortfall</div>
                    <div className="muted fs-xs">
                      {noticeDaysServed === null
                        ? "Enter resignation & last working day to compute"
                        : noticeShortfallDays > 0
                          ? `${noticeShortfallDays} days short of 30-day notice`
                          : "Full notice served — no deduction"}
                    </div>
                  </div>
                  <div className="mono fw-600" style={{ fontSize: 14, color: noticeShortfallAmt > 0 ? "#f43f5e" : "var(--muted)" }}>
                    {noticeShortfallAmt > 0 ? `– ${fmtINR(noticeShortfallAmt)}` : fmtINR(0)}
                  </div>
                </div>

                {/* TDS */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>TDS on settlement</div>
                    <div className="muted fs-xs">10% estimated withholding tax on total earnings</div>
                  </div>
                  <div className="mono fw-600" style={{ fontSize: 14, color: "#f43f5e" }}>– {fmtINR(tds)}</div>
                </div>

                {/* Loan recovery */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Loan recovery</div>
                    <div className="muted fs-xs">Outstanding company loan / advance balance</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="muted fs-xs">₹</span>
                    <input
                      type="number"
                      className="input"
                      style={{ width: 100, textAlign: "right", fontSize: 13 }}
                      value={loanRecovery}
                      min={0}
                      onChange={e => setLoanRecovery(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                </div>
              </div>

              {/* Total Deductions */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "#f43f5e0e", border: "1px solid #f43f5e22",
                borderRadius: 8, padding: "10px 14px",
                marginTop: 12, marginBottom: 18,
              }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Total Deductions</div>
                <div className="mono fw-600" style={{ fontSize: 15, color: "#f43f5e" }}>– {fmtINR(totalDeductionsRaw)}</div>
              </div>

              <div className="divider" style={{ marginBottom: 18 }} />

              {/* NET SETTLEMENT */}
              <div style={{
                background: "linear-gradient(135deg, #05966920, #05966912)",
                border: "2px solid #059669",
                borderRadius: 10,
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#059669", marginBottom: 3 }}>
                    Net Settlement
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Payable within 30 days of LWD</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 24, color: "#059669", fontFamily: "monospace" }}>
                  {fmtINR(netSettlement)}
                </div>
              </div>

              {/* Action buttons */}
              <div className="row gap-3">
                <button className="btn primary" style={{ flex: 1 }} onClick={handleGenerateSlip}>
                  <Icon name="file" />Generate Settlement Slip
                </button>
                <button className="btn ghost" onClick={handleSendApproval}>
                  <Icon name="send" />Send for Approval
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Employee Info + Timeline ─────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Employee profile card */}
            <div className="card" style={{ padding: 0 }}>
              <div className="card-head" style={{ padding: "16px 20px" }}>
                <div className="card-title">
                  Employee Details
                  <small>Profile &amp; exit timeline</small>
                </div>
              </div>

              <div style={{ padding: "0 20px 20px" }}>
                {/* Avatar + identity */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <Avatar name={selected.name} size={52} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{selected.name}</div>
                    <div className="muted fs-sm" style={{ marginTop: 2 }}>
                      {selected.title || selected.designation || "—"} &middot; {selected.dept || "—"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <StatusChip status={selected.status} />
                      <span className="chip info" style={{ fontSize: 11 }}>
                        <Icon name="clock" size={11} /> {tenureDisplay}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="muted fs-xs">Employee ID</div>
                    <div className="mono fw-600" style={{ fontSize: 13 }}>{selected.id}</div>
                  </div>
                </div>

                {/* Key dates */}
                <div style={{
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                  color: "var(--muted)", marginBottom: 10
                }}>
                  Key Dates
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[
                    { icon: "calendar", label: "Date of joining", value: fmtDate(selected.doj), accent: false },
                    { icon: "file",     label: "Resignation date", value: resignDate ? fmtDate(resignDate) : "Not entered", accent: false },
                    { icon: "clock",    label: "Last working day", value: lastDay ? fmtDate(lastDay) : "Not entered", accent: false },
                    { icon: "coins",    label: "Settlement date (est.)", value: fmtDate(settlementDate), accent: true },
                  ].map(({ icon, label, value, accent }, i, arr) => (
                    <div key={label} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: accent ? "#05966920" : "var(--inset-1)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Icon name={icon} size={14} style={{ color: accent ? "#059669" : "var(--muted)" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="muted fs-xs">{label}</div>
                        <div style={{ fontWeight: accent ? 700 : 500, fontSize: 13, color: accent ? "#059669" : "var(--fg)", marginTop: 1 }}>
                          {value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Salary summary */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                color: "var(--muted)", marginBottom: 12
              }}>
                Salary Summary
              </div>
              <div className="grid g-cols-3" style={{ gap: 10 }}>
                <div style={{ textAlign: "center" }}>
                  <div className="muted fs-xs" style={{ marginBottom: 4 }}>Annual CTC</div>
                  <div className="mono fw-600" style={{ fontSize: 13 }}>{fmtINR(selected.ctc || selected.base || 0, { compact: true })}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div className="muted fs-xs" style={{ marginBottom: 4 }}>Monthly Basic</div>
                  <div className="mono fw-600" style={{ fontSize: 13 }}>{fmtINR(monthlyBasic)}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div className="muted fs-xs" style={{ marginBottom: 4 }}>PL Balance</div>
                  <div className="mono fw-600" style={{ fontSize: 13 }}>{pl} days</div>
                </div>
              </div>
            </div>

            {/* Exit documents checklist */}
            <div className="card" style={{ padding: 0 }}>
              <div className="card-head" style={{ padding: "14px 20px" }}>
                <div className="card-title">
                  Exit Documents
                  <small>Mark documents as issued</small>
                </div>
                <span className="chip ok" style={{ fontSize: 11 }}>
                  {docsChecked.size}/3 issued
                </span>
              </div>

              <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { doc: "NOC",               icon: "shield", desc: "No objection certificate from manager" },
                  { doc: "Experience Letter",  icon: "report", desc: "Work experience & tenure confirmation" },
                  { doc: "Relieving Letter",   icon: "file",   desc: "Official date of last working day" },
                ].map(({ doc, icon, desc }, i, arr) => {
                  const checked = docsChecked.has(doc);
                  return (
                    <div
                      key={doc}
                      onClick={() => toggleDoc(doc)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 0",
                        borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                        border: `2px solid ${checked ? "#059669" : "var(--border)"}`,
                        background: checked ? "#059669" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}>
                        {checked && <Icon name="check" size={12} style={{ color: "#fff" }} />}
                      </div>
                      <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: checked ? "#05966920" : "var(--inset-1)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Icon name={icon} size={13} style={{ color: checked ? "#059669" : "var(--muted)" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 500,
                          color: checked ? "#059669" : "var(--fg)",
                          textDecoration: checked ? "line-through" : "none",
                        }}>{doc}</div>
                        <div className="muted fs-xs">{desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Empty state when no employee selected ──────────────── */}
      {!selected && (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "var(--inset-1)", display: "flex",
            alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Icon name="employees" size={24} style={{ color: "var(--muted)" }} />
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Select an employee to begin</div>
          <div className="muted fs-sm" style={{ maxWidth: 340, margin: "0 auto" }}>
            Search for an employee above, enter their resignation and last working day, and the settlement will be computed automatically.
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { FnfSettlement });
