#!/usr/bin/env python3
"""Utilidades evdev compartidas para scripts de automatización."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

try:
    from evdev import InputDevice, ecodes, list_devices
except ImportError:
    print(
        "Error: falta el módulo evdev.\n"
        "Instala: sudo pacman -S python-evdev\n"
        "O ejecuta ./core/setup.sh (incluye python-evdev).",
        file=sys.stderr,
    )
    sys.exit(1)

DIGIT_KEYS = {
    ecodes.KEY_0: "0",
    ecodes.KEY_1: "1",
    ecodes.KEY_2: "2",
    ecodes.KEY_3: "3",
    ecodes.KEY_4: "4",
    ecodes.KEY_5: "5",
    ecodes.KEY_6: "6",
    ecodes.KEY_7: "7",
    ecodes.KEY_8: "8",
    ecodes.KEY_9: "9",
    ecodes.KEY_KP0: "0",
    ecodes.KEY_KP1: "1",
    ecodes.KEY_KP2: "2",
    ecodes.KEY_KP3: "3",
    ecodes.KEY_KP4: "4",
    ecodes.KEY_KP5: "5",
    ecodes.KEY_KP6: "6",
    ecodes.KEY_KP7: "7",
    ecodes.KEY_KP8: "8",
    ecodes.KEY_KP9: "9",
}

CLICK_BUTTONS = {
    ecodes.BTN_LEFT: "left",
    ecodes.BTN_RIGHT: "right",
    ecodes.BTN_MIDDLE: "middle",
}


def get_cursor_pos() -> tuple[int, int] | None:
    wl = os.environ.get("WL_FIND_CURSOR")
    if not wl or not Path(wl).is_file():
        return None
    try:
        out = subprocess.check_output([wl, "-p"], text=True, stderr=subprocess.DEVNULL)
        parts = out.strip().split()
        if len(parts) >= 2:
            return int(parts[0]), int(parts[1])
    except (subprocess.CalledProcessError, ValueError, OSError):
        pass
    return None


def open_input_devices() -> list[InputDevice]:
    devices: list[InputDevice] = []
    for path in list_devices():
        try:
            dev = InputDevice(path)
        except OSError:
            continue
        caps = dev.capabilities(verbose=False)
        has_keys = ecodes.EV_KEY in caps
        has_buttons = ecodes.EV_KEY in caps and any(
            code in caps[ecodes.EV_KEY] for code in CLICK_BUTTONS
        )
        if has_keys or has_buttons:
            devices.append(dev)
    return devices


class ModifierState:
    def __init__(self) -> None:
        self.ctrl = False
        self.alt = False
        self.shift = False
        self.super = False

    def update(self, code: int, pressed: bool) -> bool:
        if code in (ecodes.KEY_LEFTCTRL, ecodes.KEY_RIGHTCTRL):
            self.ctrl = pressed
            return True
        if code in (ecodes.KEY_LEFTALT, ecodes.KEY_RIGHTALT):
            self.alt = pressed
            return True
        if code in (ecodes.KEY_LEFTSHIFT, ecodes.KEY_RIGHTSHIFT):
            self.shift = pressed
            return True
        if code in (ecodes.KEY_LEFTMETA, ecodes.KEY_RIGHTMETA):
            self.super = pressed
            return True
        return False

    @property
    def has_chord(self) -> bool:
        return self.ctrl or self.alt or self.super
