import { useState, useMemo } from "react";
import {
  MALE_FRONT,
  MALE_BACK,
  FEMALE_FRONT,
  FEMALE_BACK,
} from "@musclemap/assets";

/**
 * Muscle group labels & metadata
 */
export const MUSCLE_GROUPS = [
  { id: "chest", label: "Chest (Pectorals)", view: "front" },
  { id: "abdominals", label: "Abs", view: "front" },
  { id: "shoulders", label: "Shoulders (Deltoids)", view: "both" },
  { id: "biceps", label: "Biceps", view: "front" },
  { id: "triceps", label: "Triceps", view: "back" },
  { id: "forearms", label: "Forearms", view: "both" },
  { id: "quads", label: "Quads (Quadriceps)", view: "front" },
  { id: "hamstrings", label: "Hamstrings", view: "back" },
  { id: "glutes", label: "Glutes (Gluteals)", view: "back" },
  { id: "calves", label: "Calf Leg", view: "both" },
  { id: "lats", label: "Lats (Latissimus Dorsi)", view: "back" },
  { id: "traps", label: "Traps & Upper Back", view: "back" },
  { id: "lowerback", label: "Lower Back", view: "back" },
];

/**
 * Maps @musclemap/assets anatomical group IDs to application muscle IDs
 * @param {string} group - Group name from asset definition
 * @param {"front" | "back"} view - Perspective view
 * @returns {string} Matching muscle ID from MUSCLE_GROUPS
 */
export function mapAssetToAppMuscle(group, view = "front") {
  if (group === "CORE" || group === "OBLIQUES") return "abdominals";
  if (
    group === "SHOULDERS_FRONT" ||
    group === "SHOULDERS_SIDE" ||
    group === "SHOULDERS_REAR"
  )
    return "shoulders";
  if (group === "TRAPEZIUS" || group === "RHOMBOIDS") return "traps";
  if (group === "BACK_LOWER") return "lowerback";
  if (group === "GLUTES") return "glutes";
  if (group === "HAMSTRINGS") return "hamstrings";
  if (group === "CALVES") return "calves";
  if (group === "LATS") return "lats";
  if (group === "BICEPS") return "biceps";
  if (group === "TRICEPS") return "triceps";
  if (group === "FOREARMS") return "forearms";
  if (group === "CHEST") return "chest";
  if (group === "QUADS") return "quads";
  if (group === "ADDUCTORS") return view === "back" ? "hamstrings" : "quads";
  if (group === "ABDUCTORS") return view === "back" ? "glutes" : "quads";
  return "";
}

/**
 * Interactive Front & Back Human Body Muscle Map (SVG)
 * Detailed anatomical vector line art matching MuscleWiki dashboard design
 *
 * @param {Object} props
 * @param {string} [props.selectedMuscle=""] - Currently active muscle id (e.g. "abdominals")
 * @param {Function} [props.onSelectMuscle] - Callback when a muscle is clicked
 * @param {boolean} [props.mini=false] - Whether to render in compact mini mode (for sidebar)
 * @param {"male" | "female"} [props.gender="male"] - Anatomy model selection
 */
