"""MediaPipe pose detection and form evaluation services."""

from .analyzer import (
    MAX_UPLOAD_BYTES,
    InvalidUploadTypeError,
    UploadTooLargeError,
    analyze_photo_file,
    detect_image_extension,
    validate_upload_bytes,
)
from .angles import LANDMARK_INDICES, joint_angle
from .detector import (
    DEFAULT_MODEL_PATH,
    ModelNotFoundError,
    NoPersonFoundError,
    PoseDetector,
    prepare_mp_image,
)
from .rules import (
    DEFAULT_THRESHOLDS_PATH,
    PENALTY_PER_ISSUE,
    VISIBILITY_THRESHOLD,
    InsufficientVisibilityError,
    UnsupportedExerciseError,
    evaluate_pose,
    load_thresholds,
)

__all__ = [
    "DEFAULT_MODEL_PATH",
    "DEFAULT_THRESHOLDS_PATH",
    "InvalidUploadTypeError",
    "InsufficientVisibilityError",
    "LANDMARK_INDICES",
    "MAX_UPLOAD_BYTES",
    "ModelNotFoundError",
    "NoPersonFoundError",
    "PENALTY_PER_ISSUE",
    "PoseDetector",
    "UnsupportedExerciseError",
    "UploadTooLargeError",
    "VISIBILITY_THRESHOLD",
    "analyze_photo_file",
    "detect_image_extension",
    "evaluate_pose",
    "joint_angle",
    "load_thresholds",
    "prepare_mp_image",
    "validate_upload_bytes",
]
