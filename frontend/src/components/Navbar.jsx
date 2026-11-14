import { NavLink } from "react-router-dom";
import { USE_MOCK } from "../api/client.js";

export default function Navbar() {
  return (
    <>
      {USE_MOCK && (
        <div className="demo-bar">
          Demo mode: data is saved only in this browser (no backend connected).
        </div>
      )}
      <nav className="nav">
        <span className="brand">AI Personal Trainer</span>
        <div className="nav-links">
          <NavLink to="/form-check">Form check</NavLink>
          <NavLink to="/workouts">Workout log</NavLink>
          <NavLink to="/progress">Progress</NavLink>
          <NavLink to="/recommendations">Tips</NavLink>
        </div>
      </nav>
    </>
  );
}
