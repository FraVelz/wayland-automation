#!/usr/bin/env bash
# Dependencias de sistema para compilar Tauri en Arch Linux (GTK + WebKit).

set -euo pipefail

PACKAGES=(
  webkit2gtk-4.1
  gtk3
  base-devel
  curl
  wget
  file
  openssl
  librsvg
)

echo "==> Dependencias Tauri (Arch Linux)"
echo "    Paquetes: ${PACKAGES[*]}"
echo

if [[ "${EUID}" -ne 0 ]]; then
  sudo pacman -S --needed --noconfirm "${PACKAGES[@]}"
else
  pacman -S --needed --noconfirm "${PACKAGES[@]}"
fi

echo
echo "==> Rust (si aún no tienes cargo)"
if ! command -v cargo >/dev/null 2>&1; then
  echo "    Instala con: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
  echo "    Luego: source \"\$HOME/.cargo/env\""
else
  echo "    cargo ya disponible: $(cargo --version)"
fi

echo
echo "Listo. Compila la app con:"
echo "  source \"\$HOME/.cargo/env\"   # si hace falta"
echo "  pnpm tauri build"
