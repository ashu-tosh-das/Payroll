// Support Center — employee tickets + AI chatbot

const ATLAS_AUTO_RESPONSES = {
  "Escalate to HR": "Escalated to HR team. Ticket priority updated to High. HRBP Meera Iyer has been notified.",
  "Check policy": "Reviewed leave policy: employees are entitled to 24 PL per year. Carry-forward limit is 15 days. This employee's request appears valid.",
  "Request info": "Information request sent to employee. They will be notified via email and in their portal. Expected response: 24 hours.",
};

const ATLAS_DEFAULT_RESPONSE = "Action queued. I'll follow up with the relevant team and update you here.";

const TICKETS = [
  { id: "TKT-4218", subj: "Form 16 not received for FY 24-25", emp: "Akshay Sharma",  empId: "SO-1187", cat: "Tax docs",       priority: "High",   status: "Open",       at: "2h ago",  agent: null,            sla: "4h left",  channel: "Email",    bot: false },
  { id: "TKT-4217", subj: "PF UAN linking issue",             emp: "Pooja Mehta",     empId: "SO-1064", cat: "PF · ESI",       priority: "Medium", status: "In progress", at: "5h ago",  agent: "Atlas",         sla: "12h left", channel: "Chat",     bot: true },
  { id: "TKT-4216", subj: "Reimbursement stuck — EX-1840",    emp: "Pooja Mehta",     empId: "SO-1064", cat: "Reimbursement",  priority: "High",   status: "Open",       at: "5h ago",  agent: null,            sla: "3h left",  channel: "WhatsApp", bot: false },
  { id: "TKT-4215", subj: "Update bank account",              emp: "Sahil Khanna",    empId: "SO-1098", cat: "Profile",        priority: "Low",    status: "Resolved",   at: "Yesterday", agent: "Meera Iyer",   sla: "Met",       channel: "Portal",   bot: false },
  { id: "TKT-4214", subj: "Want pay revision history",        emp: "Chitra Iyer",     empId: "SO-1167", cat: "Compensation",   priority: "Medium", status: "Resolved",   at: "Yesterday", agent: "Atlas",        sla: "Met",       channel: "Chat",     bot: true },
  { id: "TKT-4213", subj: "Leave balance shows wrong PL",     emp: "Deepak Verma",    empId: "SO-1042", cat: "Leave",          priority: "Medium", status: "In progress", at: "Yesterday", agent: "Priya Kapoor",sla: "8h left", channel: "Email",    bot: false },
  { id: "TKT-4212", subj: "Salary credited to old account",   emp: "Karthik Reddy",   empId: "SO-1213", cat: "Payroll",        priority: "Urgent", status: "Resolved",   at: "Nov 22",    agent: "Vikram Singh",sla: "Met",      channel: "WhatsApp", bot: false },
  { id: "TKT-4211", subj: "Increment letter for visa",        emp: "Aarav Sharma",    empId: "SO-1184", cat: "Letters",        priority: "Low",    status: "Resolved",   at: "Nov 21",    agent: "Atlas",       sla: "Met",      channel: "Chat",     bot: true },
];

const TICKET_CATS = ["Payroll","Reimbursement","Leave","PF · ESI","Tax docs","Profile","Compensation","Letters"];

