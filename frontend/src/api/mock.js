// DEMO MODE ONLY. No backend needed. Everything is stored in this browser.
import { ACTIVITY_LEVELS } from "../constants.js";

const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms));
const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function currentEmail() {
  const token = localStorage.getItem("token") || "";
  return token.startsWith("mock:") ? token.slice(5) : null;
}

// TEAM DECISION placeholders: the trainer's notes give ranges (lose 300-500, gain 200-500).
const GOAL_ADJUST = { lose: -400, maintain: 0, gain: 350 };

// TRAINER DECISION NEEDED: lowest safe daily calories. Left empty on purpose (do not guess).
// Example of the problem: a 60 kg sedentary woman who chooses "lose" gets about 1147 kcal.
// When the trainer gives a number, set it here (and in the backend).
const MIN_DAILY_CALORIES = null;

// Same formula as the trainer's notes (Mifflin-St Jeor).
export function computePlan(p) {
  const age = Number(p.age), w = Number(p.weight), h = Number(p.height);
  const bmr = 10 * w + 6.25 * h - 5 * age + (p.sex === "male" ? 5 : -161);
  const factor = ACTIVITY_LEVELS.find((a) => a.value === p.activity)?.factor ?? 1.2;
  const tdee = bmr * factor;
  const exercises = p.activity !== "sedentary";
  const bmi = w / (h / 100) ** 2;
  let bmi_category = "Normal";
  if (bmi < 18.5) bmi_category = "Underweight";
  else if (bmi >= 30) bmi_category = "Obese";
  else if (bmi >= 25) bmi_category = "Overweight";
  let target = tdee + GOAL_ADJUST[p.goal];
  if (MIN_DAILY_CALORIES !== null) target = Math.max(MIN_DAILY_CALORIES, target);
  return {
    bmi: Math.round(bmi * 10) / 10,
    bmi_category,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    daily_calorie_target: Math.round(target),
    protein_min_g: Math.round(w * (exercises ? 1.5 : 1)),
    protein_max_g: Math.round(w * (exercises ? 2 : 1)),
    goal: p.goal,
  };
}

