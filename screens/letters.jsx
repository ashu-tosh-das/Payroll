// Letters & Documents — automated letter generation

const LETTER_TEMPLATES = [
  { id: "TPL-01", name: "Offer Letter",            cat: "Hiring",   uses: 84, lastEdited: "Oct 12", variables: 14, icon: "user",   color: "#10B981" },
  { id: "TPL-02", name: "Appointment Letter",      cat: "Hiring",   uses: 81, lastEdited: "Oct 12", variables: 18, icon: "shield", color: "#60A5FA" },
  { id: "TPL-03", name: "Salary Certificate",      cat: "On-demand",uses: 142, lastEdited: "Sep 04", variables: 8,  icon: "coins",  color: "#F59E0B" },
  { id: "TPL-04", name: "Experience Letter",       cat: "Exit",     uses: 28, lastEdited: "Aug 21", variables: 9,  icon: "report", color: "#A78BFA" },
  { id: "TPL-05", name: "Relieving Letter",        cat: "Exit",     uses: 22, lastEdited: "Aug 21", variables: 11, icon: "file",   color: "#FB7185" },
  { id: "TPL-06", name: "Increment Letter",        cat: "Comp.",    uses: 218, lastEdited: "Apr 02", variables: 12, icon: "arrowUp",color: "#34D399" },
  { id: "TPL-07", name: "Promotion Letter",        cat: "Comp.",    uses: 41, lastEdited: "Apr 02", variables: 13, icon: "sparkle",color: "#22D3EE" },
  { id: "TPL-08", name: "Address Proof Letter",    cat: "On-demand",uses: 67, lastEdited: "Jul 18", variables: 6,  icon: "home",   color: "#93C5FD" },
];

const RECENT_LETTERS = [
  { id: "L-9928", template: "Salary Certificate", emp: "Aarav Sharma",  empId: "SO-1184", at: "Today 14:08", status: "Generated", channel: "Email", auto: true },
  { id: "L-9927", template: "Offer Letter",       emp: "Riya Saxena",   empId: "—",       at: "Today 11:32", status: "Sent", channel: "Email + WhatsApp", auto: false },
  { id: "L-9926", template: "Increment Letter",   emp: "Bhavya Patel",  empId: "SO-1129", at: "Yesterday",   status: "Acknowledged", channel: "Email", auto: true },
  { id: "L-9925", template: "Experience Letter",  emp: "Tara Wilson",   empId: "SO-1058", at: "Yesterday",   status: "Signed",  channel: "Email", auto: false },
  { id: "L-9924", template: "Address Proof",      emp: "Chitra Iyer",   empId: "SO-1167", at: "Nov 23",      status: "Generated", channel: "Self-service", auto: true },
  { id: "L-9923", template: "Promotion Letter",   emp: "Karthik Reddy", empId: "SO-1213", at: "Nov 23",      status: "Sent", channel: "Email", auto: false },
];

// ── Atlas suggestion logic ─────────────────────────────────────
function getAtlasSuggestion(emp, empIndex) {
  if (!emp) return null;
  if (emp.status === "Notice") {
    return {
      templates: ["TPL-05", "TPL-04"],
      reason: "This employee is on notice period — generate relieving documents",
    };
  }
  if (emp.tenure < 3) {
    return {
      templates: ["TPL-02"],
      reason: "Recently joined employee — an appointment letter may be needed",
    };
  }
  if (empIndex % 5 === 0) {
    return {
      templates: ["TPL-07", "TPL-06"],
      reason: "Eligible for promotion cycle — generate promotion and increment letters",
    };
  }
  return {
    templates: ["TPL-03"],
    reason: "Standard request — a salary certificate is most commonly needed",
  };
}

