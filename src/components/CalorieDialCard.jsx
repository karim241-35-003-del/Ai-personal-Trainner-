import { useState, useMemo } from "react";
import "../styles/calorie-dial.css";

/**
 * Format a number with thousands separators (e.g. 2882 -> "2,882")
 */
function formatNum(num) {
  if (num === null || num === undefined || Number.isNaN(Number(num))) return "0";
  return Number(num).toLocaleString();
}

/**
 * Modern Calorie & Nutrition Dial Dashboard Card
 * Inspired by modern sports watch & fitness gauge dials.
 *
 * @param {Object} props
 * @param {Object} props.plan - Computed nutrition plan (bmr, tdee, daily_calorie_target, goal, etc.)
 * @param {Object} [props.profile] - User profile (weight, activity, etc.)
 * @param {Function} [props.onGoalChange] - Optional callback when user clicks a goal pill
 * @param {string} [props.formulaName="Mifflin-St Jeor"] - Nutrition formula citation
 */
export default function CalorieDialCard({
  plan,
  profile,
  activeGoal: controlledGoal,
  onGoalChange,
  formulaName = "Mifflin-St Jeor",
  defaultGoal,
}) {
  const bmr = plan?.bmr ?? 1859;
  const maintenance = plan?.tdee ?? 2882;
  const initialGoal = defaultGoal ?? plan?.goal ?? "maintain";

  const [internalGoal, setInternalGoal] = useState(initialGoal);
  const activeGoal = controlledGoal !== undefined ? controlledGoal : internalGoal;

  // Calorie calculations for each goal option
  const loseCalories = Math.max(1200, Math.round(maintenance - 400));
  const maintainCalories = Math.round(maintenance);
  const gainCalories = Math.round(maintenance + 350);

  const goalCalories = {
    lose: loseCalories,
    maintain: maintainCalories,
    gain: gainCalories,
  };

  const currentDailyTarget = goalCalories[activeGoal] || maintainCalories;

  // Projected weekly weight change
  const weeklyChanges = {
    lose: "-0.4 kg",
    maintain: "0 kg",
    gain: "+0.35 kg",
  };

  const handleSelectGoal = (goalKey) => {
    setInternalGoal(goalKey);
    if (onGoalChange) {
      onGoalChange(goalKey, goalCalories[goalKey]);
    }
  };

  // Generate 60 radial ticks around 360 degrees
  const TOTAL_TICKS = 60;
  const ticks = useMemo(() => {
    // Determine active tick arc range based on goal
    // Maintain = ticks 5 to 22 (approx 1 o'clock to 4:30 o'clock like in the image)
    // Lose = fewer ticks (5 to 17)
    // Gain = more ticks (5 to 26)
    const arcEnd = activeGoal === "lose" ? 17 : activeGoal === "maintain" ? 22 : 27;
    const arcStart = 5;

    return Array.from({ length: TOTAL_TICKS }, (_, i) => {
      // Rotate so 0 is at 12 o'clock (-90 deg offset)
      const angleDeg = (i * (360 / TOTAL_TICKS)) - 90;
      const angleRad = (angleDeg * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);

      const isActive = i >= arcStart && i <= arcEnd;

      // Outer and inner radius for ticks
      const rOuter = 132;
      const rInner = isActive ? 116 : 120;

      const x1 = 160 + rOuter * cos;
      const y1 = 160 + rOuter * sin;
      const x2 = 160 + rInner * cos;
      const y2 = 160 + rInner * sin;

      return {
        id: i,
        x1,
        y1,
        x2,
        y2,
        isActive,
      };
    });
  }, [activeGoal]);

  return (
    <div className="calorie-dial-wrapper">
      {/* Top Circular Gauge Dial */}
      <div className="dial-container">
        <svg
          className="dial-svg"
          viewBox="0 0 320 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Outer knurled bezel gradient */}
            <radialGradient id="bezelGradient" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="#252932" />
              <stop offset="93%" stopColor="#181b21" />
              <stop offset="100%" stopColor="#0f1115" />
            </radialGradient>

            {/* Inner dial face shadow */}
            <filter id="dialShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* 1. Outer Dark Knurled Bezel Ring */}
          <circle
            cx="160"
            cy="160"
            r="154"
            fill="url(#bezelGradient)"
            stroke="#111317"
            strokeWidth="1.5"
          />

          {/* Knurled Grip Texture (fine serrations around the bezel) */}
          <circle
            cx="160"
            cy="160"
            r="147"
            fill="none"
            stroke="#3a414e"
            strokeWidth="6"
            strokeDasharray="2 3"
            opacity="0.75"
          />

          {/* Inner metallic bezel rim */}
          <circle
            cx="160"
            cy="160"
            r="139"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* 2. White Dial Face */}
          <circle
            cx="160"
            cy="160"
            r="138"
            fill="#ffffff"
            filter="url(#dialShadow)"
          />

          {/* 3. Radial Dial Ticks */}
          {ticks.map((tick) => (
            <line
              key={tick.id}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={tick.isActive ? "#ff2d55" : "#cbd5e1"}
              strokeWidth={tick.isActive ? "4" : "1.5"}
              strokeLinecap={tick.isActive ? "round" : "butt"}
              style={{
                transition: "stroke 0.25s ease, stroke-width 0.25s ease",
              }}
            />
          ))}
        </svg>

        {/* Central Readout */}
        <div className="dial-center-content">
          <div className="dial-label">Daily Target</div>
          <div className="dial-value">{formatNum(currentDailyTarget)}</div>
          <div className="dial-unit">kcal / day</div>
        </div>
      </div>

      {/* Horizontal Divider */}
      <hr className="calorie-card-divider" />

      {/* 3-Column Stats Row */}
      <div className="stats-three-col">
        <div className="stat-col">
          <span className="stat-col-title">BMR</span>
          <span className="stat-col-value">{formatNum(bmr)}</span>
          <span className="stat-col-unit">kcal / day</span>
        </div>

        <div className="stat-col-divider" />

        <div className="stat-col">
          <span className="stat-col-title">Maintenance</span>
          <span className="stat-col-value highlight-red">
            {formatNum(maintenance)}
          </span>
          <span className="stat-col-unit">kcal / day</span>
        </div>

        <div className="stat-col-divider" />

        <div className="stat-col">
          <span className="stat-col-title">Weekly change</span>
          <span className="stat-col-value">
            {weeklyChanges[activeGoal] || "0 kg"}
          </span>
          <span className="stat-col-unit">per week</span>
        </div>
      </div>

      {/* Interactive Goal Pills (Weight loss, Weight maintain, Weight gain) */}
      <div className="goal-segmented-pills">
        <button
          type="button"
          className={`goal-pill-btn ${activeGoal === "lose" ? "active" : ""}`}
          onClick={() => handleSelectGoal("lose")}
        >
          <span className="goal-pill-name">Weight loss</span>
          <span className="goal-pill-calories">{formatNum(loseCalories)} kcal</span>
          <span className="goal-pill-sub">-400 from TDEE</span>
        </button>

        <button
          type="button"
          className={`goal-pill-btn ${activeGoal === "maintain" ? "active" : ""}`}
          onClick={() => handleSelectGoal("maintain")}
        >
          <span className="goal-pill-name">Weight maintain</span>
          <span className="goal-pill-calories">{formatNum(maintainCalories)} kcal</span>
          <span className="goal-pill-sub">Same as TDEE</span>
        </button>

        <button
          type="button"
          className={`goal-pill-btn ${activeGoal === "gain" ? "active" : ""}`}
          onClick={() => handleSelectGoal("gain")}
        >
          <span className="goal-pill-name">Weight gain</span>
          <span className="goal-pill-calories">{formatNum(gainCalories)} kcal</span>
          <span className="goal-pill-sub">+350 to TDEE</span>
        </button>
      </div>

      {/* Footer Citation */}
      <div className="calorie-card-footer">
        Calorie Source: <strong>Mifflin-St Jeor (AJCN 1990)</strong> · Protein Source: <strong>Gym Trainer Guidelines</strong>
      </div>
    </div>
  );
}
