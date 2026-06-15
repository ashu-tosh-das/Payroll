// ──────────────────────────────────────────────────────────────
// Global interactions — toasts, modals, click delegation
// Makes every button feel "wired" without a real backend.
// ──────────────────────────────────────────────────────────────
// Toast manager — uses a global event bus pattern
const ToastBus = {
  listeners: [],
  push(toast) {
    this.listeners.forEach(fn => fn(toast));
  },
  subscribe(fn) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(f => f !== fn); };
  },
};

// Public toast helper
window.toast = (text, opts = {}) => {
  ToastBus.push({
    id: Math.random().toString(36).slice(2),
    text,
    icon: opts.icon || "check",
    tone: opts.tone || "ok",
    sub: opts.sub,
    duration: opts.duration ?? 3200,
  });
};

// ──────────────────────────────────────────────────────────────
// Toast renderer
// ──────────────────────────────────────────────────────────────
const ToastHost = () => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  useEffect(() => {
    const unsub = ToastBus.subscribe(t => {
      setToasts(prev => [...prev, t]);
      timersRef.current[t.id] = setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id));
        delete timersRef.current[t.id];
      }, t.duration);
    });
    return () => {
      unsub();
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  const toneMap = {
    ok:     { color: "#34D399", bg: "rgba(16,185,129,0.14)",  border: "rgba(16,185,129,0.30)" },
    info:   { color: "#93C5FD", bg: "rgba(96,165,250,0.14)",  border: "rgba(96,165,250,0.30)" },
    warn:   { color: "#FCD34D", bg: "rgba(245,158,11,0.14)",  border: "rgba(245,158,11,0.30)" },
    danger: { color: "#FCA5B0", bg: "rgba(244,63,94,0.14)",   border: "rgba(244,63,94,0.30)" },
    ai:     { color: "#34D399", bg: "linear-gradient(160deg, rgba(16,185,129,0.18), rgba(167,139,250,0.10))",  border: "rgba(16,185,129,0.35)" },
  };

  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      zIndex: 2147483645,
      display: "flex", flexDirection: "column", gap: 8,
      pointerEvents: "none",
    }}>
      {toasts.map(t => {
        const tone = toneMap[t.tone] || toneMap.ok;
        return (
          <div key={t.id} style={{
            pointerEvents: "auto",
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px 10px 12px",
            borderRadius: 10,
            background: tone.bg,
            border: `1px solid ${tone.border}`,
            backdropFilter: "blur(20px) saturate(160%)",
            color: "var(--text)",
            fontSize: 12.5,
            minWidth: 280, maxWidth: 480,
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            animation: "toastIn 280ms cubic-bezier(.4,0,.2,1)",
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: `${tone.color}20`,
              color: tone.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon name={t.icon} size={13}/>
            </div>
            <div style={{ flex: 1, lineHeight: 1.35 }}>
              <div style={{ fontWeight: 500 }}>{t.text}</div>
              {t.sub && <div className="muted fs-xs" style={{ marginTop: 2 }}>{t.sub}</div>}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Generic modal (used by Add buttons)
// ──────────────────────────────────────────────────────────────
const ModalBus = { listeners: [] };
window.openModal = (config) => {
  ModalBus.listeners.forEach(fn => fn(config));
};

const ModalHost = () => {
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const fn = (config) => setModal(config);
    ModalBus.listeners.push(fn);
    return () => { ModalBus.listeners = ModalBus.listeners.filter(f => f !== fn); };
  }, []);

  if (!modal) return null;
  const close = () => setModal(null);

  return (
    <>
      <div className="drawer-mask" onClick={close} style={{ position: "fixed", zIndex: 100 }}/>
      <div className="glass-strong" style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: modal.width || 520, maxHeight: "80vh", overflowY: "auto",
        padding: 0,
        zIndex: 101,
        animation: "modalIn 280ms cubic-bezier(.4,0,.2,1)",
      }}>
        <div className="row between" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{modal.title}</div>
            {modal.subtitle && <div className="muted fs-xs">{modal.subtitle}</div>}
          </div>
          <button className="iconbtn" onClick={close}><Icon name="x"/></button>
        </div>
        <div style={{ padding: 18 }}>{modal.body}</div>
        {modal.footer !== false && (
          <div className="row between" style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.2)" }}>
            <button className="btn ghost sm" onClick={close}>Cancel</button>
            <button className="btn primary sm" onClick={() => { modal.onConfirm?.(); close(); }}>
              <Icon name="check"/>{modal.confirmText || "Confirm"}
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
};

// ──────────────────────────────────────────────────────────────
// Notifications popover (anchored to bell button)
// ──────────────────────────────────────────────────────────────
const NotificationsPopover = ({ open, anchorRef, onClose, onUnreadChange }) => {
  const [readIds, setReadIds] = useState(new Set());
  if (!open || !anchorRef?.current) return null;
  const r = anchorRef.current.getBoundingClientRect();
  const notifList = Array.isArray(window.NOTIFICATIONS) ? window.NOTIFICATIONS : (Array.isArray(NOTIFICATIONS) ? NOTIFICATIONS : []);
  const unread = notifList.filter(n => !readIds.has(n.id)).length;
  const panelRight = Math.max(8, window.innerWidth - r.right);

  const markRead = (id) => {
    setReadIds(prev => {
      const next = new Set(prev); next.add(id);
      onUnreadChange?.(notifList.filter(n => !next.has(n.id)).length);
      return next;
    });
  };
  const markAllRead = () => {
    const allIds = new Set(notifList.map(n => n.id));
    setReadIds(allIds);
    onUnreadChange?.(0);
    window.toast("All notifications marked read", { icon: "check" });
  };

  const content = (
    <>
      <style>{`@keyframes popIn{from{opacity:0;transform:translateY(-8px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}`}</style>
      {/* Full-screen dimming backdrop — rendered at body level */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.45)",
      }}/>
      {/* Panel — rendered at body level, always on top */}
      <div style={{
        position: "fixed",
        top: r.bottom + 8,
        right: panelRight,
        width: 368,
        zIndex: 9999,
        borderRadius: 14,
        overflow: "hidden",
        background: "#161B28",
        border: "1px solid rgba(255,255,255,0.13)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.75), 0 8px 24px rgba(0,0,0,0.50)",
        animation: "popIn 200ms cubic-bezier(.4,0,.2,1)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "#1C2233", gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#E6EDF3" }}>Notifications</span>
            {unread > 0 && (
              <span style={{
                fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
                background: "rgba(16,185,129,0.18)", color: "#34D399",
                border: "1px solid rgba(16,185,129,0.30)",
              }}>{unread} new</span>
            )}
            {unread === 0 && (
              <span style={{ fontSize: 11, color: "#484F58" }}>All caught up</span>
            )}
          </div>
          <button className="btn ghost sm" disabled={unread === 0}
            style={{ opacity: unread === 0 ? 0.4 : 1, whiteSpace: "nowrap", flexShrink: 0 }}
            onClick={markAllRead}>Mark all read</button>
        </div>

        {/* Notification list */}
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {notifList.map(n => {
            const iconColor = n.type === "alert" ? "#FCA5B0" : n.type === "info" ? "#93C5FD" : "#34D399";
            const isRead = readIds.has(n.id);
            return (
              <div key={n.id} onClick={() => markRead(n.id)} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "11px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                cursor: "default",
                opacity: isRead ? 0.45 : 1,
                background: isRead ? "#161B28" : "rgba(16,185,129,0.04)",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: `${iconColor}18`, color: iconColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: 1,
                }}>
                  <Icon name={n.type === "alert" ? "alert" : n.type === "info" ? "bell" : "check"} size={13}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#E6EDF3", lineHeight: 1.45 }}>{n.text}</div>
                  <div style={{ fontSize: 10.5, color: "#484F58", marginTop: 3 }}>{n.at}</div>
                </div>
                {!isRead && (
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 6,
                    background: "#6366F1", boxShadow: "0 0 8px rgba(99,102,241,0.7)",
                  }}/>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "10px 14px", textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "#1C2233",
        }}>
          <button className="btn ghost sm" onClick={onClose} style={{ color: "#8B949E" }}>
            View all notifications<Icon name="arrowRight" size={11}/>
          </button>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(content, document.body);
};

// ──────────────────────────────────────────────────────────────
// Click delegation: any .btn / .iconbtn without its own onClick
// will trigger a contextual toast based on its text content.
// We detect React-attached onClick via the __reactProps$… key.
// ──────────────────────────────────────────────────────────────
function hasReactOnClick(node) {
  if (!node || !node.nodeType) return false;
  for (const key in node) {
    if (key.startsWith("__reactProps$") && node[key] && node[key].onClick) {
      return true;
    }
  }
  return false;
}

const useGlobalClickFallback = () => {
  useEffect(() => {
    const handler = (e) => {
      const btn = e.target.closest(".btn, .iconbtn");
      if (!btn) return;
      if (btn.closest(".twk-panel")) return;
      if (btn.dataset.fallback === "no") return;
      if (hasReactOnClick(btn)) return; // real handler wired

      const label = (btn.textContent || "").trim().slice(0, 60);
      if (!label) {
        // icon-only button without text — generic toast
        window.toast("Action triggered", { icon: "check" });
        return;
      }
      const skipExact = ["Prev", "Next", "1 / 9", "Cancel"];
      if (skipExact.includes(label)) return;

      const action = inferAction(label);
      window.toast(action.text, { icon: action.icon, tone: action.tone, sub: action.sub });
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
};

// Map button labels → meaningful toast messages
function inferAction(label) {
  const L = label.toLowerCase();
  // Export / download
  if (L.includes("export") || L.includes("download")) {
    return { text: `Preparing ${label.replace(/^(export|download)/i, "").trim() || "export"}…`, icon: "download", tone: "info",
             sub: "File will be ready in a few seconds" };
  }
  if (L.includes("upload") || L.includes("import")) {
    return { text: `${label} — opening file picker`, icon: "upload", tone: "info" };
  }
  if (L.includes("schedule")) {
    return { text: "Schedule saved", icon: "clock", tone: "ok", sub: "Next run: Nov 30, 06:00 IST" };
  }
  if (L.includes("preview")) return { text: `Generating preview…`, icon: "eye", tone: "info" };
  if (L.includes("e-mail") || L.includes("email") || L.includes("send")) {
    return { text: `Queued for delivery`, icon: "send", tone: "ok", sub: "Recipients notified via email" };
  }
  if (L.includes("approve")) return { text: `Approved`, icon: "check", tone: "ok", sub: "Audit log updated" };
  if (L.includes("reject") || L.includes("decline")) return { text: `Rejected`, icon: "x", tone: "danger" };
  if (L.includes("dismiss")) return { text: `Dismissed`, icon: "x", tone: "info" };
  if (L.includes("hold")) return { text: "Held for review", icon: "alert", tone: "warn", sub: "Manager will be notified" };
  if (L.includes("file") && L.includes("auto")) return { text: "Auto-filing initiated", icon: "shield", tone: "ok", sub: "All Nov returns queued" };
  if (L.includes("generate") || L.includes("build") || L.includes("create")) {
    return { text: `${label} — done`, icon: "sparkle", tone: "ai", sub: "Document ready in your library" };
  }
  if (L.includes("delete") || L.includes("remove")) {
    return { text: `${label} — action stubbed`, icon: "alert", tone: "warn", sub: "Confirm dialog would appear in production" };
  }
  if (L.includes("edit") || L.includes("rename")) {
    return { text: `${label} — opening editor`, icon: "edit", tone: "info" };
  }
  if (L.includes("filter")) return { text: "Filter panel opened", icon: "filter", tone: "info" };
  if (L.includes("sync") || L.includes("verify") || L.includes("scan")) {
    return { text: `${label} — running`, icon: "shield", tone: "ai", sub: "Atlas is processing…" };
  }
  if (L.includes("new") || L.includes("add")) return { text: `${label}`, icon: "plus", tone: "info", sub: "Form would open here" };
  if (L.includes("continue") || L.includes("play")) {
    return { text: `${label}`, icon: "play", tone: "ai", sub: "Step 4 of 6 — awaiting HR verification" };
  }
  if (L.includes("history")) return { text: "Loading history…", icon: "log", tone: "info" };
  if (L.includes("tools")) return { text: "Atlas tools panel", icon: "cpu", tone: "ai" };
  if (L.includes("view") || L.includes("open")) return { text: `${label}`, icon: "eye", tone: "info" };
  if (L.includes("mark")) return { text: `${label}`, icon: "check", tone: "ok" };
  if (L.includes("request info")) return { text: "Info request sent to employee", icon: "send", tone: "info" };
  if (L.includes("training")) return { text: "Atlas training studio", icon: "cpu", tone: "ai", sub: "218 KB articles indexed" };
  if (L.includes("faq")) return { text: "FAQ library", icon: "report", tone: "info" };
  if (L.includes("raise") || L.includes("ticket")) return { text: "New ticket — form opening", icon: "plus", tone: "info" };
  if (L.includes("rules")) return { text: "Policy rules editor", icon: "edit", tone: "info" };
  if (L.includes("yes") || L.includes("escalate")) return { text: "Escalation sent", icon: "alert", tone: "warn", sub: "Notified CFO office" };
  // Default
  return { text: label, icon: "check", tone: "ok" };
}

Object.assign(window, { ToastHost, ModalHost, NotificationsPopover, useGlobalClickFallback });
