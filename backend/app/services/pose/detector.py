"""Image preprocessing and thread-safe MediaPipe PoseLandmarker wrapper."""

from __future__ import annotations

import threading
from pathlib import Path
from typing import Any

import mediapipe as mp
import numpy as np
from PIL import Image, ImageOps

BACKEND_DIR = Path(__file__).resolve().parents[3]
DEFAULT_MODEL_PATH = BACKEND_DIR / "data" / "models" / "pose_landmarker_full.task"
MAX_IMAGE_SIDE_PX = 1280


class ModelNotFoundError(FileNotFoundError):
    """Raised when the MediaPipe pose landmarker task file is missing."""


class NoPersonFoundError(Exception):
    """Raised when MediaPipe detects no pose in the uploaded image."""


def prepare_mp_image(image_path: Path | str) -> mp.Image:
    """Open an image, fix EXIF orientation, convert to RGB, cap longest side at 1280 px."""
    with Image.open(image_path) as raw_img:
        transposed = ImageOps.exif_transpose(raw_img)
        rgb_img = transposed.convert("RGB")
        if max(rgb_img.size) > MAX_IMAGE_SIDE_PX:
            rgb_img.thumbnail((MAX_IMAGE_SIDE_PX, MAX_IMAGE_SIDE_PX), Image.Resampling.LANCZOS)
        rgb_array = np.asarray(rgb_img)
    return mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_array)


class PoseDetector:
    """Wraps a single PoseLandmarker instance in IMAGE mode with a threading.Lock."""

    def __init__(self, model_path: Path | str | None = None) -> None:
        self.model_path = Path(model_path) if model_path else DEFAULT_MODEL_PATH
        if not self.model_path.exists():
            raise ModelNotFoundError(
                f"Pose model missing at {self.model_path}. Download pose_landmarker_full.task first."
            )
        vision = mp.tasks.vision
        options = vision.PoseLandmarkerOptions(
            base_options=mp.tasks.BaseOptions(model_asset_path=str(self.model_path)),
            running_mode=vision.RunningMode.IMAGE,
            num_poses=1,
        )
        self._landmarker = vision.PoseLandmarker.create_from_options(options)
        self._lock = threading.Lock()

    def detect_world_landmarks(self, mp_image: mp.Image) -> list[Any]:
        """Detect pose_world_landmarks[0] safely or raise NoPersonFoundError."""
        with self._lock:
            result = self._landmarker.detect(mp_image)
        if not result.pose_world_landmarks:
            raise NoPersonFoundError(
                "No person found in the photo. Use a full-body side photo with good light."
            )
        return result.pose_world_landmarks[0]

    def close(self) -> None:
        """Release underlying MediaPipe resources."""
        with self._lock:
            self._landmarker.close()
