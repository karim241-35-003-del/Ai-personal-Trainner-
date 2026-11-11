// Safety rules and contraindications mapping for physical injuries and limitations.

export const INJURY_CATEGORIES = {
  shoulder: {
    key: "shoulder",
    label: "Shoulder",
    keywords: ["shoulder", "rotator cuff", "deltoid", "clavicle", "impingement", "frozen shoulder", "ac joint", "কাঁধ", "শোল্ডার"],
  },
  knee: {
    key: "knee",
    label: "Knee",
    keywords: ["knee", "patella", "meniscus", "acl", "mcl", "pcl", "runner's knee", "হাঁটু", "হাটুর"],
  },
  back: {
    key: "back",
    label: "Lower Back / Spine",
    keywords: ["back", "lower back", "spine", "lumbar", "disc", "sciatica", "l4", "l5", "s1", "কোমর", "পিঠ"],
  },
  wrist: {
    key: "wrist",
    label: "Wrist",
    keywords: ["wrist", "carpal", "hand", "কবজি"],
  },
  elbow: {
    key: "elbow",
    label: "Elbow",
    keywords: ["elbow", "tennis elbow", "golfer's elbow", "tendonitis", "কনুই"],
  },
  neck: {
    key: "neck",
    label: "Neck",
    keywords: ["neck", "cervical", "ঘাড়", "ঘাড়"],
  },
  hip: {
    key: "hip",
    label: "Hip",
    keywords: ["hip", "groin", "pelvis", "হিপ"],
  },
  ankle: {
    key: "ankle",
    label: "Ankle & Foot",
    keywords: ["ankle", "achilles", "plantar", "foot", "sprain", "গোড়ালি", "পায়ের পাতা"],
  },
};

