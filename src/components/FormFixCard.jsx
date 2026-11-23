/**
 * FormFixCard.jsx
 * Visual, angle-free posture correction card for general fitness users.
 * Replaces abstract angles with side-by-side visual body diagrams,
 * directional action badges, and real-world trainer cues.
 */

// Helper to categorize the issue and provide intuitive visual cues
function getIssueVisualProfile(issue, exerciseId = "") {
  const text = `${issue.body_part || ""} ${issue.message || ""}`.toLowerCase();
  const ex = (exerciseId || "").toLowerCase();

  // 1. Curls (Biceps / Arms)
  if (ex.includes("curl") || text.includes("bicep") || text.includes("elbow pinned")) {
    return {
      type: "bicep_curl",
      icon: "💪",
      partLabel: "Elbow & Torso Stability",
      actionBadge: "🔒 Pin Elbows & Stop Swinging",
      targetLabel: "Elbows locked at sides, zero body swing",
      mistakeLabel: "Swinging torso to heave the weight up",
      coachCue: "Glue your elbows to your ribcage. Imagine leaning against a wall — only your forearms should move up and down.",
      primaryMuscles: "Biceps & Forearms",
      quickTip: "Lower the weight with a slow 2-second negative; don't let gravity drop it.",
    };
  }

  // 2. Rows & Pull-ups (Back & Lats)
  if (ex.includes("row") || ex.includes("pull") || text.includes("lats") || text.includes("shoulder blade")) {
    return {
      type: "back_row",
      icon: "🚣",
      partLabel: "Spine & Shoulder Blades",
      actionBadge: "🎯 Drive Elbows Back & Retract",
      targetLabel: "Chest proud, shoulder blades pinched",
      mistakeLabel: "Rounding upper back and shrugging shoulders",
      coachCue: "Initiate the pull by crushing a walnut between your shoulder blades. Pull through your elbows, not your hands.",
      primaryMuscles: "Lats, Rhomboids & Rear Delts",
      quickTip: "Keep your chest puffed out and avoid jerking your lower back to move the weight.",
    };
  }

  // 3. Overhead Presses & Shoulder Raises
  if (ex.includes("shoulder") || ex.includes("raise") || ex.includes("overhead") || text.includes("shoulder")) {
    return {
      type: "shoulder_press",
      icon: "🏋️",
      partLabel: "Overhead Alignment & Core",
      actionBadge: "🔒 Lock Ribs Down, Neutral Spine",
      targetLabel: "Straight overhead line, neutral lower back",
      mistakeLabel: "Over-arching lower back to push overhead",
      coachCue: "Pull your ribs down toward your hips and brace your abs like you are in a plank. Press the weight directly overhead, not forward.",
      primaryMuscles: "Deltoids & Upper Traps",
      quickTip: "Control the weight down to ear level before pressing again.",
    };
  }

  // 4. Squats, Leg Press, V-Squat (Legs & Depth)
  if (ex.includes("squat") || ex.includes("leg") || ex.includes("adductor") || ex.includes("calf") || text.includes("knee") || text.includes("depth") || text.includes("squat")) {
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

  // 5. Push-ups, Dips & Chest Presses (Chest & Triceps)
  if (ex.includes("push") || ex.includes("press") || ex.includes("dip") || ex.includes("fly") || text.includes("chest") || text.includes("elbow")) {
    return {
      type: "pushup_elbow",
      icon: "💪",
      partLabel: "Elbows & Chest Depth",
      actionBadge: "⬇️ Lower Chest Closer to Floor",
      targetLabel: "Chest full range of motion",
      mistakeLabel: "Stopping high with arms barely bent",
      coachCue: "Shape your arms like an arrow head (pointing 45° back), not flared like the letter 'T'. Lower until your chest is just above the floor or handle level.",
      primaryMuscles: "Chest, Shoulders & Triceps",
      quickTip: "Pull your shoulder blades together on the way down, then push the handles or floor away hard.",
    };
  }

  // 6. Hips sagging or piking (Push-up, Plank, Body Line)
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

  // 7. Default / General Posture Alignment
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
        <div className="posture-card mistake">
          <div className="posture-tag tag-mistake">⚠️ Common Mistake</div>
          <svg viewBox="0 0 240 100" className="posture-svg" aria-label="Sagging hips illustration">
            <line x1="10" y1="85" x2="230" y2="85" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />
            <text x="200" y="96" fill="#94a3b8" fontSize="10">Floor</text>
            <line x1="55" y1="42" x2="55" y2="85" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            <circle cx="35" cy="38" r="9" fill="#94a3b8" />
            <path d="M 55 42 Q 120 76 200 85" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
            <circle cx="120" cy="74" r="5" fill="#ef4444" />
            <g transform="translate(120, 68)">
              <line x1="0" y1="0" x2="0" y2="-22" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
              <polyline points="-4,-16 0,-24 4,-16" fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="128" y="55" fill="#ea580c" fontSize="10" fontWeight="700">Lift Hips</text>
          </svg>
          <div className="posture-caption">Hips dropping toward floor</div>
        </div>
        <div className="posture-card target">
          <div className="posture-tag tag-target">✓ Target Form</div>
          <svg viewBox="0 0 240 100" className="posture-svg" aria-label="Straight neutral spine illustration">
            <line x1="10" y1="85" x2="230" y2="85" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />
            <text x="200" y="96" fill="#94a3b8" fontSize="10">Floor</text>
            <line x1="55" y1="42" x2="55" y2="85" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            <circle cx="35" cy="38" r="9" fill="#10b981" />
            <line x1="55" y1="42" x2="200" y2="85" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
            <circle cx="55" cy="42" r="4" fill="#059669" />
            <circle cx="127" cy="63" r="4" fill="#059669" />
            <circle cx="200" cy="85" r="4" fill="#059669" />
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
        <div className="posture-card mistake">
          <div className="posture-tag tag-mistake">⚠️ Common Mistake</div>
          <svg viewBox="0 0 240 110" className="posture-svg" aria-label="Shallow squat illustration">
            <line x1="10" y1="95" x2="230" y2="95" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />
            <circle cx="105" cy="22" r="8" fill="#94a3b8" />
            <line x1="105" y1="30" x2="115" y2="58" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            <line x1="115" y1="58" x2="140" y2="72" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
            <line x1="140" y1="72" x2="135" y2="95" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            <g transform="translate(90, 58)">
              <line x1="0" y1="0" x2="0" y2="22" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
              <polyline points="-4,16 0,24 4,16" fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="40" y="73" fill="#ea580c" fontSize="10" fontWeight="700">Sit Deeper</text>
          </svg>
          <div className="posture-caption">Stopped too high above parallel</div>
        </div>
        <div className="posture-card target">
          <div className="posture-tag tag-target">✓ Target Form</div>
          <svg viewBox="0 0 240 110" className="posture-svg" aria-label="Parallel squat depth illustration">
            <line x1="10" y1="95" x2="230" y2="95" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />
            <circle cx="105" cy="35" r="8" fill="#10b981" />
            <line x1="105" y1="43" x2="115" y2="73" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            <line x1="115" y1="73" x2="152" y2="73" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
            <line x1="152" y1="73" x2="144" y2="95" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            <line x1="85" y1="73" x2="175" y2="73" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
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

  // Default / Upper Body / Press / Curl Alignment
  return (
    <div className="posture-diagram-grid">
      <div className="posture-card mistake">
        <div className="posture-tag tag-mistake">⚠️ Common Mistake</div>
        <svg viewBox="0 0 240 100" className="posture-svg" aria-label="Incomplete range of motion">
          <line x1="10" y1="85" x2="230" y2="85" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />
          <circle cx="120" cy="25" r="9" fill="#94a3b8" />
          <line x1="120" y1="34" x2="120" y2="85" stroke="#ef4444" strokeWidth="5" strokeDasharray="5 5" strokeLinecap="round" />
          <text x="120" y="60" textAnchor="middle" fill="#dc2626" fontSize="11" fontWeight="700">Momentum / Half Rep</text>
        </svg>
        <div className="posture-caption">Rushing without full range</div>
      </div>
      <div className="posture-card target">
        <div className="posture-tag tag-target">✓ Target Form</div>
        <svg viewBox="0 0 240 100" className="posture-svg" aria-label="Controlled full range of motion">
          <line x1="10" y1="85" x2="230" y2="85" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />
          <circle cx="120" cy="25" r="9" fill="#10b981" />
          <line x1="120" y1="34" x2="120" y2="85" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
          <g transform="translate(85, 48)">
            <rect x="0" y="0" width="70" height="18" rx="9" fill="#ecfdf5" stroke="#10b981" strokeWidth="1" />
            <text x="35" y="13" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="700">Locked Form</text>
          </g>
        </svg>
        <div className="posture-caption">Controlled tempo & full extension</div>
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
      <div className="fix-card-header">
        <div className="fix-part-title">
          <span className="fix-part-icon" aria-hidden="true">{profile.icon}</span>
          <span className="fix-part-name">{profile.partLabel}</span>
        </div>
        <span className="fix-action-badge">{profile.actionBadge}</span>
      </div>

      <div className="fix-visual-section">
        <PostureIllustration type={profile.type} />
      </div>

      <div className="fix-description">
        <p className="fix-explanation-text">
          {friendlyMessage || issue.message}
        </p>
      </div>

      <div className="coach-cue-box">
        <div className="coach-cue-header">
          <span className="coach-cue-icon" aria-hidden="true">💡</span>
          <strong>Trainer&apos;s Mental Cue:</strong>
        </div>
        <p className="coach-cue-text">{profile.coachCue}</p>
      </div>

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
