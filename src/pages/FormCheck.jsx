import { useEffect, useRef, useState } from "react";
import { api, USE_MOCK } from "../api/client.js";
import { PHOTO_MAX_MB } from "../constants.js";
import "../styles/trainer-pages.css";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);

// TEAM DECISION placeholder: score cut-offs for the verdict text. Set with the trainer.
function verdictFor(score) {
  if (score >= 80) return { text: "Good form", cls: "verdict-good" };
  if (score >= 50) return { text: "Needs some work", cls: "verdict-ok" };
  return { text: "Poor form. Ask a trainer to watch you in person.", cls: "verdict-bad" };
}

export default function FormCheck() {
  const [exercises, setExercises] = useState([]);
  const [exerciseId, setExerciseId] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    api.getExercises()
      .then((list) => { setExercises(list); if (list[0]) setExerciseId(list[0].id); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Show the chosen photo, and free the preview URL when it changes.
  useEffect(() => {
    if (!file) { setPreview(""); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const clearInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onExerciseChange = (e) => {
    requestIdRef.current += 1;
    setExerciseId(e.target.value);
    setResult(null);
    setError("");
  };

  const onRemovePhoto = () => {
    requestIdRef.current += 1;
    setFile(null);
    setResult(null);
    setError("");
    clearInput();
  };

  const onFile = (e) => {
    const f = e.target.files?.[0] ?? null;
    requestIdRef.current += 1;
    setError("");
    setResult(null);
    if (f && !ALLOWED_TYPES.has(f.type)) {
      setError("Please choose a JPG or PNG image file.");
      setFile(null);
      clearInput();
      return;
    }
    if (f && f.size > PHOTO_MAX_MB * 1024 * 1024) {
      setError(`The photo is too big. Please use one under ${PHOTO_MAX_MB} MB.`);
      setFile(null);
      clearInput();
      return;
    }
    setFile(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (USE_MOCK) return;
    setError("");
    setResult(null);
    if (!exerciseId) { setError("Choose an exercise."); return; }
    if (!file) { setError("Choose a photo of yourself doing the exercise."); return; }
    const form = new FormData();
    form.append("exercise_id", exerciseId);
    form.append("file", file);
    const reqId = ++requestIdRef.current;
    setBusy(true);
    try {
      const data = await api.checkForm(form);
      if (requestIdRef.current === reqId) setResult(data);
    } catch (err) {
      if (requestIdRef.current === reqId) setError(err.message);
    } finally {
      if (requestIdRef.current === reqId) setBusy(false);
    }
  };

  if (loading) return <p>Loading exercises...</p>;

  const verdict = result ? verdictFor(result.score) : null;

  return (
    <div>
      <h1>Form check</h1>
      <p className="muted">Upload one photo of yourself doing an exercise. We check your posture and point out what to fix.</p>

      {USE_MOCK ? (
        <p className="notice" role="status">
          Form check uses real photo analysis, so it needs the backend running. Turn off demo mode to use it.
        </p>
      ) : (
        <>
          <div className="card">
            <h2>How to take a good photo</h2>
            <ul className="tips">
              <li>Stand side-on to the camera, so the whole body is visible from head to feet.</li>
              <li>Use good light, and keep the phone at waist height.</li>
              <li>Take the photo at the lowest or most difficult point of the movement.</li>
            </ul>
          </div>

          <form className="card" onSubmit={onSubmit} noValidate>
            <label>Exercise
              <select value={exerciseId} onChange={onExerciseChange}>
                {exercises.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </label>
            <label>Photo (JPG or PNG, up to {PHOTO_MAX_MB} MB)
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={onFile} />
            </label>
            {preview && <img className="photo-preview" src={preview} alt="Your selected photo" />}

            {error && <p className="error" role="alert">{error}</p>}
            <div className="form-actions">
              <button className="btn" disabled={busy}>{busy ? "Checking your form..." : "Check my form"}</button>
              {file && (
                <button type="button" className="btn-outline" onClick={onRemovePhoto} disabled={busy}>
                  Remove photo
                </button>
              )}
            </div>
          </form>
        </>
      )}

      {!USE_MOCK && result && (
        <div className="card">
          <h2>Result for {result.exercise_name}</h2>
          <div className="score-box">
            <span className="score-value">{result.score}</span>
            <span className="muted">out of 100</span>
            <span className={verdict.cls}>{verdict.text}</span>
          </div>

          {result.good_points?.length > 0 && (
            <>
              <h2 style={{ marginTop: 16 }}>What you are doing well</h2>
              <ul>{result.good_points.map((g) => <li key={g}>{g}</li>)}</ul>
            </>
          )}

          <h2 style={{ marginTop: 16 }}>What to fix</h2>
          {result.issues?.length ? (
            <ul>
              {result.issues.map((i, idx) => (
                <li key={idx}><strong>{i.body_part}:</strong> {i.message}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">No problems found in this photo.</p>
          )}

          {result.skipped?.length > 0 && (
            <>
              <h2 style={{ marginTop: 16 }}>Skipped joints</h2>
              <ul>
                {result.skipped.map((s, idx) => (
                  <li key={idx}><strong>{s.body_part}:</strong> {s.reason}</li>
                ))}
              </ul>
            </>
          )}

          {result.measurements?.length > 0 && (
            <details className="details-box">
              <summary>Details (raw measurements)</summary>
              <ul>
                {result.measurements.map((m) => (
                  <li key={m.check_id}>
                    <strong>{m.check_id}</strong> ({m.side}): {m.angle_deg}° — target {m.range[0]}°–{m.range[1]}° ({m.status})
                  </li>
                ))}
              </ul>
            </details>
          )}

          <p className="notice" style={{ marginTop: 16 }}>
            {result.disclaimer || "General guidance from one photo, not medical advice."} Stop the exercise if you feel pain,
            and talk to a doctor if you have an injury.
          </p>
        </div>
      )}
    </div>
  );
}
