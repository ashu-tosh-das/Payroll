// Bank Transfer File Generator — NEFT/RTGS disbursement file generation


const BT_MONTHS = [
  "Nov 2025", "Oct 2025", "Sep 2025", "Aug 2025",
  "Jul 2025", "Jun 2025", "May 2025", "Apr 2025",
];

const BANKS = [
  { id: "hdfc", label: "HDFC PayConnect", short: "HDFC" },
  { id: "icici", label: "ICICI CIB", short: "ICICI" },
  { id: "sbi", label: "SBI CINB", short: "SBI" },
];

const PAY_MODES = ["NEFT", "RTGS", "IMPS"];

const TRANSFER_HISTORY = [
  { date: "Oct 28, 2025", bank: "HDFC PayConnect", employees: 244, amount: 4.78, status: "Processed", file: "HDFC_NEFT_OCT2025_244emp_478Cr.txt" },
  { date: "Sep 28, 2025", bank: "HDFC PayConnect", employees: 241, amount: 4.71, status: "Processed", file: "HDFC_NEFT_SEP2025_241emp_471Cr.txt" },
  { date: "Aug 28, 2025", bank: "ICICI CIB",       employees: 238, amount: 4.64, status: "Processed", file: "ICICI_RTGS_AUG2025_238emp_464Cr.txt" },
  { date: "Jul 28, 2025", bank: "HDFC PayConnect", employees: 232, amount: 4.58, status: "Pending",   file: "HDFC_NEFT_JUL2025_232emp_458Cr.txt" },
  { date: "Jun 28, 2025", bank: "SBI CINB",        employees: 229, amount: 4.51, status: "Failed",    file: "SBI_NEFT_JUN2025_229emp_451Cr.txt" },
];

function maskAccount(emp) {
  // Use employee id digits + suffix to simulate a masked account number
  const seed = emp.id.replace(/\D/g, "") || "0001";
  const padded = seed.padStart(8, "0");
  return "XXXX XXXX " + padded.slice(-4);
}

function getIFSC(emp) {
  const bankMap = {
    "HDFC Bank": "HDFC0001234",
    "ICICI Bank": "ICIC0005678",
    "SBI": "SBIN0009012",
    "Axis Bank": "UTIB0003456",
    "Kotak": "KKBK0007890",
  };
  return bankMap[emp.bank] || "HDFC0001234";
}

function getEmpStatus(emp) {
  // Deterministic status based on employee id
  const n = parseInt(emp.id.replace(/\D/g, "")) || 0;
  if (n % 47 === 0) return "Missing IFSC";
  if (n % 83 === 0) return "Duplicate account";
  return "Ready";
}

const StatusChipLocal = ({ status }) => {
  const toneMap = {
    "Ready": "ok",
    "Missing IFSC": "danger",
    "Duplicate account": "warn",
    "Processed": "ok",
    "Pending": "warn",
    "Failed": "danger",
  };
  return <span className={`chip ${toneMap[status] || "info"}`}>{status}</span>;
};

