from __future__ import annotations

import subprocess
import threading

from PySide6.QtCore import QObject, Signal


class ProcessRunner(QObject):
    """Ejecuta comandos shell en un hilo aparte y emite señales Qt."""

    output = Signal(str)
    finished = Signal(int, str)

    def __init__(self) -> None:
        super().__init__()
        self._process: subprocess.Popen[str] | None = None
        self._lock = threading.Lock()

    @property
    def is_running(self) -> bool:
        with self._lock:
            return self._process is not None and self._process.poll() is None

    def run(self, argv: list[str], cwd: str) -> None:
        if self.is_running:
            self.output.emit("⚠ Ya hay un comando en ejecución.\n")
            return

        def worker() -> None:
            self.output.emit(f"▶ {' '.join(argv)}\n")
            code = 0
            try:
                with self._lock:
                    self._process = subprocess.Popen(
                        argv,
                        cwd=cwd,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.STDOUT,
                        text=True,
                        bufsize=1,
                    )
                proc = self._process
                assert proc.stdout is not None
                for line in proc.stdout:
                    self.output.emit(line if line.endswith("\n") else f"{line}\n")
                code = proc.wait()
            except FileNotFoundError:
                self.output.emit(f"✗ No se encontró: {argv[0]}\n")
                code = 127
            except Exception as exc:  # noqa: BLE001
                self.output.emit(f"✗ Error: {exc}\n")
                code = 1
            finally:
                with self._lock:
                    self._process = None
                status = "OK" if code == 0 else f"código {code}"
                self.finished.emit(code, status)

        threading.Thread(target=worker, daemon=True).start()

    def stop(self) -> None:
        with self._lock:
            proc = self._process
        if proc and proc.poll() is None:
            proc.terminate()
            self.output.emit("\n■ Proceso detenido por el usuario.\n")
