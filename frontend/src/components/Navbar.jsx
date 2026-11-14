import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { USE_MOCK } from "../api/client.js";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const onLogout = () => { logout(); navigate("/login"); };

  return (
    <>
      {USE_MOCK && (
        <div className="demo-bar">
          Demo mode: data is saved only in this browser (no backend connected).
        </div>
      )}
      <nav className="nav">
        <NavLink to="/" className="brand" style={{ color: "#ffffff", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span>💪 AI Powered Personal Trainer</span>
        </NavLink>
        <div className="nav-links">
          <NavLink to="/" end>Muscle Map</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <NavLink to="/exercises">Exercises</NavLink>
              <button className="link-btn" onClick={onLogout}>Logout ({user.name})</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
