import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { detectInjuries, getExerciseContraindication } from "../utils/injuryRules.js";
import "../styles/trainer-pages.css";

const DAY_SUBTITLES = {
  "Day 1": "Chest · Shoulder · Tricep",
  "Day 2": "Legs",
  "Day 3": "Back · Biceps",
};

const DAY_DURATIONS = {
  "Day 1": "About 35 min",
  "Day 2": "About 30 min",
  "Day 3": "About 40 min",
};

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 2. Top-Level Routine Toggle (default: 'beginner')
  const [activeRoutine, setActiveRoutine] = useState("beginner");

  // 3. Sub-Tabs for Intermediate (default: 'Day 1')
  const [activeDay, setActiveDay] = useState("Day 1");

  // Accordion open exercise ID
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

  const detectedInjuries = useMemo(
    () => detectInjuries(profile?.limitations),
    [profile?.limitations]
  );

  // 4. Data Filtering Logic
  const visibleExercises = useMemo(() => {
    if (activeRoutine === "beginner") {
      return exercises.filter((e) => e.level === "beginner");
    }
    if (activeRoutine === "intermediate") {
      return exercises.filter(
        (e) => e.level === "intermediate" && e.day === activeDay
      );
    }
    return exercises;
  }, [exercises, activeRoutine, activeDay]);

  if (loading) return <p>Loading exercises...</p>;
  if (error) return <p className="error">{error}</p>;

  const currentDuration =
    activeRoutine === "beginner" ? "About 30 min" : DAY_DURATIONS[activeDay] || "About 35 min";
  const currentTitle =
    activeRoutine === "beginner"
      ? "Initial Routine · Full Body Workout"
      : `${activeDay} · ${DAY_SUBTITLES[activeDay] || "Workout"}`;

  return (
    <div>
      {/* 2. Top-Level Routine Toggle Button Group */}
      <div className="routine-top-toggle-bar">
        <button
          type="button"
          className={`routine-toggle-pill ${activeRoutine === "beginner" ? "active" : ""}`}
          onClick={() => {
            setActiveRoutine("beginner");
            setOpenId(null);
          }}
        >
          {activeRoutine !== "beginner" && <span className="green-dot-icon" />}
          <span>Initial Routine (Beginner)</span>
        </button>

        <button
          type="button"
          className={`routine-toggle-pill ${activeRoutine === "intermediate" ? "active" : ""}`}
          onClick={() => {
            setActiveRoutine("intermediate");
            setOpenId(null);
          }}
        >
          <span>🔥 Intermediate (3-Day Split)</span>
        </button>
      </div>

      {/* Injury Safety Notice Banner if User Has Limitations */}
      {detectedInjuries.length > 0 && (
        <div className="safety-banner" style={{ marginBottom: "20px" }}>
          <strong>⚠️ Injury Protection Active</strong>
          <p>
            Your profile lists: <em>&ldquo;{profile?.limitations}&rdquo;</em> (detected:{" "}
            {detectedInjuries.map((i) => i.label).join(", ")}). Movements that place high shear on
            these joints are flagged below with safety warnings and alternatives.
          </p>
        </div>
      )}

      {/* 3. Sub-Tabs for Intermediate (Day 1, Day 2, Day 3) - Photo Matching Design */}
      {activeRoutine === "intermediate" && (
        <div>
          <h2 className="plan-heading-title">Your 3-day plan</h2>
          <div className="plan-subtabs-container">
            {["Day 1", "Day 2", "Day 3"].map((d) => {
              const isActive = activeDay === d;
              return (
                <button
                  key={d}
                  type="button"
                  className={`plan-subtab-btn ${isActive ? "active" : ""}`}
                  onClick={() => {
                    setActiveDay(d);
                    setOpenId(null);
                  }}
                >
                  <span className="plan-subtab-day">{d.toUpperCase()}</span>
                  <span className="plan-subtab-subtitle">{DAY_SUBTITLES[d]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Main Exercise Card Container & Clean List */}
      <div className="workout-plan-card">
        <div className="workout-card-header">
          <h1 className="workout-card-title">{currentTitle}</h1>
          <p className="workout-card-meta">
            {visibleExercises.length} exercises · {currentDuration}
          </p>
        </div>

        {visibleExercises.length === 0 ? (
          <p className="empty">No exercises found for this routine.</p>
        ) : (
          <div className="exercise-list-group">
            {visibleExercises.map((e, idx) => {
              const isOpen = openId === e.id;
              const contraindication = getExerciseContraindication(e.id, detectedInjuries);

              return (
                <div key={e.id}>
                  <div
                    className={`exercise-row-item ${isOpen ? "open" : ""}`}
                    onClick={() => setOpenId(isOpen ? null : e.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        setOpenId(isOpen ? null : e.id);
                      }
                    }}
                  >
                    {/* Left: Number + Thumbnail */}
                    <div className="exercise-row-left">
                      <span className="exercise-row-num">{idx + 1}</span>
                      <div className="exercise-row-thumb">
                        {e.videoUrl ? (
                          <video
                            src={e.videoUrl}
                            className="exercise-thumb-media"
                            preload="metadata"
                            muted
                            playsInline
                          />
                        ) : (
                          <div className="exercise-thumb-placeholder">🏋️</div>
                        )}
                      </div>

                      {/* Middle: Name (Bold) + Muscle group (Smaller Gray) */}
                      <div className="exercise-row-info">
                        <div className="exercise-row-name">{e.name}</div>
                        <div className="exercise-row-muscle">
                          {e.muscle_id || e.muscle_group}
                        </div>
                      </div>
                    </div>

                    {/* Right: Sets & Reps format ('4 x 12') + Arrow icon ( > ) */}
                    <div className="exercise-row-right">
                      <span className="exercise-row-sets">
                        {e.sets || 4} x {e.reps || 12}
                      </span>
                      <span className={`exercise-row-chevron ${isOpen ? "open" : ""}`}>
                        &gt;
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isOpen && (
                    <div className="exercise-detail-panel">
                      {/* Video Player */}
                      {e.videoUrl && (
                        <div className="exercise-detail-video-box">
                          <video
                            src={e.videoUrl}
                            className="exercise-detail-video"
                            autoPlay
                            muted
                            loop
                            playsInline
                            controls
                          />
                        </div>
                      )}

                      {/* Instructions */}
                      <p style={{ margin: "0 0 10px", lineHeight: "1.55", color: "#1e293b" }}>
                        {e.instructions}
                      </p>

                      {/* Key Form Checkpoints */}
                      {e.form_cues?.length > 0 && (
                        <div>
                          <strong style={{ display: "block", marginBottom: "4px", color: "#1e3a8a" }}>
                            💡 Form Cues & Posture Checkpoints:
                          </strong>
                          <ul style={{ margin: "4px 0 10px", paddingLeft: "18px", color: "#334155" }}>
                            {e.form_cues.map((cue, i) => (
                              <li key={i} style={{ marginBottom: "3px" }}>{cue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Injury Contraindication Alert */}
                      {contraindication.isContraindicated && (
                        <div className="safety-warning-box">
                          <strong>⛔ Medical Injury Alert: {contraindication.matchedInjuries.join(", ")} injury</strong>
                          <p style={{ margin: "4px 0" }}>{contraindication.reason}</p>
                          {contraindication.alternatives?.length > 0 && (
                            <div style={{ marginTop: "6px" }}>
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
