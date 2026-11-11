import { useState, useMemo, useEffect } from "react";
import BodyMap, { MUSCLE_GROUPS } from "../components/BodyMap.jsx";
import { api } from "../api/client.js";
import { detectInjuries, getExerciseContraindication } from "../utils/injuryRules.js";
import "../styles/musclewiki.css";

// Comprehensive exercise database with dual-angle previews, steps, and cues
const MUSCLEWIKI_EXERCISES = [
  {
    id: "dumbbell-russian-twist",
    name: "Dumbbell Russian Twist",
    muscle_id: "abdominals", 
    muscle_group: "core",
    equipment: ["dumbbells"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-russian-twist-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-russian-twist-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-russian-twist-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-russian-twist-front.mp4",
    steps: [
      "Sit on the floor and flex your knees and hips to a 90 degree angle.",
      "Your feet should be hovering off the ground. (If that's too hard start with heels on the floor)",
      "Hold the dumbbell with both hands and rotate your upper spine from side to side to engage your obliques.",
      "Pause briefly at the end of each rotation and reverse the motion under strict control."
    ],
    form_cues: ["Maintain an engaged, flat core", "Do not round the lower back", "Breathe steadily throughout each rep"]
  },
  {
    id: "push-up",
    name: "Push-up",
    muscle_id: "chest",
    muscle_group: "chest",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-push-up-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-push-up-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-push-up-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-push-up-front.mp4",
    steps: [
      "Place your hands shoulder-width apart on the floor, fingers pointing forward.",
      "Extend your legs behind you into a solid plank position, head aligned with heels.",
      "Lower your chest until it is just above the floor, keeping elbows at a 45-degree angle.",
      "Press through your palms and chest to drive back up to full lockout."
    ],
    form_cues: ["Do not let hips sag or hike up", "Keep glutes squeezed and neck neutral", "Full range of motion"]
  },
  {
    id: "dumbbell-incline-bench-press",
    name: "Dumbbell Incline Bench Press",
    muscle_id: "chest",
    muscle_group: "chest",
    equipment: ["dumbbells"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-incline-bench-press-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-incline-bench-press-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-incline-bench-press-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-incline-bench-press-front.mp4",
    steps: [
      "Lay flat on the incline bench with your feet on the ground. Raise the dumbbells until you have straight arms.",
      "Lower the dumbbells to your mid chest",
      "Raise the dumbbells until you've locked your elbows."
    ],
    form_cues: [
      "Maintain a steady incline angle around 30 to 45 degrees",
      "Keep feet flat on the floor for stability",
      "Control the descent to feel a stretch across the upper pectorals"
    ]
  },
  {
    id: "dumbbell-incline-chest-flys",
    name: "Dumbbell Incline Chest Flys",
    muscle_id: "chest",
    muscle_group: "chest",
    equipment: ["dumbbells"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-incline-chest-fly-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-incline-chest-fly-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-dumbbell-incline-chest-fly-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-dumbbell-incline-chest-fly-front.mp4",
    steps: [
      "Lay flat on the bench and place your feet on the ground.",
      "Begin the exercise with the dumbbells held together above your chest, elbows slightly bent.",
      "Simultaneously lower the weights to either side.",
      "Pause when the weights are parallel to the bench, then raise your arms to the starting position."
    ],
    form_cues: [
      "Maintain a constant slight bend in elbows throughout the arc",
      "Lower weights until you feel a comfortable chest stretch without hyperextending shoulders",
      "Squeeze pectorals together at the apex of the movement"
    ]
  },
  {
    id: "dumbbell-bench-press",
    name: "Dumbbell Bench Press",
    muscle_id: "chest",
    muscle_group: "chest",
    equipment: ["dumbbells"],
    level: "novice",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-bench-press-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-bench-press-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-dumbbell-bench-press-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-dumbbell-bench-press-front.mp4",
    steps: [
      "Start by lying flat on a bench with a dumbbell in each hand.",
      "Hold the dumbbells at chest level with your palms facing forward.",
      "Engage your core and press the dumbbells upward until your arms are fully extended."
    ],
    form_cues: [
      "Keep feet firmly planted on the floor and core tight",
      "Press dumbbells in a slight inward arc without banging them together",
      "Lower with control until dumbbells are level with mid-chest"
    ]
  },
  {
    id: "dumbbell-chest-fly",
    name: "Dumbbell Chest Fly",
    muscle_id: "chest",
    muscle_group: "chest",
    equipment: ["dumbbells"],
    level: "novice",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-chest-fly-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-chest-fly-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-dumbbell-chest-fly-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-dumbbell-chest-fly-front.mp4",
    steps: [
      "Lay on a bench with two dumbbells extended in front of you.",
      "You should have a slight bend in your elbows and maintain that bend. Your shoulder joint should do all the movement.",
      "Bring the dumbbells out to your side. Stop the dumbbells before going behind your body.",
      "Bring the dumbbells back together at the top."
    ],
    form_cues: [
      "Lock the angle of your elbows so movement occurs only at the shoulder joints",
      "Do not drop weights below torso plane to protect rotator cuff",
      "Focus on squeezing your chest muscles as you bring the weights together"
    ]
  },
  {
    id: "plank",
    name: "Standard Forearm Plank",
    muscle_id: "abdominals",
    muscle_group: "core",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-forearm-plank-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-forearm-plank-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-forearm-plank-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-forearm-plank-front.mp4",
    steps: [
      "Place your forearms on the floor with elbows aligned directly under your shoulders.",
      "Extend your legs back with toes grounded, establishing a rigid straight-line body bridge.",
      "Tuck your pelvis slightly and draw your navel toward your spine to fire your deep abdominals.",
      "Hold the position firmly while taking slow, controlled breaths."
    ],
    form_cues: ["Brace like preparing for a punch", "Do not hyperextend your cervical spine", "Squeeze quads and glutes"]
  },
  {
    id: "crunch",
    name: "Crunches",
    muscle_id: "abdominals",
    muscle_group: "core",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-crunch-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-crunch-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-crunch-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-crunch-front.mp4",
    steps: [
      "Lay flat on your back with your knees bent and your feet flat on the ground, about a foot from your lower back.",
      "Place your fingertips on your temples with your palms facing out.",
      "Draw your belly into the base of your spine to engage the muscles, then raise your head and shoulders off the floor. Return to starting position and repeat."
    ],
    form_cues: ["Initiate movement by flexing your abdominals, not jerking your neck", "Keep lower back pressed against the floor throughout", "Exhale on contraction"]
  },
  {
    id: "laying-leg-raises",
    name: "Laying Leg Raises",
    muscle_id: "abdominals",
    muscle_group: "core",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-laying-leg-raises-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-laying-leg-raises-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-laying-leg-raises-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-laying-leg-raises-front.mp4",
    steps: [
      "Lay on your back with your arms palms down on either side.",
      "Keep your legs together and as straight as possible.",
      "Slowly raise your legs to a 90° angle, pause at this position, or as high as you can reach your legs, and then slowly lower your legs back down."
    ],
    form_cues: [
      "Keep lower back pressed firmly into the floor",
      "Do not swing legs or use momentum",
      "Control the lowering phase without letting heels slam into the ground"
    ]
  },
  {
    id: "dumbbell-hollow-hold",
    name: "Dumbbell Hollow Hold",
    muscle_id: "abdominals",
    muscle_group: "core",
    equipment: ["dumbbells"],
    level: "advanced",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-hollow-hold-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-hollow-hold-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-hollow-hold-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-hollow-hold-front.mp4",
    steps: [
      "Lay flat on the ground with a dumbbell overhead.",
      "Pull your upper back and legs off the ground. Make a banana shape with your body.",
      "The dumbbell should be held in your hands and your ears should be between your biceps."
    ],
    form_cues: [
      "Press your lower back flush into the ground at all times",
      "Point your toes and keep legs glued together",
      "Breathe continuously while maintaining abdominal hollow compression"
    ]
  },
  {
    id: "dumbbell-situp",
    name: "Dumbbell Situp",
    muscle_id: "abdominals",
    muscle_group: "core",
    equipment: ["dumbbells"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-situp-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-situp-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-situp-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-situp-front.mp4",
    steps: [
      "Lay flat on the ground with your spine neutral. Extend you arms so your fists are pointed at the ceiling.",
      "Sit-up by flexing your abs. Continue to reach for the ceiling for the entire rep."
    ],
    form_cues: [
      "Reach the dumbbell straight up toward the ceiling throughout the sit-up",
      "Initiate by curling through your abdominal wall rather than using arm momentum",
      "Lower yourself down vertebra by vertebra under full control"
    ]
  },
  {
    id: "shoulder-press",
    name: "Dumbbell Overhead Shoulder Press",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    equipment: ["dumbbells"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-overhead-press-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-overhead-press-front.mp4",
    steps: [
      "Sit or stand upright holding dumbbells at ear level with palms facing forward.",
      "Press the dumbbells upward overhead until your arms are fully extended.",
      "Avoid clicking the dumbbells together at the top; keep tension on the deltoids.",
      "Lower the weights slowly and under control back to shoulder height."
    ],
    form_cues: ["Do not arch your lower back excessively", "Keep wrists directly stacked over elbows", "Brace your core"]
  },
  {
    id: "dumbbell-lateral-raise",
    name: "Dumbbell Lateral Raise",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    equipment: ["dumbbells"],
    level: "novice",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-lateral-raise-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-lateral-raise-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-lateral-raise-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-lateral-raise-front.mp4",
    steps: [
      "Stand up straight with dumbbells at either side, palms facing your hips.",
      "Raise your arms on either side with a slight bend in your elbow until they are parallel with the floor. Pause at the top of the motion.",
      "Slowly return your arms down to starting position."
    ],
    form_cues: [
      "Lead with your elbows in the scapular plane",
      "Do not swing your torso or shrug your traps to lift the weight",
      "Pause for 1 second at shoulder level before lowering with control"
    ]
  },
  {
    id: "dumbbell-front-raise",
    name: "Dumbbell Front Raise",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    equipment: ["dumbbells"],
    level: "novice",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-front-raise-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-front-raise-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-front-raise-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-front-raise-front.mp4",
    steps: [
      "Grab two dumbbells while standing upright with the dumbbells at your side.",
      "Raise the two dumbbells with your elbows being fully extended until the dumbbells are eye level.",
      "Lower the weights in a controlled manner to the starting position and repeat."
    ],
    form_cues: [
      "Maintain strict upright posture without leaning back",
      "Raise smoothly to eye level without using momentum",
      "Lower under control, keeping tension on the anterior deltoids"
    ]
  },
  {
    id: "elevated-pike-press",
    name: "Elevated Pike Press",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    equipment: ["bodyweight"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-elevated-pike-press-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-elevated-pike-press-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-elevated-pike-press-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-elevated-pike-press-front.mp4",
    steps: [
      "Use a bench or an object to elevate your feet.",
      "Lower your head towards the floor by bending your elbows",
      "Push through your hands and return to the starting pike position.",
      "Repeat"
    ],
    form_cues: ["Maintain a vertical torso and stacked shoulders over wrists", "Do not flare elbows excessively outward", "Keep core braced throughout the press"]
  },
  {
    id: "backward-arm-circle",
    name: "Backward Arm Circle",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-backward-arm-circle-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-backward-arm-circle-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-backward-arm-circle-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-backward-arm-circle-front.mp4",
    steps: [
      "Hold your arms out to your sides.",
      "Rotate your arms backwards in small circles."
    ],
    form_cues: ["Keep arms straight and parallel to the floor", "Do not shrug shoulders up toward your ears", "Maintain steady rhythmic circular motion"]
  },
  {
    id: "forward-arm-circle",
    name: "Forward Arm Circle",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-forward-arm-circle-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-forward-arm-circle-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-forward-arm-circle-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-forward-arm-circle-front.mp4",
    steps: [
      "Hold your arms out to your sides.",
      "Rotate your arms forward in small circles."
    ],
    form_cues: ["Keep arms locked straight at shoulder height", "Engage deltoids to keep hands level with shoulders", "Control circle size without swaying torso"]
  },
  {
    id: "bodyweight-squat",
    name: "Bodyweight Squat",
    muscle_id: "quads",
    muscle_group: "legs",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bodyweight-squat-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bodyweight-squat-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-bodyweight-squat-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-bodyweight-squat-front.mp4",
    steps: [
      "Stand with feet shoulder-width apart, toes turned slightly outward.",
      "Hinge at the hips and bend knees simultaneously, sitting back as if into a chair.",
      "Descend until your thighs are parallel to the floor, keeping your chest proud.",
      "Push forcefully through your heels and mid-foot to stand back up to starting position."
    ],
    form_cues: ["Track knees in line with toes", "Heels remain glued to the ground", "Chest up, spine neutral"]
  },
  {
    id: "dumbbell-goblet-squat",
    name: "Dumbbell Goblet Squat",
    muscle_id: "quads",
    muscle_group: "legs",
    equipment: ["dumbbells"],
    level: "novice",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-goblet-squat-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-goblet-squat-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-dumbbell-goblet-squat-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-dumbbell-goblet-squat-front.mp4",
    steps: [
      "Hold the weight tucked into your upper chest area, keeping your elbows in. Your feet should be slightly wider than shoulder width.",
      "Sink down into the squat, keeping your elbows inside the track of your knees.",
      "Push through your heels while keeping your chest up and return to starting position."
    ],
    form_cues: [
      "Hold the weight tucked into your upper chest area, keeping elbows in",
      "Sink down into the squat, keeping your elbows inside the track of your knees",
      "Push through your heels while keeping your chest up and return to starting position"
    ]
  },
  {
    id: "goblet-squat",
    name: "Kettlebell Goblet Squat",
    muscle_id: "quads",
    muscle_group: "legs",
    equipment: ["dumbbells"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Kettlebells-kettlebell-goblet-squat-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Kettlebells-kettlebell-goblet-squat-front.mp4",
    steps: [
      "Hold a kettlebell or dumbbell vertically against your sternum with both hands.",
      "Take a shoulder-width stance with feet flared slightly.",
      "Squat down deeply between your knees while maintaining an upright torso.",
      "Drive back up smoothly through the heels to full hip extension."
    ],
    form_cues: ["Keep weight in contact with chest", "Elbows track inside knees", "Brace core before descent"]
  },
  {
    id: "bicep-curl",
    name: "Dumbbell Bicep Curl",
    muscle_id: "biceps",
    muscle_group: "arms",
    equipment: ["dumbbells"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-curl-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-curl-front.mp4",
    steps: [
      "Stand tall holding dumbbells at your sides with palms facing forward.",
      "Keeping your upper arms pinned to your torso, curl the weights toward your shoulders.",
      "Squeeze your biceps hard at the peak contraction.",
      "Lower the dumbbells slowly over 2-3 seconds to the full hang."
    ],
    form_cues: ["Do not swing your hips or use momentum", "Keep elbows locked in position", "Control eccentric descent"]
  },
  {
    id: "dumbbell-hammer-curl",
    name: "Dumbbell Hammer Curl",
    muscle_id: "biceps",
    muscle_group: "arms",
    equipment: ["dumbbells"],
    level: "novice",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-hammer-curl-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-hammer-curl-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-hammer-curl-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-hammer-curl-front.mp4",
    steps: [
      "Hold the dumbbells with a neutral grip (thumbs facing the ceiling).",
      "Slowly lift the dumbbell up to chest height",
      "Return to starting position and repeat."
    ],
    form_cues: [
      "Maintain a strict neutral palms-in grip throughout the entire rep",
      "Keep upper arms stationary and elbows tucked close to your torso",
      "Squeeze the brachialis and forearms at the peak contraction and lower with control"
    ]
  },
  {
    id: "cable-curl",
    name: "Cable Bicep Curl",
    muscle_id: "biceps",
    muscle_group: "arms",
    equipment: ["cables"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-curl-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-curl-front.mp4",
    steps: [
      "Hold the barbell with an underhand shoulder-width grip, arms extended downward.",
      "Keeping your elbows close to your torso, curl the bar upward by flexing your biceps.",
      "Pause and contract your biceps strongly at shoulder level.",
      "Lower the barbell under strict control back to full extension."
    ],
    form_cues: ["Keep upper arms stationary", "Do not lean back or swing the weight", "Full extension at the bottom"]
  },
  {
    id: "chin-ups",
    name: "Chin Ups",
    muscle_id: "biceps",
    muscle_group: "arms",
    equipment: ["bodyweight"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-chinup-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-chinup-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-bodyweight-chinup-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-bodyweight-chinup-front.mp4",
    steps: [
      "Grab the bar shoulder width apart with a supinated grip (palms facing you)",
      "With your body hanging and arms fully extended, pull yourself up until your chin is past the bar.",
      "Slowly return to starting position. Repeat."
    ],
    form_cues: ["Keep chest up and elbows driving downward", "Do not swing legs or kip for momentum", "Squeeze biceps at the top contraction"]
  },
  {
    id: "bodyweight-assisted-chin-up",
    name: "Bodyweight Assisted Chin Up",
    muscle_id: "biceps",
    muscle_group: "arms",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bodyweight-assisted-chin-up-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bodyweight-assisted-chin-up-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-bodyweight-assisted-chin-up-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-bodyweight-assisted-chin-up-front.mp4",
    steps: [
      "Grip the bar/apparatus with an underhand grip, shoulder width apart.",
      "Place your feet on the ground, legs bent slightly.",
      "Use your legs as needed as you pull your chin above the bar."
    ],
    form_cues: ["Use only as much leg assistance as necessary", "Focus on pulling with your biceps and lats", "Lower under complete control"]
  },
  {
    id: "bodyweight-assisted-pull-up",
    name: "Bodyweight Assisted Pull Up",
    muscle_id: "biceps",
    muscle_group: "arms",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bodyweight-assisted-pull-up-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bodyweight-assisted-pull-up-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-bodyweight-assisted-pull-up-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-bodyweight-assisted-pull-up-front.mp4",
    steps: [
      "Grip the bar/apparatus with an overhand grip, shoulder width apart.",
      "Place your feet on the ground, legs bent slightly.",
      "Use your legs as needed as you pull your chin above the bar."
    ],
    form_cues: ["Retract scapulae and drive elbows down", "Smooth cadence on both concentric and eccentric phases", "Keep core stabilized"]
  },
  {
    id: "bodyweight-inverted-curl",
    name: "Bodyweight Inverted Curl",
    muscle_id: "biceps",
    muscle_group: "arms",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bodyweight-inverted-curl-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bodyweight-inverted-curl-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-bodyweight-inverted-curl-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-bodyweight-inverted-curl-front.mp4",
    steps: [
      "Hang from a bar with your heels on the floor.",
      "Bend at the elbows and curl your head towards the bar."
    ],
    form_cues: ["Keep body in a rigid straight plank line", "Curl your face toward your wrists, isolating the biceps", "Control the descent back to straight arms"]
  },
  {
    id: "tricep-dips",
    name: "Bench Tricep Dips",
    muscle_id: "triceps",
    muscle_group: "arms",
    equipment: ["bodyweight"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bench-dips-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bench-dips-front.mp4",
    steps: [
      "Place your hands on the edge of a bench or chair, knuckles facing forward.",
      "Extend your legs forward and slide your glutes just off the bench edge.",
      "Lower your body by bending elbows until upper arms are parallel to the ground.",
      "Press forcefully through your triceps to straighten your arms back up."
    ],
    form_cues: ["Keep your back close to the bench", "Do not flare elbows wide", "Pause at top contraction"]
  },
  {
    id: "dumbbell-skullcrusher",
    name: "Dumbbell Skullcrusher",
    muscle_id: "triceps",
    muscle_group: "arms",
    equipment: ["dumbbells"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-skullcrusher-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-skullcrusher-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-skullcrusher-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-skullcrusher-front.mp4",
    steps: [
      "Lay flat on the floor or a bench with your fists extended to the ceiling and a neutral grip.",
      "Break at the elbows until your fists are by your temples. Then extend your elbows and flex your triceps at the top."
    ],
    form_cues: [
      "Keep upper arms perpendicular to the floor and stationary",
      "Control the descent towards your temples without flaring elbows out",
      "Squeeze your triceps firmly at full extension without slamming the elbow joint"
    ]
  },
  {
    id: "dumbbell-seated-overhead-tricep-extension",
    name: "Dumbbell Seated Overhead Tricep Extension",
    muscle_id: "triceps",
    muscle_group: "arms",
    equipment: ["dumbbells"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-overhead-tricep-extension-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-overhead-tricep-extension-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-seated-overhead-tricep-extension-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-seated-overhead-tricep-extension-front.mp4",
    steps: [
      "Sit on the bench and hold a dumbbell with both hands. Raise the dumbbell overhead at arms length, holding the weight up with the palms of your hands.",
      "Keep your elbows in while you lower the weight behind your head, your upper arms stationary.",
      "Raise the weight back to starting position."
    ],
    form_cues: [
      "Keep elbows tucked forward rather than flaring wide outward",
      "Maintain a proud chest and braced core to prevent lower back hyperextension",
      "Lower to a deep stretch in the long head of the triceps before driving upward"
    ]
  },
  {
    id: "bodyweight-pull-ups",
    name: "Pull Ups",
    muscle_id: "traps",
    secondary_muscles: ["lats"],
    muscle_group: "traps & upper back",
    equipment: ["bodyweight"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-pullup-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-pullup-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-bodyweight-pullup-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-bodyweight-pullup-front.mp4",
    steps: [
      "Grasp the bar with an overhand grip, arms and shoulders fully extended.",
      "Pull your body up until your chin is above the bar.",
      "Lower your body back to starting position."
    ],
    form_cues: [
      "Retract and depress your scapulae before pulling",
      "Lead with the upper back and chest toward the bar",
      "Full range of motion from a dead hang to chin over the bar"
    ]
  },
  {
    id: "bodyweight-pike-shrug",
    name: "Bodyweight Pike Shrug",
    muscle_id: "traps",
    muscle_group: "traps & upper back",
    equipment: ["bodyweight"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bodyweight-pike-shrug-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bodyweight-pike-shrug-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-bodyweight-pike-shrug-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-bodyweight-pike-shrug-front.mp4",
    steps: [
      "Start in a plank position and raise your hips toward the ceiling.",
      "Slowly lower your body (scapula) while keeping your elbows locked (this is key)",
      "Slowly raise your body back to the start position."
    ],
    form_cues: [
      "Keep elbows completely locked throughout the movement to isolate scapular movement",
      "Maintain a steep pike position with hips driven toward the ceiling",
      "Slow and controlled cadence, squeezing traps at the apex"
    ]
  },
  {
    id: "dumbbell-row",
    name: "Single-Arm Dumbbell Row",
    muscle_id: "traps",
    muscle_group: "back",
    equipment: ["dumbbells"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-single-arm-row-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-single-arm-row-front.mp4",
    steps: [
      "Place your right knee and right hand on a flat bench, keeping back parallel to the floor.",
      "Hold a dumbbell in your left hand with arm hanging straight down.",
      "Pull the dumbbell up toward your hip, driving your elbow toward the ceiling.",
      "Lower the dumbbell smoothly back down to full arm extension."
    ],
    form_cues: ["Keep your spine flat and core braced", "Do not rotate your torso at the top", "Pause at peak contraction"]
  },
  {
    id: "dumbbell-romanian-deadlift",
    name: "Dumbbell Romanian Deadlift",
    muscle_id: "hamstrings",
    secondary_muscles: ["lowerback", "glutes"],
    muscle_group: "legs",
    equipment: ["dumbbells"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-romanian-deadlift-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-romanian-deadlift-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-romanian-deadlift-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-romanian-deadlift-front.mp4",
    steps: [
      "Stand with a shoulder width stance. Push your butt back while leaving your knees MOSTLY extended.",
      "You should feel a stretch in your hamstrings. When you feel the stretch, push your hips forward to complete the rep.",
      "Do not push your hips all the way forward. This will hyperextend your spine. Just go to a normal standing position."
    ],
    form_cues: [
      "Maintain a slight, fixed bend in knees throughout the hip hinge",
      "Push your hips straight back and feel tension load through hamstrings",
      "Return to a neutral standing position without hyperextending your spine"
    ]
  },
  {
    id: "dumbbell-leg-curl",
    name: "Dumbbell Leg Curl",
    muscle_id: "hamstrings",
    muscle_group: "legs",
    equipment: ["dumbbells"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-leg-curl-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-leg-curl-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-dumbbell-leg-curl-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-dumbbell-leg-curl-front.mp4",
    steps: [
      "Lay flat on a bench with a dumbbell between your feet.",
      "Flex your knees and raise the dumbbell until the soles of your shoes are pointed at the ceiling."
    ],
    form_cues: [
      "Secure the dumbbell firmly between the arches of your feet",
      "Keep hips pressed flat against the bench to protect your lower back",
      "Lower with control to maintain continuous tension on the hamstrings"
    ]
  },
  {
    id: "single-legged-romanian-deadlifts",
    name: "Single Legged Romanian Deadlifts",
    muscle_id: "hamstrings",
    secondary_muscles: ["lowerback", "glutes"],
    muscle_group: "legs",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-single-legged-romanian-deadlifts-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-single-legged-romanian-deadlifts-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-single-legged-romanian-deadlifts-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-single-legged-romanian-deadlifts-front.mp4",
    steps: [
      "Stand with your feet shoulder-width apart and knees slightly bent and raise one leg.",
      "Without changing the bend in your knee, bend at your hips, and lower your torso until it's almost parallel to the floor.",
      "Tense your glutes and then bring yourself back to the starting position."
    ],
    form_cues: ["Hinge at the hips rather than rounding your spine", "Keep hips square to the ground without rotating open", "Feel the deep stretch along the hamstring of your standing leg"]
  },
  {
    id: "nordic-hamstring-curl",
    name: "Nordic Hamstring Curl",
    muscle_id: "hamstrings",
    muscle_group: "legs",
    equipment: ["bodyweight"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-nordic-hamstring-curl-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-nordic-hamstring-curl-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-nordic-hamstring-curl-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-nordic-hamstring-curl-front.mp4",
    steps: [
      "Go to your knees and ask someone to hold your ankles.",
      "Put your hands in front of you",
      "With a slight bend in your knees slowly bring your body to the ground (slower is better)",
      "Push up and reset to the starting position."
    ],
    form_cues: ["Maintain rigid hip extension from knees through shoulders", "Control the eccentric lowering phase as slowly as possible", "Use hands to catch and push off lightly as needed"]
  },
  {
    id: "bodyweight-reverse-lunge",
    name: "Bodyweight Reverse Lunge",
    muscle_id: "hamstrings",
    muscle_group: "legs",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bodyweight-reverse-lunge-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bodyweight-reverse-lunge-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-bodyweight-reverse-lunge-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-bodyweight-reverse-lunge-front.mp4",
    steps: [
      "Take a big step backwards with your left leg, lowering your body until your left thigh is parallel to the ground and your right knee is bent at a 90-degree angle.",
      "Push through your right heel to return to standing, bringing your left leg back to starting position.",
      "Repeat the movement on the other side, stepping backwards with your right leg and lowering your body until your right thigh is parallel to the ground and your left knee is bent at a 90-degree angle."
    ],
    form_cues: ["Drive through the front heel to maximize glute and hamstring engagement", "Keep torso upright and tall", "Ensure front knee does not collapse inward"]
  },
  {
    id: "glute-bridge",
    name: "Bodyweight Glute Bridge",
    muscle_id: "glutes",
    muscle_group: "glutes",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-glute-bridge-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-glute-bridge-front.mp4",
    steps: [
      "Lie on your back with knees bent and feet flat on the floor, hip-width apart.",
      "Drive through your heels to raise your hips until knees, hips, and shoulders form a line.",
      "Squeeze your glutes tightly at the top for 1-2 seconds.",
      "Lower your hips slowly back toward the floor without completely resting."
    ],
    form_cues: ["Do not overarch your lower back", "Drive through the heels", "Keep ribs down and core engaged"]
  },
  {
    id: "dumbbell-glute-bridge",
    name: "Dumbbell Glute Bridge",
    muscle_id: "glutes",
    muscle_group: "glutes",
    equipment: ["dumbbells"],
    level: "novice",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-glute-bridge-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-glute-bridge-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-glute-bridge-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-glute-bridge-front.mp4",
    steps: [
      "Lay flat on the ground with both feet planted. Make sure you keep your heels glued to the floor.",
      "Place the dumbbell on your hips. Push your hips toward the ceiling until you feel your glutes contract.",
      "Then return to the floor."
    ],
    form_cues: [
      "Keep feet firmly planted with heels glued to the floor",
      "Place the dumbbell securely on your hips and push toward the ceiling",
      "Squeeze glutes at peak contraction without hyperextending your lumbar spine"
    ]
  },
  {
    id: "dumbbell-hip-thrust",
    name: "Dumbbell Hip Thrust",
    muscle_id: "glutes",
    muscle_group: "glutes",
    equipment: ["dumbbells"],
    level: "novice",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-hip-thrust-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-hip-thrust-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-hip-thrust-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-hip-thrust-front.mp4",
    steps: [
      "Place your shoulder blades against a box or bench that won't move.",
      "Both your feet should be planted and your heels should not come off the floor. Point your toes forward.",
      "Break at the hips. Seek the longest range of motion possible. Focus on the top end of the movement. Push your hips as high as possible on each rep."
    ],
    form_cues: [
      "Place shoulder blades securely against the bench or box",
      "Keep feet planted, heels down, and toes pointing forward",
      "Seek full hip extension and squeeze glutes at the top without arching lower back"
    ]
  },
  {
    id: "leg-press",
    name: "Machine Leg Press",
    muscle_id: "quads",
    muscle_group: "legs",
    equipment: ["machine"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Machine-machine-leg-press-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Machine-machine-leg-press-front.mp4",
    steps: [
      "Sit back firmly against the angled seat pad and place feet shoulder-width on the sled platform.",
      "Release the safety handles and lower the platform slowly toward your chest until knees reach 90 degrees.",
      "Drive through your entire foot to push the platform back up.",
      "Stop just short of locking your knees out at the top."
    ],
    form_cues: ["Do not let lower back peel off the back pad", "Never lock knees harshly", "Control the descent"]
  },
  {
    id: "cable-good-morning",
    name: "Cable Good Morning",
    muscle_id: "lowerback",
    muscle_group: "back",
    equipment: ["cables"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-romanian-deadlift-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-romanian-deadlift-front.mp4",
    steps: [
      "Stand upright holding the barbell with an overhand shoulder-width grip.",
      "Hinge back deeply at your hips while keeping knees soft and slightly bent.",
      "Lower the barbell along your thighs until just below knee height.",
      "Drive hips forward forcefully to return to the neutral upright position."
    ],
    form_cues: [
      "Bar remains in contact with legs throughout entire descent",
      "Keep core heavily braced to protect lower back",
      "Avoid locking knees out rigidly"
    ]
  },
  {
    id: "bodyweight-supermans",
    name: "Bodyweight Supermans",
    muscle_id: "lowerback",
    muscle_group: "back",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-supermans-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-supermans-front.mp4",
    steps: [
      "Lie face down flat on a mat with your arms extended forward and legs straight.",
      "Simultaneously raise your arms, chest, and legs off the floor by squeezing your lower back.",
      "Hold the peak contraction for 2 seconds while breathing smoothly.",
      "Lower yourself back down with control and repeat."
    ],
    form_cues: [
      "Keep neck relaxed and eyes focused toward the floor",
      "Do not jerk or wrench your lower spine",
      "Focus on squeezing glutes and spinal erectors"
    ]
  },
  {
    id: "dumbbell-superman",
    name: "Dumbbell Superman",
    muscle_id: "lowerback",
    muscle_group: "back",
    equipment: ["dumbbells"],
    level: "novice",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-superman-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-superman-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-superman-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-superman-front.mp4",
    steps: [
      "Lay flat on the ground on your stomach with your arms extended overhead. Hold a dumbbell with a neutral grip.",
      "Lift your legs and chest off the ground simultaneously and hold for a 1 count at the top.",
      "Relax your lower back and lower your legs and chest back to the floor."
    ],
    form_cues: [
      "Keep neck aligned with spine and avoid hyperextending your cervical vertebrae",
      "Lift chest and legs simultaneously, engaging glutes and spinal erectors",
      "Control the descent smoothly back to the floor without dropping abruptly"
    ]
  },
  {
    id: "dumbbell-goblet-good-morning",
    name: "Dumbbell Goblet Good Morning",
    muscle_id: "lowerback",
    secondary_muscles: ["hamstrings", "glutes"],
    muscle_group: "back",
    equipment: ["dumbbells"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-goblet-good-morning-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-goblet-good-morning-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-goblet-good-morning-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-goblet-good-morning-front.mp4",
    steps: [
      "Hold the dumbbell in a goblet position. With your elbows directly under your fists.",
      "Push your hips back while leaving your knees MOSTLY extended. You should feel a stretch in your hamstrings.",
      "When you feel the stretch push your hips forward until you're back in a standing position."
    ],
    form_cues: [
      "Hold the dumbbell securely in a goblet position against your chest",
      "Hinge at the hips with knees soft and mostly extended, feeling hamstring and lower back tension",
      "Drive hips forward to return to a neutral standing posture without hyperextending"
    ]
  },
  {
    id: "dumbbell-reverse-curl",
    name: "Dumbbell Reverse Curl",
    muscle_id: "forearms",
    muscle_group: "arms",
    equipment: ["dumbbells"],
    level: "novice",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-reverse-curl-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-reverse-curl-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-reverse-curl-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-reverse-curl-front.mp4",
    steps: [
      "Grab the dumbbells with a pronated (overhand) grip. You can do this exercise thumbless if it's more comfortable on your wrists.",
      "Flex at the elbows until your biceps touch your forearms. Try not to let your elbows flair outward."
    ],
    form_cues: [
      "Keep wrists rigid and locked in a neutral or slightly extended alignment",
      "Pin upper arms close to your sides throughout the curl",
      "Focus on the brachioradialis and forearm extensors during the concentric squeeze"
    ]
  },
  {
    id: "dumbbell-wrist-extension",
    name: "Dumbbell Wrist Extension",
    muscle_id: "forearms",
    muscle_group: "arms",
    equipment: ["dumbbells"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-wrist-extension-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-wrist-extension-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-wrist-extension-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-wrist-extension-front.mp4",
    steps: [
      "Grab two dumbbells with an overhand grip and lay your forearms across your knees.",
      "Let your wrists flex fully, then extend your wrists."
    ],
    form_cues: [
      "Keep forearms stationary against your thighs",
      "Only move the wrists through a complete extension",
      "Lower with strict control"
    ]
  },
  {
    id: "dumbbell-wrist-curl",
    name: "Dumbbell Wrist Curl",
    muscle_id: "forearms",
    muscle_group: "arms",
    equipment: ["dumbbells"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-wrist-curl-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-wrist-curl-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-wrist-curl-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-wrist-curl-front.mp4",
    steps: [
      "Sit on a bench holding dumbbells with an underhand grip, palms facing upward.",
      "Lay your forearms across your knees with wrists hanging just over the front edge.",
      "Lower the dumbbells by letting your wrists open downward.",
      "Curl your wrists upward as high as possible, squeezing your forearm flexors tightly."
    ],
    form_cues: [
      "Full range of motion from bottom extension to top curl",
      "Do not lift forearms or elbows off your thighs",
      "Control the downward eccentric phase"
    ]
  },
  {
    id: "cable-wrist-curl",
    name: "Cable Wrist Curl",
    muscle_id: "forearms",
    muscle_group: "arms",
    equipment: ["cables"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-wrist-curl-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-wrist-curl-front.mp4",
    steps: [
      "Kneel next to a flat bench, resting forearms across the surface with palms facing up.",
      "Grip the barbell with hands shoulder-width apart.",
      "Lower the bar toward your fingertips, opening hands slightly for full extension.",
      "Curl the bar back into your palms and flex wrists upward forcefully."
    ],
    form_cues: [
      "Maintain strict wrist isolation without shoulder movement",
      "Pause for 1 second at the top of each contraction"
    ]
  },
  {
    id: "bodyweight-dead-hang",
    name: "Bodyweight Dead Hang",
    muscle_id: "forearms",
    muscle_group: "arms",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-dead-hang-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-dead-hang-front.mp4",
    steps: [
      "Step up to a pull-up bar and grip firmly with an overhand shoulder-width grip.",
      "Allow your full bodyweight to hang freely with arms extended straight overhead.",
      "Engage your grip tightly around the bar, relax your shoulders, and hold for time."
    ],
    form_cues: [
      "Squeeze the bar hard to maximize forearm and grip recruitment",
      "Breathe deeply to allow gentle spinal decompression",
      "Dismount safely before complete grip failure"
    ]
  },
  {
    id: "dumbbell-calf-raise",
    name: "Dumbbell Calf Raise",
    muscle_id: "calves",
    muscle_group: "legs",
    equipment: ["dumbbells"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-calf-raise-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-calf-raise-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-calf-raise-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-calf-raise-front.mp4",
    steps: [
      "Stand tall with your feet on the ground. You can put the balls of your feet on top of a plate to extend the range of motion.",
      "Imagine you have a string attached to your heels and pull your heels up toward the ceiling."
    ],
    form_cues: [
      "Pause for a second at the peak of the contraction for full gastrocnemius recruitment",
      "Lower heels slowly under control below floor/plate level for a deep stretch",
      "Keep core braced and legs straight with soft knees"
    ]
  },
  {
    id: "dumbbell-seated-calf-raise",
    name: "Dumbbell Seated Calf Raise",
    muscle_id: "calves",
    muscle_group: "legs",
    equipment: ["dumbbells"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-calf-raise-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-calf-raise-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-seated-calf-raise-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-seated-calf-raise-front.mp4",
    steps: [
      "Sit on a bench with your feet flat on the floor, holding dumbbells vertically on your thighs just above the knees.",
      "Press through the balls of your feet to raise your heels as high as possible, contracting the soleus muscle.",
      "Lower your heels slowly back down to the ground."
    ],
    form_cues: [
      "Seated calf raises specifically isolate the deep soleus muscle",
      "Do not let dumbbells bounce off your thighs",
      "Full extension at the top and deep stretch at the bottom"
    ]
  },
  {
    id: "walking-calf-raises",
    name: "Walking Calf Raises",
    muscle_id: "calves",
    muscle_group: "legs",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-walking-calf-raises-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-walking-calf-raises-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-walking-calf-raises-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-walking-calf-raises-front.mp4",
    steps: [
      "Walk forward and push your toe into the ground",
      "Lift you heel off the ground each step and tense your calf muscle",
      "Repeat on each leg and walk forward slowly"
    ],
    form_cues: ["Take deliberate, slow strides focusing on ankle flexion", "Press forcefully off the big toe", "Pause briefly at the apex of each step"]
  },
  {
    id: "bodyweight-calf-raises",
    name: "Calf Raises",
    muscle_id: "calves",
    muscle_group: "legs",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-calf-raises-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-calf-raises-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-calf-raises-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-calf-raises-front.mp4",
    steps: [
      "Balance on the balls of your feet on the platform or plates, leaning forward to use the wall to assist with balance.",
      "Lower the heels of your feet towards the ground and pause, then push through the balls of your feet like you are standing tip toe, pausing at the apex of the motion.",
      "Repeat as necessary."
    ],
    form_cues: ["Full stretch at the bottom without bouncing", "Squeeze calves at the very top of the extension", "Maintain a straight, braced posture"]
  },
  {
    id: "bodyweight-donkey-calf-raise",
    name: "Bodyweight Donkey Calf Raise",
    muscle_id: "calves",
    muscle_group: "legs",
    equipment: ["bodyweight"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-donkey-calf-raise-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-donkey-calf-raise-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-donkey-calf-raise-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Bodyweight-donkey-calf-raise-front.mp4",
    steps: [
      "Hold on to something for balance.",
      "Hinge forward and maintain that position. Calf raise until you feel a contraction in your calfs."
    ],
    form_cues: ["Hinge at hips at roughly 90 degrees", "Keep knees mostly straight to stretch and isolate the gastrocnemius", "Full elevation through the balls of feet"]
  },
  {
    id: "cable-lateral-raise",
    name: "Cable Lateral Raise",
    muscle_id: "shoulders",
    muscle_group: "shoulders",
    equipment: ["cables"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-lateral-raise-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-overhead-press-front.mp4",
    steps: [
      "Stand perpendicular to a low pulley cable station holding the handle with your outside hand.",
      "With a slight bend in your elbow, raise the cable out to your side until parallel with the floor.",
      "Pause briefly at the top contraction and lower under strict control."
    ],
    form_cues: ["Keep chest proud and lead with your elbow", "Do not swing or use body momentum"]
  },
  {
    id: "cable-crunch",
    name: "Cable Kneeling Crunch",
    muscle_id: "abdominals",
    muscle_group: "core",
    equipment: ["cables"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-crunch-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-crunch-front.mp4",
    steps: [
      "Kneel below a high cable pulley holding the rope attachment at ear level.",
      "Flex at your waist to crunch your ribcage toward your hips, rounding your spine slightly.",
      "Hold the peak contraction in your abdominals and slowly uncurl back up."
    ],
    form_cues: ["Initiate movement with your abs, not your hips", "Keep hips stationary"]
  },
  {
    id: "cable-tricep-pushdown",
    name: "Cable Tricep Pushdown",
    muscle_id: "triceps",
    muscle_group: "arms",
    equipment: ["cables"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bench-dips-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bench-dips-front.mp4",
    steps: [
      "Attach a bar or rope to a high pulley cable machine.",
      "Tuck your elbows tightly to your sides and pin them in place.",
      "Push the attachment down until your arms are fully extended.",
      "Slowly return up to 90 degrees under complete control."
    ],
    form_cues: ["Do not let elbows flare forward", "Full lockout at bottom"]
  },
  {
    id: "cable-face-pull",
    name: "Cable Face Pull",
    muscle_id: "traps",
    muscle_group: "back",
    equipment: ["cables"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-row-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-row-front.mp4",
    steps: [
      "Set the cable pulley to eye level with a rope attachment.",
      "Pull the center of the rope directly toward your bridge of the nose.",
      "Flaring your elbows high and rotating thumbs back to pinch your upper traps."
    ],
    form_cues: ["Retract shoulder blades fully", "Slow controlled eccentric"]
  },
  {
    id: "cable-lat-pulldown",
    name: "Cable Lat Pulldown",
    muscle_id: "lats",
    muscle_group: "back",
    equipment: ["cables", "machine"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-pull-up-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-pull-up-front.mp4",
    steps: [
      "Grip the wide bar with palms facing forward.",
      "Pull the bar down toward your upper chest while leaning back slightly.",
      "Squeeze your lats at the bottom and control the ascent."
    ],
    form_cues: ["Drive elbows down and back", "Do not use excessive torso swing"]
  },
  {
    id: "dumbbell-row-bilateral",
    name: "Dumbbell Row Bilateral",
    muscle_id: "lats",
    secondary_muscles: ["traps"],
    muscle_group: "back",
    equipment: ["dumbbells"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-row-bilateral-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-row-bilateral-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-row-bilateral-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-row-bilateral-front.mp4",
    steps: [
      "Grab both dumbbells and hinge forward at the hips. Make sure you keep a flat back.",
      "The closer your torso is to parallel with the ground the longer the range of motion will be at your shoulder. The better the results you'll get from the exercise.",
      "Let your arms hang freely, and then pull your elbow joint straight back toward the ceiling."
    ],
    form_cues: [
      "Maintain a flat back and braced core throughout the bent-over position",
      "Pull elbows straight back toward the ceiling, driving with your lats",
      "Control the descent to a full arm hang without rounding your shoulders"
    ]
  },
  {
    id: "dumbbell-row-unilateral",
    name: "Dumbbell Row Unilateral",
    muscle_id: "lats",
    secondary_muscles: ["traps"],
    muscle_group: "back",
    equipment: ["dumbbells"],
    level: "novice",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-row-unilateral-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-row-unilateral-front.mp4",
    videoSideFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-row-unilateral-side.mp4",
    videoFrontFemale: "https://media.musclewiki.com/media/uploads/videos/branded/female-Dumbbells-dumbbell-row-unilateral-front.mp4",
    steps: [
      "Brace your off arm against something stable (bench, box). Stagger your stance so your leg on the side of your working arm is back.",
      "Try to get your torso to parallel with the ground. That will extend your range of motion.",
      "Let your arm hang freely and then pull your elbow back. Imagine you've got a tennis ball in your armpit and squeeze it each rep."
    ],
    form_cues: [
      "Brace your non-working arm securely against a bench or box with a staggered stance",
      "Keep torso near parallel to the floor for maximum range of motion",
      "Pull your elbow back and imagine squeezing a tennis ball in your armpit"
    ]
  },
  {
    id: "machine-chest-press",
    name: "Machine Chest Press",
    muscle_id: "chest",
    muscle_group: "chest",
    equipment: ["machine"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bench-press-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bench-press-front.mp4",
    steps: [
      "Adjust seat height so handles align with mid-chest.",
      "Press the handles forward until arms are extended without locking elbows.",
      "Lower under control until you feel a comfortable stretch in your pecs."
    ],
    form_cues: ["Keep back flat against the pad", "Do not shrug your shoulders"]
  },
  {
    id: "machine-calf-raise",
    name: "Machine Standing Calf Raise",
    muscle_id: "calves",
    muscle_group: "legs",
    equipment: ["machine"],
    level: "beginner",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-calf-raise-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-calf-raise-front.mp4",
    steps: [
      "Position your shoulders beneath the padded levers with balls of feet on the platform.",
      "Lower heels below the platform edge for a deep calf stretch.",
      "Raise up onto the balls of your feet as high as possible."
    ],
    form_cues: ["Hold top contraction 1 second", "Do not bounce"]
  },
  {
    id: "machine-leg-curl",
    name: "Machine Lying Leg Curl",
    muscle_id: "hamstrings",
    muscle_group: "legs",
    equipment: ["machine"],
    level: "intermediate",
    gender: "both",
    videoSide: "https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-deadlift-side.mp4",
    videoFront: "https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-deadlift-front.mp4",
    steps: [
      "Lie face down on the machine with the roller pad behind your lower calves.",
      "Curl your heels toward your glutes, keeping hips pressed flat against the bench.",
      "Slowly extend legs back to the starting stretch."
    ],
    form_cues: ["Do not let hips lift off pad", "Focus on hamstring tension"]
  },
];

const ALL_EQUIPMENT = [
  { id: "bodyweight", label: "Bodyweight" },
  { id: "dumbbells", label: "Dumbbells" },
  { id: "machine", label: "Machine" },
];

// Normalize equipment tokens for robust matching
const normalizeEq = (eq) => {
  if (!eq) return "";
  const s = String(eq).toLowerCase().trim();
  if (s === "dumbbell" || s === "dumbbells") return "dumbbells";
  if (s === "cable" || s === "cables") return "machine";
  if (s === "bodyweight") return "bodyweight";
  if (s === "machine") return "machine";
  return s;
};

export default function Home() {
  const [selectedMuscle, setSelectedMuscle] = useState("abdominals");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [gender, setGender] = useState("male");
  const [difficulty, setDifficulty] = useState("all");
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.getProfile()
      .then(setProfile)
      .catch(() => {});
  }, []);

  const detectedInjuries = useMemo(
    () => detectInjuries(profile?.limitations),
    [profile?.limitations]
  );

  // Filter exercises strictly by selected muscle AND selected equipment
  const filteredExercises = useMemo(() => {
    return MUSCLEWIKI_EXERCISES.filter((ex) => {
      // 1. Muscle filtering
      if (selectedMuscle) {
        const matchesMuscle =
          ex.muscle_id === selectedMuscle ||
          (Array.isArray(ex.muscle_ids) && ex.muscle_ids.includes(selectedMuscle)) ||
          (Array.isArray(ex.secondary_muscles) && ex.secondary_muscles.includes(selectedMuscle));
        if (!matchesMuscle) return false;
      }

      // 2. Strict equipment filtering:
      // If multiple checkboxes are selected, match ANY of them.
      // If no equipment is selected, default to showing all exercises for the muscle.
      if (selectedEquipment.length > 0) {
        const normSelected = selectedEquipment.map(normalizeEq);
        const exEqList = Array.isArray(ex.equipment) ? ex.equipment : [ex.equipment];
        const matchesEq = exEqList.some((eq) => normSelected.includes(normalizeEq(eq)));
        if (!matchesEq) return false;
      }

      // 3. Search query filtering
      if (search.trim()) {
        const rawTerm = search.toLowerCase();
        const termClean = rawTerm.replace(/\s+/g, "");
        const matchesName = ex.name.toLowerCase().includes(rawTerm);
        const matchesMuscle =
          ex.muscle_id.toLowerCase().replace(/\s+/g, "").includes(termClean) ||
          (ex.muscle_group && ex.muscle_group.toLowerCase().replace(/\s+/g, "").includes(termClean)) ||
          (Array.isArray(ex.secondary_muscles) &&
            ex.secondary_muscles.some((m) => m.toLowerCase().replace(/\s+/g, "").includes(termClean)));
        if (!matchesName && !matchesMuscle) return false;
      }

      return true;
    });
  }, [selectedMuscle, selectedEquipment, search]);

  // Synchronize selectedExercise with filteredExercises:
  // When an equipment filter (e.g., Bodyweight) is toggled or muscle is selected,
  // strictly ensure the selectedExercise and displayed video players switch to match!
  useEffect(() => {
    if (filteredExercises.length > 0) {
      const isStillInList = selectedExercise && filteredExercises.some((ex) => ex.id === selectedExercise.id);
      if (!isStillInList) {
        setSelectedExercise(filteredExercises[0]);
      }
    } else {
      setSelectedExercise(null);
    }
  }, [filteredExercises]);

  const toggleEquipment = (id) => {
    const normId = normalizeEq(id);
    setSelectedEquipment((prev) => {
      const prevNorm = prev.map(normalizeEq);
      return prevNorm.includes(normId)
        ? prev.filter((x) => normalizeEq(x) !== normId)
        : [...prev, normId];
    });
  };

  const handleSelectMuscle = (mId) => {
    setSelectedMuscle(mId);
  };

  const selectedContraindication = selectedExercise
    ? getExerciseContraindication(selectedExercise.id, detectedInjuries)
    : { isContraindicated: false, matchedInjuries: [] };

  return (
    <div className="musclewiki-wrapper">
      {/* Top Header Bar */}
      <div className="mw-header">
        <div className="mw-brand-title">
          <h1>AI Powered Personal Trainer</h1>
          <span className="mw-brand-badge">Interactive Guide</span>
        </div>
        <input
          type="search"
          className="mw-search-input"
          placeholder="Search muscle or exercise..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Main Left-to-Right 2-Column Dashboard Layout */}
      <div className="mw-layout-grid">
        {/* ============================================================
            LEFT COLUMN (440px): Body Map, Filters & Exercise Selector
            ============================================================ */}
        <aside className="mw-left-col">
          {/* 1. Interactive Body Map (Front & Back SVG) */}
          <div className="bodymap-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="card-section-title" style={{ margin: 0 }}>Human Body Map</span>
              {selectedMuscle && (
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#2563eb", fontSize: 12, cursor: "pointer", fontWeight: 700 }}
                  onClick={() => setSelectedMuscle("")}
                >
                  Clear Selection
                </button>
              )}
            </div>

            <BodyMap
              selectedMuscle={selectedMuscle}
              onSelectMuscle={handleSelectMuscle}
              gender={gender}
            />

            {/* Quick Muscle Selector Chips */}
            <div className="muscle-chips-row">
              {MUSCLE_GROUPS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`muscle-chip-btn ${selectedMuscle === m.id ? "active" : ""}`}
                  onClick={() => handleSelectMuscle(m.id)}
                >
                  {m.id === "lowerback" ? "Lower Back" : m.id === "calves" ? "Calf Leg" : m.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Sidebar Filters (Equipment Only) */}
          <div className="filters-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 className="card-section-title" style={{ margin: 0 }}>Equipment</h3>
              <button
                type="button"
                style={{ background: "none", border: "none", color: "#2563eb", fontSize: 11, cursor: "pointer", fontWeight: 700 }}
                onClick={() => setSelectedEquipment([])}
              >
                Reset
              </button>
            </div>

            <div className="equipment-filter-list">
              {ALL_EQUIPMENT.map((eq) => {
                const checked = selectedEquipment.includes(eq.id);
                return (
                  <label key={eq.id} className="equipment-checkbox-label">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEquipment(eq.id)}
                    />
                    <span>{eq.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. Matching Movement Selector List */}
          <div className="exercise-selector-card">
            <div className="selector-header">
              <h3 className="selector-title">
                {selectedMuscle
                  ? `${MUSCLE_GROUPS.find((m) => m.id === selectedMuscle)?.label}`
                  : "All Exercises"}
              </h3>
              <span className="selector-count">{filteredExercises.length} found</span>
            </div>

            <div className="exercise-list-scroll">
              {filteredExercises.length === 0 ? (
                <p className="empty" style={{ padding: 18, fontSize: 13 }}>
                  No exercises match this equipment filter.
                </p>
              ) : (
                filteredExercises.map((ex) => {
                  const isSelected = selectedExercise?.id === ex.id;
                  const contra = getExerciseContraindication(ex.id, detectedInjuries);
                  return (
                    <div
                      key={ex.id}
                      className={`ex-selector-item ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedExercise(ex)}
                    >
                      <div className="ex-item-info">
                        <span className="ex-item-name">{ex.name}</span>
                        <div className="ex-item-chips">
                          <span className={`chip level-${ex.level}`}>{ex.level}</span>
                          {ex.equipment.map((eq) => (
                            <span className="chip" key={eq}>{eq}</span>
                          ))}
                          {contra.isContraindicated && (
                            <span className="chip chip-unsafe">
                              ⚠️ Unsafe
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: 16, color: isSelected ? "#ff2d55" : "#94a3b8" }}>
                        {isSelected ? "▶" : "›"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* ============================================================
            RIGHT COLUMN (1fr): Exercise Demonstration View & Steps
            ============================================================ */}
        <main className="mw-right-col">
          {selectedExercise ? (
            <div className="exercise-detail-hero">
              {/* Header Bar */}
              <div className="ex-detail-header-bar">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <h2 className="ex-detail-title">{selectedExercise.name}</h2>
                  <span className={`badge-level level-${selectedExercise.level}`}>{selectedExercise.level}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className="chip" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                    {selectedExercise.muscle_id === "calves"
                      ? "Calf Leg"
                      : selectedExercise.muscle_id === "lowerback"
                      ? "Lower Back"
                      : selectedExercise.muscle_id}
                  </span>
                  {selectedExercise.equipment.map((eq) => (
                    <span className="chip" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }} key={eq}>
                      {eq}
                    </span>
                  ))}
                  <button
                    type="button"
                    className="mw-share-btn"
                    title="Share Exercise"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Exercise link copied to clipboard!");
                      }
                    }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Dual-Angle Looping Demonstration Video Player */}
              <div className="dual-angle-player">
                {/* Angle 1: Side View */}
                <div className="angle-pane">
                  <span className="angle-badge">
                    <span className="angle-badge-dot" /> Side View Demo
                  </span>
                  <div className="demo-stage">
                    <video
                      key={`${selectedExercise.id}-side-${gender}`}
                      src={
                        gender === "female" && selectedExercise.videoSideFemale
                          ? selectedExercise.videoSideFemale
                          : selectedExercise.videoSide
                      }
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="demo-video-player"
                    />
                    <div className="demo-cadence-bar" />
                  </div>
                </div>

                {/* Angle 2: Front View */}
                <div className="angle-pane">
                  <span className="angle-badge">
                    <span className="angle-badge-dot" /> Front View Demo
                  </span>
                  <div className="demo-stage">
                    <video
                      key={`${selectedExercise.id}-front-${gender}`}
                      src={
                        gender === "female" && selectedExercise.videoFrontFemale
                          ? selectedExercise.videoFrontFemale
                          : selectedExercise.videoFront
                      }
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="demo-video-player"
                    />
                    <div className="demo-cadence-bar" style={{ animationDelay: "1.6s" }} />
                  </div>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="instructions-container">
                <h3 className="instructions-heading">Step-by-Step Instructions</h3>
                <div className="steps-list">
                  {selectedExercise.steps.map((step, idx) => (
                    <div className="step-item" key={idx}>
                      <span className="step-number">{idx + 1}</span>
                      <p className="step-text">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Key Form Checkpoints */}
                {selectedExercise.form_cues?.length > 0 && (
                  <div className="form-cues-box">
                    <strong>💡 Form Checkpoints & Key Cues</strong>
                    <ul>
                      {selectedExercise.form_cues.map((cue, i) => (
                        <li key={i}>{cue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Injury Safety Notice (Integrated with our Safety Rules Engine) */}
                {selectedContraindication.isContraindicated && (
                  <div className="safety-warning-box" style={{ marginTop: 20 }}>
                    <strong>⛔ Medical Safety Alert: {selectedContraindication.matchedInjuries.join(", ")} injury</strong>
                    <p style={{ margin: "4px 0" }}>{selectedContraindication.reason}</p>
                    {selectedContraindication.alternatives?.length > 0 && (
                      <div style={{ marginTop: 8 }}>
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
              </div>
            </div>
          ) : (
            <div className="demo-placeholder-card">
              <h2>Select an Exercise</h2>
              <p>Click on any muscle group in the body map on the left to see dual-angle video demonstrations and instructions.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
