#!/usr/bin/env bash
# Funciones compartidas para automatización en Wayland (Sway/wlroots).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

export YDOTOOL_SOCKET="${YDOTOOL_SOCKET:-/tmp/.ydotool_socket}"

find_wl_find_cursor() {
    if command -v wl-find-cursor >/dev/null 2>&1; then
        command -v wl-find-cursor
        return 0
    fi
    if [[ -x "${PROJECT_DIR}/bin/wl-find-cursor" ]]; then
        echo "${PROJECT_DIR}/bin/wl-find-cursor"
        return 0
    fi
    return 1
}

require_wayland() {
    if [[ -z "${WAYLAND_DISPLAY:-}" ]]; then
        echo "Error: no hay sesión Wayland activa (WAYLAND_DISPLAY vacío)." >&2
        echo "Ejecuta estos scripts desde una terminal dentro de Sway." >&2
        exit 1
    fi
}

require_ydotool() {
    if ! command -v ydotool >/dev/null 2>&1; then
        echo "Error: ydotool no está instalado." >&2
        echo "Ejecuta: ./core/setup.sh" >&2
        exit 1
    fi
}

require_ydotoold() {
    require_ydotool
    if [[ ! -S "${YDOTOOL_SOCKET}" ]]; then
        echo "Error: ydotoold no está activo (socket ${YDOTOOL_SOCKET} no existe)." >&2
        echo "Inicia el daemon: ./core/prender.sh" >&2
        exit 1
    fi
}

require_grim() {
    if ! command -v grim >/dev/null 2>&1; then
        echo "Error: grim no está instalado (captura de pantalla Wayland)." >&2
        echo "Instala: sudo pacman -S grim" >&2
        exit 1
    fi
}

require_magick() {
    if ! command -v magick >/dev/null 2>&1; then
        echo "Error: imagemagick no está instalado." >&2
        echo "Instala: sudo pacman -S imagemagick" >&2
        exit 1
    fi
}

# Devuelve "x y" (dos enteros separados por espacio).
get_cursor_pos() {
    local wl_find_cursor
    wl_find_cursor="$(find_wl_find_cursor)" || {
        echo "Error: wl-find-cursor no encontrado." >&2
        echo "Ejecuta ./core/setup.sh para compilarlo o instálalo en PATH." >&2
        return 1
    }
    require_wayland
    "${wl_find_cursor}" -p
}

# Uso: get_pixel_color_at X Y
# Imprime: HEX=#RRGGBB RGB=r,g,b
get_pixel_color_at() {
    local x="$1" y="$2"
    local tmp
    tmp="$(mktemp --suffix=.png)"
    trap 'rm -f "${tmp}"' RETURN

    require_grim
    require_magick

    # grim en Sway usa formato slurp: "X,Y WxH"
    grim -g "${x},${y} 1x1" "${tmp}"
    magick "${tmp}" -format "HEX=#%[hex:u]\nRGB=%[pixel:p{0,0}]" info:
}

detect_compositor() {
    if [[ "${XDG_CURRENT_DESKTOP:-}" == *sway* ]]; then
        echo "sway"
    elif command -v hyprctl >/dev/null 2>&1; then
        echo "hyprland"
    else
        echo "wayland"
    fi
}
