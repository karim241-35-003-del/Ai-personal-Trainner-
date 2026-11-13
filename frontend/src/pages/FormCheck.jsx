import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { PHOTO_MAX_MB } from "../constants.js";
import "../styles/trainer-pages.css";
import "../styles/form-check.css";

const LOWER_MUSCLES = new Set(["legs", "glutes", "calves", "hamstrings", "quads"]);
const MUSCLE_ORDER = ["chest", "back", "shoulders", "arms", "core", "legs", "glutes"];
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");

function getBodyPart(ex) {
  if (!ex) return "upper";
  if (ex.body_part === "upper" || ex.body_part === "lower") return ex.body_part;
  return LOWER_MUSCLES.has((ex.muscle_group || "").toLowerCase()) ? "lower" : "upper";
}

// Fallback list ensuring all 26 unique exercises are available on Form check even with minimal backend data.
const REQUIRED_EXERCISES = [
  { id: "push-up", name: "Push-up", muscle_group: "chest", body_part: "upper" },
  { id: "assisted-pull-up", name: "Assisted Pull-up", muscle_group: "back", body_part: "upper" },
  { id: "shoulder-press", name: "Dumbbell Shoulder Press", muscle_group: "shoulders", body_part: "upper" },
  { id: "barbell-curl", name: "Barbell Curl", muscle_group: "arms", body_part: "upper" },
  { id: "tricep-pressdown", name: "Tricep Pressdown", muscle_group: "arms", body_part: "upper" },
  { id: "bodyweight-squat", name: "Bodyweight Squat", muscle_group: "legs", body_part: "lower" },
  { id: "machine-chest-press", name: "Machine Chest Press", muscle_group: "chest", body_part: "upper" },
  { id: "pectoral-fly", name: "Pectoral Fly", muscle_group: "chest", body_part: "upper" },
  { id: "decline-chest-press", name: "Decline Chest Press", muscle_group: "chest", body_part: "upper" },
  { id: "machine-shoulder-press", name: "Machine Shoulder Press", muscle_group: "shoulders", body_part: "upper" },
  { id: "dumbbell-side-raise", name: "Dumbbell Side Raise", muscle_group: "shoulders", body_part: "upper" },
  { id: "rope-pressdown", name: "Rope Pressdown", muscle_group: "arms", body_part: "upper" },
  { id: "machine-dips", name: "Machine Dips", muscle_group: "arms", body_part: "upper" },
  { id: "barbell-squat", name: "Barbell Squat", muscle_group: "legs", body_part: "lower" },
  { id: "leg-press", name: "Leg Press", muscle_group: "legs", body_part: "lower" },
  { id: "v-squat", name: "V. Squat", muscle_group: "legs", body_part: "lower" },
  { id: "seated-leg-curl", name: "Seated Leg Curl", muscle_group: "legs", body_part: "lower" },
  { id: "adductor", name: "Adductor", muscle_group: "legs", body_part: "lower" },
  { id: "standing-calf-raise", name: "Standing Calf Raise", muscle_group: "legs", body_part: "lower" },
  { id: "high-row", name: "High Row", muscle_group: "back", body_part: "upper" },
  { id: "low-row", name: "Low Row", muscle_group: "back", body_part: "upper" },
  { id: "dy-row", name: "D.Y. Row", muscle_group: "back", body_part: "upper" },
  { id: "seated-cable-row", name: "Seated Cable Row", muscle_group: "back", body_part: "upper" },
  { id: "face-pull", name: "Face Pull", muscle_group: "shoulders", body_part: "upper" },
  { id: "dumbbell-curl", name: "Dumbbell Curl", muscle_group: "arms", body_part: "upper" },
  { id: "hammer-curl", name: "Hammer Curl", muscle_group: "arms", body_part: "upper" },
];

// TEAM DECISION placeholder: score cut-offs for the verdict text. Set with the trainer.
function verdictFor(score) {
  if (score >= 80) return { text: "Good form", cls: "verdict-good" };
  if (score >= 50) return { text: "Needs some work", cls: "verdict-ok" };
  return { text: "Poor form. Ask a trainer to watch you in person.", cls: "verdict-bad" };
}

