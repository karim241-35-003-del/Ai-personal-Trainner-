import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

  // Sub-Tabs for Intermediate (default: 'Day 1')
  const [activeDay, setActiveDay] = useState("Day 1");

  // Sub-selector for Home Beginner (Bodyweight vs Dumbbells)
  const [homeEquipment, setHomeEquipment] = useState(null);

  // Accordion open exercise ID
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    Promise.all([api.getExercises(), api.getProfile()])
      .then(([list, p]) => {
        setExercises(list);
        setProfile(p);
        if (p?.equipment?.includes("dumbbell") && !p?.equipment?.includes("bodyweight")) {
          setHomeEquipment("dumbbell");
        } else {
          setHomeEquipment("bodyweight");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const detectedInjuries = useMemo(
    () => detectInjuries(profile?.limitations),
    [profile?.limitations]
  );

  // Fitness level comes directly from profile selection
  const isIntermediate =
    profile?.fitness_level === "intermediate" || profile?.fitness_level === "advanced";
  const userLevel = isIntermediate ? "intermediate" : "beginner";
  const isHome = (profile?.location ?? "home") === "home";

  // Data Filtering Logic:
  // 1. Beginner profile:
  //    - At Home: home_bodyweight_beginner or home_dumbbell_beginner
  //    - Gym: gym_beginner
  // 2. Intermediate profile:
  //    - 3-day split by activeDay
  const visibleExercises = useMemo(() => {
    if (userLevel === "beginner") {
      if (isHome) {
        if (homeEquipment === "dumbbell") {
          return exercises.filter((e) => e.routine_type === "home_dumbbell_beginner");
        }
        return exercises.filter((e) => e.routine_type === "home_bodyweight_beginner");
      }
      return exercises.filter(
        (e) => e.routine_type === "gym_beginner" || (e.level === "beginner" && e.location === "gym")
      );
    }

    if (userLevel === "intermediate") {
      return exercises.filter(
        (e) => (e.routine_type === "intermediate_split" || e.level === "intermediate") && e.day === activeDay
      );
    }

    return [];
  }, [exercises, userLevel, isHome, homeEquipment, activeDay]);

  if (loading) return <p>Loading exercises...</p>;
  if (error) return <p className="error">{error}</p>;

  // Title and duration calculation
  let currentTitle = "Your Workout Plan";
  let currentDuration = "About 30 min";

  if (userLevel === "intermediate") {
    currentTitle = `${activeDay} · ${DAY_SUBTITLES[activeDay] || "Workout"}`;
    currentDuration = DAY_DURATIONS[activeDay] || "About 35 min";
  } else if (isHome) {
    if (homeEquipment === "dumbbell") {
      currentTitle = "Beginner · At Home (Dumbbells)";
      currentDuration = "About 25–30 min";
    } else {
      currentTitle = "Beginner · At Home (No Equipment)";
      currentDuration = "About 20–25 min";
    }
  } else {
    currentTitle = "Initial Routine · Full Body Workout";
    currentDuration = "About 30 min";
  }

  return (
    <div>
      {/* Profile Routine Status Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>
            Exercise routine
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: "14px" }}>
            Routine tailored for:{" "}
            <strong style={{ color: "#2563eb", textTransform: "capitalize" }}>
              {profile?.fitness_level || "Beginner"}
            </strong>{" "}
            · Location:{" "}
            <strong style={{ color: "#0f172a", textTransform: "capitalize" }}>
              {profile?.location || "Home"}
            </strong>
          </p>
        </div>

        <Link
          to="/profile"
          className="routine-toggle-pill"
          style={{ textDecoration: "none", fontSize: "13px", padding: "8px 16px" }}
          title="Change fitness level or location in profile"
        >
          {userLevel === "intermediate" ? "🔥 Intermediate Routine" : "🟢 Beginner Routine"}
          <span style={{ color: "#64748b", marginLeft: "6px" }}>(Profile ⚙️)</span>
        </Link>
      </div>

      {/* Injury Safety Notice Banner if User Has Limitations */}
      {detectedInjuries.length > 0 && (
        <div className="safety-banner" style={{ marginBottom: "20px" }}>
          <strong>⚠️ Injury Protection Active</strong>
          <p>
            Your profile lists: <em>&ldquo;{profile?.limitations}&rdquo;</em> (detected:{" "}
            {detectedInjuries.map((i) => i.label).join(", ")}). Movements placing excessive mechanical stress on
            these joints are flagged below with safety warnings and safe alternatives.
          </p>
        </div>
      )}

      {/* Sub-Tabs: ONLY for Intermediate Profiles (Day 1, Day 2, Day 3) */}
      {userLevel === "intermediate" && (
        <div>
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

      {/* Equipment Selector: For Beginner At Home (Bodyweight vs Dumbbells) */}
      {userLevel === "beginner" && isHome && (
        <div style={{ display: "flex", gap: "10px", marginBottom: "18px", flexWrap: "wrap" }}>
          <button
            type="button"
            className={`routine-toggle-pill ${homeEquipment === "bodyweight" ? "active" : ""}`}
            onClick={() => {
              setHomeEquipment("bodyweight");
              setOpenId(null);
            }}
            style={{ padding: "8px 16px", fontSize: "14px", fontWeight: "600" }}
          >
            🏠 Bodyweight (No Equipment)
          </button>
          <button
            type="button"
            className={`routine-toggle-pill ${homeEquipment === "dumbbell" ? "active" : ""}`}
            onClick={() => {
              setHomeEquipment("dumbbell");
              setOpenId(null);
            }}
            style={{ padding: "8px 16px", fontSize: "14px", fontWeight: "600" }}
          >
            🏋️ Dumbbells
          </button>
        </div>
      )}

      {/* Main Exercise Card Container & Clean List (Matching Reference Photo) */}
      <div className="workout-plan-card">
        <div className="workout-card-header">
          <h2 className="workout-card-title">{currentTitle}</h2>
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
                      <div className="exercise-row-thumb" style={{ background: "#f8fafc" }}>
                        {e.imageUrl ? (
                          <img
                            src={e.imageUrl}
                            alt={e.name}
                            className="exercise-thumb-media"
                            style={{ objectFit: "contain", background: "#ffffff" }}
                          />
                        ) : e.videoUrl ? (
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

                    {/* Right: Sets & Reps format ('2 x 10–12 reps' or '4 x 12') + Arrow icon ( > ) */}
                    <div className="exercise-row-right">
                      <span className="exercise-row-sets">
                        {e.sets || 2} &times; {e.reps || 12}
                      </span>
                      <span className={`exercise-row-chevron ${isOpen ? "open" : ""}`}>
                        &gt;
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isOpen && (
                    <div className="exercise-detail-panel">
                      {/* Media Display: Photo or Video */}
                      {e.imageUrl ? (
                        <div
                          className="exercise-detail-video-box"
                          style={{
                            background: "#ffffff",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "16px",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <img
                            src={e.imageUrl}
                            alt={e.name}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "320px",
                              objectFit: "contain",
                              borderRadius: "8px",
                            }}
                          />
                        </div>
                      ) : e.videoUrl ? (
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
                      ) : null}

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
