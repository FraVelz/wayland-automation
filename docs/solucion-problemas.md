# Solución de problemas

## Scripts y permisos (ambas ramas)

| Problema | Solución |
|----------|----------|
| `ydotoold no está activo` | `./scripts/ydotoold.sh start` |
| `failed to open uinput` | `./scripts/setup.sh`, cerrar sesión |
| `wl-find-cursor no encontrado` | `./scripts/setup.sh` |
| Coordenadas OK, ratón no se mueve | `./scripts/ydotoold.sh status`, grupo `input` |
| `invalid geometry` con grim | Formato Sway: `"X,Y 1x1"` |

```bash
./scripts/ydotoold.sh check
./scripts/ydotoold.sh status
groups | grep input
```

## Rama `pyside`

| Problema | Solución |
|----------|----------|
| `ModuleNotFoundError: PySide6` | `./scripts/activar-entorno.sh` |
| `QPixmap` / core dumped | `sudo pacman -S qt6-wayland`, reiniciar app |
| Ventana no abre | Ejecutar desde terminal dentro de Sway (foot) |

## Rama `tauri` — Node / pnpm

| Problema | Solución |
|----------|----------|
| `ERR_PNPM_IGNORED_BUILDS` | `esbuild: true` en `pnpm-workspace.yaml`, `pnpm install` |
| `Cannot find name 'process'` en build | `@types/node` instalado (ya en el proyecto) |

## Rama `tauri` — Rust / compilación

| Problema | Solución |
|----------|----------|
| `cargo not found` | `source ~/.cargo/env` o instalar rustup |
| `webkit2gtk-4.1` not found | `./scripts/setup-tauri-deps.sh` |
| `javascriptcoregtk-4.1` not found | Mismo script (incluido en webkit2gtk) |

## Rama `tauri` — ejecución

| Problema | Solución |
|----------|----------|
| Solo navegador, no ventana | Usar `pnpm tauri dev`, no solo `pnpm dev` |
| Build lento la primera vez | Normal: descarga crates de Rust |

Volver al [índice](overview.md).
