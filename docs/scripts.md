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

Funcionalidad principal. Cargan `core/lib/common.sh`.

| Script | Función |
|--------|---------|
| `atalhos_numeros.sh` | Atajos numéricos 0–9 |
| `ejecutar_macro.sh` | Ejecuta macros JSON |

### Atajos numéricos

```bash
cp scripts/config/atalhos.json.example scripts/config/atalhos.json
./scripts/atalhos_numeros.sh
```

Formato en `atalhos.json`:

```json
"1": {
  "label": "Mi atajo",
  "command": "notify-send hola",
  "steps": [
    {"type": "move_absolute", "x": 500, "y": 300},
    {"type": "click", "button": "left"}
  ]
}
```

### Macro desde JSON

```bash
./scripts/ejecutar_macro.sh --file scripts/tools/config/macro_generado.json
```

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
