// One place for all choices shown in the forms.
// If the team changes a rule, change it here.

export const ACTIVITY_LEVELS = [
  // "factor" is used ONLY by the demo (mock) mode. The real backend owns the formula.
  { value: "sedentary", label: "Sedentary (little to no exercise)", factor: 1.2 },
  { value: "light", label: "Lightly active (exercise 1-3 days/week)", factor: 1.375 },
  { value: "moderate", label: "Moderately active (exercise 3-5 days/week)", factor: 1.55 },
  { value: "very", label: "Very active (exercise 6-7 days/week)", factor: 1.725 },
  { value: "super", label: "Super active (training twice a day)", factor: 1.9 },
];

export const GOALS = [
  { value: "lose", label: "Weight loss (Subtract 300 to 500 calories from TDEE)" },
  { value: "maintain", label: "Weight maintain (Same as TDEE)" },
  { value: "gain", label: "Weight gain (Add 200 to 500 calories to TDEE)" },
];

export const FITNESS_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
];

export const LOCATIONS = [
  { value: "home", label: "At home" },
  { value: "gym", label: "At a gym" },
];

export const EQUIPMENT = [
  { value: "bodyweight", label: "No equipment (bodyweight only)" },
  { value: "dumbbell", label: "Dumbbells" },
  { value: "gym_machines", label: "Gym machines" },
];

// TODO (team decision): these limits are placeholders. Decide the minimum age
// (the calorie formula is meant for healthy adults) and keep backend in sync.
export const LIMITS = {
  age: { min: 18, max: 80 },
  height: { min: 100, max: 250 },
  weight: { min: 30, max: 300 },
};

// Workout log limits (placeholders, same status as LIMITS above).
export const WORKOUT_LIMITS = {
  sets: { min: 1, max: 20 },
  reps: { min: 1, max: 100 },
  weight_kg: { min: 0, max: 500 },
};

// Form check photo rules.
export const PHOTO_MAX_MB = 5;

// Body weight log limits (placeholder, same status as LIMITS above).
export const WEIGHT_LIMITS = { min: 30, max: 300 };
