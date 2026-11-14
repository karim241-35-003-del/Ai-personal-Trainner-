import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import FormCheck from "./pages/FormCheck.jsx";
import WorkoutLog from "./pages/WorkoutLog.jsx";
import Progress from "./pages/Progress.jsx";
import Recommendations from "./pages/Recommendations.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/form-check" replace />} />
          <Route path="/form-check" element={<FormCheck />} />
          <Route path="/workouts" element={<WorkoutLog />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="*" element={<Navigate to="/form-check" replace />} />
        </Routes>
      </main>
    </>
  );
}
