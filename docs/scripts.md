# Scripts shell

## Core (`core/`) — infraestructura

Levanta el entorno. Cargan `core/lib/common.sh`.

```bash
chmod +x core/*.sh scripts/*.sh
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
| **1** o **Ctrl** | Guarda punto actual → mover + clic izquierdo al reproducir |
| **2** | Igual que 1, pero con clic derecho |
| **0** | Reproduce toda la secuencia |
| **9** | Borra el último punto guardado |
| **q** | Activa/desactiva la captura de números (0–9) |
| **Esc** | Vacía la secuencia |
| **--clear** | Vacía `scripts/config/macro_gui.json` y sale |
| **Ctrl+C** | Sale y persiste el JSON |

Cada punto guardado genera una notificación (`notify-send`).

Volver al [índice](overview.md).
