// Shell — Sidebar, Topbar, Page header

// ──────────────────────────────────────────────────────────────
// Employee portal navigation
// ──────────────────────────────────────────────────────────────
const EMP_NAV = [
  { section: "My Space" },
  { id: "emp-dashboard",  label: "Dashboard",        icon: "dashboard" },
  { id: "wfh-booking",    label: "WFH Booking",      icon: "home" },
  { id: "emp-profile",    label: "My Profile",       icon: "user" },
  { id: "my-attendance",  label: "My Attendance",    icon: "calendar" },
  { id: "my-leave",       label: "My Leave",         icon: "payslip",   badge: "2" },
  { id: "biometric-sync", label: "Biometric Sync",   icon: "fingerprint" },
  { section: "Documents" },
  { id: "my-payslips",       label: "My Payslips",        icon: "payroll" },
  { id: "salary-calculator", label: "Salary Calculator", icon: "coins" },
  { id: "it-declaration",    label: "IT Declaration",    icon: "shield" },
  { id: "my-reimbursements", label: "My Reimbursements",  icon: "coins" },
  { section: "Help" },
  { id: "raise-ticket",   label: "Raise a Ticket",   icon: "alert",     badge: "1" },
];

// ──────────────────────────────────────────────────────────────
// Admin portal navigation
// ──────────────────────────────────────────────────────────────
const NAV = [
  { section: "Operate" },
  { id: "dashboard",  label: "Dashboard",       icon: "dashboard" },
  { id: "payroll",    label: "Payroll Run",     icon: "payroll",   badge: "Nov" },
  { id: "clients",    label: "Clients",         icon: "building" },
  { id: "contractors",label: "Contractors",     icon: "bank" },
  { id: "expenses",        label: "Expenses",        icon: "coins",     badge: "12" },
  { id: "reimbursements",  label: "Reimbursements",  icon: "report",    badge: "5" },
  { id: "fnf-settlement",    label: "F&F Settlement",   icon: "coins" },
  { id: "salary-increment",  label: "Salary Revision",  icon: "arrowUp" },
  { id: "bank-transfer",     label: "Bank Transfer",    icon: "bank" },
  { id: "employees",  label: "Employees",       icon: "employees" },
  { id: "attendance", label: "Attendance & Leave", icon: "calendar" },
  { id: "payslips",   label: "Payslips",        icon: "payslip" },
  { section: "Compliance" },
  { id: "compliance", label: "Compliance Hub",  icon: "shield" },
  { id: "letters",    label: "Letters & Docs",  icon: "file" },
  { section: "AI Studio" },
  { id: "copilot",    label: "AI Copilot",      icon: "sparkle" },
  { id: "anomalies",  label: "Anomalies",       icon: "alert",     badge: "3" },
  { section: "Governance" },
  { id: "reports",    label: "Reports",         icon: "report" },
  { id: "payroll-variance",   label: "Payroll Variance",  icon: "chart" },
  { id: "headcount-forecast", label: "HC Forecast",       icon: "employees" },
  { id: "audit",      label: "Audit Log",       icon: "log" },
  { id: "support",    label: "Support Center",  icon: "user" },
  { id: "settings",   label: "Roles & Access",  icon: "lock" },
];

const SIDEBAR_PERSONAS = [
  { role: "super_admin",     name: "Priya Kapoor",  title: "Super Admin",     initials: "PK" },
  { role: "hr_manager",      name: "Rahul Mehta",   title: "HR Manager",      initials: "RM" },
  { role: "finance_manager", name: "Raj Kumar",     title: "Finance Manager", initials: "RK" },
];

