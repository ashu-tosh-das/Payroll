// Holiday Calendar — reached from Attendance & Leave
const HOLIDAYS_2025 = [
  { id: "HOL-01", date: "Jan 01", day: "Wed", name: "New Year's Day",          type: "Restricted",  loc: "All India" },
  { id: "HOL-02", date: "Jan 14", day: "Tue", name: "Pongal · Makar Sankranti", type: "Regional",   loc: "Karnataka, TN" },
  { id: "HOL-03", date: "Jan 26", day: "Sun", name: "Republic Day",             type: "Gazetted",   loc: "All India" },
  { id: "HOL-04", date: "Mar 14", day: "Fri", name: "Holi",                     type: "Gazetted",   loc: "All India" },
  { id: "HOL-05", date: "Mar 31", day: "Mon", name: "Eid-ul-Fitr",              type: "Gazetted",   loc: "All India" },
  { id: "HOL-06", date: "Apr 18", day: "Fri", name: "Good Friday",              type: "Restricted", loc: "All India" },
  { id: "HOL-07", date: "May 01", day: "Thu", name: "Labour Day",               type: "Gazetted",   loc: "KA, MH" },
  { id: "HOL-08", date: "Aug 15", day: "Fri", name: "Independence Day",         type: "Gazetted",   loc: "All India" },
  { id: "HOL-09", date: "Aug 27", day: "Wed", name: "Ganesh Chaturthi",         type: "Regional",   loc: "MH, KA" },
  { id: "HOL-10", date: "Oct 02", day: "Thu", name: "Gandhi Jayanti",           type: "Gazetted",   loc: "All India" },
  { id: "HOL-11", date: "Oct 20", day: "Mon", name: "Diwali (Lakshmi Pujan)",   type: "Gazetted",   loc: "All India" },
  { id: "HOL-12", date: "Oct 21", day: "Tue", name: "Govardhan Pujan",          type: "Regional",   loc: "DL, MH" },
  { id: "HOL-13", date: "Oct 22", day: "Wed", name: "Bhai Dooj",                type: "Restricted", loc: "All India" },
  { id: "HOL-14", date: "Nov 05", day: "Wed", name: "Guru Nanak Jayanti",       type: "Gazetted",   loc: "All India" },
  { id: "HOL-15", date: "Dec 25", day: "Thu", name: "Christmas Day",            type: "Gazetted",   loc: "All India" },
];

const HolidayCalendar = ({ onBack }) => {
  const [year, setYear] = useState("2025");
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? HOLIDAYS_2025 : HOLIDAYS_2025.filter(h => h.type === filter);

  const gazetted   = HOLIDAYS_2025.filter(h => h.type === "Gazetted").length;
  const restricted = HOLIDAYS_2025.filter(h => h.type === "Restricted").length;
  const regional   = HOLIDAYS_2025.filter(h => h.type === "Regional").length;

  return (
    <div className="page">
      <div className="row gap-3 center" style={{ marginBottom: 8 }}>
        <button className="btn ghost sm" onClick={onBack}><Icon name="chevron" size={11} style={{ transform: "rotate(180deg)" }}/>Back to Attendance</button>
      </div>
      <PageHead title="Holiday Calendar 2025" subtitle="Gazetted, restricted & regional holidays · Source One India locations">
        <select className="select" value={year} onChange={(e) => setYear(e.target.value)}>
          <option>2024</option><option>2025</option><option>2026</option>
        </select>
        <button className="btn ghost"><Icon name="download"/>Export ICS</button>
        <button className="btn primary"><Icon name="plus"/>Add holiday</button>
      </PageHead>

      <div className="grid g-cols-4">
        <MiniMetric icon="calendar" label="Total holidays" value={HOLIDAYS_2025.length} delta="Plus 2 floating" tone=""/>
        <MiniMetric icon="check"    label="Gazetted"       value={gazetted}     delta="Mandatory · all India" tone="up"/>
        <MiniMetric icon="globe"    label="Regional"       value={regional}     delta="State-specific" tone=""/>
        <MiniMetric icon="user"     label="Restricted"     value={restricted}   delta="Floating · employee choice" tone=""/>
      </div>

      <div className="row gap-3" style={{ marginTop: 14 }}>
        <div className="tabs">
          {[["all","All"],["Gazetted","Gazetted"],["Regional","Regional"],["Restricted","Restricted"]].map(([k,l]) => (
            <button key={k} data-active={filter === k} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="grid g-cols-3" style={{ marginTop: 14, gap: 12 }}>
        {filtered.map((h) => {
          // Treat anything before "today" within the calendar year as past.
          // App's demo "today" is Nov 25 — drive isPast off the date string.
          const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          const TODAY_M = 10, TODAY_D = 25; // Nov 25
          const [mm, dd] = h.date.split(" ");
          const monthIdx = MONTHS.indexOf(mm);
          const day = parseInt(dd, 10);
          const isPast = monthIdx < TODAY_M || (monthIdx === TODAY_M && day < TODAY_D);
          const toneColor = h.type === "Gazetted" ? "#10B981" : h.type === "Regional" ? "#60A5FA" : "#A78BFA";
          return (
            <div key={h.date} className="card" style={{
              padding: 16, position: "relative", overflow: "hidden",
              opacity: isPast ? 0.65 : 1,
              borderColor: isPast ? "var(--border)" : `${toneColor}40`,
            }}>
              {!isPast && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, ${toneColor}, ${toneColor}50)` }}/>}
              <div className="row gap-5 center">
                <div style={{
                  width: 60, height: 60, borderRadius: 12,
                  background: `linear-gradient(135deg, ${toneColor}22, ${toneColor}08)`,
                  border: `1px solid ${toneColor}30`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <div className="muted fs-xs" style={{ letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 600 }}>{h.date.split(" ")[0]}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: toneColor, letterSpacing: "-0.02em", lineHeight: 1 }}>{h.date.split(" ")[1]}</div>
                </div>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>{h.name}</div>
                  <div className="row gap-3 center" style={{ flexWrap: "wrap" }}>
                    <span className="chip" style={{ fontSize: 9.5 }}>{h.day}</span>
                    <span className="chip" style={{ fontSize: 9.5, color: toneColor, borderColor: `${toneColor}40`, background: `${toneColor}14` }}>{h.type}</span>
                  </div>
                  <div className="muted fs-xs" style={{ marginTop: 6 }}>{h.loc}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <div className="card-title">Floating holidays<small>Restricted holidays — employees pick 2 from this list per year</small></div>
        </div>
        <div className="muted fs-sm" style={{ lineHeight: 1.6 }}>
          Restricted holidays are optional. Each employee can choose <b style={{ color: "var(--text)" }}>2 floating holidays</b> per calendar year from the Restricted list. Selections must be made by Mar 31. Default fallback: Christmas + Diwali.
        </div>
      </div>
    </div>
  );
};

window.HolidayCalendar = HolidayCalendar;
