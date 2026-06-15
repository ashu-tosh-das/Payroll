// ── SVG chart components (no external dependencies) ──────────

// ── Area / Line chart ─────────────────────────────────────────
const AreaChart = ({
  data,            // Array<{ label: string, value: number }>
  height = 140,
  color  = '#6366F1',
  id     = 'area',
  showDots  = true,
  showGrid  = true,
  showXLabels = true,
  showYLabels = true,
}) => {
  const VW = 460, VH = 100;
  const PAD = { top: 8, right: 10, bottom: showXLabels ? 22 : 6, left: showYLabels ? 38 : 6 };
  const cW  = VW - PAD.left - PAD.right;
  const cH  = VH - PAD.top  - PAD.bottom;
  const vals = data.map(d => d.value);
  const maxV = Math.max(...vals) * 1.12 || 1;
  const n    = vals.length;
  const gradId = `ag-${id}`;

  const px = i  => PAD.left + (i / (n - 1)) * cW;
  const py = v  => PAD.top  + cH - (v / maxV) * cH;

  const linePts = vals.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`);
  const lineD   = `M${linePts.join(' L')}`;
  const areaD   = `${lineD} L${px(n - 1).toFixed(1)},${(PAD.top + cH).toFixed(1)} L${px(0).toFixed(1)},${(PAD.top + cH).toFixed(1)} Z`;

  // Y-axis tick values
  const yTicks = [0, 0.5, 1].map(t => ({ pct: t, val: Math.round(maxV * (1 - t)) }));

  const fmtVal = v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity={0.28}/>
          <stop offset="100%" stopColor={color} stopOpacity={0}/>
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {showGrid && yTicks.map(t => (
        <line key={t.pct}
          x1={PAD.left} y1={(PAD.top + cH * t.pct).toFixed(1)}
          x2={VW - PAD.right} y2={(PAD.top + cH * t.pct).toFixed(1)}
          stroke="rgba(255,255,255,0.06)" strokeWidth={0.6}/>
      ))}

      {/* Y labels */}
      {showYLabels && yTicks.map(t => (
        <text key={t.pct}
          x={PAD.left - 4} y={(PAD.top + cH * t.pct + 3).toFixed(1)}
          textAnchor="end" fill="rgba(255,255,255,0.30)" fontSize={7}>
          {fmtVal(t.val)}
        </text>
      ))}

      {/* Area fill */}
      <path d={areaD} fill={`url(#${gradId})`}/>

      {/* Line */}
      <path d={lineD} fill="none" stroke={color} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round"/>

      {/* Dots */}
      {showDots && vals.map((v, i) => (
        <circle key={i} cx={px(i).toFixed(1)} cy={py(v).toFixed(1)}
          r={2.5} fill={color} stroke="var(--bg-2)" strokeWidth={1.5}/>
      ))}

      {/* X labels */}
      {showXLabels && data.map((d, i) => (
        <text key={i}
          x={px(i).toFixed(1)} y={VH - 4}
          textAnchor="middle" fill="rgba(255,255,255,0.30)" fontSize={7}>
          {d.label}
        </text>
      ))}
    </svg>
  );
};

