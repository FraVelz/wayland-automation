#!/usr/bin/env bash
# Coordenadas del cursor y color del píxel bajo él (Wayland / Sway).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# shellcheck source=../../core/lib/common.sh
source "${PROJECT_DIR}/core/lib/common.sh"

INTERVAL=0.15
WATCH=false
COLOR=false
FORMAT="plain"

usage() {
    cat <<EOF
Uso: $(basename "$0") [opciones]

Opciones:
  -w, --watch       Actualiza en tiempo real (Ctrl+C para salir)
  -c, --color       Incluye color HEX/RGB del píxel bajo el cursor
  -i, --interval S  Intervalo en segundos (default: 0.15)
  -j, --json        Salida JSON
  -h, --help        Muestra esta ayuda

Ejemplos:
  $(basename "$0")                 # coordenadas, una lectura
  $(basename "$0") -w              # coordenadas en tiempo real
  $(basename "$0") -c              # coordenadas + color, una lectura
  $(basename "$0") -w -c           # coordenadas + color en tiempo real
  $(basename "$0") -w -i 0.05      # actualización cada 50 ms
  $(basename "$0") --json -c       # {"x":123,"y":456,"hex":"#...","rgb":"..."}
EOF
}

cleanup() {
    tput cnorm 2>/dev/null || true
    echo
    exit 0
}

read_sample() {
    local pos x y tmp color_line hex rgb
    pos="$(get_cursor_pos)"
    read -r x y <<< "${pos}"

    if [[ "${COLOR}" == false ]]; then
        SAMPLE_X="${x}"
        SAMPLE_Y="${y}"
        return 0
    fi

    tmp="$(mktemp --suffix=.png)"
    grim -g "${x},${y} 1x1" "${tmp}" 2>/dev/null || { rm -f "${tmp}"; return 1; }
    color_line="$(magick "${tmp}" -format "HEX=#%[hex:u]|RGB=%[pixel:p{0,0}]" info:)"
    rm -f "${tmp}"

    SAMPLE_X="${x}"
    SAMPLE_Y="${y}"
    SAMPLE_HEX="${color_line%%|*}"
    SAMPLE_RGB="${color_line#*|}"
}

print_sample() {
    if [[ "${FORMAT}" == json ]]; then
        if [[ "${COLOR}" == true ]]; then
            printf '{"x":%s,"y":%s,"hex":"%s","rgb":"%s"}\n' \
                "${SAMPLE_X}" "${SAMPLE_Y}" "${SAMPLE_HEX}" "${SAMPLE_RGB}"
        else
            printf '{"x":%s,"y":%s}\n' "${SAMPLE_X}" "${SAMPLE_Y}"
        fi
    elif [[ "${COLOR}" == true ]]; then
        printf 'x=%s y=%s  %s  %s\n' \
            "${SAMPLE_X}" "${SAMPLE_Y}" "${SAMPLE_HEX}" "${SAMPLE_RGB}"
    else
        printf 'x=%s y=%s\n' "${SAMPLE_X}" "${SAMPLE_Y}"
    fi
}

print_sample_inline() {
    if [[ "${COLOR}" == true ]]; then
        printf '\rx=%-5s y=%-5s  %-12s  %s' \
            "${SAMPLE_X}" "${SAMPLE_Y}" "${SAMPLE_HEX}" "${SAMPLE_RGB}"
    else
        printf '\rx=%-5s y=%-5s' "${SAMPLE_X}" "${SAMPLE_Y}"
    fi
}

main() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -w|--watch) WATCH=true; shift ;;
            -c|--color) COLOR=true; shift ;;
            -i|--interval) INTERVAL="$2"; shift 2 ;;
            -j|--json) FORMAT="json"; shift ;;
            -h|--help) usage; exit 0 ;;
            *) echo "Opción desconocida: $1" >&2; usage; exit 1 ;;
        esac
    done

    require_wayland

    if ! find_wl_find_cursor >/dev/null; then
        echo "Error: wl-find-cursor no disponible. Ejecuta ./core/setup.sh" >&2
        exit 1
    fi

    if [[ "${COLOR}" == true ]]; then
        require_grim
        require_magick
    fi

    if [[ "${WATCH}" == true ]]; then
        trap cleanup INT TERM
        tput civis 2>/dev/null || true
        while true; do
            if read_sample; then
                if [[ "${FORMAT}" == json ]]; then
                    print_sample
                else
                    print_sample_inline
                fi
            fi
            sleep "${INTERVAL}"
        done
    else
        read_sample
        print_sample
    fi
}

main "$@"
