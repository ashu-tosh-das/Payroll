const Attendance = ({ onSub }) => {
  const { useState, useEffect, useRef, useMemo } = React;
  const { onShift, onLeave, absent, total } = SHIFT_TODAY;
  const present = total - onLeave - absent;
  const attendPct = ((present / total) * 100).toFixed(1);

  const [decisions, setDecisions] = useState(() => window.loadStore('leave_decisions', {})); // { LR-id: "Approved" | "Rejected" }
  const [leaveAdjustments, setLeaveAdjustments] = useState({}); // empName → days deducted
  const [holidaysState, setHolidaysState] = useState(() => window.loadStore('HOLIDAYS_2025', HOLIDAYS_2025 || [
    { id: "H1", date: "Dec 25", day: "Thu", name: "Christmas", type: "Gazetted", location: "All" },
    { id: "H2", date: "Jan 01", day: "Thu", name: "New Year (optional)", type: "Restricted", location: "All" },
    { id: "H3", date: "Jan 14", day: "Wed", name: "Pongal · Makar Sankranti", type: "Regional", location: "South India" },
    { id: "H4", date: "Jan 26", day: "Mon", name: "Republic Day", type: "Gazetted", location: "All" },
  ]));
  const [publishing, setPublishing] = useState(false);
  const [wfhRequests, setWfhRequests] = useState(() => window.WFH_REQUESTS || []);
  const [leaveReqs, setLeaveReqs] = useState(() => window.LEAVE_REQUESTS || LEAVE_REQUESTS || []);

  useEffect(() => { setWfhRequests(window.WFH_REQUESTS || []); }, []);
  useEffect(() => {
    const global = window.LEAVE_REQUESTS || LEAVE_REQUESTS || [];
    setLeaveReqs(global);
  }, []);

  const decideLeave = (id, emp, type, days, decision) => {
    setDecisions(d => { const next = { ...d, [id]: decision }; window.persist('leave_decisions', next); return next; });
    if (decision === "Approved") {
      setLeaveAdjustments(prev => ({
        ...prev,
        [emp]: (prev[emp] || 0) + days,
      }));
      window.LEAVE_REQUESTS = (window.LEAVE_REQUESTS || []).map(r => r.id === id ? { ...r, status: "approved" } : r);
      window.persist('LEAVE_REQUESTS', window.LEAVE_REQUESTS);
      setLeaveReqs(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
      window.toast(`Leave approved for ${emp} — ${type} ${days} days`, {
        icon: "check",
        tone: "ok",
        sub: `${id} · Balance deducted · Employee notified via email`,
      });
    } else {
      window.LEAVE_REQUESTS = (window.LEAVE_REQUESTS || []).map(r => r.id === id ? { ...r, status: "rejected" } : r);
      window.persist('LEAVE_REQUESTS', window.LEAVE_REQUESTS);
      setLeaveReqs(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));
      window.toast(`Leave declined`, {
        icon: "x",
        tone: "warn",
        sub: `${id} · ${emp} notified via email`,
      });
    }
  };

  const pendingRequests = leaveReqs.filter(r => {
    const effectiveStatus = decisions[r.id] || r.status;
    return effectiveStatus === "Pending";
  });

  const approveAllPending = () => {
    const newDecisions = { ...decisions };
    const newAdjustments = { ...leaveAdjustments };
    pendingRequests.forEach(r => {
      newDecisions[r.id] = "Approved";
      newAdjustments[r.emp] = (newAdjustments[r.emp] || 0) + r.days;
    });
    setDecisions(newDecisions);
    window.persist('leave_decisions', newDecisions);
    setLeaveAdjustments(newAdjustments);
    window.toast(`All ${pendingRequests.length} pending leaves approved`, {
      icon: "check",
      tone: "ok",
      sub: "Leave balances updated · All employees notified",
    });
  };

  const openAddHoliday = () => {
    window.openModal({
      title: "Add Holiday",
      subtitle: "New entry will appear in the holiday calendar",
      width: 480,
      confirmText: "Add Holiday",
      body: `
        <div class="col gap-4">
          <div>
            <label class="fs-xs muted" style="display:block;margin-bottom:4px">Date (e.g. Feb 10)</label>
            <input id="hol-date" class="input" placeholder="Mon DD" style="width:100%" />
          </div>
          <div>
            <label class="fs-xs muted" style="display:block;margin-bottom:4px">Day (e.g. Mon)</label>
            <input id="hol-day" class="input" placeholder="Mon" style="width:100%" />
          </div>
          <div>
            <label class="fs-xs muted" style="display:block;margin-bottom:4px">Holiday Name</label>
            <input id="hol-name" class="input" placeholder="Holiday name" style="width:100%" />
          </div>
          <div>
            <label class="fs-xs muted" style="display:block;margin-bottom:4px">Type</label>
            <div class="col gap-2" style="margin-top:4px">
              <label class="row gap-3 center" style="cursor:pointer"><input type="radio" name="hol-type" value="Gazetted" checked /> <span class="fs-sm">Gazetted</span></label>
              <label class="row gap-3 center" style="cursor:pointer"><input type="radio" name="hol-type" value="Regional" /> <span class="fs-sm">Regional</span></label>
              <label class="row gap-3 center" style="cursor:pointer"><input type="radio" name="hol-type" value="Restricted" /> <span class="fs-sm">Restricted</span></label>
            </div>
          </div>
          <div>
            <label class="fs-xs muted" style="display:block;margin-bottom:4px">Location</label>
            <input id="hol-location" class="input" placeholder="All / Region name" style="width:100%" />
          </div>
        </div>
      `,
      onConfirm: () => {
        const date = document.getElementById("hol-date")?.value?.trim();
        const day = document.getElementById("hol-day")?.value?.trim();
        const name = document.getElementById("hol-name")?.value?.trim();
        const typeEl = document.querySelector('input[name="hol-type"]:checked');
        const type = typeEl ? typeEl.value : "Gazetted";
        const location = document.getElementById("hol-location")?.value?.trim() || "All";
        if (!date || !name) {
          window.toast("Date and name are required", { icon: "alert", tone: "warn" });
          return;
        }
        const newHoliday = {
          id: "H" + Date.now(),
          date,
          day: day || "",
          name,
          type,
          location,
        };
        setHolidaysState(prev => { const next = [...prev, newHoliday]; window.persist('HOLIDAYS_2025', next); return next; });
        window.toast(`Holiday "${name}" added`, { icon: "check", tone: "ok" });
      },
    });
  };

  const openEditHoliday = (h) => {
    window.openModal({
      title: "Edit Holiday",
      subtitle: h.name,
      width: 480,
      confirmText: "Save Changes",
      body: `
        <div class="col gap-4">
          <div>
            <label class="fs-xs muted" style="display:block;margin-bottom:4px">Date (e.g. Feb 10)</label>
            <input id="hol-date" class="input" value="${h.date || ""}" style="width:100%" />
          </div>
          <div>
            <label class="fs-xs muted" style="display:block;margin-bottom:4px">Day (e.g. Mon)</label>
            <input id="hol-day" class="input" value="${h.day || ""}" style="width:100%" />
          </div>
          <div>
            <label class="fs-xs muted" style="display:block;margin-bottom:4px">Holiday Name</label>
            <input id="hol-name" class="input" value="${h.name || ""}" style="width:100%" />
          </div>
          <div>
            <label class="fs-xs muted" style="display:block;margin-bottom:4px">Type</label>
            <div class="col gap-2" style="margin-top:4px">
              <label class="row gap-3 center" style="cursor:pointer"><input type="radio" name="hol-type" value="Gazetted" ${h.type === "Gazetted" ? "checked" : ""} /> <span class="fs-sm">Gazetted</span></label>
              <label class="row gap-3 center" style="cursor:pointer"><input type="radio" name="hol-type" value="Regional" ${h.type === "Regional" ? "checked" : ""} /> <span class="fs-sm">Regional</span></label>
              <label class="row gap-3 center" style="cursor:pointer"><input type="radio" name="hol-type" value="Restricted" ${h.type === "Restricted" ? "checked" : ""} /> <span class="fs-sm">Restricted</span></label>
            </div>
          </div>
          <div>
            <label class="fs-xs muted" style="display:block;margin-bottom:4px">Location</label>
            <input id="hol-location" class="input" value="${h.location || "All"}" style="width:100%" />
          </div>
        </div>
      `,
      onConfirm: () => {
        const date = document.getElementById("hol-date")?.value?.trim();
        const day = document.getElementById("hol-day")?.value?.trim();
        const name = document.getElementById("hol-name")?.value?.trim();
        const typeEl = document.querySelector('input[name="hol-type"]:checked');
        const type = typeEl ? typeEl.value : h.type;
        const location = document.getElementById("hol-location")?.value?.trim() || "All";
        setHolidaysState(prev => { const next = prev.map(item => item.id === h.id ? { ...item, date, day, name, type, location } : item); window.persist('HOLIDAYS_2025', next); return next; });
        window.toast(`Holiday "${name}" updated`, { icon: "check", tone: "ok" });
      },
    });
  };

  const deleteHoliday = (h) => {
    setHolidaysState(prev => { const next = prev.filter(item => item.id !== h.id); window.persist('HOLIDAYS_2025', next); return next; });
    window.toast(`Holiday "${h.name}" removed`, { icon: "x", tone: "warn", sub: "Publish to notify employees" });
  };

  const publishHolidays = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      window.toast("Holiday calendar updated · 247 employees notified", {
        icon: "check",
        tone: "ok",
        sub: "Changes published successfully",
      });
    }, 1200);
  };

  return (
    <div className="page">
      <PageHead title="Attendance & Leave" subtitle="Biometric & remote check-in · Live for Nov 25, 2025">
        <button className="btn ghost" onClick={() => onSub?.("holiday-calendar")}><Icon name="calendar"/>Holiday calendar</button>
        <button className="btn ghost"><Icon name="download"/>Export</button>
        <button className="btn primary"><Icon name="fingerprint"/>Sync biometric</button>
      </PageHead>

      {/* Live status */}
      <div className="grid g-cols-4">
        <LiveStat label="Present" value={present} of={total} pct={attendPct} color="#10B981" icon="check"
          sub={<><span className="live-dot"/> Live · 218 checked in</>}/>
        <LiveStat label="On approved leave" value={onLeave} of={total} pct={((onLeave/total)*100).toFixed(1)} color="#F59E0B" icon="calendar"
          sub="11 PL · 5 SL · 3 CL"/>
        <LiveStat label="WFH today" value="34" of={total} pct="13.8" color="#A78BFA" icon="home"
          sub="Auto-approved by policy"/>
        <LiveStat label="Absent / unmarked" value={absent} of={total} pct={((absent/total)*100).toFixed(1)} color="#F43F5E" icon="alert"
          sub="3 reminders sent"/>
      </div>
      <div className="row gap-4" style={{ marginTop: 8 }}>
        <MiniMetric label="WFH Pending" value={wfhRequests.filter(r => r.status === "pending").length} color="#A78BFA" icon="home"/>
      </div>

      <div className="grid g-cols-3" style={{ marginTop: 12 }}>
        {/* Calendar / heatmap */}
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-head">
            <div className="card-title">November 2025
              <small>Daily attendance heatmap · darker = higher present rate</small>
            </div>
            <div className="tabs">
              <button data-active="true">Month</button>
              <button>Week</button>
              <button>Shift</button>
            </div>
          </div>
          <Heatmap/>
          <div className="row between" style={{ marginTop: 12, fontSize: 11 }}>
            <div className="row gap-4">
              <LegendDot color="#10B981" label="≥ 95%"/>
              <LegendDot color="#34D399" label="90–94%"/>
              <LegendDot color="#0e8c63" label="80–89%"/>
              <LegendDot color="#1e3a5f" label="< 80%"/>
              <LegendDot color="rgba(167,139,250,0.4)" label="Holiday"/>
              <LegendDot color="var(--inset-4)" label="Weekend"/>
            </div>
            <span className="muted">Avg attendance: <b style={{ color: "var(--text)" }}>93.2%</b></span>
          </div>
        </div>

        {/* Leave balance summary */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Leave balances<small>Org-wide · per employee avg</small></div>
          </div>
          <div className="col gap-6">
            {LEAVE_TYPES.map(l => {
              const pct = (l.used / l.total) * 100;
              return (
                <div key={l.id}>
                  <div className="row between" style={{ marginBottom: 4 }}>
                    <div className="row gap-3 center">
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color }}/>
                      <span style={{ fontSize: 12 }}>{l.label}</span>
                    </div>
                    <span className="mono fs-sm muted">{l.total - l.used} / {l.total}</span>
                  </div>
                  <div className="bar"><div style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${l.color}, ${l.color}80)`, boxShadow: `0 0 10px ${l.color}50` }}/></div>
                  <div className="row between" style={{ marginTop: 3, fontSize: 10, color: "var(--text-muted)" }}>
                    <span>{l.used} taken</span>
                    <span>{pct.toFixed(0)}% used</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leave requests + Shift breakdown */}
      <div className="grid g-cols-3" style={{ marginTop: 12 }}>
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-head">
            <div className="card-title">Pending leave requests
              <small>{pendingRequests.length} awaiting approval · auto-deduct if unpaid</small>
            </div>
            <div className="row gap-3">
              {leaveReqs.some(r => r.submittedViaPortal || r.empId === "SO-1042") && (
                <span className="chip info fs-xs" style={{ fontSize: 10, padding: "2px 7px" }}>
                  <Icon name="bell" size={9}/>1 new from employee portal
                </span>
              )}
              {pendingRequests.length > 0 && (
                <span className="chip warn"><span className="dot"/>{pendingRequests.length} pending</span>
              )}
              {pendingRequests.length > 1 && (
                <button className="btn primary sm" onClick={approveAllPending}>
                  <Icon name="check" size={11}/>Approve All Pending
                </button>
              )}
              <button className="btn ghost sm">View all</button>
            </div>
          </div>
          <div className="col gap-3">
            {leaveReqs.map(r => {
              const myDecision = decisions[r.id];
              const effectiveStatus = myDecision || r.status;
              const isPending = effectiveStatus === "Pending";
              const wasApprovedByUs = myDecision === "Approved";
              return (
              <div key={r.id} className="row gap-5" style={{
                padding: "10px 12px", borderRadius: 10,
                background: isPending ? "rgba(245,158,11,0.06)" : "var(--inset-1)",
                border: `1px solid ${isPending ? "rgba(245,158,11,0.18)" : "var(--border)"}`,
                transition: "all 220ms",
              }}>
                <Avatar name={r.emp}/>
                <div className="flex-1">
                  <div className="row gap-3 center" style={{ fontSize: 12.5 }}>
                    <b style={{ fontWeight: 500 }}>{r.emp}</b>
                    <span className="muted fs-xs">{r.empId}</span>
                    <span className="chip" style={{ background: `${LEAVE_TYPES.find(l => l.id === r.type)?.color}20`, color: LEAVE_TYPES.find(l => l.id === r.type)?.color, borderColor: `${LEAVE_TYPES.find(l => l.id === r.type)?.color}40` }}>
                      {r.type} · {r.days}d
                    </span>
                    {wasApprovedByUs && (
                      <span className="chip ok fs-xs" style={{ fontSize: 10, padding: "1px 6px" }}>
                        <Icon name="check" size={9}/>balance updated
                      </span>
                    )}
                  </div>
                  <div className="fs-xs muted" style={{ marginTop: 3 }}>
                    {r.from} → {r.to} · <i>"{r.reason}"</i>
                  </div>
                </div>
                {isPending ? (
                  <div className="row gap-2">
                    <button className="btn ghost sm danger" style={{ height: 24, padding: "0 8px" }} onClick={() => decideLeave(r.id, r.emp, r.type, r.days, "Rejected")}>Decline</button>
                    <button className="btn primary sm" style={{ height: 24, padding: "0 10px" }} onClick={() => decideLeave(r.id, r.emp, r.type, r.days, "Approved")}>Approve</button>
                  </div>
                ) : (
                  <StatusChip status={effectiveStatus === "Rejected" ? "Rejected" : "Approved"}/>
                )}
              </div>
              );
            })}
          </div>
        </div>

        <div className="col gap-6">
          <div className="card">
            <div className="card-head"><div className="card-title">Shift distribution<small>Today, 18:32 IST</small></div></div>
            <div className="col center gap-5">
              <Donut size={140} thickness={20}
                centerValue="247" centerLabel="Total"
                segments={[
                  { value: present, color: "#10B981" },
                  { value: 34, color: "#A78BFA" },
                  { value: onLeave, color: "#F59E0B" },
                  { value: absent, color: "#F43F5E" },
                ]}/>
              <div className="col gap-3" style={{ width: "100%", fontSize: 11.5 }}>
                <ShiftRow color="#10B981" label="In office" value={present}/>
                <ShiftRow color="#A78BFA" label="WFH" value="34"/>
                <ShiftRow color="#F59E0B" label="On leave" value={onLeave}/>
                <ShiftRow color="#F43F5E" label="Absent" value={absent}/>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">Upcoming holidays<small>{holidaysState.length} scheduled</small></div>
              <div className="row gap-2">
                <button className="btn ghost sm" onClick={openAddHoliday}><Icon name="plus" size={11}/>Add Holiday</button>
                <button
                  className="btn primary sm"
                  onClick={publishHolidays}
                  disabled={publishing}
                  style={{ minWidth: 80 }}
                >
                  {publishing ? (
                    <><Icon name="send" size={11}/>Publishing…</>
                  ) : (
                    <><Icon name="send" size={11}/>Publish changes</>
                  )}
                </button>
              </div>
            </div>
            <div className="col gap-3">
              {holidaysState.map(h => (
                <HolidayRow
                  key={h.id}
                  date={h.date}
                  day={h.day}
                  name={h.name}
                  type={h.type}
                  onEdit={() => openEditHoliday(h)}
                  onDelete={() => deleteHoliday(h)}
                />
              ))}
              {holidaysState.length === 0 && (
                <div className="muted fs-xs" style={{ padding: "8px 0", textAlign: "center" }}>No holidays scheduled</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* WFH Requests */}
      {(() => {
        const wfhPending = wfhRequests.filter(r => r.status === "pending");

        const approveWfh = (req) => {
          window.WFH_REQUESTS = (window.WFH_REQUESTS || []).map(r =>
            r.id === req.id ? { ...r, status: "approved", approvedBy: "Priya Kapoor" } : r
          );
          window.persist('WFH_REQUESTS', window.WFH_REQUESTS);
          setWfhRequests([...window.WFH_REQUESTS]);
          window.toast("WFH approved for " + req.empName, { icon: "check", tone: "ok" });
        };

        const rejectWfh = (req) => {
          window.WFH_REQUESTS = (window.WFH_REQUESTS || []).map(r =>
            r.id === req.id ? { ...r, status: "rejected", approvedBy: "Priya Kapoor" } : r
          );
          window.persist('WFH_REQUESTS', window.WFH_REQUESTS);
          setWfhRequests([...window.WFH_REQUESTS]);
          window.toast("WFH rejected for " + req.empName, { icon: "x", tone: "warn" });
        };

        const approveAllWfh = () => {
          window.WFH_REQUESTS = (window.WFH_REQUESTS || []).map(r =>
            r.status === "pending" ? { ...r, status: "approved", approvedBy: "Priya Kapoor" } : r
          );
          window.persist('WFH_REQUESTS', window.WFH_REQUESTS);
          setWfhRequests([...window.WFH_REQUESTS]);
          window.toast(`All ${wfhPending.length} WFH requests approved`, { icon: "check", tone: "ok", sub: "Employees notified" });
        };

        return (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="card-head">
              <div className="card-title">WFH Requests
                <small>{wfhRequests.length} total · {wfhPending.length} pending approval</small>
              </div>
              <div className="row gap-3">
                {wfhPending.length > 0 && (
                  <span className="chip warn"><span className="dot"/>{wfhPending.length} pending</span>
                )}
                {wfhPending.length > 1 && (
                  <button className="btn primary sm" onClick={approveAllWfh}>
                    <Icon name="check" size={11}/>Approve All Pending
                  </button>
                )}
              </div>
            </div>
            {wfhRequests.length === 0 ? (
              <div className="muted fs-xs" style={{ padding: "12px 0", textAlign: "center" }}>No WFH requests found</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wfhRequests.map(req => {
                    const isPending = req.status === "pending";
                    return (
                      <tr key={req.id}>
                        <td>
                          <div className="row gap-3 center">
                            <Avatar name={req.empName || req.emp || "?"}/>
                            <div>
                              <div style={{ fontSize: 12.5, fontWeight: 500 }}>{req.empName || req.emp}</div>
                              {req.empId && <div className="fs-xs muted">{req.empId}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="fs-sm mono">
                          {req.fromDate || req.from}
                          {(req.toDate || req.to) && (req.fromDate || req.from) !== (req.toDate || req.to)
                            ? ` → ${req.toDate || req.to}` : ""}
                        </td>
                        <td className="fs-sm muted" style={{ maxWidth: 200 }}>
                          <i>"{req.reason}"</i>
                        </td>
                        <td className="fs-xs muted">{req.submittedOn || req.submitted || "—"}</td>
                        <td>
                          {req.status === "approved" && <span className="chip ok">Approved</span>}
                          {req.status === "pending" && <span className="chip warn">Pending</span>}
                          {req.status === "rejected" && <span className="chip danger">Rejected</span>}
                        </td>
                        <td>
                          {isPending ? (
                            <div className="row gap-2">
                              <button className="btn primary sm" onClick={() => approveWfh(req)}>
                                <Icon name="check" size={11}/>Approve
                              </button>
                              <button className="btn ghost sm" onClick={() => rejectWfh(req)}>
                                <Icon name="x" size={11}/>Reject
                              </button>
                            </div>
                          ) : (
                            <span className="fs-xs muted">{req.approvedBy ? `by ${req.approvedBy}` : "—"}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })()}
    </div>
  );
};

const LiveStat = ({ label, value, of, pct, color, icon, sub }) => (
  <div className="card kpi" style={{ overflow: "hidden", position: "relative" }}>
    <div style={{ position: "absolute", right: -20, top: -20, width: 80, height: 80, borderRadius: "50%",
      background: `radial-gradient(circle, ${color}30, transparent 70%)` }}/>
    <div className="row between">
      <div className="kpi-label"><Icon name={icon} size={11} color={color}/>{label}</div>
    </div>
    <div className="row gap-3" style={{ alignItems: "baseline" }}>
      <div className="kpi-value" style={{ color }}>{value}</div>
      <span className="muted fs-sm">/ {of}</span>
    </div>
    <div className="bar"><div style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}80)`, boxShadow: `0 0 10px ${color}80` }}/></div>
    <div className="fs-xs muted row gap-3 center">{sub}</div>
  </div>
);

