# Solución de problemas

| Problema | Solución |
|----------|----------|
| `ModuleNotFoundError: PySide6` | `./scripts/activar-entorno.sh` o `pip install -r requirements.txt` |
| `QPixmap` / core dumped al iniciar | `sudo pacman -S qt6-wayland` y ejecuta `./scripts/activar-entorno.sh` |
| La ventana no abre en Cursor | Ejecuta `./scripts/activar-entorno.sh` desde una terminal de Sway (foot) |
| `ydotoold no está activo` | `./scripts/ydotoold.sh start` o pestaña Daemon de la GUI |
| `failed to open uinput` | `./scripts/setup.sh`, cerrar sesión, volver a entrar |
| `wl-find-cursor no encontrado` | `./scripts/setup.sh` (recompila en `bin/`) |
| `invalid geometry` con grim | Los scripts usan formato Sway: `"X,Y 1x1"` |
| Coordenadas OK pero ratón no se mueve | `./scripts/ydotoold.sh status` y comprobar grupo `input` |

## Diagnóstico rápido

```bash
./scripts/ydotoold.sh check
./scripts/ydotoold.sh status
groups | grep input
```

Volver al [índice](overview.md).
