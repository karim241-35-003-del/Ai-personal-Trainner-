// This part was developed by Asif karim alif but committed by a teammate due to a GitHub repository structure loss issue.# API contract (frontend <-> backend)

The frontend already calls these endpoints. Build the backend to match, so that
switching `VITE_USE_MOCK=false` just works. Base path: `/api`. All bodies are JSON.

Errors: return a non-2xx status and `{ "detail": "short message" }`.
`401` on a missing/invalid token (the frontend then sends the user to /login).
`404` when the thing does not exist yet (profile / plan before the profile is saved).

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | /auth/register | no | `{name, email, password}` | `{access_token, token_type:"bearer", user:{name,email}}` |
| POST | /auth/login | no | `{email, password}` | same as register |
| GET | /profile | JWT | - | profile object, or 404 |
| PUT | /profile | JWT | profile object | saved profile object |
| GET | /nutrition-plan | JWT | - | plan object, or 404 |
| GET | /exercises | JWT | - | list of exercise objects (see below) |
| POST | /form-check | JWT | multipart: `exercise_id` (text), `file` (image, JPG/PNG, max 5 MB) | form-check result (see below); `422` with `detail` if no body is found in the photo |
| GET | /workouts | JWT | - | list of workout entries, newest date first |
| POST | /workouts | JWT | `{date:"YYYY-MM-DD", exercise_id, sets, reps, weight_kg, notes}` | saved entry (with `id` and `exercise_name`) |
| DELETE | /workouts/{id} | JWT | - | `204` no body; `404` if not this user's entry |

Token is sent as `Authorization: Bearer <token>`.

## Profile object
```json
{
  "age": 22, "sex": "male", "height": 170, "weight": 70,
  "activity": "sedentary|light|moderate|very|super",
  "goal": "lose|maintain|gain",
  "fitness_level": "beginner|intermediate|advanced",
  "days_per_week": 3,
  "location": "home|gym",
  "equipment": ["bodyweight", "dumbbell", "barbell", "gym_machines"],
  "limitations": "free text, may be empty"
}
```

## Nutrition plan object (the backend owns the formula)
```json
{
  "bmi": 24.2, "bmi_category": "Normal",
  "bmr": 1658, "tdee": 2569,
  "daily_calorie_target": 2919,
  "protein_min_g": 105, "protein_max_g": 140,
  "goal": "gain"
}
```

## Rules to implement (from the trainer's notes)
- BMR (Mifflin-St Jeor): men `10*kg + 6.25*cm - 5*age + 5`, women `... - 161`.
- TDEE = BMR x factor: sedentary 1.2, light 1.375, moderate 1.55, very 1.725, super 1.9.
- Goal: maintain = TDEE; lose = subtract 300 to 500; gain = add 200 to 500.
  The demo uses lose -400 and gain +350 as placeholders. Team must confirm the numbers.
- Protein: `activity == sedentary` -> 1 g/kg. Otherwise 1.5 to 2 g/kg (min and max).
- Open: lowest safe daily calories (ask the trainer). Open: minimum age.

Check values (use them in pytest):
- male, 22, 170 cm, 70 kg, moderate, gain -> BMR 1658, TDEE 2569, target 2919, protein 105-140.
- female, 22, 160 cm, 60 kg, light, maintain -> BMR 1329, TDEE 1827, target 1827, protein 90-120.

## Exercise object (GET /exercises, from data/exercises.json)
```json
{
  "id": "push-up", "name": "Push-up", "muscle_group": "chest",
  "equipment": ["bodyweight"], "level": "beginner|intermediate|advanced",
  "instructions": "one short paragraph",
  "form_cues": ["Keep your body straight", "Elbows about 45 degrees"]
}
```
The frontend filters by `equipment` against the profile. `bodyweight` is always treated as available.
The demo list in `src/api/mock.js` (`EXERCISES`) has the same shape. Use the same ids.

## Form-check result (POST /form-check)
```json
{
  "exercise_id": "push-up", "exercise_name": "Push-up", "score": 68,
  "good_points": ["Torso stays steady"],
  "issues": [{ "body_part": "Knees", "message": "Knees move inward at the bottom." }]
}
```
- `score` is 0 to 100. The frontend shows "Good form" at 80+, "Needs some work" at 50 to 79, and "Poor form" below 50 (placeholder cut-offs, team to confirm).
- The photo is analysed with MediaPipe pose (`services/pose/`). The demo does not analyse photos.
- Store nothing about the photo except what the user needs later. Uploads go to `uploads/`, which is git-ignored.

## Workout entry (GET/POST /workouts)
```json
{ "id": "123", "date": "2026-11-06", "exercise_id": "push-up", "exercise_name": "Push-up",
  "sets": 3, "reps": 10, "weight_kg": 0, "notes": "" }
```
Limits (`WORKOUT_LIMITS` in `constants.js`, placeholders): sets 1-20, reps 1-100, weight 0-500 kg.

## Progress and recommendations (added for Progress.jsx / Recommendations.jsx)

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | /progress/weights | JWT | - | list of weight entries |
| POST | /progress/weights | JWT | `{date:"YYYY-MM-DD", weight_kg}` | saved entry `{id, date, weight_kg}` |
| DELETE | /progress/weights/{id} | JWT | - | `204`; `404` if not this user's entry |
| GET | /recommendations | JWT | - | recommendations object, or `404` if no profile yet |

Weight limit 30-300 kg (`WEIGHT_LIMITS`, placeholder). Weekly training charts are computed in the
frontend from `GET /workouts`, so there is no separate endpoint for them.

```json
{
  "summary": "Short 'why this plan' text (FR-17), template-based.",
  "items": [
    { "id": "more-sessions", "category": "workout|nutrition|form|general",
      "title": "Try to hit your weekly sessions",
      "detail": "What to do.", "reason": "Why we say this." }
  ]
}
```
