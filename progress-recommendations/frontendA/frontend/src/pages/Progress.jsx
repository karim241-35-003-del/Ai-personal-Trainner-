import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { EXERCISES, LOG_LIMITS } from "../constants.js";
import { todayStr, compareWeeks, weeklyBlocks, percentChange, personalBests } from "../utils/progress.js";
import LineChart from "../components/LineChart.jsx";
import BarChart from "../components/BarChart.jsx";

const exLabel = (v) => EXERCISES.find((e) => e.value === v)?.label ?? v;

function changeText(cur, prev) {
  const pct = percentChange(cur, prev);
  if (pct === null) return "new";
  if (pct === 0) return "no change";
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

export default function Progress() {
  const [workouts, setWorkouts] = useState([]);
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [date, setDate] = useState(todayStr());
  const [kg, setKg] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([api.getWorkouts(), api.getBodyWeights()])
      .then(([w, b]) => {
        setWorkouts(w);
        setWeights([...b].sort((x, y) => x.date.localeCompare(y.date)));
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const onAddWeight = async (e) => {
    e.preventDefault();
    setFormError("");
    const lim = LOG_LIMITS.bodyWeight;
    if (!date) return setFormError("Choose a date.");
    if (date > todayStr()) return setFormError("The date cannot be in the future.");
    if (kg === "" || Number.isNaN(Number(kg))) return setFormError("Enter your weight in kg.");
    if (Number(kg) < lim.min || Number(kg) > lim.max) return setFormError(`Weight must be between ${lim.min} and ${lim.max} kg.`);
    setSaving(true);
    try {
      await api.addBodyWeight({ date, weight: Number(kg) });
      setKg("");
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDeleteWeight = async (id) => {
    try { await api.deleteBodyWeight(id); await load(); } catch (err) { setFormError(err.message); }
  };

  if (loading) return <p>Loading your progress...</p>;
  if (loadError) return <p className="error">{loadError}</p>;

  const { current, previous } = compareWeeks(workouts);
  const blocks = weeklyBlocks(workouts);
  const bests = personalBests(workouts);
  const first = weights[0], latest = weights.at(-1);
  const total = latest && first ? Math.round((latest.weight - first.weight) * 10) / 10 : null;

  const rows = [
    ["Training days", current.sessions, previous.sessions],
    ["Sets", current.sets, previous.sets],
    ["Total reps", current.reps, previous.reps],
    ["Volume (kg)", current.volume, previous.volume],
  ];

  return (
    <div>
      <h1>Your progress</h1>

      <div className="card">
        <h2>Body weight</h2>
        <form className="inline-form" onSubmit={onAddWeight} noValidate>
          <label>Date
            <input type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>Weight (kg)
            <input type="number" inputMode="decimal" step="0.1" value={kg} onChange={(e) => setKg(e.target.value)} />
          </label>
          <button className="btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Add"}</button>
        </form>
        {formError && <span className="error">{formError}</span>}
        {latest && (
          <p className="muted">
            Latest: <strong>{latest.weight} kg</strong> ({latest.date})
            {total !== null && weights.length > 1 && <> | Change since first entry: <strong>{total > 0 ? "+" : ""}{total} kg</strong></>}
          </p>
        )}
        <LineChart points={weights.map((w) => ({ x: w.date.slice(5), y: w.weight }))} unit="kg" />
        {weights.length > 0 && (
          <details>
            <summary className="muted">Edit entries</summary>
            <ul>
              {[...weights].reverse().map((w) => (
                <li key={w.id}>
                  {w.date}: {w.weight} kg{" "}
                  <button className="link-btn danger" onClick={() => onDeleteWeight(w.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <div className="card">
        <h2>This week compared with last week</h2>
        <p className="muted">This week = the last 7 days including today. Last week = the 7 days before that.</p>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th></th><th>This week</th><th>Last week</th><th>Change</th></tr></thead>
            <tbody>
              {rows.map(([name, cur, prev]) => (
                <tr key={name}><td>{name}</td><td>{cur}</td><td>{prev}</td><td>{changeText(cur, prev)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Weekly training volume</h2>
        <p className="muted">Volume = sets x reps x weight, for the last 6 weeks. Each bar is labelled with the last day of that week.</p>
        {workouts.length === 0
          ? <p className="muted">Log some workouts to see this chart.</p>
          : <BarChart bars={blocks.map((b) => ({ label: b.label, value: b.volume }))} unit="kg" />}
      </div>

      <div className="card">
        <h2>Personal bests</h2>
        {bests.length === 0 ? <p className="muted">No workouts logged yet.</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Exercise</th><th>Best set</th><th>Date</th></tr></thead>
              <tbody>
                {bests.map((b) => (
                  <tr key={b.exercise}>
                    <td>{exLabel(b.exercise)}</td>
                    <td>{b.weight > 0 ? `${b.weight} kg x ${b.reps} reps` : `${b.reps} reps (bodyweight)`}</td>
                    <td>{b.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="muted">Form-score progress will appear here after photo form analysis is added.</p>
    </div>
  );
}
