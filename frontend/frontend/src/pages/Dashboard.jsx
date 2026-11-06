import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { ACTIVITY_LEVELS, GOALS } from "../constants.js";

const label = (list, value) => list.find((o) => o.value === value)?.label ?? value;

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getProfile(), api.getNutritionPlan()])
      .then(([p, n]) => { setProfile(p); setPlan(n); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  if (!profile || !plan) {
    return (
      <div className="card narrow">
        <h1>Welcome</h1>
        <p>Fill in your fitness profile first, then your calorie and protein targets will appear here.</p>
        <Link className="btn" to="/profile">Complete my profile</Link>
      </div>
    );
  }

  const adjust = plan.daily_calorie_target - plan.tdee;
  const adjustText = adjust === 0 ? "no change" : `${adjust > 0 ? "+" : ""}${adjust} kcal`;
  const protein = plan.protein_min_g === plan.protein_max_g
    ? `${plan.protein_min_g} g` : `${plan.protein_min_g} to ${plan.protein_max_g} g`;

  return (
    <div>
      <h1>Your daily targets</h1>
      <p className="muted">
        Goal: <strong>{label(GOALS, plan.goal)}</strong> | Activity: <strong>{label(ACTIVITY_LEVELS, profile.activity)}</strong>
        {" "}| <Link to="/profile">Edit profile</Link>
      </p>

      <div className="cards">
        <div className="stat">
          <span className="stat-title">Calories</span>
          <span className="stat-value">{plan.daily_calorie_target}</span>
          <span className="stat-unit">kcal per day</span>
        </div>
        <div className="stat">
          <span className="stat-title">Protein</span>
          <span className="stat-value">{protein}</span>
          <span className="stat-unit">per day</span>
        </div>
        <div className="stat">
          <span className="stat-title">BMI</span>
          <span className="stat-value">{plan.bmi}</span>
          <span className="stat-unit">{plan.bmi_category}</span>
        </div>
      </div>

      <div className="card">
        <h2>How we calculated it</h2>
        <ul>
          <li>BMR (resting energy, Mifflin-St Jeor formula): <strong>{plan.bmr} kcal</strong></li>
          <li>TDEE = BMR x activity factor: <strong>{plan.tdee} kcal</strong></li>
          <li>Goal adjustment: <strong>{adjustText}</strong>, so your target is <strong>{plan.daily_calorie_target} kcal</strong></li>
          <li>Protein: about 1 g per kg of body weight if you do not exercise, and 1.5 to 2 g per kg if you exercise.</li>
        </ul>
        <p className="notice">
          These are approximate estimates for general fitness guidance, not medical advice. If you have a health
          condition, talk to a doctor before changing your diet or exercise.
        </p>
      </div>

      <p className="muted">Coming next: your workout plan and meal guidance.</p>
    </div>
  );
}
