import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { ACTIVITY_LEVELS, GOALS } from "../constants.js";
import CalorieDialCard from "../components/CalorieDialCard.jsx";

const label = (list, value) => list.find((o) => o.value === value)?.label ?? value;

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeGoal, setActiveGoal] = useState(null);
  const [activeCalories, setActiveCalories] = useState(null);

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

  const currentGoal = activeGoal || plan.goal || "maintain";
  const adjust = plan.daily_calorie_target - plan.tdee;
  const adjustText = adjust === 0 ? "no change (Same as TDEE)" : `${adjust > 0 ? "+" : ""}${adjust} kcal`;
  const protein = plan.protein_min_g === plan.protein_max_g
    ? `${plan.protein_min_g} g` : `${plan.protein_min_g} to ${plan.protein_max_g} g`;

  const activityFactor = ACTIVITY_LEVELS.find((a) => a.value === profile.activity)?.factor ?? 1.2;

  // Calorie targets for each goal option
  const targetCalories = {
    lose: Math.max(1200, Math.round(plan.tdee - 400)),
    maintain: Math.round(plan.tdee),
    gain: Math.round(plan.tdee + 350),
  };

  const currentTargetVal = activeCalories || targetCalories[currentGoal] || plan.daily_calorie_target;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Daily Calorie & Nutrition Intake</h1>
          <p className="muted" style={{ margin: 0 }}>
            Current Profile: <strong>{label(GOALS, plan.goal)}</strong> · Activity: <strong>{label(ACTIVITY_LEVELS, profile.activity)}</strong>
            {" "}· <Link to="/profile">Edit profile</Link>
          </p>
        </div>
      </div>

      {/* Modern Calorie & Nutrition Dial Gauge Card */}
      <CalorieDialCard
        plan={plan}
        profile={profile}
        activeGoal={currentGoal}
        onGoalChange={(goalKey, cal) => {
          setActiveGoal(goalKey);
          setActiveCalories(cal);
        }}
        formulaName="Mifflin-St Jeor (AJCN 1990)"
      />

      <div className="cards" style={{ marginTop: 20 }}>
        <div className="stat">
          <span className="stat-title">BMI Score</span>
          <span className="stat-value">{plan.bmi}</span>
          <span className="stat-unit">{plan.bmi_category}</span>
        </div>
        <div className="stat">
          <span className="stat-title">Daily Protein Target</span>
          <span className="stat-value">{protein}</span>
          <span className="stat-unit">recommended per day ({profile.activity === "sedentary" ? "1g/kg" : "1.5-2g/kg"})</span>
        </div>
        <div className="stat">
          <span className="stat-title">
            {currentGoal === "maintain"
              ? "Weight Maintain Target"
              : currentGoal === "gain"
              ? "Weight Gain Target"
              : "Weight Loss Target"}
          </span>
          <span className="stat-value">{currentTargetVal}</span>
          <span className="stat-unit">
            {currentGoal === "maintain"
              ? `kcal per day (Same as TDEE: ${plan.tdee})`
              : currentGoal === "gain"
              ? `kcal per day (+350 to TDEE: ${plan.tdee})`
              : `kcal per day (-400 from TDEE: ${plan.tdee})`}
          </span>
        </div>
      </div>

      <div className="card">
        <h2>How we calculated it</h2>
        <ul>
          <li>
            BMR (resting energy, Mifflin-St Jeor formula): <strong>{plan.bmr} kcal</strong>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              {profile.sex === "male"
                ? `Formula (Men): 10 x ${profile.weight}kg + 6.25 x ${profile.height}cm - 5 x ${profile.age} + 5 = ${plan.bmr} kcal`
                : `Formula (Women): 10 x ${profile.weight}kg + 6.25 x ${profile.height}cm - 5 x ${profile.age} - 161 = ${plan.bmr} kcal`}
            </div>
          </li>
          <li>
            TDEE = BMR x Activity Factor: <strong>{plan.tdee} kcal</strong>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              {plan.bmr} kcal x {activityFactor} ({label(ACTIVITY_LEVELS, profile.activity)})
            </div>
          </li>
          <li>
            Goal adjustment: <strong>{adjustText}</strong>, so your target is <strong>{plan.daily_calorie_target} kcal</strong>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              Rules: Weight maintain = Same as TDEE · Weight loss = Subtract 300 to 500 kcal · Weight gain = Add 200 to 500 kcal
            </div>
          </li>
          <li>
            Protein: about 1 g per kg of body weight if you do not exercise, and 1.5 to 2 g per kg if you exercise.
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              Current target: {protein} ({profile.weight} kg body weight)
            </div>
          </li>
        </ul>

        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #edf2f7", fontSize: 13, color: "#475569" }}>
          <p style={{ margin: "5px 0" }}>
            📖 <strong>Calorie Source (Scientific Journal):</strong> The calorie formulas for BMR and TDEE are based on the <strong>Mifflin-St Jeor equation</strong>. This is not the trainer's own formula, but a proven scientific method taken from the <em>American Journal of Clinical Nutrition (1990)</em>.
          </p>
          <p style={{ margin: "5px 0" }}>
            🏋️ <strong>Protein Source (Gym Trainer):</strong> The rules for daily protein intake come directly from the <strong>gym trainer's own guidelines</strong>. According to the trainer's instructions: users who do not exercise need 1g per kg of body weight, and those who exercise need 1.5 to 2g per kg.
          </p>
        </div>

        <p className="notice" style={{ marginTop: 14 }}>
          These are approximate estimates for general fitness guidance, not medical advice. If you have a health
          condition, talk to a doctor before changing your diet or exercise.
        </p>
      </div>

      <p className="muted">Coming next: your workout plan and meal guidance.</p>
    </div>
  );
}
