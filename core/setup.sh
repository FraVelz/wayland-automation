#!/usr/bin/env bash
# Configura el sistema para automatización Wayland con ydotool (Arch Linux + Sway).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BUILD_DIR="${PROJECT_DIR}/.build/wl-find-cursor"

# Usuario real del setup (no root cuando se invoca con sudo ./core/setup.sh)
if [[ "${EUID}" -eq 0 ]]; then
    if [[ -n "${SUDO_USER:-}" ]]; then
        SETUP_USER="${SUDO_USER}"
    else
        echo "Error: no ejecutes 'sudo ./core/setup.sh'." >&2
        echo "Usa './core/setup.sh' desde tu usuario; pedirá sudo solo para pacman/permisos." >&2
        exit 1
    fi
else
    SETUP_USER="${USER}"
fi

run_sudo() {
    if [[ "${EUID}" -eq 0 ]]; then
        "$@"
    else
        sudo "$@"
    fi
}

run_as_user() {
    if [[ "${EUID}" -eq 0 ]]; then
        local uid
        uid="$(id -u "${SETUP_USER}")"
        sudo -u "${SETUP_USER}" \
            HOME="$(eval echo "~${SETUP_USER}")" \
            XDG_RUNTIME_DIR="/run/user/${uid}" \
            DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/${uid}/bus" \
            "$@"
    else
        "$@"
    fi
}

echo "==> Automatización Wayland — setup"
echo "    Proyecto: ${PROJECT_DIR}"
echo "    Usuario:  ${SETUP_USER}"
if [[ "${EUID}" -eq 0 ]]; then
    echo "    Nota: detectado sudo; las tareas de usuario se aplican a ${SETUP_USER}."
fi
echo

if [[ "${EUID}" -ne 0 ]]; then
    echo "Se pedirá sudo para instalar paquetes y configurar permisos."
    echo
fi

PACKAGES=(ydotool grim slurp imagemagick wayland-protocols git base-devel python-evdev)
echo "==> Instalando paquetes: ${PACKAGES[*]}"
run_sudo pacman -S --needed --noconfirm "${PACKAGES[@]}"

echo
echo "==> Añadiendo usuario al grupo 'input' (acceso a /dev/uinput)"
NEEDS_RELOGIN=0
if groups "${SETUP_USER}" | grep -qw input; then
    echo "    ${SETUP_USER} ya está en el grupo input."
else
    run_sudo usermod -aG input "${SETUP_USER}"
    NEEDS_RELOGIN=1
    echo "    ${SETUP_USER} añadido. IMPORTANTE: cierra sesión y vuelve a entrar para aplicar."
fi

echo
echo "==> Configurando /dev/uinput (módulo uinput + reglas udev)"
run_sudo modprobe uinput
run_sudo udevadm control --reload-rules
run_sudo udevadm trigger -c add -s misc -n uinput 2>/dev/null || run_sudo udevadm trigger

if [[ -c /dev/uinput ]]; then
    UINPUT_PERMS="$(stat -c '%a %U:%G' /dev/uinput)"
    echo "    Permisos actuales: ${UINPUT_PERMS} (esperado: 660 root:input)"
    if run_as_user test -r /dev/uinput && run_as_user test -w /dev/uinput; then
        echo "    /dev/uinput accesible para ${SETUP_USER}."
    elif [[ "${NEEDS_RELOGIN}" -eq 1 ]]; then
        echo "    Tras cerrar sesión, /dev/uinput debería quedar accesible."
    else
        echo "    ADVERTENCIA: ${SETUP_USER} sigue sin acceso a /dev/uinput."
        echo "    Cierra sesión y vuelve a entrar. Si persiste:"
        echo "      sudo modprobe uinput"
        echo "      sudo udevadm trigger -c add -s misc -n uinput"
    fi
else
    echo "    ADVERTENCIA: /dev/uinput no existe tras cargar el módulo."
fi

echo
echo "==> Compilando wl-find-cursor (coordenadas del cursor en Sway)"
run_as_user mkdir -p "${BUILD_DIR}"
if [[ ! -d "${BUILD_DIR}/.git" ]]; then
    run_as_user git clone --depth 1 https://github.com/cjacker/wl-find-cursor.git "${BUILD_DIR}"
fi
run_as_user make -C "${BUILD_DIR}" -s
run_as_user install -Dm755 "${BUILD_DIR}/wl-find-cursor" "${PROJECT_DIR}/bin/wl-find-cursor"
echo "    Instalado en ${PROJECT_DIR}/bin/wl-find-cursor"

echo
echo "==> Instalando servicio systemd --user para ydotoold"
run_as_user "${SCRIPT_DIR}/ydotoold.sh" install
if run_as_user systemctl --user enable --now ydotoold.service 2>/dev/null; then
    echo "    ydotoold habilitado e iniciado para ${SETUP_USER}."
else
    echo "    systemd --user no disponible en esta sesión; inicia manualmente:"
    echo "    ./core/prender.sh"
fi

echo
echo "==> Permisos de ejecución"
chmod +x "${PROJECT_DIR}"/core/*.sh
chmod +x "${PROJECT_DIR}"/scripts/*.sh 2>/dev/null || true
chmod +x "${PROJECT_DIR}"/scripts/tools/*.sh 2>/dev/null || true
chmod +x "${PROJECT_DIR}/bin/wl-find-cursor" 2>/dev/null || true

echo
echo "=========================================="
echo " Setup completado"
echo "=========================================="
echo
echo "Próximos pasos:"
if [[ "${NEEDS_RELOGIN}" -eq 1 ]]; then
    echo "  1. Cierra sesión y vuelve a entrar (grupo input recién añadido)"
else
    echo "  1. Verifica permisos:    ./core/ydotoold.sh check"
fi
echo "  2. Verifica el daemon:  ./core/ydotoold.sh status"
echo "  3. Coordenadas:        ./scripts/tools/cursor.sh -w"
echo "  4. Atajos numéricos:   ./scripts/tools/grabar_posiciones.sh"
echo "                        cp scripts/config/atalhos.json.example scripts/config/atalhos.json"
echo "                        ./scripts/atalhos_numeros.sh"
echo
echo "Documentación: README.md"
