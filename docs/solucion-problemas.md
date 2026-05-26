# Solución de problemas

## Scripts y permisos

| Problema | Solución |
|----------|----------|
| `ydotoold no está activo` | `./scripts/ydotoold.sh install && ./scripts/ydotoold.sh start` |
| `failed to open uinput` | `./scripts/setup.sh` (carga `uinput` y aplica udev). Si el grupo `input` es nuevo → cerrar sesión |
| `Permission denied` en logs de systemd | `./scripts/ydotoold.sh install` (unidad con `sg input` y `-p /tmp/.ydotool_socket`) |
| Daemon en socket distinto (`/run/user/...`) | `./scripts/ydotoold.sh install` (unidad con `-p /tmp/.ydotool_socket`) |
| Grupo `input` sí, `/dev/uinput` sin permisos | `sudo modprobe uinput && sudo udevadm trigger -c add -s misc -n uinput` o `./scripts/setup.sh` |
| `wl-find-cursor no encontrado` | `./scripts/setup.sh` |
| Coordenadas OK, ratón no se mueve | `./scripts/ydotoold.sh status`, grupo `input` |
| `invalid geometry` con grim | Formato Sway: `"X,Y 1x1"` |

```bash
./scripts/ydotoold.sh check
./scripts/ydotoold.sh status
groups | grep input
```

## Node / pnpm

| Problema | Solución |
|----------|----------|
| `vite: orden no encontrada` al hacer `pnpm tauri dev` | `pnpm install` en la raíz del repo |
| `ERR_PNPM_IGNORED_BUILDS` | `esbuild: true` en `pnpm-workspace.yaml`, `pnpm install` |
| `Cannot find name 'process'` en build | `@types/node` instalado (ya en el proyecto) |

## Rust / compilación

| Problema | Solución |
|----------|----------|
| `cargo not found` | `source ~/.cargo/env` o instalar rustup |
| `webkit2gtk-4.1` not found | `./scripts/setup-tauri-deps.sh` y `./scripts/check-tauri-deps.sh` |
| `javascriptcoregtk-4.1` not found | Mismo script (viene con el paquete `webkit2gtk-4.1`) |

## Ejecución Tauri

| Problema | Solución |
|----------|----------|
| Solo navegador, no ventana | Usar `pnpm tauri dev`, no solo `pnpm dev` |
| Build lento la primera vez | Normal: descarga crates de Rust |

Volver al [índice](overview.md).
