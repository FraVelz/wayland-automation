#!/usr/bin/env python3
"""
Registra teclas y clics del ratón junto con la posición del cursor.
Sirve para descubrir coordenadas y armar macros (move, click, move, click…).
"""

from __future__ import annotations

import argparse
import json
import select
import sys
import time
from datetime import datetime
from pathlib import Path

from evdev import ecodes

from input_common import (
    CLICK_BUTTONS,
    DIGIT_KEYS,
    get_cursor_pos,
    key_name,
    open_input_devices,
)


def ts() -> str:
    return datetime.now().strftime("%H:%M:%S")


def format_pos(pos: tuple[int, int] | None) -> str:
    if pos is None:
        return "x=? y=?"
    return f"x={pos[0]} y={pos[1]}"


def step_json(step_type: str, pos: tuple[int, int] | None, **extra) -> dict:
    if step_type == "move_absolute":
        if pos is None:
            raise ValueError("Sin coordenadas del cursor")
        return {"type": "move_absolute", "x": pos[0], "y": pos[1]}
    if step_type == "click":
        return {"type": "click", "button": extra.get("button", "left")}
    if step_type == "delay":
        return {"type": "delay", "ms": int(extra.get("ms", 200))}
    raise ValueError(f"Tipo desconocido: {step_type}")


def append_log(log_path: Path, line: str) -> None:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with log_path.open("a", encoding="utf-8") as fh:
        fh.write(line + "\n")


def save_macro(macro_path: Path, steps: list[dict]) -> None:
    macro_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"steps": steps}
    macro_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def print_help() -> None:
    print(
        """
Controles especiales (macro en construcción):
  F6  → añadir paso: mover a posición actual del cursor
  F7  → añadir paso: clic izquierdo
  F8  → añadir paso: esperar 200 ms
  F9  → guardar macro en --macro-out
  F10 → vaciar pasos acumulados

Cada tecla o clic se registra con las coordenadas actuales.
Los dígitos 0-9 también generan un fragmento JSON listo para atalhos.json.

Ctrl+C para salir.
""".strip()
    )


def digit_snippet(digit: str, pos: tuple[int, int] | None) -> str:
    if pos is None:
        return f'  "{digit}": {{ "command": "", "steps": [] }}'
    return (
        f'  "{digit}": {{\n'
        f'    "label": "Atajo {digit}",\n'
        f'    "command": "",\n'
        f'    "steps": [\n'
        f'      {{"type": "move_absolute", "x": {pos[0]}, "y": {pos[1]}}},\n'
        f'      {{"type": "click", "button": "left"}}\n'
        f'    ]\n'
        f'  }}'
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Registra teclas/clics y posición del cursor.")
    parser.add_argument(
        "--log",
        default="scripts/tools/config/grabacion.log",
        help="Archivo de log (default: scripts/tools/config/grabacion.log)",
    )
    parser.add_argument(
        "--macro-out",
        default="scripts/tools/config/macro_generado.json",
        help="JSON de macro generado con F9 (default: scripts/tools/config/macro_generado.json)",
    )
    parser.add_argument(
        "--project-dir",
        default=".",
        help="Raíz del proyecto (para rutas relativas)",
    )
    args = parser.parse_args()

    project = Path(args.project_dir).resolve()
    log_path = (project / args.log).resolve()
    macro_path = (project / args.macro_out).resolve()

    devices = open_input_devices()
    if not devices:
        print(
            "Error: no se pudo abrir dispositivos de entrada.\n"
            "¿Estás en el grupo input? Cierra sesión tras ./core/setup.sh",
            file=sys.stderr,
        )
        return 1

    if get_cursor_pos() is None:
        print(
            "Advertencia: wl-find-cursor no disponible; las coordenadas saldrán vacías.",
            file=sys.stderr,
        )

    steps: list[dict] = []
    last_event: dict[int, float] = {}
    print(f"Grabando → {log_path}")
    print(f"Macro    → {macro_path} (F9 para guardar)")
    print_help()
    print("---")

    try:
        while True:
            r, _, _ = select.select(devices, [], [], 0.05)
            for dev in r:
                for event in dev.read():
                    if event.type != ecodes.EV_KEY:
                        continue

                    now = time.monotonic()
                    if now - last_event.get(event.code, 0) < 0.04:
                        continue
                    last_event[event.code] = now

                    pressed = event.value == 1
                    code = event.code

                    if code in CLICK_BUTTONS:
                        if not pressed:
                            continue
                        btn = CLICK_BUTTONS[code]
                        pos = get_cursor_pos()
                        line = f"[{ts()}] CLIC_{btn.upper()} {format_pos(pos)}"
                        print(line)
                        append_log(log_path, line)
                        if pos:
                            snippet = (
                                f'      {{"type": "move_absolute", "x": {pos[0]}, "y": {pos[1]}}},\n'
                                f'      {{"type": "click", "button": "{btn}"}}'
                            )
                            print(f"  → pasos sugeridos:\n{snippet}")
                        continue

                    if not pressed:
                        continue

                    pos = get_cursor_pos()
                    name = key_name(code)
                    line = f"[{ts()}] TECLA={name} {format_pos(pos)}"
                    print(line)
                    append_log(log_path, line)

                    if code in DIGIT_KEYS and pos:
                        digit = DIGIT_KEYS[code]
                        snippet = digit_snippet(digit, pos)
                        print(f"  → fragmento para atalhos.json:\n{snippet}")
                        append_log(log_path, f"  FRAGMENTO_{digit}: {json.dumps({'x': pos[0], 'y': pos[1]})}")

                    if code == ecodes.KEY_F6 and pos:
                        step = step_json("move_absolute", pos)
                        steps.append(step)
                        print(f"  + mover a ({pos[0]}, {pos[1]})  [{len(steps)} pasos]")
                    elif code == ecodes.KEY_F7:
                        step = step_json("click", pos, button="left")
                        steps.append(step)
                        print(f"  + clic izquierdo  [{len(steps)} pasos]")
                    elif code == ecodes.KEY_F8:
                        step = step_json("delay", pos, ms=200)
                        steps.append(step)
                        print(f"  + esperar 200 ms  [{len(steps)} pasos]")
                    elif code == ecodes.KEY_F9:
                        save_macro(macro_path, steps)
                        print(f"  ✓ Macro guardada ({len(steps)} pasos) → {macro_path}")
                    elif code == ecodes.KEY_F10:
                        steps.clear()
                        print("  ✓ Pasos de macro vaciados")
    except KeyboardInterrupt:
        print("\nDetenido.")
    finally:
        for dev in devices:
            dev.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())
