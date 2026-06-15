// --------------------------------------------------------------
// Employee Portal · all self-service screens
// Logged-in employee: Deepak Verma · SO-1042 · Senior Engineer
// --------------------------------------------------------------

const EMP_USER = {
  id: "SO-1042", name: "Deepak Verma", role: "Senior Engineer",
  dept: "Engineering", level: "L5", loc: "Bengaluru (HQ)",
  email: "deepak.verma@sourceone.in",
  manager: "Vikram Singh", managerId: "SO-1010",
  clientName: "Infosys BPO Ltd.", clientCode: "INFY",
  base: 142000, ctc: 1_91_70_000 / 100,
  doj: "2021-03-15", tenure: "3.7",
  bank: "HDFC ••33421", pan: "ABXPS4218K",
  avatar: "DV",
};

const EMP_LEAVE_BALANCE = [
  { id: "PL",  label: "Privileged Leave",  total: 24, used: 8,   color: "#10B981" },
  { id: "CL",  label: "Casual Leave",      total: 12, used: 5,   color: "#60A5FA" },
  { id: "SL",  label: "Sick Leave",        total: 12, used: 1,   color: "#F59E0B" },
  { id: "WFH", label: "Work From Home",    total: 60, used: 22,  color: "#A78BFA" },
];

const EMP_LEAVE_HISTORY = [
  { id: "LR-2280", type: "PL",  days: 5, from: "Oct 13", to: "Oct 17", status: "Approved", reason: "Festival vacation" },
  { id: "LR-2261", type: "SL",  days: 1, from: "Sep 09", to: "Sep 09", status: "Approved", reason: "Doctor visit" },
  { id: "LR-2244", type: "WFH", days: 3, from: "Aug 26", to: "Aug 28", status: "Approved", reason: "Home maintenance" },
  { id: "LR-2219", type: "CL",  days: 2, from: "Aug 05", to: "Aug 06", status: "Approved", reason: "Personal work" },
  { id: "LR-2200", type: "PL",  days: 3, from: "Jul 14", to: "Jul 16", status: "Rejected",  reason: "Team sprint freeze" },
];

const EMP_ATTENDANCE = [
  { date: "Nov 25", day: "Tue", in_: "09:14", out: "18:42", hours: "9h 28m", status: "Present" },
  { date: "Nov 24", day: "Mon", in_: "09:02", out: "19:10", hours: "10h 8m", status: "Present" },
  { date: "Nov 23", day: "Sun", in_: "—",     out: "—",     hours: "—",       status: "Weekend" },
  { date: "Nov 22", day: "Sat", in_: "—",     out: "—",     hours: "—",       status: "Weekend" },
  { date: "Nov 21", day: "Fri", in_: "09:30", out: "18:15", hours: "8h 45m", status: "Present" },
  { date: "Nov 20", day: "Thu", in_: "09:08", out: "20:02", hours: "10h 54m",status: "Present" },
  { date: "Nov 19", day: "Wed", in_: "—",     out: "—",     hours: "—",       status: "WFH" },
  { date: "Nov 18", day: "Tue", in_: "09:25", out: "18:30", hours: "9h 5m",  status: "Present" },
  { date: "Nov 17", day: "Mon", in_: "09:18", out: "18:48", hours: "9h 30m", status: "Present" },
  { date: "Nov 14", day: "Fri", in_: "—",     out: "—",     hours: "—",       status: "Holiday" },
];

const EMP_PAYSLIPS = [
  { period: "Nov 2025", status: "Generated", gross: 142000, net: 119480, issued: "Nov 25" },
  { period: "Oct 2025", status: "Paid",      gross: 142000, net: 119480, issued: "Oct 28" },
  { period: "Sep 2025", status: "Paid",      gross: 142000, net: 119480, issued: "Sep 28" },
  { period: "Aug 2025", status: "Paid",      gross: 142000, net: 119480, issued: "Aug 28" },
  { period: "Jul 2025", status: "Paid",      gross: 142000, net: 119480, issued: "Jul 28" },
  { period: "Jun 2025", status: "Paid",      gross: 132000, net: 110280, issued: "Jun 28" },
  { period: "May 2025", status: "Paid",      gross: 132000, net: 110280, issued: "May 28" },
  { period: "Apr 2025", status: "Paid",      gross: 132000, net: 110280, issued: "Apr 28" },
];

const BIOMETRIC_DEVICES = [
  { id: "BIO-BLR-01", location: "Bengaluru HQ · Gate A", model: "ZKTeco K40-Pro", status: "Online",  lastSync: "Nov 25 · 09:14 IST", syncCount: 247, battery: null },
  { id: "BIO-BLR-02", location: "Bengaluru HQ · Cafeteria", model: "Hikvision DS-K1T604", status: "Online", lastSync: "Nov 25 · 09:02 IST", syncCount: 198, battery: null },
  { id: "BIO-MUM-01", location: "Mumbai · Main Entrance", model: "ZKTeco F22-Pro", status: "Offline", lastSync: "Nov 24 · 21:08 IST", syncCount: 41, battery: null },
  { id: "BIO-DEL-01", location: "Gurgaon · Reception", model: "eSSL EFACE702", status: "Online",  lastSync: "Nov 25 · 08:51 IST", syncCount: 28, battery: null },
];

