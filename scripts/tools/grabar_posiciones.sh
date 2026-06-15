#!/usr/bin/env bash
# Registra teclas y clics con la posición del cursor (para descubrir coordenadas).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# shellcheck source=../../core/lib/common.sh
source "${PROJECT_DIR}/core/lib/common.sh"

usage() {
    cat <<EOF
Uso: $(basename "$0") [opciones]

Registra cada tecla y clic del ratón junto con las coordenadas del cursor.
Útil para armar macros move → click → move → click en atalhos.json.

Opciones:
  --log PATH        Log de eventos (default: scripts/tools/config/grabacion.log)
  --macro-out PATH  JSON de macro con F9 (default: scripts/tools/config/macro_generado.json)
  -h, --help        Muestra esta ayuda

Controles mientras corre:
  F6   Añadir paso: mover a posición actual
  F7   Añadir paso: clic izquierdo
  F8   Añadir paso: esperar 200 ms
  F9   Guardar macro acumulada
  F10  Vaciar pasos acumulados

Al pulsar 0-9 imprime un fragmento JSON listo para pegar en atalhos.json.

Requisitos: python-evdev, wl-find-cursor, sesión Wayland, grupo input.

Ejemplos:
  $(basename "$0")
  $(basename "$0") --log /tmp/grabacion.log
EOF
}

LOG="scripts/tools/config/grabacion.log"
MACRO_OUT="scripts/tools/config/macro_generado.json"

main() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --log) LOG="$2"; shift 2 ;;
            --macro-out) MACRO_OUT="$2"; shift 2 ;;
            -h|--help) usage; exit 0 ;;
            *) echo "Opción desconocida: $1" >&2; usage; exit 1 ;;
        esac
    done

    require_wayland

    if ! python3 -c "import evdev" 2>/dev/null; then
        echo "Error: falta python-evdev." >&2
        echo "Instala: sudo pacman -S python-evdev" >&2
        echo "O ejecuta ./core/setup.sh" >&2
        exit 1
    fi

    if wl_find_cursor="$(find_wl_find_cursor)"; then
        export WL_FIND_CURSOR="${wl_find_cursor}"
    else
        echo "Advertencia: wl-find-cursor no disponible; coordenadas vacías." >&2
    fi

    export PYTHONPATH="${PROJECT_DIR}/scripts/lib:${SCRIPT_DIR}/lib:${PYTHONPATH:-}"
    exec python3 "${SCRIPT_DIR}/lib/grabar_posiciones.py" \
        --project-dir "${PROJECT_DIR}" \
        --log "${LOG}" \
        --macro-out "${MACRO_OUT}"
}

main "$@"
