//alif part 
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { EQUIPMENT } from "../constants.js";
import "../styles/trainer-pages.css";

const equipmentLabel = (value) => EQUIPMENT.find((o) => o.value === value)?.label ?? value;

// Bodyweight moves need no equipment, so they always count as "available".
const canDoWith = (exercise, myEquipment) =>
  exercise.equipment.every((eq) => eq === "bodyweight" || myEquipment.includes(eq));

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("all");
  const [onlyMine, setOnlyMine] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    Promise.all([api.getExercises(), api.getProfile()])
      .then(([list, p]) => { setExercises(list); setProfile(p); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const muscles = useMemo(
    () => [...new Set(exercises.map((e) => e.muscle_group))].sort(),
    [exercises]
  );

  const myEquipment = profile?.equipment ?? [];
  const term = search.trim().toLowerCase();

  const visible = exercises.filter((e) => {
    if (muscle !== "all" && e.muscle_group !== muscle) return false;
    if (onlyMine && profile && !canDoWith(e, myEquipment)) return false;
    if (term && !e.name.toLowerCase().includes(term)) return false;
    return true;
  });

  if (loading) return <p>Loading exercises...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h1>Exercise library</h1>
      <p className="muted">Tap an exercise to see how to do it and what to watch for.</p>

      <div className="card">
        <div className="filters">
          <label>Search
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="For example: squat" />
          </label>
          <label>Muscle group
            <select value={muscle} onChange={(e) => setMuscle(e.target.value)}>
              <option value="all">All muscles</option>
              {muscles.map((m) => <option key={m} value={m}>{m[0].toUpperCase() + m.slice(1)}</option>)}
            </select>
          </label>
          {profile && (
            <label className="check">
              <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
              Only show what I can do with my equipment
            </label>
          )}
        </div>
        {!profile && (
          <p className="muted" style={{ marginBottom: 0 }}>
            Save your profile to filter by the equipment you have.
          </p>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="empty">No exercises match these filters.</p>
      ) : (
        <div className="ex-list">
          {visible.map((e) => {
            const open = openId === e.id;
            return (
              <article className="ex-card" key={e.id}>
                <div className="ex-head">
                  <h2>{e.name}</h2>
                  <button
                    className="btn-outline"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : e.id)}
                  >
                    {open ? "Hide details" : "Show details"}
                  </button>
                </div>
                <div className="chip-row">
                  <span className="chip">{e.muscle_group}</span>
                  <span className={`chip level-${e.level}`}>{e.level}</span>
                  {e.equipment.map((eq) => <span className="chip" key={eq}>{equipmentLabel(eq)}</span>)}
                </div>
                {open && (
                  <div className="ex-body">
                    <p>{e.instructions}</p>
                    <strong>Form cues</strong>
                    <ul>
                      {e.form_cues.map((c) => <li key={c}>{c}</li>)}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
