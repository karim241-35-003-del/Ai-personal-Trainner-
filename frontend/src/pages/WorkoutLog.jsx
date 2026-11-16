//Test commit by Arik
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { EQUIPMENT, WORKOUT_LIMITS } from "../constants.js";
import "../styles/trainer-pages.css";
import "../styles/workout-log.css";

// Today's date as YYYY-MM-DD in the user's own timezone (not UTC).
function today() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const LOWER_MUSCLES = new Set(["legs", "glutes", "calves", "hamstrings", "quads"]);
const MUSCLE_ORDER = ["chest", "back", "shoulders", "arms", "core", "legs", "glutes"];

function getBodyPart(ex) {
  if (!ex) return "upper";
  if (ex.body_part === "upper" || ex.body_part === "lower") return ex.body_part;
  return LOWER_MUSCLES.has((ex.muscle_group || "").toLowerCase()) ? "lower" : "upper";
}

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");
const eqLabel = (val) => EQUIPMENT.find((o) => o.value === val)?.label ?? val;

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
  const [bodyPart, setBodyPart] = useState("upper");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [historyFilter, setHistoryFilter] = useState("all");
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
        const firstUpper = list.find((ex) => getBodyPart(ex) === "upper") || list[0];
        if (firstUpper) {
          setBodyPart(getBodyPart(firstUpper));
          setForm((f) => ({ ...f, exercise_id: firstUpper.id }));
        }
      })
      .catch((err) => setServerError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const exerciseById = useMemo(() => {
    const map = new Map();
    for (const ex of exercises) map.set(ex.id, ex);
    return map;
  }, [exercises]);

  const upperExercises = useMemo(
    () => exercises.filter((ex) => getBodyPart(ex) === "upper"),
    [exercises]
  );
  const lowerExercises = useMemo(
    () => exercises.filter((ex) => getBodyPart(ex) === "lower"),
    [exercises]
  );

  const partExercises = bodyPart === "upper" ? upperExercises : lowerExercises;

  const availableMuscles = useMemo(() => {
    const set = new Set(partExercises.map((ex) => ex.muscle_group));
    return [...set].sort((a, b) => {
      const ia = MUSCLE_ORDER.indexOf(a);
      const ib = MUSCLE_ORDER.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [partExercises]);

  const filteredExercises = useMemo(() => {
    if (muscleFilter === "all") return partExercises;
    return partExercises.filter((ex) => ex.muscle_group === muscleFilter);
  }, [partExercises, muscleFilter]);

  const groupedExercises = useMemo(() => {
    const groups = [];
    for (const m of availableMuscles) {
      const items = filteredExercises.filter((ex) => ex.muscle_group === m);
      if (items.length > 0) groups.push({ muscle: m, items });
    }
    return groups;
  }, [availableMuscles, filteredExercises]);

  const selectedExercise = exerciseById.get(form.exercise_id) || null;

  const selectBodyPart = (nextPart) => {
    setSaved("");
    setBodyPart(nextPart);
    setMuscleFilter("all");
    const nextList = nextPart === "upper" ? upperExercises : lowerExercises;
    setForm((f) => ({ ...f, exercise_id: nextList[0]?.id ?? "" }));
  };

  const selectMuscle = (muscle) => {
    setSaved("");
    setMuscleFilter(muscle);
    const nextList = muscle === "all"
      ? partExercises
      : partExercises.filter((ex) => ex.muscle_group === muscle);
    if (!nextList.some((ex) => ex.id === form.exercise_id)) {
      setForm((f) => ({ ...f, exercise_id: nextList[0]?.id ?? "" }));
    }
  };

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
      setForm((f) => ({ ...f, sets: "3", reps: "10", weight_kg: "0", notes: "" }));
      setSaved(`Saved: ${entry.exercise_name}`);
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
  const entryPart = (w) => getBodyPart(exerciseById.get(w.exercise_id));
  const upperLogCount = sorted.filter((w) => entryPart(w) === "upper").length;
  const lowerLogCount = sorted.filter((w) => entryPart(w) === "lower").length;
  const visibleEntries = historyFilter === "all"
    ? sorted
    : sorted.filter((w) => entryPart(w) === historyFilter);

  return (
    <div className="wl-page">
      <div className="wl-header">
        <div>
          <h1>Workout log</h1>
          <p className="muted">Choose Upper Body or Lower Body, log your sets and reps, and track your strength.</p>
        </div>
        <div className="wl-stats-row">
          <div className="wl-stat-pill">
            <span className="wl-stat-num">{sorted.length}</span>
            <span className="wl-stat-lbl">Total Logs</span>
          </div>
          <div className="wl-stat-pill">
            <span className="wl-stat-num">{upperLogCount}</span>
            <span className="wl-stat-lbl">Upper Body</span>
          </div>
          <div className="wl-stat-pill">
            <span className="wl-stat-num">{lowerLogCount}</span>
            <span className="wl-stat-lbl">Lower Body</span>
          </div>
        </div>
      </div>

      <form className="wl-card" onSubmit={onSubmit} noValidate>
        <div className="wl-card-head">
          <h2>Log a workout</h2>
          <span className="muted" style={{ fontSize: "13px" }}>
            {bodyPart === "upper" ? "Upper Body Exercises" : "Lower Body Exercises"}
          </span>
        </div>

        <span className="wl-section-label">1. Select Body Part</span>
        <div className="wl-part-grid" role="tablist" aria-label="Select body part">
          <button
            type="button"
            role="tab"
            aria-selected={bodyPart === "upper"}
            className={`wl-part-btn ${bodyPart === "upper" ? "active" : ""}`}
            onClick={() => selectBodyPart("upper")}
          >
            <div>
              <span className="wl-part-title">Upper Body</span>
              <span className="wl-part-sub">Chest, Back, Shoulders, Arms</span>
            </div>
            <span className="wl-part-count">{upperExercises.length} exercises</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={bodyPart === "lower"}
            className={`wl-part-btn ${bodyPart === "lower" ? "active" : ""}`}
            onClick={() => selectBodyPart("lower")}
          >
            <div>
              <span className="wl-part-title">Lower Body</span>
              <span className="wl-part-sub">Quads, Hamstrings, Glutes, Calves</span>
            </div>
            <span className="wl-part-count">{lowerExercises.length} exercises</span>
          </button>
        </div>

        {availableMuscles.length > 1 && (
          <div className="wl-muscle-bar">
            <span className="wl-muscle-label">Filter muscle:</span>
            <button
              type="button"
              className={`wl-chip-btn ${muscleFilter === "all" ? "active" : ""}`}
              onClick={() => selectMuscle("all")}
            >
              All ({partExercises.length})
            </button>
            {availableMuscles.map((m) => (
              <button
                type="button"
                key={m}
                className={`wl-chip-btn ${muscleFilter === m ? "active" : ""}`}
                onClick={() => selectMuscle(m)}
              >
                {cap(m)}
              </button>
            ))}
          </div>
        )}

        <span className="wl-section-label">2. Exercise &amp; Set Details</span>
        <div className="wl-grid">
          <label>Exercise
            <select name="exercise_id" value={form.exercise_id} onChange={change}>
              {muscleFilter === "all" && groupedExercises.length > 1 ? (
                groupedExercises.map((g) => (
                  <optgroup key={g.muscle} label={cap(g.muscle)}>
                    {g.items.map((x) => (
                      <option key={x.id} value={x.id}>{x.name}</option>
                    ))}
                  </optgroup>
                ))
              ) : (
                filteredExercises.map((x) => (
                  <option key={x.id} value={x.id}>{x.name}</option>
                ))
              )}
            </select>
            {selectedExercise && (
              <div className="wl-selected-meta">
                <span className="wl-meta-tag">
                  {getBodyPart(selectedExercise) === "upper" ? "Upper Body" : "Lower Body"}
                </span>
                <span className="wl-meta-tag">{selectedExercise.muscle_group}</span>
                {selectedExercise.equipment.map((eq) => (
                  <span className="wl-meta-tag" key={eq}>{eqLabel(eq)}</span>
                ))}
              </div>
            )}
            {errors.exercise_id && <span className="error">{errors.exercise_id}</span>}
          </label>

          <label>Date
            <input name="date" type="date" value={form.date} onChange={change} />
            {errors.date && <span className="error">{errors.date}</span>}
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
            <input name="notes" type="text" maxLength={200} value={form.notes} onChange={change} placeholder="For example: felt strong, increase next time" />
            {errors.notes && <span className="error">{errors.notes}</span>}
          </label>
        </div>

        {serverError && <p className="error">{serverError}</p>}
        <div className="wl-submit-row">
          <button className="wl-btn" disabled={busy}>{busy ? "Saving..." : "Add to log"}</button>
          {saved && <span className="wl-saved-badge">✓ {saved}</span>}
        </div>
      </form>

      <div className="wl-card">
        <div className="wl-card-head">
          <h2>Your entries</h2>
          <div className="wl-filter-tabs">
            <button
              type="button"
              className={`wl-chip-btn ${historyFilter === "all" ? "active" : ""}`}
              onClick={() => setHistoryFilter("all")}
            >
              All ({sorted.length})
            </button>
            <button
              type="button"
              className={`wl-chip-btn ${historyFilter === "upper" ? "active" : ""}`}
              onClick={() => setHistoryFilter("upper")}
            >
              Upper Body ({upperLogCount})
            </button>
            <button
              type="button"
              className={`wl-chip-btn ${historyFilter === "lower" ? "active" : ""}`}
              onClick={() => setHistoryFilter("lower")}
            >
              Lower Body ({lowerLogCount})
            </button>
          </div>
        </div>

        {visibleEntries.length === 0 ? (
          <p className="empty">
            {sorted.length === 0
              ? "No workouts logged yet. Add your first set above!"
              : "No entries match this body part filter."}
          </p>
        ) : (
          <div className="wl-table-wrap">
            <table className="wl-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Body Part</th>
                  <th>Exercise</th>
                  <th>Sets × Reps</th>
                  <th>Weight</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleEntries.map((w) => {
                  const part = entryPart(w);
                  return (
                    <tr key={w.id}>
                      <td>{w.date}</td>
                      <td>
                        <span className={`wl-badge ${part}`}>
                          {part === "upper" ? "Upper Body" : "Lower Body"}
                        </span>
                      </td>
                      <td><strong>{w.exercise_name}</strong></td>
                      <td><span className="wl-sets-pill">{w.sets} × {w.reps}</span></td>
                      <td>{w.weight_kg > 0 ? `${w.weight_kg} kg` : "Bodyweight"}</td>
                      <td className="muted">{w.notes || "-"}</td>
                      <td>
                        <button className="wl-delete-btn" onClick={() => onDelete(w.id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
