// ── Root app — auth + routing + global state ──────────────────
const { useState, useEffect } = React;

const PAGE_MAP = {
  dashboard: Dashboard,
  employees: Employees,
  payroll:   Payroll,
  reports:   Reports,
  settings:  Settings,
};

// Pages that support search — wired to global search state
const SEARCHABLE_PAGES = ['employees', 'payroll', 'reports'];

function App() {
  const [currentUser, setCurrentUser] = useState(() => authGetSession());
  const [page,        setPage]        = useState('dashboard');
  const [theme,       setTheme]       = useState('dark');
  const [globalQuery, setGlobalQuery] = useState('');

  // Persist and apply theme to document root
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Clear search when navigating to a new page
  useEffect(() => { setGlobalQuery(''); }, [page]);

  // When user logs in, land on the first page of their portal
  const handleLogin = (user) => {
    const firstPage = getPortalNav(user.role)[0] || 'dashboard';
    setPage(firstPage);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage('dashboard');
    setGlobalQuery('');
    window.showToast('Signed out successfully', 'info');
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const handleSearch = (q) => {
    setGlobalQuery(q);
    if (q && !SEARCHABLE_PAGES.includes(page)) {
      setPage('employees');
    }
  };

  // Guard: navigate only to pages the role can access
  const handleNavigate = (id) => {
    const allowed = getPortalNav(currentUser?.role || 'read_only');
    if (allowed.includes(id)) setPage(id);
  };

  // ── Not authenticated → show login ──────────────────────────
  if (!currentUser) {
    return (
      <>
        <div className="app-bg" aria-hidden="true"/>
        <LoginPage onLogin={handleLogin}/>
        <ToastHost/>
      </>
    );
  }

  // ── Authenticated → show role portal ────────────────────────
  const allowedPages = getPortalNav(currentUser.role);
  const activePage   = allowedPages.includes(page) ? page : allowedPages[0];
  const Screen       = PAGE_MAP[activePage] || Dashboard;

  // Expose to pages so they can check edit permissions
  window.hrflowUser = currentUser;

  return (
    <>
      <div className="app-bg" aria-hidden="true"/>
      <div className="app-shell">
        <Sidebar
          currentPage={activePage}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <Topbar
          currentPage={activePage}
          onSearch={handleSearch}
          onToggleTheme={toggleTheme}
          currentUser={currentUser}
        />
        <main className="canvas" key={activePage}>
          <Screen
            searchQuery={globalQuery}
            canEdit={canEditPage(currentUser.role, activePage)}
          />
        </main>
      </div>
      <ToastHost/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
