import { useEffect, useRef, useState } from "react";
import { api } from "../api/client.js";
import { PHOTO_MAX_MB } from "../constants.js";
import "../styles/trainer-pages.css";

// TEAM DECISION placeholder: score bands. Confirm the numbers with the trainer.
// The band describes the score only. It is not a medical judgement.
const BANDS = [
  { min: 80, text: "Good form", cls: "verdict-good" },
  { min: 50, text: "Needs some work", cls: "verdict-ok" },
  { min: 0, text: "Needs a lot of work", cls: "verdict-bad" },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_BYTES = PHOTO_MAX_MB * 1024 * 1024;

// Returns "" when the server's result can be shown, otherwise a message for the user.
function resultProblem(r) {
  const ok = r && typeof r === "object" && typeof r.score === "number" && r.score >= 0 && r.score <= 100;
  return ok ? "" : "The server sent an unexpected result. Please try again.";
}

export default function FormCheck() {
  const fileInput = useRef(null);
  // Each check gets a number. A reply that arrives after the user changed the
  // exercise or photo is ignored, so an old result is never shown for new input.
  const latest = useRef(0);

  const [exercises, setExercises] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [exerciseId, setExerciseId] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getExercises()
      .then((list) => {
        setExercises(list);
        if (list[0]) setExerciseId(list[0].id);
      })
      .catch((err) => setLoadError(err.message || "Could not load the exercise list."))
      .finally(() => setLoading(false));
  }, []);

  // Show the chosen photo; free the preview URL when it changes or the page closes.
  useEffect(() => {
    if (!file) { setPreview(""); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Any change to the inputs invalidates the current result and any pending check.
  const resetOutput = () => {
    latest.current += 1;
    setBusy(false);
    setResult(null);
    setError("");
  };

  const onExercise = (e) => {
    resetOutput();
    setExerciseId(e.target.value);
  };

  const onFile = (e) => {
    const f = e.target.files?.[0] ?? null;
    resetOutput();
    if (!f) { setFile(null); return; }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("This file type is not supported. Please choose a JPG or PNG photo.");
      setFile(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(`This photo is larger than ${PHOTO_MAX_MB} MB. Please choose a smaller one.`);
      setFile(null);
      return;
    }
    setFile(f);
  };

  const clearPhoto = () => {
    resetOutput();
    setFile(null);
    if (fileInput.current) fileInput.current.value = ""; // lets the same file be picked again
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    resetOutput();
    if (!exerciseId) { setError("Choose an exercise."); return; }
    if (!file) { setError("Choose a photo of yourself doing the exercise."); return; }

    const id = latest.current;
    const form = new FormData();
    form.append("exercise_id", exerciseId);
    form.append("file", file);
    setBusy(true);
    try {
      const data = await api.checkForm(form);
      if (id !== latest.current) return; // the user changed something while we waited
      const problem = resultProblem(data);
      if (problem) setError(problem);
      else setResult(data);
    } catch (err) {
      if (id !== latest.current) return;
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      if (id === latest.current) setBusy(false);
    }
  };

  if (loading) return <p>Loading exercises...</p>;

  const band = result ? BANDS.find((b) => result.score >= b.min) : null;
  const goodPoints = result?.good_points ?? [];
  const issues = result?.issues ?? [];

  return (
    <div>
      <h1>Form check</h1>
      <p className="muted">
        Upload one photo of yourself doing an exercise. We look at your posture in that single moment and point out
        what to fix.
      </p>

      <div className="card">
        <h2>How to take a good photo</h2>
        <ul className="tips">
          <li>Stand sideways to the camera, so the side of your body faces it. The whole body, head to feet, must be in the frame.</li>
          <li>Take the photo at the position you want checked, such as the bottom of a squat or the top of a press.</li>
          <li>Use even light and keep the phone at about waist height.</li>
          <li>Wear fitted clothes so your joints are easy to see.</li>
          <li>iPhone: upload JPG or PNG only. To switch the camera off HEIC, go to Settings &gt; Camera &gt; Formats &gt; Most Compatible.</li>
        </ul>
      </div>

      {loadError && <p className="error card" role="alert">{loadError} Refresh the page to try again.</p>}

      <form className="card" onSubmit={onSubmit} noValidate>
        <label>Exercise
          <select value={exerciseId} onChange={onExercise} disabled={exercises.length === 0}>
            {exercises.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </label>

        <label>Photo (JPG or PNG, up to {PHOTO_MAX_MB} MB)
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png"
            onChange={onFile}
          />
        </label>
        {file && (
          <p className="muted" style={{ marginTop: 0 }}>
            Selected: {file.name}.{" "}
            <button type="button" className="btn-outline" onClick={clearPhoto}>Remove photo</button>
          </p>
        )}
        {preview && <img className="photo-preview" src={preview} alt="Preview of the photo you selected" />}

        {error && <p className="error" role="alert">{error}</p>}
        <div className="form-actions">
          <button className="btn" disabled={busy || exercises.length === 0}>
            {busy ? "Checking your form..." : "Check my form"}
          </button>
          {busy && <span className="muted">This can take a few seconds.</span>}
        </div>
      </form>

      {result && (
        <section className="card" aria-live="polite">
          {result.demo && (
            <p className="notice">Demo mode: this is a sample result. Your photo was not analysed.</p>
          )}
          <h2>Result for {result.exercise_name ?? "this exercise"}</h2>
          <div className="score-box">
            <span className="score-value">{result.score}</span>
            <span className="muted">form score out of 100</span>
            <span className={band.cls}>{band.text}</span>
          </div>

          {goodPoints.length > 0 && (
            <>
              <h2 style={{ marginTop: 16 }}>What you are doing well</h2>
              <ul>{goodPoints.map((g, idx) => <li key={idx}>{g}</li>)}</ul>
            </>
          )}

          <h2 style={{ marginTop: 16 }}>What to fix</h2>
          {issues.length > 0 ? (
            <ul>
              {issues.map((i, idx) => (
                <li key={idx}><strong>{i.body_part}:</strong> {i.message}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">
              No issues were flagged in this photo. One photo shows only one moment of the movement.
            </p>
          )}

          <p className="notice">
            This is general guidance from one photo, not medical advice. Stop the exercise if you feel pain,
            and talk to a doctor if you have an injury.
          </p>
        </section>
      )}
    </div>
  );
}
