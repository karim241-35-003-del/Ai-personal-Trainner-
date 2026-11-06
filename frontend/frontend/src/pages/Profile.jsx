import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { ACTIVITY_LEVELS, GOALS, FITNESS_LEVELS, LOCATIONS, EQUIPMENT, LIMITS } from "../constants.js";

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
    if (f[key] === "" || Number.isNaN(v) || v < min || v > max) e[key] = `${label} must be between ${min} and ${max}.`;
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
      .then((p) => { if (p) setForm({ ...EMPTY, ...p, days_per_week: String(p.days_per_week ?? 3) }); })
      .catch((err) => setServerError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleEquipment = (value) => {
    const has = form.equipment.includes(value);
    setForm({ ...form, equipment: has ? form.equipment.filter((x) => x !== value) : [...form.equipment, value] });
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

  if (loading) return <p>Loading your profile...</p>;

  const select = (name, options) => (
    <select name={name} value={form[name]} onChange={change}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  return (
    <div className="card">
      <h1>Your fitness profile</h1>
      <p className="muted">We use this to calculate your calorie and protein targets. Only the details needed for that are asked.</p>
      <form onSubmit={onSubmit} noValidate>
        <div className="grid">
          <label>Age
            <input name="age" type="number" value={form.age} onChange={change} />
            {errors.age && <span className="error">{errors.age}</span>}
          </label>
          <label>Sex (used in the calorie formula)
            <select name="sex" value={form.sex} onChange={change}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label>Height (cm)
            <input name="height" type="number" value={form.height} onChange={change} />
            {errors.height && <span className="error">{errors.height}</span>}
          </label>
          <label>Weight (kg)
            <input name="weight" type="number" step="0.1" value={form.weight} onChange={change} />
            {errors.weight && <span className="error">{errors.weight}</span>}
          </label>
          <label>Activity level {select("activity", ACTIVITY_LEVELS)}</label>
          <label>Goal {select("goal", GOALS)}</label>
          <label>Fitness level {select("fitness_level", FITNESS_LEVELS)}</label>
          <label>Workout days per week
            <select name="days_per_week" value={form.days_per_week} onChange={change}>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label>Where do you work out? {select("location", LOCATIONS)}</label>
        </div>

        <fieldset>
          <legend>Equipment you have</legend>
          {EQUIPMENT.map((o) => (
            <label key={o.value} className="check">
              <input type="checkbox" checked={form.equipment.includes(o.value)} onChange={() => toggleEquipment(o.value)} />
              {o.label}
            </label>
          ))}
          {errors.equipment && <span className="error">{errors.equipment}</span>}
        </fieldset>

        <label>Injuries or physical limitations (optional)
          <textarea name="limitations" rows="3" value={form.limitations} onChange={change} placeholder="For example: knee pain" />
        </label>

        {serverError && <p className="error">{serverError}</p>}
        <button className="btn" disabled={busy}>{busy ? "Saving..." : "Save and see my targets"}</button>
      </form>
    </div>
  );
}