// DEMO exercise list. The backend reads data/exercises.json instead.
export const EXERCISES = [
  { id: "push-up", name: "Push-up", muscle_group: "chest", body_part: "upper", equipment: ["bodyweight"], level: "beginner",
    instructions: "Start in a plank with hands under the shoulders. Lower your body as one straight line, then push back up.",
    form_cues: ["Keep your body straight from head to heels", "Lower until your chest is just above the floor", "Keep elbows about 45 degrees from your body"] },
  { id: "assisted-pull-up", name: "Assisted Pull-up", muscle_group: "back", body_part: "upper", equipment: ["gym_machines"], level: "beginner",
    instructions: "Set the counterweight, grip the bar slightly wider than shoulders, and pull your chest toward the bar.",
    form_cues: ["Lead with your chest, not your chin", "Pull elbows down toward your hips", "Lower slowly with full control"] },
  { id: "shoulder-press", name: "Dumbbell Shoulder Press", muscle_group: "shoulders", body_part: "upper", equipment: ["dumbbell"], level: "intermediate",
    instructions: "Hold dumbbells at shoulder height. Press them overhead until your arms are straight.",
    form_cues: ["Do not overarch your back", "Keep wrists straight", "Lower with control"] },
  { id: "barbell-curl", name: "Barbell Curl", muscle_group: "arms", body_part: "upper", equipment: ["barbell"], level: "beginner",
    instructions: "Stand holding a barbell with an underhand shoulder-width grip. Curl toward your shoulders, then lower slowly.",
    form_cues: ["Keep elbows pinned to your sides", "Avoid swinging your torso", "Squeeze biceps at the top"] },
  { id: "tricep-pressdown", name: "Tricep Pressdown", muscle_group: "arms", body_part: "upper", equipment: ["gym_machines"], level: "beginner",
    instructions: "Stand at a cable machine with a straight or angled bar. Push the handle down until arms are extended.",
    form_cues: ["Keep upper arms locked at your sides", "Control the return up to 90 degrees", "Avoid leaning excessively over the bar"] },
  { id: "bodyweight-squat", name: "Bodyweight Squat", muscle_group: "legs", body_part: "lower", equipment: ["bodyweight"], level: "beginner",
    instructions: "Stand with feet shoulder-width apart. Sit back and down, then stand up through your heels.",
    form_cues: ["Keep your chest up", "Knees follow the direction of your toes", "Go down as far as your mobility allows"] },
  { id: "machine-chest-press", name: "Machine Chest Press", muscle_group: "chest", body_part: "upper", equipment: ["gym_machines"], level: "beginner",
    instructions: "Adjust the seat so handles align with mid-chest. Press forward until arms extend, then return slowly.",
    form_cues: ["Keep shoulder blades pressed into the pad", "Do not lock elbows harshly", "Control the eccentric phase"] },
  { id: "pectoral-fly", name: "Pectoral Fly", muscle_group: "chest", body_part: "upper", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit upright on the pec-deck machine with arms slightly bent. Bring the handles together in front of your chest.",
    form_cues: ["Maintain a slight bend in the elbows", "Squeeze the chest at the center", "Do not let arms drift behind your shoulders"] },
  { id: "decline-chest-press", name: "Decline Chest Press", muscle_group: "chest", body_part: "upper", equipment: ["barbell"], level: "intermediate",
    instructions: "Lie on a decline bench with feet secured. Lower the bar to lower chest, then press back up.",
    form_cues: ["Keep shoulder blades tucked", "Control the descent to lower chest", "Press evenly with both arms"] },
  { id: "machine-shoulder-press", name: "Machine Shoulder Press", muscle_group: "shoulders", body_part: "upper", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit with back flat against the pad and grip handles at shoulder level. Press overhead, then lower with control.",
    form_cues: ["Keep lower back supported by the pad", "Do not shrug shoulders up", "Stop before elbows lock out"] },
  { id: "dumbbell-side-raise", name: "Dumbbell Side Raise", muscle_group: "shoulders", body_part: "upper", equipment: ["dumbbell"], level: "beginner",
    instructions: "Stand with dumbbells at your sides. Raise arms out to shoulder height with a slight elbow bend.",
    form_cues: ["Lead with your elbows", "Avoid swinging your hips", "Lower the weights slowly"] },
  { id: "rope-pressdown", name: "Rope Pressdown", muscle_group: "arms", body_part: "upper", equipment: ["gym_machines"], level: "beginner",
    instructions: "Attach a rope to a high cable pulley. Push down and spread the rope ends apart at full extension.",
    form_cues: ["Keep elbows tucked near your ribs", "Split the rope smoothly at the bottom", "Do not let shoulders roll forward"] },
  { id: "machine-dips", name: "Machine Dips", muscle_group: "arms", body_part: "upper", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit firmly with handles at your sides. Press downward until arms are nearly straight, then return slowly.",
    form_cues: ["Keep shoulders down away from your ears", "Lean slightly forward or stay upright per comfort", "Control the upward return"] },
  { id: "barbell-squat", name: "Barbell Squat", muscle_group: "legs", body_part: "lower", equipment: ["barbell"], level: "intermediate",
    instructions: "Bar rests on your upper back. Squat down with a neutral spine, then drive up.",
    form_cues: ["Brace your core before each rep", "Knees track over toes", "Keep your back neutral"] },
  { id: "leg-press", name: "Leg Press", muscle_group: "legs", body_part: "lower", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit in the machine with feet on the platform. Lower the sled, then press back up.",
    form_cues: ["Do not lock the knees hard at the top", "Lower pelvis should not curl off the seat", "Keep the back against the pad"] },
  { id: "v-squat", name: "V. Squat", muscle_group: "legs", body_part: "lower", equipment: ["gym_machines"], level: "intermediate",
    instructions: "Stand on the V-squat platform with shoulders under the pads. Lower hips down and back, then drive up.",
    form_cues: ["Keep heels planted flat on the platform", "Keep back flat against the backrest", "Avoid locking knees at the top"] },
  { id: "seated-leg-curl", name: "Seated Leg Curl", muscle_group: "legs", body_part: "lower", equipment: ["gym_machines"], level: "beginner",
    instructions: "Adjust the pad above your ankles and thigh restraint firmly. Curl heels back under the seat.",
    form_cues: ["Keep hips pressed into the seat", "Pause briefly at peak hamstring contraction", "Return slowly without slamming weights"] },
  { id: "adductor", name: "Adductor", muscle_group: "legs", body_part: "lower", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit on the hip adductor machine with inner thighs against the pads. Squeeze legs together smoothly.",
    form_cues: ["Use a controlled tempo", "Keep back flat against the pad", "Avoid jerky bounces at the open position"] },
  { id: "standing-calf-raise", name: "Standing Calf Raise", muscle_group: "legs", body_part: "lower", equipment: ["gym_machines"], level: "beginner",
    instructions: "Place balls of feet on the edge of the platform. Lower heels for a stretch, then press up onto toes.",
    form_cues: ["Pause at both the top squeeze and bottom stretch", "Keep knees mostly straight with a micro-bend", "Move smoothly without bouncing"] },
  { id: "high-row", name: "High Row", muscle_group: "back", body_part: "upper", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit facing the high-row machine with chest against the pad. Pull handles down and back toward upper ribs.",
    form_cues: ["Pull elbows down and back", "Squeeze shoulder blades together", "Keep chest in contact with the pad"] },
  { id: "low-row", name: "Low Row", muscle_group: "back", body_part: "upper", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit upright at the low-row station and pull the handles toward your lower torso/waist.",
    form_cues: ["Keep torso tall without excessive swinging", "Drive elbows straight back", "Control the stretch forward"] },
  { id: "dy-row", name: "D.Y. Row", muscle_group: "back", body_part: "upper", equipment: ["gym_machines"], level: "intermediate",
    instructions: "Sit at the plate-loaded D.Y. row machine with chest braced. Pull handles back in an arc toward your lower chest.",
    form_cues: ["Depress shoulders and engage lats first", "Pull through your elbows", "Control the negative slowly"] },
  { id: "seated-cable-row", name: "Seated Cable Row", muscle_group: "back", body_part: "upper", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit with knees slightly bent and feet braced. Pull the cable attachment toward your midsection.",
    form_cues: ["Keep spine neutral and chest lifted", "Squeeze shoulder blades at the torso", "Avoid rounding lower back"] },
  { id: "face-pull", name: "Face Pull", muscle_group: "shoulders", body_part: "upper", equipment: ["gym_machines"], level: "beginner",
    instructions: "Set rope pulley at face height. Pull the rope toward your forehead while rotating hands outward.",
    form_cues: ["Keep elbows high and wide", "Pull wrists back beside your ears", "Squeeze rear delts and upper back"] },
  { id: "dumbbell-curl", name: "Dumbbell Curl", muscle_group: "arms", body_part: "upper", equipment: ["dumbbell"], level: "beginner",
    instructions: "Hold dumbbells at your sides with palms facing forward. Curl smoothly up toward your shoulders.",
    form_cues: ["Keep elbows close to your ribs", "Do not swing your torso", "Lower with full control"] },
  { id: "hammer-curl", name: "Hammer Curl", muscle_group: "arms", body_part: "upper", equipment: ["dumbbell"], level: "beginner",
    instructions: "Hold dumbbells with a neutral (palms facing each other) grip. Curl upward keeping wrists neutral.",
    form_cues: ["Keep elbows stationary", "Avoid rocking your shoulders", "Control the lowering phase"] },
  { id: "glute-bridge", name: "Glute bridge", muscle_group: "glutes", body_part: "lower", equipment: ["bodyweight"], level: "beginner",
    instructions: "Lie on your back, knees bent, feet flat. Push through your heels to lift your hips, then lower slowly.",
    form_cues: ["Squeeze the glutes at the top", "Do not arch your lower back", "Ribs stay down"] },
  { id: "plank", name: "Plank", muscle_group: "core", body_part: "upper", equipment: ["bodyweight"], level: "beginner",
    instructions: "Forearms and toes on the floor, body in one straight line. Hold the position.",
    form_cues: ["Do not let your hips sag", "Brace your stomach", "Breathe steadily"] },
  { id: "dumbbell-row", name: "Dumbbell row", muscle_group: "back", body_part: "upper", equipment: ["dumbbell"], level: "beginner",
    instructions: "Hinge forward with one hand and knee on a bench. Pull the dumbbell toward your hip.",
    form_cues: ["Keep your back flat", "Pull the elbow back, not out", "Pause briefly at the top"] },
  { id: "goblet-squat", name: "Dumbbell goblet squat", muscle_group: "legs", body_part: "lower", equipment: ["dumbbell"], level: "beginner",
    instructions: "Hold one dumbbell at your chest. Squat down between your legs, then stand up.",
    form_cues: ["Keep the weight close to your chest", "Keep your heels on the floor", "Chest stays up"] },
  { id: "barbell-deadlift", name: "Barbell deadlift", muscle_group: "back", body_part: "lower", equipment: ["barbell"], level: "intermediate",
    instructions: "Bar over mid-foot. Hinge down, grip the bar, and stand up by driving the floor away.",
    form_cues: ["Keep the bar close to your legs", "Keep your back flat", "Lock out with hips and knees together"] },
  { id: "bench-press", name: "Barbell bench press", muscle_group: "chest", body_part: "upper", equipment: ["barbell"], level: "intermediate",
    instructions: "Lie on the bench, lower the bar to mid-chest, then press up.",
    form_cues: ["Feet flat on the floor", "Shoulder blades pulled back", "Bar path goes slightly toward the face"] },
  { id: "lat-pulldown", name: "Lat pulldown", muscle_group: "back", body_part: "upper", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit with thighs under the pads. Pull the bar down to your upper chest.",
    form_cues: ["Lean back slightly, do not swing", "Pull the elbows down", "Control the bar on the way up"] },
];

