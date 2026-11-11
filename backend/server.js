import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 8000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

app.use(cors());
app.use(express.json());

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware: Authenticate requests using Supabase JWT
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Missing or invalid authorization token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ detail: "Invalid or expired token" });
    }

    req.user = user;
    // Create a Supabase client scoped with the user's JWT to respect RLS
    req.userSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: { persistSession: false },
    });
    next();
  } catch (err) {
    return res.status(401).json({ detail: "Authentication failed" });
  }
}

// Helper: Mifflin-St Jeor nutrition formula
const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  super: 1.9,
};
const GOAL_ADJUST = { lose: -400, maintain: 0, gain: 350 };

function computePlan(p) {
  const age = Number(p.age);
  const w = Number(p.weight);
  const h = Number(p.height);
  const bmr = 10 * w + 6.25 * h - 5 * age + (p.sex === "male" ? 5 : -161);
  const factor = ACTIVITY_FACTORS[p.activity] ?? 1.2;
  const tdee = bmr * factor;
  const exercises = p.activity !== "sedentary";
  const bmi = w / (h / 100) ** 2;

  let bmi_category = "Normal";
  if (bmi < 18.5) bmi_category = "Underweight";
  else if (bmi >= 30) bmi_category = "Obese";
  else if (bmi >= 25) bmi_category = "Overweight";

  const target = tdee + (GOAL_ADJUST[p.goal] ?? 0);

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

// ----------------- ROUTES -----------------

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: "Email and password are required." });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: name || email } },
  });

  if (error) {
    return res.status(400).json({ detail: error.message });
  }

  let session = data.session;
  // If session is null (e.g. auto-confirmed via trigger), sign in immediately to get JWT
  if (!session) {
    const signInResult = await supabase.auth.signInWithPassword({ email, password });
    if (signInResult.error) {
      return res.status(400).json({ detail: signInResult.error.message });
    }
    session = signInResult.data.session;
  }

  return res.json({
    access_token: session.access_token,
    token_type: "bearer",
    user: {
      name: name || data.user?.user_metadata?.name || email,
      email: data.user?.email || email,
    },
  });
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: "Email and password are required." });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return res.status(401).json({ detail: "Invalid email or password." });
  }

  return res.json({
    access_token: data.session.access_token,
    token_type: "bearer",
    user: {
      name: data.user.user_metadata?.name || data.user.email,
      email: data.user.email,
    },
  });
});

// GET /api/profile
app.get("/api/profile", requireAuth, async (req, res) => {
  const { data, error } = await req.userSupabase
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .single();

  if (error || !data || data.age == null) {
    return res.status(404).json({ detail: "Profile not found" });
  }

  return res.json({
    age: data.age,
    sex: data.sex,
    height: Number(data.height),
    weight: Number(data.weight),
    activity: data.activity,
    goal: data.goal,
    fitness_level: data.fitness_level,
    days_per_week: data.days_per_week,
    location: data.location,
    equipment: data.equipment || [],
    limitations: data.limitations || "",
  });
});

// PUT /api/profile
app.put("/api/profile", requireAuth, async (req, res) => {
  const p = req.body;
  const payload = {
    id: req.user.id,
    email: req.user.email,
    name: req.user.user_metadata?.name || req.user.email,
    age: Number(p.age),
    sex: p.sex,
    height: Number(p.height),
    weight: Number(p.weight),
    activity: p.activity,
    goal: p.goal,
    fitness_level: p.fitness_level,
    days_per_week: Number(p.days_per_week),
    location: p.location,
    equipment: p.equipment || [],
    limitations: p.limitations || "",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await req.userSupabase
    .from("profiles")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ detail: error.message });
  }

  return res.json({
    age: data.age,
    sex: data.sex,
    height: Number(data.height),
    weight: Number(data.weight),
    activity: data.activity,
    goal: data.goal,
    fitness_level: data.fitness_level,
    days_per_week: data.days_per_week,
    location: data.location,
    equipment: data.equipment || [],
    limitations: data.limitations || "",
  });
});

// GET /api/nutrition-plan
app.get("/api/nutrition-plan", requireAuth, async (req, res) => {
  const { data: profile, error } = await req.userSupabase
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .single();

  if (error || !profile || profile.age == null) {
    return res.status(404).json({ detail: "No profile found" });
  }

  const plan = computePlan(profile);
  return res.json(plan);
});

