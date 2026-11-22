import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const onLogout = () => { logout(); navigate("/login"); };

  return (
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
  );
}