const Sidebar = ({ active, onNav, portalMode, currentUserRole, onSwitchRole }) => {
  const navItems = portalMode === "employee" ? EMP_NAV : NAV;
  const isEmp = portalMode === "employee";
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const persona = SIDEBAR_PERSONAS.find(p => p.role === currentUserRole) || SIDEBAR_PERSONAS[0];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">S1</div>
        <div className="brand-name">
          Source One
          <small>{isEmp ? "People Portal" : "Payroll Cloud"}</small>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, overflowY: "auto" }}>
        {navItems.map((item, i) => {
          if (item.section) return <div className="nav-section" key={"s" + i}>{item.section}</div>;
          const isActive = item.id === active;
          return (
            <div key={item.id} className="nav-item" data-active={isActive} onClick={() => onNav(item.id)} title={item.label}>
              <Icon name={item.icon} size={15}/>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{
                item.id === "my-leave" ? ((window.LEAVE_REQUESTS || []).filter(r => r.status === "pending" && (r.empId === "SO-1042" || r.emp === "Deepak Verma")).length || item.badge)
                : item.id === "raise-ticket" ? ((window.TICKETS || []).filter(t => t.status === "open" && t.empId === "SO-1042").length || item.badge)
                : item.badge
              }</span>}
            </div>
          );
        })}
      </nav>

      {/* User / Role switcher footer */}
      <div style={{ position: "relative" }}>
        {rolePickerOpen && !isEmp && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setRolePickerOpen(false)}/>
            <div className="glass-strong" style={{
              position: "absolute", bottom: "calc(100% + 4px)", left: 8, right: 8,
              zIndex: 50, padding: 6, borderRadius: 10,
            }}>
              <div className="muted fs-xs fw-600" style={{ padding: "4px 8px 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Switch user (demo)
              </div>
              {SIDEBAR_PERSONAS.map(p => (
                <div key={p.role} onClick={() => { onSwitchRole && onSwitchRole(p.role); setRolePickerOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "7px 8px",
                    borderRadius: 7, cursor: "default",
                    background: p.role === currentUserRole ? "rgba(16,185,129,0.12)" : "transparent",
                  }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: p.role === "super_admin" ? "linear-gradient(135deg,#10B981,#059669)" : "rgba(99,102,241,0.20)",
                    color: p.role === "super_admin" ? "#fff" : "#818CF8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700,
                  }}>{p.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: p.role === "super_admin" ? "#34D399" : "var(--text-muted)" }}>{p.title}</div>
                  </div>
                  {p.role === currentUserRole && <Icon name="check" size={11} color="#10B981"/>}
                </div>
              ))}
            </div>
          </>
        )}
        <div className="sb-foot" onClick={() => !isEmp && setRolePickerOpen(o => !o)}
          style={{ cursor: isEmp ? "default" : "pointer" }}
          title={isEmp ? "" : "Switch role"}>
          <div className="sb-avatar" style={{
            background: isEmp ? undefined : (currentUserRole === "super_admin" ? "linear-gradient(135deg,#10B981,#059669)" : "rgba(99,102,241,0.30)"),
            color: isEmp ? undefined : (currentUserRole === "super_admin" ? "#fff" : "#818CF8"),
          }}>
            {isEmp ? "DV" : persona.initials}
          </div>
          <div className="sb-foot-text">
            {isEmp
              ? <><b>Deepak Verma</b><small>Senior Engineer · SO-1042</small></>
              : <><b>{persona.name}</b><small style={{ color: currentUserRole === "super_admin" ? "#34D399" : "var(--text-muted)" }}>{persona.title}</small></>
            }
          </div>
          {!isEmp && <Icon name="chevDown" size={11} color="var(--text-muted)" style={{ marginLeft: "auto" }}/>}
        </div>
      </div>
    </aside>
  );
};

// ──────────────────────────────────────────────────────────────
// Topbar
// ──────────────────────────────────────────────────────────────
const CRUMB_LABELS = {
  dashboard: "Dashboard",
  payroll: "Payroll Run",
  contractors: "Contractors",
  expenses: "Expenses",
  employees: "Employees",
  attendance: "Attendance & Leave",
  payslips: "Payslips",
  compliance: "Compliance Hub",
  letters: "Letters & Docs",
  copilot: "AI Copilot",
  anomalies: "Anomalies",
  reports: "Reports",
  audit:          "Audit Log",
  support:        "Support Center",
  settings:       "Roles & Access",
  reimbursements:       "Reimbursements",
  "payroll-variance":   "Payroll Variance",
  "fnf-settlement":     "F&F Settlement",
  "salary-increment":   "Salary Revision",
  "headcount-forecast": "HC Forecast",
  "bank-transfer":      "Bank Transfer",
};