// --------------------------------------------------------------
// EMP-002 · Employee Dashboard
// --------------------------------------------------------------
const EmployeeDashboard = ({ onNav, onSub }) => {
  const today = EMP_ATTENDANCE[0];
  const basic = Math.round(EMP_USER.base * 0.5);
  const pf    = Math.round(basic * 0.12);
  const tds   = Math.round(EMP_USER.base * 0.10);
  const net   = EMP_USER.base - pf - tds - 200;

  return (
    <div className="page">
      <PageHead
        title={`Good morning, ${EMP_USER.name.split(" ")[0]}`}
        subtitle="Deepak Verma · SO-1042 · Infosys BPO Ltd. · Nov 2025"
      >
        <button className="btn ghost" onClick={() => onNav?.("my-leave")}><Icon name="calendar"/>Apply Leave</button>
        <button className="btn primary" onClick={() => onNav?.("raise-ticket")}><Icon name="plus"/>Raise Ticket</button>
      </PageHead>

      {/* Today status */}
      <div className="grid g-cols-4">
        <div className="card kpi" style={{ background: "linear-gradient(160deg, rgba(16,185,129,0.14), rgba(16,185,129,0.04))", borderColor: "rgba(16,185,129,0.25)" }}>
          <div className="kpi-label"><Icon name="check" size={11} color="#10B981"/>Today's status</div>
          <div className="kpi-value" style={{ color: "#34D399", fontSize: 18 }}>Present</div>
          <div className="fs-xs muted">In: {today.in_} · Out: —<br/>Hours logged: {today.hours}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label"><Icon name="payslip" size={11}/>Nov net pay</div>
          <div className="kpi-value" style={{ fontSize: 20 }}>{fmtINR(net)}</div>
          <div className="fs-xs muted">Credit on <b style={{ color: "var(--text)" }}>Nov 28</b></div>
        </div>
        <div className="card kpi">
          <div className="kpi-label"><Icon name="calendar" size={11}/>Leave balance</div>
          <div className="kpi-value" style={{ fontSize: 20 }}>
            {EMP_LEAVE_BALANCE.find(l => l.id === "PL").total - EMP_LEAVE_BALANCE.find(l => l.id === "PL").used}
            <small>PL left</small>
          </div>
          <div className="kpi-delta up"><Icon name="arrowUp" size={11}/>16 PL · 7 CL · 11 SL</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label"><Icon name="fingerprint" size={11}/>Biometric</div>
          <div className="kpi-value" style={{ fontSize: 18, color: "#34D399" }}>Synced</div>
          <div className="fs-xs muted">BLR-Gate-A · 09:14 IST</div>
        </div>
      </div>

      <div className="grid g-cols-3" style={{ marginTop: 12 }}>
        {/* Attendance mini-calendar */}
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-head">
            <div className="card-title">November 2025 attendance<small>Your personal attendance log</small></div>
            <button className="btn ghost sm" onClick={() => onNav?.("my-attendance")}><Icon name="arrowRight" size={11}/>View full</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th><th>Day</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {EMP_ATTENDANCE.slice(0, 7).map((r, i) => (
                  <tr key={i}>
                    <td className="mono">{r.date}</td>
                    <td className="muted">{r.day}</td>
                    <td className="mono">{r.in_}</td>
                    <td className="mono">{r.out}</td>
                    <td className="mono muted">{r.hours}</td>
                    <td>
                      <span className={`chip ${r.status === "Present" ? "ok" : r.status === "WFH" ? "violet" : r.status === "Holiday" ? "info" : ""}`}>
                        <span className="dot"/>{r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick links + leave summary */}
        <div className="col gap-6">
          <div className="card">
            <div className="card-head"><div className="card-title">Leave balance<small>Nov 2025</small></div></div>
            <div className="col gap-5">
              {EMP_LEAVE_BALANCE.map(l => {
                const avail = l.total - l.used;
                const pct = (l.used / l.total) * 100;
                return (
                  <div key={l.id}>
                    <div className="row between" style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 12 }}>{l.label}</span>
                      <span className="mono fs-sm" style={{ color: l.color }}>{avail} left</span>
                    </div>
                    <div className="bar"><div style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${l.color}, ${l.color}80)` }}/></div>
                  </div>
                );
              })}
              <button className="btn primary sm" style={{ width: "100%" }} onClick={() => onNav?.("my-leave")}>
                <Icon name="plus"/>Apply for leave
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Quick actions</div></div>
            <div className="col gap-3">
              {[
                { icon: "payslip", label: "Download Nov payslip", nav: "my-payslips" },
                { icon: "fingerprint", label: "Biometric sync status", nav: "biometric-sync" },
                { icon: "alert", label: "Raise a support ticket", nav: "raise-ticket" },
                { icon: "calendar", label: "Holiday calendar", sub: "employee-holiday" },
              ].map(a => (
                <button key={a.label} className="btn ghost sm" style={{ justifyContent: "flex-start", width: "100%", height: 32 }}
                  onClick={() => a.sub ? onSub?.(a.sub) : onNav?.(a.nav)}>
                  <Icon name={a.icon} size={12}/>{a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------
// EMP-002 · My Attendance
// --------------------------------------------------------------
const MyAttendance = ({ onSub }) => {
  const [month, setMonth] = useState("Nov 2025");
  const presentDays = EMP_ATTENDANCE.filter(r => r.status === "Present").length;
  const wfhDays     = EMP_ATTENDANCE.filter(r => r.status === "WFH").length;
  const totalHours  = EMP_ATTENDANCE
    .filter(r => r.hours !== "—")
    .reduce((sum, r) => {
      const [h, m] = r.hours.replace("h", "").replace("m", "").split(" ").map(Number);
      return sum + h + (m || 0) / 60;
    }, 0);
  const avgHours = (totalHours / (presentDays + wfhDays || 1)).toFixed(1);

  return (
    <div className="page">
      <PageHead title="My Attendance" subtitle="Deepak Verma · SO-1042 · Nov 2025 · Bengaluru HQ">
        <select className="select" value={month} onChange={e => setMonth(e.target.value)}>
          {["Nov 2025","Oct 2025","Sep 2025","Aug 2025","Jul 2025","Jun 2025"].map(m =>
            <option key={m}>{m}</option>
          )}
        </select>
        <button className="btn ghost"><Icon name="download"/>Export</button>
        <button className="btn ghost" onClick={() => onSub?.("employee-holiday")}><Icon name="calendar"/>Holidays</button>
      </PageHead>

      <div className="grid g-cols-4">
        <MiniMetric icon="check"    label="Days present"   value={`${presentDays}/22`}  delta="89% attendance" tone="up"/>
        <MiniMetric icon="home"     label="WFH days"       value={wfhDays}              delta="2 auto-approved" tone=""/>
        <MiniMetric icon="clock"    label="Avg hours/day"  value={`${avgHours}h`}       delta="vs 8h target" tone="up"/>
        <MiniMetric icon="calendar" label="Leaves taken"   value="2"                   delta="PL: 1, SL: 1" tone=""/>
      </div>

      {/* Monthly heatmap */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head">
          <div className="card-title">November 2025<small>Daily status heatmap</small></div>
          <div className="row gap-3">
            <LegendDot color="#10B981" label="Present"/>
            <LegendDot color="#A78BFA" label="WFH"/>
            <LegendDot color="#F59E0B" label="Leave"/>
            <LegendDot color="rgba(167,139,250,0.4)" label="Holiday"/>
            <LegendDot color="var(--inset-4)" label="Weekend"/>
          </div>
        </div>
        <EmpAttendanceHeatmap attendance={EMP_ATTENDANCE}/>
      </div>

      {/* Detail table */}
      <div className="card" style={{ marginTop: 12, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
          <div className="card-title">Day-wise log<small>Biometric punches · {month}</small></div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Date</th><th>Day</th><th>Check In</th><th>Check Out</th>
              <th>Hours worked</th><th>Overtime</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {EMP_ATTENDANCE.map((r, i) => {
              const hrs = r.hours !== "—" ? parseFloat(r.hours) : 0;
              const ot = hrs > 9 ? `+${(hrs - 9).toFixed(1)}h` : "—";
              return (
                <tr key={i}>
                  <td className="mono fw-600">{r.date}</td>
                  <td className="muted">{r.day}</td>
                  <td className="mono">{r.in_}</td>
                  <td className="mono">{r.out}</td>
                  <td className="mono" style={{ color: hrs > 9 ? "#34D399" : "inherit" }}>{r.hours}</td>
                  <td className="mono" style={{ color: "#34D399", fontSize: 11 }}>{ot}</td>
                  <td>
                    <span className={`chip ${r.status === "Present" ? "ok" : r.status === "WFH" ? "violet" : r.status === "Holiday" ? "info" : r.status === "Weekend" ? "" : "warn"}`}>
                      <span className="dot"/>{r.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EmpAttendanceHeatmap = ({ attendance }) => {
  const startOffset = 5; // Nov 1 = Sat
  const days = [];
  for (let i = 0; i < 35; i++) {
    const date = i - startOffset + 1;
    if (date < 1 || date > 30) { days.push({ empty: true }); continue; }
    const dow = i % 7;
    const isWeekend = dow === 5 || dow === 6;
    const dateStr = `Nov ${date}`;
    const rec = attendance.find(a => a.date === dateStr);
    days.push({ date, isWeekend, rec });
  }
  const colorFor = (d) => {
    if (d.empty) return "transparent";
    if (!d.rec && d.isWeekend) return "var(--inset-3)";
    if (!d.rec) return "var(--inset-2)";
    if (d.rec.status === "Present") return "#10B981";
    if (d.rec.status === "WFH") return "#A78BFA";
    if (d.rec.status === "Holiday") return "rgba(167,139,250,0.4)";
    if (d.rec.status === "Weekend") return "var(--inset-3)";
    return "var(--inset-2)";
  };
  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6, padding: "0 2px" }}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
          <div key={d} className="muted fs-xs" style={{ textAlign: "center", letterSpacing: "0.05em" }}>{d}</div>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {days.map((d, i) => (
          <div key={i} style={{
            aspectRatio: "1.4 / 1", background: colorFor(d), borderRadius: 6,
            border: d.empty ? "0" : "1px solid var(--inset-4)",
            display: "flex", flexDirection: "column", padding: "5px 7px",
            boxShadow: d.rec?.status === "Present" ? "0 0 8px rgba(16,185,129,0.25)" : "none",
          }}>
            {!d.empty && <div style={{ fontSize: 11, fontWeight: 500, color: d.isWeekend ? "var(--text-muted)" : "#fff" }}>{d.date}</div>}
            {d.rec?.in_ && d.rec.in_ !== "—" && (
              <div className="mono" style={{ fontSize: 8.5, color: "rgba(255,255,255,0.65)", marginTop: "auto" }}>{d.rec.in_}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --------------------------------------------------------------
// EMP-003 · My Leave
// --------------------------------------------------------------
const MyLeave = () => {
  const [tab, setTab] = useState("balance");
  const [applyOpen, setApplyOpen] = useState(false);
  const [form, setForm] = useState({ type: "PL", from: "", to: "", reason: "" });

  const submit = () => {
    const fromDate = new Date(form.from);
    const toDate = new Date(form.to);
    const leaveDays = Math.max(1, Math.round((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1);
    const newReq = {
      id: "LR-" + Date.now(),
      emp: "Deepak Verma",
      empId: "SO-1042",
      dept: "Engineering",
      type: form.type,
      from: form.from,
      to: form.to,
      days: leaveDays,
      reason: form.reason || "Personal",
      status: "pending",
      applied: "Today",
    };
    window.LEAVE_REQUESTS = [...(window.LEAVE_REQUESTS || []), newReq];
    window.persist('LEAVE_REQUESTS', window.LEAVE_REQUESTS);
    window.toast("Leave request submitted", {
      icon: "calendar", tone: "ok",
      sub: `${form.type} request sent to Vikram Singh for approval`,
    });
    setApplyOpen(false);
    setForm({ type: "PL", from: "", to: "", reason: "" });
  };

  return (
    <div className="page">
      <PageHead title="My Leave" subtitle="Deepak Verma · Leave balance, history & requests · FY 2025-26">
        <button className="btn ghost"><Icon name="download"/>Export history</button>
        <button className="btn primary" onClick={() => setApplyOpen(true)}><Icon name="plus"/>Apply for leave</button>
      </PageHead>

      {/* Tabs */}
      <div className="tabs" style={{ width: "fit-content", marginBottom: 14 }}>
        {[["balance","Balance"],["history","History"],["pending","Pending"]].map(([k,l]) => (
          <button key={k} data-active={tab === k} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "balance" && (
        <>
          <div className="grid g-cols-4">
            {EMP_LEAVE_BALANCE.map(l => {
              const avail = l.total - l.used;
              const pct = (l.used / l.total) * 100;
              return (
                <div key={l.id} className="card" style={{ borderColor: `${l.color}40` }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: l.color, borderRadius: "10px 10px 0 0" }}/>
                  <div style={{ paddingTop: 6 }}>
                    <div className="kpi-label" style={{ color: l.color }}><Icon name="calendar" size={11}/>{l.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: l.color, margin: "8px 0 4px" }}>{avail}</div>
                    <div className="muted fs-xs">available of {l.total}</div>
                    <div className="bar" style={{ marginTop: 10 }}><div style={{ width: `${pct}%`, background: l.color }}/></div>
                    <div className="row between" style={{ marginTop: 4, fontSize: 10.5, color: "var(--text-muted)" }}>
                      <span>{l.used} taken</span><span>{pct.toFixed(0)}% used</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-head">
              <div className="card-title">Leave policy summary<small>FY 2025-26 · Source One Technologies</small></div>
            </div>
            <div className="grid g-cols-2" style={{ gap: 12 }}>
              {[
                ["Carry-forward (PL)", "Max 15 days carry-forward to next FY"],
                ["Encashment", "Up to 10 unused PL encashable at year-end"],
                ["Application window", "Apply at least 2 days in advance for PL/CL"],
                ["Sick Leave", "Can apply retrospectively within 3 days with medical cert"],
                ["WFH policy", "Max 3 consecutive WFH days; manager approval required"],
                ["Emergency leave", "Up to 3 days on email intimation within 24h"],
              ].map(([h, d]) => (
                <div key={h} style={{ padding: "8px 10px", borderRadius: 8, background: "var(--inset-2)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 2 }}>{h}</div>
                  <div className="muted fs-xs" style={{ lineHeight: 1.5 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "history" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="tbl">
            <thead>
              <tr><th>ID</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th></tr>
            </thead>
            <tbody>
              {EMP_LEAVE_HISTORY.map(r => {
                const lt = EMP_LEAVE_BALANCE.find(l => l.id === r.type);
                return (
                  <tr key={r.id}>
                    <td className="mono muted fs-sm">{r.id}</td>
                    <td><span className="chip" style={{ color: lt?.color, borderColor: `${lt?.color}40`, background: `${lt?.color}14` }}>{r.type}</span></td>
                    <td className="mono">{r.from}</td>
                    <td className="mono">{r.to}</td>
                    <td className="mono muted">{r.days}d</td>
                    <td className="muted" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reason}</td>
                    <td><StatusChip status={r.status === "Approved" ? "Approved" : r.status === "Rejected" ? "Rejected" : "Pending"}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "pending" && (
        <div className="col gap-4">
          <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.20)" }}>
            <div className="row gap-4">
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(245,158,11,0.14)", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="clock" size={16}/>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>LR-2284 · Privileged Leave · 5 days</div>
                <div className="muted fs-xs" style={{ marginTop: 2 }}>Dec 22 – Dec 26 · "Family wedding" · Awaiting Vikram Singh's approval</div>
              </div>
              <span className="chip warn" style={{ marginLeft: "auto", alignSelf: "center" }}>Pending</span>
            </div>
          </div>
          <div className="card" style={{ padding: "16px", textAlign: "center" }}>
            <div className="muted fs-sm">No other pending requests</div>
          </div>
        </div>
      )}

      {/* Apply leave modal */}
      {applyOpen && (
        <>
          <div className="drawer-mask" onClick={() => setApplyOpen(false)} style={{ position: "fixed", zIndex: 100 }}/>
          <div className="glass-strong" style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500, zIndex: 101, padding: 0,
            animation: "modalIn 280ms cubic-bezier(.4,0,.2,1)",
          }}>
            <div className="row between" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Apply for leave</div>
                <div className="muted fs-xs">Request goes to your manager Vikram Singh for approval</div>
              </div>
              <button className="iconbtn" onClick={() => setApplyOpen(false)}><Icon name="x"/></button>
            </div>
            <div style={{ padding: 18 }} className="col gap-5">
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Leave type</div>
                <div className="row gap-3" style={{ flexWrap: "wrap" }}>
                  {EMP_LEAVE_BALANCE.map(l => (
                    <button key={l.id} onClick={() => setForm(f => ({ ...f, type: l.id }))} style={{
                      padding: "6px 12px", borderRadius: 7, fontSize: 12,
                      background: form.type === l.id ? `${l.color}20` : "var(--inset-2)",
                      color: form.type === l.id ? l.color : "var(--text-mid)",
                      border: `1px solid ${form.type === l.id ? `${l.color}50` : "var(--border)"}`,
                      fontFamily: "inherit", cursor: "default",
                    }}>{l.label} ({l.total - l.used} left)</button>
                  ))}
                </div>
              </div>
              <div className="grid g-cols-2" style={{ gap: 12 }}>
                <div>
                  <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>From date</div>
                  <input type="date" className="input" style={{ width: "100%", height: 34 }}
                    value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}/>
                </div>
                <div>
                  <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>To date</div>
                  <input type="date" className="input" style={{ width: "100%", height: 34 }}
                    value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}/>
                </div>
              </div>
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Reason</div>
                <textarea className="input" style={{ width: "100%", height: 80, padding: 8, resize: "none" }}
                  placeholder="Brief reason for leave…"
                  value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}/>
              </div>
            </div>
            <div className="row between" style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.2)" }}>
              <button className="btn ghost sm" onClick={() => setApplyOpen(false)}>Cancel</button>
              <button className="btn primary sm" onClick={submit} disabled={!form.from || !form.to || !form.reason}
                style={{ opacity: form.from && form.to && form.reason ? 1 : 0.5 }}>
                <Icon name="send"/>Submit request
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --------------------------------------------------------------
// EMP-004 · Biometric Sync
// --------------------------------------------------------------
const BiometricSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(window.loadStore('biometric_last_sync', 'Nov 25, 2025 · 09:14 IST'));

  const triggerSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      const newSyncTime = "Nov 25, 2025 · " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST";
      setLastSync(newSyncTime);
      window.persist('biometric_last_sync', newSyncTime);
      window.toast("Biometric sync complete", { icon: "fingerprint", tone: "ok", sub: "4 devices · 247 records updated" });
    }, 2200);
  };

  return (
    <div className="page">
      <PageHead title="Biometric Sync" subtitle="Device connectivity, sync logs & attendance reconciliation">
        <button className="btn ghost"><Icon name="download"/>Sync report</button>
        <button className="btn primary" onClick={triggerSync} disabled={syncing} style={{ opacity: syncing ? 0.65 : 1 }}>
          <Icon name={syncing ? "sparkle" : "fingerprint"}/>{syncing ? "Syncing…" : "Sync now"}
        </button>
      </PageHead>

      {/* Your sync status */}
      <div className="card" style={{ marginBottom: 14, background: "linear-gradient(160deg, rgba(16,185,129,0.10), rgba(16,185,129,0.04))", borderColor: "rgba(16,185,129,0.25)" }}>
        <div className="row gap-5">
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #10B981, #047857)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="fingerprint" size={22} color="#fff"/>
          </div>
          <div className="flex-1">
            <div style={{ fontWeight: 600, fontSize: 14 }}>Your biometric status · {EMP_USER.name}</div>
            <div className="muted fs-xs" style={{ marginTop: 2 }}>Enrolled device: BIO-BLR-01 · Bengaluru HQ Gate A · ZKTeco K40-Pro</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="chip ok"><span className="dot"/>Enrolled & active</span>
            <div className="muted fs-xs" style={{ marginTop: 4 }}>Last punch: {lastSync}</div>
          </div>
        </div>
      </div>

      {/* Device grid */}
      <div className="grid g-cols-2">
        {BIOMETRIC_DEVICES.map(d => (
          <div key={d.id} className="card" style={{ borderColor: d.status === "Online" ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)" }}>
            <div className="row gap-4">
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: d.status === "Online" ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)",
                color: d.status === "Online" ? "#10B981" : "#F43F5E",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="fingerprint" size={18}/>
              </div>
              <div className="flex-1">
                <div className="row between">
                  <div style={{ fontWeight: 600, fontSize: 12.5 }}>{d.id}</div>
                  <span className={`chip ${d.status === "Online" ? "ok" : "danger"}`}><span className="dot"/>{d.status}</span>
                </div>
                <div className="muted fs-xs" style={{ marginTop: 2 }}>{d.location}</div>
                <div className="muted fs-xs">{d.model}</div>
                <div className="row between" style={{ marginTop: 8, fontSize: 11 }}>
                  <span className="muted">Last sync: <b style={{ color: "var(--text-mid)" }}>{d.lastSync}</b></span>
                  <span className="chip" style={{ fontSize: 9.5 }}>{d.syncCount} records</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sync log */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head">
          <div className="card-title">Sync activity log<small>Last 7 days · all devices</small></div>
          <span className={`chip ${syncing ? "warn" : "ok"}`}><span className="dot"/>{syncing ? "Sync in progress…" : "All systems normal"}</span>
        </div>
        <div className="col gap-3">
          {[
            { at: lastSync,              act: "Manual sync triggered by Deepak Verma", device: "All devices",  rows: 247, status: "ok" },
            { at: "Nov 25 · 06:00 IST", act: "Scheduled auto-sync",                   device: "BIO-BLR-01",   rows: 218, status: "ok" },
            { at: "Nov 24 · 18:00 IST", act: "End-of-day sync",                       device: "All devices",  rows: 247, status: "ok" },
            { at: "Nov 24 · 09:00 IST", act: "Morning sync",                          device: "All devices",  rows: 247, status: "ok" },
            { at: "Nov 23 · 18:00 IST", act: "BIO-MUM-01 went offline",               device: "BIO-MUM-01",   rows: 0,   status: "warn" },
          ].map((l, i) => (
            <div key={i} className="row gap-4" style={{ padding: "8px 10px", borderRadius: 8, background: "var(--inset-1)", border: "1px solid var(--border)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.status === "ok" ? "#10B981" : "#F59E0B", flexShrink: 0, marginTop: 4 }}/>
              <div className="flex-1">
                <div style={{ fontSize: 12 }}>{l.act}</div>
                <div className="muted fs-xs">{l.at} · {l.device}</div>
              </div>
              {l.rows > 0 && <span className="chip" style={{ fontSize: 9.5 }}>{l.rows} records</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------
// EMP-005 · My Payslips
// --------------------------------------------------------------
const MyPayslips = () => {
  const [selected, setSelected] = useState(EMP_PAYSLIPS[0]);
  const basic = Math.round(EMP_USER.base * 0.50);
  const hra   = Math.round(EMP_USER.base * 0.25);
  const sa    = Math.round(EMP_USER.base * 0.18);
  const lta   = Math.round(EMP_USER.base * 0.04);
  const tel   = Math.round(EMP_USER.base * 0.03);
  const gross = selected.gross;
  const pf    = Math.round(basic * 0.12);
  const pt    = 200;
  const tds   = Math.round(gross * 0.10);
  const totalDed = pf + pt + tds;
  const netPay   = selected.net;

  const download = () => window.toast(`Downloading ${selected.period} payslip—`, { icon: "download", tone: "info", sub: "PDF will be ready in a moment" });

  return (
    <div className="page">
      <PageHead title="My Payslips" subtitle={`${EMP_USER.name} · ${EMP_USER.id} · Salary slips & history`}>
        <button className="btn ghost" onClick={download}><Icon name="download"/>Download all (PDF)</button>
      </PageHead>

      <div className="grid" style={{ gridTemplateColumns: "280px 1fr", gap: 14 }}>
        {/* List */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
            <div className="card-title">Pay history</div>
          </div>
          {EMP_PAYSLIPS.map(p => {
            const isSel = p.period === selected.period;
            return (
              <div key={p.period} onClick={() => setSelected(p)} style={{
                padding: "10px 14px", cursor: "default",
                borderLeft: `2px solid ${isSel ? "var(--accent)" : "transparent"}`,
                background: isSel ? "rgba(16,185,129,0.06)" : "transparent",
                borderBottom: "1px solid var(--inset-3)",
              }}>
                <div className="row between">
                  <div style={{ fontWeight: 500, fontSize: 12.5 }}>{p.period}</div>
                  <StatusChip status={p.status === "Paid" ? "Paid" : "In Review"}/>
                </div>
                <div className="row between" style={{ marginTop: 4, fontSize: 11, color: "var(--text-muted)" }}>
                  <span>Net: <b style={{ color: "var(--text-mid)", fontFamily: "var(--font-mono)" }}>{fmtINR(p.net)}</b></span>
                  <span>Issued {p.issued}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payslip preview (light mode card) */}
        <div className="col gap-4">
          <div className="row between">
            <div style={{ fontWeight: 600, fontSize: 14 }}>{selected.period} · Payslip</div>
            <div className="row gap-3">
              <button className="btn ghost sm"><Icon name="eye"/>Preview</button>
              <button className="btn primary sm" onClick={download}><Icon name="download"/>Download PDF</button>
            </div>
          </div>

          <div style={{
            background: "linear-gradient(180deg, #FAFAF7, #F1F1EC)", color: "#1A1A1A",
            borderRadius: 14, padding: 32, border: "1px solid var(--border-strong)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)", fontFamily: "var(--font)", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #60A5FA, #A78BFA)" }}/>
            <div className="row between" style={{ marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #DDD" }}>
              <div className="row gap-4">
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #10B981, #047857)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>S1</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Source One Technologies Pvt. Ltd.</div>
                  <div style={{ fontSize: 10, color: "#666" }}>4th Floor, Prestige Pinnacle, Koramangala, Bengaluru</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>Payslip</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{selected.period}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 11.5, marginBottom: 20 }}>
              <PsRow label="Employee" value={EMP_USER.name}/>
              <PsRow label="Employee ID" value={EMP_USER.id} mono/>
              <PsRow label="Designation" value={EMP_USER.role}/>
              <PsRow label="Department" value={EMP_USER.dept}/>
              <PsRow label="PAN" value={EMP_USER.pan} mono/>
              <PsRow label="Bank A/c" value={EMP_USER.bank} mono/>
              <PsRow label="Days worked" value="22 / 22" mono/>
              <PsRow label="Client" value={EMP_USER.clientName}/>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#666", marginBottom: 6, borderBottom: "1px solid #ddd", paddingBottom: 4 }}>Earnings</div>
                {[["Basic", basic],["HRA", hra],["Special allowance", sa],["LTA", lta],["Telephone", tel]].map(([l, v]) => (
                  <PsLine key={l} label={l} amount={v}/>
                ))}
                <PsLine label="Total earnings" amount={gross} total/>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#666", marginBottom: 6, borderBottom: "1px solid #ddd", paddingBottom: 4 }}>Deductions</div>
                <PsLine label="PF (12% of Basic)" amount={pf}/>
                <PsLine label="Professional Tax" amount={pt}/>
                <PsLine label="TDS (Income Tax)" amount={tds}/>
                <PsLine label="—" amount={0} blank/>
                <PsLine label="—" amount={0} blank/>
                <PsLine label="Total deductions" amount={totalDed} total/>
              </div>
            </div>

            <div style={{ marginTop: 20, padding: "14px 18px", background: "linear-gradient(180deg, #EBF5FF, #D9EDFF)", border: "1px solid #60A5FA", borderRadius: 8 }}>
              <div className="row between">
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#1E40AF" }}>Net Pay · {selected.period}</div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{numberToINRWords(netPay)} only</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1E40AF", fontVariantNumeric: "tabular-nums" }}>₹{netPay.toLocaleString("en-IN")}</div>
              </div>
            </div>

            <div style={{ marginTop: 16, fontSize: 9, color: "#888", borderTop: "1px solid #eee", paddingTop: 10, lineHeight: 1.5 }}>
              System-generated payslip · No signature required · Queries: payroll@sourceone.in · 7-day window
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------
// EMP-006 · Raise a Ticket
// --------------------------------------------------------------
const RaiseTicket = () => {
  const [form, setForm] = useState({ category: "Payroll", subject: "", desc: "", priority: "Medium", attach: false });
  const [submitted, setSubmitted] = useState(false);
  const [tickets, setTickets] = useState([
    { id: "TKT-4220", subj: "Payslip shows incorrect HRA amount", cat: "Payroll",   status: "Open",       at: "1d ago",    priority: "Medium" },
    { id: "TKT-4209", subj: "PF contribution mismatch in Oct",    cat: "PF · ESI",  status: "Resolved",   at: "Nov 18",    priority: "Low"    },
    { id: "TKT-4198", subj: "Unable to download Form 16",         cat: "Tax docs",  status: "Resolved",   at: "Nov 10",    priority: "High"   },
  ]);

  const submit = () => {
    if (!form.subject || !form.desc) return;
    const newId = `TKT-${4221 + tickets.length}`;
    setTickets(prev => [{ id: newId, subj: form.subject, cat: form.category, status: "Open", at: "Just now", priority: form.priority }, ...prev]);
    const globalTicket = {
      id: newId,
      title: form.subject,
      cat: form.category,
      priority: form.priority.toLowerCase(),
      status: "open",
      age: "Just now",
      msgs: 1,
      emp: "Deepak Verma",
      empId: "SO-1042",
      thread: [{ role: "user", text: form.desc, at: "Just now" }],
    };
    window.TICKETS = [globalTicket, ...(window.TICKETS || [])];
    window.persist('TICKETS', window.TICKETS);
    window.toast("Ticket raised · Support team notified", { icon: "alert", tone: "ok", sub: globalTicket.id });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ category: "Payroll", subject: "", desc: "", priority: "Medium", attach: false });
  };

  const CATEGORIES = ["Payroll","Leave","Reimbursement","PF · ESI","Tax docs","Profile update","Compensation","Letters & Docs","Other"];
  const PRIORITIES  = ["Low","Medium","High","Urgent"];

  return (
    <div className="page">
      <PageHead title="Raise a Ticket" subtitle="Deepak Verma · HR & Payroll support desk · Avg response: 14 min"/>

      <div className="grid g-cols-2" style={{ gap: 14 }}>
        {/* Form */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">New support request<small>Atlas AI will pre-fill a resolution if it finds a match</small></div>
          </div>

          <div className="col gap-5">
            <div className="grid g-cols-2" style={{ gap: 12 }}>
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Category</div>
                <select className="select" style={{ width: "100%", height: 34 }} value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Priority</div>
                <div className="row gap-2" style={{ flexWrap: "wrap" }}>
                  {PRIORITIES.map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))} style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 11,
                      background: form.priority === p ? (p === "Urgent" ? "rgba(244,63,94,0.16)" : p === "High" ? "rgba(245,158,11,0.16)" : "rgba(16,185,129,0.12)") : "var(--inset-2)",
                      color: form.priority === p ? (p === "Urgent" ? "#FCA5B0" : p === "High" ? "#F59E0B" : "#34D399") : "var(--text-muted)",
                      border: `1px solid ${form.priority === p ? "rgba(255,255,255,0.15)" : "var(--border)"}`,
                      fontFamily: "inherit", cursor: "default",
                    }}>{p}</button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Subject</div>
              <input className="input" style={{ width: "100%", height: 34 }} placeholder="Brief summary of your issue…"
                value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}/>
            </div>

            <div>
              <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Description</div>
              <textarea className="input" style={{ width: "100%", height: 100, padding: 8, resize: "none" }}
                placeholder="Describe your issue in detail. Include relevant amounts, dates, or IDs—"
                value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}/>
            </div>

            <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--inset-2)", border: "1px solid var(--border)" }}>
              <div className="row gap-3 center">
                <button className="btn ghost sm"><Icon name="upload" size={11}/>Attach file</button>
                <span className="muted fs-xs">PDF, PNG, XLSX · max 10 MB</span>
              </div>
            </div>

            <button className="btn primary" onClick={submit}
              disabled={!form.subject || !form.desc} style={{ opacity: form.subject && form.desc ? 1 : 0.5, width: "100%" }}>
              <Icon name="send"/>{submitted ? "Ticket raised!" : "Submit ticket"}
            </button>
          </div>
        </div>

        {/* My tickets */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
            <div className="card-title">My tickets<small>{tickets.length} total</small></div>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>ID</th><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th></tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id}>
                  <td className="mono muted fs-sm">{t.id}</td>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{t.subj}</div>
                    <div className="muted fs-xs">{t.at}</div>
                  </td>
                  <td><span className="chip" style={{ fontSize: 9.5 }}>{t.cat}</span></td>
                  <td>
                    <span className={`chip ${t.priority === "Urgent" || t.priority === "High" ? "danger" : t.priority === "Medium" ? "warn" : ""}`} style={{ fontSize: 9.5 }}>
                      <span className="dot"/>{t.priority}
                    </span>
                  </td>
                  <td><StatusChip status={t.status === "Open" ? "Pending" : t.status === "Resolved" ? "Done" : "In Review"}/></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="card" style={{ margin: 12, background: "linear-gradient(160deg, rgba(16,185,129,0.10), rgba(167,139,250,0.06))", borderColor: "rgba(16,185,129,0.20)" }}>
            <div className="row gap-3 center" style={{ marginBottom: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg, #10B981, #34D399)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="sparkle" size={11} color="#052E1A"/>
              </div>
              <b style={{ fontSize: 12 }}>Atlas AI can help instantly</b>
            </div>
            <div className="muted fs-xs" style={{ lineHeight: 1.5 }}>
              Before raising a ticket, try asking Atlas on the chat · 71% of queries are resolved without a human agent. Common topics: payslip downloads, leave balance, PF queries, Form 16.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------
// EMP-007 · Employee Holiday Calendar (with email notification toggle)
// --------------------------------------------------------------
const EmployeeHolidayCalendar = ({ onBack }) => {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifDays, setNotifDays] = useState("3");
  const [saved, setSaved] = useState(false);

  const saveNotif = () => {
    setSaved(true);
    window.toast("Notification preferences saved", {
      icon: "bell", tone: "ok",
      sub: `You'll receive email ${notifDays} day${notifDays !== "1" ? "s" : ""} before each holiday`,
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const upcoming = HOLIDAYS_2025.filter(h => {
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const [mm, dd] = h.date.split(" ");
    const monthIdx = MONTHS.indexOf(mm);
    const day = parseInt(dd, 10);
    return monthIdx > 10 || (monthIdx === 10 && day >= 25);
  });

  return (
    <div className="page">
      <div className="row gap-3 center" style={{ marginBottom: 8 }}>
        <button className="btn ghost sm" onClick={onBack}><Icon name="chevron" size={11} style={{ transform: "rotate(180deg)" }}/>Back</button>
      </div>

      <PageHead title="Holiday Calendar 2025" subtitle="Gazetted, restricted & regional holidays · Your notification settings">
        <button className="btn ghost"><Icon name="download"/>Export ICS</button>
      </PageHead>

      {/* Email notification settings */}
      <div className="card" style={{ marginBottom: 14, background: "linear-gradient(160deg, rgba(96,165,250,0.10), rgba(96,165,250,0.04))", borderColor: "rgba(96,165,250,0.25)" }}>
        <div className="card-head">
          <div className="row gap-3 center">
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(96,165,250,0.18)", color: "#93C5FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="bell" size={14}/>
            </div>
            <div className="card-title">Email notification settings<small>Get notified before each holiday</small></div>
          </div>
          <button className="btn primary sm" onClick={saveNotif} disabled={saved}>{saved ? "Saved!" : "Save preferences"}</button>
        </div>

        <div className="row gap-8" style={{ flexWrap: "wrap" }}>
          <div className="row gap-4 center">
            <div style={{
              width: 40, height: 22, borderRadius: 99, position: "relative", cursor: "default",
              background: notifEnabled ? "#10B981" : "rgba(255,255,255,0.10)",
              border: `1px solid ${notifEnabled ? "#10B981" : "rgba(255,255,255,0.15)"}`,
              transition: "background 200ms",
            }} onClick={() => setNotifEnabled(v => !v)}>
              <div style={{
                position: "absolute", top: 2, left: notifEnabled ? 20 : 2, width: 16, height: 16,
                borderRadius: "50%", background: "#fff",
                transition: "left 200ms",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }}/>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 500 }}>
              {notifEnabled ? "Email notifications enabled" : "Email notifications disabled"}
            </span>
          </div>

          {notifEnabled && (
            <>
              <div className="row gap-3 center">
                <span className="muted fs-sm">Notify me</span>
                <select className="select" style={{ height: 28, width: 80 }} value={notifDays} onChange={e => setNotifDays(e.target.value)}>
                  <option value="1">1 day</option>
                  <option value="2">2 days</option>
                  <option value="3">3 days</option>
                  <option value="5">5 days</option>
                  <option value="7">7 days</option>
                </select>
                <span className="muted fs-sm">before each holiday</span>
              </div>
              <div className="row gap-3 center">
                <span className="muted fs-sm">Send to:</span>
                <span className="chip info"><Icon name="send" size={9}/>{EMP_USER.email}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upcoming holidays */}
      <div className="card-title" style={{ marginBottom: 10 }}>
        Upcoming holidays
        <small style={{ display: "inline-block", marginLeft: 8 }}>{upcoming.length} remaining in 2025</small>
      </div>
      <div className="grid g-cols-3" style={{ marginBottom: 18, gap: 10 }}>
        {upcoming.map(h => {
          const toneColor = h.type === "Gazetted" ? "#10B981" : h.type === "Regional" ? "#60A5FA" : "#A78BFA";
          return (
            <div key={h.date} className="card" style={{ padding: 14, borderColor: `${toneColor}40` }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: toneColor, borderRadius: "10px 10px 0 0" }}/>
              <div className="row gap-4 center" style={{ paddingTop: 6 }}>
                <div style={{ width: 52, height: 52, borderRadius: 10, background: `${toneColor}18`, border: `1px solid ${toneColor}30`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div className="muted fs-xs" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>{h.date.split(" ")[0]}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: toneColor, lineHeight: 1 }}>{h.date.split(" ")[1]}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{h.name}</div>
                  <div className="row gap-3 center" style={{ marginTop: 4 }}>
                    <span className="chip" style={{ fontSize: 9.5 }}>{h.day}</span>
                    <span className="chip" style={{ fontSize: 9.5, color: toneColor, borderColor: `${toneColor}40`, background: `${toneColor}14` }}>{h.type}</span>
                  </div>
                  <div className="muted fs-xs" style={{ marginTop: 4 }}>{h.loc}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All holidays table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
          <div className="card-title">Full year calendar<small>All 15 holidays · 2025</small></div>
        </div>
        <table className="tbl">
          <thead>
            <tr><th>Date</th><th>Day</th><th>Holiday</th><th>Type</th><th>Location</th><th>Notification</th></tr>
          </thead>
          <tbody>
            {HOLIDAYS_2025.map(h => {
              const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
              const [mm, dd] = h.date.split(" ");
              const monthIdx = MONTHS.indexOf(mm);
              const day = parseInt(dd, 10);
              const isPast = monthIdx < 10 || (monthIdx === 10 && day < 25);
              const toneColor = h.type === "Gazetted" ? "#10B981" : h.type === "Regional" ? "#60A5FA" : "#A78BFA";
              return (
                <tr key={h.date} style={{ opacity: isPast ? 0.55 : 1 }}>
                  <td className="mono fw-600">{h.date}</td>
                  <td className="muted">{h.day}</td>
                  <td style={{ fontWeight: 500 }}>{h.name}</td>
                  <td><span className="chip" style={{ fontSize: 9.5, color: toneColor, borderColor: `${toneColor}40`, background: `${toneColor}14` }}>{h.type}</span></td>
                  <td className="muted fs-sm">{h.loc}</td>
                  <td>
                    {notifEnabled && !isPast
                      ? <span className="chip ok" style={{ fontSize: 9.5 }}><Icon name="bell" size={9}/>{notifDays}d before</span>
                      : <span className="dim fs-xs">{isPast ? "Past" : "Off"}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --------------------------------------------------------------
// EMP-008 · My Reimbursements
// --------------------------------------------------------------
const REIMB_CATEGORIES = [
  "Travel", "Meals", "Accommodation", "Office Supplies",
  "Subscription", "Medical", "Internet & Phone", "Other",
];

const REIMB_POLICY = {
  Travel:            "Cab = ₹15K · Flight economy = L5 · Hotel = ₹8K/night",
  Meals:             "Self = ₹500/day · Team lunch = ₹3,000",
  Accommodation:     "Max ₹8,000 / night for Tier-1 cities",
  "Office Supplies": "Pre-approval required for >₹2,000",
  Subscription:      "Pre-approval required for all subscriptions",
  Medical:           "Up to ₹15,000 per financial year",
  "Internet & Phone":"Broadband = ₹1,500 / month",
  Other:             "Manager approval required",
};

const MyReimbursements = () => {
  const [items, setItems] = useState(
    () => (window.REIMBURSEMENT_STORE || []).filter(r => r.empId === EMP_USER.id)
  );
  const [filter,     setFilter]     = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: "Travel", description: "", amount: "", date: "", proof: null, proofError: "",
  });
  const fileRef = useRef(null);

  // -- Re-sync from store on mount to pick up admin-side status changes --
  React.useEffect(() => {
    const store = window.REIMBURSEMENT_STORE || [];
    const myClaims = store.filter(r => r.empId === "SO-1042" || r.emp === "Deepak Verma");
    if (myClaims.length > 0) {
      setItems(prev => {
        const updated = prev.map(c => {
          const stored = myClaims.find(r => r.id === c.id);
          return stored ? { ...c, status: stored.status } : c;
        });
        const newFromStore = myClaims.filter(r => !prev.find(c => c.id === r.id));
        return [...updated, ...newFromStore];
      });
    }
  }, []);

  // -- File validation ----------------------------------------
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validExts = [".pdf", ".jpg", ".jpeg", ".png"];
    const extOk     = validExts.some(x => file.name.toLowerCase().endsWith(x));
    if (!extOk) {
      setForm(f => ({ ...f, proof: null, proofError: "Invalid file type. Only PDF, JPG, PNG are accepted." }));
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setForm(f => ({
        ...f, proof: null,
        proofError: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed is 5 MB.`,
      }));
      e.target.value = "";
      return;
    }
    const sizeStr = file.size < 1024 * 1024
      ? `${Math.round(file.size / 1024)} KB`
      : `${(file.size / 1024 / 1024).toFixed(1)} MB`;
    const isImage = ["image/jpeg", "image/jpg", "image/png"].includes(file.type)
                    || file.name.match(/\.(jpg|jpeg|png)$/i);
    setForm(f => ({
      ...f, proofError: "",
      proof: { name: file.name, size: sizeStr, proofType: isImage ? "jpg" : "pdf" },
    }));
  };

  const isValid = form.category && form.description.trim().length > 5
    && parseFloat(form.amount) > 0 && form.date && form.proof;

  const submit = () => {
    if (!isValid) return;
    setSubmitting(true);
    setTimeout(() => {
      const store = window.REIMBURSEMENT_STORE || [];
      const newId = `RMB-${String(store.length + 1).padStart(3, "0")}`;
      const entry = {
        id: newId,
        empId: EMP_USER.id, emp: EMP_USER.name, empName: EMP_USER.name,
        clientName: EMP_USER.clientName, clientCode: EMP_USER.clientCode,
        category: form.category, description: form.description.trim(),
        amount: parseFloat(form.amount),
        date: form.date, submittedAt: "Just now",
        proof: form.proof.name, proofType: form.proof.proofType, proofSize: form.proof.size,
        status: "Pending", month: "Nov 2025", notes: "",
      };
      // Write to shared global store so admin sees it immediately on next render
      if (window.REIMBURSEMENT_STORE) window.REIMBURSEMENT_STORE.unshift(entry);
      window.persist('REIMBURSEMENT_STORE', window.REIMBURSEMENT_STORE);
      setItems(prev => [entry, ...prev]);
      setSubmitting(false);
      window.toast(`${newId} submitted successfully`, {
        icon: "check", tone: "ok",
        sub: `${form.category} · ${fmtINR(parseFloat(form.amount))} · Under review`,
      });
      setForm({ category: "Travel", description: "", amount: "", date: "", proof: null, proofError: "" });
      if (fileRef.current) fileRef.current.value = "";
    }, 900);
  };

  const displayItems = filter === "all" ? items : items.filter(r => r.status.toLowerCase() === filter);

  const totalClaimed  = items.reduce((a, r) => a + r.amount, 0);
  const pendingCount  = items.filter(r => r.status === "Pending").length;
  const pendingAmt    = items.filter(r => r.status === "Pending").reduce((a, r) => a + r.amount, 0);
  const approvedAmt   = items.filter(r => r.status === "Approved").reduce((a, r) => a + r.amount, 0);

  return (
    <div className="page">
      <PageHead title="My Reimbursements"
        subtitle={`${EMP_USER.name} · ${EMP_USER.clientName} · Submit and track expense claims`}>
        <button className="btn ghost"><Icon name="download"/>Download Statement</button>
      </PageHead>

      {/* KPI strip */}
      <div className="grid g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
        {[
          { icon: "coins",   label: "Total claimed",    value: fmtINR(totalClaimed, { compact: true }), sub: `${items.length} requests` },
          { icon: "clock",   label: "Pending",          value: fmtINR(pendingAmt,  { compact: true }),  sub: `${pendingCount} awaiting review` },
          { icon: "check",   label: "Approved",         value: fmtINR(approvedAmt, { compact: true }),  sub: `${items.filter(r => r.status === "Approved").length} approved`, accent: true },
          { icon: "x",       label: "Rejected",         value: items.filter(r => r.status === "Rejected").length.toString(), sub: "see admin notes" },
        ].map(k => (
          <div key={k.label} className="card kpi" style={{ padding: "12px 14px" }}>
            <div className="kpi-label"><Icon name={k.icon}/>{k.label}</div>
            <div className="kpi-value" style={{ fontSize: 22, color: k.accent ? "var(--accent-bright)" : undefined }}>
              {k.value}
            </div>
            <div className="muted fs-xs">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid g-cols-2" style={{ gap: 14 }}>
        {/* -- Submit form ---------------------------------------- */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Submit new claim
              <small>Proof document required · PDF, JPG, PNG · max 5 MB</small>
            </div>
          </div>
          <div className="col gap-5">
            <div className="grid g-cols-2" style={{ gap: 12 }}>
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                  Category *
                </div>
                <select className="select" style={{ width: "100%", height: 34 }}
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {REIMB_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                  Amount (₹) *
                </div>
                <input className="input" type="number" min="1" placeholder="0"
                  style={{ width: "100%", height: 34 }}
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}/>
              </div>
            </div>

            <div>
              <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Expense Date *
              </div>
              <input className="input" type="date" style={{ width: "100%", height: 34 }}
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}/>
            </div>

            <div>
              <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Description *
              </div>
              <textarea className="input" style={{ width: "100%", height: 80, padding: 8, resize: "none" }}
                placeholder="Business purpose, who was involved, project or client context…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}/>
            </div>

            {/* Policy reminder for selected category */}
            <div style={{
              padding: "7px 11px", borderRadius: 7,
              background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.18)",
            }}>
              <div className="row gap-3 center">
                <Icon name="shield" size={11} color="#93C5FD"/>
                <span className="fs-xs" style={{ color: "#93C5FD" }}>
                  Policy · {form.category}: {REIMB_POLICY[form.category]}
                </span>
              </div>
            </div>

            {/* Proof upload */}
            <div>
              <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Proof Document *
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }} onChange={handleFileChange}/>

              {!form.proof ? (
                <div onClick={() => fileRef.current?.click()} style={{
                  padding: "20px 16px", borderRadius: 9, cursor: "default", textAlign: "center",
                  background: "var(--inset-2)",
                  border: `1.5px dashed ${form.proofError ? "#FCA5B0" : "var(--border)"}`,
                  transition: "border-color 140ms",
                }}>
                  <Icon name="upload" size={20} color={form.proofError ? "#FCA5B0" : "var(--text-muted)"}/>
                  <div style={{ fontSize: 12, fontWeight: 500, marginTop: 7,
                    color: form.proofError ? "#FCA5B0" : "var(--text-mid)" }}>
                    Click to upload proof document
                  </div>
                  <div className="muted fs-xs" style={{ marginTop: 3 }}>PDF, JPG, PNG · max 5 MB</div>
                  {form.proofError && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "#FCA5B0", fontWeight: 500 }}>
                      <Icon name="alert" size={10}/> {form.proofError}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: "10px 14px", borderRadius: 9,
                  background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
                }}>
                  <div className="row between center">
                    <div className="row gap-4 center">
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: form.proof.proofType === "pdf"
                          ? "rgba(244,63,94,0.14)" : "rgba(96,165,250,0.14)",
                        color: form.proof.proofType === "pdf" ? "#FCA5B0" : "#93C5FD",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 800,
                      }}>
                        {form.proof.proofType === "pdf" ? "PDF" : "IMG"}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{form.proof.name}</div>
                        <div className="muted fs-xs">{form.proof.size} — Validated ✓</div>
                      </div>
                    </div>
                    <button className="iconbtn" style={{ width: 24, height: 24 }}
                      onClick={() => { setForm(f => ({ ...f, proof: null, proofError: "" })); if (fileRef.current) fileRef.current.value = ""; }}>
                      <Icon name="x" size={12}/>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="btn primary"
              onClick={submit}
              disabled={!isValid || submitting}
              style={{ opacity: isValid && !submitting ? 1 : 0.5, width: "100%" }}>
              <Icon name={submitting ? "sparkle" : "send"}/>
              {submitting ? "Submitting…" : "Submit Claim"}
            </button>
          </div>
        </div>

        {/* -- My requests ---------------------------------------- */}
        <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
            <div className="row between center">
              <div className="card-title">My requests<small>{items.length} total</small></div>
              <div className="tabs">
                {["all","pending","approved","rejected","flagged"].map(s => (
                  <button key={s} data-active={filter === s} onClick={() => setFilter(s)}
                    style={{ textTransform: "capitalize" }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ overflowX: "auto", flex: 1 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th className="right">Amount</th>
                  <th>Proof</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "28px 0", color: "var(--text-muted)" }}>
                      No {filter !== "all" ? filter : ""} requests
                    </td>
                  </tr>
                ) : displayItems.map(r => (
                  <tr key={r.id}>
                    <td className="mono muted fs-sm">{r.id}</td>
                    <td><span className="chip" style={{ fontSize: 9.5 }}>{r.category}</span></td>
                    <td>
                      <div style={{ fontSize: 11.5, fontWeight: 500 }}>{r.description}</div>
                      <div className="muted fs-xs">{r.submittedAt} · {r.date}</div>
                    </td>
                    <td className="right num">{fmtINR(r.amount)}</td>
                    <td>
                      <div className="row gap-2 center">
                        <div style={{
                          padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 800,
                          background: r.proofType === "pdf" ? "rgba(244,63,94,0.12)" : "rgba(96,165,250,0.12)",
                          color: r.proofType === "pdf" ? "#FCA5B0" : "#93C5FD",
                        }}>
                          {r.proofType === "pdf" ? "PDF" : "IMG"}
                        </div>
                        <span className="muted fs-xs" style={{ whiteSpace: "nowrap" }}>{r.proofSize}</span>
                      </div>
                    </td>
                    <td>
                      <StatusChip status={
                        r.status === "Approved" ? "Approved" :
                        r.status === "Rejected" ? "Rejected" :
                        r.status === "Flagged"  ? "Rejected" : "Pending"
                      }/>
                      {r.notes && (
                        <div className="muted fs-xs" style={{ marginTop: 2, maxWidth: 150, lineHeight: 1.3 }}>
                          {r.notes}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------
// EMP-009 · IT Declaration
// --------------------------------------------------------------
const ITDeclaration = ({ onNav, onBack }) => {
  const { useState } = React;
  const [form, setForm] = useState({
    hra: 0, rentPaid: 0, landlordPan: "",
    epf: 18000, ppf: 0, elss: 0, lic: 0, homeLoanPrincipal: 0,
    selfHealth: 0, parentsHealth: 0,
    eduLoan: 0, savingsInt: 0, nps: 0,
    bonus: 0
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const total80C = form.epf + form.ppf + form.elss + form.lic + form.homeLoanPrincipal;
  const capped80C = Math.min(total80C, 150000);
  const total80D = Math.min(form.selfHealth, 25000) + Math.min(form.parentsHealth, 25000);
  const hraExemption = Math.min(form.hra, form.rentPaid * 0.9);
  const otherDed = Math.min(form.savingsInt, 10000) + form.eduLoan + form.nps;
  const totalDed = capped80C + total80D + hraExemption + otherDed;
  const grossIncome = 960000;
  const taxableIncome = Math.max(0, grossIncome - totalDed);
  const annualTax = taxableIncome > 750000 ? Math.round((taxableIncome - 750000) * 0.20) : 0;
  const newTDS = Math.round(annualTax / 12);
  const baseTDS = 8400;
  const saving = Math.max(0, baseTDS - newTDS);

  const upd = (field) => (e) => setForm(f => ({ ...f, [field]: Number(e.target.value) || 0 }));

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      window.toast(`Declaration submitted · TDS revised to ₹${newTDS.toLocaleString()}/month`, { icon: "shield", tone: "ok", sub: `Saving ₹${saving.toLocaleString()}/month` });
      const declaration = {
        id: "ITD-" + Date.now(),
        empId: "SO-1042",
        empName: "Deepak Verma",
        fy: "2025-26",
        submittedAt: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        status: "pending_approval",
        total80C: capped80C,
        totalHRA: hraExemption,
        total80D: total80D,
        otherDed: otherDed,
        revisedTDS: newTDS,
        baseTDS: baseTDS,
        saving: saving,
      };
      window.IT_DECLARATIONS = [declaration, ...(window.IT_DECLARATIONS || [])];
      window.persist('IT_DECLARATIONS', window.IT_DECLARATIONS);
    }, 1000);
  };

  return (
    <div className="page">
      <PageHead title="IT Declaration" subtitle="Declare investments for TDS computation · FY 2025-26">
        {submitted && <span className="chip ok">Submitted</span>}
      </PageHead>

      {/* TDS Impact card */}
      <div className="grid g-cols-3" style={{ marginBottom: 20 }}>
        <div className="card kpi">
          <div className="kpi-label"><Icon name="coins"/>Current TDS</div>
          <div className="kpi-value">₹{baseTDS.toLocaleString()}<small>/mo</small></div>
        </div>
        <div className="card kpi">
          <div className="kpi-label"><Icon name="shield"/>After Declaration</div>
          <div className="kpi-value" style={{ color: "#34D399" }}>₹{newTDS.toLocaleString()}<small>/mo</small></div>
        </div>
        <div className="card kpi">
          <div className="kpi-label"><Icon name="arrowDown"/>Potential Saving</div>
          <div className="kpi-value" style={{ color: "#34D399" }}>₹{saving.toLocaleString()}<small>/mo</small></div>
          <div className="muted fs-xs" style={{ marginTop: 4 }}>₹{(saving * 12).toLocaleString()} annually</div>
        </div>
      </div>

      <div className="grid g-cols-2" style={{ alignItems: "start" }}>
        <div className="col gap-4">
          {/* Section A - HRA */}
          <div className="card">
            <div className="card-head"><div className="card-title">Section A · House Rent Allowance (80GG)</div></div>
            <div className="col gap-3">
              <div className="row between" style={{ gap: 12 }}>
                <label className="fs-sm" style={{ flex: 1 }}>HRA received (₹/month)</label>
                <input className="input" style={{ width: 140 }} type="number" value={form.hra || ""} onChange={upd("hra")} placeholder="0"/>
              </div>
              <div className="row between" style={{ gap: 12 }}>
                <label className="fs-sm" style={{ flex: 1 }}>Actual rent paid (₹/month)</label>
                <input className="input" style={{ width: 140 }} type="number" value={form.rentPaid || ""} onChange={upd("rentPaid")} placeholder="0"/>
              </div>
              <div className="row between" style={{ gap: 12 }}>
                <label className="fs-sm" style={{ flex: 1 }}>Landlord PAN</label>
                <input className="input" style={{ width: 140 }} type="text" value={form.landlordPan} onChange={e => setForm(f => ({ ...f, landlordPan: e.target.value }))} placeholder="ABCDE1234F"/>
              </div>
              {hraExemption > 0 && <div className="chip ok fs-xs">HRA exemption: ₹{hraExemption.toLocaleString()}/yr</div>}
            </div>
          </div>

          {/* Section B - 80C */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Section B · 80C Investments<small>Limit: ₹1,50,000</small></div>
              <span className={`chip ${total80C >= 150000 ? "ok" : "info"} fs-xs`}>{Math.round((Math.min(total80C, 150000) / 150000) * 100)}% used</span>
            </div>
            <div className="col gap-3">
              {[
                ["EPF (auto)", "epf", true],
                ["PPF", "ppf", false],
                ["ELSS / Mutual Funds", "elss", false],
                ["LIC Premium", "lic", false],
                ["Home Loan (Principal)", "homeLoanPrincipal", false],
              ].map(([label, key, locked]) => (
                <div key={key} className="row between" style={{ gap: 12 }}>
                  <label className="fs-sm" style={{ flex: 1 }}>{label} {locked && <span className="chip info" style={{ fontSize: 9 }}>auto</span>}</label>
                  <input className="input" style={{ width: 140 }} type="number" value={form[key] || ""} onChange={upd(key)} disabled={locked} placeholder="0"/>
                </div>
              ))}
              <div style={{ marginTop: 4 }}>
                <div className="row between fs-xs muted" style={{ marginBottom: 4 }}>
                  <span>Total 80C: ₹{total80C.toLocaleString()}</span>
                  <span>Cap: ₹1,50,000</span>
                </div>
                <div className="bar" style={{ height: 6 }}>
                  <div style={{ width: `${Math.min(100, (total80C / 150000) * 100)}%`, background: total80C >= 150000 ? "#34D399" : "#60A5FA", borderRadius: 4 }}/>
                </div>
              </div>
            </div>
          </div>

          {/* Section C - 80D */}
          <div className="card">
            <div className="card-head"><div className="card-title">Section C · Health Insurance (80D)</div></div>
            <div className="col gap-3">
              <div className="row between" style={{ gap: 12 }}>
                <label className="fs-sm" style={{ flex: 1 }}>Self & family premium (limit ₹25,000)</label>
                <input className="input" style={{ width: 140 }} type="number" value={form.selfHealth || ""} onChange={upd("selfHealth")} placeholder="0"/>
              </div>
              <div className="row between" style={{ gap: 12 }}>
                <label className="fs-sm" style={{ flex: 1 }}>Parents premium (additional ₹25,000)</label>
                <input className="input" style={{ width: 140 }} type="number" value={form.parentsHealth || ""} onChange={upd("parentsHealth")} placeholder="0"/>
              </div>
            </div>
          </div>

          {/* Section D */}
          <div className="card">
            <div className="card-head"><div className="card-title">Section D · Other Deductions</div></div>
            <div className="col gap-3">
              {[
                ["80E · Education loan interest", "eduLoan"],
                ["80TTA · Savings interest (limit ₹10,000)", "savingsInt"],
                ["NPS contribution (80CCD)", "nps"],
              ].map(([label, key]) => (
                <div key={key} className="row between" style={{ gap: 12 }}>
                  <label className="fs-sm" style={{ flex: 1 }}>{label}</label>
                  <input className="input" style={{ width: 140 }} type="number" value={form[key] || ""} onChange={upd(key)} placeholder="0"/>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right · Summary */}
        <div className="col gap-4">
          <div className="card">
            <div className="card-head"><div className="card-title">TDS Computation Summary</div></div>
            <div className="col gap-3">
              {[
                ["Gross Income", grossIncome, false],
                ["Less: 80C", -capped80C, true],
                ["Less: 80D", -total80D, true],
                ["Less: HRA", -hraExemption, true],
                ["Less: Other", -otherDed, true],
              ].map(([label, val, isDed]) => (
                <div key={label} className="row between fs-sm">
                  <span className={isDed ? "muted" : ""}>{label}</span>
                  <span className={isDed ? "mono" : "mono fw-600"} style={{ color: isDed && val < 0 ? "#EF4444" : "var(--text)" }}>
                    {val < 0 ? `-₹${Math.abs(val).toLocaleString()}` : `₹${val.toLocaleString()}`}
                  </span>
                </div>
              ))}
              <div className="divider"/>
              <div className="row between fs-sm fw-600">
                <span>Taxable Income</span>
                <span className="mono">₹{taxableIncome.toLocaleString()}</span>
              </div>
              <div className="row between fs-sm">
                <span className="muted">Annual Tax</span>
                <span className="mono">₹{annualTax.toLocaleString()}</span>
              </div>
              <div className="row between" style={{ marginTop: 4, padding: "10px 12px", borderRadius: 8, background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <span className="fw-600">TDS per month</span>
                <span className="mono fw-600" style={{ color: "#34D399", fontSize: 18 }}>₹{newTDS.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Proof Uploads</div></div>
            <div className="col gap-3">
              {["80C Investments", "Rent receipts", "Health insurance", "Other"].map(doc => (
                <div key={doc} className="row between fs-sm" style={{ padding: "8px 10px", borderRadius: 6, background: "var(--inset-2)", border: "1px solid var(--border)" }}>
                  <span><Icon name="file" size={12}/> {doc}</span>
                  <button className="btn ghost sm" onClick={() => window.toast(`Upload ${doc} documents`, { icon: "upload", tone: "info" })}>
                    <Icon name="upload" size={11}/>Upload
                  </button>
                </div>
              ))}
            </div>
          </div>

          {!submitted ? (
            <button className="btn primary" style={{ width: "100%" }} disabled={submitting} onClick={handleSubmit}>
              <Icon name="check"/>{submitting ? "Submitting…" : "Submit Declaration"}
            </button>
          ) : (
            <div className="chip ok" style={{ width: "100%", justifyContent: "center", padding: "12px 0", borderRadius: 8, fontSize: 13 }}>
              <Icon name="check" size={14}/> Declaration submitted successfully
            </div>
          )}

          {submitted && (window.IT_DECLARATIONS || []).length > 0 && (
            <div className="card">
              <div className="card-head"><div className="card-title">Submission History<small>FY 2025-26</small></div></div>
              <div className="col gap-3">
                {(window.IT_DECLARATIONS || []).map(d => (
                  <div key={d.id} style={{ padding: "10px 12px", borderRadius: 8, background: "var(--inset-2)", border: "1px solid var(--border)" }}>
                    <div className="row between" style={{ marginBottom: 6 }}>
                      <div>
                        <div className="row gap-3 center">
                          <span className="mono fs-xs muted">{d.id}</span>
                          <span className="fs-xs muted">{d.submittedAt}</span>
                        </div>
                      </div>
                      <span className={`chip ${d.status === "approved" ? "ok" : "warn"}`} style={{ fontSize: 9.5 }}>
                        <span className="dot"/>{d.status === "approved" ? "Approved" : "Pending approval"}
                      </span>
                    </div>
                    <div className="row gap-4 fs-xs" style={{ flexWrap: "wrap" }}>
                      <span className="muted">Revised TDS: <b style={{ color: "#34D399", fontFamily: "var(--font-mono)" }}>₹{d.revisedTDS.toLocaleString()}/mo</b></span>
                      <span className="muted">Saving: <b style={{ color: "#34D399", fontFamily: "var(--font-mono)" }}>₹{d.saving.toLocaleString()}/mo</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------
// EMP-010 · Salary Calculator
// --------------------------------------------------------------
const SalaryCalculator = ({ onNav, onBack }) => {
  const { useState } = React;
  const [ctcInput, setCtcInput] = useState("");
  const ctc = Number(ctcInput.replace(/,/g, "")) || 0;
  const PRESETS = [1000000, 1500000, 2000000, 3000000, 5000000];

  const basic = Math.round(ctc * 0.40 / 12);
  const hra = Math.round(basic * 0.50);
  const lta = Math.round(20000 / 12);
  const special = Math.round(ctc / 12) - basic - hra - lta;
  const grossMonthly = basic + hra + lta + special;

  const epf = Math.round(basic * 0.12);
  const pt = 200;
  const taxableAnnual = Math.max(0, ctc - 150000 - 50000);
  const annualTax = taxableAnnual > 750000 ? Math.round((taxableAnnual - 750000) * 0.20) : 0;
  const tds = Math.round(annualTax / 12);
  const totalDed = epf + pt + tds;
  const netMonthly = grossMonthly - totalDed;

  const currentGross = (EMP_PAYSLIPS && EMP_PAYSLIPS[0]) ? EMP_PAYSLIPS[0].gross : 142000;
  const currentNet = (EMP_PAYSLIPS && EMP_PAYSLIPS[0]) ? EMP_PAYSLIPS[0].net : 118000;

  return (
    <div className="page">
      <PageHead title="Salary Calculator" subtitle="Understand your take-home for any CTC"/>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head"><div className="card-title">Enter CTC (Annual)</div></div>
        <div className="row gap-4" style={{ alignItems: "center", flexWrap: "wrap" }}>
          <div className="row gap-2" style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14 }}>₹</span>
            <input className="input" style={{ paddingLeft: 28, fontSize: 18, height: 48, width: "100%" }} type="text"
              value={ctcInput} onChange={e => setCtcInput(e.target.value)} placeholder="e.g. 2000000"/>
          </div>
          <div className="row gap-2" style={{ flexWrap: "wrap" }}>
            {PRESETS.map(p => (
              <button key={p} className="btn ghost sm" onClick={() => setCtcInput(String(p))} style={{ background: ctc === p ? "rgba(16,185,129,0.12)" : undefined, borderColor: ctc === p ? "rgba(16,185,129,0.4)" : undefined }}>
                ₹{p >= 100000 ? (p / 100000) + "L" : p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {ctc > 0 && (
        <>
          <div className="grid g-cols-2" style={{ alignItems: "start" }}>
            <div className="card">
              <div className="card-head"><div className="card-title">Earnings<small>per month</small></div></div>
              <div className="col gap-3">
                {[
                  ["Basic (40%)", basic],
                  ["HRA (50% of basic)", hra],
                  ["LTA", lta],
                  ["Special Allowance", special],
                ].map(([l, v]) => (
                  <div key={l} className="row between fs-sm">
                    <span>{l}</span>
                    <span className="mono">₹{v.toLocaleString()}</span>
                  </div>
                ))}
                <div className="divider"/>
                <div className="row between fw-600">
                  <span>Total Gross</span>
                  <span className="mono">₹{grossMonthly.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><div className="card-title">Deductions<small>per month</small></div></div>
              <div className="col gap-3">
                {[
                  ["EPF (12% of basic)", epf],
                  ["Professional Tax", pt],
                  ["TDS (estimated)", tds],
                ].map(([l, v]) => (
                  <div key={l} className="row between fs-sm">
                    <span>{l}</span>
                    <span className="mono" style={{ color: "#EF4444" }}>-₹{v.toLocaleString()}</span>
                  </div>
                ))}
                <div className="divider"/>
                <div className="row between fw-600">
                  <span>Total Deductions</span>
                  <span className="mono" style={{ color: "#EF4444" }}>-₹{totalDed.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="row between" style={{ alignItems: "center" }}>
              <div>
                <div className="fs-sm muted">Net Take-Home</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#34D399", fontVariantNumeric: "tabular-nums" }}>₹{netMonthly.toLocaleString()}<small style={{ fontSize: 14, color: "var(--text-muted)" }}>/month</small></div>
                <div className="muted fs-xs">₹{(netMonthly * 12).toLocaleString()} annually</div>
              </div>
              <div style={{ width: 200 }}>
                <div className="fs-xs muted" style={{ marginBottom: 6 }}>Gross · Deductions · Net</div>
                <div style={{ display: "flex", height: 18, borderRadius: 4, overflow: "hidden", gap: 1 }}>
                  <div style={{ flex: grossMonthly, background: "#60A5FA" }}/>
                  <div style={{ flex: totalDed, background: "#EF4444" }}/>
                  <div style={{ flex: netMonthly, background: "#34D399" }}/>
                </div>
                <div className="row gap-3 fs-xs muted" style={{ marginTop: 4 }}>
                  <span style={{ color: "#60A5FA" }}>₹ Gross</span>
                  <span style={{ color: "#EF4444" }}>₹ Ded.</span>
                  <span style={{ color: "#34D399" }}>₹ Net</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-head"><div className="card-title">vs Your Current Salary</div></div>
            <table className="tbl">
              <thead><tr><th></th><th>Current</th><th>Entered CTC</th><th>Diff</th></tr></thead>
              <tbody>
                <tr><td>Gross/month</td><td className="mono">₹{currentGross.toLocaleString()}</td><td className="mono">₹{grossMonthly.toLocaleString()}</td><td className="mono" style={{ color: grossMonthly > currentGross ? "#34D399" : "#EF4444" }}>{grossMonthly > currentGross ? "+" : ""}₹{(grossMonthly - currentGross).toLocaleString()}</td></tr>
                <tr><td>Net/month</td><td className="mono">₹{currentNet.toLocaleString()}</td><td className="mono">₹{netMonthly.toLocaleString()}</td><td className="mono" style={{ color: netMonthly > currentNet ? "#34D399" : "#EF4444" }}>{netMonthly > currentNet ? "+" : ""}₹{(netMonthly - currentNet).toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// --------------------------------------------------------------
// EMP-011 · WFH Booking
// --------------------------------------------------------------
const WFHBooking = ({ onNav, onBack }) => {
  const { useState } = React;
  const WEEK_DAYS = ["Mon Nov 25", "Tue Nov 26", "Wed Nov 27", "Thu Nov 28", "Fri Nov 29"];
  const BASE_STATUS = ["wfh", "present", "present", "present", "present"];
  const [toggled, setToggled] = useState(new Set([0]));
  const [submitted, setSubmitted] = useState(false);
  const wfhUsed = 3;
  const wfhAllowed = 10;
  const wfhRemaining = wfhAllowed - wfhUsed - toggled.size + (BASE_STATUS[0] === "wfh" ? 1 : 0);

  const toggle = (idx) => {
    if (BASE_STATUS[idx] !== "present") return;
    setToggled(prev => {
      const n = new Set(prev);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });
  };

  const empList = (typeof EMPLOYEES !== "undefined" ? EMPLOYEES : []).slice(0, 6);

  return (
    <div className="page">
      <PageHead title="WFH Booking" subtitle="Book your work-from-home days · Nov 2025"/>

      {/* Balance */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row between" style={{ alignItems: "center" }}>
          <div className="col gap-1">
            <div className="fs-sm fw-600">WFH Balance · November</div>
            <div className="muted fs-xs">{wfhUsed} used · {Math.max(0, wfhRemaining)} remaining of {wfhAllowed}</div>
          </div>
          <div style={{ width: 200 }}>
            <div className="bar" style={{ height: 8 }}>
              <div style={{ width: `${Math.min(100, (wfhUsed / wfhAllowed) * 100)}%`, background: "#60A5FA", borderRadius: 4 }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Week calendar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head"><div className="card-title">This Week<small>Nov 25—29, 2025</small></div></div>
        <div className="row gap-3" style={{ flexWrap: "wrap" }}>
          {WEEK_DAYS.map((day, idx) => {
            const isToggledWFH = toggled.has(idx);
            const baseStatus = BASE_STATUS[idx];
            const isWFH = baseStatus === "wfh" || isToggledWFH;
            const isHoliday = baseStatus === "holiday";
            return (
              <div key={idx} style={{
                flex: 1, minWidth: 120, padding: "14px 12px", borderRadius: 10, textAlign: "center",
                border: `1px solid ${isWFH ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
                background: isWFH ? "rgba(16,185,129,0.08)" : "var(--inset-2)",
                opacity: isHoliday ? 0.5 : 1,
              }}>
                <div className="fs-xs muted" style={{ marginBottom: 4 }}>{day.slice(0, 3)}</div>
                <div className="fw-600" style={{ fontSize: 18, marginBottom: 8 }}>{day.slice(4, 6)}</div>
                {isWFH ? (
                  <span className="chip ok" style={{ fontSize: 9 }}>WFH</span>
                ) : (
                  <span className="chip info" style={{ fontSize: 9 }}>Office</span>
                )}
                {baseStatus === "present" && (
                  <div style={{ marginTop: 8 }}>
                    <button className="btn ghost sm" style={{ width: "100%", fontSize: 10 }} onClick={() => toggle(idx)}>
                      {isToggledWFH ? "Cancel WFH" : "Book WFH"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Team presence */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head"><div className="card-title">Team Presence<small>Engineering · this week</small></div></div>
        <div className="col gap-2">
          {empList.map((emp, ei) => (
            <div key={emp.id} className="row between" style={{ alignItems: "center" }}>
              <div className="row gap-3">
                <Avatar name={emp.name} size={28}/>
                <span className="fs-sm">{emp.name}</span>
              </div>
              <div className="row gap-2">
                {[0,1,2,3,4].map(di => {
                  const variant = (ei + di) % 5;
                  const color = variant < 2 ? "#60A5FA" : variant < 4 ? "#34D399" : "var(--border)";
                  const tip = variant < 2 ? "WFH" : variant < 4 ? "Office" : "Leave";
                  return <div key={di} title={tip} style={{ width: 10, height: 10, borderRadius: "50%", background: color }}/>;
                })}
              </div>
            </div>
          ))}
          <div className="row gap-4 fs-xs muted" style={{ marginTop: 4 }}>
            <span style={{ color: "#60A5FA" }}>? WFH</span>
            <span style={{ color: "#34D399" }}>? Office</span>
            <span>? Leave</span>
          </div>
        </div>
      </div>

      {/* Submit */}
      {toggled.size > 0 && !submitted && (
        <button className="btn primary" style={{ width: "100%" }} onClick={() => {
          const newRequests = Array.from(toggled).map((idx, i) => ({
            id: "WFH-" + Date.now() + "-" + i,
            empId: "SO-1042",
            empName: "Deepak Verma",
            dates: [WEEK_DAYS[idx]],
            status: "pending",
            submittedAt: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
            approvedBy: null,
            reason: "Remote work",
          }));
          window.WFH_REQUESTS = [...(window.WFH_REQUESTS || []), ...newRequests];
          window.persist('WFH_REQUESTS', window.WFH_REQUESTS);
          setSubmitted(true);
          window.toast(`WFH request submitted for ${toggled.size} day(s) · Manager notified`, { icon: "home", tone: "ok" });
        }}>
          <Icon name="home"/>Submit WFH Request for {toggled.size} day{toggled.size > 1 ? "s" : ""}
        </button>
      )}
      {submitted && <div className="chip ok" style={{ width: "100%", justifyContent: "center", padding: "12px 0", borderRadius: 8, fontSize: 13 }}><Icon name="check" size={14}/> WFH request submitted</div>}
    </div>
  );
};

// --------------------------------------------------------------
// EMP-012 · Employee Profile
// --------------------------------------------------------------
const EmployeeProfile = ({ onNav, onBack }) => {
  const { useState } = React;
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    dob: "1995-03-14",
    personalEmail: "deepak.verma@gmail.com",
    phone: "+91 98765 43210",
    emergencyName: "Sunita Verma",
    emergencyPhone: "+91 98700 12345",
    bloodGroup: "B+",
    currentAddress: "42, Sector 18, Noida, UP 201301",
    permanentAddress: "42, Sector 18, Noida, UP 201301",
    city: "Noida", state: "Uttar Pradesh", pin: "201301",
    sameAddress: true,
  });
  const emp = (typeof EMPLOYEES !== "undefined" ? EMPLOYEES : [])[5] || { name: "Deepak Verma", id: "SO-1042", role: "Senior Engineer", deptName: "Engineering" };

  const upd = (k, v) => setFormData(f => ({ ...f, [k]: v }));

  const EditBar = ({ card }) => editingCard === card ? (
    <div className="row gap-2">
      <button className="btn primary sm" onClick={() => { setEditingCard(null); window.toast("Changes saved", { icon: "check", tone: "ok" }); }}><Icon name="check" size={11}/>Save</button>
      <button className="btn ghost sm" onClick={() => setEditingCard(null)}><Icon name="x" size={11}/>Cancel</button>
    </div>
  ) : (
    <button className="btn ghost sm" onClick={() => setEditingCard(card)}><Icon name="edit" size={11}/>Edit</button>
  );

  return (
    <div className="page">
      <PageHead title="My Profile" subtitle={`Personal & professional information · ${emp.id}`}/>

      {/* Profile header */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row gap-5" style={{ alignItems: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, background: "rgba(16,185,129,0.18)", border: "2px solid rgba(16,185,129,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#34D399" }}>DV</div>
          <div className="col gap-1" style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{emp.name}</div>
            <div className="muted fs-sm">{emp.role} · {emp.deptName}</div>
            <div className="row gap-3 fs-xs muted"><Icon name="building" size={11}/>Noida Office<Icon name="calendar" size={11}/>Joined Aug 2022</div>
          </div>
          <button className="btn ghost sm" onClick={() => window.toast("Photo upload not available in demo", { icon: "upload", tone: "info" })}><Icon name="upload" size={11}/>Upload photo</button>
        </div>
      </div>

      <div className="grid g-cols-2" style={{ alignItems: "start" }}>
        {/* Personal info */}
        <div className="card">
          <div className="card-head"><div className="card-title">Personal Information</div><EditBar card="personal"/></div>
          <div className="col gap-3">
            {editingCard === "personal" ? (
              <>
                {[["Date of Birth", "dob", "date"], ["Personal Email", "personalEmail", "email"], ["Phone", "phone", "text"], ["Emergency Contact", "emergencyName", "text"], ["Emergency Phone", "emergencyPhone", "text"]].map(([label, key, type]) => (
                  <div key={key} className="row between" style={{ gap: 12 }}>
                    <label className="fs-sm muted" style={{ flex: 1 }}>{label}</label>
                    <input className="input" style={{ width: 180 }} type={type} value={formData[key]} onChange={e => upd(key, e.target.value)}/>
                  </div>
                ))}
                <div className="row between" style={{ gap: 12 }}>
                  <label className="fs-sm muted" style={{ flex: 1 }}>Blood Group</label>
                  <select className="select" style={{ width: 180 }} value={formData.bloodGroup} onChange={e => upd("bloodGroup", e.target.value)}>
                    {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
              </>
            ) : (
              [["Full Name", emp.name], ["Date of Birth", formData.dob], ["Personal Email", formData.personalEmail], ["Phone", formData.phone], ["Emergency Contact", formData.emergencyName + " · " + formData.emergencyPhone], ["Blood Group", formData.bloodGroup]].map(([k, v]) => (
                <div key={k} className="row between fs-sm">
                  <span className="muted">{k}</span>
                  <span>{v}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Address */}
        <div className="card">
          <div className="card-head"><div className="card-title">Address</div><EditBar card="address"/></div>
          <div className="col gap-3">
            {editingCard === "address" ? (
              <>
                <div className="col gap-1">
                  <label className="fs-xs muted">Current Address</label>
                  <textarea className="input" rows={2} value={formData.currentAddress} onChange={e => upd("currentAddress", e.target.value)}/>
                </div>
                <div className="row gap-2" style={{ alignItems: "center" }}>
                  <input type="checkbox" checked={formData.sameAddress} onChange={e => upd("sameAddress", e.target.checked)} id="sameAddr"/>
                  <label htmlFor="sameAddr" className="fs-xs">Same as permanent address</label>
                </div>
                {!formData.sameAddress && (
                  <div className="col gap-1">
                    <label className="fs-xs muted">Permanent Address</label>
                    <textarea className="input" rows={2} value={formData.permanentAddress} onChange={e => upd("permanentAddress", e.target.value)}/>
                  </div>
                )}
                <div className="row gap-3">
                  <input className="input" style={{ flex: 1 }} placeholder="City" value={formData.city} onChange={e => upd("city", e.target.value)}/>
                  <input className="input" style={{ flex: 1 }} placeholder="PIN" value={formData.pin} onChange={e => upd("pin", e.target.value)}/>
                </div>
              </>
            ) : (
              <>
                <div className="fs-sm"><span className="muted">Current: </span>{formData.currentAddress}</div>
                <div className="fs-sm"><span className="muted">Permanent: </span>{formData.sameAddress ? "Same as above" : formData.permanentAddress}</div>
                <div className="row gap-4 fs-sm"><span className="muted">City:</span>{formData.city}<span className="muted">PIN:</span>{formData.pin}</div>
              </>
            )}
          </div>
        </div>

        {/* Bank details */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Bank Details<small>Requires HR approval to update</small></div>
            <button className="btn ghost sm" onClick={() => window.openModal({ title: "Update Bank Details", subtitle: "Changes require HR approval. Your salary will continue to credit to the existing account until approved.", confirmText: "Submit for approval", onConfirm: () => window.toast("Bank details change request submitted to HR", { icon: "bank", tone: "info" }) })}><Icon name="edit" size={11}/>Update</button>
          </div>
          {[["Account Number", "XXXXXXXX4821"], ["IFSC Code", "HDFC0001234"], ["Bank", "HDFC Bank"], ["Branch", "Noida Sector 18"]].map(([k, v]) => (
            <div key={k} className="row between fs-sm" style={{ marginBottom: 10 }}>
              <span className="muted">{k}</span>
              <span className="mono">{v}</span>
            </div>
          ))}
        </div>

        {/* Professional (readonly) */}
        <div className="card">
          <div className="card-head"><div className="card-title">Professional Details<small>Read-only · request changes via HR</small></div></div>
          <div className="col gap-3">
            {[["Designation", emp.role], ["Department", emp.deptName], ["Reporting Manager", "Neha Krishnamurthy"], ["Location", "Noida"], ["Date of Joining", "Aug 14, 2022"], ["Employee ID", emp.id], ["PAN", "ABCDE1234F"], ["UAN", "100987654321"]].map(([k, v]) => (
              <div key={k} className="row between fs-sm">
                <span className="muted">{k}</span>
                <div className="row gap-2">
                  <span>{v}</span>
                  <span className="fs-xs" style={{ color: "#60A5FA", cursor: "default", textDecoration: "underline" }} onClick={() => window.toast(`Change request for "${k}" submitted to HR`, { icon: "send", tone: "info" })}>Request change</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending changes */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head"><div className="card-title">Pending Changes</div></div>
        <div className="row between" style={{ padding: "10px 12px", borderRadius: 8, background: "var(--inset-2)", border: "1px solid var(--border)" }}>
          <div className="col gap-1">
            <div className="fs-sm fw-600">Phone number change</div>
            <div className="muted fs-xs">Submitted Nov 20 · Pending HR approval</div>
          </div>
          <button className="btn ghost sm" onClick={() => window.toast("Change request cancelled", { icon: "x", tone: "warn" })}><Icon name="x" size={11}/>Cancel</button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {
  EmployeeDashboard, MyAttendance, MyLeave, BiometricSync,
  MyPayslips, RaiseTicket, EmployeeHolidayCalendar, MyReimbursements,
  ITDeclaration, SalaryCalculator, WFHBooking, EmployeeProfile,
  EMP_USER, EMP_LEAVE_BALANCE, EMP_ATTENDANCE,
});
