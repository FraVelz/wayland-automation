#!/usr/bin/env bash
# Gestión del daemon ydotoold (control de ratón/teclado en Wayland).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

SERVICE_NAME="ydotoold.service"
USER_UNIT_DIR="${HOME}/.config/systemd/user"
PROJECT_UNIT="${PROJECT_DIR}/systemd/ydotoold.service"
INSTALLED_UNIT="${USER_UNIT_DIR}/${SERVICE_NAME}"

usage() {
    cat <<EOF
Uso: $(basename "$0") <comando>

Comandos:
  start      Inicia ydotoold (systemd --user o en primer plano)
  stop       Detiene ydotoold
  restart    Reinicia ydotoold
  status     Muestra si el daemon está activo
  enable     Habilita arranque automático al iniciar sesión
  disable    Deshabilita arranque automático
  logs       Muestra logs recientes (journalctl --user)
  install    Copia la unidad systemd al directorio del usuario
  check      Verifica dependencias y permisos

Variables:
  YDOTOOL_SOCKET  Ruta del socket (default: /tmp/.ydotool_socket)
EOF
}

is_running() {
    [[ -S "${YDOTOOL_SOCKET}" ]]
}

daemon_pid() {
    if [[ -S "${YDOTOOL_SOCKET}" ]]; then
        lsof -t "${YDOTOOL_SOCKET}" 2>/dev/null | head -1 || true
    fi
}

cmd_install() {
    mkdir -p "${USER_UNIT_DIR}"
    cp "${PROJECT_UNIT}" "${INSTALLED_UNIT}"
    systemctl --user daemon-reload
    echo "Unidad instalada en ${INSTALLED_UNIT}"
}

cmd_start() {
    require_ydotool

    if is_running; then
        echo "ydotoold ya está activo (socket: ${YDOTOOL_SOCKET})"
        return 0
    fi

    if [[ -f "${INSTALLED_UNIT}" ]]; then
        systemctl --user reset-failed "${SERVICE_NAME}" 2>/dev/null || true
        systemctl --user start "${SERVICE_NAME}"
        sleep 0.5
        if is_running; then
            echo "ydotoold iniciado vía systemd --user"
            return 0
        fi
        echo "systemd --user no pudo iniciar ydotoold." >&2
        journalctl --user -u "${SERVICE_NAME}" -n 3 --no-pager 2>/dev/null | sed 's/^/    /' >&2 || true
    fi

    echo "Iniciando ydotoold en segundo plano..."
    nohup ydotoold -p "${YDOTOOL_SOCKET}" >/dev/null 2>&1 &
    sleep 0.5

    if is_running; then
        echo "ydotoold iniciado (PID aprox: $(daemon_pid))"
    else
        echo "Error: no se pudo iniciar ydotoold." >&2
        if ! groups | grep -qw input; then
            echo "No estás en el grupo 'input'. Ejecuta ./scripts/setup.sh y cierra sesión." >&2
        elif [[ ! -r /dev/uinput || ! -w /dev/uinput ]]; then
            echo "Sin acceso a /dev/uinput (el grupo input no basta por sí solo)." >&2
            echo "Ejecuta ./scripts/setup.sh (sudo) o, manualmente:" >&2
            echo "  sudo modprobe uinput" >&2
            echo "  sudo udevadm trigger -c add -s misc -n uinput" >&2
            echo "Si acabas de unirte al grupo input, cierra sesión y vuelve a entrar." >&2
        else
            echo "Reinstala la unidad systemd: ./scripts/ydotoold.sh install" >&2
            echo "Revisa logs: ./scripts/ydotoold.sh logs" >&2
        fi
        exit 1
    fi
}

cmd_stop() {
    if [[ -f "${INSTALLED_UNIT}" ]] && systemctl --user is-active --quiet "${SERVICE_NAME}" 2>/dev/null; then
        systemctl --user stop "${SERVICE_NAME}"
        echo "ydotoold detenido (systemd --user)"
        return 0
    fi

    local pid
    pid="$(daemon_pid)"
    if [[ -n "${pid}" ]]; then
        kill "${pid}"
        echo "ydotoold detenido (PID ${pid})"
    else
        echo "ydotoold no estaba activo"
    fi
}

cmd_status() {
    echo "Compositor: $(detect_compositor)"
    echo "Socket:     ${YDOTOOL_SOCKET}"

    if is_running; then
        echo "Estado:     ACTIVO"
        echo "PID:        $(daemon_pid)"
    else
        echo "Estado:     INACTIVO"
    fi

    if groups | grep -qw input; then
        echo "Grupo input: sí"
    else
        echo "Grupo input: NO (ejecuta ./scripts/setup.sh y cierra sesión)"
    fi

    if [[ -f "${INSTALLED_UNIT}" ]]; then
        if systemctl --user is-enabled --quiet "${SERVICE_NAME}" 2>/dev/null; then
            echo "Autostart:  habilitado"
        else
            echo "Autostart:  deshabilitado"
        fi
    else
        echo "Autostart:  unidad no instalada (./scripts/ydotoold.sh install)"
    fi
}

cmd_check() {
    cmd_status
    echo
    if [[ -c /dev/uinput ]]; then
        if [[ -r /dev/uinput && -w /dev/uinput ]]; then
            echo "/dev/uinput: accesible"
        else
            echo "/dev/uinput: sin permisos de lectura/escritura"
        fi
    else
        echo "/dev/uinput: no existe"
    fi
}

cmd_enable() {
    [[ -f "${INSTALLED_UNIT}" ]] || cmd_install
    systemctl --user enable --now "${SERVICE_NAME}"
    echo "ydotoold habilitado al iniciar sesión"
}

cmd_disable() {
    if [[ -f "${INSTALLED_UNIT}" ]]; then
        systemctl --user disable --now "${SERVICE_NAME}" 2>/dev/null || true
    fi
    cmd_stop
    echo "Autostart deshabilitado"
}

cmd_logs() {
    if [[ -f "${INSTALLED_UNIT}" ]]; then
        journalctl --user -u "${SERVICE_NAME}" -n 30 --no-pager
    else
        echo "No hay unidad systemd instalada. Usa: $(basename "$0") install"
    fi
}

main() {
    local cmd="${1:-}"
    case "${cmd}" in
        start)   cmd_start ;;
        stop)    cmd_stop ;;
        restart) cmd_stop; cmd_start ;;
        status)  cmd_status ;;
        enable)  cmd_enable ;;
        disable) cmd_disable ;;
        logs)    cmd_logs ;;
        install) cmd_install ;;
        check)   cmd_check ;;
        -h|--help|help|"") usage ;;
        *)
            echo "Comando desconocido: ${cmd}" >&2
            usage
            exit 1
            ;;
    esac
}

main "$@"
