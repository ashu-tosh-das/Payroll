// AI Copilot — chat

const SUGGESTED = [
  { icon: "coins",  text: "What was last month's total payroll cost?" },
  { icon: "alert",  text: "Why is Akshay Sharma's OT flagged?" },
  { icon: "chart",  text: "Forecast Q1 FY26 payroll cost" },
  { icon: "user",   text: "Who joined Engineering this quarter?" },
  { icon: "shield", text: "Run pre-payroll compliance check for Nov" },
  { icon: "report", text: "Generate Form 16 for SO-1187" },
];

const SAMPLE_THREAD = [
  {
    role: "user",
    text: "What's our exposure if we delay Nov payroll by 3 days?",
    ts: Date.now() - 1000 * 60 * 8,
  },
  {
    role: "atlas",
    text: "Delaying Nov payroll past Nov 28 has 3 material implications for Source One:",
    ts: Date.now() - 1000 * 60 * 7,
    blocks: [
      {
        kind: "callouts",
        items: [
          { icon: "alert",   tone: "danger",  title: "Payment of Wages Act, 1936", body: "Wages of ₹4.82 Cr must be paid by Dec 7 (7 days from cycle end). Beyond that = statutory violation, ₹7,500 + 5×excess delay penalty." },
          { icon: "coins",   tone: "warn",    title: "TDS deposit (Section 200)",   body: "TDS of ₹64.3L is due by Dec 7 regardless. Late deposit attracts 1.5%/month interest." },
          { icon: "user",    tone: "info",    title: "Employee impact",             body: "EMIs for ~89 employees are scheduled Nov 28–30. Suggest disbursing in priority tranche if delay is unavoidable." },
        ],
      },
      {
        kind: "summary",
        text: "Recommendation: keep Nov 28 pay date. The 3 anomalies under review only hold ₹52,800 — process the remaining 246 payslips and settle the held entries by Dec 3.",
      },
    ],
  },
];

// Format a timestamp as relative time
const fmtRelTime = (ts) => {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 10) return "just now";
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// Derive 2-3 follow-up suggestion chips from user message keywords
const deriveFollowUps = (text) => {
  const t = text.toLowerCase();
  if (t.includes("forecast") || t.includes("q1") || t.includes("project")) {
    return ["Break down by department", "Export forecast report", "Compare vs last quarter"];
  }
  if (t.includes("anomal") || t.includes("flag") || t.includes("ot") || t.includes("overtime")) {
    return ["Show all flagged entries", "Auto-approve low-risk flags", "Explain PF anomaly"];
  }
  if (t.includes("compliance") || t.includes("form 16") || t.includes("tds")) {
    return ["Generate compliance report", "List pending filings", "Show TDS summary"];
  }
  if (t.includes("payroll") || t.includes("cost") || t.includes("delay")) {
    return ["Show payroll breakdown", "List held payslips", "Run compliance check"];
  }
  if (t.includes("join") || t.includes("headcount") || t.includes("engineer") || t.includes("department")) {
    return ["Show headcount trend", "Filter by department", "Export employee list"];
  }
  return ["Drill down further", "Generate a report", "Show related anomalies"];
};

