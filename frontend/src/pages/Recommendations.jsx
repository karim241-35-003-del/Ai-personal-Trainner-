import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { EQUIPMENT, FITNESS_LEVELS, GOALS } from "../constants.js";
import "../styles/progress-pages.css";

const labelFor = (list, val) => list.find((o) => o.value === val)?.label ?? val;
const LOWER_MUSCLES = new Set(["legs", "glutes", "calves", "hamstrings", "quads"]);

function computeBMI(weightKg, heightCm) {
  const w = Number(weightKg);
  const h = Number(heightCm);
  if (!w || !h || w <= 0 || h <= 0) return null;
  const val = w / ((h / 100) ** 2);
  const rounded = Math.round(val * 10) / 10;
  let category = "Normal";
  let cls = "normal";
  if (rounded < 18.5) {
    category = "Underweight";
    cls = "under";
  } else if (rounded >= 30) {
    category = "Obese";
    cls = "obese";
  } else if (rounded >= 25) {
    category = "Overweight";
    cls = "over";
  }
  return { value: rounded, category, cls };
}

function localDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function actionFor(item) {
  if (item.id === "sync-profile-weight") return { to: "/profile", label: "Edit Profile →" };
  if (item.id === "equipment-picks") return { to: "/exercises", label: "Exercise Library →" };
  if (item.category === "workout") return { to: "/workouts", label: "Open Workout Log →" };
  if (item.category === "nutrition") return { to: "/progress", label: "Update Progress →" };
  if (item.category === "form") return { to: "/form-check", label: "Check Form →" };
  return { to: "/dashboard", label: "View Dashboard →" };
}

const CAT_LABELS = {
  workout: "Workout",
  nutrition: "Nutrition",
  form: "Form & Safety",
  general: "General",
};