export default function BodyMap({
  selectedMuscle = "",
  onSelectMuscle = () => {},
  mini = false,
  gender = "male",
}) {
  const [hovered, setHovered] = useState(null);

  // Select front and back anatomical diagrams based on selected gender
  const frontModel = gender === "female" ? FEMALE_FRONT : MALE_FRONT;
  const backModel = gender === "female" ? FEMALE_BACK : MALE_BACK;

  const isSelected = (id) => selectedMuscle === id;
  const isHovered = (id) => hovered === id;

  const getMuscleFill = (id) => {
    if (isSelected(id)) return "#ff2d55"; // MuscleWiki vibrant coral-red
    if (isHovered(id)) return "#fda4af"; // Soft coral hover
    return "#f1f5f9"; // Neutral anatomical body fill
  };

  const getMuscleStroke = (id) => {
    if (isSelected(id)) return "#be123c";
    return "#334155";
  };

  const handleClick = (id) => {
    if (!id) return;
    if (selectedMuscle === id) {
      onSelectMuscle(""); // toggle off to all
    } else {
      onSelectMuscle(id);
    }
  };

  const activeLabel = useMemo(() => {
    if (hovered) {
      return MUSCLE_GROUPS.find((m) => m.id === hovered)?.label || "";
    }
    if (selectedMuscle) {
      return `Selected: ${
        MUSCLE_GROUPS.find((m) => m.id === selectedMuscle)?.label || ""
      }`;
    }
    return "Click any muscle group to view matching exercises";
  }, [hovered, selectedMuscle]);

  // Render base body outline silhouette
  const renderOutline = (model) => {
    return model.outline.map((o, idx) => (
      <path
        key={`outline-${idx}`}
        d={o.d}
        fill="#f8fafc"
        stroke="#334155"
        strokeWidth="2.2"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    ));
  };

  // Anatomical head and neck facial contour accent lines
  const renderHeadAccents = (isFront) => {
    if (isFront) {
      return (
        <g
          stroke="#334155"
          strokeWidth="1.8"
          vectorEffect="non-scaling-stroke"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: "none" }}
        >
          {/* Chin & Jaw contour */}
          <path
            d="M 470 182 C 480 236, 544 236, 554 182"
            vectorEffect="non-scaling-stroke"
          />
          {/* Neck contours */}
          <path
            d="M 472 188 C 472 215, 465 240, 460 262"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 552 188 C 552 215, 559 240, 564 262"
            vectorEffect="non-scaling-stroke"
          />
          {/* Hairline contour */}
          <path
            d="M 465 110 C 475 90, 512 82, 512 82 C 512 82, 549 90, 559 110"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      );
    }
    return (
      <g
        stroke="#334155"
        strokeWidth="1.8"
        vectorEffect="non-scaling-stroke"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pointerEvents: "none" }}
      >
        {/* Hairline back contour */}
        <path
          d="M 468 152 C 485 185, 539 185, 556 152"
          vectorEffect="non-scaling-stroke"
        />
        {/* Neck contours back */}
        <path
          d="M 475 168 C 475 195, 468 215, 460 240"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M 549 168 C 549 195, 556 215, 564 240"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    );
  };

  // Render clickable muscle paths with dynamic fills, tooltips and hover triggers
  const renderMuscles = (model, view) => {
    return model.muscles.map((m, idx) => {
      const muscleId = mapAssetToAppMuscle(m.group, view);
      const active = isSelected(muscleId);
      const fill = getMuscleFill(muscleId);
      const stroke = getMuscleStroke(muscleId);

      return (
        <path
          key={`${view}-${m.id || idx}`}
          id={`${view}-${m.id || m.group}-${idx}`}
          d={m.d}
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="muscle-path"
          style={{
            cursor: muscleId ? "pointer" : "default",
            transition:
              "fill 0.18s ease, stroke 0.18s ease, filter 0.18s ease",
            filter: active
              ? "drop-shadow(0 0 5px rgba(255, 45, 85, 0.45))"
              : "none",
          }}
          onMouseEnter={() => muscleId && setHovered(muscleId)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleClick(muscleId)}
        >
          {muscleId && (
            <title>
              {MUSCLE_GROUPS.find((g) => g.id === muscleId)?.label || m.group}
            </title>
          )}
        </path>
      );
    });
  };

  return (
    <div className={`body-map-container ${mini ? "body-map-mini" : ""}`}>
      {/* Interactive Hover Tooltip */}
      {!mini && <div className="body-map-tooltip">{activeLabel}</div>}

      <div className="body-map-svg-grid">
        {/* FRONT BODY VIEW */}
        <div className="body-map-figure">
          <span className="figure-label">Front View</span>
          <svg
            viewBox={frontModel.viewBox}
            className="body-map-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Base Body Silhouette */}
            {renderOutline(frontModel)}
            {/* Anatomical Head/Neck Contours */}
            {renderHeadAccents(true)}
            {/* Clickable Muscle Groups */}
            <g className="muscle-clickable-group">
              {renderMuscles(frontModel, "front")}
            </g>
          </svg>
        </div>

        {/* BACK BODY VIEW */}
        <div className="body-map-figure">
          <span className="figure-label">Back View</span>
          <svg
            viewBox={backModel.viewBox}
            className="body-map-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Base Body Silhouette */}
            {renderOutline(backModel)}
            {/* Anatomical Head/Neck Contours */}
            {renderHeadAccents(false)}
            {/* Clickable Muscle Groups */}
            <g className="muscle-clickable-group">
              {renderMuscles(backModel, "back")}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
