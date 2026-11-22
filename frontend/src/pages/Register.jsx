import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Please enter a valid email address.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate("/profile"); // next step: fill in the fitness profile
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card narrow">
      <h1>Create account</h1>
      <form onSubmit={onSubmit} noValidate>
        <label>Name
          <input name="name" value={form.name} onChange={change} autoComplete="name" />
        </label>
        <label>Email
          <input name="email" type="email" value={form.email} onChange={change} autoComplete="email" />
        </label>
        <label>Password (at least 8 characters)
          <input name="password" type="password" value={form.password} onChange={change} autoComplete="new-password" />
        </label>
        <label>Confirm password
          <input name="confirm" type="password" value={form.confirm} onChange={change} autoComplete="new-password" />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? "Creating..." : "Register"}</button>
      </form>
      <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
