import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { detectInjuries, getExerciseContraindication } from "../utils/injuryRules.js";
import "../styles/trainer-pages.css";

const GYM_INT_SUBTITLES = {
  "Day 1": "Chest · Shoulder · Tricep",
  "Day 2": "Legs",
  "Day 3": "Back · Biceps",
};

const GYM_INT_DURATIONS = {
  "Day 1": "About 35 min",
  "Day 2": "About 30 min",
  "Day 3": "About 40 min",
};

const HOME_INT_SUBTITLES = {
  "Day 1": "Chest · Triceps · Shoulders",
  "Day 2": "Legs · Abs",
  "Day 3": "Back · Biceps",
};

const HOME_INT_DURATIONS = {
  "Day 1": "About 35–40 min",
  "Day 2": "About 35–40 min",
  "Day 3": "About 35–40 min",
};

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sub-Tabs for Intermediate Split (default: 'Day 1')
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

  // Fitness level, location & equipment come directly from profile selection
  const isIntermediate =
    profile?.fitness_level === "intermediate" || profile?.fitness_level === "advanced";
  const userLevel = isIntermediate ? "intermediate" : "beginner";
  const isHome = (profile?.location ?? "home") === "home";
  const hasDumbbell = Boolean(profile?.equipment?.includes("dumbbell"));

  // Data Filtering Logic:
  // 1. Beginner profile:
  //    - At Home:
  //        * Dumbbells: home_dumbbell_beginner
  //        * Bodyweight: home_bodyweight_beginner
  //    - Gym: gym_beginner
  // 2. Intermediate profile:
  //    - At Home:
  //        * Bodyweight only: home_bodyweight_intermediate (9 exercises)
  //        * Dumbbells: home_dumbbell_intermediate by activeDay (3-day split)
  //    - Gym: intermediate_split by activeDay (3-day split)
  const visibleExercises = useMemo(() => {
    if (userLevel === "beginner") {
      if (isHome) {
        if (hasDumbbell) {
          return exercises.filter((e) => e.routine_type === "home_dumbbell_beginner");
        }
        return exercises.filter((e) => e.routine_type === "home_bodyweight_beginner");
      }
      return exercises.filter(
        (e) => e.routine_type === "gym_beginner" || (e.level === "beginner" && e.location === "gym")
      );
    }

    if (userLevel === "intermediate") {
      if (isHome) {
        if (hasDumbbell) {
          return exercises.filter(
            (e) => e.routine_type === "home_dumbbell_intermediate" && e.day === activeDay
          );
        }
        return exercises.filter(
          (e) => e.routine_type === "home_bodyweight_intermediate"
        );
      }
      return exercises.filter(
        (e) => e.routine_type === "intermediate_split" && e.day === activeDay
      );
    }

    return [];
  }, [exercises, userLevel, isHome, hasDumbbell, activeDay]);

  if (loading) return <p>Loading exercises...</p>;
  if (error) return <p className="error">{error}</p>;

  // Subtitles & Durations lookup for 3-Day Splits
  const intSubtitles = isHome ? HOME_INT_SUBTITLES : GYM_INT_SUBTITLES;
  const intDurations = isHome ? HOME_INT_DURATIONS : GYM_INT_DURATIONS;

  // Title and duration calculation
  let currentTitle = "Your Workout Plan";
  let currentDuration = "About 30 min";

  if (userLevel === "intermediate") {
    if (isHome) {
      if (hasDumbbell) {
        currentTitle = `${activeDay} · ${intSubtitles[activeDay] || "Workout"}`;
        currentDuration = intDurations[activeDay] || "About 35 min";
      } else {
        currentTitle = "Intermediate · At Home (No Equipment)";
        currentDuration = "About 25–30 min";
      }
    } else {
      currentTitle = `${activeDay} · ${intSubtitles[activeDay] || "Workout"}`;
      currentDuration = intDurations[activeDay] || "About 35 min";
    }
  } else if (isHome) {
    if (hasDumbbell) {
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

  // Active split description badge
  let profileBadgeText = "";
  if (isHome) {
    if (hasDumbbell) {
      profileBadgeText = userLevel === "intermediate" ? "(Dumbbell 3-Day Split)" : "(Dumbbell Routine)";
    } else {
      profileBadgeText = "(No Equipment · Bodyweight)";
    }
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
            {profileBadgeText && (
              <span style={{ color: "#16a34a", fontWeight: "600", marginLeft: "6px" }}>
                · {profileBadgeText}
              </span>
            )}
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

      {/* Sub-Tabs: ONLY for Intermediate 3-Day Splits (Gym, or Home with Dumbbells) */}
      {userLevel === "intermediate" && (!isHome || hasDumbbell) && (
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
                  <span className="plan-subtab-subtitle">{intSubtitles[d]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Exercise Card Container & Clean List */}
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

                    {/* Right: Sets & Reps format + Arrow icon ( > ) */}
                    <div className="exercise-row-right">
                      <span className="exercise-row-sets">
                        {e.sets || 3} &times; {e.reps || 12}
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
                      ) : (e.videoUrl || e.video) ? (
                        <div className="exercise-detail-video-box">
                          <video
                            key={e.videoUrl || e.video}
                            className="exercise-detail-video"
                            autoPlay
                            muted
                            loop
                            playsInline
                            controls
                          >
                            <source src={e.videoUrl || e.video} type={(e.videoUrl || e.video).endsWith(".mov") ? "video/quicktime" : "video/mp4"} />
                            <source src={e.videoUrl || e.video} type="video/mp4" />
                            Your browser does not support HTML5 video.
                          </video>
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