export default function Recommendations() {
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [weights, setWeights] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getRecommendations(),
      api.getProfile(),
      api.getNutritionPlan(),
      api.listWorkouts(),
      api.listWeights(),
      api.getExercises(),
    ])
      .then(([rec, p, n, logs, w, exList]) => {
        setData(rec);
        setProfile(p);
        setPlan(n);
        setWorkouts(logs || []);
        setWeights(w || []);
        setExercises(exList || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const cutoffStr = localDateStr(-6);
    const recentDays = new Set(workouts.filter((w) => w.date >= cutoffStr).map((w) => w.date)).size;

    const exById = new Map(exercises.map((ex) => [ex.id, ex]));
    let upperCount = 0;
    let lowerCount = 0;
    for (const w of workouts) {
      const ex = exById.get(w.exercise_id);
      const isLower = ex?.body_part
        ? ex.body_part === "lower"
        : LOWER_MUSCLES.has((ex?.muscle_group || "").toLowerCase());
      if (isLower) lowerCount += 1;
      else upperCount += 1;
    }

    const sortedWeights = [...weights].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const latestWeight = sortedWeights.length
      ? sortedWeights[sortedWeights.length - 1].weight_kg
      : profile?.weight ?? null;
    const weightChange = sortedWeights.length >= 2
      ? sortedWeights[sortedWeights.length - 1].weight_kg - sortedWeights[0].weight_kg
      : null;

    let bmi = null;
    if (latestWeight !== null && profile?.height) {
      bmi = computeBMI(latestWeight, profile.height);
    } else if (plan?.bmi) {
      const v = Number(plan.bmi);
      let cls = "normal";
      if (v < 18.5) cls = "under";
      else if (v >= 30) cls = "obese";
      else if (v >= 25) cls = "over";
      bmi = { value: v, category: plan.bmi_category || "Normal", cls };
    }

    return { recentDays, upperCount, lowerCount, latestWeight, weightChange, bmi };
  }, [workouts, weights, exercises, profile, plan]);

  if (loading) return <p>Loading your recommendations...</p>;
  if (error) return <p className="error">{error}</p>;

  if (!data || !profile) {
    return (
      <div className="rc-card narrow" style={{ marginLeft: "auto", marginRight: "auto" }}>
        <h1>Recommendations</h1>
        <p>Fill in your fitness profile first, then personalized tips based on your profile and progress will appear here.</p>
        <Link className="btn" to="/profile">Complete my profile</Link>
      </div>
    );
  }

  const currentBMI = stats.bmi;

  const proteinText = plan
    ? (plan.protein_min_g === plan.protein_max_g
        ? `${plan.protein_min_g} g`
        : `${plan.protein_min_g}–${plan.protein_max_g} g`)
    : "-";

  const items = data.items || [];
  const categories = ["workout", "nutrition", "form", "general"].filter((cat) =>
    items.some((r) => r.category === cat)
  );
  const visibleItems = categoryFilter === "all"
    ? items
    : items.filter((r) => r.category === categoryFilter);

  const changeText = stats.weightChange === null
    ? "Need 2+ weight logs"
    : `${stats.weightChange > 0 ? "+" : ""}${stats.weightChange.toFixed(1)} kg trend`;

  return (
    <div className="rc-page">
      <div className="rc-header">
        <div>
          <h1>Recommendations</h1>
          <p className="muted">Personalized advice synced with your fitness profile, workout logs, and weight progress.</p>
        </div>
        <Link className="rc-action-link" to="/profile">Update Profile</Link>
      </div>

      {data.demo && (
        <p className="rc-notice">
          Demo mode: recommendations are generated live in your browser from your profile, Workout log, and Progress entries.
        </p>
      )}

      {/* Profile & Progress Snapshot */}
      <div className="rc-snapshot-grid">
        <div className="rc-snap-card">
          <span className="rc-snap-label">Goal &amp; Nutrition</span>
          <span className="rc-snap-value">{labelFor(GOALS, profile.goal)}</span>
          <span className="rc-snap-sub">
            {plan ? `${plan.daily_calorie_target} kcal • ${proteinText} protein` : "Save profile for targets"}
          </span>
        </div>

        <div className="rc-snap-card">
          <span className="rc-snap-label">Weight Progress</span>
          <span className="rc-snap-value">
            {stats.latestWeight !== null ? `${stats.latestWeight} kg` : "-"}
          </span>
          <span className="rc-snap-sub">{changeText}</span>
        </div>

        <div className="rc-snap-card">
          <span className="rc-snap-label">Current BMI</span>
          <span className="rc-snap-value" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            {currentBMI ? currentBMI.value : "-"}
            {currentBMI && (
              <span className={`pg-bmi-pill ${currentBMI.cls}`} style={{ fontSize: "11px", padding: "2px 8px" }}>
                {currentBMI.category}
              </span>
            )}
          </span>
          <span className="rc-snap-sub">
            {profile?.height ? `Height: ${profile.height} cm` : "Add height in Profile"}
          </span>
        </div>

        <div className="rc-snap-card">
          <span className="rc-snap-label">Weekly Consistency</span>
          <span className="rc-snap-value">
            {stats.recentDays} / {profile.days_per_week} days
          </span>
          <span className="rc-snap-sub">Training days in last 7 days</span>
        </div>

        <div className="rc-snap-card">
          <span className="rc-snap-label">Workout Split Logs</span>
          <span className="rc-snap-value">
            {stats.upperCount} Upper • {stats.lowerCount} Lower
          </span>
          <span className="rc-snap-sub">Total entries: {workouts.length}</span>
        </div>
      </div>

      {/* Why this plan card */}
      {data.summary && (
        <div className="rc-card">
          <div className="rc-card-head">
            <h2>Why this plan?</h2>
            <span className="muted" style={{ fontSize: "13px" }}>
              {currentBMI
                ? `BMI ${currentBMI.value} (${currentBMI.category})`
                : plan?.bmi
                ? `BMI ${plan.bmi} (${plan.bmi_category})`
                : ""}
            </span>
          </div>
          <p style={{ margin: 0 }}>{data.summary}</p>
          <div className="rc-profile-chips">
            <span className="rc-profile-chip">Level: {labelFor(FITNESS_LEVELS, profile.fitness_level)}</span>
            <span className="rc-profile-chip">
              Location: {profile.location === "gym" ? "At a gym" : "At home"}
            </span>
            <span className="rc-profile-chip">
              Equipment: {(profile.equipment || []).map((eq) => labelFor(EQUIPMENT, eq)).join(", ")}
            </span>
            {profile.limitations && (
              <span className="rc-profile-chip warn">Limitation: {profile.limitations}</span>
            )}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      {items.length > 0 && (
        <div className="rc-filters">
          <button
            type="button"
            className={`rc-filter-btn ${categoryFilter === "all" ? "active" : ""}`}
            onClick={() => setCategoryFilter("all")}
          >
            All ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              className={`rc-filter-btn ${categoryFilter === cat ? "active" : ""}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {CAT_LABELS[cat] || cat} ({items.filter((r) => r.category === cat).length})
            </button>
          ))}
        </div>
      )}

      {/* Recommendation Items */}
      {visibleItems.length === 0 ? (
        <div className="rc-card">
          <p className="empty" style={{ margin: 0 }}>No recommendations match this category.</p>
        </div>
      ) : (
        <div className="rec-list">
          {visibleItems.map((r) => {
            const action = actionFor(r);
            return (
              <article className={`rec cat-${r.category}`} key={r.id}>
                <div className="rec-top">
                  <h2>{r.title}</h2>
                  <span className={`rec-cat-badge cat-${r.category}`}>
                    {CAT_LABELS[r.category] || r.category}
                  </span>
                </div>
                <p>{r.detail}</p>
                <div className="rec-footer">
                  <p className="why">Why: {r.reason}</p>
                  <Link className="rc-action-link" to={action.to}>{action.label}</Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="rc-notice">
        This is general fitness guidance, not medical advice. Stop if you feel pain, and talk to a doctor if you
        have an injury or health condition.
      </p>
    </div>
  );
}
