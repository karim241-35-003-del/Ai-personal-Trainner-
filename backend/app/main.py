"""FastAPI service for MediaPipe photo form-check analysis."""

from __future__ import annotations

import os
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware

from .services.pose import (
    MAX_UPLOAD_BYTES,
    InsufficientVisibilityError,
    InvalidUploadTypeError,
    ModelNotFoundError,
    NoPersonFoundError,
    PoseDetector,
    UnsupportedExerciseError,
    UploadTooLargeError,
    analyze_photo_file,
    load_thresholds,
    validate_upload_bytes,
)

BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")


def _supabase_config() -> tuple[str, str]:
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_ANON_KEY", "")
    if not url or not key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase configuration missing on server.",
        )
    return url, key


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize PoseLandmarker once at startup and close it on shutdown."""
    app.state.thresholds = load_thresholds()
    try:
        app.state.pose_detector = PoseDetector()
    except ModelNotFoundError:
        app.state.pose_detector = None
    yield
    if app.state.pose_detector is not None:
        app.state.pose_detector.close()


app = FastAPI(title="AI Personal Trainer - Pose Form Check", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_current_user(authorization: str | None = Header(default=None)) -> dict[str, str]:
    """Validate the Bearer JWT against Supabase Auth."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization token",
        )
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization token",
        )

    supabase_url, supabase_key = _supabase_config()
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            f"{supabase_url}/auth/v1/user",
            headers={"apikey": supabase_key, "Authorization": f"Bearer {token}"},
        )
    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    data = resp.json()
    return {"id": data["id"], "token": token}


async def lookup_exercise(exercise_id: str, token: str) -> dict[str, Any] | None:
    """Fetch exercise metadata from Supabase exercises table."""
    supabase_url, supabase_key = _supabase_config()
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            f"{supabase_url}/rest/v1/exercises",
            params={"id": f"eq.{exercise_id}", "select": "id,name"},
            headers={"apikey": supabase_key, "Authorization": f"Bearer {token}"},
        )
    if resp.status_code != 200:
        return None
    rows = resp.json()
    return rows[0] if rows else None


async def save_form_analysis(
    user_id: str,
    token: str,
    exercise_id: str,
    score: int,
    issues: list[dict[str, str]],
) -> None:
    """Persist only privacy-safe summary fields to Supabase form_analyses."""
    supabase_url, supabase_key = _supabase_config()
    payload = {
        "user_id": user_id,
        "exercise_id": exercise_id,
        "score": score,
        "issues": issues,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            f"{supabase_url}/rest/v1/form_analyses",
            json=payload,
            headers={
                "apikey": supabase_key,
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            },
        )
    if resp.status_code not in (200, 201, 204):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to save form analysis record.",
        )


def get_pose_detector(request: Request) -> PoseDetector:
    detector = getattr(request.app.state, "pose_detector", None)
    if detector is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Pose landmarker model is not loaded on the server.",
        )
    return detector


def get_thresholds(request: Request) -> dict[str, Any]:
    thresholds = getattr(request.app.state, "thresholds", None)
    return thresholds if thresholds is not None else load_thresholds()


def _keep_uploads_enabled() -> bool:
    return os.getenv("KEEP_UPLOADS", "").strip().lower() == "true"


def _write_temp_upload(data: bytes, ext: str) -> Path:
    if _keep_uploads_enabled():
        upload_dir = BACKEND_DIR / "uploads"
        upload_dir.mkdir(parents=True, exist_ok=True)
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext, dir=upload_dir)
    else:
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    try:
        tmp.write(data)
        tmp.flush()
        return Path(tmp.name)
    finally:
        tmp.close()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/form-check")
async def check_form(
    request: Request,
    exercise_id: str = Form(...),
    file: UploadFile = File(...),
    user: dict[str, str] = Depends(get_current_user),
    detector: PoseDetector = Depends(get_pose_detector),
    thresholds: dict[str, Any] = Depends(get_thresholds),
) -> dict[str, Any]:
    """Analyze an uploaded exercise photo with MediaPipe Pose and score form."""
    exercise = await lookup_exercise(exercise_id, user["token"])
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown exercise '{exercise_id}'.",
        )

    # Read up to MAX_UPLOAD_BYTES + 1 so oversized payloads are caught cleanly with 413.
    raw_bytes = await file.read(MAX_UPLOAD_BYTES + 1)
    try:
        ext = validate_upload_bytes(raw_bytes)
    except UploadTooLargeError as exc:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=str(exc)) from exc
    except InvalidUploadTypeError as exc:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=str(exc)) from exc

    temp_path = _write_temp_upload(raw_bytes, ext)
    try:
        result = analyze_photo_file(
            image_path=temp_path,
            exercise_id=exercise_id,
            exercise_name=exercise.get("name"),
            detector=detector,
            thresholds=thresholds,
        )
    except (NoPersonFoundError, InsufficientVisibilityError) as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    except UnsupportedExerciseError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        if not _keep_uploads_enabled():
            temp_path.unlink(missing_ok=True)

    await save_form_analysis(
        user_id=user["id"],
        token=user["token"],
        exercise_id=result["exercise_id"],
        score=result["score"],
        issues=result["issues"],
    )
    return result
