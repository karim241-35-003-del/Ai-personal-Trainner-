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

// DEMO exercise list. Contains all exercises from Workout_Exercise_Resources + standard movements.
export const EXERCISES = [
  { id: "adductor", name: "Adductor Machine", muscle_group: "legs", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit firmly in the machine with pads against inner thighs. Squeeze legs together smoothly, pause, and return with control.",
    form_cues: ["Keep back flat against pad", "Avoid swinging or momentum", "Control the return phase"] },
  { id: "assisted-pull-up", name: "Assisted Pull-up", muscle_group: "back", equipment: ["gym_machines"], level: "beginner",
    instructions: "Grip handles shoulder-width apart, knees or feet on the pad. Pull yourself up until chin clears the bar, then lower with control.",
    form_cues: ["Engage lats before pulling", "Avoid kicking or swaying", "Full stretch at the bottom"] },
  { id: "barbell-curl", name: "Barbell Bicep Curl", muscle_group: "arms", equipment: ["barbell"], level: "beginner",
    instructions: "Stand tall holding a barbell underhand. Curl the bar toward your shoulders keeping elbows pinned at your sides, then lower slowly.",
    form_cues: ["Keep elbows pinned at sides", "Avoid leaning back or swinging", "Full extension at the bottom"] },
  { id: "barbell-deadlift", name: "Barbell deadlift", muscle_group: "back", equipment: ["barbell"], level: "intermediate",
    instructions: "Bar over mid-foot. Hinge down, grip the bar, and stand up by driving the floor away.",
    form_cues: ["Keep the bar close to your legs", "Keep your back flat", "Lock out with hips and knees together"] },
  { id: "barbell-squat", name: "Barbell Back Squat", muscle_group: "legs", equipment: ["barbell"], level: "intermediate",
    instructions: "Bar rests on upper back. Squat down with neutral spine until thighs are parallel, then drive back up through midfoot.",
    form_cues: ["Brace core before each rep", "Knees track over toes", "Keep chest upright"] },
  { id: "bench-press", name: "Barbell bench press", muscle_group: "chest", equipment: ["barbell"], level: "intermediate",
    instructions: "Lie on the bench, lower the bar to mid-chest, then press up.",
    form_cues: ["Feet flat on the floor", "Shoulder blades pulled back", "Bar path goes slightly toward the face"] },
  { id: "bodyweight-squat", name: "Bodyweight Squat", muscle_group: "legs", equipment: ["bodyweight"], level: "beginner",
    instructions: "Stand shoulder-width apart. Sit hips back and down until thighs reach parallel, then stand up through heels.",
    form_cues: ["Keep chest up", "Knees track over toes", "Drive up through heels"] },
  { id: "decline-chest-press", name: "Decline Chest Press", muscle_group: "chest", equipment: ["barbell", "gym_machines"], level: "intermediate",
    instructions: "Lie on decline bench with legs secured. Lower the bar or handles to lower chest with elbows at 45 degrees, then press straight up.",
    form_cues: ["Control bar to lower chest", "Avoid bouncing off chest", "Keep wrists straight"] },
  { id: "dumbbell-curl", name: "Dumbbell Bicep Curl", muscle_group: "arms", equipment: ["dumbbell"], level: "beginner",
    instructions: "Stand or sit with dumbbells at sides. Curl weights upward, rotating palms facing up, squeeze at top, and lower slowly.",
    form_cues: ["Pin elbows to your ribcage", "Do not swing body", "Control the descent"] },
  { id: "dumbbell-row", name: "Dumbbell row", muscle_group: "back", equipment: ["dumbbell"], level: "beginner",
    instructions: "Hinge forward with one hand and knee on a bench. Pull the dumbbell toward your hip.",
    form_cues: ["Keep your back flat", "Pull the elbow back, not out", "Pause briefly at the top"] },
  { id: "dumbbell-shoulder-press", name: "Dumbbell Shoulder Press", muscle_group: "shoulders", equipment: ["dumbbell"], level: "intermediate",
    instructions: "Hold dumbbells at shoulder height with palms forward. Press overhead until arms are extended, then lower with control.",
    form_cues: ["Avoid excessive lower back arch", "Lower dumbbells to ear level", "Keep core braced"] },
  { id: "dumbbell-side-raise", name: "Dumbbell Lateral Raise", muscle_group: "shoulders", equipment: ["dumbbell"], level: "beginner",
    instructions: "Stand holding dumbbells at sides. Raise arms out to the sides with a slight elbow bend until parallel to floor, then lower slowly.",
    form_cues: ["Lead with your elbows", "Do not shrug traps", "Pause briefly at shoulder height"] },
  { id: "dy-row", name: "Dorian Yates Row", muscle_group: "back", equipment: ["barbell", "gym_machines"], level: "intermediate",
    instructions: "Hinge at hips at a 70-degree torso angle with an underhand grip. Pull the bar to your lower abdomen and squeeze your lats.",
    form_cues: ["Maintain flat neutral spine", "Drive elbows straight back", "Underhand grip to target lower lats"] },
  { id: "face-pull", name: "Cable Face Pull", muscle_group: "shoulders", equipment: ["gym_machines"], level: "beginner",
    instructions: "Attach rope to high pulley. Pull rope toward your face while rotating hands back and out, squeezing rear delts and upper back.",
    form_cues: ["Pull rope toward eyes/forehead", "Separate hands at the back", "Keep elbows high"] },
  { id: "glute-bridge", name: "Glute bridge", muscle_group: "glutes", equipment: ["bodyweight"], level: "beginner",
    instructions: "Lie on your back, knees bent, feet flat. Push through your heels to lift your hips, then lower slowly.",
    form_cues: ["Squeeze the glutes at the top", "Do not arch your lower back", "Ribs stay down"] },
  { id: "goblet-squat", name: "Dumbbell goblet squat", muscle_group: "legs", equipment: ["dumbbell"], level: "beginner",
    instructions: "Hold one dumbbell at your chest. Squat down between your legs, then stand up.",
    form_cues: ["Keep the weight close to your chest", "Keep your heels on the floor", "Chest stays up"] },
  { id: "hammer-curl", name: "Hammer Curl", muscle_group: "arms", equipment: ["dumbbell"], level: "beginner",
    instructions: "Stand holding dumbbells with palms facing each other. Curl weights toward shoulders, squeeze, and lower slowly.",
    form_cues: ["Keep palms facing inward", "Elbows stationary at sides", "Do not swing shoulders"] },
  { id: "high-row", name: "Machine High Row", muscle_group: "back", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit facing machine with chest on pad. Pull handles down and back toward your ribs, squeezing upper back and lats.",
    form_cues: ["Chest stays glued to pad", "Drive elbows down and back", "Control the weight on return"] },
  { id: "lat-pulldown", name: "Lat pulldown", muscle_group: "back", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit with thighs under the pads. Pull the bar down to your upper chest.",
    form_cues: ["Lean back slightly, do not swing", "Pull the elbows down", "Control the bar on the way up"] },
  { id: "leg-press", name: "Leg Press", muscle_group: "legs", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit in sled with feet shoulder-width on platform. Lower sled until knees bend to 90 degrees, then press back up without locking knees.",
    form_cues: ["Do not lock the knees hard at the top", "Lower pelvis should not curl off the seat", "Keep the back against the pad"] },
  { id: "low-row", name: "Machine Low Row", muscle_group: "back", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit with chest against pad. Grip handles and pull back toward your belly button, retracting shoulder blades.",
    form_cues: ["Pull through elbows", "Squeeze shoulder blades together", "Avoid jerking with lower back"] },
  { id: "machine-chest-press", name: "Machine Chest Press", muscle_group: "chest", equipment: ["gym_machines"], level: "beginner",
    instructions: "Adjust seat so handles align with mid-chest. Press forward to full extension, pause, and lower slowly.",
    form_cues: ["Shoulders packed against backrest", "Do not lock elbows completely", "Keep wrists neutral"] },
  { id: "machine-dips", name: "Machine Dips", muscle_group: "arms", equipment: ["gym_machines"], level: "beginner",
    instructions: "Position knees on machine platform. Press handles down extending arms fully, then bend elbows to 90 degrees with control.",
    form_cues: ["Keep elbows tucked close to body", "Do not let shoulders roll forward", "Control the upward stretch"] },
  { id: "machine-shoulder-press", name: "Machine Shoulder Press", muscle_group: "shoulders", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit with handles at shoulder height. Press handles overhead without overarching your back, then lower with control.",
    form_cues: ["Keep back flat against pad", "Press overhead smoothly", "Lower handles to ear level"] },
  { id: "pectoral-fly", name: "Pectoral Fly Machine", muscle_group: "chest", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit with back flat and elbows slightly bent against pads/handles. Bring arms together in a hugging motion, squeeze chest, and return slowly.",
    form_cues: ["Maintain soft bend in elbows", "Do not overstretch past shoulders", "Squeeze chest at the center"] },
  { id: "plank", name: "Plank", muscle_group: "core", equipment: ["bodyweight"], level: "beginner",
    instructions: "Forearms and toes on the floor, body in one straight line. Hold the position.",
    form_cues: ["Do not let your hips sag", "Brace your stomach", "Breathe steadily"] },
  { id: "push-up", name: "Push-up", muscle_group: "chest", equipment: ["bodyweight"], level: "beginner",
    instructions: "Plank position with hands under shoulders. Lower body until chest is just off floor, then push back up keeping body rigid.",
    form_cues: ["Keep straight line from head to heels", "Elbows at 45-degree angle", "Brace core throughout"] },
  { id: "rope-pressdown", name: "Cable Rope Tricep Pressdown", muscle_group: "arms", equipment: ["gym_machines"], level: "beginner",
    instructions: "Stand facing cable pulley with rope attachment. Push rope down, flaring ends apart at bottom, lock triceps, and return to 90 degrees.",
    form_cues: ["Pin elbows against ribcage", "Spread rope ends apart at bottom", "Keep upper arms motionless"] },
  { id: "seated-cable-row", name: "Seated Cable Row", muscle_group: "back", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit with knees slightly bent and feet on footrests. Pull handle into lower stomach, keeping chest tall and spine neutral.",
    form_cues: ["Do not rock backward excessively", "Drive elbows behind torso", "Pause and squeeze at contraction"] },
  { id: "seated-leg-curl", name: "Seated Leg Curl", muscle_group: "legs", equipment: ["gym_machines"], level: "beginner",
    instructions: "Sit with thighs secured under lap pad and lower leg pad behind ankles. Curl heels down and under your seat, then slowly return.",
    form_cues: ["Keep toes pointed up", "Do not lift hips off seat", "Control the eccentric phase"] },
  { id: "standing-calf-raise", name: "Standing Calf Raise", muscle_group: "legs", equipment: ["bodyweight", "gym_machines"], level: "beginner",
    instructions: "Stand on edge of step or platform on balls of feet. Push through toes to raise heels as high as possible, pause, and lower into full stretch.",
    form_cues: ["Full contraction at top", "Slow stretch at bottom", "Avoid bouncing"] },
  { id: "tricep-pressdown", name: "Tricep Bar Pressdown", muscle_group: "arms", equipment: ["gym_machines"], level: "beginner",
    instructions: "Grip straight or V-bar on high cable. Push bar down by extending elbows until arms are straight, then return with control to 90 degrees.",
    form_cues: ["Keep elbows pinned at sides", "Only forearms move", "Full tricep squeeze at bottom"] },
  { id: "v-squat", name: "V-Squat Machine", muscle_group: "legs", equipment: ["gym_machines"], level: "intermediate",
    instructions: "Position shoulders against pads on V-squat sled. Squat down with controlled tempo until thighs reach parallel, then drive back up.",
    form_cues: ["Keep back flat against pad", "Knees track over toes", "Do not bounce out of the bottom hole"] },
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
  async checkForm() {
    throw new Error("Form check needs the backend. Set VITE_USE_MOCK=false and start the backend.");
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
