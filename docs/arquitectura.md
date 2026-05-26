# Arquitectura

## Principio

La lógica Wayland vive en **scripts shell** y herramientas del sistema.

Las GUIs solo construyen argumentos, ejecutan procesos y muestran salida.

```text
                    ┌─────────────────┐
                    │  PySide (pyside) │
                    │  o Tauri (tauri) │
                    └────────┬────────┘
                             │ subprocess / invoke
                    ┌────────▼────────┐
                    │   scripts/*.sh   │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
   wl-find-cursor        ydotool          grim + magick
   (coordenadas)            │            (color, -c)
                            ▼
                       ydotoold → /dev/uinput
```

## Lectura del cursor

1. `cursor.sh` → `wl-find-cursor` → coordenadas `(x, y)` vía Sway.
2. Con `-c` (CLI o GUI **pyside**): `grim` captura 1×1 px + ImageMagick → HEX/RGB.
3. Rama **tauri**: la GUI solo usa coordenadas (`-w` sin `-c`).

## Movimiento del ratón

1. `mover_raton.sh` → `ydotool` (relativo o absoluto).
2. Socket `/tmp/.ydotool_socket` → `ydotoold` → `/dev/uinput`.
3. Requiere grupo `input` y daemon activo.

## Capa PySide (`pyside`)

- `CommandBuilder` arma `argv` de cada script.
- `ProcessRunner` (`QProcess`) emite líneas al panel de log.
- `get_daemon_info()` consulta socket, systemd, grupo `input`, `/dev/uinput`.
- `QTimer` actualiza el estado del daemon cada 5 s.

## Capa Tauri (`tauri`)

- React: pestañas Cursor, Ratón, Daemon, Sistema.
- Rust (`lib.rs`): `run_script`, `stop_script`, `get_daemon_info`.
- Eventos Tauri: `script-output`, `script-finished`.
- `pnpm tauri dev` abre ventana nativa (WebKitGTK en Linux).

## Instalación

- `scripts/setup.sh` — base para todas las ramas.
- `scripts/setup-tauri-deps.sh` — solo necesario para compilar Tauri en Arch.

Volver al [índice](overview.md).
