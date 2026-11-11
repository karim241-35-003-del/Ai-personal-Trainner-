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
  { id: "push-up", name: "Push-up", muscle_group: "chest", equipment: ["bodyweight"], level: "beginner",
    instructions: "Start in a plank with hands under the shoulders. Lower your body as one straight line, then push back up.",
    form_cues: ["Keep your body straight from head to heels", "Lower until your chest is just above the floor", "Keep elbows about 45 degrees from your body"] },
  { id: "bodyweight-squat", name: "Bodyweight squat", muscle_group: "legs", equipment: ["bodyweight"], level: "beginner",
    instructions: "Stand with feet shoulder-width apart. Sit back and down, then stand up through your heels.",
    form_cues: ["Keep your chest up", "Knees follow the direction of your toes", "Go down as far as your mobility allows"] },
  { id: "walking-lunge", name: "Walking lunge", muscle_group: "legs", equipment: ["bodyweight"], level: "beginner",
    instructions: "Take a step forward, lowering your hips until both knees are bent at about 90 degrees. Step smoothly forward.",
    form_cues: ["Keep your torso upright", "Do not let front knee collapse inward", "Push through the front heel to rise"] },
  { id: "glute-bridge", name: "Glute bridge", muscle_group: "glutes", equipment: ["bodyweight"], level: "beginner",
    instructions: "Lie on your back, knees bent, feet flat. Push through your heels to lift your hips, then lower slowly.",
    form_cues: ["Squeeze the glutes at the top", "Do not arch your lower back", "Ribs stay down"] },
  { id: "plank", name: "Plank", muscle_group: "core", equipment: ["bodyweight"], level: "beginner",
    instructions: "Forearms and toes on the floor, body in one straight line. Hold the position.",
    form_cues: ["Do not let your hips sag", "Brace your stomach", "Breathe steadily"] },
  { id: "mountain-climbers", name: "Mountain climbers", muscle_group: "core", equipment: ["bodyweight"], level: "beginner",
    instructions: "In high plank position, drive knees alternately toward your chest in a controlled rhythm.",
    form_cues: ["Keep hips level with shoulders", "Maintain steady core brace", "Land lightly on balls of feet"] },
  { id: "tricep-dips", name: "Chair / bench tricep dips", muscle_group: "arms", equipment: ["bodyweight"], level: "beginner",
    instructions: "Sit on bench edge, hands by hips. Slide off, lower yourself until elbows reach 90 degrees, then press back up.",
    form_cues: ["Keep back close to bench", "Elbows point straight back", "Do not shrug shoulders"] },
  { id: "dumbbell-row", name: "Dumbbell row", muscle_group: "back", equipment: ["dumbbell"], level: "beginner",
    instructions: "Hinge forward with one hand and knee on a bench. Pull the dumbbell toward your hip.",
    form_cues: ["Keep your back flat", "Pull the elbow back, not out", "Pause briefly at the top"] },
  { id: "goblet-squat", name: "Dumbbell goblet squat", muscle_group: "legs", equipment: ["dumbbell"], level: "beginner",
    instructions: "Hold one dumbbell at your chest. Squat down between your legs, then stand up.",
    form_cues: ["Keep the weight close to your chest", "Keep your heels on the floor", "Chest stays up"] },
  { id: "shoulder-press", name: "Dumbbell shoulder press", muscle_group: "shoulders", equipment: ["dumbbell"], level: "intermediate",
    instructions: "Hold dumbbells at shoulder height. Press them overhead until your arms are straight.",
    form_cues: ["Do not overarch your back", "Keep wrists straight", "Lower with control"] },
  { id: "dumbbell-curl", name: "Dumbbell bicep curl", muscle_group: "arms", equipment: ["dumbbell"], level: "beginner",
    instructions: "Stand tall holding dumbbells at side. Curl the weights upward while keeping elbows pinned to your ribs.",
    form_cues: ["Do not swing with momentum", "Squeeze biceps at the top", "Lower the dumbbells slowly"] },
  { id: "lateral-raise", name: "Dumbbell lateral raise", muscle_group: "shoulders", equipment: ["dumbbell"], level: "beginner",
    instructions: "Stand with light dumbbells at sides. Raise arms out laterally until parallel to the floor, then lower.",
    form_cues: ["Slight bend in elbows", "Lead slightly with elbows", "Control the descent"] },
  { id: "barbell-squat", name: "Barbell back squat", muscle_group: "legs", equipment: ["barbell"], level: "intermediate",
    instructions: "Bar rests on your upper back. Squat down with a neutral spine, then drive up.",
    form_cues: ["Brace your core before each rep", "Knees track over toes", "Keep your back neutral"] },
  { id: "barbell-deadlift", name: "Barbell deadlift", muscle_group: "back", equipment: ["barbell"], level: "intermediate",
    instructions: "Bar over mid-foot. Hinge down, grip the bar, and stand up by driving the floor away.",
    form_cues: ["Keep the bar close to your legs", "Keep your back flat", "Lock out with hips and knees together"] },
  { id: "bench-press", name: "Barbell bench press", muscle_group: "chest", equipment: ["barbell"], level: "intermediate",
    instructions: "Lie on the bench, lower the bar to mid-chest, then press up.",
    form_cues: ["Feet flat on the floor", "Shoulder blades pulled back", "Bar path goes slightly toward the face"] },
  { id: "lat-pulldown", name: "Lat pulldown", muscle_group: "back", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit with thighs under the pads. Pull the bar down to your upper chest.",
    form_cues: ["Lean back slightly, do not swing", "Pull the elbows down", "Control the bar on the way up"] },
  { id: "leg-press", name: "Leg press", muscle_group: "legs", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit in the machine with feet on the platform. Lower the sled, then press back up.",
    form_cues: ["Do not lock the knees hard at the top", "Lower pelvis should not curl off the seat", "Keep the back against the pad"] },
];

