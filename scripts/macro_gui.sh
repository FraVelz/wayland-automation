#!/usr/bin/env bash
# Cursor/color en terminal; guarda y reproduce macros de clic (solo bash).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=../core/lib/common.sh
source "${PROJECT_DIR}/core/lib/common.sh"

MACRO_OUT="scripts/config/macro_gui.json"
DISPLAY_INTERVAL=0.15
DEBOUNCE_S=0.4
LOCK_FILE="/tmp/wayland-automation-macro_gui-${USER}.lock"
DEBOUNCE_FILE="/tmp/wayland-automation-macro-debounce-${USER}"
STATUS_FILE="/tmp/wayland-automation-macro-status-${USER}"
CAPTURE_FILE="/tmp/wayland-automation-macro-capture-${USER}"
RUNNING_FILE=""

declare -a STEPS=()
STATUS_MSG="Listo"
EVTEST_PIDS=()

usage() {
    cat <<EOF
Uso: $(basename "$0") [opciones]

Muestra posición y color del cursor en la terminal.

Controles (teclado global):
  1 o Ctrl  Guarda el punto actual (mover + clic izquierdo al reproducir)
  2         Igual que 1, pero con clic derecho
  0         Reproduce toda la secuencia guardada
  9         Borra el último punto guardado
  q         Activa/desactiva la captura de números (0–9)
  Esc       Vacía la secuencia
  Ctrl+C    Sale y persiste el JSON

Opciones:
  --macro-out PATH  JSON de salida (default: scripts/config/macro_gui.json)
  --clear           Vacía la macro guardada y sale
  --stop            Detiene instancias en segundo plano
  -h, --help        Muestra esta ayuda

Requisitos: sesión Wayland, wl-find-cursor, grim, imagemagick, evtest,
            grupo input, ydotoold activo para reproducir.

Ejemplos:
  ./core/prender.sh
  $(basename "$0")
EOF
}

macro_file() {
    echo "${PROJECT_DIR}/${MACRO_OUT}"
}

now_s() {
    date +%s.%N
}

debounced() {
    local t last
    [[ -f "${DEBOUNCE_FILE}" ]] || return 1
    t="$(now_s)"
    last="$(cat "${DEBOUNCE_FILE}")"
    awk -v cur="$t" -v last="$last" -v d="$DEBOUNCE_S" 'BEGIN { exit (cur - last < d) ? 0 : 1 }'
}

touch_action() {
    now_s >"${DEBOUNCE_FILE}"
}

update_status() {
    STATUS_MSG="$1"
    printf '%s' "$1" >"${STATUS_FILE}"
}

capture_numbers_enabled() {
    [[ ! -f "${CAPTURE_FILE}" || "$(cat "${CAPTURE_FILE}")" != "0" ]]
}

capture_status_label() {
    if capture_numbers_enabled; then
        echo "activada"
    else
        echo "desactivada"
    fi
}

set_capture_numbers() {
    if [[ "$1" == true ]]; then
        printf '1' >"${CAPTURE_FILE}"
    else
        printf '0' >"${CAPTURE_FILE}"
    fi
}

toggle_capture_numbers() {
    if capture_numbers_enabled; then
        set_capture_numbers false
        update_status "Captura de números desactivada (q para activar)"
        notify "Macro" "Captura de números desactivada — puedes escribir números"
    else
        set_capture_numbers true
        update_status "Captura de números activada (q para desactivar)"
        notify "Macro" "Captura de números activada"
    fi
}

run_ydotool() {
    export YDOTOOL_SOCKET="${YDOTOOL_SOCKET:-/tmp/.ydotool_socket}"
    ydotool "$@"
}

notify() {
    command -v notify-send >/dev/null 2>&1 || return 0
    notify-send "$1" "$2" 2>/dev/null || true
}

point_count() {
    local n=0 s
    for s in "${STEPS[@]}"; do
        [[ "$s" == *'"type": "move_absolute"'* ]] && ((n++)) || true
    done
    echo "$n"
}

