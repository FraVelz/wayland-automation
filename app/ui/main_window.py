from __future__ import annotations

from PySide6.QtCore import QTimer, Qt
from PySide6.QtGui import QCursor
from PySide6.QtWidgets import (
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QMessageBox,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)

from app.config import PROJECT_DIR
from app.services.commands import CommandBuilder, ShellCommand
from app.services.daemon_info import get_daemon_info
from app.services.runner import ProcessRunner
from app.ui.daemon_panel import DaemonPanel
from app.ui.widgets import ActionButton, Card, LabeledEntry, LogPanel


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Wayland Automation")
        self.setMinimumSize(780, 680)
        self.resize(900, 760)

        self._status_label = QLabel("Comprobando daemon…")
        self._status_label.setObjectName("statusPending")
        self._log = LogPanel()
        self._stop_btn: ActionButton
        self._daemon_start_btn: ActionButton
        self._daemon_stop_btn: ActionButton
        self._daemon_panel: DaemonPanel | None = None
        self._status_detail = QLabel("")
        self._status_detail.setObjectName("cardDesc")
        self._mouse_warning = QLabel("")
        self._mouse_warning.setObjectName("hintAccent")
        self._mouse_warning.setWordWrap(True)
        self._daemon_info = get_daemon_info()

        self._runner = ProcessRunner()
        self._runner.output.connect(self._log.append)
        self._runner.finished.connect(self._on_command_finished)

        self._build_ui()
        self.refresh_daemon_status()
        self._daemon_timer = QTimer(self)
        self._daemon_timer.setInterval(5000)
        self._daemon_timer.timeout.connect(self.refresh_daemon_status)
        self._daemon_timer.start()

    def _build_ui(self) -> None:
        central = QWidget()
        self.setCentralWidget(central)
        root = QVBoxLayout(central)
        root.setContentsMargins(24, 24, 24, 24)
        root.setSpacing(16)

        root.addLayout(self._build_header())

        tabs = QTabWidget()
        tabs.tabBar().setCursor(QCursor(Qt.CursorShape.PointingHandCursor))
        tabs.addTab(self._tab_cursor(), "Cursor")
        tabs.addTab(self._tab_mouse(), "Ratón")
        tabs.addTab(self._tab_daemon(), "Daemon")
        tabs.addTab(self._tab_system(), "Sistema")
        root.addWidget(tabs, stretch=1)

        root.addWidget(self._log)
        root.addLayout(self._build_footer())

    def _build_header(self) -> QHBoxLayout:
        header = QHBoxLayout()

        text_col = QVBoxLayout()
        title = QLabel("Wayland Automation")
        title.setObjectName("title")
        subtitle = QLabel("Control de cursor, color de píxel y ratón en Sway")
        subtitle.setObjectName("subtitle")
        text_col.addWidget(title)
        text_col.addWidget(subtitle)
        header.addLayout(text_col, stretch=1)

        status_card = QFrame()
        status_card.setObjectName("statusCard")
        status_card.setMinimumWidth(200)
        status_layout = QVBoxLayout(status_card)
        status_layout.setContentsMargins(16, 14, 16, 14)
        status_layout.setSpacing(8)
        status_title = QLabel("Estado ydotoold")
        status_title.setObjectName("cardTitle")
        status_layout.addWidget(status_title, alignment=Qt.AlignmentFlag.AlignRight)
        status_layout.addWidget(self._status_label, alignment=Qt.AlignmentFlag.AlignRight)
        status_layout.addWidget(self._status_detail, alignment=Qt.AlignmentFlag.AlignRight)

        btn_row = QHBoxLayout()
        btn_row.setSpacing(8)
        self._daemon_start_btn = ActionButton(
            "Iniciar", lambda: self._run_daemon("start"), primary=True
        )
        self._daemon_stop_btn = ActionButton(
            "Detener", lambda: self._run_daemon("stop"), danger=True
        )
        btn_row.addWidget(self._daemon_start_btn)
        btn_row.addWidget(self._daemon_stop_btn)
        btn_row.addWidget(ActionButton("Actualizar", self.refresh_daemon_status))
        status_layout.addLayout(btn_row)
        header.addWidget(status_card)
        return header

    def _tab_cursor(self) -> QWidget:
        page = QWidget()
        layout = QVBoxLayout(page)
        card = Card(
            "Coordenadas y color",
            "Lee la posición del cursor. Con color usa grim + imagemagick.",
        )
        layout.addWidget(card)

        grid = QGridLayout()
        grid.setHorizontalSpacing(12)
        grid.setVerticalSpacing(12)
        actions = [
            ("Coordenadas (una lectura)", CommandBuilder.cursor_once, True),
            ("Tiempo real", CommandBuilder.cursor_watch, False),
            ("Coordenadas + color", CommandBuilder.cursor_color_once, False),
            ("Tiempo real + color", CommandBuilder.cursor_color_watch, False),
        ]
        for idx, (label, builder, primary) in enumerate(actions):
            cmd = builder()
            btn = ActionButton(label, lambda c=cmd: self._execute(c), primary=primary)
            btn.setMinimumHeight(48)
            grid.addWidget(btn, idx // 2, idx % 2)

        card.body_layout.addLayout(grid)
        hint = QLabel("Los modos en tiempo real se detienen con el botón «Detener» abajo.")
        hint.setObjectName("hintAccent")
        card.body_layout.addWidget(hint)
        layout.addStretch()
        return page

    def _tab_mouse(self) -> QWidget:
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.addWidget(self._mouse_warning)

        quick = Card("Acción rápida", "Mueve el ratón 100 px a la derecha (requiere ydotoold).")
        quick.body_layout.addWidget(
            ActionButton(
                "Mover 100 px →",
                self._mouse_default,
                primary=True,
            )
        )
        layout.addWidget(quick)

        rel = Card("Desplazamiento relativo", "Valores positivos: derecha / abajo.")
        row = QHBoxLayout()
        self._dx = LabeledEntry("ΔX", "100")
        self._dy = LabeledEntry("ΔY", "0")
        row.addWidget(self._dx)
        row.addWidget(self._dy)
        row.addStretch()
        rel.body_layout.addLayout(row)
        rel.body_layout.addWidget(ActionButton("Mover relativo", self._mouse_relative))
        layout.addWidget(rel)

        abs_card = Card("Posición absoluta", "Coordenadas de pantalla en píxeles.")
        row2 = QHBoxLayout()
        self._abs_x = LabeledEntry("X", "500")
        self._abs_y = LabeledEntry("Y", "300")
        row2.addWidget(self._abs_x)
        row2.addWidget(self._abs_y)
        row2.addStretch()
        abs_card.body_layout.addLayout(row2)
        abs_card.body_layout.addWidget(
            ActionButton("Mover a posición", self._mouse_absolute)
        )
        layout.addWidget(abs_card)
        layout.addStretch()
        return page

    def _tab_daemon(self) -> QWidget:
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(0, 0, 0, 0)
        self._daemon_panel = DaemonPanel(on_action=self._run_daemon)
        layout.addWidget(self._daemon_panel)
        return page

    def _tab_system(self) -> QWidget:
        page = QWidget()
        layout = QVBoxLayout(page)
        card = Card(
            "Instalación",
            "Instala paquetes de Arch, compila wl-find-cursor y configura permisos. Puede pedir sudo.",
        )
        card.body_layout.addWidget(
            ActionButton("Ejecutar scripts/setup.sh", self._run_setup, primary=True)
        )
        layout.addWidget(card)
        layout.addStretch()
        return page

    def _build_footer(self) -> QHBoxLayout:
        footer = QHBoxLayout()
        footer.addWidget(ActionButton("Limpiar log", self._log.clear))
        footer.addStretch()
        self._stop_btn = ActionButton("Detener", self._stop_process, danger=True)
        self._stop_btn.setEnabled(False)
        footer.addWidget(self._stop_btn)
        return footer

    def _run_daemon(self, action: str) -> None:
        self._execute(CommandBuilder.daemon(action))

    def _require_daemon_for_mouse(self) -> bool:
        if self._daemon_info.ready_for_mouse:
            return True

        if not self._daemon_info.running:
            message = "ydotoold no está activo. Inícialo desde la pestaña Daemon."
        elif not self._daemon_info.input_group:
            message = "No perteneces al grupo input. Ejecuta scripts/setup.sh y cierra sesión."
        else:
            message = f"/dev/uinput no es accesible ({self._daemon_info.uinput})."

        answer = QMessageBox.warning(
            self,
            "Daemon no disponible",
            f"{message}\n\n¿Quieres intentar iniciar ydotoold ahora?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
        )
        if answer == QMessageBox.StandardButton.Yes:
            self._run_daemon("start")
        return False

    def _execute(self, command: ShellCommand) -> None:
        self._log.append(f"— {command.label} —\n")
        self._stop_btn.setEnabled(command.long_running)
        self._runner.run(command.argv, str(PROJECT_DIR))

    def _stop_process(self) -> None:
        self._runner.stop()
        self._stop_btn.setEnabled(False)

    def _on_command_finished(self, _code: int, status: str) -> None:
        self._log.append(f"■ Finalizado ({status})\n\n")
        self._stop_btn.setEnabled(False)
        self.refresh_daemon_status()

    def _mouse_default(self) -> None:
        if not self._require_daemon_for_mouse():
            return
        self._execute(CommandBuilder.mouse_default())

    def _mouse_relative(self) -> None:
        if not self._require_daemon_for_mouse():
            return
        dx = self._dx.value or "0"
        dy = self._dy.value or "0"
        self._execute(CommandBuilder.mouse_relative(dx, dy))

    def _mouse_absolute(self) -> None:
        if not self._require_daemon_for_mouse():
            return
        x, y = self._abs_x.value, self._abs_y.value
        if not x or not y:
            QMessageBox.warning(self, "Datos incompletos", "Indica X e Y.")
            return
        self._execute(CommandBuilder.mouse_absolute(x, y))

    def _run_setup(self) -> None:
        answer = QMessageBox.question(
            self,
            "Confirmar setup",
            "Se ejecutará scripts/setup.sh y puede pedir contraseña sudo.\n¿Continuar?",
        )
        if answer == QMessageBox.StandardButton.Yes:
            self._execute(CommandBuilder.setup())

    def refresh_daemon_status(self) -> None:
        info = get_daemon_info()
        self._daemon_info = info
        self._set_status(info.status_text, info.status_style)
        if info.running:
            detail = f"PID {info.pid} · servicio: {info.service_state.lower()}"
        else:
            detail = f"Socket: {info.socket} · autostart: {info.autostart.lower()}"
        self._status_detail.setText(detail)
        self._daemon_start_btn.setEnabled(not info.running)
        self._daemon_stop_btn.setEnabled(info.running)
        if info.ready_for_mouse:
            self._mouse_warning.setText("")
        elif not info.running:
            self._mouse_warning.setText(
                "⚠ ydotoold está inactivo. Los movimientos de ratón no funcionarán "
                "hasta que lo inicies (pestaña Daemon o botón Iniciar arriba)."
            )
        elif not info.input_group:
            self._mouse_warning.setText(
                "⚠ Falta el grupo input. Ejecuta scripts/setup.sh y cierra sesión."
            )
        else:
            self._mouse_warning.setText(
                f"⚠ /dev/uinput: {info.uinput}. Revisa permisos con scripts/setup.sh."
            )
        if self._daemon_panel is not None:
            self._daemon_panel.update_info(info)

    def _set_status(self, text: str, style: str) -> None:
        self._status_label.setText(text)
        self._status_label.setObjectName(style)
        self._status_label.style().unpolish(self._status_label)
        self._status_label.style().polish(self._status_label)