// GET /api/exercises
app.get("/api/exercises", requireAuth, async (req, res) => {
  const { data, error } = await req.userSupabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return res.status(400).json({ detail: error.message });
  }

  return res.json(data);
});

// POST /api/form-check -> forward to Python MediaPipe FastAPI service
const POSE_SERVICE_URL = (process.env.POSE_SERVICE_URL || "http://127.0.0.1:8001").replace(/\/$/, "");

app.post("/api/form-check", requireAuth, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err && err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ detail: "Photo exceeds the 5 MB size limit." });
    }
    if (err) {
      return res.status(400).json({ detail: err.message });
    }
    return next();
  });
}, async (req, res) => {
  const exercise_id = req.body.exercise_id;
  if (!req.file) {
    return res.status(422).json({ detail: "No photo was provided in the upload." });
  }
  if (!exercise_id) {
    return res.status(400).json({ detail: "exercise_id is required." });
  }

  try {
    const form = new FormData();
    form.append("exercise_id", exercise_id);
    form.append(
      "file",
      new Blob([req.file.buffer], { type: req.file.mimetype || "application/octet-stream" }),
      req.file.originalname || "photo.jpg"
    );

    const upstream = await fetch(`${POSE_SERVICE_URL}/api/form-check`, {
      method: "POST",
      headers: { Authorization: req.headers.authorization },
      body: form,
    });

    const data = await upstream.json().catch(() => ({ detail: "Invalid response from pose service." }));
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(503).json({
      detail: "Pose analysis service is not running. Start the Python FastAPI service on port 8001.",
    });
  }
});

// GET /api/workouts
app.get("/api/workouts", requireAuth, async (req, res) => {
  const { data, error } = await req.userSupabase
    .from("workouts")
    .select("*")
    .eq("user_id", req.user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(400).json({ detail: error.message });
  }

  const formatted = (data || []).map((w) => ({
    id: w.id,
    date: w.date,
    exercise_id: w.exercise_id,
    exercise_name: w.exercise_name,
    sets: w.sets,
    reps: w.reps,
    weight_kg: Number(w.weight_kg),
    notes: w.notes || "",
  }));

  return res.json(formatted);
});

// POST /api/workouts
app.post("/api/workouts", requireAuth, async (req, res) => {
  const { date, exercise_id, sets, reps, weight_kg, notes } = req.body;
  if (!date || !exercise_id || sets == null || reps == null) {
    return res.status(400).json({ detail: "Missing required workout fields." });
  }

  const { data: ex } = await req.userSupabase
    .from("exercises")
    .select("name")
    .eq("id", exercise_id)
    .single();

  const exercise_name = ex ? ex.name : exercise_id;

  const { data, error } = await req.userSupabase
    .from("workouts")
    .insert({
      user_id: req.user.id,
      date,
      exercise_id,
      exercise_name,
      sets: Number(sets),
      reps: Number(reps),
      weight_kg: Number(weight_kg || 0),
      notes: notes || "",
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ detail: error.message });
  }

  return res.status(201).json({
    id: data.id,
    date: data.date,
    exercise_id: data.exercise_id,
    exercise_name: data.exercise_name,
    sets: data.sets,
    reps: data.reps,
    weight_kg: Number(data.weight_kg),
    notes: data.notes || "",
  });
});

// DELETE /api/workouts/:id
app.delete("/api/workouts/:id", requireAuth, async (req, res) => {
  const { data, error } = await req.userSupabase
    .from("workouts")
    .delete()
    .eq("id", req.params.id)
    .select();

  if (error) {
    return res.status(400).json({ detail: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ detail: "Workout entry not found or unauthorized." });
  }

  return res.status(204).send();
});

// GET /api/progress/weights
app.get("/api/progress/weights", requireAuth, async (req, res) => {
  const { data, error } = await req.userSupabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", req.user.id)
    .order("date", { ascending: true });

  if (error) {
    return res.status(400).json({ detail: error.message });
  }

  const formatted = (data || []).map((w) => ({
    id: w.id,
    date: w.date,
    weight_kg: Number(w.weight_kg),
  }));

  return res.json(formatted);
});