write_macro() {
    local f steps_json i n sep
    f="$(macro_file)"
    mkdir -p "$(dirname "$f")"
    n=${#STEPS[@]}
    steps_json=""
    for ((i = 0; i < n; i++)); do
        sep=","
        if [[ $i -eq $((n - 1)) ]]; then
            sep=""
        fi
        steps_json+=$'\n    '"${STEPS[$i]}${sep}"
    done
    cat >"${f}" <<EOF
{
  "steps": [${steps_json}
  ]
}
EOF
}

load_macro() {
    local f line step lines
    f="$(macro_file)"
    STEPS=()
    [[ -f "$f" ]] || return 0
    mapfile -t lines <"${f}"
    for line in "${lines[@]}"; do
        step="$(echo "${line}" | sed -n 's/^[[:space:]]*\({[^}]*"type"[^}]*\}\)[[:space:]]*,\{0,1\}[[:space:]]*$/\1/p')"
        if [[ -n "${step}" ]]; then
            STEPS+=("${step}")
        fi
    done
}

get_color_at() {
    local x="$1" y="$2" tmp out
    tmp="$(mktemp --suffix=.png)"
    if grim -g "${x},${y} 1x1" "${tmp}" 2>/dev/null; then
        out="$(magick "${tmp}" -format "HEX=#%[hex:u]|RGB=%[pixel:p{0,0}]" info: 2>/dev/null || true)"
        rm -f "${tmp}"
        echo "${out}"
        return 0
    fi
    rm -f "${tmp}"
    return 1
}

build_display_text() {
    local pos x y color hex rgb n
    load_macro
    if [[ -f "${STATUS_FILE}" ]]; then
        STATUS_MSG="$(cat "${STATUS_FILE}")"
    fi
    n="$(point_count)"
    pos="$(get_cursor_pos 2>/dev/null || true)"
    x="—"
    y="—"
    hex="—"
    rgb="—"
    if [[ -n "${pos}" ]]; then
        read -r x y <<<"${pos}"
        color="$(get_color_at "${x}" "${y}" 2>/dev/null || true)" || color=""
        if [[ -n "${color}" ]]; then
            hex="${color%%|*}"
            rgb="${color#*|}"
        fi
    fi
    cat <<EOF
Macro Wayland
─────────────
X: ${x}
Y: ${y}
Color: ${hex}
RGB: ${rgb}

Puntos guardados: ${n}
Estado: ${STATUS_MSG}
Captura números: $(capture_status_label) (q para alternar)

Controles:
  1 o Ctrl  → guardar punto (mover + clic izquierdo)
  2         → guardar punto (mover + clic derecho)
  0         → reproducir secuencia
  9         → borrar último punto
  q         → activar/desactivar captura de números
  Esc       → vaciar secuencia
EOF
}

save_point() {
    local trigger="$1" button="${2:-left}" pos x y n msg btn_label
    if debounced; then
        return 0
    fi
    touch_action
    load_macro
    pos="$(get_cursor_pos)" || {
        update_status "Sin coordenadas del cursor"
        notify "Macro" "No se pudo leer la posición"
        return 1
    }
    read -r x y <<<"${pos}"
    case "${button}" in
        left) btn_label="izquierdo" ;;
        right) btn_label="derecho" ;;
        *) btn_label="${button}" ;;
    esac
    STEPS+=("{\"type\": \"move_absolute\", \"x\": ${x}, \"y\": ${y}}")
    STEPS+=("{\"type\": \"click\", \"button\": \"${button}\"}")
    STEPS+=("{\"type\": \"delay\", \"ms\": 250}")
    write_macro
    n="$(point_count)"
    msg="Punto ${n} guardado: (${x}, ${y}) [${trigger}, clic ${btn_label}]"
    update_status "${msg}"
    notify "Macro guardada" "${msg}"
}

clear_macro_file() {
    STEPS=()
    write_macro
    echo "Macro vaciada ($(macro_file))."
}

clear_sequence() {
    if debounced; then
        return 0
    fi
    touch_action
    STEPS=()
    write_macro
    update_status "Secuencia vaciada"
    notify "Macro" "Secuencia vaciada"
}

