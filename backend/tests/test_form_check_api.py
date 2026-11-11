"""API integration tests for POST /api/form-check."""

from io import BytesIO
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image

import app.main as main_module
from app.services.pose.detector import DEFAULT_MODEL_PATH, NoPersonFoundError

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent


def _make_png_bytes(width: int = 320, height: int = 320) -> bytes:
    buf = BytesIO()
    Image.new("RGB", (width, height), color=(200, 200, 200)).save(buf, format="PNG")
    return buf.getvalue()


def _find_sample_photo() -> Path | None:
    for folder in (
        REPO_ROOT / "sample_data" / "photos" / "correct",
        REPO_ROOT / "sample_data" / "photos" / "incorrect",
    ):
        if folder.exists():
            for p in sorted(folder.iterdir()):
                if p.suffix.lower() in {".jpg", ".jpeg", ".png"}:
                    return p
    return None


@pytest.fixture
def api_client(monkeypatch):
    saved_records: list[dict] = []

    async def fake_user():
        return {"id": "user-123", "token": "fake-jwt"}

    async def fake_lookup(exercise_id: str, token: str):
        exercises = {
            "push-up": {"id": "push-up", "name": "Push-up"},
            "bodyweight-squat": {"id": "bodyweight-squat", "name": "Bodyweight squat"},
            "plank": {"id": "plank", "name": "Plank"},
        }
        return exercises.get(exercise_id)

    async def fake_save(user_id: str, token: str, exercise_id: str, score: int, issues: list):
        saved_records.append(
            {
                "user_id": user_id,
                "exercise_id": exercise_id,
                "score": score,
                "issues": issues,
            }
        )

    monkeypatch.setattr(main_module, "lookup_exercise", fake_lookup)
    monkeypatch.setattr(main_module, "save_form_analysis", fake_save)

    class StubDetector:
        def detect_world_landmarks(self, mp_image):
            raise NoPersonFoundError(
                "No person found in the photo. Use a full-body side photo with good light."
            )

        def close(self):
            pass

    app = main_module.app
    app.dependency_overrides[main_module.get_current_user] = fake_user
    app.dependency_overrides[main_module.get_pose_detector] = lambda: StubDetector()

    with TestClient(app) as client:
        yield client, saved_records

    app.dependency_overrides.clear()


def test_401_without_token():
    main_module.app.dependency_overrides.clear()
    with TestClient(main_module.app) as client:
        resp = client.post(
            "/api/form-check",
            data={"exercise_id": "push-up"},
            files={"file": ("test.png", _make_png_bytes(), "image/png")},
        )
    assert resp.status_code == 401


def test_404_unknown_exercise(api_client):
    client, _ = api_client
    resp = client.post(
        "/api/form-check",
        data={"exercise_id": "unknown-exercise"},
        files={"file": ("test.png", _make_png_bytes(), "image/png")},
    )
    assert resp.status_code == 404


def test_415_wrong_file_type(api_client):
    client, _ = api_client
    resp = client.post(
        "/api/form-check",
        data={"exercise_id": "push-up"},
        files={"file": ("bad.txt", b"not an image", "text/plain")},
    )
    assert resp.status_code == 415


def test_413_file_too_large(api_client):
    client, _ = api_client
    too_big = b"\x89PNG\r\n\x1a\n" + (b"\x00" * (5 * 1024 * 1024 + 10))
    resp = client.post(
        "/api/form-check",
        data={"exercise_id": "push-up"},
        files={"file": ("big.png", too_big, "image/png")},
    )
    assert resp.status_code == 413


def test_422_no_person_in_photo(api_client):
    client, saved = api_client
    resp = client.post(
        "/api/form-check",
        data={"exercise_id": "push-up"},
        files={"file": ("blank.png", _make_png_bytes(), "image/png")},
    )
    assert resp.status_code == 422
    assert "No person found" in resp.json()["detail"]
    assert saved == []


@pytest.mark.skipif(not DEFAULT_MODEL_PATH.exists(), reason="MediaPipe model file is missing")
def test_200_with_real_photo_and_privacy_safe_db_record(monkeypatch):
    sample_photo = _find_sample_photo()
    if sample_photo is None:
        pytest.skip("No sample photos found under sample_data/photos/")

    exercise_id = "push-up"
    stem = sample_photo.stem.lower()
    if "squat" in stem:
        exercise_id = "bodyweight-squat"
    elif "plank" in stem:
        exercise_id = "plank"

    saved_records: list[dict] = []

    async def fake_user():
        return {"id": "user-123", "token": "fake-jwt"}

    async def fake_lookup(ex_id: str, token: str):
        return {"id": ex_id, "name": ex_id.replace("-", " ").title()}

    async def fake_save(user_id: str, token: str, ex_id: str, score: int, issues: list):
        saved_records.append(
            {
                "user_id": user_id,
                "exercise_id": ex_id,
                "score": score,
                "issues": issues,
            }
        )

    monkeypatch.setattr(main_module, "lookup_exercise", fake_lookup)
    monkeypatch.setattr(main_module, "save_form_analysis", fake_save)
    main_module.app.dependency_overrides.clear()
    main_module.app.dependency_overrides[main_module.get_current_user] = fake_user

    with TestClient(main_module.app) as client:
        mime = "image/png" if sample_photo.suffix.lower() == ".png" else "image/jpeg"
        resp = client.post(
            "/api/form-check",
            data={"exercise_id": exercise_id},
            files={"file": (sample_photo.name, sample_photo.read_bytes(), mime)},
        )

    main_module.app.dependency_overrides.clear()
    assert resp.status_code == 200
    body = resp.json()
    for key in (
        "exercise_id",
        "exercise_name",
        "score",
        "good_points",
        "issues",
        "measurements",
        "skipped",
        "disclaimer",
    ):
        assert key in body

    assert len(saved_records) == 1
    assert set(saved_records[0].keys()) == {"user_id", "exercise_id", "score", "issues"}
