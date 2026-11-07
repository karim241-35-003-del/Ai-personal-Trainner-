import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { WEIGHT_LIMITS } from "../constants.js";
import "../styles/progress-pages.css";

// Today's date as YYYY-MM-DD in the user's own timezone (not UTC).
function today() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// Monday of the week that contains the given YYYY-MM-DD date.
function weekStart(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function WeightChart({ points }) {
  const W = 600, H = 220, P = { l: 44, r: 16, t: 16, b: 28 };
  const ws = points.map((p) => p.weight_kg);
  let lo = Math.min(...ws), hi = Math.max(...ws);
  if (hi - lo < 2) { lo -= 1; hi += 1; }
  const x = (i) => P.l + (points.length === 1 ? (W - P.l - P.r) / 2 : (i * (W - P.l - P.r)) / (points.length - 1));
  const y = (v) => P.t + ((hi - v) / (hi - lo)) * (H - P.t - P.b);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.weight_kg)}`).join(" ");
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Body weight over time">
      <line className="axis" x1={P.l} y1={H - P.b} x2={W - P.r} y2={H - P.b} />
      <line className="axis" x1={P.l} y1={P.t} x2={P.l} y2={H - P.b} />
      <text x={P.l - 6} y={P.t + 4} textAnchor="end">{hi.toFixed(1)}</text>
      <text x={P.l - 6} y={H - P.b} textAnchor="end">{lo.toFixed(1)}</text>
      <text x={P.l} y={H - 8}>{points[0].date}</text>
      <text x={W - P.r} y={H - 8} textAnchor="end">{points[points.length - 1].date}</text>
      <path className="line" d={path} />
      {points.map((p, i) => <circle key={p.id} className="dot" cx={x(i)} cy={y(p.weight_kg)} r="4" />)}
    </svg>
  );
}

export default function Progress() {
  const [weights, setWeights] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [date, setDate] = useState(today());
  const [kg, setKg] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.listWeights(), api.listWorkouts()])
      .then(([w, logs]) => { setWeights(w); setWorkouts(logs); })
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
  const change = byDate.length >= 2 ? byDate[byDate.length - 1].weight_kg - byDate[0].weight_kg : null;

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
    <div>
      <h1>Your progress</h1>
      <p className="muted">Track your body weight and see how often you train.</p>

      <div className="cards">
        <div className="stat">
          <span className="stat-title">Current weight</span>
          <span className="stat-value">{byDate.length ? byDate[byDate.length - 1].weight_kg : "-"}</span>
          <span className="stat-unit">kg</span>
        </div>
        <div className="stat">
          <span className="stat-title">Change since first entry</span>
          <span className="stat-value">{change === null ? "-" : `${change > 0 ? "+" : ""}${change.toFixed(1)}`}</span>
          <span className="stat-unit">kg</span>
        </div>
        <div className="stat">
          <span className="stat-title">Training days logged</span>
          <span className="stat-value">{activeDays}</span>
          <span className="stat-unit">{Math.round(totalVolume)} kg total lifted</span>
        </div>
      </div>

      <form className="card" onSubmit={onSubmit} noValidate>
        <h2>Add today's weight</h2>
        <div className="grid">
          <label>Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>Weight (kg)
            <input type="number" step="0.1" value={kg} onChange={(e) => setKg(e.target.value)} placeholder="For example: 70.5" />
          </label>
        </div>
        {fieldError && <span className="error">{fieldError}</span>}
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button className="btn" disabled={busy}>{busy ? "Saving..." : "Add weight"}</button>
        </div>
      </form>

      <div className="card">
        <h2>Weight over time</h2>
        {byDate.length === 0 ? (
          <p className="empty">No weight entries yet. Add your first one above.</p>
        ) : (
          <>
            <WeightChart points={byDate} />
            <div className="table-wrap">
              <table className="log">
                <thead><tr><th>Date</th><th>Weight</th><th></th></tr></thead>
                <tbody>
                  {[...byDate].reverse().map((w) => (
                    <tr key={w.id}>
                      <td>{w.date}</td>
                      <td>{w.weight_kg} kg</td>
                      <td><button className="btn-danger" onClick={() => onDelete(w.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2>Training days per week (last 6 weeks)</h2>
        {workouts.length === 0 ? (
          <p className="empty">Log workouts in the Workout log to see this chart.</p>
        ) : (
          <div className="week-bars" role="img" aria-label="Training days per week">
            {weeks.map((w) => (
              <div className="week-bar" key={w.start}>
                <span className="count">{w.count}</span>
                <div className="bar" style={{ height: `${(w.count / maxCount) * 100}px` }} />
                <span>{w.start.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
        <p className="muted" style={{ marginBottom: 0 }}>Bars show the week starting on that date (month-day).</p>
      </div>
    </div>
  );
}
