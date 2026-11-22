//alif part 
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { WORKOUT_LIMITS } from "../constants.js";
import "../styles/trainer-pages.css";

// Today's date as YYYY-MM-DD in the user's own timezone (not UTC).
function today() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const EMPTY = { date: today(), exercise_id: "", sets: "3", reps: "10", weight_kg: "0", notes: "" };

function validate(f) {
  const e = {};
  if (!f.date) e.date = "Choose a date.";
  if (!f.exercise_id) e.exercise_id = "Choose an exercise.";
  const check = (key, label, whole) => {
    const v = Number(f[key]);
    const { min, max } = WORKOUT_LIMITS[key];
    const bad = f[key] === "" || Number.isNaN(v) || v < min || v > max || (whole && !Number.isInteger(v));
    if (bad) e[key] = whole
      ? `${label} must be a whole number from ${min} to ${max}.`
      : `${label} must be between ${min} and ${max}.`;
  };
  check("sets", "Sets", true);
  check("reps", "Reps", true);
  check("weight_kg", "Weight (kg)", false);
  if (f.notes.length > 200) e.notes = "Notes can be at most 200 characters.";
  return e;
}

export default function WorkoutLog() {
  const [exercises, setExercises] = useState([]);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.getExercises(), api.listWorkouts()])
      .then(([list, logs]) => {
        setExercises(list);
        setEntries(logs);
        if (list[0]) setForm((f) => ({ ...f, exercise_id: list[0].id }));
      })
      .catch((err) => setServerError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const change = (e) => {
    setSaved("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSaved("");
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    try {
      const entry = await api.addWorkout({
        ...form,
        sets: Number(form.sets),
        reps: Number(form.reps),
        weight_kg: Number(form.weight_kg),
      });
      setEntries((list) => [entry, ...list]);
      setForm({ ...form, sets: "3", reps: "10", weight_kg: "0", notes: "" });
      setSaved(`Saved: ${entry.exercise_name}.`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this workout entry?")) return;
    setServerError("");
    try {
      await api.deleteWorkout(id);
      setEntries((list) => list.filter((w) => w.id !== id));
    } catch (err) {
      setServerError(err.message);
    }
  };

  if (loading) return <p>Loading your workout log...</p>;

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <div>
      <h1>Workout log</h1>
      <p className="muted">Write down what you did today. Next time you can see if you are getting stronger.</p>

      <form className="card" onSubmit={onSubmit} noValidate>
        <div className="grid">
          <label>Date
            <input name="date" type="date" value={form.date} onChange={change} />
            {errors.date && <span className="error">{errors.date}</span>}
          </label>
          <label>Exercise
            <select name="exercise_id" value={form.exercise_id} onChange={change}>
              {exercises.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
            {errors.exercise_id && <span className="error">{errors.exercise_id}</span>}
          </label>
          <label>Sets
            <input name="sets" type="number" min={WORKOUT_LIMITS.sets.min} max={WORKOUT_LIMITS.sets.max} value={form.sets} onChange={change} />
            {errors.sets && <span className="error">{errors.sets}</span>}
          </label>
          <label>Reps per set
            <input name="reps" type="number" min={WORKOUT_LIMITS.reps.min} max={WORKOUT_LIMITS.reps.max} value={form.reps} onChange={change} />
            {errors.reps && <span className="error">{errors.reps}</span>}
          </label>
          <label>Weight (kg, 0 for bodyweight)
            <input name="weight_kg" type="number" step="0.5" min="0" value={form.weight_kg} onChange={change} />
            {errors.weight_kg && <span className="error">{errors.weight_kg}</span>}
          </label>
          <label>Notes (optional)
            <input name="notes" type="text" maxLength={200} value={form.notes} onChange={change} placeholder="For example: felt easy" />
            {errors.notes && <span className="error">{errors.notes}</span>}
          </label>
        </div>

        {serverError && <p className="error">{serverError}</p>}
        <div className="form-actions">
          <button className="btn" disabled={busy}>{busy ? "Saving..." : "Add to log"}</button>
          {saved && <span className="success">{saved}</span>}
        </div>
      </form>

      <div className="card">
        <h2>Your entries</h2>
        {sorted.length === 0 ? (
          <p className="empty">No workouts logged yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="log">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Exercise</th>
                  <th>Sets x reps</th>
                  <th>Weight</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((w) => (
                  <tr key={w.id}>
                    <td>{w.date}</td>
                    <td>{w.exercise_name}</td>
                    <td>{w.sets} x {w.reps}</td>
                    <td>{w.weight_kg > 0 ? `${w.weight_kg} kg` : "Bodyweight"}</td>
                    <td>{w.notes || "-"}</td>
                    <td><button className="btn-danger" onClick={() => onDelete(w.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
