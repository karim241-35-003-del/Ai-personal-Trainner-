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
