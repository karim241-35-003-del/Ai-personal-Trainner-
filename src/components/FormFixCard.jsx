/**
 * FormFixCard.jsx
 * Visual, angle-free posture correction card for general fitness users.
 * Replaces abstract angles with side-by-side visual body diagrams,
 * directional action badges, and real-world trainer cues.
 */

// Helper to categorize the issue and provide intuitive visual cues
function getIssueVisualProfile(issue, exerciseId = "") {
  const text = `${issue.body_part || ""} ${issue.message || ""}`.toLowerCase();

  // 1. Hips sagging or piking (Push-up, Plank, Body Line)
  if (text.includes("hip") || text.includes("back") || text.includes("sagging") || text.includes("piking") || text.includes("straight line")) {
    const isSagging = text.includes("sagging") || !text.includes("piking");
    return {
      type: "hips_sagging",
      icon: "🔄",
      partLabel: "Hips & Spine Line",
      actionBadge: isSagging ? "⬆️ Lift Hips & Brace Core" : "⬇️ Lower Hips to Neutral",
      targetLabel: "Straight line: Shoulder ➔ Hip ➔ Heel",
      mistakeLabel: isSagging ? "Hips dipping toward the floor" : "Hips raised too high (piking)",
      coachCue: "Imagine balancing a glass of water on your lower back. Squeeze your glutes and tighten your stomach like you are bracing for a punch.",
      primaryMuscles: "Core, Glutes & Lower Back",
      quickTip: "Keep your body as stiff as a wooden plank from your head to your heels.",
    };
  }

  // 2. Squat Depth (Knees, depth, thighs)
  if (text.includes("squat") || text.includes("knee") || text.includes("depth") || text.includes("deeper")) {
    const isTooDeep = text.includes("deep") && text.includes("tightly");
    return {
      type: "squat_depth",
      icon: "🦵",
      partLabel: "Knees & Squat Depth",
      actionBadge: isTooDeep ? "⏸️ Control the Bottom" : "⬇️ Sit Back & Deeper",
      targetLabel: "Thighs parallel to the floor",
      mistakeLabel: isTooDeep ? "Over-compressing knees at the bottom" : "Stopping too high above parallel",
      coachCue: "Think of sitting back into a low chair. Spread the floor apart with your feet so your knees track naturally in line with your toes.",
      primaryMuscles: "Quadriceps, Glutes & Hamstrings",
      quickTip: "Keep your chest tall and drive your weight evenly through your heels and mid-foot.",
    };
  }

  // 3. Push-up Elbows & Chest Depth
  if (text.includes("elbow") || text.includes("chest") || text.includes("push-up") || text.includes("floor")) {
    return {
      type: "pushup_elbow",
      icon: "💪",
      partLabel: "Elbows & Chest Depth",
      actionBadge: "⬇️ Lower Chest Closer to Floor",
      targetLabel: "Chest one fist-width off the floor",
      mistakeLabel: "Stopping high with arms barely bent",
      coachCue: "Shape your arms like an arrow head (pointing 45° back), not flared like the letter 'T'. Lower until your chest is just above the floor.",
      primaryMuscles: "Chest, Shoulders & Triceps",
      quickTip: "Pull your shoulder blades together on the way down, then push the ground away hard.",
    };
  }

  // 4. Default / General Posture Alignment
  return {
    type: "general_alignment",
    icon: "🧍",
    partLabel: issue.body_part || "Posture Alignment",
    actionBadge: "🎯 Form Adjustment Needed",
    targetLabel: "Stable & balanced body position",
    mistakeLabel: "Joint out of alignment",
    coachCue: "Focus on controlled movement with smooth breathing. Take the photo right at the most challenging point of the rep.",
    primaryMuscles: "Full Body Stability",
    quickTip: "Reset your stance, brace your core, and keep your neck relaxed.",
  };
}

