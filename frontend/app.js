// ── Root app — routing + global state ────────────────────────
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
  const [page,        setPage]        = useState('dashboard');
  const [theme,       setTheme]       = useState('dark');
  const [globalQuery, setGlobalQuery] = useState('');

  // Persist and apply theme to document root
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Clear search when navigating to a new page
  useEffect(() => { setGlobalQuery(''); }, [page]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const handleSearch = (q) => {
    setGlobalQuery(q);
    if (q && !SEARCHABLE_PAGES.includes(page)) {
      // Auto-navigate to Employees when searching from a non-searchable page
      setPage('employees');
    }
  };

  const Screen = PAGE_MAP[page] || Dashboard;

  return (
    <>
      <div className="app-bg" aria-hidden="true"/>
      <div className="app-shell">
        <Sidebar currentPage={page} onNavigate={setPage}/>
        <Topbar currentPage={page} onSearch={handleSearch} onToggleTheme={toggleTheme}/>
        <main className="canvas" key={page}>
          <Screen searchQuery={globalQuery}/>
        </main>
      </div>
      <ToastHost/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
