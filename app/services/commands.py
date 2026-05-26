from __future__ import annotations

from dataclasses import dataclass

from app.config import CURSOR_SCRIPT, DAEMON_SCRIPT, MOUSE_SCRIPT, SETUP_SCRIPT


@dataclass(frozen=True)
class ShellCommand:
    argv: list[str]
    label: str
    long_running: bool = False


class CommandBuilder:
    @staticmethod
    def cursor_once() -> ShellCommand:
        return ShellCommand([str(CURSOR_SCRIPT)], "Coordenadas (una lectura)")

    @staticmethod
    def cursor_watch() -> ShellCommand:
        return ShellCommand(
            [str(CURSOR_SCRIPT), "-w"],
            "Coordenadas en tiempo real",
            long_running=True,
        )

    @staticmethod
    def cursor_color_once() -> ShellCommand:
        return ShellCommand([str(CURSOR_SCRIPT), "-c"], "Coordenadas + color")

    @staticmethod
    def cursor_color_watch() -> ShellCommand:
        return ShellCommand(
            [str(CURSOR_SCRIPT), "-w", "-c"],
            "Coordenadas + color en tiempo real",
            long_running=True,
        )

    @staticmethod
    def mouse_default() -> ShellCommand:
        return ShellCommand([str(MOUSE_SCRIPT)], "Mover 100 px a la derecha")

    @staticmethod
    def mouse_relative(dx: str, dy: str) -> ShellCommand:
        return ShellCommand(
            [str(MOUSE_SCRIPT), "--dx", dx, "--dy", dy],
            f"Mover relativo ({dx}, {dy})",
        )

    @staticmethod
    def mouse_absolute(x: str, y: str) -> ShellCommand:
        return ShellCommand(
            [str(MOUSE_SCRIPT), "--x", x, "--y", y],
            f"Mover a ({x}, {y})",
        )

    @staticmethod
    def daemon(action: str) -> ShellCommand:
        labels = {
            "status": "Estado del daemon",
            "start": "Iniciar daemon",
            "stop": "Detener daemon",
            "restart": "Reiniciar daemon",
            "enable": "Habilitar autostart",
            "disable": "Deshabilitar autostart",
            "install": "Instalar servicio systemd",
            "check": "Diagnóstico completo",
            "logs": "Ver logs",
        }
        return ShellCommand(
            [str(DAEMON_SCRIPT), action],
            labels.get(action, action),
        )

    @staticmethod
    def setup() -> ShellCommand:
        return ShellCommand([str(SETUP_SCRIPT)], "Instalar / configurar sistema")

    @staticmethod
    def daemon_status_argv() -> list[str]:
        return [str(DAEMON_SCRIPT), "status"]
