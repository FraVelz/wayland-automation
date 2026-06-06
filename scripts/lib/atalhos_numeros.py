#!/usr/bin/env python3
"""
Escucha teclas numéricas (0-9) vía evdev y ejecuta comandos o macros de ratón.
"""

from __future__ import annotations

import argparse
import json
import select
import subprocess
import sys
import time
from pathlib import Path

from evdev import ecodes

from input_common import DIGIT_KEYS, ModifierState, open_input_devices

CLICK_CODES = {"left": "0xC0", "right": "0xC1", "middle": "0xC2"}


def load_config(path: Path) -> dict:
    if not path.is_file():
        return {"version": 1, "bindings": {}}
    data = json.loads(path.read_text(encoding="utf-8"))
    if "bindings" not in data:
        data = {"version": 1, "bindings": data}
    return data


def run_command(cmd: str) -> None:
    if not cmd.strip():
        return
    print(f"  → comando: {cmd}")
    subprocess.run(cmd, shell=True, check=False)


def run_steps(steps: list) -> None:
    for i, step in enumerate(steps, 1):
        if not isinstance(step, dict) or "type" not in step:
            raise ValueError(f"Paso {i}: objeto inválido")
        t = step["type"]
        if t == "delay":
            ms = int(step.get("ms", 0))
            if ms > 0:
                time.sleep(ms / 1000.0)
            print(f"  [{i}] Esperar {ms} ms")
        elif t == "move_absolute":
            x, y = int(step["x"]), int(step["y"])
            subprocess.run(["ydotool", "mousemove", "--absolute", str(x), str(y)], check=True)
            print(f"  [{i}] Mover a ({x}, {y})")
        elif t == "move_relative":
            dx, dy = int(step["dx"]), int(step["dy"])
            subprocess.run(["ydotool", "mousemove", str(dx), str(dy)], check=True)
            print(f"  [{i}] Mover relativo ({dx}, {dy})")
        elif t == "click":
            btn = step.get("button", "left")
            code = CLICK_CODES.get(btn)
            if not code:
                raise ValueError(f"Paso {i}: botón inválido: {btn}")
            subprocess.run(["ydotool", "click", code], check=True)
            print(f"  [{i}] Clic {btn}")
        else:
            raise ValueError(f"Paso {i}: tipo desconocido: {t}")


def execute_binding(digit: str, binding: dict) -> None:
    label = binding.get("label", f"Atajo {digit}")
    print(f"\n▶ Tecla {digit} — {label}")

    command = binding.get("command", "")
    steps = binding.get("steps") or []

    if command:
        run_command(command)
    if steps:
        run_steps(steps)
    if not command and not steps:
        print(f"  (sin acción configurada; edita atalhos.json para la tecla {digit})")


def default_binding(digit: str) -> dict:
    return {
        "label": f"Placeholder {digit}",
        "command": f'echo "Tecla {digit} presionada — configura el comando en atalhos.json"',
        "steps": [],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Atajos numéricos: 0-9 ejecutan comandos/macros.")
    parser.add_argument(
        "--config",
        default="scripts/config/atalhos.json",
        help="JSON con bindings por dígito (default: scripts/config/atalhos.json)",
    )
    parser.add_argument(
        "--project-dir",
        default=".",
        help="Raíz del proyecto (para rutas relativas)",
    )
    parser.add_argument(
        "--require-config",
        action="store_true",
        help="Fallar si el archivo de config no existe",
    )
    args = parser.parse_args()

    project = Path(args.project_dir).resolve()
    config_path = (project / args.config).resolve()

    if args.require_config and not config_path.is_file():
        print(f"Error: no existe {config_path}", file=sys.stderr)
        print(f"Copia scripts/config/atalhos.json.example → {config_path}", file=sys.stderr)
        return 1

    config = load_config(config_path)
    bindings: dict = config.get("bindings", {})

    devices = open_input_devices()
    if not devices:
        print(
            "Error: no se pudo abrir dispositivos de entrada.\n"
            "¿Estás en el grupo input? Cierra sesión tras ./scripts/setup.sh",
            file=sys.stderr,
        )
        return 1

    configured = [d for d in "0123456789" if d in bindings]
    print(f"Escuchando teclas 0-9 (evdev, {len(devices)} dispositivo(s))")
    print(f"Config: {config_path}")
    if configured:
        print(f"Atajos configurados: {', '.join(configured)}")
    else:
        print("Sin atajos en config; cada dígito usará placeholder hasta que edites el JSON.")
    print("Ctrl+C para salir.\n")

    mods = ModifierState()
    last_fire: dict[str, float] = {}
    last_event: dict[int, float] = {}

    try:
        while True:
            r, _, _ = select.select(devices, [], [], 0.05)
            for dev in r:
                for event in dev.read():
                    if event.type != ecodes.EV_KEY:
                        continue
                    code = event.code
                    pressed = event.value == 1

                    now = time.monotonic()
                    if now - last_event.get(code, 0) < 0.04:
                        continue
                    last_event[code] = now

                    if mods.update(code, pressed):
                        continue
                    if not pressed:
                        continue
                    if mods.has_chord:
                        continue
                    if code not in DIGIT_KEYS:
                        continue

                    digit = DIGIT_KEYS[code]
                    now = time.monotonic()
                    if now - last_fire.get(digit, 0) < 0.35:
                        continue
                    last_fire[digit] = now

                    binding = bindings.get(digit) or default_binding(digit)
                    try:
                        execute_binding(digit, binding)
                    except subprocess.CalledProcessError as exc:
                        print(f"  Error ydotool: {exc}", file=sys.stderr)
                    except (ValueError, KeyError) as exc:
                        print(f"  Error en macro: {exc}", file=sys.stderr)
    except KeyboardInterrupt:
        print("\nDetenido.")
    finally:
        for dev in devices:
            dev.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())
