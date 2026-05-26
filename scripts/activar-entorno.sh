#!/usr/bin/env bash
# Crea el entorno virtual, instala dependencias y lanza la aplicación PySide6.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
VENV="${PROJECT_DIR}/env"
PYTHON="${VENV}/bin/python"
PIP="${VENV}/bin/pip"

if [[ ! -d "${VENV}" ]]; then
    echo "Creando entorno virtual en env/..."
    python3 -m venv "${VENV}"
fi

# shellcheck source=/dev/null
source "${VENV}/bin/activate"

echo "Comprobando dependencias..."
"${PIP}" install -q -r "${PROJECT_DIR}/requirements.txt"

# PySide6 usa Wayland nativamente en Sway (sin X11/XWayland).
if [[ -n "${WAYLAND_DISPLAY:-}" ]]; then
    export QT_QPA_PLATFORM="${QT_QPA_PLATFORM:-wayland;xcb}"
fi

exec "${PYTHON}" "${PROJECT_DIR}/main.py" "$@"
