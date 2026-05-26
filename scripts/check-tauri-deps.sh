#!/usr/bin/env bash
# Comprueba dependencias de sistema antes de compilar Tauri (sin instalar).

set -euo pipefail

ok=true

check_pkg() {
  local lib="$1"
  if pkg-config --exists "${lib}" 2>/dev/null; then
    echo "OK   ${lib}"
  else
    echo "FALTA ${lib}"
    ok=false
  fi
}

echo "Dependencias Tauri (pkg-config):"
check_pkg webkit2gtk-4.1
check_pkg javascriptcoregtk-4.1
check_pkg soup3.0
check_pkg gtk+-3.0

if ! command -v cargo >/dev/null 2>&1; then
  echo "FALTA cargo (Rust)"
  ok=false
else
  echo "OK   cargo ($(cargo --version))"
fi

if [[ "${ok}" == true ]]; then
  echo
  echo "Todo listo para: pnpm tauri dev"
  exit 0
fi

echo
echo "Instala con: ./scripts/setup-tauri-deps.sh"
exit 1
