// DEMO MODE ONLY. No backend needed. Everything is stored in this browser.
import { ACTIVITY_LEVELS } from "../constants.js";
import { detectInjuries } from "../utils/injuryRules.js";

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
  // ==========================================
  // 1. Beginner – At Home (No Equipment) [8 EXERCISES FROM USER PHOTOS]
  // ==========================================
  {
    id: "knee-push-up",
    name: "Knee Push-ups",
    muscle_id: "chest",
    muscle_group: "chest",
    secondary_muscles: ["triceps", "shoulders"],
    equipment: ["bodyweight"],
    level: "beginner",
    location: "home",
    routine_type: "home_bodyweight_beginner",
    sets: 2,
    reps: "10–12 reps",
    imageUrl: "/exercises/knee-push-up.png",
    instructions: "Start on your hands and knees with hands positioned shoulder-width apart. Lower your chest smoothly toward the floor while keeping a straight line from your head to your knees. Press through your palms to return to the starting position.",
    form_cues: ["Keep core braced and hips aligned with knees", "Lower until chest is just off the floor", "Do not let lower back sag"]
  },
  {
    id: "chair-squat",
    name: "Chair Squat",
    muscle_id: "quads",
    muscle_group: "legs",
    secondary_muscles: ["glutes"],
    equipment: ["bodyweight"],
    level: "beginner",
    location: "home",
    routine_type: "home_bodyweight_beginner",
    sets: 2,
    reps: "10–12 reps",
    imageUrl: "/exercises/chair-squat.png",
    instructions: "Stand directly in front of a sturdy chair with feet shoulder-width apart. Hinge back at your hips and bend your knees to lower your hips down until lightly touching the chair seat. Press through your heels to stand back up.",
    form_cues: ["Keep your chest upright and arms extended for balance", "Lightly tap the chair seat without collapsing into it", "Drive up through your heels"]
  },
  {
    id: "knee-plank",
    name: "Knee Plank",
    muscle_id: "abs",
    muscle_group: "core",
    secondary_muscles: ["shoulders"],
    equipment: ["bodyweight"],
    level: "beginner",
    location: "home",
    routine_type: "home_bodyweight_beginner",
    sets: 2,
    reps: "15–20 seconds",
    imageUrl: "/exercises/knee-plank.png",
    instructions: "Place your forearms on the floor with elbows directly under your shoulders. Rest on your knees with lower legs bent upward. Hold your body in a straight line from your head to your knees while bracing your abdominal muscles.",
    form_cues: ["Brace your stomach muscles as if anticipating a punch", "Keep neck neutral with gaze on the floor", "Breathe steadily without letting hips sag"]
  },
  {
    id: "home-glute-bridge",
    name: "Glute Bridge",
    muscle_id: "glutes",
    muscle_group: "glutes",
    secondary_muscles: ["hamstrings"],
    equipment: ["bodyweight"],
    level: "beginner",
    location: "home",
    routine_type: "home_bodyweight_beginner",
    sets: 2,
    reps: "12 reps",
    imageUrl: "/exercises/glute-bridge.png",
    instructions: "Lie on your back with knees bent and feet flat on the floor hip-width apart. Drive through your heels to lift your hips toward the ceiling until your body forms a straight line from shoulders to knees. Squeeze glutes at the top, then lower slowly.",
    form_cues: ["Squeeze your glutes firmly at peak height", "Avoid overarching your lumbar spine", "Keep feet grounded flat throughout"]
  },
  {
    id: "arm-side-raise",
    name: "Arm Side Raise",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    secondary_muscles: ["traps"],
    equipment: ["bodyweight"],
    level: "beginner",
    location: "home",
    routine_type: "home_bodyweight_beginner",
    sets: 2,
    reps: "12–15 reps",
    imageUrl: "/exercises/arm-side-raise.png",
    instructions: "Stand tall with arms at your sides. Slowly raise both arms straight out to the sides until they are level with your shoulders (parallel to the ground). Hold briefly, then lower slowly under control.",
    form_cues: ["Lead with your elbows in the lateral plane", "Keep your shoulders relaxed away from your ears", "Control the lowering phase without dropping arms"]
  },
  {
    id: "arm-front-raise",
    name: "Arm Front Raise",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    secondary_muscles: ["chest"],
    equipment: ["bodyweight"],
    level: "beginner",
    location: "home",
    routine_type: "home_bodyweight_beginner",
    sets: 2,
    reps: "12–15 reps",
    imageUrl: "/exercises/arm-front-raise.png",
    instructions: "Stand upright with arms in front of your thighs. Raise your arms straight out in front of you until they reach eye/shoulder height. Pause briefly at the top and lower back down smoothly.",
    form_cues: ["Do not swing or rock your torso backwards", "Keep your elbows almost straight with a micro-softness", "Feel the anterior deltoids engage"]
  },
  {
    id: "home-standing-calf-raise",
    name: "Standing Calf Raise",
    muscle_id: "calves",
    muscle_group: "calves",
    equipment: ["bodyweight"],
    level: "beginner",
    location: "home",
    routine_type: "home_bodyweight_beginner",
    sets: 2,
    reps: "15 reps",
    imageUrl: "/exercises/standing-calf-raise.png",
    instructions: "Stand upright with feet hip-width apart on a flat floor. Slowly rise up onto the balls of your feet as high as possible, lifting your heels off the ground. Squeeze your calves at the apex, then lower slowly.",
    form_cues: ["Rise straight up without leaning forward", "Hold the peak contraction for 1 full second", "Lower heels down under control"]
  },
  {
    id: "crunches",
    name: "Crunches",
    muscle_id: "abs",
    muscle_group: "core",
    equipment: ["bodyweight"],
    level: "beginner",
    location: "home",
    routine_type: "home_bodyweight_beginner",
    sets: 2,
    reps: "12 reps",
    imageUrl: "/exercises/crunches.png",
    instructions: "Lie on your back with knees bent and feet flat on the floor. Place your fingertips lightly behind your head. Curl your upper spine forward to lift your shoulder blades off the mat, contract your abdominals, then lower with control.",
    form_cues: ["Do not pull on your neck with your hands", "Focus on drawing your ribs toward your pelvis", "Exhale on the way up, inhale on the descent"]
  },

  // ==========================================
  // 2. Beginner – At Home (Dumbbells) [8 EXERCISES]
  // ==========================================
  {
    id: "dumbbell-goblet-squat",
    name: "Dumbbell Goblet Squat",
    muscle_id: "quads",
    muscle_group: "legs",
    secondary_muscles: ["glutes"],
    equipment: ["dumbbell"],
    level: "beginner",
    location: "home",
    routine_type: "home_dumbbell_beginner",
    sets: 2,
    reps: "10–12 reps",
    videoUrl: "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-goblet-squat-front.mp4",
    instructions: "Hold a dumbbell vertically against your chest with both hands cradling the top bell. Stand with feet shoulder-width apart, squat down between your hips until thighs are parallel to the floor, then press through your heels to stand.",
    form_cues: ["Keep dumbbell held close to your sternum", "Chest stays tall and proud throughout", "Knees track outward in line with toes"]
  },
  {
    id: "dumbbell-floor-press",
    name: "Dumbbell Floor Press",
    muscle_id: "chest",
    muscle_group: "chest",
    secondary_muscles: ["triceps", "shoulders"],
    equipment: ["dumbbell"],
    level: "beginner",
    location: "home",
    routine_type: "home_dumbbell_beginner",
    sets: 2,
    reps: "10–12 reps",
    videoUrl: "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-bench-press-front.mp4",
    instructions: "Lie flat on the floor with knees bent and feet flat. Hold a pair of dumbbells at chest level with upper arms resting on the floor at a 45-degree angle. Press both dumbbells straight up over your chest until arms extend, then lower until triceps touch the floor.",
    form_cues: ["Floor naturally protects shoulders from excessive extension", "Press dumbbells in a slight arc over mid-chest", "Pause briefly as triceps touch floor"]
  },
  {
    id: "dumbbell-one-arm-row",
    name: "Dumbbell One-Arm Row",
    muscle_id: "lats",
    muscle_group: "back",
    secondary_muscles: ["biceps"],
    equipment: ["dumbbell"],
    level: "beginner",
    location: "home",
    routine_type: "home_dumbbell_beginner",
    sets: 2,
    reps: "10–12 reps",
    videoUrl: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-single-arm-row-front.mp4",
    instructions: "Place one hand on a sturdy chair or bench, hinge forward at hips with a flat back. Hold a dumbbell in the opposite hand hanging down. Pull the dumbbell upward towards your hip pocket, squeezing your lat at the top, then lower smoothly.",
    form_cues: ["Keep your back flat and parallel to the floor", "Pull your elbow straight back toward your hip", "Avoid twisting your shoulders during the row"]
  },
  {
    id: "dumbbell-romanian-deadlift",
    name: "Dumbbell Romanian Deadlift",
    muscle_id: "hamstrings",
    muscle_group: "legs",
    secondary_muscles: ["glutes", "lowerback"],
    equipment: ["dumbbell"],
    level: "beginner",
    location: "home",
    routine_type: "home_dumbbell_beginner",
    sets: 2,
    reps: "10–12 reps",
    videoUrl: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-romanian-deadlift-front.mp4",
    instructions: "Stand tall holding dumbbells in front of your thighs. Keep a soft micro-bend in your knees, push your hips straight backwards, and slide the dumbbells down along your shins until you feel a deep hamstring stretch. Drive your hips forward to stand.",
    form_cues: ["Push your hips back as if touching a wall behind you", "Keep the dumbbells close to your legs", "Maintain a flat, neutral spine without rounding"]
  },
  {
    id: "dumbbell-shoulder-press",
    name: "Dumbbell Shoulder Press",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    equipment: ["dumbbell"],
    level: "beginner",
    location: "home",
    routine_type: "home_dumbbell_beginner",
    sets: 2,
    reps: "10–12 reps",
    videoUrl: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-overhead-press-front.mp4",
    instructions: "Hold a pair of dumbbells at shoulder level with wrists straight. Press the weights overhead in a smooth arc until your arms are extended. Lower slowly back to ear height.",
    form_cues: ["Brace your core to prevent lumbar hyperextension", "Press smoothly without clanking dumbbells together", "Control the lowering phase to shoulder level"]
  },
  {
    id: "dumbbell-bicep-curl",
    name: "Dumbbell Bicep Curl",
    muscle_id: "biceps",
    muscle_group: "arms",
    equipment: ["dumbbell"],
    level: "beginner",
    location: "home",
    routine_type: "home_dumbbell_beginner",
    sets: 2,
    reps: "10–12 reps",
    videoUrl: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-curl-front.mp4",
    instructions: "Hold dumbbells at your sides. As you curl the weights upward, rotate your forearms so your palms face your shoulders at the top. Squeeze firmly, then reverse the motion under control.",
    form_cues: ["Supinate your wrists as you curl up for complete bicep contraction", "Keep elbows pinned to your sides", "Avoid swinging or leaning sideways"]
  },
  {
    id: "dumbbell-overhead-tricep-extension",
    name: "Dumbbell Overhead Tricep Extension",
    muscle_id: "triceps",
    muscle_group: "arms",
    equipment: ["dumbbell"],
    level: "beginner",
    location: "home",
    routine_type: "home_dumbbell_beginner",
    sets: 2,
    reps: "10–12 reps",
    videoUrl: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-overhead-tricep-extension-front.mp4",
    instructions: "Hold one dumbbell with both hands overhead, palms supporting the upper plate. Keeping your elbows pointed forward and close to your head, lower the weight behind your head by bending your elbows. Extend your arms to press the weight back overhead.",
    form_cues: ["Keep your elbows pointing forward, not flaring out", "Lower until forearms pass 90 degrees", "Press through your triceps back to the top"]
  },
  {
    id: "dumbbell-standing-calf-raise",
    name: "Dumbbell Standing Calf Raise",
    muscle_id: "calves",
    muscle_group: "calves",
    equipment: ["dumbbell"],
    level: "beginner",
    location: "home",
    routine_type: "home_dumbbell_beginner",
    sets: 2,
    reps: "15 reps",
    videoUrl: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-calf-raise-front.mp4",
    instructions: "Hold a dumbbell in each hand at your sides. Rise up onto the balls of your feet, contracting your calf muscles at the peak. Lower slowly back down until your heels touch the floor.",
    form_cues: ["Rise straight up onto your big toes", "Hold the peak contraction for 1 second", "Lower slowly under strict control"]
  },

  // ==========================================
  // 3. Beginner – Gym Initial Routine [6 EXERCISES]
  // ==========================================
  {
    id: "push-up",
    name: "Push-up",
    muscle_id: "chest",
    muscle_group: "chest",
    equipment: ["bodyweight"],
    level: "beginner",
    location: "gym",
    routine_type: "gym_beginner",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/push-up.mov",
    videoUrl: "/exercises/videos/push-up.mov",
    instructions: "Start in a strong plank position with hands slightly wider than shoulder-width. Lower your chest until it is just above the floor, keeping elbows at 45 degrees. Press firmly back up to full extension.",
    form_cues: ["Maintain a straight line from head to heels", "Keep core and glutes tight throughout", "Lower until chest hovers just above the ground"]
  },
  {
    id: "assisted-pull-up",
    name: "Assisted pull-up",
    muscle_id: "lats",
    muscle_group: "back",
    equipment: ["gym_machines"],
    level: "beginner",
    location: "gym",
    routine_type: "gym_beginner",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/assisted-pullup.mov",
    videoUrl: "/exercises/videos/assisted-pullup.mov",
    instructions: "Kneel or stand on the assistance counterweight pad and grip the overhead handles slightly wider than shoulder-width. Pull yourself upward by driving your elbows down toward your hips until your chin clears the bar.",
    form_cues: ["Keep your chest proud and drive elbows straight down", "Do not swing or bounce on the assistance platform", "Lower under full control to full arm hang"]
  },
  {
    id: "gym-dumbbell-shoulder-press",
    name: "Dumbbell shoulder press",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    equipment: ["dumbbell"],
    level: "beginner",
    location: "gym",
    routine_type: "gym_beginner",
    sets: 4,
    reps: "12 reps",
    videoUrl: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-overhead-press-front.mp4",
    instructions: "Hold a pair of dumbbells at shoulder level with wrists straight. Press the weights overhead in a smooth arc until your arms are extended. Lower slowly back to ear height.",
    form_cues: ["Brace your core to prevent lumbar hyperextension", "Press smoothly without clanking dumbbells together", "Control the lowering phase to shoulder level"]
  },
  {
    id: "barbell-curl",
    name: "Barbell curl",
    muscle_id: "biceps",
    muscle_group: "arms",
    equipment: ["barbell"],
    level: "beginner",
    location: "gym",
    routine_type: "gym_beginner",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/barbell-curl.mov",
    videoUrl: "/exercises/videos/barbell-curl.mov",
    instructions: "Stand tall holding a barbell with an underhand shoulder-width grip. Keeping your elbows pinned against your ribcage, curl the bar toward your shoulders. Squeeze hard at the top and lower slowly.",
    form_cues: ["Keep elbows pinned to your sides throughout the curl", "Avoid swinging your hips or torso to generate momentum", "Resist the weight on the way down for maximum bicep tension"]
  },
  {
    id: "tricep-pressdown",
    name: "Tricep pressdown",
    muscle_id: "triceps",
    muscle_group: "arms",
    equipment: ["gym_machines"],
    level: "beginner",
    location: "gym",
    routine_type: "gym_beginner",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/tricep-pressdown.mov",
    videoUrl: "/exercises/videos/tricep-pressdown.mov",
    instructions: "Attach a bar or cable handle to a high pulley. Grasp with an overhand grip and lock your elbows at your ribs. Push downward until elbows are fully locked out, then slowly return to 90 degrees.",
    form_cues: ["Upper arms stay fixed against your torso", "Focus strictly on tricep contraction at bottom lockout", "Do not allow elbows to flare outward or drift forward"]
  },
  {
    id: "bodyweight-squat",
    name: "Bodyweight Squat",
    muscle_id: "quads",
    muscle_group: "legs",
    equipment: ["bodyweight"],
    level: "beginner",
    location: "gym",
    routine_type: "gym_beginner",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/bw-squat.mov",
    videoUrl: "/exercises/videos/bw-squat.mov",
    instructions: "Stand with feet shoulder-width apart, toes turned slightly out. Hinge back at your hips and bend your knees to squat down until your thighs are parallel to the floor. Drive through your heels to stand.",
    form_cues: ["Keep your chest upright and back flat", "Knees track outward in line with your toes", "Push through your heels and squeeze glutes at the top"]
  },

  // ==========================================
  // 4. Intermediate – 3-Day Split (Gym) [21 EXERCISES]
  // ==========================================
  // Day-1 (Chest/Shoulder/Tricep)
  {
    id: "machine-chest-press",
    name: "Machine chest press",
    muscle_id: "chest",
    muscle_group: "chest",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 1",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/machine-chest-press.mov",
    videoUrl: "/exercises/videos/machine-chest-press.mov",
    instructions: "Adjust the seat so the handles align across your mid-chest. Press outward smoothly until your arms are extended without locking elbows harshly. Lower under control until a comfortable chest stretch is reached.",
    form_cues: ["Keep shoulder blades retracted and firmly against the pad", "Drive through the palms using chest contraction", "Avoid flaring elbows up past 90 degrees"]
  },
  {
    id: "pectoral-fly",
    name: "Pectoral fly",
    muscle_id: "chest",
    muscle_group: "chest",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 1",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/pectoral-fly.mov",
    videoUrl: "/exercises/videos/pectoral-fly.mov",
    instructions: "Sit on the pec deck with your spine firmly against the back pad. Grasp the vertical handles with a slight bend in your elbows. Bring the handles together in an arc across your chest and squeeze.",
    form_cues: ["Maintain a constant slight bend in the elbows", "Squeeze your pectorals hard at the center point", "Control the return to prevent over-stretching the shoulders"]
  },
  {
    id: "decline-chest-press",
    name: "Decline chest press",
    muscle_id: "chest",
    muscle_group: "chest",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 1",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/decline-chest-press.mov",
    videoUrl: "/exercises/videos/decline-chest-press.mov",
    instructions: "Secure yourself into the decline chest press station. Grip the handles at lower chest level and press forward and downward in the machine's guided plane until arms extend. Slowly lower back to starting depth.",
    form_cues: ["Targets lower pectoral fibers with reduced anterior shoulder shear", "Keep wrists stacked directly over your forearms", "Smooth cadence without bouncing off stops"]
  },
  {
    id: "machine-shoulder-press",
    name: "Machine shoulder press",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 1",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/machine-shoulder-press.mov",
    videoUrl: "/exercises/videos/machine-shoulder-press.mov",
    instructions: "Adjust seat height so handles sit at ear level. Grip the handles and press overhead until arms are nearly straight. Lower the weight smoothly back to ear height.",
    form_cues: ["Maintain neutral head position and flat back against the pad", "Do not hyperextend your lower back during the press", "Lower until elbows reach roughly 90 degrees"]
  },
  {
    id: "dumbbell-side-raise",
    name: "Dumbbell side raise",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    equipment: ["dumbbell"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 1",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/db-side-raise.mov",
    videoUrl: "/exercises/videos/db-side-raise.mov",
    instructions: "Hold dumbbells at your sides with palms facing inward. Keeping a slight bend in the elbows, raise your arms laterally until they reach shoulder height. Pause for a moment and lower smoothly.",
    form_cues: ["Lead with your elbows and keep wrists neutral", "Do not swing or shrug with your traps", "Raise strictly to shoulder height in the scapular plane"]
  },
  {
    id: "rope-press-down",
    name: "Rope press down",
    muscle_id: "triceps",
    muscle_group: "arms",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 1",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/rope-press-down.mov",
    videoUrl: "/exercises/videos/rope-press-down.mov",
    instructions: "Attach a rope to a high pulley. Hold rope ends with palms facing inward and upper arms locked at your ribs. Push down and spread the rope ends apart at the bottom to peak contract the triceps.",
    form_cues: ["Spread the rope apart at full elbow lockout", "Keep upper arms stationary by your sides", "Control the return to roughly chest level"]
  },
  {
    id: "machine-dips",
    name: "Machine dips",
    muscle_id: "triceps",
    muscle_group: "arms",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 1",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/machine-dips.mov",
    videoUrl: "/exercises/videos/machine-dips.mov",
    instructions: "Sit in the dip machine with back against the pad. Grasp the parallel handles and press downward until your arms are fully extended. Hold for a split second, then return smoothly to 90 degrees.",
    form_cues: ["Keep your torso upright to emphasize triceps over chest", "Avoid shrugging shoulders toward your ears", "Lock out with deliberate tricep contraction"]
  },

  // Day-2 (Legs)
  {
    id: "barbell-squat",
    name: "Barbell squat",
    muscle_id: "quads",
    muscle_group: "legs",
    equipment: ["barbell"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 2",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/barbell-squat.mov",
    videoUrl: "/exercises/videos/barbell-squat.mov",
    instructions: "Rest the barbell securely across your upper trapezius. Stand with feet shoulder-width apart, brace your core, and squat down until thighs reach parallel to the floor. Drive up through midfoot to stand.",
    form_cues: ["Keep chest tall and maintain neutral spinal alignment", "Knees track outward in line with your toes", "Squat to parallel depth without knee collapse"]
  },
  {
    id: "leg-press",
    name: "Leg press",
    muscle_id: "quads",
    muscle_group: "legs",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 2",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/leg-press.mov",
    videoUrl: "/exercises/videos/leg-press.mov",
    instructions: "Sit on the 45-degree leg press sled with feet shoulder-width in the platform center. Lower the sled under control until your knees reach 90 degrees, then drive through heels and midfoot back up.",
    form_cues: ["Never lock your knees out forcefully at the top", "Keep lower back and glutes pressed flat against the pad", "Control the sled descent smoothly without jarring"]
  },
  {
    id: "v-squat",
    name: "V-squat",
    muscle_id: "quads",
    muscle_group: "legs",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 2",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/v-squat.mov",
    videoUrl: "/exercises/videos/v-squat.mov",
    instructions: "Step into the V-squat machine with shoulders under the pads and back flush against the backrest. Place feet comfortably on the plate, descend into a deep knee flexion, then press back up.",
    form_cues: ["Keep your entire back against the cushion pad", "Drive through the center of your feet", "Do not hyperextend knees at the top lockout"]
  },
  {
    id: "seated-leg-curl",
    name: "Seated leg curl",
    muscle_id: "hamstrings",
    muscle_group: "legs",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 2",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/seated-leg-curl.mov",
    videoUrl: "/exercises/videos/seated-leg-curl.mov",
    instructions: "Sit with back supported and thigh pad locked down firmly over your thighs. Place the lower roller pad against your achilles. Flex your knees to curl the roller beneath the seat, then return slowly.",
    form_cues: ["Lock down the thigh pad to prevent hips from rising", "Squeeze your hamstrings at the bottom of the curl", "Resist the weight on the eccentric extension"]
  },
  {
    id: "machine-adductor",
    name: "Adductor",
    muscle_id: "glutes",
    muscle_group: "legs",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 2",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/adductor.mov",
    videoUrl: "/exercises/videos/adductor.mov",
    instructions: "Sit with legs apart against the machine inner pads. Squeeze your thighs together toward the center against resistance until pads meet. Pause briefly, then control the return stretch.",
    form_cues: ["Keep your back firmly seated against the support", "Squeeze inner thighs smoothly and pause at center", "Control the opening phase to protect the hip adductors"]
  },
  {
    id: "standing-calf-raise",
    name: "Standing Calf raise",
    muscle_id: "calves",
    muscle_group: "calves",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 2",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/standing-calf-raise.mov",
    videoUrl: "/exercises/videos/standing-calf-raise.mov",
    instructions: "Place shoulder pads over your shoulders and balls of feet on the calf block with heels hanging off. Lower heels deeply to stretch calves, then drive onto your toes for a hard contraction.",
    form_cues: ["Keep knees slightly unlocked but straight", "Pause 1 full second at full stretch and full contraction", "Avoid bouncing off the bottom Achilles stretch"]
  },

  // Day-3 (Back/Biceps)
  {
    id: "machine-high-row",
    name: "High row",
    muscle_id: "lats",
    muscle_group: "back",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 3",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/high-row.mov",
    videoUrl: "/exercises/videos/high-row.mov",
    instructions: "Sit with chest against the pad and reach up to grasp the high handles. Pull downward and back toward your ribs, driving your elbows down and squeezing your lats. Return under control.",
    form_cues: ["Drive elbows down toward your hip pockets", "Keep chest firmly planted against the pad", "Full stretch at top, full contraction at bottom"]
  },
  {
    id: "machine-low-row",
    name: "Low row",
    muscle_id: "lats",
    muscle_group: "back",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 3",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/low-row.mov",
    videoUrl: "/exercises/videos/low-row.mov",
    instructions: "Position yourself on the low row machine with chest against the pad. Grasp the low handles and pull back toward your lower ribs. Pinch your shoulder blades together, then return slowly.",
    form_cues: ["Pull towards your lower abdomen to load lats", "Pinch shoulder blades together without shrugging", "Avoid twisting your torso during the pull"]
  },
  {
    id: "dy-row",
    name: "D.Y row",
    muscle_id: "lats",
    muscle_group: "back",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 3",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/dy-row.mov",
    videoUrl: "/exercises/videos/dy-row.mov",
    instructions: "Seat yourself into the Dorian Yates low-incline row station with chest supported. Pull the handles in an underhand or neutral arc back toward your hips. Squeeze your lats and extend under control.",
    form_cues: ["Follow the guided natural converging arc of the handles", "Keep elbows close to your torso during the pull", "Feel the lat stretch at the forward extension point"]
  },
  {
    id: "seated-cable-row",
    name: "Seated cable row",
    muscle_id: "lats",
    muscle_group: "back",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 3",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/seated-cable-row.mov",
    videoUrl: "/exercises/videos/seated-cable-row.mov",
    instructions: "Sit on the cable bench with feet on footplates and knees softly bent. Grasp the handle and sit upright. Pull the handle directly into your lower abdomen, squeezing shoulder blades together.",
    form_cues: ["Keep torso stationary at roughly 90 degrees; do not swing", "Drive elbows back and retract shoulder blades fully", "Avoid rounding the lower back during the forward reach"]
  },
  {
    id: "cable-face-pull",
    name: "Face pull",
    muscle_id: "traps",
    muscle_group: "back",
    equipment: ["gym_machines"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 3",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/face-pull.mov",
    videoUrl: "/exercises/videos/face-pull.mov",
    instructions: "Attach a rope to a high pulley. Grasp the ends with thumbs pointing back. Pull the center of the rope directly toward your forehead while separating your hands outward. Squeeze rear delts and upper back.",
    form_cues: ["Pull toward eye level while externally rotating shoulders", "Keep elbows flared high and wide", "Hold peak contraction for a full second"]
  },
  {
    id: "intermediate-barbell-curl",
    name: "Barbell curl",
    muscle_id: "biceps",
    muscle_group: "arms",
    equipment: ["barbell"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 3",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/barbell-curl.mov",
    videoUrl: "/exercises/videos/barbell-curl.mov",
    instructions: "Stand tall with an underhand grip on the barbell. Keeping your elbows pinned against your torso, curl the bar up toward your chest with explosive control. Squeeze your biceps at the top and lower slowly.",
    form_cues: ["Lock your elbows in place at your sides", "Do not lean back or use momentum from your hips", "Lower the bar over 2-3 seconds for maximum eccentric overload"]
  },
  {
    id: "dumbbell-curl",
    name: "Dumbbell curl",
    muscle_id: "biceps",
    muscle_group: "arms",
    equipment: ["dumbbell"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 3",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/dumbbell-curl.mov",
    videoUrl: "/exercises/videos/dumbbell-curl.mov",
    instructions: "Hold dumbbells at your sides. As you curl the weights upward, rotate your forearms so your palms face your shoulders at the top. Squeeze firmly, then reverse the motion under control.",
    form_cues: ["Supinate your wrists as you curl up for complete bicep contraction", "Keep elbows pinned to your sides", "Avoid swinging or leaning sideways"]
  },
  {
    id: "hammer-curl",
    name: "Hammer curl",
    muscle_id: "biceps",
    muscle_group: "arms",
    equipment: ["dumbbell"],
    level: "intermediate",
    routine_type: "intermediate_split",
    day: "Day 3",
    sets: 4,
    reps: "12 reps",
    video: "/exercises/videos/hammer-curl.mov",
    videoUrl: "/exercises/videos/hammer-curl.mov",
    instructions: "Hold dumbbells with palms facing each other in a neutral grip. Curl the weights upward while keeping palms facing inward throughout. Squeeze forearms and biceps at the top, then lower slowly.",
    form_cues: ["Maintain a strict neutral grip throughout the entire repetition", "Keep upper arms stationary by your sides", "Control the descent to target the brachialis and brachioradialis"]
  },
  // ==========================================
  // 5. Intermediate – At Home (Dumbbells) [19 EXERCISES FROM USER PHOTOS]
  // ==========================================
  // Day 1 – Chest + Triceps + Shoulders
  {
    id: "home-int-dumbbell-floor-press",
    name: "Dumbbell Floor Press",
    muscle_id: "chest",
    muscle_group: "chest",
    secondary_muscles: ["triceps"],
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 1",
    sets: 3,
    reps: "10–12 reps",
    imageUrl: "/exercises/int-dumbbell-floor-press.png",
    instructions: "Lie flat on the floor with knees bent and feet flat. Hold a pair of dumbbells at chest level with upper arms resting on the floor at a 45-degree angle. Press both dumbbells straight up over your chest until arms extend, then lower under control until triceps touch the floor.",
    form_cues: ["Floor naturally protects shoulders from excessive hyperextension", "Press in a smooth slight inward arc over mid-chest", "Pause for half a second as triceps touch the ground"]
  },
  {
    id: "home-int-dumbbell-squeeze-press",
    name: "Dumbbell Squeeze Press",
    muscle_id: "chest",
    muscle_group: "chest",
    secondary_muscles: ["triceps"],
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 1",
    sets: 3,
    reps: "10–12 reps",
    imageUrl: "/exercises/int-dumbbell-squeeze-press.png",
    instructions: "Lie on the floor holding dumbbells with a neutral grip (palms facing each other). Press the dumbbell plates firmly against each other throughout the entire movement. Lower to your sternum while maintaining inward pressure, then press straight up.",
    form_cues: ["Keep dumbbells pressed tightly together for maximum inner pec recruitment", "Maintain inward squeezing tension continuously", "Lower slowly without releasing contact between dumbbells"]
  },
  {
    id: "home-int-dumbbell-shoulder-press",
    name: "Dumbbell Shoulder Press",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    secondary_muscles: ["triceps"],
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 1",
    sets: 3,
    reps: "8–12 reps",
    imageUrl: "/exercises/int-dumbbell-shoulder-press.png",
    instructions: "Stand tall or sit upright with dumbbells at shoulder height, wrists straight. Press the dumbbells overhead in a smooth converging arc until arms are extended overhead. Lower under strict control to ear level.",
    form_cues: ["Brace your abdominals and glutes to prevent lumbar hyperextension", "Do not clank the dumbbells together at lockout", "Lower dumbbells slowly to shoulder depth"]
  },
  {
    id: "home-int-dumbbell-lateral-raise",
    name: "Dumbbell Lateral Raise",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 1",
    sets: 3,
    reps: "12–15 reps",
    imageUrl: "/exercises/int-dumbbell-lateral-raise.png",
    instructions: "Stand with dumbbells hanging at your sides with a slight elbow bend. Raise your arms out to the sides in the scapular plane until parallel to the floor. Pause briefly at the top and lower smoothly.",
    form_cues: ["Lead with your elbows rather than wrists", "Keep your shoulders down away from your ears to avoid trap dominance", "Lower under control without swinging your hips"]
  },
  {
    id: "home-int-overhead-triceps-extension",
    name: "Overhead Triceps Extension",
    muscle_id: "triceps",
    muscle_group: "arms",
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 1",
    sets: 3,
    reps: "10–12 reps",
    imageUrl: "/exercises/int-overhead-triceps-extension.png",
    instructions: "Hold one dumbbell with both hands overhead, cupping the top dumbbell plate. Keep your upper arms stationary by your ears and bend your elbows to lower the weight behind your head. Extend through your triceps to press back to top extension.",
    form_cues: ["Keep your elbows pointing forward without flaring wide", "Lower until forearms pass 90 degrees for a deep tricep stretch", "Drive through triceps without arching lower back"]
  },
  {
    id: "home-int-dumbbell-triceps-kickback",
    name: "Dumbbell Triceps Kickback",
    muscle_id: "triceps",
    muscle_group: "arms",
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 1",
    sets: 2,
    reps: "12–15 reps",
    imageUrl: "/exercises/int-dumbbell-triceps-kickback.png",
    instructions: "Hinge forward at the hips with a flat back and knees soft. Bring your upper arms parallel to your torso and pin elbows by your ribs. Extend your forearms backwards until arms are straight, squeeze triceps, and lower slowly.",
    form_cues: ["Lock your upper arms in place; only forearms move", "Hold the peak lockout contraction for a full second", "Avoid swinging or dropping the elbow height"]
  },

  // Day 2 – Legs + Abs
  {
    id: "home-int-goblet-squat",
    name: "Goblet Squat",
    muscle_id: "quads",
    muscle_group: "legs",
    secondary_muscles: ["glutes"],
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 2",
    sets: 3,
    reps: "10–12 reps",
    imageUrl: "/exercises/int-goblet-squat.png",
    instructions: "Hold a dumbbell vertically against your sternum with both hands cupping the upper plate. Stand shoulder-width apart, descend into a deep squat between your knees until thighs reach parallel, then drive through midfoot to stand.",
    form_cues: ["Keep chest tall and dumbbell pinned against sternum", "Knees track outward over second toes", "Drive up through heels and squeeze glutes at the top"]
  },
  {
    id: "home-int-dumbbell-romanian-deadlift",
    name: "Dumbbell Romanian Deadlift",
    muscle_id: "hamstrings",
    muscle_group: "legs",
    secondary_muscles: ["glutes", "lowerback"],
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 2",
    sets: 3,
    reps: "10–12 reps",
    imageUrl: "/exercises/int-dumbbell-romanian-deadlift.png",
    instructions: "Stand tall holding dumbbells against your front thighs. Keeping knees soft, push hips straight back and glide dumbbells along your shins with a flat spine until hamstrings stretch deeply. Drive hips forward to stand.",
    form_cues: ["Push your hips backwards towards the wall", "Keep dumbbells tight against your legs throughout", "Maintain rigid flat back without spinal flexion"]
  },
  {
    id: "home-int-dumbbell-reverse-lunge",
    name: "Dumbbell Reverse Lunge",
    muscle_id: "quads",
    muscle_group: "legs",
    secondary_muscles: ["glutes"],
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 2",
    sets: 3,
    reps: "10 each leg",
    imageUrl: "/exercises/int-dumbbell-reverse-lunge.png",
    instructions: "Hold dumbbells at your sides. Step one leg straight backward and lower your hips until both knees form roughly 90-degree angles. Drive through the front heel to return to standing, then repeat on opposite side.",
    form_cues: ["Keep your torso upright and front knee directly over ankle", "Lower rear knee gently until hovering just above floor", "Drive up explosively through front heel"]
  },
  {
    id: "home-int-dumbbell-calf-raise",
    name: "Dumbbell Calf Raise",
    muscle_id: "calves",
    muscle_group: "calves",
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 2",
    sets: 3,
    reps: "15–20 reps",
    imageUrl: "/exercises/int-dumbbell-calf-raise.png",
    instructions: "Stand tall with feet hip-width holding dumbbells at your sides. Press through the balls of your feet to raise your heels as high as possible. Pause and peak squeeze your calves for 1 second, then lower slowly.",
    form_cues: ["Rise straight up without leaning forward", "Hold the peak contraction for 1 full second", "Lower heels under control to full floor contact"]
  },
  {
    id: "home-int-dumbbell-crunch",
    name: "Dumbbell Crunch",
    muscle_id: "abs",
    muscle_group: "core",
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 2",
    sets: 3,
    reps: "12–15 reps",
    imageUrl: "/exercises/int-dumbbell-crunch.png",
    instructions: "Lie on your back with knees bent and feet flat. Hold a light dumbbell across your upper chest. Flex your abdominal muscles to raise your shoulder blades off the floor, squeeze at top, and lower with control.",
    form_cues: ["Draw ribcage down toward pelvis rather than lifting neck", "Exhale forcefully on upward crunch", "Keep lower back anchored flat on the floor"]
  },
  {
    id: "home-int-reverse-crunch",
    name: "Reverse Crunch",
    muscle_id: "abs",
    muscle_group: "core",
    equipment: ["bodyweight"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 2",
    sets: 3,
    reps: "12–15 reps",
    imageUrl: "/exercises/int-reverse-crunch.png",
    instructions: "Lie flat on your back with arms at your sides and legs bent at 90 degrees. Contract your lower abs to curl your hips up off the floor toward your chest. Pause briefly and lower hips slowly.",
    form_cues: ["Initiate movement strictly with lower abdominals", "Avoid using momentum or swinging your legs", "Control the lowering phase without slamming hips down"]
  },
  {
    id: "home-int-plank",
    name: "Plank",
    muscle_id: "abs",
    muscle_group: "core",
    equipment: ["bodyweight"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 2",
    sets: 3,
    reps: "30–45 sec",
    imageUrl: "/exercises/int-plank.png",
    instructions: "Place forearms on the floor with elbows directly under shoulders. Extend your legs straight back onto your toes. Maintain a rigid straight line from your head to your heels while bracing your core.",
    form_cues: ["Squeeze glutes and abdominals as hard as possible", "Do not let lower back sag or hips hike into the air", "Keep neck neutral with gaze directed at the floor"]
  },

  // Day 3 – Back + Biceps
  {
    id: "home-int-bent-over-dumbbell-row",
    name: "Bent-Over Dumbbell Row",
    muscle_id: "lats",
    muscle_group: "back",
    secondary_muscles: ["traps", "biceps"],
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 3",
    sets: 3,
    reps: "10–12 reps",
    imageUrl: "/exercises/int-bent-over-dumbbell-row.png",
    instructions: "Stand with feet shoulder-width, hinge at your hips until torso is roughly 45 degrees to the floor. Hold dumbbells with arms extended downward. Row the dumbbells toward your lower ribs, squeezing shoulder blades together.",
    form_cues: ["Keep spine flat and core braced throughout", "Pull elbows straight back toward your hips", "Pause and contract back muscles hard at peak elevation"]
  },
  {
    id: "home-int-single-arm-dumbbell-row",
    name: "Single-Arm Dumbbell Row",
    muscle_id: "lats",
    muscle_group: "back",
    secondary_muscles: ["biceps"],
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 3",
    sets: 3,
    reps: "10–12 each side",
    imageUrl: "/exercises/int-single-arm-dumbbell-row.png",
    instructions: "Support one hand and knee on a sturdy chair or bench, torso flat and parallel to floor. Hold a dumbbell in opposite hand. Pull dumbbell upward toward your hip crease, squeezing your lat at top, then lower smoothly.",
    form_cues: ["Keep torso stationary without rotating shoulders", "Drive your elbow up and back towards your pocket", "Get a full lat stretch at bottom extension"]
  },
  {
    id: "home-int-dumbbell-reverse-fly",
    name: "Dumbbell Reverse Fly",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    secondary_muscles: ["traps"],
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 3",
    sets: 3,
    reps: "12–15 reps",
    imageUrl: "/exercises/int-dumbbell-reverse-fly.png",
    instructions: "Hinge forward at the hips with a flat back and a slight bend in your knees. Holding light dumbbells with elbows slightly bent, raise your arms out to the sides until elbows align with shoulders. Squeeze rear delts and lower slowly.",
    form_cues: ["Lead the movement with elbows pulling wide", "Do not shrug shoulders up toward your ears", "Focus strictly on rear deltoids and rhomboid contraction"]
  },
  {
    id: "home-int-dumbbell-pullover",
    name: "Dumbbell Pullover",
    muscle_id: "lats",
    muscle_group: "back",
    secondary_muscles: ["chest"],
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 3",
    sets: 2,
    reps: "12 reps",
    imageUrl: "/exercises/int-dumbbell-pullover.png",
    instructions: "Lie on the floor or bench with knees bent. Hold one dumbbell with both hands cupping the upper plate directly above your chest. Keeping arms slightly bent, reach the dumbbell back over your head until you feel a deep lat stretch, then pull through lats to return.",
    form_cues: ["Maintain a slight fixed elbow bend throughout", "Feel the lats and serratus stretch overhead", "Pull with your back muscles to bring weight back over chest"]
  },
  {
    id: "home-int-dumbbell-biceps-curl",
    name: "Dumbbell Biceps Curl",
    muscle_id: "biceps",
    muscle_group: "arms",
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 3",
    sets: 3,
    reps: "10–12 reps",
    imageUrl: "/exercises/int-dumbbell-biceps-curl.png",
    instructions: "Stand tall with dumbbells hanging at your sides. Curl the dumbbells upward while supinating your forearms so palms face your shoulders at top. Squeeze biceps hard for 1 second, then lower under strict control.",
    form_cues: ["Pin your elbows against your ribs throughout the curl", "Supinate wrists fully at peak height", "Resist the descent over 2-3 seconds"]
  },
  {
    id: "home-int-dumbbell-hammer-curl",
    name: "Dumbbell Hammer Curl",
    muscle_id: "biceps",
    muscle_group: "arms",
    secondary_muscles: ["forearms"],
    equipment: ["dumbbell"],
    level: "intermediate",
    location: "home",
    routine_type: "home_dumbbell_intermediate",
    day: "Day 3",
    sets: 3,
    reps: "10–12 reps",
    imageUrl: "/exercises/int-dumbbell-hammer-curl.png",
    instructions: "Stand upright holding dumbbells with a neutral grip (palms facing each other). Keeping upper arms locked at your sides, curl the dumbbells upward to shoulder height. Squeeze brachialis and forearms, then lower smoothly.",
    form_cues: ["Maintain strict neutral palm orientation throughout", "Keep elbows stationary without swinging forward", "Control the eccentric descent for maximum forearm overload"]
  }
,
  // ==========================================
  // 6. Intermediate – At Home (No Equipment) [9 EXERCISES FROM USER PHOTOS]
  // ==========================================
  {
    id: "home-int-bw-standard-push-up",
    name: "Standard Push-up",
    muscle_id: "chest",
    muscle_group: "chest",
    secondary_muscles: ["triceps", "shoulders"],
    equipment: ["bodyweight"],
    level: "intermediate",
    location: "home",
    routine_type: "home_bodyweight_intermediate",
    sets: 3,
    reps: "10–15 reps",
    imageUrl: "/exercises/int-bw-standard-push-up.png",
    instructions: "Set up in a standard high plank with hands slightly wider than shoulder-width and body forming a straight line. Lower chest until it nearly touches the floor, keep elbows at 45 degrees, and press forcefully back up to full extension.",
    form_cues: ["Maintain rigid straight line from head to heels", "Brace core and squeeze glutes", "Lower until chest is an inch off the floor"]
  },
  {
    id: "home-int-bw-pike-push-up",
    name: "Pike Push-up",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    secondary_muscles: ["triceps"],
    equipment: ["bodyweight"],
    level: "intermediate",
    location: "home",
    routine_type: "home_bodyweight_intermediate",
    sets: 3,
    reps: "8–12 reps",
    imageUrl: "/exercises/int-bw-pike-push-up.png",
    instructions: "Start in a push-up position, then walk your feet forward and hike hips high into an inverted V (pike) position. Lower the crown of your head diagonally forward toward the floor between your hands, then press back through your shoulders.",
    form_cues: ["Keep hips high and back flat", "Lower head forward of hands in a tripod shape", "Drive up through palms targeting front delts"]
  },
  {
    id: "home-int-bw-bodyweight-squat",
    name: "Bodyweight Squat",
    muscle_id: "quads",
    muscle_group: "legs",
    secondary_muscles: ["glutes"],
    equipment: ["bodyweight"],
    level: "intermediate",
    location: "home",
    routine_type: "home_bodyweight_intermediate",
    sets: 3,
    reps: "15 reps",
    imageUrl: "/exercises/int-bw-bodyweight-squat.png",
    instructions: "Stand tall with feet shoulder-width apart, arms extended forward for balance. Hinge back at your hips and bend your knees to squat down until your thighs are parallel to the ground. Drive through your heels to return to standing.",
    form_cues: ["Keep chest proud and spine neutral", "Track knees in line with your toes", "Push through midfoot and squeeze glutes at the top"]
  },
  {
    id: "home-int-bw-standing-calf-raise",
    name: "Standing Calf Raise",
    muscle_id: "calves",
    muscle_group: "calves",
    equipment: ["bodyweight"],
    level: "intermediate",
    location: "home",
    routine_type: "home_bodyweight_intermediate",
    sets: 3,
    reps: "15–20 reps",
    imageUrl: "/exercises/int-bw-standing-calf-raise.png",
    instructions: "Stand upright with feet hip-width apart on a flat surface. Press evenly through the balls of your feet to raise your heels as high as possible. Pause and peak squeeze your calves for 1 full second, then lower slowly.",
    form_cues: ["Rise straight up without leaning forward", "Hold the peak contraction for 1 full second", "Lower heels down under control"]
  },
  {
    id: "home-int-bw-crunches",
    name: "Crunches",
    muscle_id: "abs",
    muscle_group: "core",
    equipment: ["bodyweight"],
    level: "intermediate",
    location: "home",
    routine_type: "home_bodyweight_intermediate",
    sets: 3,
    reps: "15 reps",
    imageUrl: "/exercises/int-bw-crunches.png",
    instructions: "Lie on your back with knees bent and feet flat on the mat. Place your fingertips lightly behind your ears or head. Flex your abdominal muscles to raise your shoulder blades off the floor, exhale at the apex, then lower under control.",
    form_cues: ["Do not yank your neck or pull with your hands", "Focus on shortening the distance between ribs and hips", "Keep movement slow and deliberate"]
  },
  {
    id: "home-int-bw-reverse-crunches",
    name: "Reverse Crunches",
    muscle_id: "abs",
    muscle_group: "core",
    equipment: ["bodyweight"],
    level: "intermediate",
    location: "home",
    routine_type: "home_bodyweight_intermediate",
    sets: 3,
    reps: "12 reps",
    imageUrl: "/exercises/int-bw-reverse-crunches.png",
    instructions: "Lie flat on your back with hands pressed into the floor beside you and knees bent at 90 degrees. Contract your lower abdominals to curl your pelvis off the floor, bringing knees toward your chest. Lower slowly without arching your lower back.",
    form_cues: ["Initiate movement strictly with lower abs", "Avoid swinging legs or using momentum", "Control the descent back to starting position"]
  },
  {
    id: "home-int-bw-glute-bridge",
    name: "Glute Bridge",
    muscle_id: "glutes",
    muscle_group: "glutes",
    secondary_muscles: ["hamstrings"],
    equipment: ["bodyweight"],
    level: "intermediate",
    location: "home",
    routine_type: "home_bodyweight_intermediate",
    sets: 3,
    reps: "15 reps",
    imageUrl: "/exercises/int-bw-glute-bridge.png",
    instructions: "Lie on your back with knees bent and feet flat hip-width apart. Drive through your heels to lift your hips toward the ceiling until knees, hips, and shoulders form a straight line. Squeeze glutes firmly at top, then lower smoothly.",
    form_cues: ["Drive directly through heels", "Squeeze glutes at peak height without hyperextending lumbar spine", "Lower under full muscular control"]
  },
  {
    id: "home-int-bw-side-plank",
    name: "Side Plank",
    muscle_id: "abs",
    muscle_group: "core",
    secondary_muscles: ["obliques"],
    equipment: ["bodyweight"],
    level: "intermediate",
    location: "home",
    routine_type: "home_bodyweight_intermediate",
    sets: 3,
    reps: "20–30 sec/side",
    imageUrl: "/exercises/int-bw-side-plank.png",
    instructions: "Lie on your side with legs straight and feet stacked. Prop your upper body up on your forearm with elbow directly below shoulder. Lift hips off the floor until body forms a straight line from ankles to shoulders. Hold steadily.",
    form_cues: ["Keep hips high and core fully braced", "Shoulder stacked directly over supporting elbow", "Maintain straight alignment without rotating hips forward or back"]
  },
  {
    id: "home-int-bw-chair-tricep-dips",
    name: "Chair Tricep Dips",
    muscle_id: "triceps",
    muscle_group: "arms",
    secondary_muscles: ["chest", "shoulders"],
    equipment: ["bodyweight"],
    level: "intermediate",
    location: "home",
    routine_type: "home_bodyweight_intermediate",
    sets: 2,
    reps: "8–10 reps",
    imageUrl: "/exercises/int-bw-chair-tricep-dips.png",
    instructions: "Sit on the edge of a sturdy chair with hands gripping the front edge beside your hips. Slide hips off the chair with knees bent or extended. Bend elbows to lower your body until upper arms are parallel to the floor, then press through palms to lockout.",
    form_cues: ["Keep back close to the chair edge throughout", "Lower until elbows reach roughly 90 degrees", "Do not allow shoulders to shrug up toward ears"]
  }

];

export const NAHID_FITNESS_EXERCISES = EXERCISES;

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

  const detected = detectInjuries(profile.limitations);
  if (detected.length > 0) {
    const injuryNames = detected.map((i) => i.label).join(", ");
    const hasShoulder = detected.some((i) => i.key === "shoulder");
    const detail = hasShoulder
      ? "You recorded a shoulder injury. Avoid push-ups, dumbbell shoulder presses, and barbell bench presses as they strain the rotator cuff and shoulder joint. Focus on lower body (squats, leg press) and core movements (glute bridges) until cleared by a doctor."
      : `You recorded: "${profile.limitations}". We have flagged and filtered exercises in the library that place high mechanical stress on your ${injuryNames}. Review Exercise Library for safe alternatives.`;
    items.push({
      id: "injury-adaptation",
      category: "workout",
      title: `Exercise adaptations for your ${injuryNames} injury`,
      detail,
      reason: `Your profile indicates physical limitations: "${profile.limitations}".`,
    });
  }

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
};
