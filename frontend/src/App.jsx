import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ExerciseLibrary from "./pages/ExerciseLibrary.jsx";
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
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/exercises" element={<ProtectedRoute><ExerciseLibrary /></ProtectedRoute>} />
          <Route path="/form-check" element={<ProtectedRoute><FormCheck /></ProtectedRoute>} />
          <Route path="/workouts" element={<ProtectedRoute><WorkoutLog /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