// POST /api/progress/weights
app.post("/api/progress/weights", requireAuth, async (req, res) => {
  const { date, weight_kg } = req.body;
  if (!date || weight_kg == null) {
    return res.status(400).json({ detail: "date and weight_kg are required." });
  }

  const { data, error } = await req.userSupabase
    .from("weight_logs")
    .insert({
      user_id: req.user.id,
      date,
      weight_kg: Number(weight_kg),
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ detail: error.message });
  }

  return res.status(201).json({
    id: data.id,
    date: data.date,
    weight_kg: Number(data.weight_kg),
  });
});

// DELETE /api/progress/weights/:id
app.delete("/api/progress/weights/:id", requireAuth, async (req, res) => {
  const { data, error } = await req.userSupabase
    .from("weight_logs")
    .delete()
    .eq("id", req.params.id)
    .select();

  if (error) {
    return res.status(400).json({ detail: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ detail: "Weight entry not found or unauthorized." });
  }

  return res.status(204).send();
});

// GET /api/recommendations
app.get("/api/recommendations", requireAuth, async (req, res) => {
  const { data: profile, error: pErr } = await req.userSupabase
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .single();

  if (pErr || !profile || profile.age == null) {
    return res.status(404).json({ detail: "No profile found" });
  }

  const plan = computePlan(profile);

  const { data: workouts } = await req.userSupabase
    .from("workouts")
    .select("*")
    .eq("user_id", req.user.id);

  const { data: weights } = await req.userSupabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", req.user.id)
    .order("date", { ascending: true });

  const goalText = {
    lose: "lose weight",
    maintain: "maintain your weight",
    gain: "gain muscle and weight",
  }[profile.goal] || profile.goal;

  const summary =
    `You want to ${goalText}, you train ${profile.days_per_week} day(s) a week as a ${profile.fitness_level}, ` +
    `and you train ${profile.location === "gym" ? "at a gym" : "at home"}. ` +
    `So your plan uses ${plan.daily_calorie_target} kcal and ${plan.protein_min_g} to ${plan.protein_max_g} g protein per day.`;

  const items = [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const workoutList = workouts || [];
  const recent = workoutList.filter((w) => new Date(w.date) >= cutoff);

  if (workoutList.length === 0) {
    items.push({
      id: "start-logging",
      category: "workout",
      title: "Log your first workout",
      detail: "Add what you did in the Workout log so we can adapt your plan.",
      reason: "We have no workout data from you yet.",
    });
  } else if (recent.length < profile.days_per_week) {
    items.push({
      id: "more-sessions",
      category: "workout",
      title: "Try to hit your weekly sessions",
      detail: `You planned ${profile.days_per_week} day(s) a week and logged ${recent.length} in the last 7 days.`,
      reason: "Regular sessions matter more than a single hard one.",
    });
  } else {
    items.push({
      id: "on-track",
      category: "workout",
      title: "You are on track with your sessions",
      detail: "Keep going. When reps feel easy, add a little weight or a few reps.",
      reason: `You logged ${recent.length} session(s) in the last 7 days.`,
    });
  }

  const weightList = weights || [];
  if (weightList.length >= 2) {
    const change = weightList[weightList.length - 1].weight_kg - weightList[0].weight_kg;
    const dir = change > 0 ? "up" : change < 0 ? "down" : "unchanged";
    const fits =
      (profile.goal === "lose" && change < 0) ||
      (profile.goal === "gain" && change > 0) ||
      (profile.goal === "maintain" && Math.abs(change) < 1);

    items.push({
      id: "weight-trend",
      category: "nutrition",
      title: fits
        ? "Your weight is moving the way you want"
        : "Your weight is not moving toward your goal yet",
      detail:
        `Weight is ${dir} ${Math.abs(change).toFixed(1)} kg since your first entry.` +
        (fits
          ? ""
          : " Check your calories and sleep, and give it a few more weeks before changing the plan."),
      reason: "Based on your weight log in Progress.",
    });
  } else {
    items.push({
      id: "log-weight",
      category: "nutrition",
      title: "Log your weight each week",
      detail: "Two or more entries let us see your trend.",
      reason: "We need at least 2 weight entries.",
    });
  }

  items.push({
    id: "form-check",
    category: "form",
    title: "Check your form on a main lift",
    detail: "Upload one photo in Form check, especially for squats, deadlifts or presses.",
    reason: "Good form lowers injury risk.",
  });

  return res.json({ summary, items });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