const Support = ({ onSub, onNav }) => {
  const [tickets, setTickets] = useState(() => window.loadStore('TICKETS', window.TICKETS || TICKETS || []));
  const [selected, setSelected] = useState(() => (window.TICKETS || TICKETS || [])[0]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setTickets(window.TICKETS || TICKETS || []);
  }, []);
  const [statusOverrides, setStatusOverrides] = useState(() => window.loadStore('ticket_status_overrides', {}));
  const [thread, setThread] = useState({}); // {ticketId: [extra messages]}
  const [replyInput, setReplyInput] = useState("");
  const [typing, setTyping] = useState({}); // {ticketId: bool} — shows shimmer when Atlas is typing

  const getStatus = (t) => statusOverrides[t.id] || t.status;

  const sendReply = () => {
    if (!replyInput.trim()) return;
    const newMsg = { from: "Priya Kapoor", at: "Just now", role: "agent", text: replyInput };
    setThread(prev => {
      const updatedThread = [...(prev[selected.id] || []), newMsg];
      const nextTickets = (window.TICKETS || []).map(t => t.id === selected.id ? {...t, thread: updatedThread} : t);
      window.TICKETS = nextTickets;
      window.persist('TICKETS', nextTickets);
      return { ...prev, [selected.id]: updatedThread };
    });
    setReplyInput("");
    window.toast("Reply sent", { icon: "send", tone: "ok", sub: `Employee notified via ${selected.channel}` });
  };

  const markResolved = () => {
    setStatusOverrides(prev => { const next = { ...prev, [selected.id]: "Resolved" }; window.persist('ticket_status_overrides', next); return next; });
    window.toast(`${selected.id} marked resolved`, { icon: "check", tone: "ok", sub: "CSAT survey sent to employee" });
  };

  const assignToMe = () => {
    setStatusOverrides(prev => { const next = { ...prev, [selected.id]: "In progress" }; window.persist('ticket_status_overrides', next); return next; });
    window.toast(`Assigned ${selected.id} to you`, { icon: "user", tone: "info" });
  };

  const handleSuggestedAction = (actionText) => {
    const ticketId = selected.id;
    // a. Add the action text as a user message to the thread
    setThread(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), { from: selected.emp, at: "Just now", role: "employee-action", text: actionText }],
    }));
    // Show typing indicator
    setTyping(prev => ({ ...prev, [ticketId]: true }));
    // b. After 800ms, add Atlas auto-response
    setTimeout(() => {
      const response = ATLAS_AUTO_RESPONSES[actionText] || ATLAS_DEFAULT_RESPONSE;
      setTyping(prev => ({ ...prev, [ticketId]: false }));
      setThread(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), { from: "Atlas", at: "Just now", role: "bot-response", text: response }],
      }));
    }, 800);
  };

  const handleEmployeeClick = (empName, e) => {
    e.stopPropagation();
    window._supportSelectedEmp = empName;
    onNav && onNav("employees");
  };

  const stats = {
    open: tickets.filter(t => getStatus(t) === "Open").length,
    progress: tickets.filter(t => getStatus(t) === "In progress").length,
    resolved: tickets.filter(t => getStatus(t) === "Resolved").length,
    botResolved: tickets.filter(t => t.bot && getStatus(t) === "Resolved").length,
  };

  const filtered = filter === "all" ? tickets
    : filter === "open" ? tickets.filter(t => getStatus(t) === "Open")
    : filter === "mine" ? tickets.filter(t => t.agent === "Priya Kapoor")
    : tickets.filter(t => t.bot);

  return (
    <div className="page">
      <PageHead title="Support Center" subtitle="Employee tickets, FAQ, and Atlas chatbot — 71% of queries resolved without human in 2025">
        <button className="btn ghost" onClick={() => onSub?.("faq-library")}><Icon name="report"/>FAQ library</button>
        <button className="btn ghost" onClick={() => onSub?.("bot-training")}><Icon name="cpu"/>Bot training</button>
        <button className="btn primary" onClick={() => window.openModal({
          title: "Raise Internal Ticket",
          subtitle: "Create a new support ticket from admin side",
          body: React.createElement("div", {className: "col gap-3", style: {marginTop: 8}},
            React.createElement("input", {className: "input", placeholder: "Subject / title", id: "tk-subject"}),
            React.createElement("select", {className: "select", id: "tk-cat"},
              ...TICKET_CATS.map(c => React.createElement("option", {key: c, value: c}, c))
            ),
            React.createElement("textarea", {className: "input", rows: 3, placeholder: "Describe the issue…", id: "tk-body", style: {resize: "vertical"}})
          ),
          confirmText: "Create ticket",
          onConfirm: () => {
            const subject = document.getElementById("tk-subject")?.value || "Admin ticket";
            const cat = document.getElementById("tk-cat")?.value || "General";
            const body = document.getElementById("tk-body")?.value || "";
            const t = { id: "T-" + Date.now(), title: subject, subj: subject, cat, priority: "Medium", status: "Open", at: "Just now", age: "Just now", msgs: 1, emp: "Priya Kapoor", empId: "PK-001", agent: "Priya Kapoor", sla: "24h left", channel: "Portal", bot: false, thread: [{role:"user", text: body, at: "Just now"}] };
            window.TICKETS = [t, ...(window.TICKETS || TICKETS || [])];
            setTickets(prev => { const next = [t, ...prev]; window.persist('TICKETS', next); window.TICKETS = next; return next; });
            window.toast("Ticket created: " + subject, {icon: "alert", tone: "ok", sub: t.id});
          }
        })}><Icon name="plus"/>Raise ticket</button>
      </PageHead>

      <div className="grid g-cols-4">
        <SupportKPI icon="alert"    label="Open"          value={stats.open}     sub={`Avg first response: 14 min`}  color="#F43F5E"/>
        <SupportKPI icon="play"     label="In progress"   value={stats.progress} sub="2 with humans, 1 with Atlas"   color="#F59E0B"/>
        <SupportKPI icon="check"    label="Resolved (7d)" value={stats.resolved * 8} sub={`CSAT 4.7 / 5 · ${stats.resolved * 8} ratings`} color="#34D399"/>
        <SupportKPI icon="sparkle"  label="Bot deflection" value="71%"          sub={`${stats.botResolved * 5} resolved by Atlas`} color="#10B981"/>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14, marginTop: 12 }}>
        {/* Ticket list */}
        <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="row between" style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
            <div className="card-title">Tickets<small>{filtered.length} total</small></div>
            <div className="tabs">
              {[["all","All"],["open","Open"],["mine","Mine"],["bot","Bot"]].map(([k,l]) => (
                <button key={k} data-active={filter === k} onClick={() => setFilter(k)}>{l}</button>
              ))}
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>Employee</th>
                <th>Category</th>
                <th>Channel</th>
                <th>Priority</th>
                <th>Agent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} data-selected={t.id === selected.id} onClick={() => setSelected(t)}>
                  <td className="mono muted fs-sm">{t.id}</td>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{t.subj}</div>
                    <div className="muted fs-xs">{t.at} · SLA {t.sla}</div>
                  </td>
                  <td>
                    <div className="row-emp">
                      <Avatar name={t.emp} size={22}/>
                      <div>
                        <span
                          title="View employee profile"
                          style={{ fontSize: 11.5, cursor: "pointer", color: "var(--accent-bright)", display: "inline-flex", alignItems: "center", gap: 2 }}
                          onClick={(e) => handleEmployeeClick(t.emp, e)}
                        >
                          {t.emp}<Icon name="arrowRight" size={9}/>
                        </span>
                        <div className="row-emp-meta">{t.empId}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="chip">{t.cat}</span></td>
                  <td><ChannelChip channel={t.channel === "Portal" ? "Web" : t.channel === "Chat" ? "Web" : t.channel}/></td>
                  <td>
                    <span className={`chip ${t.priority === "Urgent" || t.priority === "High" ? "danger" : t.priority === "Medium" ? "warn" : ""}`} style={{ fontSize: 9.5 }}>
                      <span className="dot"/>{t.priority}
                    </span>
                  </td>
                  <td>
                    {t.agent === "Atlas" ? (
                      <span className="chip ok"><Icon name="sparkle" size={9}/>Atlas</span>
                    ) : t.agent ? (
                      <div className="row gap-3 center"><Avatar name={t.agent} size={18}/><span style={{ fontSize: 11 }}>{t.agent.split(" ")[0]}</span></div>
                    ) : <span className="chip warn">Unassigned</span>}
                  </td>
                  <td><StatusChip status={getStatus(t) === "Open" ? "Pending" : getStatus(t) === "In progress" ? "In Review" : "Done"}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ticket detail */}
        <div className="card" style={{ display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 220px)" }}>
          <div className="card-head">
            <div>
              <div className="card-title">{selected.id}<small>{selected.cat} · {selected.priority} priority</small></div>
            </div>
            <span className="chip">SLA · {selected.sla}</span>
          </div>

          <div className="row gap-4" style={{ padding: 10, borderRadius: 10, background: "var(--inset-2)", border: "1px solid var(--border)", marginBottom: 12 }}>
            <Avatar name={selected.emp} size={32}/>
            <div className="flex-1">
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{selected.emp}</div>
              <div className="muted fs-xs">{selected.empId} · raised via <ChannelChip channel={selected.channel === "Portal" || selected.channel === "Chat" ? "Web" : selected.channel}/></div>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{selected.subj}</div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {/* Conversation */}
            <div className="col gap-5">
              <ChatBubble
                from={selected.emp}
                at={selected.at}
                role="employee"
                text={
                  selected.id === "TKT-4218" ?
                    "Hi team, I haven't received my Form 16 for FY 24-25 yet. I need it for my home-loan documentation by next week. Could you please share it asap?" :
                  selected.id === "TKT-4217" ?
                    "My UAN seems to be linked to my previous employer's PF. Could you help me consolidate it under Source One?" :
                    "Hi team, looking for help with: " + selected.subj
                }
              />

              <ChatBubble
                from="Atlas"
                at="2h ago"
                role="bot"
                text={
                  selected.id === "TKT-4218" ?
                    "Hi Akshay — I checked: your Form 16 was generated on Jun 15 but is currently pending CFO signature (6 left in batch). I've flagged this as priority and pinged the CFO's office. Expected delivery: today by 18:00 IST. I'll send it to your inbox + WhatsApp the moment it's signed." :
                  selected.id === "TKT-4217" ?
                    "Hi Pooja — I can help. Your previous UAN (101178524897) is active under a different employer. To consolidate: 1) Login to EPFO portal, 2) Click 'One Member – One EPF Account', 3) Submit the transfer request. I've drafted the request for you — would you like me to e-mail it?" :
                    "Hi, I'm Atlas. I can help with most payroll, leave, reimbursement and tax questions. Can you share more details?"
                }
                suggested={
                  selected.id === "TKT-4218" ?
                    ["Yes, please escalate to CFO directly", "What if it's not signed today?", "Escalate to HR", "Check policy"] :
                  selected.id === "TKT-4217" ?
                    ["Yes, send me the e-mail draft", "Schedule a call with HR", "Request info", "Check policy"] :
                    ["Escalate to HR", "Check policy", "Request info"]
                }
                onSuggestedAction={handleSuggestedAction}
              />

              {selected.id === "TKT-4218" && (
                <ChatBubble
                  from={selected.emp}
                  at="1h ago"
                  role="employee"
                  text="Yes, please escalate. I really need this by tomorrow morning."
                />
              )}

              {(thread[selected.id] || []).map((m, i) => (
                <ChatBubble key={i} from={m.from} at={m.at} role={m.role === "employee-action" ? "employee" : m.role === "bot-response" ? "bot" : "agent"} text={m.text}/>
              ))}

              {typing[selected.id] && (
                <div className="row gap-4" style={{ alignItems: "flex-start" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: "linear-gradient(135deg, #10B981, #34D399)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name="sparkle" size={13} color="#052E1A"/>
                  </div>
                  <div className="flex-1">
                    <div className="row gap-3 center" style={{ marginBottom: 4 }}>
                      <b style={{ fontSize: 11.5 }}>Atlas</b>
                      <span className="chip ok" style={{ fontSize: 9 }}>Typing…</span>
                    </div>
                    <div style={{
                      padding: "10px 12px",
                      borderRadius: "12px 12px 12px 4px",
                      background: "linear-gradient(160deg, rgba(16,185,129,0.10), var(--inset-1))",
                      border: "1px solid rgba(16,185,129,0.18)",
                      width: 80,
                    }}>
                      <div className="shimmer" style={{ height: 10, borderRadius: 5, marginBottom: 5 }}/>
                      <div className="shimmer" style={{ height: 10, borderRadius: 5, width: "60%" }}/>
                    </div>
                  </div>
                </div>
              )}

              {selected.bot && (
                <div style={{ padding: 10, borderRadius: 10, background: "rgba(96,165,250,0.06)", border: "1px dashed rgba(96,165,250,0.20)", fontSize: 11, color: "var(--text-mid)" }}>
                  <div className="row gap-3 center" style={{ marginBottom: 4 }}>
                    <Icon name="cpu" size={11} color="#60A5FA"/>
                    <b style={{ color: "#93C5FD" }}>Atlas auto-actions</b>
                  </div>
                  Drafted UAN consolidation email · awaiting employee confirmation · linked KB article #PF-204
                </div>
              )}
            </div>
          </div>

          {/* Reply box */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <div className="card-flat" style={{ padding: 6, display: "flex", alignItems: "center", gap: 6, background: "var(--inset-3)", borderRadius: 8, border: "1px solid var(--border)" }}>
              <input className="input" style={{ flex: 1, border: 0, background: "transparent", height: 30, fontSize: 12 }}
                placeholder="Reply to employee…"
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendReply(); }}/>
              <button className="iconbtn" title="Suggest with Atlas" onClick={() => setReplyInput("I've checked your account — your request is being processed. We'll update you shortly.")}><Icon name="sparkle"/></button>
              <button className="iconbtn" title="Attach"><Icon name="upload"/></button>
              <button className="btn primary sm" onClick={sendReply} disabled={!replyInput.trim()} style={{ opacity: replyInput.trim() ? 1 : 0.5 }}>
                <Icon name="send"/>Send
              </button>
            </div>
            <div className="row gap-3" style={{ marginTop: 8 }}>
              <button className="btn ghost sm" onClick={assignToMe}>Assign to me</button>
              <button className="btn ghost sm" onClick={() => window.openModal({
                title: "Add to knowledge base",
                subtitle: "Atlas will use this for future answers",
                body: <div className="col gap-4">
                  <div>
                    <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Article title</div>
                    <input className="input" style={{ width: "100%", height: 34 }} defaultValue={selected.subj}/>
                  </div>
                  <div>
                    <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Resolution</div>
                    <textarea className="input" style={{ width: "100%", height: 88, padding: 8, resize: "vertical" }} placeholder="How this issue was resolved..."/>
                  </div>
                </div>,
                confirmText: "Add article",
                onConfirm: () => window.toast("KB article added", { icon: "report", tone: "ai", sub: "Atlas will use this in future responses" }),
              })}>Add KB article</button>
              <button className="btn ghost sm" onClick={markResolved}>Mark resolved</button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ + categories */}
      <div className="grid g-cols-3" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card-head"><div className="card-title">Top tickets by category<small>Last 30 days</small></div></div>
          <div className="col gap-3">
            {TICKET_CATS.slice(0, 6).map((c, i) => {
              const count = 24 - i * 3;
              const pct = (count / 24) * 100;
              const colors = ["#10B981","#60A5FA","#A78BFA","#F59E0B","#F43F5E","#22D3EE"];
              return (
                <div key={c}>
                  <div className="row between" style={{ marginBottom: 3 }}>
                    <span style={{ fontSize: 11.5 }}>{c}</span>
                    <span className="mono fs-sm muted">{count}</span>
                  </div>
                  <div className="bar" style={{ height: 4 }}><div style={{ width: `${pct}%`, background: colors[i] }}/></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">FAQ — most accessed</div></div>
          <div className="col gap-3">
            {[
              "How do I download my Form 16?",
              "When is salary credited?",
              "How is HRA exemption calculated?",
              "Can I submit reimbursement on WhatsApp?",
              "How do I update my bank account?",
              "PF balance and UAN linking",
            ].map((q, i) => (
              <div key={i} className="row gap-3" style={{ padding: "6px 0", borderBottom: "1px solid var(--border)", cursor: "default" }}>
                <Icon name="report" size={12} color="#60A5FA"/>
                <span className="flex-1" style={{ fontSize: 12 }}>{q}</span>
                <span className="muted fs-xs mono">{(8 - i) * 84}↗</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{
          background: "linear-gradient(160deg, rgba(16,185,129,0.10), rgba(167,139,250,0.06))",
          borderColor: "rgba(16,185,129,0.20)",
        }}>
          <div className="card-head">
            <div className="row gap-3 center">
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, #10B981, #34D399)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="sparkle" size={13} color="#052E1A"/>
              </div>
              <div className="card-title">Atlas chatbot<small>Available 24/7 · employee POV</small></div>
            </div>
          </div>
          <div className="col gap-4" style={{ fontSize: 12 }}>
            <BotStat label="Conversations (30d)" value="1,842"/>
            <BotStat label="Resolved without human" value="71%"/>
            <BotStat label="Avg response time" value="0.8s"/>
            <BotStat label="Languages supported" value="EN, HI, KN, TA, MR"/>
            <BotStat label="KB articles trained" value="218"/>
          </div>
          <button className="btn ghost sm" style={{ width: "100%", marginTop: 12 }}><Icon name="sparkle"/>Open chatbot preview</button>
        </div>
      </div>
    </div>
  );
};

const SupportKPI = ({ icon, label, value, sub, color }) => (
  <div className="card kpi" style={{ overflow: "hidden", position: "relative" }}>
    <div style={{ position: "absolute", right: -20, top: -20, width: 80, height: 80, borderRadius: "50%",
      background: `radial-gradient(circle, ${color}25, transparent 70%)` }}/>
    <div className="kpi-label"><Icon name={icon} size={11} color={color}/>{label}</div>
    <div className="kpi-value" style={{ color }}>{value}</div>
    <div className="muted fs-xs">{sub}</div>
  </div>
);

const ChatBubble = ({ from, at, role, text, suggested, onSuggestedAction }) => {
  if (role === "bot") {
    return (
      <div className="row gap-4" style={{ alignItems: "flex-start" }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: "linear-gradient(135deg, #10B981, #34D399)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="sparkle" size={13} color="#052E1A"/>
        </div>
        <div className="flex-1">
          <div className="row gap-3 center" style={{ marginBottom: 4 }}>
            <b style={{ fontSize: 11.5 }}>{from}</b>
            <span className="chip ok" style={{ fontSize: 9 }}>Bot · 0.6s</span>
            <span className="muted fs-xs">{at}</span>
          </div>
          <div style={{
            padding: "10px 12px",
            borderRadius: "12px 12px 12px 4px",
            background: "linear-gradient(160deg, rgba(16,185,129,0.10), var(--inset-1))",
            border: "1px solid rgba(16,185,129,0.18)",
            fontSize: 12, lineHeight: 1.55, color: "var(--text)",
          }}>{text}</div>
          {suggested && (
            <div className="row gap-3" style={{ marginTop: 6, flexWrap: "wrap" }}>
              {suggested.map(s => (
                <button
                  key={s}
                  className="btn ghost sm"
                  style={{ fontSize: 10.5 }}
                  onClick={() => onSuggestedAction && onSuggestedAction(s)}
                >{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  if (role === "agent") {
    return (
      <div className="row gap-4" style={{ alignItems: "flex-start" }}>
        <Avatar name={from} size={28}/>
        <div className="flex-1">
          <div className="row gap-3 center" style={{ marginBottom: 4 }}>
            <b style={{ fontSize: 11.5 }}>{from}</b>
            <span className="chip" style={{ fontSize: 9 }}>Agent</span>
            <span className="muted fs-xs">{at}</span>
          </div>
          <div style={{
            padding: "10px 12px",
            borderRadius: "12px 12px 12px 4px",
            background: "rgba(96,165,250,0.08)",
            border: "1px solid rgba(96,165,250,0.18)",
            fontSize: 12, lineHeight: 1.55, color: "var(--text)",
          }}>{text}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="row gap-4" style={{ alignItems: "flex-start", justifyContent: "flex-end" }}>
      <div style={{ flex: 1, maxWidth: 360 }}>
        <div className="row gap-3" style={{ marginBottom: 4, justifyContent: "flex-end" }}>
          <span className="muted fs-xs">{at}</span>
          <b style={{ fontSize: 11.5 }}>{from}</b>
        </div>
        <div style={{
          padding: "10px 12px",
          borderRadius: "12px 12px 4px 12px",
          background: "var(--inset-4)",
          border: "1px solid var(--border-strong)",
          fontSize: 12, lineHeight: 1.55, color: "var(--text)",
        }}>{text}</div>
      </div>
      <Avatar name={from} size={28}/>
    </div>
  );
};

const BotStat = ({ label, value }) => (
  <div className="row between" style={{ padding: "5px 0", borderBottom: "1px dashed var(--border)" }}>
    <span className="muted">{label}</span>
    <b className="mono" style={{ color: "var(--accent-bright)" }}>{value}</b>
  </div>
);

Object.assign(window, { Support, SupportKPI, ChatBubble, BotStat });
