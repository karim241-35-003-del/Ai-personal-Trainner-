import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";

const BADGE = {
  weakness: { text: "Weak point", cls: "badge-weakness" },
  adjustment: { text: "Plan change", cls: "badge-adjustment" },
  info: { text: "Info", cls: "badge-info" },
};

export default function Recommendations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getRecommendations()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Checking your workout history...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h1>Recommendations</h1>
      <p className="muted">
        Based on your workout log, body weight and profile. Every item shows why it was suggested.
        Add more data in the <Link to="/workouts">workout log</Link> and <Link to="/progress">progress</Link> pages to keep it accurate.
      </p>

      {items.map((r) => {
        const b = BADGE[r.type] ?? BADGE.info;
        return (
          <div className="card rec" key={r.id}>
            <span className={`badge ${b.cls}`}>{b.text}</span>
            <h2>{r.title}</h2>
            <p><strong>Why:</strong> {r.reason}</p>
          </div>
        );
      })}

      <p className="notice">
        These are general fitness suggestions, not medical advice. If something hurts or you have a health
        condition, stop and talk to a doctor or a certified trainer.
      </p>
      <p className="muted">Recommendations from exercise form scores will be added after photo form analysis is built.</p>
    </div>
  );
}
