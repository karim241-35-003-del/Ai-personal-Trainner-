// DEMO MODE ONLY. No backend needed. Everything is stored in this browser.
import { ACTIVITY_LEVELS, EXERCISES, MUSCLE_GROUPS } from "../constants.js";
import { todayStr, addDays, inRange } from "../utils/progress.js";

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


// ---------------------------------------------------------------------------
// Recommendations (demo rules). In the real system the backend owns this logic
// and returns the same shape: [{id, type, title, reason}].
// type: "weakness" (a problem found), "adjustment" (change the plan), "info".
// Every item has a "reason" so the user can see WHY it was suggested.
// ---------------------------------------------------------------------------
const exName = (v) => EXERCISES.find((e) => e.value === v)?.label ?? v;
const groupOf = (v) => EXERCISES.find((e) => e.value === v)?.group;
const TYPE_ORDER = { weakness: 0, adjustment: 1, info: 2 };

export function computeRecommendations(workouts, weights, profile, today = todayStr()) {
  if (!workouts.length) {
    return [{
      id: "start", type: "info", title: "Log your first workout",
      reason: "We need some workout history before we can find weaknesses or adapt your plan.",
    }];
  }
  const recs = [];

  // 1. Consistency: last 7 days compared with the planned days per week.
  const sessions7 = new Set(inRange(workouts, addDays(today, -6), today).map((w) => w.date)).size;
  const planned = Number(profile?.days_per_week) || 0;
  if (sessions7 === 0) {
    const last = workouts.map((w) => w.date).sort().at(-1);
    recs.push({
      id: "inactive", type: "weakness", title: "No workouts in the last 7 days",
      reason: `Your last logged workout was on ${last}. Even a short session helps you keep the habit.`,
    });
  } else if (planned && sessions7 < planned) {
    recs.push({
      id: "frequency", type: "adjustment", title: "Train a little more often",
      reason: `Your plan says ${planned} days per week, but you logged ${sessions7} in the last 7 days.`,
    });
  }

  // 2. Muscle groups not trained in the last 14 days (needs at least 2 training days to compare).
  const last14 = inRange(workouts, addDays(today, -13), today);
  if (new Set(last14.map((w) => w.date)).size >= 2) {
    const trained = new Set(last14.map((w) => groupOf(w.exercise)));
    for (const g of Object.keys(MUSCLE_GROUPS)) {
      if (!trained.has(g)) {
        recs.push({
          id: "group-" + g, type: "weakness", title: `${MUSCLE_GROUPS[g]} not trained recently`,
          reason: `No ${MUSCLE_GROUPS[g].toLowerCase()} exercise in the last 14 days. Add one to keep your training balanced.`,
        });
      }
    }
  }

  // 3. Per exercise: sudden drop, or no progress for 3 sessions.
  const byEx = {};
  for (const w of workouts) {
    const days = (byEx[w.exercise] ??= {});
    const s = (days[w.date] ??= { date: w.date, maxWeight: 0, reps: 0, volume: 0 });
    s.maxWeight = Math.max(s.maxWeight, w.weight);
    s.reps += w.sets * w.reps;
    s.volume += w.sets * w.reps * w.weight;
  }
  for (const [ex, days] of Object.entries(byEx)) {
    const s = Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
    const metric = (x) => (x.maxWeight > 0 ? x.volume : x.reps); // weighted: volume, bodyweight: reps
    if (s.length >= 2) {
      const last = s.at(-1), prev = s.at(-2);
      if (metric(prev) > 0 && metric(last) < 0.8 * metric(prev)) {
        const drop = Math.round((1 - metric(last) / metric(prev)) * 100);
        recs.push({
          id: "drop-" + ex, type: "weakness", title: `${exName(ex)}: performance dropped`,
          reason: `Your last ${exName(ex)} session was ${drop}% lower than the one before it. Check your rest, sleep and technique.`,
        });
        continue;
      }
    }
    if (s.length >= 3) {
      const l3 = s.slice(-3);
      if (l3[0].maxWeight > 0 && l3.every((x) => x.maxWeight === l3[0].maxWeight)) {
        recs.push({
          id: "plateau-" + ex, type: "adjustment", title: `Increase the load on ${exName(ex)}`,
          reason: `You used ${l3[0].maxWeight} kg for 3 sessions in a row. If your form stays good, try about 2.5 kg more, or 1 to 2 extra reps per set.`,
        });
      } else if (l3[0].maxWeight === 0 && l3.every((x) => x.maxWeight === 0) && l3[2].reps <= l3[0].reps) {
        recs.push({
          id: "plateau-" + ex, type: "adjustment", title: `Make ${exName(ex)} harder`,
          reason: "Your total reps have not gone up over the last 3 sessions. Add reps, add a set, or try a harder variation.",
        });
      }
    }
  }

  // 4. Body weight trend (last 14 days) compared with the goal.
  const w14 = weights.filter((w) => w.date >= addDays(today, -13) && w.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (w14.length >= 2) {
    const change = Math.round((w14.at(-1).weight - w14[0].weight) * 10) / 10;
    const goal = profile?.goal;
    if (goal === "lose" && change > 0.5) {
      recs.push({
        id: "trend-lose", type: "adjustment", title: "Weight is going up, but your goal is to lose",
        reason: `Your weight changed by +${change} kg in 14 days. Review your calorie intake against your daily target.`,
      });
    } else if (goal === "gain" && change < -0.5) {
      recs.push({
        id: "trend-gain", type: "adjustment", title: "Weight is going down, but your goal is to gain",
        reason: `Your weight changed by ${change} kg in 14 days. You may need to eat closer to your daily calorie target.`,
      });
    } else if (goal === "maintain" && Math.abs(change) > 1.5) {
      recs.push({
        id: "trend-maintain", type: "adjustment", title: "Weight is changing, but your goal is to maintain",
        reason: `Your weight changed by ${change > 0 ? "+" : ""}${change} kg in 14 days.`,
      });
    }
  }

  if (!recs.length) {
    recs.push({
      id: "ontrack", type: "info", title: "You are on track",
      reason: "No weak points found in your recent workouts. Keep logging so the advice stays accurate.",
    });
  }
  return recs.sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type]);
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const listKey = (name) => `mock_${name}_${currentEmail()}`;

export const api = {
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

  async getWorkouts() {
    await wait(150);
    return read(listKey("workouts"), []);
  },
  async addWorkout(data) {
    await wait();
    const list = read(listKey("workouts"), []);
    const entry = { id: uid(), ...data };
    write(listKey("workouts"), [...list, entry]);
    return entry;
  },
  async deleteWorkout(id) {
    await wait(150);
    write(listKey("workouts"), read(listKey("workouts"), []).filter((w) => w.id !== id));
    return null;
  },
  async getBodyWeights() {
    await wait(150);
    return read(listKey("bodyweights"), []);
  },
  async addBodyWeight(data) {
    await wait();
    // One body weight per day: saving the same date again replaces it.
    const list = read(listKey("bodyweights"), []).filter((w) => w.date !== data.date);
    const entry = { id: uid(), ...data };
    write(listKey("bodyweights"), [...list, entry]);
    return entry;
  },
  async deleteBodyWeight(id) {
    await wait(150);
    write(listKey("bodyweights"), read(listKey("bodyweights"), []).filter((w) => w.id !== id));
    return null;
  },
  async getRecommendations() {
    await wait(200);
    const profile = read("mock_profile_" + currentEmail(), null);
    return computeRecommendations(read(listKey("workouts"), []), read(listKey("bodyweights"), []), profile);
  },
};
