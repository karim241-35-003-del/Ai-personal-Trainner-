import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { PHOTO_MAX_MB } from "../constants.js";
import { detectInjuries, getExerciseContraindication } from "../utils/injuryRules.js";
import "../styles/trainer-pages.css";

// TEAM DECISION placeholder: score cut-offs for the verdict text. Set with the trainer.
function verdictFor(score) {
  if (score >= 80) return { text: "Good form", cls: "verdict-good" };
  if (score >= 50) return { text: "Needs some work", cls: "verdict-ok" };
  return { text: "Poor form. Ask a trainer to watch you in person.", cls: "verdict-bad" };
}

export default function FormCheck() {
  const [exercises, setExercises] = useState([]);
  const [profile, setProfile] = useState(null);
  const [exerciseId, setExerciseId] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getExercises(), api.getProfile()])
      .then(([list, p]) => {
        setExercises(list);
        setProfile(p);
        const injuries = detectInjuries(p?.limitations);
        const safeEx = list.find((e) => !getExerciseContraindication(e.id, injuries).isContraindicated) || list[0];
        if (safeEx) setExerciseId(safeEx.id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const detectedInjuries = useMemo(
    () => detectInjuries(profile?.limitations),
    [profile?.limitations]
  );

  const selectedContraindication = useMemo(
    () => getExerciseContraindication(exerciseId, detectedInjuries),
    [exerciseId, detectedInjuries]
  );

  // Show the chosen photo, and free the preview URL when it changes.
  useEffect(() => {
    if (!file) { setPreview(""); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onFile = (e) => {
    const f = e.target.files?.[0] ?? null;
    setError("");
    setResult(null);
    if (f && !f.type.startsWith("image/")) {
      setError("Please choose an image file (JPG or PNG).");
      setFile(null);
      return;
    }
    if (f && f.size > PHOTO_MAX_MB * 1024 * 1024) {
      setError(`The photo is too big. Please use one under ${PHOTO_MAX_MB} MB.`);
      setFile(null);
      return;
    }
    setFile(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!exerciseId) { setError("Choose an exercise."); return; }
    if (!file) { setError("Choose a photo of yourself doing the exercise."); return; }
    const form = new FormData();
    form.append("exercise_id", exerciseId);
    form.append("file", file);
    setBusy(true);
    try {
      setResult(await api.checkForm(form));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p>Loading exercises...</p>;

  const verdict = result ? verdictFor(result.score) : null;

  return (
    <div>
      <h1>Form check</h1>
      <p className="muted">Upload one photo of yourself doing an exercise. We check your posture and point out what to fix.</p>

      {detectedInjuries.length > 0 && (
        <div className="safety-banner">
          <strong>⚠️ Injury Notice</strong>
          <p>
            Your profile indicates: <em>&ldquo;{profile.limitations}&rdquo;</em>.
            Exercising with improper form or doing contraindicated exercises can worsen your {detectedInjuries.map((i) => i.label).join(", ")} injury.
          </p>
        </div>
      )}

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
          <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
            {exercises.map((x) => {
              const contra = getExerciseContraindication(x.id, detectedInjuries);
              return (
                <option key={x.id} value={x.id}>
                  {x.name}{contra.isContraindicated ? ` ⚠️ (Not recommended - ${contra.matchedInjuries.join(", ")} injury)` : ""}
                </option>
              );
            })}
          </select>
        </label>

        {selectedContraindication.isContraindicated && (
          <div className="safety-warning-box" style={{ margin: "4px 0 16px" }}>
            <strong>⛔ Exercise Not Recommended: {selectedContraindication.matchedInjuries.join(", ")} injury</strong>
            <p style={{ margin: "2px 0 6px" }}>{selectedContraindication.reason}</p>
            {selectedContraindication.alternatives?.length > 0 && (
              <div>
                <strong>Safe Alternatives to Consider:</strong>
                <ul className="safety-alternatives" style={{ margin: "4px 0 0" }}>
                  {selectedContraindication.alternatives.map((alt) => (
                    <li key={alt}>{alt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <label>Photo (JPG or PNG, up to {PHOTO_MAX_MB} MB)
          <input type="file" accept="image/jpeg,image/png" onChange={onFile} />
        </label>
        {preview && <img className="photo-preview" src={preview} alt="Your selected photo" />}

        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button className="btn" disabled={busy}>{busy ? "Checking your form..." : "Check my form"}</button>
        </div>
      </form>

      {result && (
        <div className="card">
          {result.demo && (
            <p className="notice">Demo mode: this is a sample result. Your photo was not analysed.</p>
          )}
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

          <p className="notice">
            This is general guidance from one photo, not medical advice. Stop the exercise if you feel pain,
            and talk to a doctor if you have an injury.
          </p>
        </div>
      )}
    </div>
  );
}