const workoutsKey = () => "mock_workouts_" + currentEmail();
const weightsKey = () => "mock_weights_" + currentEmail();

// DEMO recommendations. The real backend (services/adaptive.py + explainer.py) decides these.
// These rules are simple on purpose and only exist so the page can be tested.
function buildRecommendations(profile, plan, workouts, weights) {
  const items = [];
  if (!profile || !plan) return { summary: "", items: [] };
  const goalText = { lose: "lose weight", maintain: "maintain your weight", gain: "gain muscle and weight" }[profile.goal];
  const summary =
    `You want to ${goalText}, you train ${profile.days_per_week} day(s) a week as a ${profile.fitness_level}, ` +
    `and you train ${profile.location === "gym" ? "at a gym" : "at home"}. ` +
    `So your plan uses ${plan.daily_calorie_target} kcal and ${plan.protein_min_g} to ${plan.protein_max_g} g protein per day.`;

  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
  const recent = workouts.filter((w) => new Date(w.date) >= cutoff);
  if (workouts.length === 0) {
    items.push({ id: "start-logging", category: "workout", title: "Log your first workout",
      detail: "Add what you did in the Workout log so we can adapt your plan.",
      reason: "We have no workout data from you yet." });
  } else if (recent.length < profile.days_per_week) {
    items.push({ id: "more-sessions", category: "workout", title: "Try to hit your weekly sessions",
      detail: `You planned ${profile.days_per_week} day(s) a week and logged ${recent.length} in the last 7 days.`,
      reason: "Regular sessions matter more than a single hard one." });
  } else {
    items.push({ id: "on-track", category: "workout", title: "You are on track with your sessions",
      detail: "Keep going. When reps feel easy, add a little weight or a few reps.",
      reason: `You logged ${recent.length} session(s) in the last 7 days.` });
  }

  const sorted = [...weights].sort((a, b) => (a.date < b.date ? -1 : 1));
  if (sorted.length >= 2) {
    const change = sorted[sorted.length - 1].weight_kg - sorted[0].weight_kg;
    const dir = change > 0 ? "up" : change < 0 ? "down" : "unchanged";
    const fits = (profile.goal === "lose" && change < 0) || (profile.goal === "gain" && change > 0) ||
      (profile.goal === "maintain" && Math.abs(change) < 1);
    items.push({ id: "weight-trend", category: "nutrition",
      title: fits ? "Your weight is moving the way you want" : "Your weight is not moving toward your goal yet",
      detail: `Weight is ${dir} ${Math.abs(change).toFixed(1)} kg since your first entry.` +
        (fits ? "" : " Check your calories and sleep, and give it a few more weeks before changing the plan."),
      reason: "Based on your weight log in Progress." });
  } else {
    items.push({ id: "log-weight", category: "nutrition", title: "Log your weight each week",
      detail: "Two or more entries let us see your trend.", reason: "We need at least 2 weight entries." });
  }

  items.push({ id: "form-check", category: "form", title: "Check your form on a main lift",
    detail: "Upload one photo in Form check, especially for squats, deadlifts or presses.",
    reason: "Good form lowers injury risk." });
  return { summary, items };
}


