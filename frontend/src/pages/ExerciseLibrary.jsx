import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { EQUIPMENT } from "../constants.js";
import { detectInjuries, getExerciseContraindication } from "../utils/injuryRules.js";
import "../styles/trainer-pages.css";

const EQUIPMENT_LABELS = {
  bodyweight: "Bodyweight",
  dumbbell: "Dumbbell",
  barbell: "Barbell",
  gym_machines: "Gym Machine / Cables",
  machine: "Machine",
  cables: "Cables",
};

const equipmentLabel = (value) =>
  EQUIPMENT_LABELS[value] ?? EQUIPMENT.find((o) => o.value === value)?.label ?? value;

// Bodyweight moves need no equipment, so they always count as "available".
const canDoWith = (exercise, myEquipment) =>
  exercise.equipment.every(
    (eq) =>
      eq === "bodyweight" ||
      myEquipment.includes(eq) ||
      (myEquipment.includes("gym_machines") && ["gym_machines", "machine", "cables", "barbell"].includes(eq)) ||
      (myEquipment.includes("dumbbell") && eq === "dumbbells")
  );

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("all");
  const [routineFilter, setRoutineFilter] = useState("all"); // "all" | "beginner" | "intermediate"
  const [dayFilter, setDayFilter] = useState("all"); // "all" | "Day 1" | "Day 2" | "Day 3"
  const [onlyMine, setOnlyMine] = useState(true);
  const [filterInjuries, setFilterInjuries] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    Promise.all([api.getExercises(), api.getProfile()])
      .then(([list, p]) => {
        setExercises(list);
        setProfile(p);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const muscles = useMemo(
    () => [...new Set(exercises.map((e) => e.muscle_id || e.muscle_group))].filter(Boolean).sort(),
    [exercises]
  );

  const detectedInjuries = useMemo(
    () => detectInjuries(profile?.limitations),
    [profile?.limitations]
  );

  const myEquipment = profile?.equipment ?? [];
  const term = search.trim().toLowerCase();

  const visible = exercises.filter((e) => {
    if (routineFilter !== "all" && e.level !== routineFilter) return false;
    if (dayFilter !== "all" && e.day !== dayFilter) return false;
    if (muscle !== "all" && e.muscle_id !== muscle && e.muscle_group !== muscle) return false;
    if (onlyMine && profile && !canDoWith(e, myEquipment)) return false;
    if (term && !e.name.toLowerCase().includes(term)) return false;
    if (filterInjuries && detectedInjuries.length > 0) {
      const { isContraindicated } = getExerciseContraindication(e.id, detectedInjuries);
      if (isContraindicated) return false;
    }
    return true;
  });

  if (loading) return <p>Loading exercises...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <h1>Exercise routine</h1>
        <p className="muted">
          Structured gym routines with sets, reps, and split schedules for progressive overload and injury-safe execution.
        </p>
      </div>

      {detectedInjuries.length > 0 && (
        <div className="safety-banner">
          <strong>⚠️ Injury Protection Active</strong>
          <p>
            Your profile lists: <em>&ldquo;{profile.limitations}&rdquo;</em> (detected: {detectedInjuries.map((i) => i.label).join(", ")}).
            Exercises placing excessive mechanical stress on these areas are filtered or flagged to protect your joints and tendons.
          </p>
        </div>
      )}

      {/* Routine Quick Tabs */}
      <div className="routine-tabs">
        <button
          className={`routine-tab-btn ${routineFilter === "all" ? "active" : ""}`}
          onClick={() => { setRoutineFilter("all"); setDayFilter("all"); }}
        >
          All Routines ({exercises.length})
        </button>
        <button
          className={`routine-tab-btn ${routineFilter === "beginner" ? "active" : ""}`}
          onClick={() => { setRoutineFilter("beginner"); setDayFilter("all"); }}
        >
          🟢 Initial Routine (Beginner)
        </button>
        <button
          className={`routine-tab-btn ${routineFilter === "intermediate" ? "active" : ""}`}
          onClick={() => setRoutineFilter("intermediate")}
        >
          🔥 Intermediate (3-Day Split)
        </button>
      </div>

      {/* Day Subtabs for Intermediate */}
      {(routineFilter === "intermediate" || routineFilter === "all") && (
        <div className="routine-tabs" style={{ marginBottom: "20px" }}>
          <button
            className={`routine-tab-btn ${dayFilter === "all" ? "active" : ""}`}
            onClick={() => setDayFilter("all")}
          >
            All Days
          </button>
          <button
            className={`routine-tab-btn ${dayFilter === "Day 1" ? "active" : ""}`}
            onClick={() => { setRoutineFilter("intermediate"); setDayFilter("Day 1"); }}
          >
            📅 Day 1 (Chest / Shoulder / Tricep)
          </button>
          <button
            className={`routine-tab-btn ${dayFilter === "Day 2" ? "active" : ""}`}
            onClick={() => { setRoutineFilter("intermediate"); setDayFilter("Day 2"); }}
          >
            📅 Day 2 (Legs)
          </button>
          <button
            className={`routine-tab-btn ${dayFilter === "Day 3" ? "active" : ""}`}
            onClick={() => { setRoutineFilter("intermediate"); setDayFilter("Day 3"); }}
          >
            📅 Day 3 (Back / Biceps)
          </button>
        </div>
      )}

      <div className="card">
        <div className="filters">
          <label>Search
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="For example: press or curl"
            />
          </label>
          <label>Muscle group
            <select value={muscle} onChange={(e) => setMuscle(e.target.value)}>
              <option value="all">All muscles</option>
              {muscles.map((m) => (
                <option key={m} value={m}>
                  {m[0].toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </label>
          {profile && (
            <label className="check">
              <input
                type="checkbox"
                checked={onlyMine}
                onChange={(e) => setOnlyMine(e.target.checked)}
              />
              Only show what I can do with my equipment
            </label>
          )}
          {detectedInjuries.length > 0 && (
            <label className="check" style={{ color: "#9a3412", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={filterInjuries}
                onChange={(e) => setFilterInjuries(e.target.checked)}
              />
              🛡️ Hide exercises unsafe for my {detectedInjuries.map((i) => i.label).join(", ")} injury
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
            const contraindication = getExerciseContraindication(e.id, detectedInjuries);
            return (
              <article
                className={`ex-card ${contraindication.isContraindicated ? "ex-unsafe" : ""}`}
                key={e.id}
              >
                <div className="ex-head">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h2>{e.name}</h2>
                    {e.day && (
                      <span className="chip chip-day">📅 {e.day}</span>
                    )}
                    {e.sets && e.reps && (
                      <span className="chip chip-target">
                        🔁 {e.sets} Sets × {e.reps} Reps
                      </span>
                    )}
                  </div>
                  <button
                    className="btn-outline"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : e.id)}
                  >
                    {open ? "Hide details" : "Show details"}
                  </button>
                </div>

                <div className="chip-row">
                  {contraindication.isContraindicated && (
                    <span className="chip chip-unsafe">
                      ⛔ Not recommended ({contraindication.matchedInjuries.join(", ")} injury)
                    </span>
                  )}
                  {e.routine && (
                    <span className="chip chip-routine">{e.routine}</span>
                  )}
                  <span className={`chip level-${e.level}`}>{e.level}</span>
                  <span className="chip chip-muscle">🎯 {e.muscle_id || e.muscle_group}</span>
                  {e.equipment.map((eq) => (
                    <span className="chip chip-equipment" key={eq}>
                      ⚙️ {equipmentLabel(eq)}
                    </span>
                  ))}
                </div>

                {contraindication.isContraindicated && (
                  <div className="safety-warning-box">
                    <strong>⚠️ Injury Risk Warning:</strong>
                    <p style={{ margin: "2px 0 6px" }}>{contraindication.reason}</p>
                    {contraindication.alternatives?.length > 0 && (
                      <div>
                        <strong>Safe Alternatives to Consider:</strong>
                        <ul className="safety-alternatives" style={{ margin: "4px 0 0" }}>
                          {contraindication.alternatives.map((alt) => (
                            <li key={alt}>{alt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {open && (
                  <div className="ex-body">
                    <p style={{ lineHeight: "1.5", margin: "6px 0 10px" }}>{e.instructions}</p>
                    <strong style={{ display: "block", marginBottom: "4px", color: "var(--blue-dark, #1e3a8a)" }}>
                      💡 Key Form Cues & Posture Checkpoints
                    </strong>
                    <ul>
                      {e.form_cues.map((c) => (
                        <li key={c} style={{ marginBottom: "3px" }}>{c}</li>
                      ))}
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
