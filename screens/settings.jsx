
const PRESET_COLORS = ["#10B981", "#60A5FA", "#F59E0B", "#EF4444", "#A78BFA"];

// RBAC-01 — default membership seed (spread across real employees)
const DEFAULT_MEMBERSHIPS = (() => {
  const emps = (typeof EMPLOYEES !== "undefined" ? EMPLOYEES : []);
  return {
    "admin":      emps.slice(0, 2).map(e => e.id),
    "payroll-mgr":emps.slice(2, 5).map(e => e.id),
    "finance":    emps.slice(5, 8).map(e => e.id),
    "hr-bp":      emps.slice(8, 11).map(e => e.id),
    "people-mgr": emps.slice(11, 13).map(e => e.id),
    "employee":   emps.slice(13, 19).map(e => e.id),
  };
})();

const Settings = ({ onSub }) => {
  const [rolesState, setRolesState] = useState(() => window.loadStore('ROLES_DATA', ROLES_DATA));
  const [selectedRole, setSelectedRole] = useState(ROLES_DATA[1] ?? ROLES_DATA[0] ?? null);
  const [overrides, setOverrides] = useState(() => window.loadStore('permission_overrides', {}));
  const [security, setSecurity] = useState(() => window.loadStore('security_policy', {"2fa": true, "session": true, "ip": false, "mfa": true}));

  // RBAC-01 — per-role member lists
  const [roleMemberships, setRoleMemberships] = useState(() =>
    window.loadStore('role_memberships', DEFAULT_MEMBERSHIPS)
  );

  // New role modal state
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({ name: "", desc: "", color: "#10B981", inheritFrom: ROLES_DATA[0].id });

  // RBAC-02 — Add Member modal state
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState("");

  const isGranted = (roleId, permId) => {
    const key = `${roleId}:${permId}`;
    if (key in overrides) return overrides[key];
    return decidePerm(roleId, permId);
  };

  const togglePerm = (permId, label) => {
    const key = `${selectedRole.id}:${permId}`;
    const cur = isGranted(selectedRole.id, permId);
    setOverrides(prev => { const next = { ...prev, [key]: !cur }; window.persist('permission_overrides', next); return next; });
    window.toast(`${cur ? "Revoked" : "Granted"}: ${label}`, {
      icon: cur ? "x" : "check",
      tone: cur ? "warn" : "ok",
      sub: `For ${selectedRole.name}`,
    });
  };

  const toggleSecurity = (k, label) => {
    const wasOn = security[k];
    setSecurity(prev => { const next = { ...prev, [k]: !prev[k] }; window.persist('security_policy', next); return next; });
    window.toast(`${label} ${!wasOn ? "enabled" : "disabled"}`, {
      icon: "shield",
      tone: !wasOn ? "ok" : "warn",
    });
  };

  const handleCreateRole = () => {
    const trimName = newRoleForm.name.trim();
    if (!trimName) {
      window.toast("Role name is required", { icon: "alert", tone: "warn" });
      return;
    }
    // Inherit permissions baseline from selected role (we copy overrides for that role)
    const inheritSrc = newRoleForm.inheritFrom;
    const newId = "ROLE-" + Date.now();
    const newRole = {
      id: newId,
      name: trimName,
      desc: newRoleForm.desc.trim(),
      color: newRoleForm.color,
      members: 0,
      custom: true,
    };
    // Copy permission grants from inherited role into overrides for new role
    const newOverrides = { ...overrides };
    PERMISSIONS.forEach(p => {
      newOverrides[`${newId}:${p.id}`] = isGranted(inheritSrc, p.id);
    });
    setOverrides(prev => { const next = { ...prev, ...newOverrides }; window.persist('permission_overrides', next); return next; });
    setRolesState(prev => { const next = [...prev, newRole]; window.persist('ROLES_DATA', next); return next; });
    setSelectedRole(newRole);
    setShowNewRole(false);
    setNewRoleForm({ name: "", desc: "", color: "#10B981", inheritFrom: ROLES_DATA[0].id });
    window.toast(`Role "${trimName}" created`, { icon: "check", tone: "ok", sub: "Add members from this screen" });
  };

  const handleDeleteRole = (role, ev) => {
    ev.stopPropagation();
    if (role.id === "admin" || role.name === "Super Admin") {
      window.toast("Cannot delete Super Admin role", { icon: "alert", tone: "danger" });
      return;
    }
    setRolesState(prev => {
      const next = prev.filter(r => r.id !== role.id);
      window.persist('ROLES_DATA', next);
      // Use fresh `next` (not stale `rolesState` closure) for fallback selection
      if (selectedRole && selectedRole.id === role.id) {
        setSelectedRole(next.find(r => r.id !== role.id) || next[0] || null);
      }
      return next;
    });
    window.toast(`Role "${role.name}" deleted`, { icon: "x", tone: "warn" });
  };

  // RBAC-03 & 04 — Add member with duplicate check + persist
  const membersOfRole = (roleId) => roleMemberships[roleId] || [];

  const openAddMember = () => {
    setMemberSearch("");
    setSelectedEmpId("");
    setShowAddMember(true);
  };

  const handleAddMember = () => {
    if (!selectedEmpId) {
      window.toast("Please select an employee", { icon: "alert", tone: "warn" });
      return;
    }
    const current = membersOfRole(selectedRole.id);
    // RBAC-03 — duplicate check
    if (current.includes(selectedEmpId)) {
      const emp = (EMPLOYEES || []).find(e => e.id === selectedEmpId);
      window.toast(`${emp?.name || selectedEmpId} is already in ${selectedRole.name}`, {
        icon: "alert", tone: "danger",
        sub: "Each employee can only appear once per role",
      });
      return;
    }
    const updated = { ...roleMemberships, [selectedRole.id]: [...current, selectedEmpId] };
    setRoleMemberships(updated);
    window.persist('role_memberships', updated);
    // Sync member count on role
    setRolesState(prev => {
      const next = prev.map(r =>
        r.id === selectedRole.id ? { ...r, members: updated[selectedRole.id].length } : r
      );
      window.persist('ROLES_DATA', next);
      return next;
    });
    const emp = (EMPLOYEES || []).find(e => e.id === selectedEmpId);
    window.toast(`${emp?.name || selectedEmpId} added to ${selectedRole.name}`, {
      icon: "check", tone: "ok",
      sub: `${selectedRole.name} now has ${updated[selectedRole.id].length} member(s)`,
    });
    setShowAddMember(false);
  };

  // RBAC-06 — Remove member from role
  const handleRemoveMember = (empId, empName) => {
    window.openModal({
      title: `Remove ${empName}?`,
      subtitle: `This will revoke ${empName}'s access under the ${selectedRole.name} role.`,
      confirmText: "Yes, remove",
      onConfirm: () => {
        const updated = {
          ...roleMemberships,
          [selectedRole.id]: membersOfRole(selectedRole.id).filter(id => id !== empId),
        };
        setRoleMemberships(updated);
        window.persist('role_memberships', updated);
        setRolesState(prev => {
          const next = prev.map(r =>
            r.id === selectedRole.id ? { ...r, members: updated[selectedRole.id].length } : r
          );
          window.persist('ROLES_DATA', next);
          return next;
        });
        window.toast(`${empName} removed from ${selectedRole.name}`, { icon: "x", tone: "warn" });
      },
    });
  };

  // RBAC-03 — filtered employee list for picker (exclude already-added)
  const currentMembers = membersOfRole(selectedRole.id);
  const allEmps = typeof EMPLOYEES !== "undefined" ? EMPLOYEES : [];
  const filteredEmps = allEmps.filter(e => {
    const alreadyIn = currentMembers.includes(e.id);
    if (alreadyIn) return false;
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return e.name.toLowerCase().includes(q) ||
           e.id.toLowerCase().includes(q) ||
           (e.dept || e.deptName || "").toLowerCase().includes(q);
  });

  return (
    <>
    <div className="page">
      <PageHead title="Roles & Access" subtitle="Role-based access control · audit-grade permissions · SOC 2 ready">
        <button className="btn ghost" onClick={() => onSub?.("permission-audit")}>
          <Icon name="log"/>Permission audit
        </button>
        <button className="btn primary" onClick={() => setShowNewRole(true)}>
          <Icon name="plus"/>New role
        </button>
      </PageHead>

      {/* New Role Inline Modal */}
      {showNewRole && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowNewRole(false); }}>
          <div className="card" style={{ width: 420, padding: 24, position: "relative" }}>
            {/* Modal header */}
            <div className="row between center" style={{ marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Create new role</div>
                <div className="muted fs-xs" style={{ marginTop: 2 }}>Define a role and its permissions</div>
              </div>
              <button className="btn ghost sm" style={{ padding: "4px 6px" }} onClick={() => setShowNewRole(false)}>
                <Icon name="x" size={13}/>
              </button>
            </div>

            <div className="col gap-5">
              {/* Role name */}
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Role name</div>
                <input
                  className="input"
                  style={{ width: "100%", height: 34 }}
                  placeholder="e.g. Payroll Approver"
                  value={newRoleForm.name}
                  onChange={e => setNewRoleForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Description</div>
                <input
                  className="input"
                  style={{ width: "100%", height: 34 }}
                  placeholder="What can this role do?"
                  value={newRoleForm.desc}
                  onChange={e => setNewRoleForm(f => ({ ...f, desc: e.target.value }))}
                />
              </div>

              {/* Color picker */}
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Role color</div>
                <div className="row gap-3">
                  {PRESET_COLORS.map(c => (
                    <div
                      key={c}
                      onClick={() => setNewRoleForm(f => ({ ...f, color: c }))}
                      style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: c, cursor: "default",
                        outline: newRoleForm.color === c ? `2px solid ${c}` : "2px solid transparent",
                        outlineOffset: 2,
                        boxShadow: newRoleForm.color === c ? `0 0 0 1px var(--bg)` : "none",
                        transition: "outline 120ms",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Inherit from */}
              <div>
                <div className="muted fs-xs fw-600" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Inherit permissions from</div>
                <select
                  className="select"
                  style={{ width: "100%", height: 34 }}
                  value={newRoleForm.inheritFrom}
                  onChange={e => setNewRoleForm(f => ({ ...f, inheritFrom: e.target.value }))}
                >
                  {rolesState.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="row gap-3" style={{ marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn ghost" onClick={() => setShowNewRole(false)}>Cancel</button>
              <button className="btn primary" onClick={handleCreateRole}>
                <Icon name="plus"/>Create role
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid g-cols-4">
        <MiniMetric icon="shield" label="Active roles" value={String(rolesState.length)} delta="2 system · 4 custom" tone=""/>
        <MiniMetric icon="user"   label="Total users" value="302" delta="247 emp + 55 system" tone=""/>
        <MiniMetric icon="lock"   label="2FA enrolled" value="98%" delta="295/302 users" tone="up"/>
        <MiniMetric icon="alert"  label="Privileged sessions" value="3" delta="Live now" tone=""/>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "300px 1fr", gap: 14, marginTop: 12 }}>
        {/* Roles list */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
            <div className="card-title">Roles</div>
          </div>
          {rolesState.map(r => {
            const isSel = r.id === selectedRole.id;
            const isSuperAdmin = r.id === "admin" || r.name === "Super Admin";
            return (
              <div key={r.id} onClick={() => setSelectedRole(r)} style={{
                padding: "11px 14px",
                cursor: "default",
                borderLeft: `2px solid ${isSel ? (r.color || "var(--accent)") : "transparent"}`,
                background: isSel ? "rgba(16,185,129,0.06)" : "transparent",
                borderBottom: "1px solid var(--inset-3)",
              }}>
                <div className="row between center">
                  <div className="row gap-3 center">
                    {r.color && (
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: r.color, flexShrink: 0,
                      }}/>
                    )}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</div>
                      <div className="muted fs-xs" style={{ marginTop: 2 }}>{r.members} {r.members === 1 ? "member" : "members"}</div>
                    </div>
                  </div>
                  <div className="row gap-2 center">
                    {!isSuperAdmin && (
                      <button
                        className="btn ghost sm"
                        style={{ padding: "2px 5px", opacity: 0.6 }}
                        onClick={(ev) => handleDeleteRole(r, ev)}
                        title="Delete role"
                      >
                        <Icon name="x" size={11}/>
                      </button>
                    )}
                    <Icon name="chevron" size={11} color="var(--text-muted)"/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Role detail */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="row gap-3 center">
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: selectedRole.color
                    ? `linear-gradient(135deg, ${selectedRole.color}33, ${selectedRole.color}22)`
                    : "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(96,165,250,0.15))",
                  border: `1px solid ${selectedRole.color ? selectedRole.color + "55" : "rgba(16,185,129,0.3)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name="shield" size={14} color={selectedRole.color || "#34D399"}/>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{selectedRole.name}</div>
                  <div className="muted fs-xs">{selectedRole.members} members · Created Aug 12, 2023</div>
                </div>
              </div>
            </div>
            <div className="row gap-3">
              <button className="btn ghost sm" onClick={() => window.toast(`Renaming "${selectedRole.name}"`, { icon: "edit", tone: "info" })}>
                <Icon name="edit"/>Rename
              </button>
              <button className="btn ghost sm danger" onClick={() => {
                const isSuperAdmin = selectedRole.id === "admin" || selectedRole.name === "Super Admin";
                if (isSuperAdmin || !selectedRole.custom) {
                  window.toast("Cannot delete system role", { icon: "alert", tone: "danger", sub: "Custom roles only" });
                } else {
                  setRolesState(prev => { const next = prev.filter(r => r.id !== selectedRole.id); window.persist('ROLES_DATA', next); return next; });
                  setSelectedRole(rolesState.find(r => r.id !== selectedRole.id) || rolesState[0]);
                  window.toast(`Role "${selectedRole.name}" deleted`, { icon: "x", tone: "warn" });
                }
              }}>
                Delete role
              </button>
            </div>
          </div>

          {/* Permission matrix */}
          <div className="section-head" style={{ marginTop: 0 }}>
            <h3>Permissions</h3>
            <small>Click toggle to grant/revoke</small>
          </div>

          <div className="col gap-3">
            {PERMISSIONS.map(p => {
              const granted = isGranted(selectedRole.id, p.id);
              return (
                <div key={p.id} className="row between" style={{
                  padding: "10px 12px", borderRadius: 8,
                  background: "var(--inset-1)",
                  border: "1px solid var(--border)",
                  cursor: "default",
                }}
                onClick={() => togglePerm(p.id, p.label)}>
                  <div className="row gap-4 center">
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: granted ? "rgba(16,185,129,0.14)" : "var(--inset-3)",
                      color: granted ? "#34D399" : "var(--text-dim)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon name={granted ? "check" : "lock"} size={11}/>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{p.label}</div>
                      <div className="muted fs-xs">{p.id}</div>
                    </div>
                  </div>
                  <Toggle on={granted}/>
                </div>
              );
            })}
          </div>

          <div className="section-head" style={{ marginTop: 20 }}>
            <h3>Security policy</h3>
          </div>
          <div className="grid g-cols-2">
            <SecurityCard icon="lock" label="2FA" value={security["2fa"] ? "Required" : "Optional"} sub="TOTP or hardware key" enabled={security["2fa"]} onToggle={() => toggleSecurity("2fa", "2FA")}/>
            <SecurityCard icon="clock" label="Session timeout" value="30 minutes" sub="Idle auto-logout" enabled={security["session"]} onToggle={() => toggleSecurity("session", "Session timeout")}/>
            <SecurityCard icon="globe" label="IP allowlist" value={security["ip"] ? "Enabled" : "Disabled"} sub="Optionally restrict by VPN" enabled={security["ip"]} onToggle={() => toggleSecurity("ip", "IP allowlist")}/>
            <SecurityCard icon="fingerprint" label="Privileged action MFA" value={security["mfa"] ? "Required" : "Optional"} sub="Re-auth for sensitive ops" enabled={security["mfa"]} onToggle={() => toggleSecurity("mfa", "Privileged MFA")}/>
          </div>

          {/* RBAC-05 — Members section (live from roleMemberships state) */}
          <div className="section-head" style={{ marginTop: 20 }}>
            <h3>Members in this role</h3>
            <div className="row gap-3 center">
              <small>{currentMembers.length} member{currentMembers.length !== 1 ? "s" : ""}</small>
              {/* RBAC-02 — Add member button */}
              <button className="btn ghost sm" onClick={openAddMember} style={{ padding: "3px 8px", fontSize: 11 }}>
                <Icon name="plus" size={11}/>Add member
              </button>
            </div>
          </div>

          {currentMembers.length === 0 ? (
            <div style={{
              padding: "28px 16px", textAlign: "center",
              border: "1px dashed var(--border)", borderRadius: 8,
              color: "var(--text-muted)", fontSize: 12,
            }}>
              No members yet — click <b>Add member</b> to assign employees to this role.
            </div>
          ) : (
            <div className="grid g-cols-3" style={{ gap: 10 }}>
              {currentMembers.map(empId => {
                const e = allEmps.find(x => x.id === empId);
                if (!e) return null;
                return (
                  <div key={e.id} className="row gap-3" style={{ padding: 10, borderRadius: 8, background: "var(--inset-1)", border: "1px solid var(--border)" }}>
                    <Avatar name={e.name} size={26}/>
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
                      <div className="muted fs-xs">{e.id} · {e.dept || e.deptName || ""}</div>
                    </div>
                    {/* RBAC-06 — Remove member */}
                    <button className="iconbtn" style={{ width: 22, height: 22 }}
                      onClick={(ev) => { ev.stopPropagation(); handleRemoveMember(e.id, e.name); }}
                      title={`Remove ${e.name}`}>
                      <Icon name="x" size={10}/>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* RBAC-02/03 — Add Member Modal */}
    {showAddMember && (
      <div style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setShowAddMember(false); }}>
        <div className="card" style={{ width: 460, padding: 24, position: "relative", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>

          {/* Modal header */}
          <div className="row between center" style={{ marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Add member to role</div>
              <div className="muted fs-xs" style={{ marginTop: 3 }}>
                Role: <span style={{ color: selectedRole.color || "var(--accent)", fontWeight: 600 }}>{selectedRole.name}</span>
                &nbsp;·&nbsp;{currentMembers.length} current member{currentMembers.length !== 1 ? "s" : ""}
              </div>
            </div>
            <button className="btn ghost sm" style={{ padding: "4px 6px" }} onClick={() => setShowAddMember(false)}>
              <Icon name="x" size={13}/>
            </button>
          </div>

          {/* RBAC-03 — Search input */}
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Icon name="search" size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}/>
            <input
              className="input"
              style={{ width: "100%", height: 36, paddingLeft: 30, boxSizing: "border-box" }}
              placeholder="Search by name, ID or department…"
              value={memberSearch}
              onChange={e => { setMemberSearch(e.target.value); setSelectedEmpId(""); }}
              autoFocus
            />
          </div>

          {/* Employee list */}
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {filteredEmps.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                {memberSearch ? "No employees match your search." : "All employees are already in this role."}
              </div>
            ) : (
              <div className="col gap-2">
                {filteredEmps.slice(0, 20).map(e => {
                  const isSel = selectedEmpId === e.id;
                  return (
                    <div key={e.id} onClick={() => setSelectedEmpId(isSel ? "" : e.id)} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 8, cursor: "default",
                      background: isSel ? "rgba(16,185,129,0.10)" : "var(--inset-1)",
                      border: `1px solid ${isSel ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
                      transition: "all 120ms",
                    }}>
                      <Avatar name={e.name} size={28}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{e.name}</div>
                        <div className="muted fs-xs">{e.id} · {e.dept || e.deptName || e.location || ""}</div>
                      </div>
                      {isSel && (
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%",
                          background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <Icon name="check" size={10} color="#fff"/>
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredEmps.length > 20 && (
                  <div className="muted fs-xs" style={{ textAlign: "center", padding: "6px 0" }}>
                    {filteredEmps.length - 20} more — refine your search
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected preview + actions */}
          {selectedEmpId && (() => {
            const e = allEmps.find(x => x.id === selectedEmpId);
            return e ? (
              <div style={{
                marginTop: 12, padding: "10px 12px", borderRadius: 8,
                background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <Icon name="check" size={12} color="#34D399"/>
                <span style={{ fontSize: 12, flex: 1 }}>
                  <b>{e.name}</b> will be added to <b>{selectedRole.name}</b>
                </span>
              </div>
            ) : null;
          })()}

          <div className="row gap-3" style={{ marginTop: 14, justifyContent: "flex-end" }}>
            <button className="btn ghost" onClick={() => setShowAddMember(false)}>Cancel</button>
            <button
              className="btn primary"
              onClick={handleAddMember}
              style={{ opacity: selectedEmpId ? 1 : 0.45 }}
            >
              <Icon name="plus"/>Add to {selectedRole.name}
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="card" style={{ borderColor: "rgba(239,68,68,0.25)" }}>
      <div className="card-head">
        <div className="card-title">Developer Tools<small>Reset persistent data</small></div>
      </div>
      <div className="row gap-3">
        <button className="btn ghost sm" style={{ borderColor: "rgba(239,68,68,0.35)", color: "#EF4444" }}
          onClick={() => window.openModal({
            title: "Reset all demo data?",
            subtitle: "This will clear all localStorage and reload the app with original seed data.",
            confirmText: "Yes, reset everything",
            onConfirm: () => window.resetAll()
          })}>
          <Icon name="x"/>Reset to demo data
        </button>
        <button className="btn ghost sm" onClick={() => {
          const keys = Object.keys(localStorage).filter(k => k.startsWith('so_'));
          window.toast(`${keys.length} stores persisted · ${keys.map(k=>k.replace('so_','')).join(', ')}`, { icon: "log", tone: "info" });
        }}>
          <Icon name="log"/>View persisted stores
        </button>
      </div>
    </div>
    </>
  );
};

// Decide if perm is granted (mock logic)
function decidePerm(roleId, permId) {
  const grants = {
    admin: ["view_payslips_all","edit_compensation","run_payroll","approve_payroll","export_pii","edit_bank","view_audit","manage_roles"],
    payroll: ["view_payslips_all","edit_compensation","run_payroll","export_pii","edit_bank","view_audit"],
    finance: ["view_payslips_all","approve_payroll","view_audit"],
    hr: ["view_payslips_all","edit_compensation","edit_bank"],
    manager: [],
    employee: [],
  };
  return grants[roleId]?.includes(permId);
}

const Toggle = ({ on }) => (
  <div style={{
    width: 32, height: 18, borderRadius: 99,
    background: on ? "linear-gradient(90deg, #10B981, #34D399)" : "rgba(255,255,255,0.10)",
    position: "relative",
    transition: "all 180ms",
    boxShadow: on ? "0 0 12px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2)" : "inset 0 1px 0 rgba(0,0,0,0.3)",
  }}>
    <div style={{
      position: "absolute", top: 2, left: on ? 16 : 2, width: 14, height: 14, borderRadius: "50%",
      background: "#fff", transition: "left 180ms cubic-bezier(.4,0,.2,1)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
    }}/>
  </div>
);

const SecurityCard = ({ icon, label, value, sub, enabled, onToggle }) => (
  <div style={{
    padding: 12, borderRadius: 10,
    background: enabled ? "linear-gradient(180deg, rgba(16,185,129,0.06), var(--inset-1))" : "var(--inset-1)",
    border: `1px solid ${enabled ? "rgba(16,185,129,0.20)" : "var(--border)"}`,
    cursor: onToggle ? "default" : "auto",
  }}
  onClick={onToggle}>
    <div className="row between">
      <div className="row gap-3 center">
        <div style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          background: enabled ? "rgba(16,185,129,0.16)" : "var(--inset-5)",
          color: enabled ? "#34D399" : "var(--text-muted)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><Icon name={icon} size={11}/></div>
        <div className="muted fs-xs fw-600" style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
      </div>
      <Toggle on={enabled}/>
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8, color: enabled ? "var(--text)" : "var(--text-muted)" }}>{value}</div>
    <div className="muted fs-xs">{sub}</div>
  </div>
);

Object.assign(window, { Settings, Toggle, SecurityCard });
