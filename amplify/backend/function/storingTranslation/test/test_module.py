import pytest


def test_init():
    assert pytest.approx(1.0) == 1.0001

