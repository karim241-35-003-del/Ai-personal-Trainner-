# Frontend: AI Personal Trainer (React + Vite)

এই zip-এ ৪টা page আছে: **Login, Register, Profile, Dashboard**।
Backend এখনো নেই, তাই app এখন **Demo mode**-এ চলে (সব data তোমার browser-এই থাকে)।

## চালানোর ধাপ (VS Code, Windows)

1. **Node.js LTS** install করো (nodejs.org)। Terminal-এ `node --version` দিলে 18 বা তার বেশি আসতে হবে।
2. Zip খুলে `frontend` folder VS Code-এ খোলো (File > Open Folder)।
3. VS Code-এ Terminal > New Terminal, তারপর:
   ```
   npm install
   npm run dev
   ```
4. Browser-এ http://localhost:5173 খোলো।

## নিজে পরীক্ষা করে দেখো

1. Register করো (password কমপক্ষে ৮ অক্ষর) -> Profile page আসবে।
2. এই তথ্য দাও: পুরুষ, বয়স 22, উচ্চতা 170, ওজন 70, Activity "Moderate", Goal "Gain".
3. Save করলে Dashboard-এ এগুলো দেখা উচিত: **Calories 2919, Protein 105 to 140 g, BMI 24.2**।
4. আরেকটা: নারী, 22, 160 cm, 60 kg, "Light", "Maintain" -> **1827 kcal, 90 to 120 g**।
5. Logout করে ভুল password দিলে error আসা উচিত। একই email-এ আবার register করলেও error আসা উচিত।

## আসল backend-এর সাথে জোড়া

1. `.env.example` কপি করে নাম দাও `.env`, ভেতরে `VITE_USE_MOCK=false` করো।
2. Backend চালাও port **8000**-এ (vite নিজে `/api` সেখানে পাঠিয়ে দেয়)।
3. Backend-কে `API_CONTRACT.md`-এর সাথে মিলিয়ে বানাতে হবে।

## GitHub-এ দেওয়ার সময়

- `npm install`-এর পর `package-lock.json` তৈরি হবে। ওটা **commit করো** (এই zip-এ নেই, কারণ আমি offline ছিলাম)।
- `.env` কখনো commit করো না। `node_modules` যাবে না (`.gitignore`-এ আছে)।

## এখনো ঠিক হয়নি (আন্দাজে বসাইনি)

- Weight loss -400 আর gain +350: trainer-এর নোটে range আছে (loss 300-500, gain 200-500), এই দুটো সংখ্যা **placeholder**। `src/api/mock.js`-এ `GOAL_ADJUST`।
- **সর্বনিম্ন নিরাপদ calorie:** এখন নেই। ফলে ছোট ওজনের কম-ব্যায়ামকারী কেউ loss বেছে নিলে খুব কম target আসতে পারে (যেমন 60 kg নারী, sedentary, loss -> প্রায় 1147)। Trainer-কে জিজ্ঞেস করো, তারপর `MIN_DAILY_CALORIES` বসাও।
- বয়সের সীমা 18-80 **placeholder** (`src/constants.js`)।
- BMI-র শ্রেণি (underweight, normal, overweight, obese) সাধারণ প্রচলিত সীমা। এটা trainer-এর নোটে নেই।
- Login token `localStorage`-এ থাকে (সহজ, কিন্তু httpOnly cookie বেশি নিরাপদ)। সিদ্ধান্ত নিতে হবে।
- UI এখন ইংরেজিতে।

## ফোল্ডার

```
src/pages/        Login, Register, Profile, Dashboard
src/api/          client.js (backend ডাক), mock.js (demo mode)
src/context/      AuthContext.jsx (login অবস্থা)
src/components/   Navbar, ProtectedRoute
src/constants.js  সব dropdown ও সীমা এক জায়গায়
```

---

## নতুন পেজ: Workout Log, Progress, Recommendations

- **Workout log** (`/workouts`): exercise, sets, reps, weight যোগ করা ও মোছা (FR-12)।
- **Progress** (`/progress`): body weight chart, এই সপ্তাহ বনাম গত সপ্তাহ, সাপ্তাহিক volume chart, personal best (FR-13, FR-14)।
- **Recommendations** (`/recommendations`): দুর্বলতা খোঁজা ও plan পরিবর্তনের পরামর্শ, প্রতিটার কারণসহ (FR-15, FR-16, FR-17)।

Demo mode-এ সব data browser-এই থাকে। Chart-এর জন্য কোনো নতুন package লাগে না, তাই আবার `npm install` দরকার নেই (প্রথমবার চালালে একবার করতে হবে)।
Backend-এর endpoint ও rule `API_CONTRACT.md`-এর নিচের অংশে আছে।
