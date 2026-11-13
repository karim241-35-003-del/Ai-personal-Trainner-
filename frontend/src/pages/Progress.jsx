import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { WEIGHT_LIMITS } from "../constants.js";
import "../styles/progress-pages.css";

// Today's date as YYYY-MM-DD in the user's own timezone (not UTC).
function today() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// Saturday of the week that contains the given YYYY-MM-DD date (week runs Saturday to Friday).
function weekStart(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() - ((d.getDay() + 1) % 7));
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function computeBMI(weightKg, heightCm) {
  const w = Number(weightKg);
  const h = Number(heightCm);
  if (!w || !h || w <= 0 || h <= 0) return null;
  const val = w / ((h / 100) ** 2);
  const rounded = Math.round(val * 10) / 10;
  let category = "Normal";
  let cls = "normal";
  if (rounded < 18.5) {
    category = "Underweight";
    cls = "under";
  } else if (rounded >= 30) {
    category = "Obese";
    cls = "obese";
  } else if (rounded >= 25) {
    category = "Overweight";
    cls = "over";
  }
  return { value: rounded, category, cls };
}

function WeightChart({ points, height, hoveredId, onHover }) {
  const W = 620, H = 236, P = { l: 48, r: 22, t: 24, b: 32 };
  const ws = points.map((p) => p.weight_kg);
  let lo = Math.min(...ws), hi = Math.max(...ws);
  if (hi - lo < 2) { lo -= 1; hi += 1; }
  const mid = (lo + hi) / 2;

  const x = (i) => P.l + (points.length === 1 ? (W - P.l - P.r) / 2 : (i * (W - P.l - P.r)) / (points.length - 1));
  const y = (v) => P.t + ((hi - v) / (hi - lo)) * (H - P.t - P.b);

  const linePath = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.weight_kg)}`).join(" ");
  const areaPath = points.length >= 2
    ? `${linePath} L${x(points.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`
    : "";

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Body weight over time">
      <defs>
        <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e5395" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2e5395" stopOpacity="0.02" />
        </linearGradient>
        <filter id="weightLineShadow" x="-10%" y="-15%" width="120%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#1f3864" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Horizontal grid lines */}
      <line className="grid-line" x1={P.l} y1={y(hi)} x2={W - P.r} y2={y(hi)} />
      <line className="grid-line" x1={P.l} y1={y(mid)} x2={W - P.r} y2={y(mid)} />

      {/* Axes */}
      <line className="axis" x1={P.l} y1={H - P.b} x2={W - P.r} y2={H - P.b} />
      <line className="axis" x1={P.l} y1={P.t} x2={P.l} y2={H - P.b} />

      {/* Y-axis labels */}
      <text x={P.l - 8} y={y(hi) + 4} textAnchor="end">{hi.toFixed(1)}</text>
      <text x={P.l - 8} y={y(mid) + 4} textAnchor="end">{mid.toFixed(1)}</text>
      <text x={P.l - 8} y={H - P.b + 4} textAnchor="end">{lo.toFixed(1)}</text>

      {/* X-axis date labels */}
      {points.length === 1 ? (
        <text x={x(0)} y={H - 9} textAnchor="middle">{points[0].date}</text>
      ) : (
        <>
          <text x={P.l} y={H - 9}>{points[0].date}</text>
          <text x={W - P.r} y={H - 9} textAnchor="end">{points[points.length - 1].date}</text>
        </>
      )}

      {/* Shaded area under curve */}
      {areaPath && <path d={areaPath} fill="url(#weightAreaGrad)" />}

      {/* Line with drop shadow */}
      {points.length >= 2 && (
        <path className="line" d={linePath} filter="url(#weightLineShadow)" />
      )}

      {/* Data points */}
      {points.map((p, i) => {
        const cx = x(i);
        const cy = y(p.weight_kg);
        const isActive = hoveredId === p.id;
        const ptBMI = computeBMI(p.weight_kg, height);
        return (
          <g
            key={p.id}
            onMouseEnter={() => onHover(p)}
            onMouseLeave={() => onHover(null)}
          >
            {(points.length <= 8 || isActive) && (
              <text className="pt-label" x={cx} y={cy - 10} textAnchor="middle">
                {p.weight_kg}
              </text>
            )}
            <circle
              className={`dot ${isActive ? "active" : ""}`}
              cx={cx}
              cy={cy}
              r={isActive ? 6.5 : 4.5}
              filter="url(#weightLineShadow)"
            >
              <title>{`${p.date}: ${p.weight_kg} kg${ptBMI ? ` • BMI ${ptBMI.value} (${ptBMI.category})` : ""}`}</title>
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

export default function Progress() {
  const [weights, setWeights] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [date, setDate] = useState(today());
  const [kg, setKg] = useState("");
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.listWeights(), api.listWorkouts(), api.getProfile()])
      .then(([w, logs, p]) => {
        setWeights(w);
        setWorkouts(logs);
        setProfile(p);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const byDate = useMemo(() => [...weights].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)), [weights]);

  // Sessions per week for the last 6 weeks (a "session" = one day with at least one entry).
  const weeks = useMemo(() => {
    const start = weekStart(today());
    const list = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(start + "T00:00:00");
      d.setDate(d.getDate() - i * 7);
      list.push(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10));
    }
    return list.map((s) => ({
      start: s,
      count: new Set(workouts.filter((w) => weekStart(w.date) === s).map((w) => w.date)).size,
    }));
  }, [workouts]);
  const maxCount = Math.max(1, ...weeks.map((w) => w.count));

  const totalVolume = workouts.reduce((sum, w) => sum + w.sets * w.reps * w.weight_kg, 0);
  const activeDays = new Set(workouts.map((w) => w.date)).size;

  const latestWeight = byDate.length ? byDate[byDate.length - 1].weight_kg : null;
  const initialWeight = byDate.length ? byDate[0].weight_kg : null;
  const change = byDate.length >= 2 ? latestWeight - initialWeight : null;

  const currentBMI = latestWeight !== null ? computeBMI(latestWeight, profile?.height) : null;
  const initialBMI = initialWeight !== null ? computeBMI(initialWeight, profile?.height) : null;
  const bmiChange = (currentBMI && initialBMI && byDate.length >= 2)
    ? Math.round((currentBMI.value - initialBMI.value) * 10) / 10
    : null;

  const hoveredBMI = hoveredPoint ? computeBMI(hoveredPoint.weight_kg, profile?.height) : null;
  const previewBMI = kg && !Number.isNaN(Number(kg)) && Number(kg) > 0
    ? computeBMI(kg, profile?.height)
    : null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = Number(kg);
    if (!date) { setFieldError("Choose a date."); return; }
    if (kg === "" || Number.isNaN(v) || v < WEIGHT_LIMITS.min || v > WEIGHT_LIMITS.max) {
      setFieldError(`Weight must be between ${WEIGHT_LIMITS.min} and ${WEIGHT_LIMITS.max} kg.`);
      return;
    }
    setFieldError("");
    setBusy(true);
    try {
      const entry = await api.addWeight({ date, weight_kg: v });
      setWeights((list) => [entry, ...list]);
      setKg("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this weight entry?")) return;
    setError("");
    try {
      await api.deleteWeight(id);
      setWeights((list) => list.filter((w) => w.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading your progress...</p>;

  return (
    <div className="pg-page">
      <div className="pg-header">
        <div>
          <h1>Your progress</h1>
          <p className="muted">Track your body weight, BMI trend, and see how consistent your training is over time.</p>
        </div>
        {profile?.height ? (
          <span className="muted" style={{ fontSize: "13px" }}>
            Height: <strong>{profile.height} cm</strong> (<Link to="/profile">Edit</Link>)
          </span>
        ) : (
          <Link className="pg-btn" to="/profile" style={{ textDecoration: "none", fontSize: "13px", padding: "6px 14px" }}>
            Add height in Profile for BMI
          </Link>
        )}
      </div>

      <div className="pg-stats">
        <div className="pg-stat">
          <span className="stat-title">Current weight</span>
          <span className="stat-value">{latestWeight !== null ? latestWeight : "-"}</span>
          <span className="stat-unit">
            {currentBMI ? `kg • BMI ${currentBMI.value} (${currentBMI.category})` : "kg"}
          </span>
        </div>

        <div className="pg-stat">
          <span className="stat-title">Current BMI</span>
          <span className="stat-value">{currentBMI ? currentBMI.value : "-"}</span>
          <span className="stat-unit">
            {currentBMI ? (
              <span className={`pg-bmi-pill ${currentBMI.cls}`}>{currentBMI.category}</span>
            ) : profile?.height ? (
              "Log weight to see BMI"
            ) : (
              <Link to="/profile">Add height in Profile</Link>
            )}
          </span>
        </div>

        <div className="pg-stat">
          <span className="stat-title">Weight &amp; BMI change</span>
          <span className="stat-value">{change === null ? "-" : `${change > 0 ? "+" : ""}${change.toFixed(1)}`}</span>
          <span className="stat-unit">
            {change === null
              ? "Need 2+ entries"
              : bmiChange !== null
                ? `kg (${bmiChange > 0 ? "+" : ""}${bmiChange.toFixed(1)} BMI points)`
                : "kg since first entry"}
          </span>
        </div>

        <div className="pg-stat">
          <span className="stat-title">Training days logged</span>
          <span className="stat-value">{activeDays}</span>
          <span className="stat-unit">{Math.round(totalVolume)} kg total lifted</span>
        </div>
      </div>

      <form className="pg-card" onSubmit={onSubmit} noValidate>
        <div className="pg-card-head">
          <h2>Add today's weight</h2>
        </div>
        <div className="grid">
          <label>Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>Weight (kg)
            <input type="number" step="0.1" value={kg} onChange={(e) => setKg(e.target.value)} placeholder="For example: 70.5" />
            {previewBMI && (
              <div className="pg-bmi-preview">
                <span>BMI: <strong>{previewBMI.value}</strong></span>
                <span className={`pg-bmi-pill ${previewBMI.cls}`}>{previewBMI.category}</span>
                <span className="muted">({profile.height} cm height)</span>
              </div>
            )}
          </label>
        </div>
        {fieldError && <span className="error">{fieldError}</span>}
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button className="pg-btn" disabled={busy}>{busy ? "Saving..." : "Add weight"}</button>
        </div>
      </form>

      <div className="pg-card">
        <div className="pg-card-head">
          <h2>Weight &amp; BMI over time</h2>
          {hoveredPoint && (
            <span className="pg-hover-pill">
              {hoveredPoint.date} • {hoveredPoint.weight_kg} kg
              {hoveredBMI ? ` • BMI ${hoveredBMI.value} (${hoveredBMI.category})` : ""}
            </span>
          )}
        </div>

        {byDate.length === 0 ? (
          <p className="empty">No weight entries yet. Add your first one above.</p>
        ) : (
          <>
            <div className="pg-chart-box">
              <WeightChart
                points={byDate}
                height={profile?.height}
                hoveredId={hoveredPoint?.id ?? null}
                onHover={setHoveredPoint}
              />
            </div>

            <div className="pg-table-wrap">
              <table className="pg-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Weight</th>
                    <th>BMI</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[...byDate].reverse().map((w) => {
                    const rowBMI = computeBMI(w.weight_kg, profile?.height);
                    return (
                      <tr key={w.id}>
                        <td>{w.date}</td>
                        <td><span className="pg-weight-pill">{w.weight_kg} kg</span></td>
                        <td>
                          {rowBMI ? (
                            <span className={`pg-bmi-pill ${rowBMI.cls}`}>
                              {rowBMI.value} • {rowBMI.category}
                            </span>
                          ) : (
                            <span className="muted">-</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button className="pg-delete-btn" onClick={() => onDelete(w.id)}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="pg-card">
        <div className="pg-card-head">
          <h2>Training days per week (last 6 weeks)</h2>
        </div>

        {workouts.length === 0 ? (
          <p className="empty">Log workouts in the Workout log to see this chart.</p>
        ) : (
          <div className="pg-bars-box">
            <div className="week-bars" role="img" aria-label="Training days per week">
              {weeks.map((w) => {
                const barHeight = w.count === 0 ? 4 : Math.max(12, Math.round((w.count / maxCount) * 116));
                return (
                  <div className="week-bar" key={w.start} title={`Week of ${w.start}: ${w.count} day(s)`}>
                    <span className={`count ${w.count === 0 ? "zero" : ""}`}>{w.count}</span>
                    <div
                      className={`bar ${w.count === 0 ? "empty-bar" : ""}`}
                      style={{ height: `${barHeight}px` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="pg-week-labels">
              {weeks.map((w) => (
                <span className="pg-week-label" key={w.start}>{w.start.slice(5)}</span>
              ))}
            </div>
          </div>
        )}
        <p className="muted" style={{ marginBottom: 0 }}>Bars show the week starting on that date (month-day).</p>
      </div>
    </div>
  );
}