const workoutsKey = () => "mock_workouts_" + currentEmail();
const weightsKey = () => "mock_weights_" + currentEmail();

function localDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// DEMO recommendations. The real backend (services/adaptive.py + explainer.py) decides these.
function buildRecommendations(profile, plan, workouts, weights) {
  const items = [];
  if (!profile || !plan) return { summary: "", items: [] };

  const goalText = {
    lose: "lose weight",
    maintain: "maintain your weight",
    gain: "gain muscle and weight",
  }[profile.goal] || "improve your fitness";

  const proteinText = plan.protein_min_g === plan.protein_max_g
    ? `${plan.protein_min_g} g`
    : `${plan.protein_min_g} to ${plan.protein_max_g} g`;

  const equipmentList = Array.isArray(profile.equipment) && profile.equipment.length > 0
    ? profile.equipment
    : ["bodyweight"];

  const summary =
    `You want to ${goalText} as a ${profile.fitness_level} training ${profile.days_per_week} day(s)/week ` +
    `${profile.location === "gym" ? "at a gym" : "at home"}. ` +
    `Your BMI is ${plan.bmi} (${plan.bmi_category}), so your daily targets are ${plan.daily_calorie_target} kcal ` +
    `and ${proteinText} of protein.`;

  // 1. Weekly training consistency (distinct training days in last 7 days)
  const cutoffStr = localDateStr(-6);
  const recentLogs = workouts.filter((w) => w.date >= cutoffStr);
  const recentDays = new Set(recentLogs.map((w) => w.date)).size;
  const plannedDays = Number(profile.days_per_week) || 3;

  if (workouts.length === 0) {
    items.push({
      id: "start-logging",
      category: "workout",
      title: "Log your first workout session",
      detail: `Aim for ${plannedDays} training day(s) this week and record your sets and reps in Workout log so recommendations adapt to your progress.`,
      reason: "No workout sessions have been logged yet.",
    });
  } else if (recentDays < plannedDays) {
    const remaining = plannedDays - recentDays;
    items.push({
      id: "more-sessions",
      category: "workout",
      title: `Schedule ${remaining} more training day(s) this week`,
      detail: `You trained on ${recentDays} distinct day(s) in the last 7 days compared to your ${plannedDays}-day target. Even a short 30-minute session keeps momentum alive.`,
      reason: `Profile target is ${plannedDays} day(s)/week; ${recentDays} logged recently.`,
    });
  } else {
    const totalVolume = recentLogs.reduce((sum, w) => sum + w.sets * w.reps * w.weight_kg, 0);
    items.push({
      id: "on-track",
      category: "workout",
      title: "You are hitting your weekly training frequency",
      detail: `Great consistency (${recentDays}/${plannedDays} days in the last 7 days, ${Math.round(totalVolume)} kg total volume). When you complete all target reps cleanly, increase weight by 1–2.5 kg or add 1–2 reps.`,
      reason: `Logged ${recentDays} training day(s) over the past 7 days.`,
    });
  }

  // 2. Upper vs Lower body balance from workout progress
  if (workouts.length > 0) {
    const byId = new Map(EXERCISES.map((ex) => [ex.id, ex]));
    const isLower = (w) => {
      const ex = byId.get(w.exercise_id);
      if (ex?.body_part) return ex.body_part === "lower";
      return ["legs", "glutes"].includes(ex?.muscle_group);
    };
    const lowerCount = workouts.filter(isLower).length;
    const upperCount = workouts.length - lowerCount;

    if (upperCount > 0 && lowerCount === 0) {
      const legOptions = equipmentList.includes("gym_machines")
        ? "Leg Press, Seated Leg Curl, or V. Squat"
        : equipmentList.includes("barbell")
          ? "Barbell Squat or Barbell deadlift"
          : "Bodyweight Squat and Glute bridge";
      items.push({
        id: "balance-lower",
        category: "workout",
        title: "Add Lower Body exercises for balanced progress",
        detail: `All ${upperCount} of your logged entries so far are Upper Body. Try adding ${legOptions} to build leg strength and burn more calories.`,
        reason: `Workout log shows ${upperCount} Upper Body vs 0 Lower Body entries.`,
      });
    } else if (lowerCount > 0 && upperCount === 0) {
      const upperOptions = equipmentList.includes("gym_machines")
        ? "Machine Chest Press, Seated Cable Row, or Tricep Pressdown"
        : equipmentList.includes("dumbbell")
          ? "Dumbbell Shoulder Press, Dumbbell Curl, and Push-up"
          : "Push-up and Plank";
      items.push({
        id: "balance-upper",
        category: "workout",
        title: "Add Upper Body exercises for balanced progress",
        detail: `All ${lowerCount} of your logged entries so far are Lower Body. Include ${upperOptions} to develop upper-body strength and posture.`,
        reason: `Workout log shows 0 Upper Body vs ${lowerCount} Lower Body entries.`,
      });
    } else if (upperCount >= lowerCount * 3 && upperCount >= 3) {
      items.push({
        id: "more-lower",
        category: "workout",
        title: "Increase Lower Body volume slightly",
        detail: `Your logs lean heavily toward Upper Body (${upperCount} vs ${lowerCount}). Aim for at least one dedicated Lower Body day each week.`,
        reason: "Balanced upper/lower training lowers injury risk and improves overall conditioning.",
      });
    } else {
      items.push({
        id: "balanced-split",
        category: "workout",
        title: "Good Upper & Lower body training balance",
        detail: `You have logged ${upperCount} Upper Body and ${lowerCount} Lower Body entries. Keep alternating push, pull, and leg movements across the week.`,
        reason: "Based on your logged exercise distribution in Workout log.",
      });
    }
  }

  // 3. Weight progress & profile sync
  const sortedWeights = [...weights].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  if (sortedWeights.length >= 2) {
    const firstKg = sortedWeights[0].weight_kg;
    const latestKg = sortedWeights[sortedWeights.length - 1].weight_kg;
    const change = latestKg - firstKg;
    const dir = change > 0 ? "up" : change < 0 ? "down" : "unchanged";
    const fits =
      (profile.goal === "lose" && change <= -0.2) ||
      (profile.goal === "gain" && change >= 0.2) ||
      (profile.goal === "maintain" && Math.abs(change) <= 1.0);

    let advice = "";
    if (fits) {
      advice = ` Stay consistent with ${plan.daily_calorie_target} kcal and ${proteinText} protein per day.`;
    } else if (profile.goal === "lose") {
      advice = ` Aim for steady portion control around ${plan.daily_calorie_target} kcal, prioritize ${proteinText} protein to stay full, and add daily walking steps.`;
    } else if (profile.goal === "gain") {
      advice = ` Try adding a protein-rich snack or extra complex carbs to consistently hit ${plan.daily_calorie_target} kcal and fuel muscle recovery.`;
    } else {
      advice = ` Adjust daily intake slightly closer to ${plan.tdee} kcal if the shift continues over the next 2 weeks.`;
    }

    items.push({
      id: "weight-trend",
      category: "nutrition",
      title: fits ? "Your weight trend matches your goal" : "Weight trend needs a small nutrition adjustment",
      detail: `Your weight moved ${dir} ${Math.abs(change).toFixed(1)} kg (from ${firstKg} kg to ${latestKg} kg).${advice}`,
      reason: `Goal is "${goalText}" and ${sortedWeights.length} weight entries are logged in Progress.`,
    });

    if (Math.abs(latestKg - Number(profile.weight)) >= 2) {
      items.push({
        id: "sync-profile-weight",
        category: "general",
        title: "Update your weight in Profile",
        detail: `Your latest logged weight (${latestKg} kg) differs from your saved profile weight (${profile.weight} kg). Updating your profile recalculates accurate calorie and protein targets.`,
        reason: "Nutrition targets depend on your current body weight.",
      });
    }
  } else {
    items.push({
      id: "log-weight",
      category: "nutrition",
      title: "Log your body weight weekly in Progress",
      detail: `You currently have ${sortedWeights.length} weight entry. Log 2+ morning weigh-ins over the next couple of weeks to verify whether ${plan.daily_calorie_target} kcal is working for your "${goalText}" goal.`,
      reason: "At least 2 weight entries are needed to measure a trend.",
    });
  }

  // 4. Equipment & experience-tailored exercise suggestion
  const canDo = (ex) => ex.equipment.every((eq) => eq === "bodyweight" || equipmentList.includes(eq));
  const suitable = EXERCISES.filter(canDo).filter(
    (ex) => profile.fitness_level !== "beginner" || ex.level === "beginner"
  );
  const equipSpecific = suitable.filter((ex) =>
    ex.equipment.some((eq) => eq !== "bodyweight" && equipmentList.includes(eq))
  );
  const picks = (equipSpecific.length >= 3 ? equipSpecific : suitable).slice(0, 3).map((ex) => ex.name);
  if (picks.length > 0) {
    items.push({
      id: "equipment-picks",
      category: "general",
      title: `Recommended moves for your ${profile.location === "gym" ? "gym" : "home"} setup`,
      detail: `Based on your ${profile.fitness_level} level and selected equipment, focus on mastering ${picks.join(", ")} with 3 sets of ${profile.goal === "lose" ? "12–15" : "8–12"} controlled reps.`,
      reason: `Matched to your profile equipment (${equipmentList.join(", ")}) and fitness level.`,
    });
  }

  // 5. Limitations / injury safety & form check
  const lim = (profile.limitations || "").trim();
  if (lim) {
    const lowerLim = lim.toLowerCase();
    let safetyHint = "Warm up gently for 5–10 minutes and stop any movement that triggers sharp pain.";
    if (lowerLim.includes("knee")) {
      safetyHint = "Keep knees tracking over your toes during squats/leg press, control the lowering depth, and prioritize pain-free ranges.";
    } else if (lowerLim.includes("back")) {
      safetyHint = "Brace your core tightly, keep a neutral spine on rows and hinges, and avoid rounding under load.";
    } else if (lowerLim.includes("shoulder")) {
      safetyHint = "Tuck elbows slightly (~45°) on presses, keep shoulder blades stable, and avoid pushing through impingement.";
    }
    items.push({
      id: "limitation-safety",
      category: "form",
      title: `Train safely around: ${lim}`,
      detail: safetyHint,
      reason: "Adapted to the physical limitations listed in your Profile.",
    });
  }

  items.push({
    id: "form-check",
    category: "form",
    title: "Check your form on key compound lifts",
    detail: "Upload a photo in Form check for squats, presses, or rows to verify joint alignment and reduce injury risk.",
    reason: "Clean technique makes every rep safer and more effective.",
  });

  return { summary, items };
}


