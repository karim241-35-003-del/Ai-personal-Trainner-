# API contract (frontend <-> backend)

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

---

## Workout log, progress and recommendations

All endpoints need the header `Authorization: Bearer <token>`. A user can only see and change their own data.
Dates are `YYYY-MM-DD`. Return lists newest first where it makes sense. Errors use `{ "detail": "message" }`.

### GET /workouts
Returns `[{ id, date, exercise, sets, reps, weight }]`.

### POST /workouts
Body: `{ date, exercise, sets, reps, weight }`. Returns the saved entry (with `id`).
- `exercise` is one of: squat, lunge, deadlift, bent_row, pull_up, bench_press, push_up, overhead_press, bicep_curl, sit_up
- `sets` 1-20 (whole number), `reps` 1-100 (whole number), `weight` 0-500 kg (0 = bodyweight)
- `date` must not be in the future. Placeholder limits: keep in sync with `LOG_LIMITS` in `src/constants.js`.

### DELETE /workouts/{id}
Returns 204. 404 if the entry is not the user's.

### GET /body-weights
Returns `[{ id, date, weight }]`.

### POST /body-weights
Body: `{ date, weight }` (weight 30-300 kg). One entry per day: saving the same date again replaces it. Returns the saved entry.

### DELETE /body-weights/{id}
Returns 204.

### GET /recommendations
Returns `[{ id, type, title, reason }]`, weak points first.
- `type`: `weakness` (a problem found), `adjustment` (change the plan), or `info`
- `reason` is always filled so the user can see why it was suggested (FR-17)

The frontend demo (`src/api/mock.js`, function `computeRecommendations`) uses these rules. The backend should
implement the same rules so both behave the same:
1. No workout in the last 7 days -> weakness. Fewer training days than `days_per_week` -> adjustment.
2. A muscle group not trained in the last 14 days (only when there are 2 or more training days) -> weakness.
3. Per exercise: latest session is more than 20% lower than the one before -> weakness. Same top weight for
   3 sessions in a row -> adjustment (try about 2.5 kg more or 1-2 extra reps).
4. Body weight trend over 14 days against the goal (lose/gain/maintain) -> adjustment.
5. Nothing found -> one `info` item.

Progress charts and the week-versus-week table are calculated in the frontend from `/workouts` and `/body-weights`
(`src/utils/progress.js`). Form-score progress and form-based recommendations come later with photo analysis.
