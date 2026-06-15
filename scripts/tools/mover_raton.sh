#!/usr/bin/env bash
# Mueve el cursor del ratón usando ydotool (Wayland).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# shellcheck source=../../core/lib/common.sh
source "${PROJECT_DIR}/core/lib/common.sh"

DX=100
DY=0
DELAY=2
ABSOLUTE=false
TARGET_X=""
TARGET_Y=""

usage() {
    cat <<EOF
Uso: $(basename "$0") [opciones]

Opciones:
  --dx N         Desplazamiento relativo en X (default: 100)
  --dy N         Desplazamiento relativo en Y (default: 0)
  --x X --y Y    Posición absoluta (requiere ambos)
  --delay S      Segundos de espera antes de mover (default: 2)
  -h, --help     Muestra esta ayuda

Ejemplos:
  $(basename "$0")                    # 100 px a la derecha
  $(basename "$0") --dx 0 --dy -50    # 50 px arriba
  $(basename "$0") --x 500 --y 300    # mover a coordenada absoluta
EOF
}

main() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dx) DX="$2"; shift 2 ;;
            --dy) DY="$2"; shift 2 ;;
            --x) TARGET_X="$2"; ABSOLUTE=true; shift 2 ;;
            --y) TARGET_Y="$2"; ABSOLUTE=true; shift 2 ;;
            --delay) DELAY="$2"; shift 2 ;;
            -h|--help) usage; exit 0 ;;
            *) echo "Opción desconocida: $1" >&2; usage; exit 1 ;;
        esac
    done

    require_wayland
    require_ydotoold

    if [[ "${ABSOLUTE}" == true ]]; then
        if [[ -z "${TARGET_X}" || -z "${TARGET_Y}" ]]; then
            echo "Error: --x y --y deben usarse juntos." >&2
            exit 1
        fi
        echo "Moviendo a (${TARGET_X}, ${TARGET_Y}) en ${DELAY}s..."
        sleep "${DELAY}"
        ydotool mousemove --absolute "${TARGET_X}" "${TARGET_Y}"
        echo "Listo."
    else
        if find_wl_find_cursor >/dev/null 2>&1; then
            pos="$(get_cursor_pos)"
            read -r x y <<< "${pos}"
            echo "Posición actual: (${x}, ${y})"
        fi
        echo "Moviendo ${DX}px horizontal, ${DY}px vertical en ${DELAY}s..."
        sleep "${DELAY}"
        ydotool mousemove --relative "${DX}" "${DY}"
        if find_wl_find_cursor >/dev/null 2>&1; then
            pos="$(get_cursor_pos)"
            read -r x y <<< "${pos}"
            echo "Nueva posición: (${x}, ${y})"
        else
            echo "Movimiento enviado."
        fi
    fi
}

main "$@"
