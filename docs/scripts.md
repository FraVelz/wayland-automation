# Scripts shell

Todos los `.sh` están en `scripts/` y cargan `scripts/lib/common.sh`.

## Instalación del sistema

```bash
chmod +x scripts/*.sh
./scripts/setup.sh
```

| Script | Función |
|--------|---------|
| `setup.sh` | Paquetes Arch, grupo `input`, compila `wl-find-cursor`, venv + PySide6, systemd user |
| `setup-tauri-deps.sh` | `webkit2gtk-4.1`, `gtk3`, etc. (compilar Tauri) |
| `activar-entorno.sh` | **Solo `pyside`**: crea `env/` y ejecuta `main.py` |

## Daemon (`ydotoold.sh`)

```bash
./scripts/ydotoold.sh start
./scripts/ydotoold.sh stop
./scripts/ydotoold.sh restart
./scripts/ydotoold.sh status
./scripts/ydotoold.sh enable
./scripts/ydotoold.sh check
./scripts/ydotoold.sh logs
```

Más: [daemon.md](daemon.md).

## Cursor (`cursor.sh`)

Requiere `wl-find-cursor` y sesión Wayland.

```bash
./scripts/cursor.sh                  # una lectura
./scripts/cursor.sh -w               # tiempo real
./scripts/cursor.sh -w -i 0.05       # intervalo 50 ms
./scripts/cursor.sh --json           # JSON sin color
```

Con color del píxel (`-c`, usa `grim` + ImageMagick):

```bash
./scripts/cursor.sh -c
./scripts/cursor.sh -w -c
./scripts/cursor.sh --json -c
```

La GUI de la rama **tauri** no expone `-c`; la de **pyside** sí.

## Mover ratón (`mover_raton.sh`)

Requiere `ydotoold` activo.

```bash
./scripts/mover_raton.sh
./scripts/mover_raton.sh --dx 0 --dy -50
./scripts/mover_raton.sh --x 500 --y 300
./scripts/mover_raton.sh --delay 0
```

Volver al [índice](overview.md).
