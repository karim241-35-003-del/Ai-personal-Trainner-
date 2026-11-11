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
  "neutral-chest-press": {
    riskAreas: ["shoulder", "elbow"],
    reason: "Machine pressing stabilizes the load but can stress anterior shoulders if seated too far back.",
    alternatives: ["Push-ups with elevated hands", "Isometric chest press"],
  },
  "machine-chest-press": {
    riskAreas: ["shoulder", "elbow"],
    reason: "Fixed plane horizontal pressing heavily loads the anterior deltoids and rotator cuff under heavy load.",
    alternatives: ["Dumbbell floor press", "Push-ups"],
  },
  "machine-pec-fly": {
    riskAreas: ["shoulder", "elbow"],
    reason: "Pec fly machines place high tensile leverage across the anterior shoulder capsule and biceps tendon at deep horizontal abduction.",
    alternatives: ["Machine chest press with moderate range", "Isometric chest press"],
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
  "machine-neutral-overhead-press": {
    riskAreas: ["shoulder", "neck"],
    reason: "Overhead pressing compresses the subacromial space; neutral grip reduces impingement but requires care with active shoulder injuries.",
    alternatives: ["Dumbbell lateral raise with light resistance", "Lower body exercises"],
  },
  "machine-standing-lateral-raise": {
    riskAreas: ["shoulder", "neck"],
    reason: "Abducting arms under fixed machine resistance can irritate the supraspinatus or subacromial bursa if shoulders are compromised.",
    alternatives: ["Scaption raises with light load", "Front raise with neutral grip"],
  },
  "machine-reverse-fly": {
    riskAreas: ["shoulder"],
    reason: "Horizontal abduction heavily loads the posterior deltoid and rotator cuff stabilizers.",
    alternatives: ["Face pull with light cable resistance", "Prone Y-raises without weights"],
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
  "machine-crunch": {
    riskAreas: ["back", "neck"],
    reason: "Resisted spinal flexion compresses lumbar discs under load if form breaks down.",
    alternatives: ["Dead bug", "Bird-dog", "Plank on knees"],
  },
  "rower-pike": {
    riskAreas: ["wrist", "shoulder", "back"],
    reason: "Piking elevates hips in a moving plank requiring strong shoulder and wrist stability under bodyweight.",
    alternatives: ["Standard forearm plank", "Dead bug"],
  },
  "cable-row-bar-kneeling-crunch": {
    riskAreas: ["back", "knee"],
    reason: "Kneeling spinal flexion with overhead load stresses the lumbar spine if hips sit back improperly.",
    alternatives: ["Forearm plank", "Dead bug", "Standard crunches"],
  },
  "cable-rope-kneeling-oblique-crunch": {
    riskAreas: ["back", "knee"],
    reason: "Rotational flexion under overhead cable load increases shear stress on lumbar facet joints.",
    alternatives: ["Side plank on knees", "Bird-dog", "Dead bug"],
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
  "cable-row-bar-standing-row": {
    riskAreas: ["back", "shoulder"],
    reason: "Standing horizontal cable pulling requires core and lower back stabilization against forward pull.",
    alternatives: ["Chest-supported row", "Seated cable row"],
  },
  "cable-single-arm-underhand-grip-row": {
    riskAreas: ["shoulder", "wrist"],
    reason: "Unilateral pulling with supinated grip increases biceps tendon loading and requires anti-rotational core stability.",
    alternatives: ["Neutral grip cable row", "Chest-supported row"],
  },
  "machine-seated-cable-row": {
    riskAreas: ["back", "shoulder"],
    reason: "Seated horizontal rowing can place shear stress on the lumbar spine if the lower back rounds during reach.",
    alternatives: ["Chest-supported machine row", "Neutral grip pulldown"],
  },
  "narrow-pulldown": {
    riskAreas: ["shoulder", "elbow"],
    reason: "Close-grip vertical pulling increases forearm and elbow flexion stress compared to standard grip widths.",
    alternatives: ["Lat pulldown with shoulder-width grip", "Seated row"],
  },
  "machine-pulldown": {
    riskAreas: ["shoulder", "elbow"],
    reason: "Wide-grip overhead pulling can cause shoulder impingement and stress the anterior capsule if leaning too far back.",
    alternatives: ["Neutral grip pulldown", "Chest-supported row"],
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
  "bicep-curl": {
    riskAreas: ["elbow", "wrist"],
    reason: "Supinated elbow flexion under load places tensile stress on the biceps tendon and forearm flexor origins.",
    alternatives: ["Hammer curls", "Light resistance band curls"],
  },
  "dumbbell-hammer-curl": {
    riskAreas: ["elbow", "wrist"],
    reason: "Repetitive neutral grip curls place load on the common extensor and brachioradialis tendons.",
    alternatives: ["Light resistance band hammer curls", "Cable curls with rope attachment"],
  },
  "cable-single-arm-bayesian-curl": {
    riskAreas: ["elbow", "shoulder"],
    reason: "Extended shoulder position during elbow flexion places high stretch and tensile tension on the long head of the biceps and distal tendon.",
    alternatives: ["Dumbbell hammer curl", "Preacher curl"],
  },
  "cable-twisting-curl": {
    riskAreas: ["elbow", "wrist"],
    reason: "Combining forearm supination with heavy elbow flexion can irritate the distal biceps tendon or medial epicondyle.",
    alternatives: ["Neutral grip hammer curl", "Cable curl with fixed EZ bar"],
  },
  "feature-curl": {
    riskAreas: ["elbow", "wrist"],
    reason: "Fixed machine curl paths with arms supported on an incline pad place continuous tension on the distal bicep tendon at full extension.",
    alternatives: ["Dumbbell hammer curl", "Standing cable curl with rope attachment"],
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
  "cable-rope-pushdown": {
    riskAreas: ["elbow"],
    reason: "Forced terminal elbow extension with flaring wrists can aggravate triceps tendonitis.",
    alternatives: ["Floor press", "Close-grip push-ups with hands on bench"],
  },
  "cable-rope-overhead-tricep-extension": {
    riskAreas: ["shoulder", "elbow"],
    reason: "Full shoulder flexion combined with heavy elbow flexion places maximal stretch on the triceps tendon and stresses the anterior shoulder capsule.",
    alternatives: ["Cable pushdowns", "Dumbbell kickbacks"],
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
  "cable-zercher-squat": {
    riskAreas: ["knee", "back", "elbow"],
    reason: "Holding the bar in the crook of the elbows increases anterior core and spinal demand, while deep squatting places compressive shear across the patellofemoral joint.",
    alternatives: ["Bodyweight box squat", "Glute bridge", "Leg press with light load"],
  },
  "cable-split-squat": {
    riskAreas: ["knee", "hip", "ankle"],
    reason: "Unilateral lunging places concentrated shear forces on the forward knee and stretches the hip flexors under load.",
    alternatives: ["Glute bridge", "Partial step-ups", "Bodyweight box squat"],
  },
  "machine-leg-extension": {
    riskAreas: ["knee"],
    reason: "Open-chain knee extension produces significant patellofemoral compressive stress and ACL shear at full terminal extension.",
    alternatives: ["Leg press with partial range", "Goblet box squats", "Glute bridge"],
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
  "gluteator": {
    riskAreas: ["hip", "knee"],
    reason: "Resisted seated hip abduction under heavy loading places tensile stress across the gluteus medius, piriformis, and IT band insertion.",
    alternatives: ["Bodyweight glute bridge", "Clamshells with light band", "Bird-dog"],
  },
  "vertical-leg-press": {
    riskAreas: ["back", "knee", "hip"],
    reason: "Vertical downward loading directly compresses the lumbar spine against the floor pad and places high compressive force on the patellofemoral joints at deep flexion.",
    alternatives: ["Bodyweight box squat", "Glute bridge", "Standard 45-degree leg press with light load"],
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
  "machine-seated-leg-curl": {
    riskAreas: ["knee", "hamstrings"],
    reason: "Seated knee flexion places hamstrings on stretch at the hip; heavy loads can strain the distal hamstring tendons or irritate the popliteal space.",
    alternatives: ["Glute bridge", "Bird-dog", "Hamstring stretches"],
  },
  "machine-hamstring-curl": {
    riskAreas: ["knee", "hamstrings", "back"],
    reason: "Prone knee flexion under load isolates the hamstrings and can place compressive shear on the anterior knee if hips arch off the pad.",
    alternatives: ["Glute bridge", "Bird-dog", "Hamstring stretches"],
  },
  "glute-ham-raise": {
    riskAreas: ["knee", "hamstrings", "back"],
    reason: "High eccentric hamstring demand through full bodyweight leverage; placing intense tensile loading on the posterior chain and knee flexors.",
    alternatives: ["Glute bridge", "Bodyweight hip thrusts", "Bird-dog"],
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
  "machine-45-degree-back-extension": {
    riskAreas: ["back", "hamstrings"],
    reason: "Trunk flexion and extension on a 45-degree bench loads the spinal erectors and can strain lumbar discs if hyperextended at the peak.",
    alternatives: ["Bird-dog", "Glute bridge", "Cat-cow stretches"],
  },
  "machine-reverse-hyperextension": {
    riskAreas: ["back", "hip"],
    reason: "Dynamic leg swing against reverse pendulum resistance decompresses the lumbar spine but requires controlled momentum to prevent sacral jarring.",
    alternatives: ["Bird-dog", "Glute bridge", "Prone leg lifts on floor"],
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
  "cable-single-arm-reverse-curl": {
    riskAreas: ["wrist", "elbow"],
    reason: "Pronated cable curls place continuous tension on the brachioradialis and common extensor tendon at the lateral epicondyle.",
    alternatives: ["Neutral grip cable curls", "Light resistance band hammer curls"],
  },
  "cable-bar-reverse-grip-curl": {
    riskAreas: ["wrist", "elbow"],
    reason: "A fixed straight bar with an overhand grip can strain wrist extensors and the lateral elbow under heavy loads.",
    alternatives: ["Cable curl with EZ attachment", "Neutral grip dumbbell curls"],
  },
  "cable-wrist-extension": {
    riskAreas: ["wrist", "elbow"],
    reason: "Isolated wrist extension against continuous cable tension places direct strain on the dorsal carpal ligaments and lateral epicondyle.",
    alternatives: ["Isometric towel holds", "Farmer carries with light weights"],
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
  "machine-seated-calf-raises": {
    riskAreas: ["ankle"],
    reason: "Bent-knee ankle plantarflexion isolates the soleus muscle and places direct tension on the distal Achilles tendon.",
    alternatives: ["Gentle ankle mobility rotations", "Isometric calf holds", "Bodyweight seated calf raise"],
  },
  "machine-standing-calf-raises": {
    riskAreas: ["ankle", "knee", "back"],
    reason: "Axial shoulder loading combined with full ankle extension creates high tensile stress across the Achilles tendon, plantar fascia, and spinal column.",
    alternatives: ["Seated calf raise", "Tibialis raises", "Bodyweight calf raises on flat floor"],
  },
  "machine-horizontal-leg-press-calf-raise": {
    riskAreas: ["ankle", "knee"],
    reason: "Loaded plantarflexion against the sled platform stresses the gastrocnemius and Achilles tendon without axial spinal compression.",
    alternatives: ["Machine seated calf raise", "Isometric calf holds"],
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