const Copilot = () => {
  const [thread, setThread] = useState(SAMPLE_THREAD);
  const [input, setInput] = useState("");
  const [restoredFromSession, setRestoredFromSession] = useState(false);
  const endRef = useRef(null);

  // Load thread from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('atlas_thread');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setThread(parsed);
          setRestoredFromSession(true);
        }
      }
    } catch(e) {}
  }, []);

  // Save thread to sessionStorage whenever it changes
  useEffect(() => {
    try { sessionStorage.setItem('atlas_thread', JSON.stringify(thread)); } catch(e) {}
  }, [thread]);

  // Scroll to bottom whenever thread updates
  useEffect(() => {
    if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight;
  }, [thread]);

  const handleNewConversation = () => {
    window.openModal({
      title: "Start new conversation?",
      body: "This will clear the current chat history.",
      confirmText: "Clear & restart",
      onConfirm: () => {
        setThread(SAMPLE_THREAD);
        setRestoredFromSession(false);
        sessionStorage.removeItem('atlas_thread');
      },
    });
  };

  const send = (text) => {
    if (!text.trim()) return;
    const now = Date.now();
    setThread(prev => [
      ...prev,
      { role: "user", text, ts: now },
      { role: "atlas", text: "Thinking…", loading: true, ts: now + 100 },
    ]);
    setInput("");
    const followUps = deriveFollowUps(text);
    setTimeout(() => {
      const responseTs = Date.now();
      setThread(prev => [
        ...prev.slice(0, -1),
        {
          role: "atlas",
          ts: responseTs,
          text: `Based on Source One's current data: ${text.includes("forecast") ? "Q1 FY26 payroll is projected at ₹14.71 Cr, +1.4% vs Q4 FY25, driven by 3 confirmed offers in Engineering and the Apr appraisal cycle." : "I've checked the latest payroll snapshot. Let me know if you'd like a deeper drill-down or a specific report."}`,
        },
        {
          role: "suggestions",
          ts: responseTs + 1,
          chips: followUps,
        },
      ]);
    }, 700);
  };

  return (
    <div className="page" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px 24px 6px" }}>
        <PageHead
          title={<>Atlas <span className="chip ok" style={{ marginLeft: 8, verticalAlign: "middle", fontSize: 10 }}><span className="dot"/>v2.4 · ready</span></>}
          subtitle="Your AI co-pilot for payroll, compliance, and people analytics. Trained on Source One's data, GDPR-compliant."
        >
          <button className="btn ghost"><Icon name="cpu"/>Tools</button>
          <button className="btn ghost"><Icon name="log"/>History</button>
          <button className="btn primary" onClick={handleNewConversation}><Icon name="plus"/>New conversation</button>
        </PageHead>
      </div>

      <div ref={endRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 24px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>

          {/* Session restored banner */}
          {restoredFromSession && (
            <div style={{
              margin: "12px 0 4px",
              padding: "8px 14px",
              borderRadius: 10,
              background: "rgba(96,165,250,0.08)",
              border: "1px solid rgba(96,165,250,0.22)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "var(--text-mid)",
            }}>
              <Icon name="clock" size={12} color="#60A5FA"/>
              <span style={{ flex: 1 }}>Conversation restored from last session</span>
              <button
                className="btn ghost sm"
                style={{ fontSize: 11, height: 24 }}
                onClick={handleNewConversation}
              >
                <Icon name="plus" size={11}/>New chat
              </button>
            </div>
          )}

          {thread.map((m, i) => (
            <Message key={i} {...m} onSend={send}/>
          ))}
          <div style={{ height: 24 }}/>
        </div>
      </div>

      {/* Suggestions + input */}
      <div style={{ padding: "10px 24px 18px", borderTop: "1px solid var(--border)", background: "linear-gradient(180deg, rgba(8,12,22,0), rgba(8,12,22,0.6))" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div className="row gap-3" style={{ flexWrap: "wrap", marginBottom: 10 }}>
            {SUGGESTED.slice(0, 4).map(s => (
              <button key={s.text} onClick={() => send(s.text)} className="btn ghost sm" style={{ height: 26, fontSize: 11, color: "var(--text-mid)" }}>
                <Icon name={s.icon} size={11}/>{s.text}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 6, display: "flex", alignItems: "center", gap: 6, background: "var(--inset-4)" }}>
            <input
              className="input"
              style={{ flex: 1, border: 0, background: "transparent", height: 34, fontSize: 13 }}
              placeholder="Ask Atlas anything about payroll, anomalies, compliance…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
            />
            <button className="iconbtn" title="Voice"><Icon name="mic"/></button>
            <button className="iconbtn" title="Tools"><Icon name="cpu"/></button>
            <button className="btn primary" onClick={() => send(input)} disabled={!input.trim()} style={{ opacity: input.trim() ? 1 : 0.5 }}>
              <Icon name="send"/>Send
            </button>
          </div>
          <div className="muted fs-xs" style={{ textAlign: "center", marginTop: 8 }}>
            Atlas may make mistakes · Always verify payroll-affecting actions · <a style={{ color: "var(--accent-bright)" }}>Trust & safety</a>
          </div>
        </div>
      </div>
    </div>
  );
};

const Message = ({ role, text, blocks, loading, ts, chips, onSend }) => {
  const timeLabel = ts ? fmtRelTime(ts) : "";

  if (role === "suggestions") {
    return (
      <div className="row gap-3" style={{ padding: "4px 0 12px", flexWrap: "wrap", paddingLeft: 46 }}>
        {(chips || []).map((chip, i) => (
          <button
            key={i}
            className="btn ghost sm"
            style={{ fontSize: 11, height: 26, color: "var(--text-mid)", borderColor: "rgba(96,165,250,0.25)" }}
            onClick={() => onSend && onSend(chip)}
          >
            <Icon name="sparkle" size={10} color="#60A5FA"/>{chip}
          </button>
        ))}
      </div>
    );
  }

  if (role === "user") {
    return (
      <div className="row gap-4" style={{ padding: "16px 0 4px", justifyContent: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{
            maxWidth: 560, padding: "10px 14px", borderRadius: "14px 14px 4px 14px",
            background: "var(--inset-5)", border: "1px solid var(--border-strong)",
            fontSize: 13, color: "var(--text)", lineHeight: 1.5,
          }}>{text}</div>
          {timeLabel && (
            <span className="muted fs-xs" style={{ fontSize: 10.5, paddingRight: 2 }}>{timeLabel}</span>
          )}
        </div>
        <Avatar name="Priya Kapoor" size={28}/>
      </div>
    );
  }

  return (
    <div className="row gap-4" style={{ padding: "16px 0 4px", alignItems: "flex-start" }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: "linear-gradient(135deg, #10B981, #34D399)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 16px rgba(16,185,129,0.3)",
      }}>
        <Icon name="sparkle" size={14} color="#052E1A"/>
      </div>
      <div style={{ flex: 1, maxWidth: 720 }}>
        <div className="row gap-3 center" style={{ marginBottom: 6 }}>
          <b style={{ fontSize: 12 }}>Atlas</b>
          {!loading && <span className="chip" style={{ fontSize: 9.5 }}>12ms · 142 tokens</span>}
          {timeLabel && !loading && (
            <span className="muted fs-xs" style={{ fontSize: 10.5 }}>{timeLabel}</span>
          )}
        </div>
        {loading ? (
          <div className="row gap-3 center" style={{ color: "var(--text-muted)", fontSize: 12 }}>
            <span className="live-dot"/>{text}
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{text}</div>
            {blocks?.map((b, i) => <Block key={i} block={b}/>)}

            <div className="row gap-3" style={{ marginTop: 10 }}>
              <button
                className="iconbtn"
                style={{ width: 22, height: 22 }}
                title="Copy response"
                onClick={() => {
                  navigator.clipboard.writeText(text).then(() => {
                    window.toast("Copied to clipboard", { icon: "check", tone: "ok" });
                  }).catch(() => {
                    window.toast("Copy failed", { icon: "alert", tone: "warn" });
                  });
                }}
              >
                <Icon name="report" size={10}/>
              </button>
              <button className="iconbtn" style={{ width: 22, height: 22 }} title="Good response"><Icon name="check" size={10}/></button>
              <button className="iconbtn" style={{ width: 22, height: 22 }} title="Bad response"><Icon name="x" size={10}/></button>
              <span className="muted fs-xs" style={{ marginLeft: 4 }}>Sourced from Nov 2025 payroll snapshot · 3 evidence rows</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Block = ({ block }) => {
  if (block.kind === "callouts") {
    return (
      <div className="col gap-4" style={{ marginTop: 10 }}>
        {block.items.map((c, i) => {
          const toneColor = c.tone === "danger" ? "#F43F5E" : c.tone === "warn" ? "#F59E0B" : "#60A5FA";
          return (
            <div key={i} style={{
              padding: 12, borderRadius: 10,
              background: `linear-gradient(180deg, ${toneColor}12, var(--inset-1))`,
              border: `1px solid ${toneColor}33`,
            }}>
              <div className="row gap-3 center" style={{ marginBottom: 4 }}>
                <Icon name={c.icon} size={13} color={toneColor}/>
                <b style={{ fontSize: 12, color: toneColor }}>{c.title}</b>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.5 }}>{c.body}</div>
            </div>
          );
        })}
      </div>
    );
  }
  if (block.kind === "summary") {
    return (
      <div style={{
        marginTop: 10, padding: 12, borderRadius: 10,
        background: "linear-gradient(160deg, rgba(16,185,129,0.10), rgba(16,185,129,0.02))",
        border: "1px solid rgba(16,185,129,0.25)",
        fontSize: 12.5, color: "var(--text)", lineHeight: 1.5,
      }}>
        <div className="row gap-3 center" style={{ marginBottom: 6 }}>
          <Icon name="sparkle" size={11} color="#34D399"/>
          <b style={{ fontSize: 11, color: "#34D399", letterSpacing: "0.05em", textTransform: "uppercase" }}>Recommendation</b>
        </div>
        {block.text}
      </div>
    );
  }
  return null;
};

Object.assign(window, { Copilot, Message, Block });
