#!/usr/bin/env python3
"""Punto de entrada de la aplicación Wayland Automation."""

from __future__ import annotations

import os
import sys


def _bootstrap_qt_platform() -> None:
    """Configurar Qt ANTES de importar PySide6."""
    if os.environ.get("WAYLAND_DISPLAY"):
        # wayland primero; xcb (XWayland) como respaldo si falla el plugin wayland
        os.environ.setdefault("QT_QPA_PLATFORM", "wayland;xcb")
    os.environ.setdefault("QT_ENABLE_HIGHDPI_SCALING", "1")


def main() -> None:
    _bootstrap_qt_platform()

    from PySide6.QtWidgets import QApplication

    from app.config import SCRIPTS_DIR
    from app.ui.main_window import MainWindow
    from app.ui.theme import apply_theme

    if not SCRIPTS_DIR.is_dir():
        print(f"Error: no se encuentra {SCRIPTS_DIR}", file=sys.stderr)
        sys.exit(1)

    app = QApplication(sys.argv)
    apply_theme(app)

    window = MainWindow()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
