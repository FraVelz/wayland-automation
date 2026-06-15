# Wayland Automation — Scripts (Sway)

Automatización en **Arch Linux + Sway** con scripts shell: posición del cursor, macros de clic y gestión de `ydotoold`.

## Requisitos

- Arch Linux con sesión **Sway** (Wayland)
- `sudo` solo la primera vez (`./core/setup.sh`)
- Grupo **`input`**, **`evtest`** y `ydotoold` activo para reproducir macros

## Empezar

```bash
git clone https://github.com/FraVelz/wayland-automation.git
cd wayland-automation
chmod +x core/*.sh scripts/*.sh
./core/setup.sh   # no uses sudo en el script completo; pedirá sudo internamente
```

Si te añaden al grupo `input`, **cierra sesión y vuelve a entrar**.

Comprobar el daemon:

```bash
./core/ydotoold.sh status
./core/prender.sh
./core/apagar.sh
```

## Core (infraestructura)

| Script | Función |
|--------|---------|
| `setup.sh` | Instalación del sistema |
| `ydotoold.sh` | Gestión del daemon |
| `prender.sh` / `apagar.sh` | Encender/apagar el daemon en la sesión actual |

## Scripts (uso diario)

| Script | Función |
|--------|---------|
| `macro_gui.sh` | Terminal con cursor/color; guarda puntos (1/Ctrl) y reproduce (0) |

```bash
./core/prender.sh
./scripts/macro_gui.sh
./scripts/macro_gui.sh --clear   # vacía la macro guardada
./scripts/macro_gui.sh --stop    # detiene instancias colgadas
```

Controles en la terminal:
- **1** o **Ctrl** → guarda posición actual (mover + clic al reproducir)
- **0** → reproduce toda la secuencia
- **Esc** → vacía la secuencia
- **Ctrl+C** → sale y detiene procesos en segundo plano

## Documentación

| Nivel          | Enlace                                                   |
| -------------- | -------------------------------------------------------- |
| Índice técnico | [docs/overview.md](docs/overview.md)                     |
| Instalación    | [docs/instalacion.md](docs/instalacion.md)               |
| Scripts shell  | [docs/scripts.md](docs/scripts.md)                       |
| Problemas      | [docs/solucion-problemas.md](docs/solucion-problemas.md) |

## Autor y licencia

| | |
| --- | --- |
| **Autor** | [Fravelz](https://github.com/FraVelz) |
| **Licencia** | [Apache License 2.0](LICENSE) |
