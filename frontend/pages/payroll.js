// ── Payroll Run page ──────────────────────────────────────────
const { useState, useMemo } = React;

const STEPS = ['Generate', 'Review', 'Approve', 'Transfer'];

const Payroll = () => {
  const [runIndex,    setRunIndex]    = useState(0);  // 0 = current (Jun), 1 = May, etc.
  const [step,        setStep]        = useState(0);  // 0=Generate,1=Review,2=Approve,3=Transfer
  const [generating,  setGenerating]  = useState(false);
  const [lineItems,   setLineItems]   = useState(null); // null = not yet generated
  const [searchEmp,   setSearchEmp]   = useState('');
  const [filterDept,  setFilterDept]  = useState('all');
  const [showPayslip, setShowPayslip] = useState(null);

  const run = PAYROLL_RUNS[runIndex];
  const isPastRun = run.status === 'paid';

  // For past runs, show their data directly
  const displayItems = isPastRun ? run.lineItems : lineItems;

  const filteredItems = useMemo(() => {
    if (!displayItems) return [];
    return displayItems.filter(r => {
      const q = searchEmp.toLowerCase();
      const matchQ = !q || r.empName.toLowerCase().includes(q);
      const matchD = filterDept === 'all' || r.dept === filterDept;
      return matchQ && matchD;
    });
  }, [displayItems, searchEmp, filterDept]);

  const totals = useMemo(() => ({
    gross: filteredItems.reduce((a, r) => a + r.gross, 0),
    ded:   filteredItems.reduce((a, r) => a + r.ded,   0),
    net:   filteredItems.reduce((a, r) => a + r.net,   0),
  }), [filteredItems]);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setLineItems(run.lineItems.map(r => ({ ...r })));
      setStep(1);
      setGenerating(false);
      window.showToast('Payroll generated', 'success', `${run.headcount} employees · ${fmtCurrency(run.totalGross, true)}`);
    }, 1400);
  };

  const handleApprove = () => {
    setStep(3);
    window.showToast('Payroll approved', 'success', 'Pending fund transfer');
  };

  const handleTransfer = () => {
    setStep(4); // done
    window.showToast('Transfer initiated', 'success', 'Salary credited in 1–2 business days');
  };

  // When switching runs, reset state
  const switchRun = (idx) => {
    setRunIndex(idx);
    setLineItems(null);
    setStep(0);
    setSearchEmp('');
    setFilterDept('all');
  };

  const currentStep = isPastRun ? 4 : step;

  return (
    <div className="anim-fade">
      <PageHead title="Payroll Run" subtitle="Generate, review, and approve monthly payroll">
        <button className="btn btn-ghost btn-sm"
          onClick={() => window.showToast('Payroll report downloaded', 'success', `payroll_${run.period.replace(' ', '_')}.pdf`)}>
          <Icon name="download" size={11}/>Download Report
        </button>
        {!isPastRun && currentStep === 4 && (
          <button className="btn btn-ghost btn-sm"
            onClick={() => window.showToast('Payslips sent to all employees', 'success', `${run.headcount} emails dispatched`)}>
            <Icon name="paper-plane" size={11}/>Send Payslips
          </button>
        )}
      </PageHead>

      {/* Run selector tabs */}
      <div className="flex gap-2 mb-5" style={{ flexWrap: 'wrap' }}>
        {PAYROLL_RUNS.map((r, i) => (
          <button key={r.period}
            className={`btn btn-sm ${i === runIndex ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => switchRun(i)}>
            {r.period}
            {r.status === 'current' && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', marginLeft: 3,
                animation: 'pulse 1.5s ease infinite', display: 'inline-block' }}/>
            )}
            {r.status === 'paid' && <Icon name="check" size={9}/>}
          </button>
        ))}
      </div>

      {/* Steps */}
      {!isPastRun && (
        <div className="card mb-5">
          <StepIndicator steps={STEPS} current={Math.min(currentStep, 3)}/>
        </div>
      )}

      {/* Summary KPI row */}
      <div className="g-4 mb-5">
        {[
          { label: 'Gross Pay',   value: fmtCurrency(run.totalGross, true), icon: 'circle-arrow-up', iconBg: 'var(--accent-dim)',  iconColor: 'var(--accent-light)' },
          { label: 'Deductions',  value: fmtCurrency(run.totalDed, true),   icon: 'circle-minus',    iconBg: 'var(--danger-dim)',  iconColor: 'var(--danger)' },
          { label: 'Net Payout',  value: fmtCurrency(run.totalNet, true),   icon: 'money-bill-wave', iconBg: 'var(--success-dim)', iconColor: 'var(--success)' },
          { label: 'Headcount',   value: run.headcount,                      icon: 'users',           iconBg: 'var(--warn-dim)',    iconColor: 'var(--warn)' },
        ].map(k => <MiniMetric key={k.label} {...k}/>)}
      </div>

      {/* Generate CTA (step 0 for current run) */}
      {!isPastRun && step === 0 && (
        <div className="card mb-5" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ marginBottom: 12, opacity: 0.5 }}>
            <Icon name="money-bill-wave" size={40} color="var(--accent)"/>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            Ready to generate {run.period} payroll?
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
            This will calculate salaries, taxes, and deductions for all {run.headcount} active employees.
          </p>
          <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={generating}>
            {generating ? <Spinner/> : <Icon name="play" size={13}/>}
            {generating ? 'Generating…' : 'Generate Payroll'}
          </button>
        </div>
      )}

      {/* Approval actions (step 1 = Review) */}
      {!isPastRun && step === 1 && (
        <div className="card mb-4 flex items-center justify-between">
          <div>
            <div style={{ fontWeight: 600 }}>Payroll Ready for Review</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {run.headcount} employees · {fmtCurrency(run.totalNet, true)} net payout
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={() => { setStep(0); setLineItems(null); }}>
              <Icon name="arrows-rotate" size={11}/>Re-generate
            </button>
            <button className="btn btn-success" onClick={handleApprove}>
              <Icon name="check" size={11}/>Approve Payroll
            </button>
          </div>
        </div>
      )}

      {/* Transfer action (step 2 = Approved) */}
      {!isPastRun && step === 3 && (
        <div className="card mb-4 flex items-center justify-between"
          style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}>
          <div className="flex items-center gap-3">
            <Icon name="circle-check" size={20} color="var(--success)"/>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--success)' }}>Payroll Approved</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Initiate bank transfer to release salaries</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleTransfer}>
            <Icon name="building-columns" size={11}/>Initiate Transfer
          </button>
        </div>
      )}

      {/* Transfer complete */}
      {(!isPastRun && step === 4) && (
        <div className="card mb-4 flex items-center gap-3"
          style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}>
          <Icon name="circle-check" size={20} color="var(--success)"/>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--success)' }}>Transfer Initiated</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Salaries will be credited within 1–2 business days
            </div>
          </div>
        </div>
      )}

      {/* Payslip register table (visible after generation or for past runs) */}
      {(displayItems) && (
        <div className="card" style={{ padding: 0 }}>
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="card-title">Payslip Register<small>{run.period}</small></div>
            <div className="flex gap-2">
              <div className="search-bar" style={{ width: 200 }}>
                <Icon name="magnifying-glass" size={11} color="var(--text-muted)"/>
                <input placeholder="Search employee…" value={searchEmp} onChange={e => setSearchEmp(e.target.value)}/>
              </div>
              <select className="form-select" style={{ width: 160 }}
                value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                <option value="all">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th className="td-right">Gross</th>
                  <th className="td-right">Tax</th>
                  <th className="td-right">Benefits Ded.</th>
                  <th className="td-right">Net Pay</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(r => (
                  <tr key={r.empId}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={r.empName} size="sm"/>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12.5 }}>{r.empName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.empId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-mid)' }}>{r.dept}</td>
                    <td className="td-right td-mono">{fmtCurrency(r.gross)}</td>
                    <td className="td-right td-mono" style={{ color: 'var(--danger)' }}>−{fmtCurrency(r.tax)}</td>
                    <td className="td-right td-mono" style={{ color: 'var(--warn)' }}>−{fmtCurrency(r.benefits)}</td>
                    <td className="td-right td-mono" style={{ fontWeight: 700, color: 'var(--success)' }}>
                      {fmtCurrency(r.net)}
                    </td>
                    <td><StatusChip status={r.status}/></td>
                    <td>
                      <button className="icon-btn" style={{ width: 26, height: 26 }} title="View payslip"
                        onClick={() => setShowPayslip(r)}>
                        <Icon name="eye" size={11}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>Total · {filteredItems.length} employees</td>
                  <td className="td-right td-mono">{fmtCurrency(totals.gross)}</td>
                  <td className="td-right td-mono" style={{ color: 'var(--danger)' }}>
                    −{fmtCurrency(Math.round(totals.ded * 0.6))}
                  </td>
                  <td className="td-right td-mono" style={{ color: 'var(--warn)' }}>
                    −{fmtCurrency(Math.round(totals.ded * 0.4))}
                  </td>
                  <td className="td-right td-mono" style={{ fontWeight: 700, color: 'var(--success)' }}>
                    {fmtCurrency(totals.net)}
                  </td>
                  <td colSpan={2}/>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Payslip detail modal */}
      <Modal open={!!showPayslip} onClose={() => setShowPayslip(null)}
        title="Payslip Detail" size="sm"
        footer={
          <button className="btn btn-primary" onClick={() => {
            window.showToast('Payslip downloaded', 'success', `${showPayslip?.empId}_${run.period}.pdf`);
          }}>
            <Icon name="download" size={11}/>Download PDF
          </button>
        }>
        {showPayslip && (
          <div className="flex-col gap-3">
            <div className="flex items-center gap-3" style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--bg-3)' }}>
              <Avatar name={showPayslip.empName} size="lg"/>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{showPayslip.empName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{showPayslip.empId} · {showPayslip.dept}</div>
              </div>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-mid)', fontSize: 12, marginBottom: -4 }}>Pay Period: {run.period}</div>
            {[
              { key: 'Gross Salary',    val: fmtCurrency(showPayslip.gross),    color: 'var(--text)' },
              { key: 'Income Tax',      val: `−${fmtCurrency(showPayslip.tax)}`, color: 'var(--danger)' },
              { key: 'Benefits Dedn.',  val: `−${fmtCurrency(showPayslip.benefits)}`, color: 'var(--warn)' },
              { key: 'Net Pay',         val: fmtCurrency(showPayslip.net),       color: 'var(--success)' },
            ].map(r => (
              <div key={r.key} className="info-row">
                <span className="info-key">{r.key}</span>
                <span style={{ fontWeight: 600, color: r.color, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.val}</span>
              </div>
            ))}
            <ProgressBar value={showPayslip.net} max={showPayslip.gross} color="var(--success)"/>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
              Net = {Math.round(showPayslip.net / showPayslip.gross * 100)}% of gross
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

Object.assign(window, { Payroll });