export const EXERCISE_SAFETY = {
  "push-up": {
    riskAreas: ["shoulder", "wrist", "elbow"],
    reason: "Push-ups place significant mechanical and shear stress on the anterior shoulder joint, rotator cuff, and wrists.",
    alternatives: ["Glute bridge", "Bodyweight squat (if knees are healthy)", "Standing wall push-ups"],
  },
  "bench-press": {
    riskAreas: ["shoulder", "wrist", "elbow"],
    reason: "Heavy horizontal pressing heavily loads the rotator cuff and anterior deltoids.",
    alternatives: ["Dumbbell floor press with limited range", "Lower body training"],
  },
  "dumbbell-bench-press": {
    riskAreas: ["shoulder", "wrist", "elbow"],
    reason: "Heavy horizontal pressing heavily loads the rotator cuff and anterior deltoids.",
    alternatives: ["Dumbbell floor press with limited range", "Lower body training"],
  },
  "dumbbell-incline-bench-press": {
    riskAreas: ["shoulder", "wrist", "elbow"],
    reason: "Incline pressing shifts shear stress to the anterior clavicular joint and rotator cuff.",
    alternatives: ["Flat dumbbell press with light load", "Push-ups with hands elevated"],
  },
  "dumbbell-incline-chest-flys": {
    riskAreas: ["shoulder", "elbow"],
    reason: "Incline flyes place maximum tensile lever stress on the anterior capsule and biceps tendon.",
    alternatives: ["Dumbbell floor flyes", "Machine chest press"],
  },
  "dumbbell-chest-fly": {
    riskAreas: ["shoulder", "elbow"],
    reason: "Long lever arm places high tensile force across the anterior shoulder capsule.",
    alternatives: ["Floor dumbbell press", "Isometric chest press"],
  },
  "shoulder-press": {
    riskAreas: ["shoulder", "neck"],
    reason: "Overhead pressing directly compresses the subacromial space and strains injured shoulders.",
    alternatives: ["Lateral raises with very light resistance (if pain-free)", "Lower body exercises"],
  },
  "dumbbell-lateral-raise": {
    riskAreas: ["shoulder", "neck"],
    reason: "Abducting arms with long levers compresses the subacromial space if thumbs turn downward.",
    alternatives: ["Scaption raises in the scapular plane", "Cable lateral raises with light resistance"],
  },
  "dumbbell-front-raise": {
    riskAreas: ["shoulder", "wrist"],
    reason: "Front flexion places leverage on the anterior deltoid and long head of the biceps tendon.",
    alternatives: ["Incline chest press", "Neutral grip front raises with light load"],
  },
  "plank": {
    riskAreas: ["shoulder", "wrist", "back"],
    reason: "Prolonged isometric loading places continuous compressive forces on shoulders and wrists.",
    alternatives: ["Dead bug", "Bird-dog"],
  },
  "dumbbell-hollow-hold": {
    riskAreas: ["back", "neck"],
    reason: "Extended hollow holds place high tensile stress across lumbar spine and hip flexors if abdominal bracing fatigues.",
    alternatives: ["Dead bug", "Forearm plank with knees grounded", "Standard crunches"],
  },
  "dumbbell-situp": {
    riskAreas: ["back", "neck"],
    reason: "Weighted sit-ups create repeated flexion compression on lumbar intervertebral discs.",
    alternatives: ["Crunches with elevated feet", "Dead bug", "Bird-dog"],
  },
  "lat-pulldown": {
    riskAreas: ["shoulder", "elbow"],
    reason: "Wide-grip overhead pulling can cause shoulder impingement and stress the joint capsule.",
    alternatives: ["Neutral-grip seated row with light weight"],
  },
  "bodyweight-pull-ups": {
    riskAreas: ["shoulder", "elbow"],
    reason: "Vertical pulling places high bodyweight tensile stress on the glenohumeral joint and shoulder capsule.",
    alternatives: ["Inverted rows", "Assisted pull-ups"],
  },
  "bodyweight-pike-shrug": {
    riskAreas: ["shoulder", "wrist"],
    reason: "Inverted pike positions load the wrists and anterior shoulder joints in hyper-flexion.",
    alternatives: ["Wall shrugs", "Band pull-aparts"],
  },
  "dumbbell-row": {
    riskAreas: ["back", "elbow"],
    reason: "Bent-over posture creates shear forces on the lumbar spine.",
    alternatives: ["Chest-supported row"],
  },
  "dumbbell-row-bilateral": {
    riskAreas: ["back", "elbow"],
    reason: "Bent-over bilateral posture places continuous isometric shear load across the lumbar spine.",
    alternatives: ["Chest-supported row", "Dumbbell row unilateral with bench support"],
  },
  "dumbbell-row-unilateral": {
    riskAreas: ["back", "elbow"],
    reason: "Unilateral pulling with unsupported torso can cause rotational shear on the spine.",
    alternatives: ["Chest-supported row", "Cable seated row with neutral grip"],
  },
  "dumbbell-hammer-curl": {
    riskAreas: ["elbow", "wrist"],
    reason: "Repetitive neutral grip curls place load on the common extensor and brachioradialis tendons.",
    alternatives: ["Light resistance band hammer curls", "Cable curls with rope attachment"],
  },
  "dumbbell-skullcrusher": {
    riskAreas: ["elbow", "wrist"],
    reason: "Direct mechanical elbow extension under load places high shear forces on the triceps tendon and olecranon.",
    alternatives: ["Cable tricep pushdown with rope", "Neutral grip dumbbell floor press"],
  },
  "dumbbell-seated-overhead-tricep-extension": {
    riskAreas: ["shoulder", "elbow"],
    reason: "Extreme shoulder flexion combined with deep elbow flexion strains the shoulder capsule and triceps tendon origin.",
    alternatives: ["Cable tricep pushdown", "Neutral grip dumbbell kickbacks"],
  },
  "barbell-squat": {
    riskAreas: ["knee", "back", "hip", "shoulder"],
    reason: "Heavy spinal compression and knee stress; holding the bar behind the neck stresses shoulder external rotation.",
    alternatives: ["Bodyweight box squat", "Glute bridge"],
  },
  "bodyweight-squat": {
    riskAreas: ["knee", "hip"],
    reason: "Deep knee flexion increases patellofemoral pressure on the knee joints.",
    alternatives: ["Glute bridge", "Partial box squats"],
  },
  "goblet-squat": {
    riskAreas: ["knee", "hip", "back"],
    reason: "Loaded squats increase compressive stress on knees and require spinal stabilization.",
    alternatives: ["Glute bridge"],
  },
  "dumbbell-goblet-squat": {
    riskAreas: ["knee", "hip", "back"],
    reason: "Loaded squats increase compressive stress on knees and require spinal stabilization.",
    alternatives: ["Glute bridge", "Bodyweight squat (if knees are healthy)"],
  },
  "barbell-deadlift": {
    riskAreas: ["back", "knee"],
    reason: "High axial loading and tension across the lumbar spine and hamstrings.",
    alternatives: ["Glute bridge", "Bodyweight hip thrusts"],
  },
  "leg-press": {
    riskAreas: ["knee", "back", "hip"],
    reason: "Deep sled descent compresses the knees and can round the lumbar spine.",
    alternatives: ["Glute bridge", "Shallow step-ups"],
  },
  "glute-bridge": {
    riskAreas: ["back"],
    reason: "Over-arching the lumbar spine at the top can aggravate acute lower back issues.",
    alternatives: ["Clamshells"],
  },
  "dumbbell-glute-bridge": {
    riskAreas: ["back"],
    reason: "Adding direct dumbbell weight on the pelvis increases compressive and shear load if the lower back is hyperextended.",
    alternatives: ["Bodyweight glute bridge", "Clamshells"],
  },
  "dumbbell-hip-thrust": {
    riskAreas: ["back", "knee"],
    reason: "Deep hip flexion against a loaded dumbbell can strain lumbar spine or patella if knee angle is suboptimal.",
    alternatives: ["Bodyweight glute bridge", "Clamshells", "Bird-dog"],
  },
  "dumbbell-romanian-deadlift": {
    riskAreas: ["back", "hamstrings"],
    reason: "Hip hinge loading places mechanical tension and shear stress across the lumbar spine and hamstring origins.",
    alternatives: ["Glute bridge", "Bodyweight hip thrust", "Bird-dog"],
  },
  "dumbbell-leg-curl": {
    riskAreas: ["knee", "hamstrings"],
    reason: "Resisted knee flexion under load isolates the hamstring tendons at their posterior knee insertion.",
    alternatives: ["Glute bridge", "Bird-dog", "Hamstring stretches"],
  },
  "single-legged-romanian-deadlifts": {
    riskAreas: ["back", "hamstrings"],
    reason: "Unilateral hip hinging tests lumbar spinal stabilization and puts stretch tension on the posterior chain.",
    alternatives: ["Glute bridge", "Bird-dog", "Hip hinge with wall support"],
  },
  "barbell-romanian-deadlift": {
    riskAreas: ["back", "hamstrings"],
    reason: "Heavy barbell hinging heavily loads the lumbar erectors and posterior chain.",
    alternatives: ["Glute bridge", "Bird-dog"],
  },
  "bodyweight-supermans": {
    riskAreas: ["back", "neck"],
    reason: "Prone lumbar hyperextension can compress irritated facet joints in acute lower back conditions.",
    alternatives: ["Bird-dog", "Glute bridge"],
  },
  "dumbbell-superman": {
    riskAreas: ["back", "neck"],
    reason: "Prone weighted hyperextension increases compressive load on lumbar facet joints and discs.",
    alternatives: ["Bird-dog", "Glute bridge"],
  },
  "dumbbell-goblet-good-morning": {
    riskAreas: ["back", "hamstrings"],
    reason: "Loaded forward hip flexion places mechanical shear stress across the lumbar spine and hamstring origins.",
    alternatives: ["Glute bridge", "Bird-dog"],
  },
  "dumbbell-reverse-curl": {
    riskAreas: ["wrist", "elbow"],
    reason: "Pronated curls load the wrist extensors and the common extensor origin at the lateral epicondyle.",
    alternatives: ["Hammer curls", "Neutral dumbbell static holds"],
  },
  "dumbbell-wrist-extension": {
    riskAreas: ["wrist", "elbow"],
    reason: "Direct mechanical wrist extension creates high shear stress across the carpal bones and common extensor tendon at the lateral epicondyle.",
    alternatives: ["Isometric towel hold", "Neutral grip carries"],
  },
  "dumbbell-wrist-curl": {
    riskAreas: ["wrist", "elbow"],
    reason: "Loaded repetitive wrist flexion strains the flexor tendon insertions at the medial epicondyle.",
    alternatives: ["Light stress ball squeezes", "Isometric wrist holds"],
  },
  "barbell-wrist-curl": {
    riskAreas: ["wrist", "elbow"],
    reason: "Rigid barbell wrist curl locks the wrists in extreme supination under load.",
    alternatives: ["Neutral dumbbell static holds"],
  },
  "bodyweight-dead-hang": {
    riskAreas: ["shoulder", "wrist"],
    reason: "Full dead hangs place maximum traction on the glenohumeral joint and wrist flexors.",
    alternatives: ["Feet-supported hanging bar drill"],
  },
  "dumbbell-calf-raise": {
    riskAreas: ["knee", "ankle"],
    reason: "Heavy standing calf raises place high tensile strain on the Achilles tendon and plantar fascia.",
    alternatives: ["Dumbbell seated calf raise", "Tibialis raises"],
  },
  "dumbbell-seated-calf-raise": {
    riskAreas: ["ankle"],
    reason: "Seated angle places focused load on the soleus and Achilles complex.",
    alternatives: ["Gentle ankle mobility rotations", "Isometric calf holds"],
  },
};

