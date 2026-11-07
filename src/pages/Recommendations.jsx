// This part was developed by Arik Abrar but committed by a teammate due to a GitHub repository structure loss issue.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import "../styles/progress-pages.css";

export default function Recommendations() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRecommendations()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your recommendations...</p>;
  if (error) return <p className="error">{error}</p>;

  if (!data) {
    return (
      <div className="card narrow">
        <h1>Recommendations</h1>
        <p>Fill in your fitness profile first, then personal tips will appear here.</p>
        <Link className="btn" to="/profile">Complete my profile</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Recommendations</h1>
      <p className="muted">Tips based on your profile, workouts and weight.</p>
      {data.demo && (
        <p className="notice">Demo mode: these tips come from simple sample rules, not the real adaptive engine.</p>
      )}

      {data.summary && (
        <div className="card">
          <h2>Why this plan?</h2>
          <p style={{ margin: 0 }}>{data.summary}</p>
        </div>
      )}

      {data.items.length === 0 ? (
        <p className="empty">No recommendations right now.</p>
      ) : (
        <div className="rec-list">
          {data.items.map((r) => (
            <article className={`rec cat-${r.category}`} key={r.id}>
              <h2>{r.title}</h2>
              <p>{r.detail}</p>
              <p className="why">Why: {r.reason}</p>
            </article>
          ))}
        </div>
      )}

      <p className="notice">
        This is general fitness guidance, not medical advice. Stop if you feel pain, and talk to a doctor if you
        have an injury or health condition.
      </p>
    </div>
  );
}
