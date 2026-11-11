"""Unit tests for 3D joint angle calculations."""

from types import SimpleNamespace
import pytest

from app.services.pose.angles import joint_angle


def pt(x: float, y: float, z: float = 0.0):
    return SimpleNamespace(x=x, y=y, z=z)


def test_right_angle_90_degrees():
    angle = joint_angle(pt(1, 0, 0), pt(0, 0, 0), pt(0, 1, 0))
    assert angle == pytest.approx(90.0, abs=1e-6)


def test_straight_angle_180_degrees():
    angle = joint_angle(pt(-1, 0, 0), pt(0, 0, 0), pt(1, 0, 0))
    assert angle == pytest.approx(180.0, abs=1e-6)


def test_zero_vector_returns_none():
    assert joint_angle(pt(0, 0, 0), pt(0, 0, 0), pt(1, 0, 0)) is None
    assert joint_angle(pt(1, 0, 0), pt(0, 0, 0), pt(0, 0, 0)) is None


def test_reversed_points_keep_same_angle():
    a = pt(1.0, 2.0, 0.5)
    b = pt(0.0, 0.0, 0.0)
    c = pt(-0.5, 1.5, 1.0)
    assert joint_angle(a, b, c) == pytest.approx(joint_angle(c, b, a), abs=1e-6)
