// ── Login page — no self-signup; credentials managed by Super Admin ──
const LoginPage = ({ onLogin }) => {
  const [email,    setEmail]    = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [error,    setError]    = React.useState('');
  const [loading,  setLoading]  = React.useState(false);
  const [showDemo, setShowDemo] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = authLogin(email.trim(), password);
      setLoading(false);
      if (user) {
        authSaveSession(user);
        onLogin(user);
      } else {
        setError('Invalid email or password. Contact your administrator for access.');
      }
    }, 600);
  };

  const fillDemo = (email, pw) => {
    setEmail(email);
    setPassword(pw);
    setError('');
    setShowDemo(false);
  };

  const demoAccounts = [
    { role: 'Super Admin',    email: 'admin@sourceone.in',    pw: 'Admin@123',    color: '#6366F1' },
    { role: 'Payroll Admin',  email: 'payroll@sourceone.in',  pw: 'Payroll@123',  color: '#10B981' },
    { role: 'HR Manager',     email: 'hr@sourceone.in',       pw: 'Hr@1234',      color: '#F59E0B' },
    { role: 'Finance Viewer', email: 'finance@sourceone.in',  pw: 'Finance@123',  color: '#3B82F6' },
    { role: 'Read Only',      email: 'readonly@sourceone.in', pw: 'Read@1234',    color: '#8B949E' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-1)', padding: '24px',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #6366F1, #818CF8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 32px rgba(99,102,241,0.35)',
            fontSize: 22, fontWeight: 800, color: '#fff',
          }}>HF</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Source One Payroll
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Sign in to your portal
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border-low)',
          borderRadius: 16,
          padding: '32px 28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        }}>
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.05em' }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <Icon name="envelope" size={12} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                }}/>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="your@sourceone.in"
                  autoComplete="email"
                  autoFocus
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--bg-3)', border: '1px solid var(--border-mid)',
                    borderRadius: 8, padding: '10px 12px 10px 34px',
                    color: 'var(--text-primary)', fontSize: 13,
                    outline: 'none', transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366F1'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.05em' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <Icon name="lock" size={12} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                }}/>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--bg-3)', border: '1px solid var(--border-mid)',
                    borderRadius: 8, padding: '10px 38px 10px 34px',
                    color: 'var(--text-primary)', fontSize: 13,
                    outline: 'none', transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366F1'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4,
                  }}>
                  <Icon name={showPass ? 'eye-slash' : 'eye'} size={12}/>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 8, padding: '10px 12px', marginBottom: 16,
                fontSize: 12, color: '#F87171', display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <Icon name="circle-exclamation" size={12} style={{ marginTop: 1, flexShrink: 0 }}/>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '11px 16px', borderRadius: 8,
                background: loading ? 'var(--bg-4)' : 'linear-gradient(135deg, #6366F1, #818CF8)',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
              }}>
              {loading && (
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  animation: 'spin 600ms linear infinite',
                }}/>
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* No-signup notice */}
          <div style={{
            marginTop: 20, padding: '10px 12px',
            background: 'var(--bg-3)', borderRadius: 8,
            fontSize: 12, color: 'var(--text-muted)', textAlign: 'center',
            lineHeight: 1.5,
          }}>
            <Icon name="shield-halved" size={11}/>{' '}
            Access is managed by your administrator.{' '}
            <span style={{ color: 'var(--text-secondary)' }}>No self-registration available.</span>
          </div>
        </div>

        {/* Demo credentials toggle */}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button onClick={() => setShowDemo(v => !v)}
            style={{
              background: 'none', border: '1px solid var(--border-low)',
              borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
              fontSize: 12, color: 'var(--text-muted)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
            <Icon name="key" size={10}/>
            {showDemo ? 'Hide' : 'Show'} demo credentials
          </button>
        </div>

        {showDemo && (
          <div style={{
            marginTop: 10, background: 'var(--bg-2)',
            border: '1px solid var(--border-low)', borderRadius: 12,
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
              marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Demo Accounts
            </div>
            {demoAccounts.map(a => (
              <button key={a.role} onClick={() => fillDemo(a.email, a.pw)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', background: 'none',
                  border: '1px solid transparent', borderRadius: 8,
                  padding: '8px 10px', cursor: 'pointer', marginBottom: 4,
                  transition: 'background 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: a.color, flexShrink: 0,
                }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {a.role}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.email}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)',
                  fontFamily: 'monospace', background: 'var(--bg-4)',
                  padding: '2px 6px', borderRadius: 4 }}>
                  {a.pw}
                </div>
              </button>
            ))}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8,
              paddingTop: 8, borderTop: '1px solid var(--border-low)' }}>
              Click any row to auto-fill credentials
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>
          Source One Payroll Cloud · v2.1
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { LoginPage });