// Side-by-side SVG diagrams tailored to each issue type
function PostureIllustration({ type }) {
  if (type === "hips_sagging") {
    return (
      <div className="posture-diagram-grid">
        {/* Current Mistake: Sagging */}
        <div className="posture-card mistake">
          <div className="posture-tag tag-mistake">⚠️ Common Mistake</div>
          <svg viewBox="0 0 240 100" className="posture-svg" aria-label="Sagging hips illustration">
            {/* Floor line */}
            <line x1="10" y1="85" x2="230" y2="85" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />
            <text x="200" y="96" fill="#94a3b8" fontSize="10">Floor</text>

            {/* Arms supporting body */}
            <line x1="55" y1="42" x2="55" y2="85" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            
            {/* Head */}
            <circle cx="35" cy="38" r="9" fill="#94a3b8" />
            
            {/* Sagging Body Line (Shoulder -> Dipped Hip -> Feet) */}
            <path d="M 55 42 Q 120 76 200 85" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
            
            {/* Sagging Hip indicator */}
            <circle cx="120" cy="74" r="5" fill="#ef4444" />
            
            {/* Directional Lift Arrow */}
            <g transform="translate(120, 68)">
              <line x1="0" y1="0" x2="0" y2="-22" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
              <polyline points="-4,-16 0,-24 4,-16" fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="128" y="55" fill="#ea580c" fontSize="10" fontWeight="700">Lift Hips</text>
          </svg>
          <div className="posture-caption">Hips dropping toward floor</div>
        </div>

        {/* Target Posture: Straight Line */}
        <div className="posture-card target">
          <div className="posture-tag tag-target">✓ Target Form</div>
          <svg viewBox="0 0 240 100" className="posture-svg" aria-label="Straight neutral spine illustration">
            {/* Floor line */}
            <line x1="10" y1="85" x2="230" y2="85" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />
            <text x="200" y="96" fill="#94a3b8" fontSize="10">Floor</text>

            {/* Arms supporting body */}
            <line x1="55" y1="42" x2="55" y2="85" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            
            {/* Head */}
            <circle cx="35" cy="38" r="9" fill="#10b981" />
            
            {/* Straight Neutral Line (Shoulder -> Hip -> Heel) */}
            <line x1="55" y1="42" x2="200" y2="85" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
            
            {/* Joints alignment dots */}
            <circle cx="55" cy="42" r="4" fill="#059669" />
            <circle cx="127" cy="63" r="4" fill="#059669" />
            <circle cx="200" cy="85" r="4" fill="#059669" />
            
            {/* Check badge */}
            <g transform="translate(110, 38)">
              <rect x="0" y="0" width="70" height="18" rx="9" fill="#ecfdf5" stroke="#10b981" strokeWidth="1" />
              <text x="35" y="13" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="700">Straight Line</text>
            </g>
          </svg>
          <div className="posture-caption">One solid line head to heels</div>
        </div>
      </div>
    );
  }

  if (type === "squat_depth") {
    return (
      <div className="posture-diagram-grid">
        {/* Current Mistake: Too Shallow */}
        <div className="posture-card mistake">
          <div className="posture-tag tag-mistake">⚠️ Common Mistake</div>
          <svg viewBox="0 0 240 110" className="posture-svg" aria-label="Shallow squat illustration">
            {/* Floor */}
            <line x1="10" y1="95" x2="230" y2="95" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />
            
            {/* Torso & Head */}
            <circle cx="105" cy="22" r="8" fill="#94a3b8" />
            <line x1="105" y1="30" x2="115" y2="58" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            
            {/* Shallow thigh (Hip -> Knee) */}
            <line x1="115" y1="58" x2="140" y2="72" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
            
            {/* Shin (Knee -> Ankle) */}
            <line x1="140" y1="72" x2="135" y2="95" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            
            {/* Sit Deeper Arrow */}
            <g transform="translate(90, 58)">
              <line x1="0" y1="0" x2="0" y2="22" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
              <polyline points="-4,16 0,24 4,16" fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="40" y="73" fill="#ea580c" fontSize="10" fontWeight="700">Sit Deeper</text>
          </svg>
          <div className="posture-caption">Stopped too high above parallel</div>
        </div>

        {/* Target Posture: Deep Parallel Squat */}
        <div className="posture-card target">
          <div className="posture-tag tag-target">✓ Target Form</div>
          <svg viewBox="0 0 240 110" className="posture-svg" aria-label="Parallel squat depth illustration">
            {/* Floor */}
            <line x1="10" y1="95" x2="230" y2="95" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />
            
            {/* Torso & Head */}
            <circle cx="105" cy="35" r="8" fill="#10b981" />
            <line x1="105" y1="43" x2="115" y2="73" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            
            {/* Parallel Thigh (Hip -> Knee horizontal!) */}
            <line x1="115" y1="73" x2="152" y2="73" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
            
            {/* Shin (Knee -> Ankle) */}
            <line x1="152" y1="73" x2="144" y2="95" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            
            {/* Parallel Guide Line */}
            <line x1="85" y1="73" x2="175" y2="73" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
            
            {/* Target Badge */}
            <g transform="translate(100, 15)">
              <rect x="0" y="0" width="76" height="18" rx="9" fill="#ecfdf5" stroke="#10b981" strokeWidth="1" />
              <text x="38" y="13" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="700">Parallel Depth</text>
            </g>
          </svg>
          <div className="posture-caption">Thighs parallel to ground</div>
        </div>
      </div>
    );
  }

  if (type === "pushup_elbow") {
    return (
      <div className="posture-diagram-grid">
        {/* Current Mistake: Chest High */}
        <div className="posture-card mistake">
          <div className="posture-tag tag-mistake">⚠️ Common Mistake</div>
          <svg viewBox="0 0 240 100" className="posture-svg" aria-label="Incomplete pushup depth illustration">
            {/* Floor */}
            <line x1="10" y1="85" x2="230" y2="85" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />
            
            {/* Body suspended high */}
            <circle cx="35" cy="30" r="8" fill="#94a3b8" />
            <line x1="50" y1="35" x2="195" y2="80" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            
            {/* Almost straight arm */}
            <line x1="60" y1="38" x2="60" y2="85" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
            
            {/* Lower Chest Arrow */}
            <g transform="translate(90, 42)">
              <line x1="0" y1="0" x2="0" y2="20" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
              <polyline points="-4,14 0,22 4,14" fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="96" y="56" fill="#ea580c" fontSize="10" fontWeight="700">Go Lower</text>
          </svg>
          <div className="posture-caption">Arms barely bending</div>
        </div>

        {/* Target Posture: Chest to Floor */}
        <div className="posture-card target">
          <div className="posture-tag tag-target">✓ Target Form</div>
          <svg viewBox="0 0 240 100" className="posture-svg" aria-label="Deep pushup depth illustration">
            {/* Floor */}
            <line x1="10" y1="85" x2="230" y2="85" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />
            
            {/* Body low near floor */}
            <circle cx="35" cy="55" r="8" fill="#10b981" />
            <line x1="50" y1="62" x2="195" y2="82" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
            
            {/* Bent arm forming strong 90 deg lever */}
            <polyline points="50,62 70,52 65,85" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Badge */}
            <g transform="translate(95, 25)">
              <rect x="0" y="0" width="80" height="18" rx="9" fill="#ecfdf5" stroke="#10b981" strokeWidth="1" />
              <text x="40" y="13" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="700">Chest to Floor</text>
            </g>
          </svg>
          <div className="posture-caption">Chest 2 inches off floor</div>
        </div>
      </div>
    );
  }

  // General Posture Fallback Diagram
  return (
    <div className="posture-diagram-grid">
      <div className="posture-card target" style={{ gridColumn: "1 / -1" }}>
        <div className="posture-tag tag-target">🎯 Alignment Focus</div>
        <svg viewBox="0 0 240 80" className="posture-svg" aria-label="Posture alignment diagram">
          <circle cx="40" cy="40" r="10" fill="#10b981" />
          <line x1="50" y1="40" x2="190" y2="40" stroke="#10b981" strokeWidth="4" strokeDasharray="6 6" />
          <circle cx="120" cy="40" r="8" fill="#059669" />
          <circle cx="200" cy="40" r="8" fill="#047857" />
          <text x="120" y="65" textAnchor="middle" fill="#065f46" fontSize="11" fontWeight="600">
            Maintain joint alignment & balanced posture
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function FormFixCard({ issue, exerciseId }) {
  const profile = getIssueVisualProfile(issue, exerciseId);

  // Strip any raw degree/angle numbers from the message text if present
  const friendlyMessage = (issue.message || "")
    .replace(/\b\d+(\.\d+)?\s*(degrees?|deg|°)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return (
    <div className="form-fix-card">
      {/* Header with body part icon and action badge */}
      <div className="fix-card-header">
        <div className="fix-part-title">
          <span className="fix-part-icon" aria-hidden="true">{profile.icon}</span>
          <span className="fix-part-name">{profile.partLabel}</span>
        </div>
        <span className="fix-action-badge">{profile.actionBadge}</span>
      </div>

      {/* Side-by-Side Visual Diagram */}
      <div className="fix-visual-section">
        <PostureIllustration type={profile.type} />
      </div>

      {/* Plain-English Explanation */}
      <div className="fix-description">
        <p className="fix-explanation-text">
          {friendlyMessage || issue.message}
        </p>
      </div>

      {/* Trainer's Mental Cue Box */}
      <div className="coach-cue-box">
        <div className="coach-cue-header">
          <span className="coach-cue-icon" aria-hidden="true">💡</span>
          <strong>Trainer&apos;s Mental Cue:</strong>
        </div>
        <p className="coach-cue-text">{profile.coachCue}</p>
      </div>

      {/* Quick takeaway checklist */}
      <div className="fix-footer-tips">
        <div className="tip-item">
          <span className="tip-label">💪 Focus Muscles:</span>
          <span className="tip-val">{profile.primaryMuscles}</span>
        </div>
        <div className="tip-item">
          <span className="tip-label">🎯 Key Action:</span>
          <span className="tip-val">{profile.quickTip}</span>
        </div>
      </div>
    </div>
  );
}