// ── Bar chart ─────────────────────────────────────────────────
const BarChart = ({
  data,           // Array<{ label: string, value: number, color?: string }>
  height = 160,
  color  = '#6366F1',
  showXLabels = true,
}) => {
  const VW = 460, VH = 110;
  const PAD = { top: 10, right: 10, bottom: showXLabels ? 22 : 6, left: 10 };
  const cW  = VW - PAD.left - PAD.right;
  const cH  = VH - PAD.top  - PAD.bottom;
  const maxV = Math.max(...data.map(d => d.value)) * 1.10 || 1;
  const n    = data.length;
  const gap  = 6;
  const bW   = (cW - gap * (n - 1)) / n;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', height, display: 'block' }}>
      {/* Grid */}
      {[0.33, 0.67, 1].map(t => (
        <line key={t}
          x1={PAD.left} y1={(PAD.top + cH * t).toFixed(1)}
          x2={VW - PAD.right} y2={(PAD.top + cH * t).toFixed(1)}
          stroke="rgba(255,255,255,0.05)" strokeWidth={0.5}/>
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.value / maxV) * cH;
        const x = PAD.left + i * (bW + gap);
        const y = PAD.top + cH - barH;
        const c = d.color || color;
        return (
          <g key={i}>
            <rect x={x.toFixed(1)} y={y.toFixed(1)}
              width={bW.toFixed(1)} height={barH.toFixed(1)}
              rx={3} fill={c} opacity={0.85}/>
            {showXLabels && (
              <text x={(x + bW / 2).toFixed(1)} y={VH - 4}
                textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={7}>
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ── Donut chart ───────────────────────────────────────────────
const DonutChart = ({
  segments,        // Array<{ label: string, value: number, color: string }>
  size = 140,
  thickness = 28,
  centerLabel,
  centerSub,
}) => {
  const cx = 70, cy = 70, outerR = 60, innerR = outerR - thickness;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;

  function polarToXY(angle, r) {
    return {
      x: cx + r * Math.cos(angle - Math.PI / 2),
      y: cy + r * Math.sin(angle - Math.PI / 2),
    };
  }

  function arcPath(start, end) {
    const large = (end - start) > Math.PI ? 1 : 0;
    const os = polarToXY(start, outerR);
    const oe = polarToXY(end,   outerR);
    const ie = polarToXY(end,   innerR);
    const is = polarToXY(start, innerR);
    const fmt = n => n.toFixed(3);
    return [
      `M${fmt(os.x)},${fmt(os.y)}`,
      `A${outerR},${outerR} 0 ${large} 1 ${fmt(oe.x)},${fmt(oe.y)}`,
      `L${fmt(ie.x)},${fmt(ie.y)}`,
      `A${innerR},${innerR} 0 ${large} 0 ${fmt(is.x)},${fmt(is.y)}`,
      'Z',
    ].join(' ');
  }

  let cursor = 0;
  const arcs = segments.map(s => {
    const angle = (s.value / total) * 2 * Math.PI;
    const path  = arcPath(cursor, cursor + angle - 0.01);
    cursor += angle;
    return { ...s, path };
  });

  return (
    <svg width={size} height={size} viewBox="0 0 140 140">
      {arcs.map((a, i) => (
        <path key={i} d={a.path} fill={a.color} opacity={0.9}/>
      ))}
      {/* Center text */}
      {centerLabel && (
        <>
          <text x="70" y="66" textAnchor="middle" fill="var(--text)"
            fontSize="18" fontWeight="800" fontFamily="Inter, sans-serif">
            {centerLabel}
          </text>
          {centerSub && (
            <text x="70" y="80" textAnchor="middle" fill="rgba(255,255,255,0.35)"
              fontSize="8" fontFamily="Inter, sans-serif">
              {centerSub}
            </text>
          )}
        </>
      )}
    </svg>
  );
};

// ── Donut legend ──────────────────────────────────────────────
const DonutLegend = ({ segments }) => {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div className="flex-col gap-2" style={{ fontSize: 12 }}>
      {segments.map((s, i) => (
        <div key={i} className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0, display: 'inline-block' }}/>
            <span style={{ color: 'var(--text-mid)' }}>{s.label}</span>
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>
            {Math.round((s.value / total) * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Spark line (tiny inline chart) ───────────────────────────
const SparkLine = ({ data, width = 80, height = 30, color = '#6366F1' }) => {
  if (!data || data.length < 2) return null;
  const maxV = Math.max(...data) || 1;
  const minV = Math.min(...data);
  const range = maxV - minV || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - minV) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// ── Exports ───────────────────────────────────────────────────
Object.assign(window, { AreaChart, BarChart, DonutChart, DonutLegend, SparkLine });