const BankTransfer = ({ onNav, onSub }) => {
  const [period,     setPeriod]     = useState("Nov 2025");
  const [bank,       setBank]       = useState("hdfc");
  const [payMode,    setPayMode]    = useState("NEFT");
  const [generating, setGenerating] = useState(false);
  const [generated,  setGenerated]  = useState(false);
  const [showHistory,setShowHistory]= useState(false);

  // Derive value date from selected period
  const valueDate = useMemo(() => {
    const parts = period.split(" ");
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const mIdx = monthNames.indexOf(parts[0]);
    const yr   = parseInt(parts[1]);
    if (mIdx === -1 || isNaN(yr)) return "28 Nov 2025";
    return `28 ${parts[0]} ${parts[1]}`;
  }, [period]);

  // Employee rows with computed net pay
  const empRows = useMemo(() => {
    return (EMPLOYEES || []).slice(0, 20).map(e => ({
      emp: e,
      net: Math.round(e.base * 0.82),
      maskedAcc: maskAccount(e),
      ifsc: getIFSC(e),
      status: getEmpStatus(e),
    }));
  }, []);

  const allEmps = (EMPLOYEES || []);
  const totalAmount = useMemo(() => allEmps.reduce((a, e) => a + Math.round(e.base * 0.82), 0), []);
  const missingBank  = useMemo(() => allEmps.filter(e => !e.bank || e.bank === "").length, []);
  const missingIFSC  = useMemo(() => allEmps.filter((e, i) => {
    const n = parseInt(e.id.replace(/\D/g, "")) || 0;
    return n % 47 === 0;
  }).length, []);

  const selectedBankObj = BANKS.find(b => b.id === bank) || BANKS[0];

  // Filename for generated file
  const monthCode = period.replace(" ", "").toUpperCase().replace("2025", "2025");
  const empCount  = allEmps.length;
  const amtCr     = (totalAmount / 1e7).toFixed(0);
  const fileName  = `${selectedBankObj.short}_${payMode}_${monthCode}_${empCount}emp_${amtCr}Cr.txt`;

  const handleGenerate = () => {
    if (missingIFSC > 0) {
      window.openModal({
        title: "Missing IFSC codes detected",
        subtitle: `${missingIFSC} employees have missing IFSC — their transfers will be skipped.`,
        confirmText: "Generate anyway",
        onConfirm: () => startGenerate(),
      });
    } else {
      startGenerate();
    }
  };

  const startGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      window.toast("Transfer file ready", {
        icon: "download",
        tone: "ok",
        sub: `${fileName} · ${empCount} employees`,
      });
    }, 1800);
  };

  const handleDownload = (type) => {
    window.toast(`Downloading ${type} file…`, { icon: "download", tone: "info", sub: fileName });
  };

  const handleCopy = () => {
    window.toast("File path copied to clipboard", { icon: "check", tone: "ok" });
  };

  const fileSizeKB = Math.round(empCount * 0.48);

  return (
    <div className="page">
      {/* 1. Page Header */}
      <PageHead
        title="Bank Transfer"
        subtitle="Generate NEFT/RTGS transfer file for salary disbursement"
      >
        <button className="btn ghost" onClick={() => setShowHistory(v => !v)}>
          <Icon name="clock" />View History
        </button>
      </PageHead>

      {/* 2. Configuration Card */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-head">
          <div className="card-title">Transfer Configuration<small>Set period, bank, and payment details</small></div>
        </div>

        <div className="grid g-cols-2" style={{ gap: 18, padding: "4px 0 8px" }}>
          {/* Left column */}
          <div className="col gap-4">
            {/* Pay Period */}
            <div>
              <div className="fs-xs muted fw-600" style={{ marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pay Period</div>
              <select
                className="select"
                style={{ width: "100%" }}
                value={period}
                onChange={e => { setPeriod(e.target.value); setGenerated(false); }}
              >
                {BT_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Payment Mode */}
            <div>
              <div className="fs-xs muted fw-600" style={{ marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Payment Mode</div>
              <div className="row gap-3">
                {PAY_MODES.map(mode => (
                  <label
                    key={mode}
                    className="row gap-2"
                    style={{ cursor: "pointer", alignItems: "center", fontSize: 13 }}
                  >
                    <input
                      type="radio"
                      name="payMode"
                      value={mode}
                      checked={payMode === mode}
                      onChange={() => { setPayMode(mode); setGenerated(false); }}
                      style={{ accentColor: "var(--accent)", width: 14, height: 14 }}
                    />
                    <span className={`chip ${payMode === mode ? "info" : ""}`} style={{ cursor: "pointer" }}>{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Value Date */}
            <div>
              <div className="fs-xs muted fw-600" style={{ marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Value Date</div>
              <div className="input" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface2)", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
                <Icon name="calendar" size={14} />
                <span>{valueDate}</span>
                <span className="chip ok" style={{ marginLeft: "auto", fontSize: 10 }}>28th</span>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="col gap-4">
            {/* Select Bank */}
            <div>
              <div className="fs-xs muted fw-600" style={{ marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Select Bank</div>
              <div className="col gap-2">
                {BANKS.map(b => (
                  <label
                    key={b.id}
                    className="row gap-3"
                    style={{
                      cursor: "pointer",
                      alignItems: "center",
                      padding: "9px 12px",
                      borderRadius: 8,
                      border: `1.5px solid ${bank === b.id ? "var(--accent)" : "var(--border)"}`,
                      background: bank === b.id ? "var(--accent-dim, rgba(99,102,241,0.08))" : "var(--surface2)",
                      transition: "all 0.15s",
                    }}
                    onClick={() => { setBank(b.id); setGenerated(false); }}
                  >
                    <input
                      type="radio"
                      name="bank"
                      value={b.id}
                      checked={bank === b.id}
                      onChange={() => { setBank(b.id); setGenerated(false); }}
                      style={{ accentColor: "var(--accent)", width: 14, height: 14 }}
                    />
                    <Icon name="bank" size={15} />
                    <span style={{ fontSize: 13, fontWeight: bank === b.id ? 600 : 400 }}>{b.label}</span>
                    {bank === b.id && <span className="chip info" style={{ marginLeft: "auto", fontSize: 10 }}>Selected</span>}
                  </label>
                ))}
              </div>
            </div>

            {/* Debit Account */}
            <div>
              <div className="fs-xs muted fw-600" style={{ marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Debit Account</div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "var(--surface2)",
                borderRadius: 8,
                padding: "10px 14px",
                border: "1.5px solid var(--border)",
                fontSize: 13,
              }}>
                <Icon name="building" size={15} />
                <div className="col" style={{ gap: 1 }}>
                  <span className="fw-600">HDFC · XXXX4821</span>
                  <span className="muted fs-xs">Source One Technologies</span>
                </div>
                <span className="chip ok" style={{ marginLeft: "auto", fontSize: 10 }}>Pre-filled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Validation Summary Card */}
      <div className="grid g-cols-4" style={{ marginBottom: 14 }}>
        <div className="card kpi">
          <div className="kpi-label"><Icon name="employees" />Total Employees</div>
          <div className="kpi-value">{empCount}</div>
          <div className="row between"><span className="muted fs-xs">Active this period</span></div>
        </div>

        <div className="card kpi">
          <div className="kpi-label"><Icon name="alert" />Missing Bank Accounts</div>
          <div className="kpi-value" style={{ color: missingBank === 0 ? "var(--green, #10B981)" : "var(--red, #F87171)" }}>
            {missingBank}
          </div>
          <div className="row between">
            <span className={`chip ${missingBank === 0 ? "ok" : "danger"}`} style={{ fontSize: 10 }}>
              {missingBank === 0 ? "All good" : `${missingBank} missing`}
            </span>
          </div>
        </div>

        <div className="card kpi">
          <div className="kpi-label"><Icon name="coins" />Total Transfer Amount</div>
          <div className="kpi-value">
            {fmtINR(totalAmount, { compact: true })}
          </div>
          <div className="row between"><span className="muted fs-xs">{period}</span></div>
        </div>

        <div className="card kpi">
          <div className="kpi-label"><Icon name="clock" />Estimated Processing</div>
          <div className="kpi-value" style={{ fontSize: 16 }}>T+1</div>
          <div className="row between"><span className="muted fs-xs">Business day</span></div>
        </div>
      </div>

      {/* 4. Employee Transfer Table */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-head">
          <div className="card-title">
            Employee Transfer Details
            <small>Showing first 20 employees · {empCount} total</small>
          </div>
          <div className="row gap-3">
            <span className="chip ok fs-xs">{empRows.filter(r => r.status === "Ready").length} Ready</span>
            {empRows.filter(r => r.status !== "Ready").length > 0 &&
              <span className="chip warn fs-xs">{empRows.filter(r => r.status !== "Ready").length} Issues</span>
            }
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Account No</th>
              <th>IFSC</th>
              <th>Bank</th>
              <th className="right">Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {empRows.map(({ emp, net, maskedAcc, ifsc, status }) => (
              <tr key={emp.id}>
                <td>
                  <div className="row-emp">
                    <Avatar name={emp.name} />
                    <div>
                      <div className="row-emp-name">{emp.name}</div>
                      <div className="row-emp-meta">{emp.id}</div>
                    </div>
                  </div>
                </td>
                <td><span className="mono fs-xs">{maskedAcc}</span></td>
                <td><span className="mono fs-xs">{status === "Missing IFSC" ? <span className="muted">—</span> : ifsc}</span></td>
                <td><span className="fs-sm">{emp.bank || "HDFC Bank"}</span></td>
                <td className="right"><span className="num">{fmtINR(net)}</span></td>
                <td><StatusChipLocal status={status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Action Button */}
      <div className="row gap-4" style={{ marginBottom: 14, justifyContent: "center" }}>
        <button
          className="btn primary"
          style={{ fontSize: 15, padding: "12px 36px", minWidth: 240 }}
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <>
              <span className="live-dot" style={{ marginRight: 8 }} />
              Generating transfer file…
            </>
          ) : (
            <>
              <Icon name="send" />
              Generate Transfer File
            </>
          )}
        </button>
      </div>

      {/* 6. Download Banner */}
      {generated && (
        <div className="card" style={{
          marginBottom: 14,
          border: "1.5px solid var(--green, #10B981)",
          background: "rgba(16,185,129,0.05)",
        }}>
          <div className="row gap-4" style={{ alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 10,
              background: "rgba(16,185,129,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon name="check" size={20} style={{ color: "#10B981" }} />
            </div>
            <div className="col flex-1" style={{ gap: 2 }}>
              <span className="fw-600" style={{ fontSize: 14 }}>Transfer file ready for download</span>
              <span className="muted fs-xs mono">{fileName}</span>
              <span className="muted fs-xs">{fileSizeKB} KB · {empCount} employees · {fmtINR(totalAmount, { compact: true })}</span>
            </div>
            <div className="row gap-3" style={{ flexShrink: 0, flexWrap: "wrap" }}>
              <button className="btn primary sm" onClick={() => handleDownload("TXT")}>
                <Icon name="download" size={13} />Download .txt
              </button>
              <button className="btn ghost sm" onClick={() => handleDownload("XLSX")}>
                <Icon name="download" size={13} />Download .xlsx
              </button>
              <button className="btn ghost sm" onClick={handleCopy}>
                <Icon name="file" size={13} />Copy to clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Transfer History Table */}
      {showHistory && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-head">
            <div className="card-title">Transfer History<small>Past 5 disbursements</small></div>
            <button className="btn ghost sm" onClick={() => setShowHistory(false)}>
              <Icon name="x" size={13} />Close
            </button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Date</th>
                <th>Bank</th>
                <th className="right">Employees</th>
                <th className="right">Amount</th>
                <th>File</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {TRANSFER_HISTORY.map((h, i) => (
                <tr key={i}>
                  <td><span className="fs-sm">{h.date}</span></td>
                  <td>
                    <div className="row gap-2" style={{ alignItems: "center" }}>
                      <Icon name="bank" size={13} />
                      <span className="fs-sm">{h.bank}</span>
                    </div>
                  </td>
                  <td className="right"><span className="num">{h.employees}</span></td>
                  <td className="right"><span className="num">₹{h.amount.toFixed(2)} Cr</span></td>
                  <td><span className="mono fs-xs muted">{h.file}</span></td>
                  <td><StatusChipLocal status={h.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { BankTransfer });
