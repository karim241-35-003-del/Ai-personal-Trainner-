"""Joint geometry and MediaPipe landmark index definitions."""

from __future__ import annotations

import math
from typing import Any

# MediaPipe Pose landmark indices for left and right sides.
LANDMARK_INDICES: dict[str, dict[str, int]] = {
    "left": {
        "shoulder": 11,
        "elbow": 13,
        "wrist": 15,
        "hip": 23,
        "knee": 25,
        "ankle": 27,
    },
    "right": {
        "shoulder": 12,
        "elbow": 14,
        "wrist": 16,
        "hip": 24,
        "knee": 26,
        "ankle": 28,
    },
}


def _coords(point: Any) -> tuple[float, float, float]:
    """Extract (x, y, z) coordinates from a landmark object or sequence."""
    if hasattr(point, "x") and hasattr(point, "y"):
        return float(point.x), float(point.y), float(getattr(point, "z", 0.0))
    if len(point) == 2:
        return float(point[0]), float(point[1]), 0.0
    return float(point[0]), float(point[1]), float(point[2])


def joint_angle(a: Any, b: Any, c: Any) -> float | None:
    """Return the angle in degrees at vertex b between vectors (a - b) and (c - b).

    Returns None when either vector has zero length.
    """
    ax, ay, az = _coords(a)
    bx, by, bz = _coords(b)
    cx, cy, cz = _coords(c)

    v1x, v1y, v1z = ax - bx, ay - by, az - bz
    v2x, v2y, v2z = cx - bx, cy - by, cz - bz

    norm1 = math.sqrt(v1x * v1x + v1y * v1y + v1z * v1z)
    norm2 = math.sqrt(v2x * v2x + v2y * v2y + v2z * v2z)
    if norm1 <= 1e-9 or norm2 <= 1e-9:
        return None

    dot = v1x * v2x + v1y * v2y + v1z * v2z
    cosine = max(-1.0, min(1.0, dot / (norm1 * norm2)))
    return math.degrees(math.acos(cosine))
