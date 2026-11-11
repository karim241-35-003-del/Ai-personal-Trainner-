"""Unit tests for pose evaluation rules, thresholds, visibility, and scoring."""

from types import SimpleNamespace
import pytest

from app.services.pose.rules import InsufficientVisibilityError, evaluate_pose


def make_landmarks():
    return [SimpleNamespace(x=0.0, y=0.0, z=0.0, visibility=0.0) for _ in range(33)]


def set_lm(lms, idx, x, y, z=0.0, visibility=0.95):
    lms[idx] = SimpleNamespace(x=x, y=y, z=z, visibility=visibility)


def test_in_range_scores_100_with_good_point():
    lms = make_landmarks()
    # Bodyweight squat checks left/right hip(23/24)-knee(25/26)-ankle(27/28); range [70, 115]
    # 90 degrees at left knee
    set_lm(lms, 23, 0.0, 1.0, 0.0, 0.95)
    set_lm(lms, 25, 0.0, 0.0, 0.0, 0.95)
    set_lm(lms, 27, 1.0, 0.0, 0.0, 0.95)

    res = evaluate_pose(lms, "bodyweight-squat", "Bodyweight squat")
    assert res["score"] == 100
    assert len(res["good_points"]) == 1
    assert res["issues"] == []
    assert res["skipped"] == []
    assert res["measurements"][0]["status"] == "ok"
    assert res["measurements"][0]["side"] == "left"


def test_low_angle_records_issue_and_deducts_score():
    lms = make_landmarks()
    # Acute ~45 deg at left knee (< 70)
    set_lm(lms, 23, 1.0, 1.0, 0.0, 0.9)
    set_lm(lms, 25, 0.0, 0.0, 0.0, 0.9)
    set_lm(lms, 27, 1.0, 0.0, 0.0, 0.9)

    res = evaluate_pose(lms, "bodyweight-squat", "Bodyweight squat")
    assert res["score"] == 85
    assert len(res["issues"]) == 1
    assert res["issues"][0]["body_part"] == "Knees"
    assert res["measurements"][0]["status"] == "low"


def test_high_angle_records_issue_and_deducts_score():
    lms = make_landmarks()
    # Straight leg 180 deg (> 115)
    set_lm(lms, 24, 0.0, 1.0, 0.0, 0.92)
    set_lm(lms, 26, 0.0, 0.0, 0.0, 0.92)
    set_lm(lms, 28, 0.0, -1.0, 0.0, 0.92)

    res = evaluate_pose(lms, "bodyweight-squat", "Bodyweight squat")
    assert res["score"] == 85
    assert len(res["issues"]) == 1
    assert res["measurements"][0]["status"] == "high"
    assert res["measurements"][0]["side"] == "right"


def test_skipped_joint_when_visibility_below_threshold():
    lms = make_landmarks()
    # Push-up: elbow_bottom visible and ok (90 deg), body_line has low ankle visibility (0.2)
    set_lm(lms, 11, 0.0, 1.0, 0.0, 0.95)
    set_lm(lms, 13, 0.0, 0.0, 0.0, 0.95)
    set_lm(lms, 15, 1.0, 0.0, 0.0, 0.95)
    set_lm(lms, 23, 1.0, 1.0, 0.0, 0.95)
    set_lm(lms, 27, 2.0, 1.0, 0.0, 0.2)

    res = evaluate_pose(lms, "push-up", "Push-up")
    assert res["score"] == 100
    assert len(res["good_points"]) == 1
    assert len(res["skipped"]) == 1
    assert res["skipped"][0]["body_part"] == "Hips & back"


def test_all_checks_skipped_raises_insufficient_visibility():
    lms = make_landmarks()
    # Plank only checks body_line; visibility < 0.5 skips it -> all skipped
    set_lm(lms, 11, 0.0, 1.0, 0.0, 0.4)
    set_lm(lms, 23, 1.0, 1.0, 0.0, 0.9)
    set_lm(lms, 27, 2.0, 1.0, 0.0, 0.9)

    with pytest.raises(InsufficientVisibilityError):
        evaluate_pose(lms, "plank", "Plank")
