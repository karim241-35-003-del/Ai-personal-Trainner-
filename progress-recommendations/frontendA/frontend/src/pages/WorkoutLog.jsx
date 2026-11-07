import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { EXERCISES, LOG_LIMITS } from "../constants.js";
import { todayStr } from "../utils/progress.js";

const exLabel = (v) => EXERCISES.find((e) => e.value === v)?.label ?? v;

function validate(f) {
  const errs = {};
  if (!f.date) errs.date = "Choose a date.";
  else if (f.date > todayStr()) errs.date = "The date cannot be in the future.";
  const check = (key, name, whole) => {
    const lim = LOG_LIMITS[key];
    const v = f[key];
    if (v === "" || Number.isNaN(Number(v))) errs[key] = `Enter ${name}.`;
    else if (Number(v) < lim.min || Number(v) > lim.max) errs[key] = `${name} must be between ${lim.min} and ${lim.max}.`;
    else if (whole && !Number.isInteger(Number(v))) errs[key] = `${name} must be a whole number.`;
  };
  check("sets", "Sets", true);
  check("reps", "Reps", true);
  check("weight", "Weight", false);
  return errs;
}

export default function WorkoutLog() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({ date: todayStr(), exercise: EXERCISES[0].value, sets: "3", reps: "10", weight: "0" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.getWorkouts()
      .then((data) => setWorkouts([...data].sort((a, b) => b.date.localeCompare(a.date))))
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const byDate = useMemo(() => {
    const m = new Map();
    for (const w of workouts) {
      if (!m.has(w.date)) m.set(w.date, []);
      m.get(w.date).push(w);
    }
    return [...m.entries()];
  }, [workouts]);

  const set = (key) => (e) => { setForm({ ...form, [key]: e.target.value }); setSaved(false); };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setServerError("");
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await api.addWorkout({
        date: form.date, exercise: form.exercise,
        sets: Number(form.sets), reps: Number(form.reps), weight: Number(form.weight),
      });
      await load();
      setSaved(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try { await api.deleteWorkout(id); await load(); } catch (err) { setServerError(err.message); }
  };

  return (
    <div>
      <h1>Workout log</h1>
      <p className="muted">Record each exercise after your workout. Use weight 0 for bodyweight exercises.</p>

      <form className="card" onSubmit={onSubmit} noValidate>
        <h2>Add an exercise</h2>
        <div className="grid">
          <label>Date
            <input type="date" value={form.date} max={todayStr()} onChange={set("date")} />
            {errors.date && <span className="error">{errors.date}</span>}
          </label>
          <label>Exercise
            <select value={form.exercise} onChange={set("exercise")}>
              {EXERCISES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
          </label>
          <label>Sets
            <input type="number" inputMode="numeric" value={form.sets} onChange={set("sets")} />
            {errors.sets && <span className="error">{errors.sets}</span>}
          </label>
          <label>Reps per set
            <input type="number" inputMode="numeric" value={form.reps} onChange={set("reps")} />
            {errors.reps && <span className="error">{errors.reps}</span>}
          </label>
          <label>Weight (kg)
            <input type="number" inputMode="decimal" step="0.5" value={form.weight} onChange={set("weight")} />
            {errors.weight && <span className="error">{errors.weight}</span>}
          </label>
        </div>
        {serverError && <span className="error">{serverError}</span>}
        {saved && <span className="success">Saved.</span>}
        <button className="btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Add to log"}</button>
      </form>

      <h2>History</h2>
      {loading && <p>Loading...</p>}
      {loadError && <p className="error">{loadError}</p>}
      {!loading && !loadError && byDate.length === 0 && (
        <div className="card"><p className="muted">No workouts logged yet. Add your first exercise above.</p></div>
      )}
      {byDate.map(([date, items]) => (
        <div className="card" key={date}>
          <h2>{date}</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Exercise</th><th>Sets x reps</th><th>Weight</th><th>Volume</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((w) => (
                  <tr key={w.id}>
                    <td>{exLabel(w.exercise)}</td>
                    <td>{w.sets} x {w.reps}</td>
                    <td>{w.weight > 0 ? `${w.weight} kg` : "Bodyweight"}</td>
                    <td>{w.weight > 0 ? `${Math.round(w.sets * w.reps * w.weight)} kg` : `${w.sets * w.reps} reps`}</td>
                    <td><button className="link-btn danger" onClick={() => onDelete(w.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <p className="muted">Volume = sets x reps x weight. For bodyweight exercises it shows total reps.</p>
    </div>
  );
}
