"""Paleta Catppuccin Mocha y hoja de estilos Qt."""

from __future__ import annotations

from PySide6.QtGui import QFont
from PySide6.QtWidgets import QApplication


class Theme:
    BG = "#181825"
    SURFACE = "#1e1e2e"
    SURFACE_ALT = "#252536"
    SURFACE_HOVER = "#313244"
    BORDER = "#313244"
    BORDER_SUBTLE = "#282837"
    BORDER_FOCUS = "#89b4fa"
    TEXT = "#eff1f5"
    SUBTEXT = "#a6adc8"
    MUTED = "#7f849c"
    BLUE = "#89b4fa"
    BLUE_HOVER = "#b4befe"
    GREEN = "#a6e3a1"
    RED = "#f38ba8"
    RED_HOVER = "#eba0ac"
    MAUVE = "#cba6f7"
    ON_ACCENT = "#11111b"


FONT_FAMILY = "Cantarell, Noto Sans, sans-serif"
FONT_MONO = "JetBrains Mono, Fira Code, monospace"


def apply_theme(app: QApplication) -> None:
    font = QFont("Cantarell", 13)
    font.setStyleHint(QFont.StyleHint.SansSerif)
    app.setFont(font)

    app.setStyleSheet(
        f"""
        QWidget {{
            background-color: {Theme.BG};
            color: {Theme.TEXT};
            font-size: 13px;
        }}

        QMainWindow {{
            background-color: {Theme.BG};
        }}

        QLabel#title {{
            font-size: 26px;
            font-weight: 800;
            color: {Theme.TEXT};
            letter-spacing: 0.3px;
        }}

        QLabel#subtitle {{
            color: {Theme.SUBTEXT};
            font-size: 14px;
        }}

        QFrame#card {{
            background-color: {Theme.SURFACE};
            border: 1px solid {Theme.BORDER_SUBTLE};
            border-radius: 12px;
        }}

        QFrame#statusCard {{
            background-color: {Theme.SURFACE};
            border: 1px solid {Theme.BORDER_SUBTLE};
            border-radius: 12px;
        }}

        QLabel#cardTitle {{
            font-size: 15px;
            font-weight: 700;
            color: {Theme.TEXT};
            background: transparent;
        }}

        QLabel#cardDesc {{
            color: {Theme.SUBTEXT};
            font-size: 13px;
            line-height: 1.4;
            background: transparent;
        }}

        QLabel#fieldLabel {{
            color: {Theme.TEXT};
            font-size: 13px;
            font-weight: 600;
            background: transparent;
        }}

        QLabel#logTitle {{
            font-size: 14px;
            font-weight: 700;
            color: {Theme.TEXT};
            background: transparent;
            padding-bottom: 4px;
        }}

        QLabel#statusOk, QLabel#statusErr, QLabel#statusPending {{
            font-size: 18px;
            font-weight: 800;
            background: transparent;
            padding: 6px 0 10px 0;
        }}

        QLabel#statusOk {{
            color: {Theme.GREEN};
        }}

        QLabel#statusErr {{
            color: {Theme.RED};
        }}

        QLabel#statusPending {{
            color: {Theme.MUTED};
            font-size: 15px;
            font-weight: 600;
        }}

        QLabel#hintAccent {{
            color: {Theme.MAUVE};
            font-size: 13px;
            font-weight: 600;
            background: transparent;
        }}

        QTabWidget::pane {{
            border: none;
            border-top: 1px solid {Theme.BORDER_SUBTLE};
            border-radius: 0 0 10px 10px;
            background: {Theme.SURFACE};
            top: -1px;
            padding: 12px 4px 4px 4px;
        }}

        QTabBar::tab {{
            background: transparent;
            color: {Theme.MUTED};
            padding: 10px 20px;
            margin-right: 4px;
            font-size: 14px;
            font-weight: 600;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
            border: none;
            border-bottom: 2px solid transparent;
        }}

        QTabBar::tab:hover {{
            background: {Theme.SURFACE_ALT};
            color: {Theme.SUBTEXT};
        }}

        QTabBar::tab:selected {{
            background: {Theme.SURFACE};
            color: {Theme.TEXT};
            border: none;
            border-bottom: 2px solid {Theme.BLUE};
        }}

        QPushButton {{
            background-color: {Theme.SURFACE_ALT};
            color: {Theme.TEXT};
            border: none;
            border-radius: 10px;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 600;
            min-height: 20px;
        }}

        QPushButton:hover {{
            background-color: {Theme.SURFACE_HOVER};
            color: {Theme.TEXT};
        }}

        QPushButton:pressed {{
            background-color: {Theme.BG};
        }}

        QPushButton:disabled {{
            color: {Theme.MUTED};
            background-color: {Theme.SURFACE};
        }}

        QPushButton[primary="true"] {{
            background-color: {Theme.BLUE};
            color: {Theme.ON_ACCENT};
            border: none;
            font-weight: 700;
        }}

        QPushButton[primary="true"]:hover {{
            background-color: {Theme.BLUE_HOVER};
            color: {Theme.ON_ACCENT};
        }}

        QPushButton[danger="true"] {{
            background-color: {Theme.RED};
            color: {Theme.ON_ACCENT};
            border: none;
            font-weight: 700;
        }}

        QPushButton[danger="true"]:hover {{
            background-color: {Theme.RED_HOVER};
            color: {Theme.ON_ACCENT};
        }}

        QLineEdit {{
            background-color: {Theme.BG};
            color: {Theme.TEXT};
            border: 1px solid {Theme.BORDER_SUBTLE};
            border-radius: 8px;
            padding: 10px 12px;
            font-size: 14px;
            font-weight: 600;
            selection-background-color: {Theme.BLUE};
            selection-color: {Theme.ON_ACCENT};
        }}

        QLineEdit:focus {{
            border: 1px solid {Theme.BORDER_FOCUS};
            background-color: {Theme.SURFACE};
        }}

        QPlainTextEdit#log {{
            background-color: {Theme.BG};
            color: {Theme.TEXT};
            border: 1px solid {Theme.BORDER_SUBTLE};
            border-radius: 10px;
            font-family: {FONT_MONO};
            font-size: 13px;
            padding: 12px;
            selection-background-color: {Theme.BLUE};
        }}

        QScrollBar:vertical {{
            background: transparent;
            width: 10px;
            border-radius: 5px;
            margin: 2px;
        }}

        QScrollBar::handle:vertical {{
            background: {Theme.SURFACE_HOVER};
            border-radius: 5px;
            min-height: 24px;
        }}

        QScrollBar::handle:vertical:hover {{
            background: {Theme.MUTED};
        }}

        QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
            height: 0;
        }}
        """
    )