export default function FormCheck() {
  const [exercises, setExercises] = useState([]);
  const [bodyPart, setBodyPart] = useState("upper");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [exerciseId, setExerciseId] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("purple-theme");
    return () => document.body.classList.remove("purple-theme");
  }, []);

  useEffect(() => {
    api.getExercises()
      .then((list) => {
        const byId = new Map((list || []).map((ex) => [ex.id, ex]));
        const merged = [...(list || [])];
        for (const req of REQUIRED_EXERCISES) {
          if (!byId.has(req.id)) merged.push(req);
        }
        setExercises(merged);
        const firstUpper = merged.find((ex) => getBodyPart(ex) === "upper") || merged[0];
        if (firstUpper) {
          setBodyPart(getBodyPart(firstUpper));
          setExerciseId(firstUpper.id);
        }
      })
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

  const upperExercises = useMemo(
    () => exercises.filter((ex) => getBodyPart(ex) === "upper"),
    [exercises]
  );
  const lowerExercises = useMemo(
    () => exercises.filter((ex) => getBodyPart(ex) === "lower"),
    [exercises]
  );
  const partExercises = bodyPart === "upper" ? upperExercises : lowerExercises;

  const availableMuscles = useMemo(() => {
    const set = new Set(partExercises.map((ex) => ex.muscle_group).filter(Boolean));
    return [...set].sort((a, b) => {
      const ia = MUSCLE_ORDER.indexOf(a);
      const ib = MUSCLE_ORDER.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [partExercises]);

  const filteredExercises = useMemo(() => {
    if (muscleFilter === "all") return partExercises;
    return partExercises.filter((ex) => ex.muscle_group === muscleFilter);
  }, [partExercises, muscleFilter]);

  const groupedExercises = useMemo(() => {
    const groups = [];
    for (const m of availableMuscles) {
      const items = filteredExercises.filter((ex) => ex.muscle_group === m);
      if (items.length > 0) groups.push({ muscle: m, items });
    }
    return groups;
  }, [availableMuscles, filteredExercises]);

  const selectedExercise = exercises.find((e) => e.id === exerciseId) || null;

  const selectBodyPart = (nextPart) => {
    setError("");
    setResult(null);
    setBodyPart(nextPart);
    setMuscleFilter("all");
    const nextList = nextPart === "upper" ? upperExercises : lowerExercises;
    setExerciseId(nextList[0]?.id ?? "");
  };

  const selectMuscle = (muscle) => {
    setError("");
    setResult(null);
    setMuscleFilter(muscle);
    const nextList = muscle === "all"
      ? partExercises
      : partExercises.filter((ex) => ex.muscle_group === muscle);
    if (!nextList.some((ex) => ex.id === exerciseId)) {
      setExerciseId(nextList[0]?.id ?? "");
    }
  };

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
    <div className="fc-page">
      <div className="fc-header">
        <div>
          <h1>Form check</h1>
          <p className="muted">Upload one photo of yourself doing an exercise. We check your posture and point out what to fix.</p>
        </div>
        <div className="fc-count-pill">
          <span className="fc-count-num">{exercises.length}</span>
          <span className="fc-count-lbl">Exercises</span>
        </div>
      </div>

      <div className="fc-card">
        <div className="fc-card-head">
          <h2>How to take a good photo</h2>
        </div>
        <ul className="tips">
          <li>Stand side-on to the camera, so the whole body is visible from head to feet.</li>
          <li>Use good light, and keep the phone at waist height.</li>
          <li>Take the photo at the lowest or most difficult point of the movement.</li>
        </ul>
      </div>

      <form className="fc-card" onSubmit={onSubmit} noValidate>
        <div className="fc-card-head">
          <h2>Check your exercise form</h2>
          <span className="muted" style={{ fontSize: "13px" }}>
            {bodyPart === "upper" ? "Upper Body" : "Lower Body"}
          </span>
        </div>

        <span className="fc-section-label">1. Select Body Part</span>
        <div className="fc-part-grid" role="tablist" aria-label="Select body part">
          <button
            type="button"
            role="tab"
            aria-selected={bodyPart === "upper"}
            className={`fc-part-btn ${bodyPart === "upper" ? "active" : ""}`}
            onClick={() => selectBodyPart("upper")}
          >
            <div>
              <span className="fc-part-title">Upper Body</span>
              <span className="fc-part-sub">Chest, Back, Shoulders, Arms</span>
            </div>
            <span className="fc-part-count">{upperExercises.length} exercises</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={bodyPart === "lower"}
            className={`fc-part-btn ${bodyPart === "lower" ? "active" : ""}`}
            onClick={() => selectBodyPart("lower")}
          >
            <div>
              <span className="fc-part-title">Lower Body</span>
              <span className="fc-part-sub">Quads, Hamstrings, Glutes, Calves</span>
            </div>
            <span className="fc-part-count">{lowerExercises.length} exercises</span>
          </button>
        </div>

        {availableMuscles.length > 1 && (
          <div className="fc-muscle-bar">
            <span className="fc-muscle-label">Filter muscle:</span>
            <button
              type="button"
              className={`fc-chip-btn ${muscleFilter === "all" ? "active" : ""}`}
              onClick={() => selectMuscle("all")}
            >
              All ({partExercises.length})
            </button>
            {availableMuscles.map((m) => (
              <button
                type="button"
                key={m}
                className={`fc-chip-btn ${muscleFilter === m ? "active" : ""}`}
                onClick={() => selectMuscle(m)}
              >
                {cap(m)}
              </button>
            ))}
          </div>
        )}

        <span className="fc-section-label">2. Choose Exercise &amp; Upload Photo</span>
        <label>Exercise
          <select
            value={exerciseId}
            onChange={(e) => { setExerciseId(e.target.value); setResult(null); setError(""); }}
          >
            {muscleFilter === "all" && groupedExercises.length > 1 ? (
              groupedExercises.map((g) => (
                <optgroup key={g.muscle} label={cap(g.muscle)}>
                  {g.items.map((x) => (
                    <option key={x.id} value={x.id}>{x.name}</option>
                  ))}
                </optgroup>
              ))
            ) : (
              filteredExercises.map((x) => (
                <option key={x.id} value={x.id}>{x.name}</option>
              ))
            )}
          </select>
        </label>

        {selectedExercise?.form_cues?.length > 0 && (
          <div className="fc-cues-box">
            <p className="fc-cues-title">Key form cues for {selectedExercise.name}:</p>
            <ul>
              {selectedExercise.form_cues.map((cue, idx) => (
                <li key={idx}>{cue}</li>
              ))}
            </ul>
          </div>
        )}

        <label>Photo (JPG or PNG, up to {PHOTO_MAX_MB} MB)
          <input type="file" accept="image/jpeg,image/png" onChange={onFile} />
        </label>
        {preview && <img className="fc-preview" src={preview} alt="Your selected photo" />}

        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button className="fc-btn" disabled={busy}>{busy ? "Checking your form..." : "Check my form"}</button>
        </div>
      </form>

      {result && (
        <div className="fc-card">
          {result.demo && (
            <p className="fc-notice">Demo mode: this is a sample result. Your photo was not analysed.</p>
          )}
          <div className="fc-card-head">
            <h2>Result for {result.exercise_name}</h2>
          </div>

          <div className="fc-score-card">
            <span className="score-value">{result.score}</span>
            <div>
              <div className="muted" style={{ fontSize: "13px" }}>Score out of 100</div>
              <span className={verdict.cls}>{verdict.text}</span>
            </div>
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

          <p className="fc-notice" style={{ marginBottom: 0 }}>
            This is general guidance from one photo, not medical advice. Stop the exercise if you feel pain,
            and talk to a doctor if you have an injury.
          </p>
        </div>
      )}
    </div>
  );
}
