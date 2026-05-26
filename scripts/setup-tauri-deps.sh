#!/usr/bin/env bash
# Dependencias de sistema para compilar Tauri en Arch Linux (GTK + WebKit).

set -euo pipefail

PACKAGES=(
  pkgconf
  webkit2gtk-4.1
  gtk3
  libsoup3
  gdk-pixbuf2
  base-devel
  curl
  wget
  file
  openssl
  librsvg
  patchelf
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
echo "==> Comprobando pkg-config"
missing=0
for lib in webkit2gtk-4.1 javascriptcoregtk-4.1 soup3.0 gtk+-3.0; do
  if pkg-config --exists "${lib}" 2>/dev/null; then
    echo "    OK  ${lib}"
  else
    echo "    FALTA  ${lib}" >&2
    missing=1
  fi
done

if [[ "${missing}" -ne 0 ]]; then
  echo >&2
  echo "Alguna librería no se detectó. Revisa la instalación o reinicia la sesión." >&2
  exit 1
fi

echo
echo "==> Rust"
if ! command -v cargo >/dev/null 2>&1; then
  echo "    Instala: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
  echo "    Luego: source \"\$HOME/.cargo/env\""
else
  echo "    cargo: $(cargo --version)"
fi

echo
echo "Listo. Arranca la app con:"
echo "  source \"\$HOME/.cargo/env\""
echo "  pnpm install"
echo "  pnpm tauri dev"
