# Aplicación Python (PySide6)

## Punto de entrada

`main.py`:

1. Configura Qt antes de importar PySide6 (`QT_QPA_PLATFORM=wayland;xcb` si hay `WAYLAND_DISPLAY`).
2. Comprueba que existe `scripts/`.
3. Crea `QApplication`, aplica el tema (`app/ui/theme.py`) y muestra `MainWindow`.

Arranque recomendado: `./scripts/activar-entorno.sh` (crea `env/` e instala dependencias si hace falta).

Arranque manual:

```bash
python3 -m venv env && source env/bin/activate
pip install -r requirements.txt
python main.py
```

## Módulos

| Módulo | Responsabilidad |
|--------|-----------------|
| `app/config.py` | `PROJECT_DIR`, `SCRIPTS_DIR`, ruta del socket `ydotool` |
| `app/services/commands.py` | `CommandBuilder`: rutas y argumentos de `cursor.sh`, `mover_raton.sh`, `ydotoold.sh` |
| `app/services/runner.py` | `ProcessRunner`: `QProcess` con señales `output` y `finished` |
| `app/ui/main_window.py` | Pestañas Cursor, Ratón, Daemon, Sistema; estado del daemon |
| `app/ui/widgets.py` | `Card`, `ActionButton`, `LabeledEntry`, `LogPanel` |
| `app/ui/theme.py` | Paleta oscura vía `QApplication.setStyleSheet` |

## Pestañas de la GUI

- **Cursor**: opciones equivalentes a `cursor.sh` (`-w`, `-c`, intervalo, JSON).
- **Ratón**: parámetros de `mover_raton.sh` (dx/dy o x/y absolutos, delay).
- **Daemon**: subcomandos de `ydotoold.sh` (start, stop, status, check, logs, enable).
- **Sistema**: atajos de diagnóstico (rutas del proyecto, comprobaciones).

## Wayland nativo

La app está pensada para ejecutarse en Sway sin depender de XWayland. Si falla el plugin Wayland de Qt, el respaldo `xcb` puede intentar XWayland; en ese caso conviene instalar `qt6-wayland` (`scripts/setup.sh` ya lo incluye).

Volver al [índice](overview.md).
