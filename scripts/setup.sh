#!/usr/bin/env bash
# Configura el sistema para automatización Wayland con ydotool (Arch Linux + Sway).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BUILD_DIR="${PROJECT_DIR}/.build/wl-find-cursor"

echo "==> Automatización Wayland — setup"
echo "    Proyecto: ${PROJECT_DIR}"
echo

if [[ "${EUID}" -ne 0 ]]; then
    echo "Este script necesita sudo para instalar paquetes y configurar permisos."
    echo "Se te pedirá la contraseña."
    echo
fi

PACKAGES=(ydotool grim slurp imagemagick wayland-protocols git base-devel python qt6-wayland)
echo "==> Instalando paquetes: ${PACKAGES[*]}"
sudo pacman -S --needed --noconfirm "${PACKAGES[@]}"

echo
echo "==> Entorno Python (PySide6)"
if [[ ! -d "${PROJECT_DIR}/env" ]]; then
    python3 -m venv "${PROJECT_DIR}/env"
fi
"${PROJECT_DIR}/env/bin/pip" install -q -r "${PROJECT_DIR}/requirements.txt"
echo "    Dependencias instaladas en env/"

echo
echo "==> Añadiendo usuario al grupo 'input' (acceso a /dev/uinput)"
if groups "${USER}" | grep -qw input; then
    echo "    Ya estás en el grupo input."
else
    sudo usermod -aG input "${USER}"
    echo "    Añadido. IMPORTANTE: cierra sesión y vuelve a entrar para aplicar."
fi

echo
echo "==> Compilando wl-find-cursor (coordenadas del cursor en Sway)"
mkdir -p "${BUILD_DIR}"
if [[ ! -d "${BUILD_DIR}/.git" ]]; then
    git clone --depth 1 https://github.com/cjacker/wl-find-cursor.git "${BUILD_DIR}"
fi
make -C "${BUILD_DIR}" -s
install -Dm755 "${BUILD_DIR}/wl-find-cursor" "${PROJECT_DIR}/bin/wl-find-cursor"
echo "    Instalado en ${PROJECT_DIR}/bin/wl-find-cursor"

echo
echo "==> Instalando servicio systemd --user para ydotoold"
"${SCRIPT_DIR}/ydotoold.sh" install
systemctl --user enable --now ydotoold.service 2>/dev/null || {
    echo "    systemd --user no disponible; inicia manualmente:"
    echo "    ./scripts/ydotoold.sh start"
}

echo
echo "==> Permisos de ejecución en scripts"
chmod +x "${PROJECT_DIR}"/scripts/*.sh
chmod +x "${PROJECT_DIR}/bin/wl-find-cursor" 2>/dev/null || true

echo
echo "=========================================="
echo " Setup completado"
echo "=========================================="
echo
echo "Próximos pasos:"
echo "  1. Si acabas de unirte al grupo input → cierra sesión y vuelve a entrar"
echo "  2. Verifica el daemon:  ./scripts/ydotoold.sh status"
echo "  3. Aplicación GUI:     ./scripts/activar-entorno.sh"
echo
echo "Documentación: README.md"
