#!/usr/bin/env bash
# Funciones compartidas para automatización en Wayland (Sway/wlroots).

set -euo pipefail

_COMMON_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${_COMMON_LIB_DIR}/../.." && pwd)"

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

# PID del proceso que escucha el socket (vacío si no hay daemon o el socket es obsoleto).
ydotoold_socket_pid() {
    if [[ -S "${YDOTOOL_SOCKET}" ]]; then
        lsof -t "${YDOTOOL_SOCKET}" 2>/dev/null | head -1 || true
    fi
}

ydotoold_is_alive() {
    local pid
    pid="$(ydotoold_socket_pid)"
    [[ -n "${pid}" ]] && kill -0 "${pid}" 2>/dev/null
}

ydotoold_remove_stale_socket() {
    if [[ -S "${YDOTOOL_SOCKET}" ]] && ! ydotoold_is_alive; then
        rm -f "${YDOTOOL_SOCKET}"
        return 0
    fi
    return 1
}

require_ydotoold() {
    require_ydotool
    if ydotoold_is_alive; then
        return 0
    fi
    if [[ -S "${YDOTOOL_SOCKET}" ]]; then
        echo "Error: socket ydotool obsoleto (${YDOTOOL_SOCKET})." >&2
        echo "Reinicia el daemon: ./core/ydotoold.sh restart" >&2
    else
        echo "Error: ydotoold no está activo (socket ${YDOTOOL_SOCKET} no existe)." >&2
        echo "Inicia el daemon: ./core/prender.sh" >&2
    fi
    exit 1
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

# ydotoold crea un puntero virtual; con accel "adaptive" las coordenadas absolutas fallan (sobre todo Y).
configure_ydotoold_input() {
    local id
    if [[ "$(detect_compositor)" != "sway" ]] || ! command -v swaymsg >/dev/null 2>&1; then
        return 0
    fi
    id="$(swaymsg -t get_inputs 2>/dev/null | python3 -c 'import json,sys
for i in json.load(sys.stdin):
    ident=i.get("identifier","")
    if i.get("type")=="pointer" and "ydotool" in ident.lower():
        print(ident); break' 2>/dev/null || true)"
    [[ -n "${id}" ]] || return 0
    swaymsg input "${id}" accel_profile flat pointer_accel 0 >/dev/null 2>&1 || true
}

# Mueve el cursor a coordenadas de layout de Sway (mismo espacio que wl-find-cursor).
move_cursor_absolute() {
    local x="$1" y="$2"
    configure_ydotoold_input
    # ydotool no conoce la posición actual; ir a (0,0) y mover en relativo es más fiable.
    ydotool mousemove -- -999999 -999999 2>/dev/null || true
    ydotool mousemove -- -999999 -999999 2>/dev/null || true
    ydotool mousemove "${x}" "${y}"
}