export const api = {
  async getExercises() {
    await wait(150);
    return EXERCISES;
  },
  // Demo only: the photo is NOT analysed. Sample feedback is matched to the chosen exercise.
  async checkForm(form) {
    await wait(900);
    const id = form.get("exercise_id");
    const ex = EXERCISES.find((e) => e.id === id);
    if (!ex) throw new Error("Choose an exercise first.");

    const FEEDBACK_BY_MUSCLE = {
      chest: {
        score: 74,
        good: [ex.form_cues?.[0] || "Torso stays steady through the movement"],
        issues: [
          { body_part: "Elbows", message: "Elbows flare slightly wide. Keep them tucked around 45 degrees from your torso." },
          { body_part: "Shoulders", message: "Keep shoulder blades pulled back and down away from your ears." },
        ],
      },
      back: {
        score: 76,
        good: [ex.form_cues?.[0] || "Spine stays neutral and aligned"],
        issues: [
          { body_part: "Shoulders", message: "Pull through your elbows rather than shrugging your shoulders upward." },
          { body_part: "Back", message: "Keep your chest lifted at the end of each rep so your upper back does not round." },
        ],
      },
      shoulders: {
        score: 72,
        good: [ex.form_cues?.[0] || "Wrists remain neutral and aligned"],
        issues: [
          { body_part: "Shoulders", message: "Control the load without shrugging your upper traps at the top." },
          { body_part: "Back", message: "Brace your core firmly so your lower back does not arch." },
        ],
      },
      arms: {
        score: 78,
        good: [ex.form_cues?.[0] || "Wrists stay straight and controlled"],
        issues: [
          { body_part: "Elbows", message: "Elbows drift slightly forward. Pin upper arms steadily by your sides." },
          { body_part: "Torso", message: "Minimize hip or torso swing when starting the rep." },
        ],
      },
      legs: {
        score: 68,
        good: [ex.form_cues?.[0] || "Chest stays steady through the movement"],
        issues: [
          { body_part: "Knees", message: "Knees move slightly inward at the bottom. Push them out in line with your toes." },
          { body_part: "Back", message: "Lower back rounds slightly. Brace your core before each rep." },
        ],
      },
      glutes: {
        score: 75,
        good: [ex.form_cues?.[0] || "Feet stay planted firmly on the floor"],
        issues: [
          { body_part: "Back", message: "Avoid overarching the lower back at lockout; keep ribs tucked down." },
          { body_part: "Knees", message: "Keep knees tracking steadily hip-width apart." },
        ],
      },
      core: {
        score: 77,
        good: [ex.form_cues?.[0] || "Head and neck stay in a neutral line"],
        issues: [
          { body_part: "Hips", message: "Hips dip slightly; squeeze glutes and brace abs to hold a straight line." },
          { body_part: "Shoulders", message: "Press firmly through the floor so shoulder blades do not collapse." },
        ],
      },
    };

    const sample = FEEDBACK_BY_MUSCLE[ex.muscle_group] || FEEDBACK_BY_MUSCLE.legs;
    return {
      demo: true,
      exercise_id: ex.id,
      exercise_name: ex.name,
      score: sample.score,
      good_points: sample.good,
      issues: sample.issues,
    };
  },
  async listWorkouts() {
    await wait(150);
    return read(workoutsKey(), []);
  },
  async addWorkout(d) {
    await wait();
    const ex = EXERCISES.find((e) => e.id === d.exercise_id);
    const entry = {
      id: String(Date.now()) + Math.floor(Math.random() * 1000),
      date: d.date,
      exercise_id: d.exercise_id,
      exercise_name: ex ? ex.name : d.exercise_id,
      sets: Number(d.sets),
      reps: Number(d.reps),
      weight_kg: Number(d.weight_kg),
      notes: d.notes || "",
    };
    write(workoutsKey(), [entry, ...read(workoutsKey(), [])]);
    return entry;
  },
  async deleteWorkout(id) {
    await wait(150);
    write(workoutsKey(), read(workoutsKey(), []).filter((w) => w.id !== id));
    return null;
  },

  async listWeights() {
    await wait(150);
    return read(weightsKey(), []);
  },
  async addWeight(d) {
    await wait();
    const entry = { id: String(Date.now()) + Math.floor(Math.random() * 1000), date: d.date, weight_kg: Number(d.weight_kg) };
    write(weightsKey(), [entry, ...read(weightsKey(), [])]);
    return entry;
  },
  async deleteWeight(id) {
    await wait(150);
    write(weightsKey(), read(weightsKey(), []).filter((w) => w.id !== id));
    return null;
  },
  async getRecommendations() {
    await wait(300);
    const profile = read("mock_profile_" + currentEmail(), null);
    if (!profile) return null;
    return {
      demo: true,
      ...buildRecommendations(profile, computePlan(profile), read(workoutsKey(), []), read(weightsKey(), [])),
    };
  },

  async register({ name, email, password }) {
    await wait();
    const users = read("mock_users", {});
    const key = email.toLowerCase();
    if (users[key]) throw new Error("An account with this email already exists.");
    users[key] = { name, password };
    write("mock_users", users);
    return { access_token: "mock:" + key, token_type: "bearer", user: { name, email: key } };
  },
  async login({ email, password }) {
    await wait();
    const key = email.toLowerCase();
    const u = read("mock_users", {})[key];
    if (!u || u.password !== password) throw new Error("Invalid email or password.");
    return { access_token: "mock:" + key, token_type: "bearer", user: { name: u.name, email: key } };
  },
  async getProfile() {
    await wait(150);
    return read("mock_profile_" + currentEmail(), null);
  },
  async saveProfile(data) {
    await wait();
    write("mock_profile_" + currentEmail(), data);
    return data;
  },
  async getNutritionPlan() {
    await wait(150);
    const p = read("mock_profile_" + currentEmail(), null);
    return p ? computePlan(p) : null;
  },
};
