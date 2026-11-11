import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { GOALS, FITNESS_LEVELS, EQUIPMENT } from "../constants.js";
import "../styles/trainer-pages.css";
import "../styles/routine-page.css";

const goalLabel = (val) => GOALS.find((g) => g.value === val)?.label ?? val;
const levelLabel = (val) => FITNESS_LEVELS.find((l) => l.value === val)?.label ?? val;
const eqLabel = (val) => EQUIPMENT.find((e) => e.value === val)?.label ?? val;

function todayDateString() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function Routine() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(1);
  const [showAllDays, setShowAllDays] = useState(false);
  const [completedMap, setCompletedMap] = useState({});

  const todayStr = todayDateString();
  const storageKey = `routine_completed_${todayStr}`;

  useEffect(() => {
    // Load completion state for today
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      setCompletedMap(saved);
    } catch {
      setCompletedMap({});
    }

    Promise.all([api.getProfile(), api.getRoutine()])
      .then(([p, r]) => {
        setProfile(p);
        setRoutine(r);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [storageKey]);

  const toggleCompleted = (exerciseKey) => {
    const updated = { ...completedMap, [exerciseKey]: !completedMap[exerciseKey] };
    setCompletedMap(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleLogExercise = (exercise) => {
    navigate("/workouts", {
      state: {
        exercise_id: exercise.id,
        sets: exercise.sets,
        reps: exercise.reps,
      },
    });
  };

  const handleFormCheck = (exercise) => {
    navigate("/form-check", {
      state: {
        exercise_id: exercise.id,
      },
    });
  };

  if (loading) return <p>Loading your personalized routine...</p>;
  if (error) return <p className="error">{error}</p>;

  if (!profile || !routine) {
    return (
      <div className="card narrow">
        <h1>Your Workout Routine</h1>
        <p>Complete your fitness profile first so we can build a personalized routine based on your goals, schedule, and equipment.</p>
        <Link className="btn" to="/profile">Complete my profile</Link>
      </div>
    );
  }

  const daysToRender = showAllDays
    ? routine.days
    : routine.days.filter((d) => d.day_number === activeDay);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1>Personalized Workout Routine</h1>
          <p className="muted" style={{ margin: 0 }}>
            Generated based on your profile inputs, schedule, and available equipment.
          </p>
        </div>
        <button className="btn-outline btn-sm" onClick={() => window.print()}>
          Print Routine
        </button>
      </div>

      {routine.demo && (
        <p className="notice" style={{ marginTop: "14px" }}>
          Demo mode: routine structure is generated using your profile specifications (days per week, equipment, fitness goal, and injury limitations).
        </p>
      )}

      {/* User profile badges */}
      <div className="routine-header-badges">
        <span className="routine-badge badge-goal">
          🎯 {goalLabel(routine.goal)}
        </span>
        <span className="routine-badge">
          📅 {routine.frequency}
        </span>
        <span className="routine-badge">
          ⚡ {levelLabel(routine.fitness_level)}
        </span>
        <span className="routine-badge">
          📍 {routine.location === "gym" ? "Gym" : "Home"} ({(routine.equipment || []).map(eqLabel).join(", ")})
        </span>
        {routine.limitations && (
          <span className="routine-badge badge-alert">
            ⚠️ Limitations: {routine.limitations}
          </span>
        )}
        <Link to="/profile" style={{ fontSize: "13px", marginLeft: "6px" }}>
          Edit Profile
        </Link>
      </div>

      {/* Plan summary card */}
      <div className="card">
        <h2>{routine.split_name}</h2>
        <p style={{ margin: "4px 0 12px" }}>{routine.summary}</p>

        <div className="routine-meta-grid">
          <div className="routine-meta-item">
            <span className="routine-meta-label">Target Sets</span>
            <span className="routine-meta-value">{routine.target_sets} Sets / exercise</span>
          </div>
          <div className="routine-meta-item">
            <span className="routine-meta-label">Target Reps</span>
            <span className="routine-meta-value">{routine.target_reps} Reps</span>
          </div>
          <div className="routine-meta-item">
            <span className="routine-meta-label">Recommended Rest</span>
            <span className="routine-meta-value">{routine.target_rest}</span>
          </div>
        </div>

        <div className="routine-tip-box">
          <strong>Coaching Focus:</strong> {routine.pacing_tip}
        </div>

        {/* Collapsible warmup & cooldown */}
        <details className="warmup-box">
          <summary>🔥 Recommended Warm-up (5-10 Mins)</summary>
          <ul>
            {routine.warmup.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </details>

        <details className="warmup-box" style={{ marginTop: "8px" }}>
          <summary>🧘 Recommended Cool-down & Recovery</summary>
          <ul>
            {routine.cooldown.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        </details>
      </div>

      {/* Day Tabs */}
      <div className="day-tabs">
        {routine.days.map((d) => (
          <button
            key={d.day_number}
            className={`day-tab-btn ${!showAllDays && activeDay === d.day_number ? "active" : ""}`}
            onClick={() => {
              setShowAllDays(false);
              setActiveDay(d.day_number);
            }}
          >
            Day {d.day_number}
          </button>
        ))}
        <button
          className={`day-tab-btn ${showAllDays ? "active" : ""}`}
          onClick={() => setShowAllDays(true)}
        >
          View All Days
        </button>
      </div>

      {/* Routine Days */}
      {daysToRender.map((day) => (
        <section className="day-card" key={day.day_number}>
          <div className="day-card-header">
            <div>
              <h2>{day.title}</h2>
              <span className="muted" style={{ fontSize: "13px" }}>
                Focus: <strong>{day.focus}</strong>
              </span>
            </div>
            <span className="est-time">⏱️ Est. {day.est_minutes} min</span>
          </div>

          <div className="routine-exercises">
            {day.exercises.map((ex, idx) => {
              const exKey = `d${day.day_number}_${ex.id}_${idx}`;
              const isCompleted = !!completedMap[exKey];

              return (
                <article
                  className={`routine-exercise-card ${isCompleted ? "completed" : ""}`}
                  key={exKey}
                >
                  <div className="rex-header">
                    <div>
                      <h3 className="rex-title">
                        {idx + 1}. {ex.name}
                      </h3>
                      <div className="chip-row" style={{ margin: "2px 0 6px" }}>
                        <span className="chip">{ex.muscle_group}</span>
                        <span className={`chip level-${ex.level}`}>{ex.level}</span>
                        {ex.equipment.map((eq) => (
                          <span className="chip" key={eq}>
                            {eqLabel(eq)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rex-targets">
                    <span className="target-pill">
                      {ex.sets} Sets
                    </span>
                    <span className="target-pill">
                      {ex.reps} Reps
                    </span>
                    <span className="target-pill pill-rest">
                      Rest: {ex.rest}
                    </span>
                  </div>

                  {ex.safety_alert && (
                    <div className="rex-alert">
                      {ex.safety_alert}
                    </div>
                  )}

                  <div className="rex-cues">
                    <p style={{ margin: "0 0 4px" }}>{ex.instructions}</p>
                    <strong>Form cues:</strong>
                    <ul>
                      {ex.form_cues.map((cue, cIdx) => (
                        <li key={cIdx}>{cue}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rex-footer">
                    <label className="rex-check-label">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => toggleCompleted(exKey)}
                      />
                      {isCompleted ? "Completed today" : "Mark as done today"}
                    </label>

                    <div className="rex-actions">
                      <button
                        className="btn-outline btn-sm"
                        onClick={() => handleLogExercise(ex)}
                        title="Add to Workout Log"
                      >
                        + Log this
                      </button>
                      <button
                        className="btn-outline btn-sm"
                        onClick={() => handleFormCheck(ex)}
                        title="Check form with photo"
                      >
                        📷 Form check
                      </button>
                      <Link
                        className="btn-outline btn-sm"
                        to="/exercises"
                        style={{ textDecoration: "none" }}
                      >
                        Library
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <div className="routine-bottom-actions">
        <Link className="btn" to="/workouts">
          Open Workout Log
        </Link>
        <button className="btn-outline" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Back to top ↑
        </button>
      </div>

      <p className="notice">
        This routine provides general fitness guidance and is personalized based on your self-reported profile.
        Warm up thoroughly before each session. If you feel pain or dizziness, stop immediately and seek medical advice.
      </p>
    </div>
  );
}