const Heatmap = () => {
  // 5 rows (weeks) x 7 cols (Mon-Sun)
  const days = [];
  let dayCounter = 0;
  const startOffset = 5; // Nov 1, 2025 = Saturday → offset 5
  for (let i = 0; i < 35; i++) {
    const date = i - startOffset + 1;
    if (date < 1 || date > 30) {
      days.push({ empty: true });
    } else {
      const dow = (i % 7);
      const isWeekend = dow === 5 || dow === 6;
      const isHoliday = date === 5 || date === 14; // Diwali, Bhai Dooj-ish
      const isFuture = date > 25;
      const rand = ((date * 7) % 11) / 10;
      let pct = isWeekend ? 0 : isHoliday ? -1 : 0.82 + rand * 0.16;
      days.push({ date, dow, isWeekend, isHoliday, isFuture, pct });
    }
  }

  const colorFor = (d) => {
    if (d.empty) return "transparent";
    if (d.isHoliday) return "rgba(167,139,250,0.30)";
    if (d.isWeekend) return "var(--inset-3)";
    if (d.isFuture) return "var(--inset-2)";
    if (d.pct >= 0.95) return "#10B981";
    if (d.pct >= 0.90) return "#34D399";
    if (d.pct >= 0.80) return "#0e8c63";
    return "#1e3a5f";
  };

  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6, padding: "0 2px" }}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
          <div key={d} className="muted fs-xs" style={{ textAlign: "center", letterSpacing: "0.05em" }}>{d}</div>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {days.map((d, i) => (
          <div key={i} style={{
            aspectRatio: "1.4 / 1",
            background: colorFor(d),
            borderRadius: 6,
            border: d.empty ? "0" : "1px solid var(--inset-4)",
            display: "flex", flexDirection: "column", padding: "5px 7px",
            position: "relative", overflow: "hidden",
            boxShadow: d.pct >= 0.95 && !d.isWeekend && !d.isFuture ? `0 0 8px rgba(16,185,129,0.3)` : "none",
          }}>
            {!d.empty && (
              <>
                <div style={{ fontSize: 11, fontWeight: 500, color: d.isWeekend || d.isFuture ? "var(--text-muted)" : "#fff" }}>{d.date}</div>
                {!d.isWeekend && !d.isFuture && !d.isHoliday && (
                  <div className="mono" style={{ fontSize: 9, color: d.pct >= 0.85 ? "rgba(255,255,255,0.7)" : "var(--text-muted)", marginTop: "auto" }}>
                    {Math.round(d.pct * 247)}
                  </div>
                )}
                {d.isHoliday && <div style={{ fontSize: 8.5, color: "#C4B5FD", marginTop: "auto" }}>Holiday</div>}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const LegendDot = ({ color, label }) => (
  <div className="row gap-3 center">
    <span style={{ width: 10, height: 10, borderRadius: 3, background: color, border: "1px solid var(--inset-5)" }}/>
    <span className="muted">{label}</span>
  </div>
);

const ShiftRow = ({ color, label, value }) => (
  <div className="row between">
    <div className="row gap-3 center">
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color }}/>
      <span style={{ color: "var(--text-mid)" }}>{label}</span>
    </div>
    <span className="mono">{value}</span>
  </div>
);

const HolidayRow = ({ date, day, name, type, onEdit, onDelete }) => (
  <div className="row gap-4" style={{ padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
    <div style={{ width: 44, textAlign: "center" }}>
      <div className="fs-xs muted" style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}>{date.split(" ")[0]}</div>
      <div className="fw-600" style={{ fontSize: 14, lineHeight: 1 }}>{date.split(" ")[1]}</div>
    </div>
    <div className="flex-1">
      <div style={{ fontSize: 12, fontWeight: 500 }}>{name}</div>
      <div className="fs-xs muted">{day} · {type}</div>
    </div>
    {(onEdit || onDelete) && (
      <div className="row gap-1">
        {onEdit && (
          <button className="btn ghost sm" style={{ height: 24, width: 24, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onEdit} title="Edit holiday">
            <Icon name="edit" size={12}/>
          </button>
        )}
        {onDelete && (
          <button className="btn ghost sm" style={{ height: 24, width: 24, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--danger)" }} onClick={onDelete} title="Delete holiday">
            <Icon name="x" size={12}/>
          </button>
        )}
      </div>
    )}
  </div>
);

Object.assign(window, { Attendance, LegendDot });
