"""Exercise threshold loading, side selection, and form scoring rules."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Sequence

from .angles import LANDMARK_INDICES, joint_angle

BACKEND_DIR = Path(__file__).resolve().parents[3]
DEFAULT_THRESHOLDS_PATH = BACKEND_DIR / "data" / "thresholds.json"

# PLACEHOLDER constants, to be confirmed by the trainer.
VISIBILITY_THRESHOLD = 0.5
PENALTY_PER_ISSUE = 15
DISCLAIMER_TEXT = "General guidance from one photo, not medical advice."


class InsufficientVisibilityError(Exception):
    """Raised when every configured joint check lacks required landmark visibility."""


class UnsupportedExerciseError(Exception):
    """Raised when no threshold rules exist for the requested exercise."""


def load_thresholds(path: Path | str | None = None) -> dict[str, Any]:
    """Load form-check angle thresholds from JSON."""
    target = Path(path) if path else DEFAULT_THRESHOLDS_PATH
    with target.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def _landmark_visibility(landmark: Any) -> float:
    """Read landmark visibility safely, defaulting to 0.0 when missing."""
    if hasattr(landmark, "visibility"):
        val = landmark.visibility
        return float(val) if val is not None else 0.0
    if isinstance(landmark, dict):
        return float(landmark.get("visibility", 0.0) or 0.0)
    return 0.0


def _pick_side(world_landmarks: Sequence[Any], joint_names: list[str]) -> tuple[str, list[Any]]:
    """Select 'left' or 'right' based on higher summed visibility across the check's 3 joints."""
    left_lms = [world_landmarks[LANDMARK_INDICES["left"][name]] for name in joint_names]
    right_lms = [world_landmarks[LANDMARK_INDICES["right"][name]] for name in joint_names]
    left_vis = sum(_landmark_visibility(lm) for lm in left_lms)
    right_vis = sum(_landmark_visibility(lm) for lm in right_lms)
    if left_vis >= right_vis:
        return "left", left_lms
    return "right", right_lms


def evaluate_pose(
    world_landmarks: Sequence[Any],
    exercise_id: str,
    exercise_name: str | None = None,
    thresholds: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Evaluate 3D world landmarks against exercise range rules and return the API payload."""
    cfg = thresholds if thresholds is not None else load_thresholds()
    exercises = cfg.get("exercises", {})
    if exercise_id not in exercises:
        raise UnsupportedExerciseError(
            f"Form check is not configured for '{exercise_id}'. Supported exercises: {', '.join(exercises)}."
        )

    ex_cfg = exercises[exercise_id]
    resolved_name = exercise_name or ex_cfg.get("name", exercise_id)
    visibility_min = float(cfg.get("visibility_threshold", VISIBILITY_THRESHOLD))
    penalty = int(cfg.get("penalty_per_issue", PENALTY_PER_ISSUE))

    good_points: list[str] = []
    issues: list[dict[str, str]] = []
    measurements: list[dict[str, Any]] = []
    skipped: list[dict[str, str]] = []

    checks = ex_cfg.get("checks", [])
    for check in checks:
        joint_names = check["joints"]
        body_part = check["body_part"]
        side, selected_lms = _pick_side(world_landmarks, joint_names)

        # Never score a joint that is not clearly visible.
        if any(_landmark_visibility(lm) < visibility_min for lm in selected_lms):
            skipped.append({"body_part": body_part, "reason": "Could not see this joint clearly."})
            continue

        angle = joint_angle(selected_lms[0], selected_lms[1], selected_lms[2])
        if angle is None:
            skipped.append({"body_part": body_part, "reason": "Could not measure this joint angle."})
            continue

        low_bound, high_bound = check["range"]
        messages = check["messages"]
        if angle < low_bound:
            status = "low"
            issues.append({"body_part": body_part, "message": messages["low"]})
        elif angle > high_bound:
            status = "high"
            issues.append({"body_part": body_part, "message": messages["high"]})
        else:
            status = "ok"
            good_points.append(messages["ok"])

        measurements.append(
            {
                "check_id": check["id"],
                "angle_deg": round(angle, 1),
                "range": [low_bound, high_bound],
                "status": status,
                "side": side,
            }
        )

    if checks and len(skipped) == len(checks):
        raise InsufficientVisibilityError(
            "Could not see enough of your body to check your form. Try a clearer, full-body side photo."
        )

    score = max(0, min(100, 100 - penalty * len(issues)))
    return {
        "exercise_id": exercise_id,
        "exercise_name": resolved_name,
        "score": score,
        "good_points": good_points,
        "issues": issues,
        "measurements": measurements,
        "skipped": skipped,
        "disclaimer": DISCLAIMER_TEXT,
    }
