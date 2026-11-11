import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { EQUIPMENT } from "../constants.js";
import { detectInjuries, getExerciseContraindication } from "../utils/injuryRules.js";
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
  const [filterInjuries, setFilterInjuries] = useState(true);
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

  const detectedInjuries = useMemo(
    () => detectInjuries(profile?.limitations),
    [profile?.limitations]
  );

  const myEquipment = profile?.equipment ?? [];
  const term = search.trim().toLowerCase();

  const visible = exercises.filter((e) => {
    if (muscle !== "all" && e.muscle_group !== muscle) return false;
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
      <h1>Exercise library</h1>
      <p className="muted">Tap an exercise to see how to do it and what to watch for.</p>

      {detectedInjuries.length > 0 && (
        <div className="safety-banner">
          <strong>⚠️ Injury Protection Active</strong>
          <p>
            Your profile lists: <em>&ldquo;{profile.limitations}&rdquo;</em> (detected: {detectedInjuries.map((i) => i.label).join(", ")}).
            Exercises that place excessive mechanical stress on these areas (such as push-ups or presses for shoulder injuries) are filtered or flagged to protect you from injury.
          </p>
        </div>
      )}

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
          {detectedInjuries.length > 0 && (
            <label className="check" style={{ color: "#9a3412", fontWeight: 600 }}>
              <input type="checkbox" checked={filterInjuries} onChange={(e) => setFilterInjuries(e.target.checked)} />
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
              <article className={`ex-card ${contraindication.isContraindicated ? "ex-unsafe" : ""}`} key={e.id}>
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
                  {contraindication.isContraindicated && (
                    <span className="chip chip-unsafe">
                      ⛔ Not recommended ({contraindication.matchedInjuries.join(", ")} injury)
                    </span>
                  )}
                  <span className="chip">{e.muscle_group}</span>
                  <span className={`chip level-${e.level}`}>{e.level}</span>
                  {e.equipment.map((eq) => <span className="chip" key={eq}>{equipmentLabel(eq)}</span>)}
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
