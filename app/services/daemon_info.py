from __future__ import annotations

import grp
import os
import subprocess
from dataclasses import dataclass
from pathlib import Path

from app.config import YDOTOOL_SOCKET

USER_UNIT = Path.home() / ".config/systemd/user/ydotoold.service"
SERVICE_NAME = "ydotoold.service"


@dataclass(frozen=True)
class DaemonInfo:
    running: bool
    socket: str
    pid: str
    input_group: bool
    autostart: str
    service_state: str
    uinput: str

    @property
    def status_text(self) -> str:
        return "● Activo" if self.running else "● Inactivo"

    @property
    def status_style(self) -> str:
        return "statusOk" if self.running else "statusErr"

    @property
    def ready_for_mouse(self) -> bool:
        return self.running and self.input_group and self.uinput == "Accesible"


def _in_input_group() -> bool:
    try:
        gid = grp.getgrnam("input").gr_gid
    except KeyError:
        return False
    return gid in os.getgroups()


def _daemon_pid() -> str:
    if not Path(YDOTOOL_SOCKET).exists():
        return "—"
    try:
        result = subprocess.run(
            ["lsof", "-t", YDOTOOL_SOCKET],
            capture_output=True,
            text=True,
            check=False,
        )
        pid = result.stdout.strip().split("\n")[0] if result.stdout.strip() else ""
        return pid or "—"
    except OSError:
        return "—"


def _autostart_state() -> str:
    if not USER_UNIT.is_file():
        return "No instalado"
    try:
        result = subprocess.run(
            ["systemctl", "--user", "is-enabled", SERVICE_NAME],
            capture_output=True,
            text=True,
            check=False,
        )
        state = result.stdout.strip()
        if state == "enabled":
            return "Habilitado"
        if state in {"disabled", "static", "masked"}:
            return "Deshabilitado"
        return state or "Desconocido"
    except OSError:
        return "Desconocido"


def _service_state() -> str:
    if not USER_UNIT.is_file():
        return "No instalado"
    try:
        result = subprocess.run(
            ["systemctl", "--user", "is-active", SERVICE_NAME],
            capture_output=True,
            text=True,
            check=False,
        )
        state = result.stdout.strip()
        labels = {
            "active": "Activo",
            "inactive": "Inactivo",
            "failed": "Fallido",
            "activating": "Iniciando",
            "deactivating": "Deteniendo",
        }
        return labels.get(state, state or "Desconocido")
    except OSError:
        return "Desconocido"


def _uinput_access() -> str:
    uinput = Path("/dev/uinput")
    if not uinput.exists():
        return "No existe"
    if os.access(uinput, os.R_OK | os.W_OK):
        return "Accesible"
    return "Sin permisos"


def get_daemon_info() -> DaemonInfo:
    return DaemonInfo(
        running=Path(YDOTOOL_SOCKET).is_socket(),
        socket=YDOTOOL_SOCKET,
        pid=_daemon_pid(),
        input_group=_in_input_group(),
        autostart=_autostart_state(),
        service_state=_service_state(),
        uinput=_uinput_access(),
    )
