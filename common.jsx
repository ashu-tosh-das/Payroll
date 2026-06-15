// Shared atoms — icons, sparklines, mini-charts, avatars, chips
// All components attached to window for cross-script use.

// ──────────────────────────────────────────────────────────────
// Icon set — single source of truth
// ──────────────────────────────────────────────────────────────
const Icon = ({ name, size = 14, color = "currentColor", style }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
              stroke: color, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", style };
  const paths = {
    dashboard:  <><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>,
    payroll:    <><path d="M3 8h18M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8M3 8V6a2 2 0 012-2h14a2 2 0 012 2v2"/><circle cx="12" cy="14" r="2.5"/></>,
    employees:  <><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15 15c2.5 0 4.5 1.5 4.5 4"/></>,
    user:       <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>,
    calendar:   <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
    ai:         <><circle cx="12" cy="12" r="3"/><path d="M12 5v2M12 17v2M5 12h2M17 12h2M7.05 7.05l1.4 1.4M15.55 15.55l1.4 1.4M7.05 16.95l1.4-1.4M15.55 8.45l1.4-1.4"/></>,
    sparkle:    <><path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z"/><path d="M19 3l.5 2 2 .5-2 .5L19 8l-.5-2-2-.5 2-.5L19 3z"/></>,
    alert:      <><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86 2.18 18a2 2 0 001.74 3h16.16a2 2 0 001.74-3L13.7 3.86a2 2 0 00-3.4 0z"/></>,
    payslip:    <><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
    file:       <><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/></>,
    chart:      <><path d="M3 3v18h18"/><path d="M7 16l4-5 3 3 5-7"/></>,
    report:     <><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 13l2 2 4-4"/></>,
    shield:     <><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></>,
    settings:   <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.4 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.4 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.9.4l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.4-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.4-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.4H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.4l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.4 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></>,
    log:        <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h6"/></>,
    search:     <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
    bell:       <><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 004 0"/></>,
    grid:       <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
    plus:       <><path d="M12 5v14M5 12h14"/></>,
    download:   <><path d="M12 4v12M6 12l6 6 6-6M4 20h16"/></>,
    upload:     <><path d="M12 20V8M6 12l6-6 6 6M4 4h16"/></>,
    filter:     <><path d="M3 5h18l-7 9v6l-4-2v-4z"/></>,
    sort:       <><path d="M7 4v16M3 8l4-4 4 4M17 20V4M21 16l-4 4-4-4"/></>,
    check:      <><path d="M5 12l5 5 9-10"/></>,
    x:          <><path d="M6 6l12 12M18 6L6 18"/></>,
    chevron:    <><path d="M9 6l6 6-6 6"/></>,
    chevDown:   <><path d="M6 9l6 6 6-6"/></>,
    arrowUp:    <><path d="M12 19V5M5 12l7-7 7 7"/></>,
    arrowDown:  <><path d="M12 5v14M5 12l7 7 7-7"/></>,
    arrowRight: <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    eye:        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></>,
    edit:       <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4z"/></>,
    more:       <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    play:       <><path d="M5 3l14 9-14 9z"/></>,
    lock:       <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>,
    globe:      <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></>,
    building:   <><rect x="4" y="2" width="16" height="20" rx="1.5"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/></>,
    coins:      <><circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/><path d="M9 6v6M6 9h6"/></>,
    bank:       <><path d="M3 9l9-6 9 6M4 9v10M20 9v10M3 21h18M8 13v4M12 13v4M16 13v4"/></>,
    spark2:     <><path d="M9 18l3-13 3 13M6 14h12"/></>,
    moon:       <><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></>,
    send:       <><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></>,
    mic:        <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 19v3"/></>,
    sun:        <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.4 1.4M17.66 17.66l1.4 1.4M2 12h2M20 12h2M4.93 19.07l1.4-1.4M17.66 6.34l1.4-1.4"/></>,
    clock:      <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    fingerprint:<><path d="M12 3a8 8 0 018 8v3M4 11a8 8 0 014.5-7.2"/><path d="M8 21c-1-1-2-3.5-2-7M16 21c1.5-2 2.5-5 2.5-8M12 7a4 4 0 014 4v2M12 11v6"/></>,
    cpu:        <><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9zM5 9h-2M5 15h-2M19 9h2M19 15h2M9 5v-2M15 5v-2M9 19v2M15 19v2"/></>,
    home:       <><path d="M3 12l9-9 9 9M5 10v10h14V10"/></>,
    flame:      <><path d="M12 22c-4 0-7-3-7-7 0-3 2-5 3-7 1 2 3 1 3-2 0-1.5 0-3 1-4 1 2 8 5 8 13 0 4-3 7-8 7z"/></>,
  };
  if (!paths[name]) console.warn(`Icon: unknown name "${name}"`);
  return <svg {...p}>{paths[name] || null}</svg>;
};

// ──────────────────────────────────────────────────────────────
// Sparkline
// ──────────────────────────────────────────────────────────────
const Sparkline = ({ data, color = "#10B981", height = 32, width = 120, fill = true, lineWidth = 1.5 }) => {
  if (!data || !data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, height - 2 - ((v - min) / range) * (height - 4)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(2) + "," + p[1].toFixed(2)).join(" ");
  const fillD = d + ` L${width},${height} L0,${height} Z`;
  const id = "sg-" + Math.abs(data.reduce((a, b) => a + b, 0)).toFixed(0) + "-" + color.slice(1);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && <path d={fillD} fill={`url(#${id})`}/>}
      <path d={d} fill="none" stroke={color} strokeWidth={lineWidth} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.5" fill={color}/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="5" fill={color} opacity="0.2"/>
    </svg>
  );
};

