// ── App shell layout components ───────────────────────────────
const { useState } = React;

// ── Full navigation catalog ────────────────────────────────────
const ALL_NAV_ITEMS = [
  { section: 'Main' },
  { id: 'dashboard', label: 'Dashboard',   icon: 'gauge' },
  { section: 'People' },
  { id: 'employees', label: 'Employees',   icon: 'users', badge: '2' },
  { section: 'Payroll' },
  { id: 'payroll',   label: 'Payroll Run', icon: 'money-bill-wave', badge: 'Now' },
  { section: 'Insights' },
  { id: 'reports',   label: 'Reports',     icon: 'chart-bar' },
  { section: 'Admin' },
  { id: 'settings',  label: 'Settings',    icon: 'gear' },
];

function buildNavItems(role) {
  const allowed = getPortalNav(role);
  const out = [];
  let lastSection = null;
  for (const item of ALL_NAV_ITEMS) {
    if (item.section) { lastSection = item; continue; }
    if (allowed.includes(item.id)) {
      if (lastSection) { out.push(lastSection); lastSection = null; }
      out.push(item);
    }
  }
  return out;
}

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  payroll:   'Payroll Run',
  reports:   'Reports',
  settings:  'Settings',
};

// ── Sidebar ───────────────────────────────────────────────────
const Sidebar = ({ currentPage, onNavigate, currentUser, onLogout }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const navItems  = buildNavItems(currentUser?.role || 'read_only');
  const roleMeta  = ROLE_META[currentUser?.role] || { label: 'User', color: '#8B949E' };

  const handleLogout = () => {
    authClearSession();
    onLogout();
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">HF</div>
        <div>
          <div className="brand-name">HRFlow</div>
          <div className="brand-tagline">People & Payroll</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            return <div key={'s' + i} className="nav-section-label">{item.section}</div>;
          }
          return (
            <div key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}>
              <span className="nav-item-icon">
                <Icon name={item.icon} size={13}/>
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <Avatar name={currentUser?.name || 'User'} size="sm" status="active"/>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{currentUser?.name || 'User'}</div>
          <div className="sidebar-user-role" style={{ color: roleMeta.color }}>
            {roleMeta.label}
          </div>
        </div>
        <button className="icon-btn" title="Sign out" style={{ width: 28, height: 28, flexShrink: 0 }}
          onClick={handleLogout}>
          <Icon name="right-from-bracket" size={11}/>
        </button>
      </div>
    </aside>
  );
};

// ── Topbar ────────────────────────────────────────────────────
const Topbar = ({ currentPage, onSearch, onToggleTheme, currentUser }) => {
  const [searchVal, setSearchVal] = useState('');
  const searchRef = React.useRef(null);
  const title = PAGE_TITLES[currentPage] || '';

  const handleSearch = (e) => {
    setSearchVal(e.target.value);
    onSearch?.(e.target.value);
  };

  // ⌘K / Ctrl+K focuses the search bar
  React.useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      // Escape clears search
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setSearchVal('');
        onSearch?.('');
        searchRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onSearch]);

  // Keep local state in sync when parent clears it (page navigation)
  React.useEffect(() => { setSearchVal(''); }, [currentPage]);

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>

      {/* Search */}
      <div className="topbar-search" onClick={() => searchRef.current?.focus()}>
        <Icon name="magnifying-glass" size={12} color="var(--text-muted)"/>
        <input
          ref={searchRef}
          type="text"
          placeholder="Search employees, payroll, reports…"
          value={searchVal}
          onChange={handleSearch}
          aria-label="Global search"/>
        <kbd style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-4)',
          padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border-mid)',
          flexShrink: 0, fontFamily: 'inherit' }}>
          ⌘K
        </kbd>
      </div>

      <div className="topbar-actions">
        {/* Theme toggle */}
        <button className="icon-btn" title="Toggle theme" onClick={onToggleTheme}>
          <Icon name="moon" size={13}/>
        </button>

        {/* Notifications */}
        <button className="icon-btn" title="Notifications"
          onClick={() => window.showToast('3 new notifications', 'info', 'Payroll approval needed')}>
          <Icon name="bell" size={13}/>
          <span className="dot"/>
        </button>

        {/* Help */}
        <button className="icon-btn" title="Help"
          onClick={() => window.showToast('Help center coming soon', 'info')}>
          <Icon name="circle-question" size={13}/>
        </button>

        {/* User */}
        <div className="topbar-user">
          <div className="topbar-user-info">
            <div className="topbar-user-name">{currentUser?.name || 'User'}</div>
            <div className="topbar-user-role" style={{ color: (ROLE_META[currentUser?.role] || {}).color }}>
              {(ROLE_META[currentUser?.role] || { label: 'User' }).label}
            </div>
          </div>
          <Avatar name={currentUser?.name || 'User'} size="sm" status="active"/>
        </div>
      </div>
    </header>
  );
};

// ── Page header ───────────────────────────────────────────────
const PageHead = ({ title, subtitle, children }) => (
  <div className="page-head">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {children && <div className="page-actions">{children}</div>}
  </div>
);

// ── Exports ───────────────────────────────────────────────────
Object.assign(window, { Sidebar, Topbar, PageHead });
