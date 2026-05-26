from __future__ import annotations

from collections.abc import Callable

from PySide6.QtCore import Qt
from PySide6.QtWidgets import QGridLayout, QHBoxLayout, QLabel, QVBoxLayout, QWidget

from app.services.daemon_info import DaemonInfo
from app.ui.widgets import ActionButton, Card


class InfoRow(QWidget):
    """Fila etiqueta → valor para el panel de estado."""

    def __init__(self, label: str, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(12)

        key = QLabel(label)
        key.setObjectName("fieldLabel")
        key.setMinimumWidth(130)
        self.value = QLabel("—")
        self.value.setObjectName("cardDesc")
        self.value.setWordWrap(True)
        self.value.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)

        layout.addWidget(key)
        layout.addStretch()
        layout.addWidget(self.value)


class DaemonPanel(QWidget):
    """Panel de control y estado de ydotoold."""

    def __init__(
        self,
        on_action: Callable[[str], None],
        parent: QWidget | None = None,
    ) -> None:
        super().__init__(parent)
        self._on_action = on_action
        self._action_buttons: dict[str, ActionButton] = {}

        root = QVBoxLayout(self)
        root.setSpacing(14)

        self._status_card = Card(
            "Estado actual",
            "Información en vivo del daemon y permisos del sistema.",
        )
        root.addWidget(self._status_card)

        self._status_badge = QLabel("Comprobando…")
        self._status_badge.setObjectName("statusPending")
        self._status_badge.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._status_card.body_layout.addWidget(self._status_badge)

        info_grid = QGridLayout()
        info_grid.setHorizontalSpacing(16)
        info_grid.setVerticalSpacing(8)
        self._row_socket = InfoRow("Socket")
        self._row_pid = InfoRow("PID")
        self._row_service = InfoRow("Servicio systemd")
        self._row_input = InfoRow("Grupo input")
        self._row_autostart = InfoRow("Autostart")
        self._row_uinput = InfoRow("/dev/uinput")
        for idx, row in enumerate(
            (
                self._row_socket,
                self._row_pid,
                self._row_service,
                self._row_input,
                self._row_autostart,
                self._row_uinput,
            )
        ):
            info_grid.addWidget(row, idx, 0)
        self._status_card.body_layout.addLayout(info_grid)

        quick = Card("Control rápido", "Acciones más usadas para gestionar ydotoold.")
        root.addWidget(quick)
        quick_row = QHBoxLayout()
        quick_row.setSpacing(10)
        for label, action, primary in (
            ("▶ Iniciar", "start", True),
            ("■ Detener", "stop", False),
            ("↻ Reiniciar", "restart", False),
        ):
            btn = ActionButton(
                label,
                lambda a=action: self._on_action(a),
                primary=primary,
                danger=(action == "stop"),
            )
            btn.setMinimumHeight(48)
            self._action_buttons[action] = btn
            quick_row.addWidget(btn)
        quick.body_layout.addLayout(quick_row)

        advanced = Card(
            "Configuración avanzada",
            "Servicio systemd, autostart al iniciar sesión y diagnóstico.",
        )
        root.addWidget(advanced)
        adv_grid = QGridLayout()
        adv_grid.setHorizontalSpacing(10)
        adv_grid.setVerticalSpacing(10)
        actions = [
            ("Instalar servicio", "install", False),
            ("Habilitar autostart", "enable", False),
            ("Deshabilitar autostart", "disable", False),
            ("Diagnóstico", "check", False),
            ("Ver logs", "logs", False),
            ("Estado detallado", "status", False),
        ]
        for idx, (label, action, primary) in enumerate(actions):
            btn = ActionButton(
                label,
                lambda a=action: self._on_action(a),
                primary=primary,
            )
            btn.setMinimumHeight(44)
            self._action_buttons[action] = btn
            adv_grid.addWidget(btn, idx // 2, idx % 2)
        advanced.body_layout.addLayout(adv_grid)

        hint = QLabel(
            "Si el ratón no responde: comprueba que el daemon esté activo, "
            "que tengas el grupo input y que hayas cerrado sesión tras ./scripts/setup.sh."
        )
        hint.setObjectName("hintAccent")
        hint.setWordWrap(True)
        root.addWidget(hint)
        root.addStretch()

    def update_info(self, info: DaemonInfo) -> None:
        self._status_badge.setText(info.status_text)
        self._status_badge.setObjectName(info.status_style)
        self._status_badge.style().unpolish(self._status_badge)
        self._status_badge.style().polish(self._status_badge)

        self._row_socket.value.setText(info.socket)
        self._row_pid.value.setText(info.pid if info.running else "—")
        self._row_service.value.setText(info.service_state)
        self._row_input.value.setText("Sí" if info.input_group else "No")
        self._row_autostart.value.setText(info.autostart)
        self._row_uinput.value.setText(info.uinput)

        ok_style = "color: #94e2a5; font-weight: 600;"
        err_style = "color: #eba0ac; font-weight: 600;"
        warn_style = "color: #e5c890; font-weight: 500;"

        self._row_input.value.setStyleSheet(ok_style if info.input_group else err_style)
        self._row_uinput.value.setStyleSheet(
            ok_style if info.uinput == "Accesible" else err_style
        )
        if info.service_state == "Activo":
            self._row_service.value.setStyleSheet(ok_style)
        elif info.service_state in {"Fallido", "Desconocido"}:
            self._row_service.value.setStyleSheet(err_style)
        elif info.service_state == "No instalado":
            self._row_service.value.setStyleSheet(warn_style)
        else:
            self._row_service.value.setStyleSheet("")
        if info.autostart == "Habilitado":
            self._row_autostart.value.setStyleSheet(ok_style)
        elif info.autostart == "No instalado":
            self._row_autostart.value.setStyleSheet(warn_style)
        else:
            self._row_autostart.value.setStyleSheet("")

        self._action_buttons["start"].setEnabled(not info.running)
        self._action_buttons["stop"].setEnabled(info.running)
        self._action_buttons["restart"].setEnabled(info.running)
