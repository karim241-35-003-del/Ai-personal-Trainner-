// One place for all choices shown in the forms.
// If the team changes a rule, change it here.

export const ACTIVITY_LEVELS = [
  // "factor" is used ONLY by the demo (mock) mode. The real backend owns the formula.
  { value: "sedentary", label: "Little or no exercise", factor: 1.2 },
  { value: "light", label: "Light exercise, 1-3 days/week", factor: 1.375 },
  { value: "moderate", label: "Moderate exercise, 3-5 days/week", factor: 1.55 },
  { value: "very", label: "Hard exercise, 6-7 days/week", factor: 1.725 },
  { value: "super", label: "Very hard exercise or training twice a day", factor: 1.9 },
];

export const GOALS = [
  { value: "lose", label: "Lose weight" },
  { value: "maintain", label: "Maintain weight" },
  { value: "gain", label: "Gain muscle / weight" },
];

export const FITNESS_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const LOCATIONS = [
  { value: "home", label: "At home" },
  { value: "gym", label: "At a gym" },
];

export const EQUIPMENT = [
  { value: "bodyweight", label: "No equipment (bodyweight only)" },
  { value: "dumbbell", label: "Dumbbells" },
  { value: "barbell", label: "Barbell" },
  { value: "gym_machines", label: "Gym machines" },
];

// TODO (team decision): these limits are placeholders. Decide the minimum age
// (the calorie formula is meant for healthy adults) and keep backend in sync.
export const LIMITS = {
  age: { min: 18, max: 80 },
  height: { min: 100, max: 250 },
  weight: { min: 30, max: 300 },
};

// Exercises used by the workout log. "group" is used by the recommendations
// (to notice a muscle group that was not trained for a while).
export const EXERCISES = [
  { value: "squat", label: "Squat", group: "legs" },
  { value: "lunge", label: "Lunge", group: "legs" },
  { value: "deadlift", label: "Deadlift", group: "back" },
  { value: "bent_row", label: "Bent-over row", group: "back" },
  { value: "pull_up", label: "Pull-up", group: "back" },
  { value: "bench_press", label: "Bench press", group: "chest" },
  { value: "push_up", label: "Push-up", group: "chest" },
  { value: "overhead_press", label: "Overhead press", group: "shoulders" },
  { value: "bicep_curl", label: "Bicep curl", group: "arms" },
  { value: "sit_up", label: "Sit-up", group: "core" },
];

export const MUSCLE_GROUPS = {
  legs: "Legs", back: "Back", chest: "Chest", shoulders: "Shoulders", arms: "Arms", core: "Core",
};

// TODO (team decision): placeholder limits for the log forms. Keep backend in sync.
export const LOG_LIMITS = {
  sets: { min: 1, max: 20 },
  reps: { min: 1, max: 100 },
  weight: { min: 0, max: 500 },      // kg, 0 means bodyweight only
  bodyWeight: { min: 30, max: 300 }, // kg
};
