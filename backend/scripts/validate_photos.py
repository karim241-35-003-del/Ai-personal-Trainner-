"""Run every photo in sample_data/photos/{correct,incorrect}/ through POST /api/form-check
and write the validation table to backend/docs/form_check_validation.md.
"""

from __future__ import annotations

import sys
from pathlib import Path

from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))

import app.main as main_module  # noqa: E402

EXERCISE_NAMES = {
    "push-up": "Push-up",
    "bodyweight-squat": "Bodyweight squat",
    "plank": "Plank",
}


def infer_exercise_id(photo_path: Path) -> str:
    text = str(photo_path).lower()
    if "squat" in text:
        return "bodyweight-squat"
    if "plank" in text:
        return "plank"
    return "push-up"


def main() -> int:
    photos_root = REPO_ROOT / "sample_data" / "photos"
    correct_dir = photos_root / "correct"
    incorrect_dir = photos_root / "incorrect"

    if not correct_dir.exists() or not incorrect_dir.exists():
        print(f"Missing {correct_dir} or {incorrect_dir}. Add your photos first.")
        return 1

    async def fake_user():
        return {"id": "validation-runner", "token": "validation-token"}

    async def fake_lookup(ex_id: str, token: str):
        return {"id": ex_id, "name": EXERCISE_NAMES.get(ex_id, ex_id)}

    async def fake_save(*args, **kwargs):
        return None

    main_module.lookup_exercise = fake_lookup
    main_module.save_form_analysis = fake_save
    main_module.app.dependency_overrides[main_module.get_current_user] = fake_user

    rows: list[dict] = []
    with TestClient(main_module.app) as client:
        for label, folder in (("correct", correct_dir), ("incorrect", incorrect_dir)):
            for photo in sorted(folder.rglob("*")):
                if photo.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
                    continue
                ex_id = infer_exercise_id(photo)
                mime = "image/png" if photo.suffix.lower() == ".png" else "image/jpeg"
                resp = client.post(
                    "/api/form-check",
                    data={"exercise_id": ex_id},
                    files={"file": (photo.name, photo.read_bytes(), mime)},
                )
                if resp.status_code == 200:
                    data = resp.json()
                    rows.append(
                        {
                            "file": photo.name,
                            "exercise": ex_id,
                            "label": label,
                            "score": data["score"],
                            "issues": "; ".join(f"{i['body_part']}: {i['message']}" for i in data["issues"]) or "None",
                            "skipped": "; ".join(f"{s['body_part']}: {s['reason']}" for s in data["skipped"]) or "None",
                        }
                    )
                else:
                    rows.append(
                        {
                            "file": photo.name,
                            "exercise": ex_id,
                            "label": label,
                            "score": f"HTTP {resp.status_code}",
                            "issues": resp.json().get("detail", "Error"),
                            "skipped": "-",
                        }
                    )

    docs_dir = BACKEND_DIR / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)
    out_file = docs_dir / "form_check_validation.md"

    correct_scores = [r["score"] for r in rows if r["label"] == "correct" and isinstance(r["score"], int)]
    incorrect_scores = [r["score"] for r in rows if r["label"] == "incorrect" and isinstance(r["score"], int)]
    higher_pairs = 0
    total_pairs = len(correct_scores) * len(incorrect_scores)
    for cs in correct_scores:
        for ins in incorrect_scores:
            if cs > ins:
                higher_pairs += 1

    lines = [
        "# Form Check Photo Validation",
        "",
        "| File | Exercise | Label | Score | Issues | Skipped |",
        "|---|---|---|---:|---|---|",
    ]
    for r in rows:
        lines.append(
            f"| {r['file']} | {r['exercise']} | {r['label']} | {r['score']} | {r['issues']} | {r['skipped']} |"
        )
    lines.extend(
        [
            "",
            f"- Correct photos tested: {len(correct_scores)}",
            f"- Incorrect photos tested: {len(incorrect_scores)}",
            f"- Correct > Incorrect pairs: {higher_pairs}/{total_pairs}",
        ]
    )
    out_file.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {out_file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
