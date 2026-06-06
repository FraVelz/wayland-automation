#!/usr/bin/env bash
# Atajos numéricos: al pulsar 0-9 ejecuta un comando y/o macro de ratón.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

usage() {
    cat <<EOF
Uso: $(basename "$0") [opciones]

Escucha las teclas 0-9 y ejecuta el comando o macro definido en atalhos.json.

Opciones:
  --config PATH     Archivo JSON (default: scripts/config/atalhos.json)
  --require-config  Falla si no existe el archivo de config
  -h, --help        Muestra esta ayuda

Formato de atalhos.json (por cada dígito):
  "1": {
    "label": "Mi atajo",
    "command": "echo hola",          // opcional: comando shell
    "steps": [                       // opcional: macro de ratón (ydotool)
      {"type": "move_absolute", "x": 500, "y": 300},
      {"type": "click", "button": "left"}
    ]
  }

Requisitos: python-evdev, ydotoold (para steps), grupo input.

Ejemplos:
  $(basename "$0")
  cp scripts/config/atalhos.json.example scripts/config/atalhos.json
  $(basename "$0") --config scripts/config/atalhos.json
EOF
}

CONFIG="scripts/config/atalhos.json"
REQUIRE_CONFIG=false

main() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --config) CONFIG="$2"; shift 2 ;;
            --require-config) REQUIRE_CONFIG=true; shift ;;
            -h|--help) usage; exit 0 ;;
            *) echo "Opción desconocida: $1" >&2; usage; exit 1 ;;
        esac
    done

    require_wayland

    if ! python3 -c "import evdev" 2>/dev/null; then
        echo "Error: falta python-evdev." >&2
        echo "Instala: sudo pacman -S python-evdev" >&2
        exit 1
    fi

    if [[ "${REQUIRE_CONFIG}" == false && ! -f "${PROJECT_DIR}/${CONFIG}" ]]; then
        echo "Nota: no existe ${CONFIG}; se usarán placeholders hasta que lo crees."
        echo "      cp scripts/config/atalhos.json.example scripts/config/atalhos.json"
        echo
    fi

    if [[ -S "${YDOTOOL_SOCKET:-/tmp/.ydotool_socket}" ]]; then
        : # ydotoold activo
    else
        echo "Advertencia: ydotoold no activo; los pasos de macro (steps) fallarán." >&2
        echo "Inicia: ./scripts/ydotoold.sh start" >&2
        echo
    fi

    export PYTHONPATH="${SCRIPT_DIR}/lib:${PYTHONPATH:-}"
    args=(--project-dir "${PROJECT_DIR}" --config "${CONFIG}")
    if [[ "${REQUIRE_CONFIG}" == true ]]; then
        args+=(--require-config)
    fi
    exec python3 "${SCRIPT_DIR}/lib/atalhos_numeros.py" "${args[@]}"
}

main "$@"
