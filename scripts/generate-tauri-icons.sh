#!/usr/bin/env bash
# Genera iconos PNG RGBA para Tauri (requiere python3 + pillow).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ICONS="${SCRIPT_DIR}/../src-tauri/icons"

mkdir -p "${ICONS}"

python3 <<PY
from pathlib import Path
try:
    from PIL import Image
except ImportError:
    raise SystemExit("Instala pillow: pip install pillow")

icons = Path("${ICONS}")
color = (124, 156, 255, 255)
sizes = {
    "32x32.png": 32,
    "128x128.png": 128,
    "128x128@2x.png": 256,
    "icon.png": 512,
}
for name, size in sizes.items():
    Image.new("RGBA", (size, size), color).save(icons / name)
    print(f"  {name} {size}x{size} RGBA")
PY

echo "Iconos generados en ${ICONS}"
