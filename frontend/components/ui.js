// ── Shared UI primitives ──────────────────────────────────────
const { useState, useEffect, useRef, useCallback } = React;

// ── Icon ─────────────────────────────────────────────────────
const Icon = ({ name, size = 13, color, className = '', style: ext = {} }) => (
  <i
    className={`fa-solid fa-${name} ${className}`}
    aria-hidden="true"
    style={{ fontSize: size, color, lineHeight: 1, flexShrink: 0, ...ext }}
  />
);

// ── Avatar ────────────────────────────────────────────────────
const Avatar = ({ name, src, size = 'md', status, style: ext = {} }) => {
  const sizeClass = `avatar-${size}`;
  const bg = avatarColor(name || '');
  const initials = getInitials(name || '?');
  return (
    <div className={`avatar ${sizeClass}`} style={{ background: bg, ...ext }}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : initials}
      {status && <span className={`avatar-status ${status}`}/>}
    </div>
  );
};

// ── Status Chip ───────────────────────────────────────────────
const STATUS_MAP = {
  active:     { label: 'Active',     cls: 'chip-active' },
  inactive:   { label: 'Inactive',   cls: 'chip-inactive' },
  leave:      { label: 'On Leave',   cls: 'chip-leave' },
  pending:    { label: 'Pending',    cls: 'chip-pending' },
  processing: { label: 'Processing', cls: 'chip-processing' },
  paid:       { label: 'Paid',       cls: 'chip-paid' },
  approved:   { label: 'Approved',   cls: 'chip-approved' },
  rejected:   { label: 'Rejected',   cls: 'chip-rejected' },
  current:    { label: 'Current',    cls: 'chip-info' },
  draft:      { label: 'Draft',      cls: 'chip-default' },
};

const StatusChip = ({ status, label }) => {
  const cfg = STATUS_MAP[status] || { label: label || status, cls: 'chip-default' };
  return <span className={`chip ${cfg.cls}`}>{label || cfg.label}</span>;
};

// ── Mini Metric card ──────────────────────────────────────────
const MiniMetric = ({ label, value, delta, deltaDir = 'flat', icon, iconBg, iconColor }) => (
  <div className="metric-card">
    <div className="metric-header">
      <div>
        <div className="metric-label">{label}</div>
      </div>
      {icon && (
        <div className="metric-icon" style={{ background: iconBg || 'var(--accent-dim)', color: iconColor || 'var(--accent-light)' }}>
          <Icon name={icon} size={15}/>
        </div>
      )}
    </div>
    <div className="metric-value">{value}</div>
    {delta && (
      <div className={`metric-delta ${deltaDir}`}>
        {deltaDir === 'up'   && <Icon name="arrow-up"   size={9}/>}
        {deltaDir === 'down' && <Icon name="arrow-down" size={9}/>}
        {delta}
      </div>
    )}
  </div>
);

// ── Modal ─────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal-dialog modal-${size}`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="icon-btn" onClick={onClose} style={{ width: 30, height: 30, marginRight: -4 }}>
            <Icon name="xmark" size={14}/>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// ── Toast system ──────────────────────────────────────────────
const TOAST_ICONS = {
  success: 'circle-check',
  error:   'circle-xmark',
  warn:    'triangle-exclamation',
  info:    'circle-info',
};

const ToastHost = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    let id = 0;
    const handler = (e) => {
      const t = { id: ++id, ...e.detail };
      setToasts(prev => [...prev, t]);
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3400);
    };
    document.addEventListener('app:toast', handler);
    return () => document.removeEventListener('app:toast', handler);
  }, []);

  if (!toasts.length) return null;
  return (
    <div className="toast-host">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || 'info'}`}>
          <div className="toast-icon">
            <Icon name={TOAST_ICONS[t.type] || 'circle-info'} size={12}/>
          </div>
          <div className="toast-content">
            <div className="toast-msg">{t.msg}</div>
            {t.sub && <div className="toast-sub">{t.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

// Global helper to fire toasts
window.showToast = (msg, type = 'info', sub = '') => {
  document.dispatchEvent(new CustomEvent('app:toast', { detail: { msg, type, sub } }));
};

// ── Spinner ───────────────────────────────────────────────────
const Spinner = ({ size = '' }) => <span className={`spinner ${size ? 'spinner-' + size : ''}`}/>;

// ── Empty State ───────────────────────────────────────────────
const EmptyState = ({ icon = 'inbox', title = 'Nothing here', sub = '', action }) => (
  <div className="empty-state">
    <div className="empty-icon"><Icon name={icon} size={38} color="var(--text-muted)"/></div>
    <div className="empty-title">{title}</div>
    {sub && <div className="empty-sub">{sub}</div>}
    {action}
  </div>
);

// ── Confirm dialog (lightweight) ─────────────────────────────
const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, danger = false }) => (
  <Modal open={open} onClose={onCancel} title={title} size="sm"
    footer={
      <>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
          Confirm
        </button>
      </>
    }>
    <p style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.6 }}>{message}</p>
  </Modal>
);

// ── Toggle (controlled) ───────────────────────────────────────
const Toggle = ({ checked, onChange, id }) => (
  <label className="toggle" htmlFor={id}>
    <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)}/>
    <span className="toggle-track"/>
    <span className="toggle-thumb"/>
  </label>
);

// ── Progress bar ──────────────────────────────────────────────
const ProgressBar = ({ value, max = 100, color = 'var(--accent)' }) => (
  <div className="progress-bar">
    <div className="progress-fill" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }}/>
  </div>
);

// ── Step indicator ────────────────────────────────────────────
const StepIndicator = ({ steps, current }) => (
  <div className="steps">
    {steps.map((s, i) => (
      <React.Fragment key={s}>
        <div className={`step ${i < current ? 'done' : i === current ? 'active' : ''}`}>
          <div className="step-circle">
            {i < current ? <Icon name="check" size={10}/> : i + 1}
          </div>
          <span className="step-label">{s}</span>
        </div>
        {i < steps.length - 1 && <div className={`step-connector ${i < current ? 'done' : ''}`}/>}
      </React.Fragment>
    ))}
  </div>
);

// ── Exports ───────────────────────────────────────────────────
Object.assign(window, {
  Icon, Avatar, StatusChip, MiniMetric, Modal, ToastHost,
  Spinner, EmptyState, ConfirmDialog, Toggle, ProgressBar, StepIndicator,
});
