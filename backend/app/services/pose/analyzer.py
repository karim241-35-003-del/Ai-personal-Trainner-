"""Upload validation and end-to-end photo form-analysis pipeline."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from .detector import PoseDetector, prepare_mp_image
from .rules import evaluate_pose

# PLACEHOLDER upload size limit (5 MB), kept in sync with frontend PHOTO_MAX_MB.
MAX_UPLOAD_BYTES = 5 * 1024 * 1024

JPEG_MAGIC = b"\xff\xd8\xff"
PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


class UploadTooLargeError(Exception):
    """Raised when an upload exceeds MAX_UPLOAD_BYTES (HTTP 413)."""


class InvalidUploadTypeError(Exception):
    """Raised when magic bytes are not JPEG or PNG (HTTP 415)."""


def detect_image_extension(data: bytes) -> str:
    """Identify image format strictly by magic bytes."""
    if data[:3] == JPEG_MAGIC:
        return ".jpg"
    if data[:8] == PNG_MAGIC:
        return ".png"
    raise InvalidUploadTypeError("Only JPEG and PNG images are allowed.")


def validate_upload_bytes(data: bytes) -> str:
    """Validate upload size and magic bytes, returning '.jpg' or '.png'."""
    if len(data) > MAX_UPLOAD_BYTES:
        raise UploadTooLargeError("Photo exceeds the 5 MB size limit.")
    return detect_image_extension(data)


def analyze_photo_file(
    image_path: Path | str,
    exercise_id: str,
    exercise_name: str | None,
    detector: PoseDetector,
    thresholds: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Run Steps 1-6 of the MediaPipe pose pipeline on an image file."""
    mp_image = prepare_mp_image(image_path)
    world_landmarks = detector.detect_world_landmarks(mp_image)
    return evaluate_pose(
        world_landmarks=world_landmarks,
        exercise_id=exercise_id,
        exercise_name=exercise_name,
        thresholds=thresholds,
    )