const EMP_CRUMB_LABELS = {
  "emp-dashboard":  "My Dashboard",
  "my-attendance":  "My Attendance",
  "my-leave":       "My Leave",
  "my-payslips":    "My Payslips",
  "biometric-sync": "Biometric Sync",
  "raise-ticket":        "Raise a Ticket",
  "my-reimbursements":   "My Reimbursements",
  "it-declaration":      "IT Declaration",
  "salary-calculator":   "Salary Calculator",
  "wfh-booking":         "WFH Booking",
  "emp-profile":         "My Profile",
};

const Topbar = ({ active, onNavTo, portalMode, onSwitchPortal }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(
    (typeof NOTIFICATIONS !== "undefined" ? NOTIFICATIONS : []).length
  );
  const [companySwitcherOpen, setCompanySwitcherOpen] = useState(false);
  const [activeCompany, setActiveCompany] = useState(
    (typeof COMPANIES !== "undefined" ? COMPANIES : [])[0] || { code: "S1", name: "Source One", employees: 247 }
  );
  const bellRef = useRef(null);
  const coSwitchRef = useRef(null);
  const isEmp = portalMode === "employee";

  const _steps = Array.isArray(window.APPROVAL_STEPS) ? window.APPROVAL_STEPS : (Array.isArray(APPROVAL_STEPS) ? APPROVAL_STEPS : []);
  const doneSteps = _steps.filter(s => s.status === "done").length;
  const totalSteps = _steps.length || 6;

  const toggleTheme = () => {
    const cur = document.documentElement.dataset.theme || "dark";
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.toast(`${next === "dark" ? "Dark" : "Light"} mode enabled`, { icon: next === "dark" ? "moon" : "sun", tone: "info" });
  };

  const crumbLabel = isEmp
    ? (EMP_CRUMB_LABELS[active] || "—")
    : (CRUMB_LABELS[active] || "—");

  return (
    <header className="topbar">
      <div ref={coSwitchRef} className="co-switch" style={{ position: "relative" }}
        onClick={() => setCompanySwitcherOpen(o => !o)}>
        <div className="co-logo">{activeCompany.code}</div>
        <div>
          <div className="co-switch-name">{activeCompany.short || activeCompany.name}</div>
          <small>India · INR · {(typeof EMPLOYEES !== "undefined" ? EMPLOYEES : []).length} emp.</small>
        </div>
        <Icon name="chevDown" size={12} color="#7E8AA0" style={{ marginLeft: 4 }}/>
        {companySwitcherOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={(ev) => { ev.stopPropagation(); setCompanySwitcherOpen(false); }}/>
            <div className="glass-strong" style={{
              position: "absolute", top: "100%", left: 0, zIndex: 200,
              minWidth: 280, padding: 6, marginTop: 4,
            }} onClick={(ev) => ev.stopPropagation()}>
              <div className="muted fs-xs fw-600" style={{ padding: "4px 10px 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Switch Company</div>
              {(typeof COMPANIES !== "undefined" ? COMPANIES : []).map(c => (
                <div key={c.id} onClick={() => {
                  setActiveCompany(c);
                  setCompanySwitcherOpen(false);
                  window.toast(`Switched to ${c.name}`, { icon: "building", tone: "ok" });
                }} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "7px 10px", borderRadius: 7, cursor: "default",
                  background: activeCompany.id === c.id ? "rgba(16,185,129,0.10)" : "transparent",
                  opacity: c.active ? 1 : 0.5,
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: "rgba(16,185,129,0.15)", color: "#34D399",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, border: "1px solid rgba(16,185,129,0.25)",
                  }}>{c.code}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                    <div className="muted fs-xs">{c.employees} employees · {c.active ? "Active" : "Inactive"}</div>
                  </div>
                  {activeCompany.id === c.id && <Icon name="check" size={12} color="#34D399"/>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Portal switcher */}
      <div style={{
        display: "flex", alignItems: "center", gap: 2,
        padding: 3, borderRadius: 9,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        {[["admin","Admin Portal","lock"],["employee","Employee Portal","user"]].map(([mode, label, icon]) => (
          <button key={mode} onClick={() => onSwitchPortal(mode)} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 6,
            fontSize: 11, fontWeight: 500,
            background: portalMode === mode
              ? (mode === "employee" ? "rgba(96,165,250,0.18)" : "rgba(16,185,129,0.18)")
              : "transparent",
            color: portalMode === mode
              ? (mode === "employee" ? "#93C5FD" : "#34D399")
              : "var(--text-muted)",
            border: portalMode === mode
              ? `1px solid ${mode === "employee" ? "rgba(96,165,250,0.35)" : "rgba(16,185,129,0.35)"}`
              : "1px solid transparent",
            cursor: "default", fontFamily: "inherit",
            transition: "all 140ms",
          }}>
            <Icon name={icon} size={11}/>{label}
          </button>
        ))}
      </div>

      <div className="crumb">
        <Icon name="home" size={12}/>
        <span>{isEmp ? "People Portal" : "Payroll Cloud"}</span>
        <Icon name="chevron" size={12}/>
        <b>{crumbLabel}</b>
      </div>

      <div className="tb-actions">
        {!isEmp && (
          <div className="chip ok" style={{ height: 26, cursor: "default" }} onClick={() => onNavTo?.("payroll")}>
            <span className="live-dot"/>
            <span>Nov payroll · {doneSteps} of {totalSteps}</span>
          </div>
        )}
        {isEmp && (
          <div className="chip info" style={{ height: 26, cursor: "default" }}>
            <span className="live-dot" style={{ background: "#60A5FA" }}/>
            <span>Nov salary · 28th</span>
          </div>
        )}
        <button ref={bellRef} className="iconbtn" title="Notifications"
                onClick={() => setNotifOpen(o => !o)} style={{ position: "relative" }}>
          <Icon name="bell"/>
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4,
              minWidth: 16, height: 16, borderRadius: 999,
              background: "#EF4444", color: "#fff",
              fontSize: 9.5, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1.5px solid var(--canvas)", lineHeight: 1,
              padding: "0 3px",
            }}>{unreadCount}</span>
          )}
        </button>
        <button className="iconbtn" title="Help" onClick={() => window.appSub?.("help-center")}>
          <Icon name="globe"/>
        </button>
        <button className="iconbtn" title="Theme" onClick={toggleTheme}>
          <Icon name="moon"/>
        </button>
        <span style={{
          fontSize: 9.5, color: "var(--text-muted)", marginLeft: 4,
          display: "flex", alignItems: "center", gap: 4,
        }} title="All changes auto-saved to local storage">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", display: "inline-block" }}/>
          Auto-saved
        </span>
      </div>

      <NotificationsPopover open={notifOpen} anchorRef={bellRef} onClose={() => setNotifOpen(false)}
        onUnreadChange={setUnreadCount}/>
    </header>
  );
};

// ──────────────────────────────────────────────────────────────
// Page header (title + actions)
// ──────────────────────────────────────────────────────────────
const PageHead = ({ title, subtitle, children }) => (
  <div className="page-head">
    <div>
      <div className="page-title">
        {title}
        {subtitle && <small>{subtitle}</small>}
      </div>
    </div>
    {children && <div className="page-actions">{children}</div>}
  </div>
);

Object.assign(window, { Sidebar, Topbar, PageHead, NAV, EMP_NAV });