remove_last_point() {
    local i n last_move=-1 t remaining
    if debounced; then
        return 0
    fi
    touch_action
    load_macro
    n=${#STEPS[@]}
    if [[ $n -eq 0 ]]; then
        update_status "No hay puntos que borrar"
        notify "Macro" "No hay puntos que borrar"
        return 1
    fi
    for ((i = 0; i < n; i++)); do
        t="$(echo "${STEPS[$i]}" | sed -n 's/.*"type"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
        [[ "${t}" == "move_absolute" ]] && last_move=$i
    done
    if [[ $last_move -lt 0 ]]; then
        update_status "Secuencia sin puntos válidos"
        notify "Macro" "No se encontró ningún punto"
        return 1
    fi
    remaining=("${STEPS[@]:0:$last_move}")
    STEPS=("${remaining[@]}")
    write_macro
    n="$(point_count)"
    update_status "Último punto borrado (${n} restante(s))"
    notify "Macro" "Último punto borrado. Quedan ${n} punto(s)."
}

run_sequence() {
    local step t x y ms btn code n err
    if debounced; then
        return 0
    fi
    touch_action
    load_macro
    if [[ ${#STEPS[@]} -eq 0 ]]; then
        update_status "No hay puntos guardados"
        notify "Macro" "No hay puntos para reproducir"
        return 1
    fi
    if ! command -v ydotool >/dev/null 2>&1; then
        update_status "ydotool no instalado"
        notify "Macro" "Instala ydotool (./core/setup.sh)"
        return 1
    fi
    if ! ydotoold_is_alive; then
        if [[ -S "${YDOTOOL_SOCKET}" ]]; then
            update_status "Socket ydotool obsoleto — ./core/ydotoold.sh restart"
            notify "Macro" "Socket obsoleto. Ejecuta: ./core/ydotoold.sh restart"
        else
            update_status "ydotoold inactivo — ./core/prender.sh"
            notify "Macro" "Inicia ./core/prender.sh para reproducir"
        fi
        return 1
    fi
    n="$(point_count)"
    update_status "Reproduciendo ${n} punto(s)…"
    notify "Macro" "Reproduciendo ${n} punto(s)…"
    configure_ydotoold_input
    set +e
    for step in "${STEPS[@]}"; do
        t="$(echo "${step}" | sed -n 's/.*"type"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
        case "${t}" in
            delay)
                ms="$(echo "${step}" | sed -n 's/.*"ms"[[:space:]]*:[[:space:]]*\([0-9]*\).*/\1/p')"
                if [[ -n "${ms}" && "${ms}" -gt 0 ]]; then
                    sleep "$(awk "BEGIN {print ${ms}/1000}")"
                fi
                ;;
            move_absolute)
                x="$(echo "${step}" | sed -n 's/.*"x"[[:space:]]*:[[:space:]]*\([0-9]*\).*/\1/p')"
                y="$(echo "${step}" | sed -n 's/.*"y"[[:space:]]*:[[:space:]]*\([0-9]*\).*/\1/p')"
                if ! err="$(move_cursor_absolute "${x}" "${y}" 2>&1)"; then
                    set -e
                    update_status "Error al mover a (${x}, ${y})"
                    notify "Macro" "${err:-Error ydotool mousemove}"
                    return 1
                fi
                ;;
            click)
                btn="$(echo "${step}" | sed -n 's/.*"button"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
                btn="${btn:-left}"
                case "${btn}" in
                    left) code="0xC0" ;;
                    right) code="0xC1" ;;
                    middle) code="0xC2" ;;
                    *)
                        set -e
                        update_status "Botón desconocido: ${btn}"
                        return 1
                        ;;
                esac
                if ! err="$(run_ydotool click "${code}" 2>&1)"; then
                    set -e
                    update_status "Error al hacer clic (${btn})"
                    notify "Macro" "${err:-Error ydotool click}"
                    return 1
                fi
                ;;
        esac
    done
    set -e
    update_status "Secuencia completada"
    notify "Macro" "Reproducción terminada"
}

is_running() {
    [[ -n "${RUNNING_FILE}" && -f "${RUNNING_FILE}" ]]
}

stop_all_instances() {
    local pid mypid=$$
    while read -r pid; do
        [[ "${pid}" == "${mypid}" ]] && continue
        kill -TERM "${pid}" 2>/dev/null || true
    done < <(pgrep -f "${PROJECT_DIR}/scripts/macro_gui.sh" 2>/dev/null || true)
    sleep 0.2
    while read -r pid; do
        kill -TERM "${pid}" 2>/dev/null || true
    done < <(pgrep -x evtest 2>/dev/null || true)
    sleep 0.2
    while read -r pid; do
        kill -KILL "${pid}" 2>/dev/null || true
    done < <(pgrep -x evtest 2>/dev/null || true)
    rm -f /tmp/wayland-automation-macro_gui-"${USER}".lock \
        /tmp/wayland-automation-macro-running.* \
        "${DEBOUNCE_FILE}" "${STATUS_FILE}" "${CAPTURE_FILE}"
    echo "Instancias de macro_gui detenidas."
}

_has_keyboard_keys() {
    local dev="$1" n cap val
    n="${dev##*/}"
    cap="/sys/class/input/${n}/device/capabilities/key"
    [[ -f "${cap}" ]] || return 1
    val="$(tr -d ' \n' <"${cap}")"
    [[ -n "${val}" && "${val}" != "0" ]]
}

_evtest_worker() {
    local dev="$1" line
    evtest "${dev}" 2>/dev/null | while IFS= read -r line; do
        if ! is_running; then
            exit 0
        fi
        handle_key_line "${line}" || true
    done
}

