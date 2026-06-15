// ── Dashboard page ────────────────────────────────────────────
const { useState, useMemo } = React;

const Dashboard = () => {
  const totalGross   = PAYROLL_RUNS[0].totalGross;
  const activeCount  = EMPLOYEES.filter(e => e.status === 'active').length;
  const onLeaveCount = EMPLOYEES.filter(e => e.status === 'leave').length;
  const prevGross    = PAYROLL_RUNS[1]?.totalGross || totalGross;
  const growthPct    = ((totalGross - prevGross) / prevGross * 100).toFixed(1);

  // Prepare chart data
  const trendData = PAYROLL_TREND.map(t => ({ label: t.label, value: t.gross }));
  const deptCostData = DEPT_COSTS.map(d => ({ label: d.label.slice(0, 4), value: d.value, color: d.color }));
  const headcountData = DEPARTMENTS.map(d => ({ label: d.name, value: d.headcount, color: d.color }));

  const donutTotal = DEPARTMENTS.reduce((a, d) => a + d.headcount, 0);

  return (
    <div className="anim-fade">
      <PageHead
        title="Dashboard"
        subtitle={`Good morning, Priya · ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}>
        <button className="btn btn-ghost btn-sm" onClick={() => window.showToast('Report downloaded', 'success', 'dashboard_jun2025.pdf')}>
          <Icon name="download" size={11}/>Export
        </button>
        <button className="btn btn-primary btn-sm">
          <Icon name="plus" size={11}/>New Hire
        </button>
      </PageHead>

      {/* KPI row */}
      <div className="g-4 mb-4">
        <MiniMetric
          label="Total Employees"
          value={EMPLOYEES.length}
          delta={`${activeCount} active · ${onLeaveCount} on leave`}
          deltaDir="flat"
          icon="users"
          iconBg="var(--accent-dim)" iconColor="var(--accent-light)"
        />
        <MiniMetric
          label="Monthly Payroll"
          value={fmtCurrency(totalGross, true)}
          delta={`${growthPct > 0 ? '+' : ''}${growthPct}% vs last month`}
          deltaDir={growthPct >= 0 ? 'up' : 'down'}
          icon="money-bill-wave"
          iconBg="var(--success-dim)" iconColor="var(--success)"
        />
        <MiniMetric
          label="Departments"
          value={DEPARTMENTS.length}
          delta={`${DEPT_COSTS.length} with headcount`}
          deltaDir="flat"
          icon="building"
          iconBg="var(--warn-dim)" iconColor="var(--warn)"
        />
        <MiniMetric
          label="Pending Approvals"
          value="3"
          delta="Requires your action"
          deltaDir="down"
          icon="triangle-exclamation"
          iconBg="var(--danger-dim)" iconColor="var(--danger)"
        />
      </div>

      {/* Charts row */}
      <div className="g-21 mb-4">
        {/* Payroll trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="card-title">Payroll Cost Trend</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Last 6 months · Gross pay</div>
            </div>
            <div className="flex gap-2">
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--text-mid)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--chart-1)', display: 'inline-block' }}/>
                Gross
              </span>
            </div>
          </div>
          <AreaChart data={trendData} height={140} color="var(--chart-1)" id="dash-trend"/>
        </div>

        {/* Headcount by dept (donut) */}
        <div className="card">
          <div className="card-title mb-4">Headcount by Dept</div>
          <div className="flex items-center gap-4">
            <DonutChart
              segments={DEPARTMENTS.map(d => ({ label: d.name, value: d.headcount, color: d.color }))}
              centerLabel={donutTotal}
              centerSub="employees"
              size={120}
              thickness={24}
            />
            <DonutLegend
              segments={DEPARTMENTS.map(d => ({ label: d.name.split(' ')[0], value: d.headcount, color: d.color }))}
            />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="g-21">
        {/* Dept cost bars */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="card-title">Spend by Department</div>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>June 2025</span>
          </div>
          <BarChart data={deptCostData} height={130} showXLabels/>
          <div className="flex gap-4 mt-3" style={{ flexWrap: 'wrap' }}>
            {DEPT_COSTS.slice(0, 4).map(d => (
              <div key={d.label} style={{ fontSize: 11.5, color: 'var(--text-mid)' }}>
                <span style={{ color: d.color, fontWeight: 700 }}>
                  {fmtCurrency(d.value, true)}
                </span>{' '}
                {d.label.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-1">
            <div className="card-title">Recent Activity</div>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>View all</button>
          </div>
          {RECENT_ACTIVITIES.map(a => (
            <div key={a.id} className="activity-item">
              <span className="activity-dot" style={{ background: a.color }}/>
              <span className="activity-text">{a.text}</span>
              <span className="activity-time">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Dashboard });
