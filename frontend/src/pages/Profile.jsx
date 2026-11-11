import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { ACTIVITY_LEVELS, GOALS, FITNESS_LEVELS, LOCATIONS, EQUIPMENT, LIMITS } from "../constants.js";
import { detectInjuries } from "../utils/injuryRules.js";
import "../styles/trainer-pages.css";
import "../styles/profile-modern.css";

const EMPTY = {
  age: "", sex: "male", height: "", weight: "",
  activity: "light", goal: "gain", fitness_level: "beginner",
  days_per_week: "3", location: "home", equipment: ["bodyweight"], limitations: "",
};

function validate(f) {
  const e = {};
  const num = (key, label) => {
    const v = Number(f[key]);
    const { min, max } = LIMITS[key];
    if (f[key] === "" || Number.isNaN(v) || v < min || v > max) {
      e[key] = `${label} must be between ${min} and ${max}.`;
    }
  };
  num("age", "Age");
  num("height", "Height (cm)");
  num("weight", "Weight (kg)");
  if (f.equipment.length === 0) e.equipment = "Choose at least one option.";
  return e;
}

export default function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getProfile()
      .then((p) => {
        if (p) {
          const loc = p.location ?? "home";
          let eq = Array.isArray(p.equipment) ? p.equipment.filter((x) => x !== "barbell") : ["bodyweight"];
          if (loc === "gym" && !eq.includes("gym_machines")) {
            eq.push("gym_machines");
          }
          if (loc === "home") {
            // Home users can only select bodyweight or dumbbell, not both at a time
            eq = eq.includes("dumbbell") ? ["dumbbell"] : ["bodyweight"];
          }
          const fitnessLevel = p.fitness_level === "advanced" ? "intermediate" : (p.fitness_level ?? "beginner");
          setForm({
            ...EMPTY,
            ...p,
            location: loc,
            fitness_level: fitnessLevel,
            equipment: eq,
            days_per_week: String(p.days_per_week ?? 3),
          });
        }
      })
      .catch((err) => setServerError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const change = (e) => {
    const { name, value } = e.target;
    if (name === "location") {
      if (value === "gym") {
        setForm((prev) => ({
          ...prev,
          location: value,
          equipment: prev.equipment.includes("gym_machines")
            ? prev.equipment
            : [...prev.equipment.filter((x) => x !== "barbell"), "gym_machines"],
        }));
      } else {
        // Switched to home: can only select bodyweight or dumbbell, not both at a time
        setForm((prev) => ({
          ...prev,
          location: value,
          equipment: prev.equipment.includes("dumbbell") ? ["dumbbell"] : ["bodyweight"],
        }));
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEquipment = (value) => {
    if (form.location === "home") {
      // At home: can only select bodyweight or dumbbell, not both at a time
      setForm((prev) => ({
        ...prev,
        equipment: [value],
      }));
      return;
    }

    const has = form.equipment.includes(value);
    setForm((prev) => ({
      ...prev,
      equipment: has
        ? prev.equipment.filter((x) => x !== value)
        : [...prev.equipment, value],
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    try {
      await api.saveProfile({
        ...form,
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        days_per_week: Number(form.days_per_week),
      });
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", padding: "40px 0" }}>Loading your profile...</p>;

  const detectedInjuries = detectInjuries(form.limitations);

  return (
    <div className="modern-profile-card">
      <div className="profile-header">
        <h1 className="profile-title">Your details</h1>
        <p className="profile-subtitle">
          We use this to calculate your daily calorie, macro nutrition targets, and workout safety parameters.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="form-section-gap">
        {/* Row 1: Gender */}
        <div className="form-field-group" style={{ maxWidth: "380px" }}>
          <label className="field-label">Gender</label>
          <div className="segmented-pill-container">
            <button
              type="button"
              className={`segmented-pill-btn ${form.sex === "male" ? "active-blue" : ""}`}
              onClick={() => setForm({ ...form, sex: "male" })}
            >
              <span>♂</span> Male
            </button>
            <button
              type="button"
              className={`segmented-pill-btn ${form.sex === "female" ? "active-blue" : ""}`}
              onClick={() => setForm({ ...form, sex: "female" })}
            >
              <span>♀</span> Female
            </button>
          </div>
        </div>

        {/* Row 2: 3-Column Metrics (Age, Height, Weight) */}
        <div className="form-grid-3">
          {/* Age Card */}
          <div className="metric-card">
            <div className="metric-card-header">
              <span className="metric-card-title">Age</span>
              <span className="field-sublabel">years</span>
            </div>
            <div className="value-badge-box">
              <input
                name="age"
                type="number"
                min={LIMITS.age.min}
                max={LIMITS.age.max}
                value={form.age}
                onChange={change}
                className="value-badge-input"
                placeholder="25"
              />
              <span className="value-badge-unit">years</span>
            </div>
            <div className="slider-control-col">
              <input
                type="range"
                min={LIMITS.age.min}
                max={LIMITS.age.max}
                value={form.age || 25}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="modern-range-slider"
              />
              <div className="slider-scale-labels">
                <span>{LIMITS.age.min}</span>
                <span className="slider-scale-current">{form.age || 25}</span>
                <span>{LIMITS.age.max}</span>
              </div>
            </div>
            {errors.age && <span className="error">{errors.age}</span>}
          </div>

          {/* Height Card */}
          <div className="metric-card">
            <div className="metric-card-header">
              <span className="metric-card-title">Height</span>
              <span className="field-sublabel">cm</span>
            </div>
            <div className="value-badge-box">
              <input
                name="height"
                type="number"
                min={LIMITS.height.min}
                max={LIMITS.height.max}
                value={form.height}
                onChange={change}
                className="value-badge-input"
                placeholder="170"
              />
              <span className="value-badge-unit">cm</span>
            </div>
            <div className="slider-control-col">
              <input
                type="range"
                min={LIMITS.height.min}
                max={LIMITS.height.max}
                value={form.height || 170}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
                className="modern-range-slider"
              />
              <div className="slider-scale-labels">
                <span>{LIMITS.height.min}</span>
                <span className="slider-scale-current">{form.height || 170}</span>
                <span>{LIMITS.height.max}</span>
              </div>
            </div>
            {errors.height && <span className="error">{errors.height}</span>}
          </div>

          {/* Weight Card */}
          <div className="metric-card">
            <div className="metric-card-header">
              <span className="metric-card-title">Weight</span>
              <span className="field-sublabel">kg</span>
            </div>
            <div className="value-badge-box">
              <input
                name="weight"
                type="number"
                step="0.1"
                min={LIMITS.weight.min}
                max={LIMITS.weight.max}
                value={form.weight}
                onChange={change}
                className="value-badge-input"
                placeholder="70"
              />
              <span className="value-badge-unit">kg</span>
            </div>
            <div className="slider-control-col">
              <input
                type="range"
                min={LIMITS.weight.min}
                max={LIMITS.weight.max}
                step="0.5"
                value={form.weight || 70}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="modern-range-slider"
              />
              <div className="slider-scale-labels">
                <span>{LIMITS.weight.min}</span>
                <span className="slider-scale-current">{form.weight || 70}</span>
                <span>{LIMITS.weight.max}</span>
              </div>
            </div>
            {errors.weight && <span className="error">{errors.weight}</span>}
          </div>
        </div>

        {/* Row 3: Activity Level & Goal */}
        <div className="form-grid-2">
          {/* Activity Level */}
          <div className="form-field-group">
            <label className="field-label">Activity level</label>
            <div className="modern-select-box">
              <select
                name="activity"
                value={form.activity}
                onChange={change}
                className="modern-select"
              >
                <option value="sedentary">🛋️ Sedentary (little to no exercise)</option>
                <option value="light">🚶 Lightly active (exercise 1-3 days/week)</option>
                <option value="moderate">🏃 Moderately active (exercise 3-5 days/week)</option>
                <option value="very">⚡ Very active (exercise 6-7 days/week)</option>
                <option value="super">🔥 Super active (training twice a day)</option>
              </select>
            </div>
          </div>

          {/* Goal Segmented Pill */}
          <div className="form-field-group">
            <label className="field-label">Goal</label>
            <div className="segmented-pill-container">
              <button
                type="button"
                className={`segmented-pill-btn ${form.goal === "lose" ? "active-coral" : ""}`}
                onClick={() => setForm({ ...form, goal: "lose" })}
              >
                <span>🔥</span> Weight loss
              </button>
              <button
                type="button"
                className={`segmented-pill-btn ${form.goal === "maintain" ? "active-coral" : ""}`}
                onClick={() => setForm({ ...form, goal: "maintain" })}
              >
                <span>⚖️</span> Weight maintain
              </button>
              <button
                type="button"
                className={`segmented-pill-btn ${form.goal === "gain" ? "active-coral" : ""}`}
                onClick={() => setForm({ ...form, goal: "gain" })}
              >
                <span>📈</span> Weight gain
              </button>
            </div>
          </div>
        </div>

        {/* Row 4: Workout Days, Fitness Level, Workout Location */}
        <div className="form-grid-3">
          {/* Workout Days */}
          <div className="form-field-group">
            <label className="field-label">Workout days / week</label>
            <div className="segmented-pill-container" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`segmented-pill-btn ${form.days_per_week === String(d) ? "active-blue" : ""}`}
                  style={{ padding: "8px 0" }}
                  onClick={() => setForm({ ...form, days_per_week: String(d) })}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Fitness Level */}
          <div className="form-field-group">
            <label className="field-label">Fitness experience</label>
            <div className="modern-select-box">
              <select name="fitness_level" value={form.fitness_level} onChange={change} className="modern-select">
                {FITNESS_LEVELS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Workout Location */}
          <div className="form-field-group">
            <label className="field-label">Workout location</label>
            <div className="modern-select-box">
              <select name="location" value={form.location} onChange={change} className="modern-select">
                {LOCATIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Row 5: Equipment Checkboxes */}
        {/* Row 5: Equipment Selection */}
        <div className="form-field-group">
          <label className="field-label">
            Equipment you have
            {form.location === "home" && (
              <span className="muted" style={{ fontWeight: "normal", fontSize: "13px", marginLeft: "8px" }}>
                (Choose Bodyweight or Dumbbells)
              </span>
            )}
          </label>
          <div className="equipment-cards-grid">
            {(form.location === "home"
              ? EQUIPMENT.filter((o) => o.value !== "gym_machines")
              : EQUIPMENT
            ).map((o) => {
              const checked = form.equipment.includes(o.value);
              const isHome = form.location === "home";
              return (
                <label
                  key={o.value}
                  className={`equipment-pill-card ${checked ? "selected" : ""}`}
                >
                  <input
                    type={isHome ? "radio" : "checkbox"}
                    name={isHome ? "home_equipment" : undefined}
                    checked={checked}
                    onChange={() => toggleEquipment(o.value)}
                  />
                  <span>{o.label}</span>
                </label>
              );
            })}
          </div>
          {errors.equipment && <span className="error">{errors.equipment}</span>}
        </div>

        {/* Row 6: Injuries or Limitations */}
        <div className="form-field-group">
          <label className="field-label">Injuries or physical limitations (optional)</label>
          <textarea
            name="limitations"
            rows="3"
            value={form.limitations}
            onChange={change}
            className="modern-textarea"
            placeholder="For example: shoulder injury, knee pain, lower back pain"
          />
          <div style={{ marginTop: 2 }}>
            <span className="muted" style={{ fontSize: 13 }}>Quick add common issues:</span>
            <div className="injury-tags">
              {["Shoulder injury", "Knee pain", "Lower back pain", "Wrist pain"].map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className="injury-tag-btn"
                  onClick={() => {
                    const current = form.limitations.trim();
                    const next = current
                      ? (current.toLowerCase().includes(tag.toLowerCase()) ? current : `${current}, ${tag}`)
                      : tag;
                    setForm({ ...form, limitations: next });
                  }}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {detectedInjuries.length > 0 && (
            <div className="safety-banner" style={{ marginTop: 10, marginBottom: 0 }}>
              🛡️ <strong>Safety check:</strong> Detected <strong>{detectedInjuries.map((d) => d.label).join(", ")}</strong> limitation.
              Exercises that stress these areas (like push-ups for shoulder injuries) will automatically be flagged and filtered in your workouts and exercise library.
            </div>
          )}
        </div>

        {serverError && <p className="error">{serverError}</p>}

        {/* Prominent Bottom Submit Button */}
        <button className="profile-submit-btn" disabled={busy}>
          {busy ? "Saving your profile..." : "Save and see my targets"}
        </button>
      </form>
    </div>
  );
}