// ──────────────────────────────────────────────────────────────
// Bar chart (vertical bars)
// ──────────────────────────────────────────────────────────────
const BarChart = ({ data, height = 160, color = "#10B981", showLabels = true, valueFormat = (v) => v }) => {
  if (!data || !data.length) return null;
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height, padding: "8px 0" }}>
      {data.map((d, i) => {
        const h = (d.v / max) * (height - 28);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--text-muted)" }}>{valueFormat(d.v)}</div>
            <div style={{
              width: "100%", maxWidth: 36, height: h,
              background: `linear-gradient(180deg, ${color}, ${color}40)`,
              borderRadius: "4px 4px 2px 2px",
              boxShadow: `0 0 8px ${color}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
              transition: "height 600ms cubic-bezier(.4,0,.2,1)",
              position: "relative",
            }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.25), transparent 30%)", borderRadius: "inherit", pointerEvents: "none" }}/>
            </div>
            {showLabels && <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.m || d.label}</div>}
          </div>
        );
      })}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Stacked bar chart (e.g. anomaly history)
// ──────────────────────────────────────────────────────────────
const StackedBars = ({ data, keys, height = 140, showLabels = true }) => {
  const max = Math.max(...data.map(d => keys.reduce((a, k) => a + (d[k.key] || 0), 0))) || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, padding: "8px 0" }}>
      {data.map((d, i) => {
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
            <div style={{ width: "100%", maxWidth: 28, display: "flex", flexDirection: "column-reverse", borderRadius: "4px 4px 2px 2px", overflow: "hidden" }}>
              {keys.map((k, j) => {
                const v = d[k.key] || 0;
                const h = (v / max) * (height - 24);
                if (!v) return null;
                return <div key={j} style={{ height: h, background: k.color, opacity: 0.85 }} title={`${k.label}: ${v}`}/>;
              })}
            </div>
            {showLabels && <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.m}</div>}
          </div>
        );
      })}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Donut/ring
// ──────────────────────────────────────────────────────────────
const Donut = ({ segments, size = 140, thickness = 18, centerLabel, centerValue }) => {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--inset-4)" strokeWidth={thickness}/>
        {segments.map((s, i) => {
          const len = (s.value / total) * C;
          const arc = <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={s.color} strokeWidth={thickness} strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-offset} strokeLinecap="butt"
            style={{ transition: "all 600ms cubic-bezier(.4,0,.2,1)" }}/>;
          offset += len;
          return arc;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        {centerValue && <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{centerValue}</div>}
        {centerLabel && <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>{centerLabel}</div>}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Avatar
// ──────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 26, hue }) => {
  const safeName = name || "?";
  const h = hue ?? avatarHueFor(safeName);
  return (
    <div className="row-avatar" style={{
      width: size, height: size, fontSize: Math.round(size * 0.36),
      background: `linear-gradient(135deg, hsl(${h}, 60%, 55%), hsl(${(h + 40) % 360}, 60%, 40%))`,
      boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 2px 6px hsla(${h}, 60%, 40%, 0.3)`,
    }}>{initials(safeName)}</div>
  );
};

// ──────────────────────────────────────────────────────────────
// Status chip from string
// ──────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const map = {
    "Paid":        { cls: "ok",     dot: true },
    "In Review":   { cls: "info",   dot: true },
    "Pending":     { cls: "warn",   dot: true },
    "Approved":    { cls: "ok",     dot: true },
    "Rejected":    { cls: "danger", dot: true },
    "Active":      { cls: "ok",     dot: true },
    "Inactive":    { cls: "",       dot: true },
    "On Leave":    { cls: "warn",   dot: true },
    "Notice":      { cls: "danger", dot: true },
    "Done":        { cls: "ok",     dot: false },
    "Draft":       { cls: "",       dot: true },
    "Processing":  { cls: "info",   dot: true },
    "Open":        { cls: "warn",   dot: true },
    "open":        { cls: "warn",   dot: true },
    "Closed":      { cls: "",       dot: false },
    "closed":      { cls: "",       dot: false },
    "Cancelled":   { cls: "danger", dot: false },
    "Failed":      { cls: "danger", dot: true },
  };
  const m = map[status] || { cls: "", dot: true };
  return <span className={`chip ${m.cls}`}>{m.dot && <span className="dot"/>}{status}</span>;
};

// ──────────────────────────────────────────────────────────────
// File icon for reports
// ──────────────────────────────────────────────────────────────
const FileIcon = ({ kind, size = 32 }) => {
  const colors = {
    PDF:  { bg: "rgba(244,63,94,0.14)", fg: "#FCA5B0", label: "PDF" },
    XLSX: { bg: "rgba(16,185,129,0.14)", fg: "#34D399", label: "XLS" },
    CSV:  { bg: "rgba(96,165,250,0.14)", fg: "#93C5FD", label: "CSV" },
    ZIP:  { bg: "rgba(167,139,250,0.14)", fg: "#C4B5FD", label: "ZIP" },
  };
  const c = colors[kind] || colors.PDF;
  return (
    <div style={{
      width: size, height: size, borderRadius: 7,
      background: c.bg, color: c.fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 9, fontWeight: 700, letterSpacing: "0.05em",
      border: `1px solid ${c.fg}30`,
      flexShrink: 0,
    }}>{c.label}</div>
  );
};

Object.assign(window, { Icon, Sparkline, BarChart, StackedBars, Donut, Avatar, StatusChip, FileIcon });
