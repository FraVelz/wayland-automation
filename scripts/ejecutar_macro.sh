#!/usr/bin/env bash
# Ejecuta una secuencia de pasos de macro (movimiento, clics, pausas) vía ydotool.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

MACRO_FILE=""

usage() {
    cat <<EOF
Uso: $(basename "$0") [opciones]

Opciones:
  --file PATH    Archivo JSON con el array "steps"
  -h, --help     Muestra esta ayuda

Formato JSON (ejemplo):
  {
    "steps": [
      {"type": "delay", "ms": 200},
      {"type": "move_absolute", "x": 500, "y": 300},
      {"type": "click", "button": "left"}
    ]
  }
EOF
}

click_code() {
    case "$1" in
        left) echo "0xC0" ;;
        right) echo "0xC1" ;;
        middle) echo "0xC2" ;;
        *) echo "Error: botón desconocido: $1" >&2; return 1 ;;
    esac
}

run_steps() {
    local json="$1"
    python3 - "$json" <<'PY'
import json, subprocess, sys, time

data = json.loads(sys.argv[1])
steps = data.get("steps", [])
if not isinstance(steps, list):
    raise SystemExit("JSON inválido: falta array 'steps'")

def ydotool(*args):
    subprocess.run(["ydotool", *args], check=True)

for i, step in enumerate(steps, 1):
    if not isinstance(step, dict) or "type" not in step:
        raise SystemExit(f"Paso {i}: objeto inválido")
    t = step["type"]
    if t == "delay":
        ms = int(step.get("ms", 0))
        if ms > 0:
            time.sleep(ms / 1000.0)
        print(f"  [{i}] Esperar {ms} ms")
    elif t == "move_absolute":
        x, y = int(step["x"]), int(step["y"])
        ydotool("mousemove", "--absolute", str(x), str(y))
        print(f"  [{i}] Mover a ({x}, {y})")
    elif t == "move_relative":
        dx, dy = int(step["dx"]), int(step["dy"])
        ydotool("mousemove", str(dx), str(dy))
        print(f"  [{i}] Mover relativo ({dx}, {dy})")
    elif t == "click":
        btn = step.get("button", "left")
        codes = {"left": "0xC0", "right": "0xC1", "middle": "0xC2"}
        if btn not in codes:
            raise SystemExit(f"Paso {i}: botón inválido: {btn}")
        ydotool("click", codes[btn])
        print(f"  [{i}] Clic {btn}")
    else:
        raise SystemExit(f"Paso {i}: tipo desconocido: {t}")
PY
}

main() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --file) MACRO_FILE="$2"; shift 2 ;;
            -h|--help) usage; exit 0 ;;
            *) echo "Opción desconocida: $1" >&2; usage; exit 1 ;;
        esac
    done

    if [[ -z "${MACRO_FILE}" || ! -f "${MACRO_FILE}" ]]; then
        echo "Error: indica --file con un JSON válido." >&2
        exit 1
    fi

    require_wayland
    require_ydotoold

    local json
    json="$(cat "${MACRO_FILE}")"
    echo "Ejecutando macro (${#json} bytes)..."
    run_steps "${json}"
    echo "Macro completada."
}

main "$@"