export const api = {
  async getExercises() {
    await wait(150);
    return EXERCISES;
  },
  // Demo only: the photo is NOT analysed. The result is a fixed sample so the page can be tested.
  async checkForm(form) {
    await wait(900);
    const id = form.get("exercise_id");
    const ex = EXERCISES.find((e) => e.id === id);
    if (!ex) throw new Error("Choose an exercise first.");
    return {
      demo: true,
      exercise_id: ex.id,
      exercise_name: ex.name,
      score: 68,
      good_points: ["Torso stays steady through the movement"],
      issues: [
        { body_part: "Knees", message: "Knees move inward at the bottom. Push them out in line with your toes." },
        { body_part: "Back", message: "Lower back rounds slightly. Brace your core before each rep." },
      ],
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
  async getRoutine() {
    await wait(200);
    const p = read("mock_profile_" + currentEmail(), null);
    if (!p) return null;
    return {
      demo: true,
      ...computeRoutine(p),
    };
  },
};

export function computeRoutine(p) {
  if (!p) return null;
  const daysCount = Math.min(Math.max(Number(p.days_per_week) || 3, 1), 7);
  const goal = p.goal || "maintain";
  const level = p.fitness_level || "beginner";
  const userEquipment = Array.isArray(p.equipment) && p.equipment.length > 0 ? p.equipment : ["bodyweight"];
  const location = p.location || "home";
  const rawLimitations = (p.limitations || "").trim();
  const limitations = rawLimitations.toLowerCase();

  const hasKneeIssue = limitations.includes("knee");
  const hasBackIssue = limitations.includes("back") || limitations.includes("spine");
  const hasShoulderIssue = limitations.includes("shoulder");

  // Sets and reps based on goal and experience level
  let sets = 3;
  if (level === "advanced") sets = 4;
  else if (level === "intermediate") sets = 3;

  let reps = "10-12";
  let restSec = 75;
  let focus = "Maintain strength and endurance with clean form.";

  if (goal === "gain") {
    reps = level === "advanced" ? "6-10" : "8-12";
    restSec = 90;
    focus = "Hypertrophy focus: push for progressive overload, track weights, and maintain full range of motion.";
  } else if (goal === "lose") {
    reps = "12-15";
    restSec = 60;
    focus = "Conditioning & fat loss: brisk rest periods, keeping muscle engagement and metabolic burn high.";
  } else {
    reps = "10-12";
    restSec = 75;
    focus = "General fitness & strength maintenance: steady controlled tempo with good mind-muscle connection.";
  }

  const canDo = (ex) => ex.equipment.every((eq) => eq === "bodyweight" || userEquipment.includes(eq));
  const available = EXERCISES.filter(canDo);

  const pick = (candidates, fallbackId) => {
    let chosen = null;
    for (const candId of candidates) {
      const found = available.find((e) => e.id === candId);
      if (found) {
        chosen = found;
        break;
      }
    }
    if (!chosen) {
      chosen = available.find((e) => e.id === fallbackId) || available[0] || EXERCISES[0];
    }

    let safetyAlert = null;
    if (hasKneeIssue && (chosen.muscle_group === "legs" || chosen.id.includes("squat") || chosen.id.includes("lunge") || chosen.id.includes("leg-press"))) {
      safetyAlert = "Knee caution: keep knees aligned with toes and only squat to a pain-free depth.";
    } else if (hasBackIssue && (chosen.id.includes("deadlift") || chosen.id.includes("row") || chosen.id.includes("squat"))) {
      safetyAlert = "Back caution: brace core tightly, maintain a neutral spine, and avoid rounding.";
    } else if (hasShoulderIssue && (chosen.id.includes("shoulder-press") || chosen.id.includes("lateral-raise") || chosen.id.includes("dips"))) {
      safetyAlert = "Shoulder caution: keep elbows slightly forward and avoid pressing through joint discomfort.";
    }

    return {
      id: chosen.id,
      name: chosen.name,
      muscle_group: chosen.muscle_group,
      equipment: chosen.equipment,
      level: chosen.level,
      sets,
      reps,
      rest: `${restSec}s`,
      instructions: chosen.instructions,
      form_cues: chosen.form_cues,
      safety_alert: safetyAlert,
    };
  };

  let splitName = "Full Body Routine";
  const days = [];

  if (daysCount === 1) {
    splitName = "1-Day Full Body Conditioning";
    days.push({
      day_number: 1,
      title: "Full Body Essentials",
      focus: "Chest, Legs, Back, Core & Arms",
      est_minutes: 45,
      exercises: [
        pick(["bench-press", "push-up"], "push-up"),
        pick(["barbell-squat", "goblet-squat", "bodyweight-squat"], "bodyweight-squat"),
        pick(["lat-pulldown", "dumbbell-row"], "push-up"),
        pick(["shoulder-press", "lateral-raise", "tricep-dips"], "tricep-dips"),
        pick(["plank", "mountain-climbers"], "plank"),
      ],
    });
  } else if (daysCount === 2) {
    splitName = "2-Day Full Body Alternating Split";
    days.push({
      day_number: 1,
      title: "Day 1: Full Body A (Quad & Push Focus)",
      focus: "Quads, Chest, Shoulders, Core",
      est_minutes: 45,
      exercises: [
        pick(["barbell-squat", "goblet-squat", "bodyweight-squat"], "bodyweight-squat"),
        pick(["bench-press", "push-up"], "push-up"),
        pick(["shoulder-press", "lateral-raise", "tricep-dips"], "tricep-dips"),
        pick(["plank", "mountain-climbers"], "plank"),
      ],
    });
    days.push({
      day_number: 2,
      title: "Day 2: Full Body B (Hinge & Pull Focus)",
      focus: "Hamstrings, Back, Arms, Glutes",
      est_minutes: 45,
      exercises: [
        pick(["barbell-deadlift", "walking-lunge", "glute-bridge"], "glute-bridge"),
        pick(["lat-pulldown", "dumbbell-row"], "push-up"),
        pick(["dumbbell-curl", "tricep-dips"], "tricep-dips"),
        pick(["glute-bridge", "plank"], "glute-bridge"),
      ],
    });
  } else if (daysCount === 3) {
    splitName = "3-Day Full Body Classic Split";
    days.push({
      day_number: 1,
      title: "Day 1: Full Body A (Chest, Quads, Core)",
      focus: "Chest, Quads, Core",
      est_minutes: 50,
      exercises: [
        pick(["bench-press", "push-up"], "push-up"),
        pick(["barbell-squat", "goblet-squat", "bodyweight-squat"], "bodyweight-squat"),
        pick(["dumbbell-row", "lat-pulldown"], "push-up"),
        pick(["plank", "mountain-climbers"], "plank"),
      ],
    });
    days.push({
      day_number: 2,
      title: "Day 2: Full Body B (Back, Posterior Chain, Shoulders)",
      focus: "Back, Glutes/Hamstrings, Shoulders",
      est_minutes: 50,
      exercises: [
        pick(["lat-pulldown", "dumbbell-row"], "push-up"),
        pick(["barbell-deadlift", "glute-bridge", "walking-lunge"], "glute-bridge"),
        pick(["shoulder-press", "lateral-raise", "push-up"], "push-up"),
        pick(["dumbbell-curl", "tricep-dips"], "tricep-dips"),
      ],
    });
    days.push({
      day_number: 3,
      title: "Day 3: Full Body C (Legs, Core & Endurance)",
      focus: "Legs, Chest, Arms, Core",
      est_minutes: 50,
      exercises: [
        pick(["leg-press", "walking-lunge", "goblet-squat", "bodyweight-squat"], "bodyweight-squat"),
        pick(["push-up", "bench-press"], "push-up"),
        pick(["tricep-dips", "dumbbell-curl"], "tricep-dips"),
        pick(["plank", "glute-bridge"], "plank"),
      ],
    });
  } else if (daysCount === 4) {
    splitName = "4-Day Upper / Lower Split";
    days.push({
      day_number: 1,
      title: "Day 1: Upper Body Power",
      focus: "Chest, Back, Shoulders, Arms",
      est_minutes: 50,
      exercises: [
        pick(["bench-press", "push-up"], "push-up"),
        pick(["lat-pulldown", "dumbbell-row"], "push-up"),
        pick(["shoulder-press", "lateral-raise"], "push-up"),
        pick(["tricep-dips", "dumbbell-curl"], "tricep-dips"),
      ],
    });
    days.push({
      day_number: 2,
      title: "Day 2: Lower Body & Core A",
      focus: "Quads, Glutes, Abs",
      est_minutes: 45,
      exercises: [
        pick(["barbell-squat", "goblet-squat", "bodyweight-squat"], "bodyweight-squat"),
        pick(["walking-lunge", "leg-press"], "bodyweight-squat"),
        pick(["glute-bridge"], "glute-bridge"),
        pick(["plank", "mountain-climbers"], "plank"),
      ],
    });
    days.push({
      day_number: 3,
      title: "Day 3: Upper Body Hypertrophy",
      focus: "Back, Chest, Delts, Arms",
      est_minutes: 50,
      exercises: [
        pick(["dumbbell-row", "lat-pulldown"], "push-up"),
        pick(["push-up", "bench-press"], "push-up"),
        pick(["lateral-raise", "shoulder-press"], "push-up"),
        pick(["dumbbell-curl", "tricep-dips"], "tricep-dips"),
      ],
    });
    days.push({
      day_number: 4,
      title: "Day 4: Lower Body & Posterior Chain B",
      focus: "Hamstrings, Glutes, Core",
      est_minutes: 45,
      exercises: [
        pick(["barbell-deadlift", "glute-bridge", "goblet-squat"], "glute-bridge"),
        pick(["walking-lunge", "bodyweight-squat"], "bodyweight-squat"),
        pick(["glute-bridge"], "glute-bridge"),
        pick(["mountain-climbers", "plank"], "plank"),
      ],
    });
  } else if (daysCount === 5) {
    splitName = "5-Day Push / Pull / Legs + Upper / Lower Split";
    days.push({
      day_number: 1,
      title: "Day 1: Push (Chest, Shoulders, Triceps)",
      focus: "Chest, Shoulders, Triceps",
      est_minutes: 50,
      exercises: [
        pick(["bench-press", "push-up"], "push-up"),
        pick(["shoulder-press", "lateral-raise"], "push-up"),
        pick(["tricep-dips"], "tricep-dips"),
        pick(["plank"], "plank"),
      ],
    });
    days.push({
      day_number: 2,
      title: "Day 2: Pull (Back, Biceps, Core)",
      focus: "Back, Biceps, Core",
      est_minutes: 50,
      exercises: [
        pick(["lat-pulldown", "dumbbell-row"], "push-up"),
        pick(["barbell-deadlift", "dumbbell-row"], "push-up"),
        pick(["dumbbell-curl"], "tricep-dips"),
        pick(["mountain-climbers"], "mountain-climbers"),
      ],
    });
    days.push({
      day_number: 3,
      title: "Day 3: Legs (Quads, Hamstrings, Glutes)",
      focus: "Quads, Hamstrings, Glutes",
      est_minutes: 50,
      exercises: [
        pick(["barbell-squat", "goblet-squat", "bodyweight-squat"], "bodyweight-squat"),
        pick(["walking-lunge", "leg-press"], "walking-lunge"),
        pick(["glute-bridge"], "glute-bridge"),
        pick(["plank"], "plank"),
      ],
    });
    days.push({
      day_number: 4,
      title: "Day 4: Upper Body Mix",
      focus: "Chest, Back, Arms",
      est_minutes: 45,
      exercises: [
        pick(["push-up", "bench-press"], "push-up"),
        pick(["dumbbell-row", "lat-pulldown"], "push-up"),
        pick(["lateral-raise", "shoulder-press"], "push-up"),
        pick(["dumbbell-curl", "tricep-dips"], "tricep-dips"),
      ],
    });
    days.push({
      day_number: 5,
      title: "Day 5: Lower Body & Core",
      focus: "Legs, Glutes, Core",
      est_minutes: 45,
      exercises: [
        pick(["goblet-squat", "bodyweight-squat"], "bodyweight-squat"),
        pick(["walking-lunge"], "walking-lunge"),
        pick(["glute-bridge"], "glute-bridge"),
        pick(["mountain-climbers", "plank"], "plank"),
      ],
    });
  } else if (daysCount === 6) {
    splitName = "6-Day Push / Pull / Legs (PPL x 2)";
    days.push({
      day_number: 1,
      title: "Day 1: Push A (Chest Emphasis)",
      focus: "Chest, Shoulders, Triceps",
      est_minutes: 45,
      exercises: [
        pick(["bench-press", "push-up"], "push-up"),
        pick(["shoulder-press"], "push-up"),
        pick(["tricep-dips"], "tricep-dips"),
        pick(["plank"], "plank"),
      ],
    });
    days.push({
      day_number: 2,
      title: "Day 2: Pull A (Back Emphasis)",
      focus: "Lats, Upper Back, Biceps",
      est_minutes: 45,
      exercises: [
        pick(["lat-pulldown", "dumbbell-row"], "push-up"),
        pick(["barbell-deadlift", "dumbbell-row"], "push-up"),
        pick(["dumbbell-curl"], "tricep-dips"),
        pick(["mountain-climbers"], "mountain-climbers"),
      ],
    });
    days.push({
      day_number: 3,
      title: "Day 3: Legs A (Quad & Core Focus)",
      focus: "Quads, Glutes, Abs",
      est_minutes: 45,
      exercises: [
        pick(["barbell-squat", "goblet-squat", "bodyweight-squat"], "bodyweight-squat"),
        pick(["walking-lunge"], "walking-lunge"),
        pick(["glute-bridge"], "glute-bridge"),
        pick(["plank"], "plank"),
      ],
    });
    days.push({
      day_number: 4,
      title: "Day 4: Push B (Shoulders Emphasis)",
      focus: "Shoulders, Chest, Triceps",
      est_minutes: 45,
      exercises: [
        pick(["shoulder-press", "lateral-raise"], "push-up"),
        pick(["push-up", "bench-press"], "push-up"),
        pick(["lateral-raise"], "push-up"),
        pick(["tricep-dips"], "tricep-dips"),
      ],
    });
    days.push({
      day_number: 5,
      title: "Day 5: Pull B (Posterior Chain Emphasis)",
      focus: "Back, Hamstrings, Biceps",
      est_minutes: 45,
      exercises: [
        pick(["dumbbell-row", "lat-pulldown"], "push-up"),
        pick(["glute-bridge", "barbell-deadlift"], "glute-bridge"),
        pick(["dumbbell-curl"], "tricep-dips"),
        pick(["plank"], "plank"),
      ],
    });
    days.push({
      day_number: 6,
      title: "Day 6: Legs B (Glute & Hamstring Focus)",
      focus: "Glutes, Hamstrings, Calves",
      est_minutes: 45,
      exercises: [
        pick(["walking-lunge", "goblet-squat"], "walking-lunge"),
        pick(["leg-press", "bodyweight-squat"], "bodyweight-squat"),
        pick(["glute-bridge"], "glute-bridge"),
        pick(["mountain-climbers"], "mountain-climbers"),
      ],
    });
  } else {
    splitName = "6-Day PPL + Day 7 Mobility & Core Recovery";
    days.push({
      day_number: 1,
      title: "Day 1: Push A",
      focus: "Chest, Shoulders, Triceps",
      est_minutes: 45,
      exercises: [
        pick(["bench-press", "push-up"], "push-up"),
        pick(["shoulder-press"], "push-up"),
        pick(["tricep-dips"], "tricep-dips"),
        pick(["plank"], "plank"),
      ],
    });
    days.push({
      day_number: 2,
      title: "Day 2: Pull A",
      focus: "Back & Biceps",
      est_minutes: 45,
      exercises: [
        pick(["lat-pulldown", "dumbbell-row"], "push-up"),
        pick(["barbell-deadlift", "dumbbell-row"], "push-up"),
        pick(["dumbbell-curl"], "tricep-dips"),
        pick(["mountain-climbers"], "mountain-climbers"),
      ],
    });
    days.push({
      day_number: 3,
      title: "Day 3: Legs A",
      focus: "Quads & Core",
      est_minutes: 45,
      exercises: [
        pick(["barbell-squat", "goblet-squat", "bodyweight-squat"], "bodyweight-squat"),
        pick(["walking-lunge"], "walking-lunge"),
        pick(["glute-bridge"], "glute-bridge"),
        pick(["plank"], "plank"),
      ],
    });
    days.push({
      day_number: 4,
      title: "Day 4: Push B",
      focus: "Shoulders & Chest",
      est_minutes: 45,
      exercises: [
        pick(["shoulder-press", "lateral-raise"], "push-up"),
        pick(["push-up", "bench-press"], "push-up"),
        pick(["tricep-dips"], "tricep-dips"),
        pick(["plank"], "plank"),
      ],
    });
    days.push({
      day_number: 5,
      title: "Day 5: Pull B",
      focus: "Back & Arms",
      est_minutes: 45,
      exercises: [
        pick(["dumbbell-row", "lat-pulldown"], "push-up"),
        pick(["dumbbell-curl"], "tricep-dips"),
        pick(["glute-bridge"], "glute-bridge"),
        pick(["mountain-climbers"], "mountain-climbers"),
      ],
    });
    days.push({
      day_number: 6,
      title: "Day 6: Legs B",
      focus: "Glutes & Hamstrings",
      est_minutes: 45,
      exercises: [
        pick(["walking-lunge", "goblet-squat"], "walking-lunge"),
        pick(["leg-press", "bodyweight-squat"], "bodyweight-squat"),
        pick(["glute-bridge"], "glute-bridge"),
        pick(["plank"], "plank"),
      ],
    });
    days.push({
      day_number: 7,
      title: "Day 7: Active Recovery & Core Mobility",
      focus: "Core, Mobility, Joint Health",
      est_minutes: 30,
      exercises: [
        pick(["glute-bridge"], "glute-bridge"),
        pick(["plank"], "plank"),
        pick(["mountain-climbers"], "mountain-climbers"),
      ],
    });
  }

  const goalDescriptions = {
    lose: "weight loss and metabolic conditioning",
    maintain: "balanced strength and body maintenance",
    gain: "muscle hypertrophy and strength building",
  };

  const summary = `Personalized ${splitName} tailored for ${goalDescriptions[goal] || "your fitness goal"}. Configured for ${daysCount} session(s) per week ${location === "gym" ? "at a gym" : "at home"} with ${userEquipment.join(", ")}.`;

  return {
    split_name: splitName,
    summary,
    frequency: `${daysCount} days / week`,
    goal,
    fitness_level: level,
    location,
    equipment: userEquipment,
    limitations: rawLimitations || null,
    pacing_tip: focus,
    target_sets: sets,
    target_reps: reps,
    target_rest: `${restSec}s`,
    warmup: [
      "5 minutes light cardio (jumping jacks, high knees or brisk walk)",
      "Dynamic shoulder rolls, arm swings, and torso rotations",
      "10 bodyweight squats and hip openers before lifting",
    ],
    cooldown: [
      "3-5 minutes of light walking to normalize heart rate",
      "Static stretches: hamstrings, quads, chest, and hip flexors (hold 20-30s each)",
      "Hydrate and replenish with post-workout protein",
    ],
    days,
  };
}
