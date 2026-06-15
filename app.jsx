// Main app
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "sidebarStyle": "labeled",
  "density": "compact"
}/*EDITMODE-END*/;

const USER_PERSONAS = [
  { role: "super_admin",     name: "Priya Kapoor",  title: "Super Admin",     initials: "PK" },
  { role: "hr_manager",      name: "Rahul Mehta",   title: "HR Manager",      initials: "RM" },
  { role: "finance_manager", name: "Raj Kumar",     title: "Finance Manager", initials: "RK" },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = useState("dashboard");
  const [subPage, setSubPage] = useState(null);
  const [portalMode, setPortalMode] = useState("admin"); // "admin" | "employee"
  const [currentUserRole, setCurrentUserRoleState] = useState(
    () => {
      const saved = window.loadStore('current_user_role', 'super_admin');
      window.currentUserRole = saved;
      window.isSuperAdmin = saved === 'super_admin';
      return saved;
    }
  );

  // Apply density to root
  useEffect(() => {
    document.documentElement.dataset.density = t.density;
  }, [t.density]);

  // Sync role to globals whenever it changes
  useEffect(() => {
    window.currentUserRole = currentUserRole;
    window.isSuperAdmin = currentUserRole === 'super_admin';
  }, [currentUserRole]);

  // Wire global click fallback for unhandled buttons
  useGlobalClickFallback();

  // Memoised so the global-wiring effect has stable deps and only runs once
  const navigate = useCallback((id) => {
    setSubPage(null);
    setActive(id);
  }, []);
  const openSub = useCallback((id, payload = {}) => setSubPage({ id, ...payload }), []);
  const closeSub = useCallback(() => setSubPage(null), []);

  const switchPortal = useCallback((mode) => {
    setPortalMode(mode);
    setSubPage(null);
    setActive(mode === "admin" ? "dashboard" : "emp-dashboard");
  }, []);

  const switchUserRole = useCallback((role) => {
    setCurrentUserRoleState(role);
    window.persist('current_user_role', role);
    const persona = USER_PERSONAS.find(p => p.role === role);
    window.toast(`Switched to ${persona?.name}`, { icon: "user", tone: "info", sub: persona?.title });
  }, []);

  // Expose to all screens — deps are stable (useCallback with []), so this runs once
  useEffect(() => {
    window.appNav = navigate;
    window.appSub = openSub;
    window.switchPortal = switchPortal;
    window.setCurrentUserRole = switchUserRole;
  }, [navigate, openSub, switchPortal, switchUserRole]);

  // ── Admin screens ──────────────────────────────────────────
  const AdminScreen = {
    dashboard:   Dashboard,
    payroll:     Payroll,
    contractors: Contractors,
    expenses:    Expenses,
    employees:   Employees,
    attendance:  Attendance,
    payslips:    Payslips,
    compliance:  Compliance,
    letters:     Letters,
    copilot:     Copilot,
    anomalies:   Anomalies,
    reports:     Reports,
    audit:       Audit,
    support:     Support,
    settings:    Settings,
    clients:         Clients,
    reimbursements:  AdminReimbursements,
    "payroll-variance":   PayrollVariance,
    "fnf-settlement":     FnfSettlement,
    "salary-increment":   SalaryIncrement,
    "headcount-forecast": HeadcountForecast,
    "bank-transfer":      BankTransfer,
  }[active] || Dashboard;

  // ── Employee screens ───────────────────────────────────────
  const EmpScreen = {
    "emp-dashboard":  EmployeeDashboard,
    "my-attendance":  MyAttendance,
    "my-leave":       MyLeave,
    "my-payslips":    MyPayslips,
    "biometric-sync": BiometricSync,
    "raise-ticket":        RaiseTicket,
    "my-reimbursements":   MyReimbursements,
    "it-declaration":    ITDeclaration,
    "salary-calculator": SalaryCalculator,
    "wfh-booking":       WFHBooking,
    "emp-profile":       EmployeeProfile,
  }[active] || EmployeeDashboard;

  // ── Sub-pages (shared) ──────────────────────────────────────
  const SubScreen = subPage ? ({
    "holiday-calendar":   HolidayCalendar,
    "employee-holiday":   EmployeeHolidayCalendar,
    "faq-library":        FaqLibrary,
    "bot-training":       BotTraining,
    "scheduled-reports":  ScheduledReports,
    "report-builder":     ReportBuilder,
    "permission-audit":   PermissionAudit,
    "filing-register":    FilingRegister,
    "help-center":        HelpCenter,
    "timesheet-upload":   TimesheetUpload,
    "client-payroll":     ClientPayroll,
  }[subPage.id]) : null;

  const Screen = portalMode === "employee" ? EmpScreen : AdminScreen;

  return (
    <>
      <div className="bg-stage"/>
      <div className="app-shell" data-sidebar={t.sidebarStyle === "icon" ? "icon" : "labeled"}>
        <Sidebar active={active} onNav={navigate} portalMode={portalMode} currentUserRole={currentUserRole} onSwitchRole={switchUserRole}/>
        <Topbar active={active} onNavTo={navigate} portalMode={portalMode} onSwitchPortal={switchPortal}/>
        <main className="canvas" data-screen-label={subPage ? subPage.id : active} key={subPage ? subPage.id : active}>
          {SubScreen ? <SubScreen onBack={closeSub} {...subPage}/> : <Screen onNav={navigate} onSub={openSub}/>}
        </main>
      </div>

      <ToastHost/>
      <ModalHost/>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Layout"/>
        <TweakRadio  label="Sidebar" value={t.sidebarStyle}
                     options={[{value:"labeled",label:"Labels"},{value:"icon",label:"Icons"}]}
                     onChange={(v) => setTweak("sidebarStyle", v)}/>
        <TweakRadio  label="Density" value={t.density}
                     options={[{value:"compact",label:"Compact"},{value:"comfortable",label:"Comfy"}]}
                     onChange={(v) => setTweak("density", v)}/>

        <TweakSection label="Navigate"/>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {NAV.filter(n => n.id).map(n => (
            <button key={n.id} onClick={() => navigate(n.id)} style={{
              padding: "5px 8px", borderRadius: 6, fontSize: 11,
              background: active === n.id ? "rgba(16,185,129,0.16)" : "rgba(0,0,0,0.04)",
              color: active === n.id ? "#047857" : "#29261b",
              border: `1px solid ${active === n.id ? "rgba(16,185,129,0.4)" : "rgba(0,0,0,0.06)"}`,
              cursor: "default",
              textAlign: "left",
              fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <Icon name={n.icon} size={11}/>{n.label}
            </button>
          ))}
        </div>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