const Letters = () => {
  const [tpl, setTpl] = useState(LETTER_TEMPLATES[2]); // Salary Cert
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [empSearch, setEmpSearch] = useState("");
  const [empDropOpen, setEmpDropOpen] = useState(false);
  const dropRef = useRef(null);

  const empList = useMemo(() => (EMPLOYEES || []).slice(0, 20), []);

  const filteredEmps = useMemo(() => {
    const q = empSearch.trim().toLowerCase();
    if (!q) return empList;
    return empList.filter(e => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q));
  }, [empSearch, empList]);

  const empIndex = selectedEmployee ? empList.findIndex(e => e.id === selectedEmployee.id) : -1;
  const atlasSuggestion = selectedEmployee ? getAtlasSuggestion(selectedEmployee, empIndex) : null;
  const suggestedTpls = atlasSuggestion
    ? atlasSuggestion.templates.map(id => LETTER_TEMPLATES.find(t => t.id === id)).filter(Boolean)
    : [];

  // Auto-populate variables when employee is selected
  const varName       = selectedEmployee ? selectedEmployee.name : "Aarav Sharma";
  const varId         = selectedEmployee ? selectedEmployee.id : "SO-1184";
  const varDesig      = selectedEmployee ? `${selectedEmployee.role} · ${selectedEmployee.level}` : "Senior Engineer · L5";
  const varDoj        = selectedEmployee ? selectedEmployee.doj : "2023-08-12";
  const varCtc        = selectedEmployee ? fmtINR(selectedEmployee.ctc) : "₹26,40,000";
  const varDept       = selectedEmployee ? selectedEmployee.deptName : "Engineering";

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setEmpDropOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelectEmp(emp) {
    setSelectedEmployee(emp);
    setEmpSearch(emp.name);
    setEmpDropOpen(false);
  }

  function handleGenerateForDept() {
    if (!selectedEmployee) return;
    const count = empList.filter(e => e.dept === selectedEmployee.dept).length;
    window.toast(`Generating ${count} letters for ${selectedEmployee.deptName}…`, {
      icon: "cpu", tone: "ai",
      sub: `Template: ${tpl.name} · Atlas batch mode`,
    });
  }

  return (
    <div className="page">
      <PageHead title="Letters & Documents" subtitle={`Generate, e-sign, and deliver offer letters, salary certificates and ${LETTER_TEMPLATES.length - 2} other letter types automatically`}>
        <button className="btn ghost"><Icon name="upload"/>Import template</button>
        <button className="btn primary"><Icon name="plus"/>New template</button>
      </PageHead>

      <div className="grid g-cols-4">
        <MiniMetric icon="file"   label="Letters this month" value="186" delta="+24 vs Oct" tone="up"/>
        <MiniMetric icon="cpu"    label="Auto-generated"     value="142" delta="76% automation" tone="up"/>
        <MiniMetric icon="shield" label="E-signed"           value="84"  delta="DocuSign + Stamp.io" tone=""/>
        <MiniMetric icon="clock"  label="Avg turnaround"     value="42m" delta="−18 min vs Q3" tone="up"/>
      </div>

      <div className="section-head" style={{ marginTop: 18 }}>
        <h3>Templates</h3>
        <small>{LETTER_TEMPLATES.length} active · click to preview</small>
      </div>

      <div className="grid g-cols-4">
        {LETTER_TEMPLATES.map(t => {
          const isSel = t.id === tpl.id;
          return (
            <div key={t.id} onClick={() => setTpl(t)} className="card" style={{
              padding: 14, cursor: "default",
              borderColor: isSel ? `${t.color}66` : "var(--border)",
              background: isSel ? `linear-gradient(180deg, ${t.color}12, var(--inset-1))` : "var(--surface)",
              boxShadow: isSel ? `0 0 0 1px ${t.color}33, 0 0 14px ${t.color}22` : "none",
            }}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${t.color}33, ${t.color}10)`,
                  border: `1px solid ${t.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: t.color,
                }}>
                  <Icon name={t.icon} size={14}/>
                </div>
                <span className="chip" style={{ fontSize: 9.5 }}>{t.cat}</span>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{t.name}</div>
              <div className="row between" style={{ marginTop: 6 }}>
                <span className="muted fs-xs">{t.uses} uses · {t.variables} vars</span>
                <span className="muted fs-xs">Edited {t.lastEdited}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Employee selector */}
      <div className="section-head" style={{ marginTop: 16 }}>
        <h3>Select Employee</h3>
        <small>Optional — Atlas will suggest the right template and auto-fill variables</small>
      </div>

      <div className="card" style={{ padding: 14 }}>
        <div className="row gap-4" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Searchable dropdown */}
          <div ref={dropRef} style={{ position: "relative", minWidth: 260 }}>
            <div className="row gap-3" style={{
              padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--inset-1)", cursor: "pointer",
            }} onClick={() => setEmpDropOpen(v => !v)}>
              <Icon name="search" size={13} style={{ color: "var(--text-dim)" }}/>
              <input
                className="input"
                style={{ border: "none", background: "transparent", padding: 0, flex: 1, fontSize: 13, outline: "none" }}
                placeholder="Select employee (optional)…"
                value={empSearch}
                onChange={e => { setEmpSearch(e.target.value); setEmpDropOpen(true); }}
                onFocus={() => setEmpDropOpen(true)}
              />
              {selectedEmployee && (
                <span style={{ cursor: "pointer", color: "var(--text-dim)" }} onClick={e => { e.stopPropagation(); setSelectedEmployee(null); setEmpSearch(""); }}>
                  <Icon name="x" size={12}/>
                </span>
              )}
              <Icon name="chevDown" size={12} style={{ color: "var(--text-dim)" }}/>
            </div>
            {empDropOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                maxHeight: 240, overflowY: "auto",
              }}>
                {filteredEmps.length === 0 && (
                  <div className="muted fs-sm" style={{ padding: "10px 14px" }}>No employees found</div>
                )}
                {filteredEmps.map(emp => (
                  <div key={emp.id} className="row gap-3" style={{
                    padding: "8px 14px", cursor: "pointer",
                    background: selectedEmployee && selectedEmployee.id === emp.id ? "rgba(16,185,129,0.10)" : "transparent",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--inset-1)"}
                    onMouseLeave={e => e.currentTarget.style.background = selectedEmployee && selectedEmployee.id === emp.id ? "rgba(16,185,129,0.10)" : "transparent"}
                    onClick={() => handleSelectEmp(emp)}
                  >
                    <Avatar name={emp.name} size={26}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{emp.name}</div>
                      <div className="muted fs-xs">{emp.id} · {emp.role} · {emp.deptName}</div>
                    </div>
                    {emp.status !== "Active" && (
                      <span className={`chip ${emp.status === "Notice" ? "warn" : "info"}`} style={{ fontSize: 9 }}>{emp.status}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected employee badge */}
          {selectedEmployee && (
            <div className="row gap-3" style={{
              padding: "7px 12px", borderRadius: 8,
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.24)",
              flexShrink: 0,
            }}>
              <Avatar name={selectedEmployee.name} size={28}/>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{selectedEmployee.name}</div>
                <div className="muted fs-xs">{selectedEmployee.id} · {selectedEmployee.deptName}</div>
              </div>
              <span className={`chip ${selectedEmployee.status === "Notice" ? "warn" : selectedEmployee.status === "On Leave" ? "info" : "ok"}`} style={{ fontSize: 9 }}>
                {selectedEmployee.status}
              </span>
            </div>
          )}

          {/* Generate for all dept button */}
          {selectedEmployee && (
            <button className="btn ghost sm" style={{ marginLeft: "auto", alignSelf: "center" }} onClick={handleGenerateForDept}>
              <Icon name="cpu"/>
              Generate for all {selectedEmployee.deptName} ({empList.filter(e => e.dept === selectedEmployee.dept).length})
            </button>
          )}
        </div>

        {/* Atlas Suggestion Card */}
        {atlasSuggestion && suggestedTpls.length > 0 && (
          <div style={{
            marginTop: 12,
            padding: "12px 14px",
            borderRadius: 10,
            background: "linear-gradient(135deg, rgba(16,185,129,0.13), rgba(52,211,153,0.06))",
            border: "1px solid rgba(16,185,129,0.30)",
          }}>
            <div className="row gap-3" style={{ marginBottom: 8 }}>
              <span style={{ color: "#34D399" }}><Icon name="sparkle" size={15}/></span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#34D399" }}>Atlas recommends</span>
            </div>
            <div className="row gap-3" style={{ flexWrap: "wrap", marginBottom: 8 }}>
              {suggestedTpls.map(t => (
                <span key={t.id} onClick={() => setTpl(t)} style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: `linear-gradient(135deg, ${t.color}30, ${t.color}10)`,
                  border: `1px solid ${t.color}55`, color: t.color, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 5,
                  transition: "opacity 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  <Icon name={t.icon} size={11}/>
                  {t.name}
                </span>
              ))}
            </div>
            <div className="muted fs-xs">{atlasSuggestion.reason}</div>
          </div>
        )}
      </div>

      {/* Template editor + preview */}
      <div className="section-head" style={{ marginTop: 16 }}>
        <h3>{tpl.name} · Template</h3>
        <small>Variables auto-fill from employee record · WYSIWYG preview</small>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Editor / variables */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Variables<small>{selectedEmployee ? `Auto-filled from ${selectedEmployee.name}` : "Hover to highlight in preview"}</small></div>
            <button className="btn ghost sm"><Icon name="edit"/>Edit body</button>
          </div>
          <div className="col gap-3">
            <VarRow name="employee.full_name"     value={varName}   type="text" auto={!!selectedEmployee}/>
            <VarRow name="employee.id"            value={varId}     type="text" auto={!!selectedEmployee}/>
            <VarRow name="employee.designation"   value={varDesig}  type="text" auto={!!selectedEmployee}/>
            <VarRow name="employee.date_of_joining" value={varDoj}  type="date" auto={!!selectedEmployee}/>
            <VarRow name="employee.annual_ctc"    value={varCtc}    type="currency" auto={!!selectedEmployee}/>
            <VarRow name="employee.department"    value={varDept}   type="text" auto={!!selectedEmployee}/>
            <VarRow name="employee.address"       value="Koramangala, Bengaluru" type="text"/>
            <VarRow name="company.signatory"      value="Priya Kapoor · Head of People" type="text"/>
            <VarRow name="issue_date"             value="Today" type="date"/>
          </div>

          <div className="section-head" style={{ marginTop: 12 }}><h3>Delivery</h3></div>
          <div className="col gap-3">
            <DeliveryRow icon="file"  label="PDF download"    enabled/>
            <DeliveryRow icon="send"  label="Email · employee inbox" enabled/>
            <DeliveryRow icon="user"  label="Self-service portal" enabled/>
            <DeliveryRow icon="bell"  label="WhatsApp link"   enabled/>
            <DeliveryRow icon="shield" label="DocuSign for e-sign" enabled={tpl.cat === "Hiring" || tpl.cat === "Exit"}/>
          </div>

          <div className="row gap-3" style={{ marginTop: 14 }}>
            <button className="btn ghost sm" style={{ flex: 1 }}><Icon name="eye"/>Preview</button>
            <button className="btn ghost sm" style={{ flex: 1 }}>Bulk generate</button>
            <button className="btn primary sm" style={{ flex: 1.4 }}
              onClick={() => {
                if (selectedEmployee) {
                  window.toast(`Generating ${tpl.name} for ${selectedEmployee.name}…`, { icon: "sparkle", tone: "ai", sub: "Atlas auto-filled · delivering via email" });
                }
              }}
            ><Icon name="play"/>Generate & deliver</button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div style={{
            background: "linear-gradient(180deg, #FAFAF7, #F1F1EC)",
            color: "#1A1A1A",
            borderRadius: 12, padding: "28px 32px",
            border: "1px solid var(--border-strong)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.08)",
            fontSize: 11.5, lineHeight: 1.6,
            position: "relative",
            minHeight: 480,
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${tpl.color}, ${tpl.color}77)` }}/>

            <div className="row between" style={{ marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid #ddd" }}>
              <div className="row gap-3 center">
                <div style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg, #10B981, #047857)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11 }}>S1</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Source One Technologies</div>
                  <div style={{ fontSize: 9, color: "#666" }}>Koramangala, Bengaluru 560034</div>
                </div>
              </div>
              <div style={{ fontSize: 9.5, color: "#888", textAlign: "right" }}>
                Ref: SC/SO-1184/25-26<br/>
                Date: November 25, 2025
              </div>
            </div>

            {tpl.name === "Salary Certificate" && <SalaryCertBody/>}
            {tpl.name === "Offer Letter" && <OfferLetterBody/>}
            {tpl.name === "Experience Letter" && <ExperienceLetterBody/>}
            {tpl.name === "Increment Letter" && <IncrementLetterBody/>}
            {!["Salary Certificate","Offer Letter","Experience Letter","Increment Letter"].includes(tpl.name) && <GenericLetterBody tpl={tpl}/>}

            <div style={{ marginTop: 36, fontSize: 11 }}>
              For Source One Technologies Pvt. Ltd.
              <div style={{ marginTop: 28 }}>
                <div style={{ borderBottom: "1px solid #999", width: 160, paddingBottom: 2, marginBottom: 4, fontStyle: "italic", color: "#10B981", fontFamily: "cursive", fontSize: 16 }}>Priya Kapoor</div>
                <div style={{ fontWeight: 600 }}>Priya Kapoor</div>
                <div style={{ fontSize: 9.5, color: "#666" }}>Head of People · Authorised Signatory</div>
              </div>
            </div>

            <div style={{ marginTop: 16, paddingTop: 10, borderTop: "1px dashed #ddd", fontSize: 8.5, color: "#888" }}>
              This is a system-generated document with secure digital seal. Verify authenticity at sourceone.in/verify · Hash: 0x8a4f…2c91
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="section-head" style={{ marginTop: 18 }}>
        <h3>Recent letters</h3>
        <small>{RECENT_LETTERS.length} in last 7 days</small>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr><th>ID</th><th>Template</th><th>Employee</th><th>Delivery</th><th>Generated</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {RECENT_LETTERS.map(l => (
              <tr key={l.id}>
                <td className="mono muted">{l.id}</td>
                <td>{l.template}{l.auto && <span className="chip ok" style={{ marginLeft: 6, fontSize: 9 }}><Icon name="cpu" size={8}/>Auto</span>}</td>
                <td>
                  <div className="row-emp">
                    <Avatar name={l.emp} size={22}/>
                    <div><div style={{ fontSize: 12 }}>{l.emp}</div><div className="row-emp-meta">{l.empId}</div></div>
                  </div>
                </td>
                <td className="muted fs-sm">{l.channel}</td>
                <td className="muted fs-sm">{l.at}</td>
                <td><StatusChip status={l.status === "Acknowledged" || l.status === "Signed" ? "Approved" : l.status === "Sent" ? "Paid" : "Done"}/></td>
                <td><button className="iconbtn" style={{ width: 24, height: 24 }}><Icon name="download" size={11}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const VarRow = ({ name, value, type, auto }) => (
  <div className="row gap-4" style={{
    padding: "6px 10px", borderRadius: 6,
    background: auto ? "rgba(16,185,129,0.07)" : "var(--inset-1)",
    border: auto ? "1px solid rgba(16,185,129,0.25)" : "1px solid var(--border)",
  }}>
    <span className="mono fs-xs" style={{ color: "var(--accent-bright)" }}>&#123;&#123;{name}&#125;&#125;</span>
    <span className="flex-1" style={{ fontSize: 11.5, textAlign: "right", color: auto ? "#34D399" : "var(--text-mid)", fontWeight: auto ? 600 : 400 }}>{value}</span>
    {auto && <span style={{ color: "#34D399" }}><Icon name="sparkle" size={9}/></span>}
    <span className="chip" style={{ fontSize: 9 }}>{type}</span>
  </div>
);

const DeliveryRow = ({ icon, label, enabled }) => (
  <div className="row between" style={{ padding: "5px 0", borderBottom: "1px dashed var(--border)" }}>
    <div className="row gap-3 center">
      <div style={{ width: 22, height: 22, borderRadius: 6, background: enabled ? "rgba(16,185,129,0.14)" : "var(--inset-3)", color: enabled ? "#34D399" : "var(--text-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={11}/>
      </div>
      <span style={{ fontSize: 12 }}>{label}</span>
    </div>
    <Toggle on={enabled}/>
  </div>
);

// ── Letter body templates ───────────────────────────────────────
const SalaryCertBody = () => (
  <>
    <div style={{ fontWeight: 700, fontSize: 13.5, textAlign: "center", letterSpacing: "0.04em", marginBottom: 18, textTransform: "uppercase" }}>Salary Certificate</div>
    <div style={{ marginBottom: 12, color: "#444", fontWeight: 600 }}>To Whom It May Concern,</div>
    <p>This is to certify that <Hl>Aarav Sharma</Hl> (Employee ID: <Hl>SO-1184</Hl>), has been employed with Source One Technologies Pvt. Ltd. as <Hl>Senior Engineer · L5</Hl> since <Hl>August 12, 2023</Hl>.</p>
    <p>His current annual cost-to-company (CTC) is <Hl>₹26,40,000/-</Hl> (Rupees Twenty Six Lakh Forty Thousand only) inclusive of all components and statutory contributions.</p>
    <p>This certificate is issued upon the employee's request for the purpose of <Hl>visa / loan / general purpose</Hl>.</p>
  </>
);

const OfferLetterBody = () => (
  <>
    <div style={{ fontWeight: 700, fontSize: 13.5, textAlign: "center", letterSpacing: "0.04em", marginBottom: 18, textTransform: "uppercase" }}>Letter of Offer</div>
    <div style={{ marginBottom: 12, color: "#444", fontWeight: 600 }}>Dear <Hl>Riya Saxena</Hl>,</div>
    <p>We are delighted to offer you the position of <Hl>Engineer II</Hl> with Source One Technologies Pvt. Ltd. Your annual cost-to-company will be <Hl>₹18,40,000/-</Hl> (Rupees Eighteen Lakh Forty Thousand only).</p>
    <p>Your tentative date of joining will be <Hl>December 15, 2025</Hl>, reporting to <Hl>Deepak Verma</Hl> at our Bengaluru office. Detailed compensation structure, benefits, and policies are attached as Annexure A.</p>
    <p>Kindly indicate your acceptance by signing this letter electronically within 7 days. We look forward to welcoming you to the Source One family.</p>
  </>
);

const ExperienceLetterBody = () => (
  <>
    <div style={{ fontWeight: 700, fontSize: 13.5, textAlign: "center", letterSpacing: "0.04em", marginBottom: 18, textTransform: "uppercase" }}>Experience Certificate</div>
    <div style={{ marginBottom: 12, color: "#444", fontWeight: 600 }}>To Whom It May Concern,</div>
    <p>This is to certify that <Hl>Tara Wilson</Hl> was employed with Source One Technologies Pvt. Ltd. as <Hl>UX Researcher · L4</Hl> from <Hl>April 02, 2024</Hl> to <Hl>November 22, 2025</Hl>.</p>
    <p>During her tenure, Tara consistently demonstrated strong professionalism, technical depth and team collaboration. Her contributions to the customer research practice were valuable to the organization.</p>
    <p>We wish her continued success in all future endeavours.</p>
  </>
);

const IncrementLetterBody = () => (
  <>
    <div style={{ fontWeight: 700, fontSize: 13.5, textAlign: "center", letterSpacing: "0.04em", marginBottom: 18, textTransform: "uppercase" }}>Compensation Revision</div>
    <div style={{ marginBottom: 12, color: "#444", fontWeight: 600 }}>Dear <Hl>Bhavya Patel</Hl>,</div>
    <p>Following the annual performance review cycle, we are pleased to inform you that your annual cost-to-company has been revised from <Hl>₹19,60,000</Hl> to <Hl>₹22,80,000/-</Hl> — an increase of <Hl>16.3%</Hl>.</p>
    <p>This revision is effective from <Hl>April 01, 2025</Hl>. Your updated salary structure is attached as Annexure A. The revised pay will be reflected in your <Hl>April 2025</Hl> payslip onwards.</p>
    <p>Thank you for your continued contributions to Source One.</p>
  </>
);

const GenericLetterBody = ({ tpl }) => (
  <>
    <div style={{ fontWeight: 700, fontSize: 13.5, textAlign: "center", letterSpacing: "0.04em", marginBottom: 18, textTransform: "uppercase" }}>{tpl.name}</div>
    <p style={{ color: "#666", fontStyle: "italic" }}>Template content with {tpl.variables} dynamic variables. Open the editor to modify the body.</p>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.</p>
  </>
);

const Hl = ({ children }) => (
  <span style={{ background: "rgba(16,185,129,0.14)", padding: "1px 5px", borderRadius: 3, fontWeight: 600, color: "#047857" }}>{children}</span>
);

window.Letters = Letters;