handle_key_line() {
    local line="$1" code
    [[ "${line}" == *"(EV_KEY)"* && "${line}" == *"value 1"* ]] || return 0
    code="$(echo "${line}" | sed -n 's/.*code \([0-9]*\).*/\1/p')"
    case "${code}" in
        16) toggle_capture_numbers; return 0 ;;  # KEY_Q
        1) clear_sequence; return 0 ;;          # KEY_ESC
    esac
    if [[ "${line}" == *"KEY_LEFTCTRL"* || "${line}" == *"KEY_RIGHTCTRL"* ]]; then
        save_point "Ctrl" "left"
        return 0
    fi
    if ! capture_numbers_enabled; then
        case "${code}" in
            2|3|10|11|79|80|87|82) return 0 ;;  # 1,2,9,0 y teclado numérico
        esac
    fi
    case "${code}" in
        2|79) save_point "1" "left" ;;    # KEY_1, KEY_KP1
        3|80) save_point "2" "right" ;;   # KEY_2, KEY_KP2
        10|87) remove_last_point ;;       # KEY_9, KEY_KP9
        11|82) run_sequence ;;            # KEY_0, KEY_KP0
    esac
}

start_evtest_listeners() {
    local dev
    if ! command -v evtest >/dev/null 2>&1; then
        echo "Error: evtest no está instalado." >&2
        echo "Instala: sudo pacman -S evtest" >&2
        exit 1
    fi
    shopt -s nullglob
    for dev in /dev/input/event*; do
        _has_keyboard_keys "${dev}" || continue
        _evtest_worker "${dev}" &
        EVTEST_PIDS+=("$!")
    done
    shopt -u nullglob
    if [[ ${#EVTEST_PIDS[@]} -eq 0 ]]; then
        echo "Error: no hay teclados en /dev/input/event*." >&2
        echo "¿Estás en el grupo input? Cierra sesión tras ./core/setup.sh" >&2
        exit 1
    fi
}

run_terminal_ui() {
    tput civis 2>/dev/null || true
    while is_running; do
        clear
        build_display_text
        echo
        echo "Cierra con Ctrl+C"
        sleep "${DISPLAY_INTERVAL}"
    done
}

kill_tree() {
    local pid cpid
    for pid in "$@"; do
        [[ -n "${pid}" ]] || continue
        while read -r cpid; do
            kill_tree "${cpid}"
        done < <(pgrep -P "${pid}" 2>/dev/null || true)
        kill -TERM "${pid}" 2>/dev/null || true
    done
}

cleanup() {
    rm -f "${RUNNING_FILE}" "${DEBOUNCE_FILE}" "${STATUS_FILE}" "${CAPTURE_FILE}"
    kill_tree "${EVTEST_PIDS[@]:-}"
    wait 2>/dev/null || true
    tput cnorm 2>/dev/null || true
    write_macro
    rm -f "${LOCK_FILE}"
}

acquire_lock() {
    exec 9>"${LOCK_FILE}"
    if ! flock -n 9; then
        echo "Error: macro_gui ya está en ejecución." >&2
        echo "Detén instancias: ./scripts/macro_gui.sh --stop" >&2
        exit 1
    fi
}

main() {
    local do_stop=false do_clear=false

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --macro-out) MACRO_OUT="$2"; shift 2 ;;
            --clear) do_clear=true; shift ;;
            --stop) do_stop=true; shift ;;
            -h|--help) usage; exit 0 ;;
            *) echo "Opción desconocida: $1" >&2; usage; exit 1 ;;
        esac
    done

    if [[ "${do_stop}" == true ]]; then
        stop_all_instances
        exit 0
    fi

    if [[ "${do_clear}" == true ]]; then
        clear_macro_file
        exit 0
    fi

    require_wayland
    require_grim
    require_magick
    find_wl_find_cursor >/dev/null || {
        echo "Error: wl-find-cursor no disponible. Ejecuta ./core/setup.sh" >&2
        exit 1
    }

    if ! ydotoold_is_alive; then
        if [[ -S "${YDOTOOL_SOCKET}" ]]; then
            echo "Advertencia: socket ydotool obsoleto; la reproducción fallará." >&2
            echo "Reinicia: ./core/ydotoold.sh restart" >&2
        else
            echo "Advertencia: ydotoold no activo; podrás guardar puntos pero no reproducir." >&2
            echo "Inicia: ./core/prender.sh" >&2
        fi
        echo
    fi

    acquire_lock
    RUNNING_FILE="$(mktemp /tmp/wayland-automation-macro-running.XXXXXX)"
    load_macro
    set_capture_numbers true
    update_status "Listo"
    trap cleanup EXIT INT TERM
    start_evtest_listeners
    run_terminal_ui
}

main "$@"