/**
 * Detects injury areas from user limitations free text.
 * @param {string} text - User's limitations input from profile.
 * @returns {Array<{ key: string, label: string, matchedWord: string }>}
 */
export function detectInjuries(text) {
  if (!text || typeof text !== "string") return [];
  const normalized = text.toLowerCase();
  const detected = [];

  for (const [key, category] of Object.entries(INJURY_CATEGORIES)) {
    for (const keyword of category.keywords) {
      // Word boundary or substring matching for compound terms
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(normalized) || normalized.includes(keyword)) {
        detected.push({
          key,
          label: category.label,
          matchedWord: keyword,
        });
        break; // matched this category
      }
    }
  }

  return detected;
}

/**
 * Checks if an exercise is contraindicated for the user's detected injuries.
 * @param {string} exerciseId - ID of the exercise.
 * @param {Array<{ key: string, label: string }>} detectedInjuries
 * @returns {{ isContraindicated: boolean, matchedInjuries: Array<string>, reason?: string, alternatives?: Array<string> }}
 */
export function getExerciseContraindication(exerciseId, detectedInjuries = []) {
  if (!detectedInjuries || detectedInjuries.length === 0) {
    return { isContraindicated: false, matchedInjuries: [] };
  }

  const safety = EXERCISE_SAFETY[exerciseId];
  if (!safety) {
    return { isContraindicated: false, matchedInjuries: [] };
  }

  const injuryKeys = detectedInjuries.map((i) => i.key);
  const matched = safety.riskAreas.filter((area) => injuryKeys.includes(area));

  if (matched.length > 0) {
    const labels = matched.map((k) => INJURY_CATEGORIES[k]?.label ?? k);
    return {
      isContraindicated: true,
      matchedInjuries: labels,
      reason: safety.reason,
      alternatives: safety.alternatives || [],
    };
  }

  return { isContraindicated: false, matchedInjuries: [] };
}
