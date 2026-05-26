from __future__ import annotations

from collections.abc import Callable

from PySide6.QtCore import Qt
from PySide6.QtGui import QCursor, QTextCursor
from PySide6.QtWidgets import (
    QFrame,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPlainTextEdit,
    QPushButton,
    QVBoxLayout,
    QWidget,
)

_POINTING_HAND: QCursor | None = None
_IBEAM: QCursor | None = None


def _pointing_hand() -> QCursor:
    global _POINTING_HAND
    if _POINTING_HAND is None:
        _POINTING_HAND = QCursor(Qt.CursorShape.PointingHandCursor)
    return _POINTING_HAND


def _ibeam() -> QCursor:
    global _IBEAM
    if _IBEAM is None:
        _IBEAM = QCursor(Qt.CursorShape.IBeamCursor)
    return _IBEAM


def _set_clickable(widget: QPushButton) -> None:
    widget.setCursor(_pointing_hand())
    widget.setFocusPolicy(Qt.FocusPolicy.StrongFocus)


class Card(QFrame):
    """Panel con título y descripción."""

    def __init__(self, title: str, description: str = "", parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setObjectName("card")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 18, 20, 18)
        layout.setSpacing(10)

        title_label = QLabel(title)
        title_label.setObjectName("cardTitle")
        layout.addWidget(title_label)

        if description:
            desc = QLabel(description)
            desc.setObjectName("cardDesc")
            desc.setWordWrap(True)
            layout.addWidget(desc)

        self.body = QWidget()
        self.body.setStyleSheet("background: transparent;")
        self.body_layout = QVBoxLayout(self.body)
        self.body_layout.setContentsMargins(0, 6, 0, 0)
        self.body_layout.setSpacing(12)
        layout.addWidget(self.body)


class ActionButton(QPushButton):
    def __init__(
        self,
        text: str,
        command: Callable[[], None],
        primary: bool = False,
        danger: bool = False,
        parent: QWidget | None = None,
    ) -> None:
        super().__init__(text, parent)
        if primary:
            self.setProperty("primary", True)
        if danger:
            self.setProperty("danger", True)
        self.clicked.connect(lambda *_args: command())
        _set_clickable(self)
        self.setMinimumHeight(44)
        self.style().unpolish(self)
        self.style().polish(self)


class LabeledEntry(QWidget):
    def __init__(
        self,
        label: str,
        default: str = "",
        parent: QWidget | None = None,
    ) -> None:
        super().__init__(parent)
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 16, 0)
        layout.setSpacing(10)

        lbl = QLabel(label)
        lbl.setObjectName("fieldLabel")
        layout.addWidget(lbl)

        self._input = QLineEdit(default)
        self._input.setFixedWidth(100)
        self._input.setMinimumHeight(40)
        self._input.setCursor(_ibeam())
        layout.addWidget(self._input)

    @property
    def value(self) -> str:
        return self._input.text().strip()


class LogPanel(QWidget):
    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(8)

        header = QLabel("Salida")
        header.setObjectName("logTitle")
        layout.addWidget(header)

        self._text = QPlainTextEdit()
        self._text.setObjectName("log")
        self._text.setReadOnly(True)
        self._text.setMinimumHeight(180)
        layout.addWidget(self._text)

    def append(self, text: str) -> None:
        self._text.moveCursor(QTextCursor.MoveOperation.End)
        self._text.insertPlainText(text)
        self._text.moveCursor(QTextCursor.MoveOperation.End)

    def clear(self) -> None:
        self._text.clear()
