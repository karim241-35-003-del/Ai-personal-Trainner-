# Merge notes: Progress + Recommendations

Files in this zip (copy into frontend/):
- src/pages/Progress.jsx
- src/pages/Recommendations.jsx
- src/styles/progress-pages.css   (both pages import it)

Small edits needed in the shared files:

1) src/App.jsx
   import Progress from "./pages/Progress.jsx";
   import Recommendations from "./pages/Recommendations.jsx";
   <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
   <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />

2) src/components/Navbar.jsx (inside the logged-in links)
   <NavLink to="/progress">Progress</NavLink>
   <NavLink to="/recommendations">Tips</NavLink>

3) src/constants.js (add at the end)
   export const WEIGHT_LIMITS = { min: 30, max: 300 };

4) src/api/client.js (inside `real`)
   listWeights: () => request("/progress/weights"),
   addWeight: (d) => request("/progress/weights", { method: "POST", body: d }),
   deleteWeight: (id) => request(`/progress/weights/${id}`, { method: "DELETE" }),
   getRecommendations: () => orNull(() => request("/recommendations")),

5) src/api/mock.js (inside `api`, demo mode): listWeights, addWeight, deleteWeight,
   getRecommendations. Copy them, plus buildRecommendations() and weightsKey(),
   from the full frontend-complete.zip.

6) API_CONTRACT.md: add the 4 endpoints (see the full zip).
