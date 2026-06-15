# Scripts shell

## Core (`core/`) — infraestructura

Levanta el entorno. Cargan `core/lib/common.sh`.

```bash
chmod +x core/*.sh scripts/*.sh scripts/tools/*.sh
./core/setup.sh
```

| Script | Función |
|--------|---------|
| `setup.sh` | Paquetes Arch, grupo `input`, compila `wl-find-cursor`, systemd user |
| `ydotoold.sh` | Gestión del daemon |
| `prender.sh` / `apagar.sh` | Encender/apagar el daemon en la sesión actual |

```bash
./core/prender.sh
./core/apagar.sh
./core/ydotoold.sh status
./core/ydotoold.sh check
./core/ydotoold.sh logs
```

Más: [daemon.md](daemon.md).

## Scripts (`scripts/`) — uso diario

| Script | Función |
|--------|---------|
| `macro_gui.sh` | Terminal con cursor/color; guardar puntos y reproducir secuencia |

### Macro en terminal (`macro_gui.sh`)

```bash
./core/prender.sh
./scripts/macro_gui.sh
./scripts/macro_gui.sh --clear
./scripts/macro_gui.sh --stop
```

| Tecla / flag | Acción |
|--------------|--------|
| **1** o **Ctrl** | Guarda punto actual → mover + clic al reproducir |
| **0** | Reproduce toda la secuencia |
| **Esc** | Vacía la secuencia |
| **--clear** | Vacía `scripts/config/macro_gui.json` y sale |
| **Ctrl+C** | Sale y persiste el JSON |

Cada punto guardado genera una notificación (`notify-send`).

## Tools (`scripts/tools/`) — prescindibles

Herramientas de apoyo. Cargan `core/lib/common.sh`.

### Cursor (`cursor.sh`)

```bash
./scripts/tools/cursor.sh -w
./scripts/tools/cursor.sh -c
./scripts/tools/cursor.sh --json -c
```

### Mover ratón (`mover_raton.sh`)

```bash
./scripts/tools/mover_raton.sh --x 500 --y 300
```

### Grabar coordenadas (`grabar_posiciones.sh`)

```bash
./scripts/tools/grabar_posiciones.sh
```

Salida: `scripts/tools/config/grabacion.log` y `scripts/tools/config/macro_generado.json`.

Volver al [índice](overview.md).
