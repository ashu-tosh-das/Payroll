// ── Reports page ──────────────────────────────────────────────
const { useState } = React;

const Reports = () => {
  const [activeReport, setActiveReport] = useState(null);
  const [catFilter,    setCatFilter]    = useState('All');

  const categories = ['All', ...new Set(REPORTS_CATALOG.map(r => r.category))];
  const filtered   = catFilter === 'All'
    ? REPORTS_CATALOG
    : REPORTS_CATALOG.filter(r => r.category === catFilter);

  const handleExport = (fmt) => {
    window.showToast(`${activeReport.title} exported as ${fmt}`, 'success',
      `${activeReport.id}_jun2025.${fmt.toLowerCase()}`);
  };

  return (
    <div className="anim-fade">
      <PageHead title="Reports" subtitle="Pre-built analytics and exportable reports">
        {activeReport && (
          <div className="flex gap-2">
            {['PDF', 'Excel', 'CSV'].map(fmt => (
              <button key={fmt} className="btn btn-ghost btn-sm" onClick={() => handleExport(fmt)}>
                <Icon name="download" size={10}/>{fmt}
              </button>
            ))}
          </div>
        )}
      </PageHead>

      {/* Split view: catalog + active report */}
      <div style={{ display: 'grid', gridTemplateColumns: activeReport ? '300px 1fr' : '1fr', gap: 16 }}>

        {/* ── Catalog sidebar ───────────────────────────────── */}
        <div>
          {/* Category filter */}
          <div className="flex gap-1 mb-3" style={{ flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c}
                className={`btn btn-sm ${catFilter === c ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setCatFilter(c)}>
                {c}
              </button>
            ))}
          </div>

          {/* Report cards */}
          <div className="flex-col gap-2">
            {filtered.map(r => (
              <div key={r.id}
                className="card card-sm"
                style={{
                  cursor: 'default',
                  borderColor: activeReport?.id === r.id ? 'var(--accent)' : 'var(--border)',
                  background: activeReport?.id === r.id ? 'var(--accent-dim)' : 'var(--bg-2)',
                  transition: 'all var(--t-fast)',
                }}
                onClick={() => setActiveReport(activeReport?.id === r.id ? null : r)}>
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: activeReport?.id === r.id ? 'var(--accent-dim)' : 'var(--bg-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: activeReport?.id === r.id ? 'var(--accent-light)' : 'var(--text-muted)',
                  }}>
                    <i className={`fa-solid ${r.icon}`} style={{ fontSize: 14 }}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 1 }} className="truncate">
                      {r.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.category} · {r.lastRun}</div>
                  </div>
                  <Icon name={activeReport?.id === r.id ? 'chevron-right' : 'angle-right'} size={11}
                    color={activeReport?.id === r.id ? 'var(--accent-light)' : 'var(--text-muted)'}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Active report viewer ──────────────────────────── */}
        {activeReport ? (
          <ReportViewer report={activeReport}/>
        ) : (
          <div className="card">
            <EmptyState
              icon="chart-bar"
              title="Select a report"
              sub="Choose any report from the left to preview its data, charts, and export options"
              action={
                <button className="btn btn-primary btn-sm mt-2" onClick={() => setActiveReport(REPORTS_CATALOG[0])}>
                  <Icon name="chart-bar" size={11}/>Open Monthly Payroll
                </button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ── Report viewer component ───────────────────────────────────
const ReportViewer = ({ report }) => {
  const getChartData = () => {
    switch (report.id) {
      case 'monthly-payroll':
        return {
          type: 'area',
          data: PAYROLL_TREND.map(t => ({ label: t.label, value: t.gross })),
          color: '#6366F1',
          title: 'Gross Payroll by Month',
          tableHeaders: ['Period', 'Gross', 'Deductions', 'Net', 'Headcount'],
          tableRows: PAYROLL_RUNS.map(r => [
            r.period, fmtCurrency(r.totalGross), fmtCurrency(r.totalDed), fmtCurrency(r.totalNet), r.headcount,
          ]),
        };
      case 'dept-cost':
        return {
          type: 'bar',
          data: DEPT_COSTS,
          color: '#22C55E',
          title: 'Cost by Department (June 2025)',
          tableHeaders: ['Department', 'Employees', 'Total Cost', '% of Total'],
          tableRows: DEPT_COSTS.map(d => {
            const total = DEPT_COSTS.reduce((a, x) => a + x.value, 0);
            const count = EMPLOYEES.filter(e => e.dept === d.label).length;
            return [d.label, count, fmtCurrency(d.value), `${Math.round(d.value / total * 100)}%`];
          }),
        };
      case 'headcount':
        return {
          type: 'donut',
          data: DEPARTMENTS.map(d => ({ label: d.name, value: d.headcount, color: d.color })),
          title: 'Headcount by Department',
          tableHeaders: ['Department', 'Headcount', 'Active', '% Share'],
          tableRows: DEPARTMENTS.map(d => {
            const total = DEPARTMENTS.reduce((a, x) => a + x.headcount, 0);
            return [d.name, d.headcount, Math.round(d.headcount * 0.9), `${Math.round(d.headcount / total * 100)}%`];
          }),
        };
      case 'compliance':
        return {
          type: 'status',
          items: [
            { name: 'PF Filing — May 2025',       status: 'Filed',   due: 'May 15', filed: 'May 12' },
            { name: 'ESI Filing — May 2025',       status: 'Filed',   due: 'May 15', filed: 'May 13' },
            { name: 'TDS Deposition — Q4 FY2025',  status: 'Pending', due: 'Jun 7',  filed: '—' },
            { name: 'PT — Karnataka — May 2025',   status: 'Filed',   due: 'May 20', filed: 'May 18' },
            { name: 'LWF — Jun 2025',              status: 'Due',     due: 'Jun 15', filed: '—' },
          ],
          title: 'Compliance Filing Status',
          tableHeaders: ['Filing', 'Status', 'Due Date', 'Filed On'],
          tableRows: [],
        };
      case 'leave':
        return {
          type: 'bar',
          data: [
            { label: 'Casual', value: 42, color: '#6366F1' },
            { label: 'Sick',   value: 28, color: '#F59E0B' },
            { label: 'EL',     value: 65, color: '#22C55E' },
            { label: 'Unpaid', value: 8,  color: '#EF4444' },
          ],
          color: '#6366F1',
          title: 'Leave Days Taken — June 2025',
          tableHeaders: ['Leave Type', 'Days Taken', 'Employees', 'Avg Days/Emp'],
          tableRows: [
            ['Casual Leave',    42, 18, '2.3'],
            ['Sick Leave',      28, 11, '2.5'],
            ['Earned Leave',    65, 22, '3.0'],
            ['Unpaid Leave',     8,  4, '2.0'],
          ],
        };
      default:
        return {
          type: 'area',
          data: PAYROLL_TREND.map(t => ({ label: t.label, value: t.gross })),
          color: '#6366F1',
          title: 'Data Overview',
          tableHeaders: ['Period', 'Amount'],
          tableRows: PAYROLL_TREND.map(t => [t.label, fmtCurrency(t.gross)]),
        };
    }
  };

  const cfg = getChartData();
  const isCompliance = cfg.type === 'status';
  const statusColor = { Filed: 'var(--success)', Pending: 'var(--warn)', Due: 'var(--danger)' };

  return (
    <div className="flex-col gap-4 anim-fade">
      {/* Header */}
      <div className="card card-sm flex items-center justify-between">
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{report.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {report.category} · Last run: {report.lastRun}
          </div>
        </div>
        <StatusChip status="paid" label="Ready"/>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="card-title">{cfg.title}</div>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            {cfg.type === 'donut' ? 'June 2025' : 'Last 6 months'}
          </span>
        </div>

        {cfg.type === 'area' && (
          <AreaChart data={cfg.data} height={170} color={cfg.color} id={`rpt-${report.id}`}/>
        )}

        {cfg.type === 'bar' && (
          <BarChart data={cfg.data} height={170} color={cfg.color}/>
        )}

        {cfg.type === 'donut' && (
          <div className="flex items-center gap-6">
            <DonutChart segments={cfg.data} size={170} thickness={34}
              centerLabel={cfg.data.reduce((a, d) => a + d.value, 0)}
              centerSub="total headcount"/>
            <DonutLegend segments={cfg.data}/>
          </div>
        )}

        {cfg.type === 'status' && (
          <div className="flex-col gap-2">
            {cfg.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3"
                style={{ borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    Due: {item.due} · Filed: {item.filed}
                  </div>
                </div>
                <span className={`chip ${item.status === 'Filed' ? 'chip-active' : item.status === 'Pending' ? 'chip-pending' : 'chip-inactive'}`}>
                  {item.status === 'Filed' && <Icon name="check" size={9}/>}
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data table */}
      {!isCompliance && (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>{cfg.tableHeaders.map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {cfg.tableRows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      fontFamily: typeof cell === 'number' || (typeof cell === 'string' && cell.startsWith('$')) ? 'var(--font-mono)' : 'inherit',
                      fontSize: 12.5,
                    }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { Reports, ReportViewer });
