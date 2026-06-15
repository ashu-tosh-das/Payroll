# Architecture — Tech Stack & Design System

## Runtime Environment

Source One Payroll Cloud runs as a **zero-build, single-HTML-file application** served by a Python HTTP server on port 3000.

```
python -m http.server 3000
# Open: http://localhost:3000/Source%20One%20Payroll%20Cloud.html
```

---

## Technology Choices

| Concern | Choice | Rationale |
|---|---|---|
| View layer | React 18 UMD | Zero build setup; JSX via Babel Standalone in-browser |
| Icons | Custom SVG sprite (22 named icons) | No CDN dependency; precise control over icon set |
| Charts | Custom SVG (no library) | Eliminates 200 KB+ chart lib; fully themeable |
| Fonts | Inter via Google Fonts | Non-blocking load with `media="print"` swap trick |
| Styling | Plain CSS (token-based) | No Tailwind/CSS-in-JS; straightforward theming |
| Data | In-memory JS objects (data.jsx) | Simulates REST API; swap `fetch()` for real backend |
| Persistence | localStorage (`so_*` keys) | Zero backend; auto-save for all mutable state |

---

## Script Load Order

Babel Standalone compiles all `<script type="text/babel">` blocks in document order. Every file exports its components/functions to `window` so later scripts can consume them without ES module imports.

```
Source One Payroll Cloud.html
│
├── React 18 UMD + ReactDOM       → window.React, window.ReactDOM
├── Babel Standalone              → enables <script type="text/babel">
│
├── data.jsx          → window.{ EMPLOYEES, CLIENTS, COMPANIES, DEPARTMENTS,
│                                NOTIFICATIONS, PAYROLL_RUNS, PAYROLL_TREND,
│                                LEAVE_REQUESTS, TICKETS, ... }
│                       window.{ fmtINR, initials, avatarHueFor, persist,
│                                loadStore, resetAll }
│
├── common.jsx        → window.{ Icon, Avatar, StatusChip,
│                                MiniMetric, Sparkline, Donut, ... }
│
├── interactions.jsx  → window.{ ToastHost, ModalHost, NotificationsPopover,
│                                useGlobalClickFallback }
│                       window.toast(text, opts)
│                       window.openModal(config)
│
├── tweaks-panel.jsx  → window.{ TweaksPanel, useTweaks, TweakSection, TweakRadio }
│
├── shell.jsx         → window.{ Sidebar, Topbar, PageHead, NAV, EMP_NAV }
│
├── screens/          → window.{ Dashboard, Payroll, Clients, Employees, ... }
│   (22 admin screens + employee portal + sub-pages)
│
└── app.jsx           → ReactDOM.createRoot('#root').render(<App/>)
```

---

## CSS Architecture

Single stylesheet: [styles.css](../../styles.css)

### Layout Classes

| Class | Purpose |
|---|---|
| `.app-shell` | CSS Grid: sidebar + topbar + canvas |
| `.canvas` | Main content area (`overflow: hidden`) |
| `.page` | Screen root (`overflow-y: auto`) |
| `.card` | Surface card with border and padding |
| `.grid` | CSS Grid container |
| `.row` | Flexbox row |

### Design Tokens (CSS Custom Properties)

All colour, spacing, and typography values defined as `--var` tokens in `:root`. Light mode overrides them via `[data-theme="light"]`.

See [25-platform-features.md](../features/25-platform-features.md) for the full token table.

### Key Utility Classes

| Class | Purpose |
|---|---|
| `.btn`, `.btn.primary`, `.btn.ghost` | Button variants |
| `.chip` | Small inline label |
| `.tbl` | Table base styles |
| `.muted`, `.fs-xs`, `.fs-sm` | Typography helpers |
| `.glass-strong` | Frosted glass card (used for popovers, modals) |
| `.anim-fade`, `.anim-slide-r` | Entry animations |

---

## Responsive Layout

The layout is designed for desktop (1440×900 minimum). Key overflow patterns:

- `.canvas { overflow: hidden }` — clips the main content area
- `.page { overflow-y: auto }` — individual screens scroll vertically
- Tables inside `overflow: hidden` cards require an inner `overflowX: auto` wrapper for horizontal scroll (see contractors.jsx fix)

---

## Portal Detection

```js
// In app.jsx
const [portalMode, setPortalMode] = useState("admin");

// Exposed globally
window.switchPortal = (mode) => { ... };

// Sidebar uses it to choose nav array
const navItems = portalMode === "employee" ? EMP_NAV : NAV;
```

---

## Production Readiness Notes

For production deployment, replace or add:

1. **Authentication** — Sidebar footer and Topbar user widget ready for JWT/session context
2. **API integration** — Replace `data.jsx` with `fetch()` calls; component prop interfaces already match expected shapes
3. **Build pipeline** — Replace Babel Standalone with Vite or esbuild (eliminates ~900 KB in-browser compilation)
4. **Real-time notifications** — Swap static `NOTIFICATIONS` array for WebSocket/SSE feed
5. **E2E tests** — Add Playwright coverage (test suite at [mcp-browser-test.js](../../mcp-browser-test.js) is the starting point)
