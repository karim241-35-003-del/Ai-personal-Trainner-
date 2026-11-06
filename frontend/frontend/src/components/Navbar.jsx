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
        <span className="brand">AI Personal Trainer</span>
        <div className="nav-links">
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/profile">Profile</NavLink>
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
