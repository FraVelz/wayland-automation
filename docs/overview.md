# Documentación técnica

Índice del proyecto **Wayland Automation**.

El [README](../README.md) es la guía rápida; aquí está el detalle por tema.

## Índice

| Documento | Contenido |
|-----------|-----------|
| [estructura.md](estructura.md) | Árbol del proyecto |
| [arquitectura.md](arquitectura.md) | Capas: GUI → scripts → Wayland |
| [scripts.md](scripts.md) | Uso de `scripts/*.sh` |
| [daemon.md](daemon.md) | `ydotoold`, permisos, systemd |
| [instalacion.md](instalacion.md) | `setup.sh`, paquetes Arch, Tauri |
| [tauri.md](tauri.md) | React + Rust (GUI) |
| [calidad.md](calidad.md) | Lint, Prettier, React Doctor, CI |
| [solucion-problemas.md](solucion-problemas.md) | Errores frecuentes |
| [referencias.md](referencias.md) | Enlaces externos |

## Flujo

```text
pnpm tauri dev → WebView + React (src/) → invoke Rust → scripts/
                              ↓
                    wl-find-cursor / ydotool / grim
                              ↓
                         ydotoold → /dev/uinput
```

## Repositorio

- GitHub: `FraVelz/wayland-automation` (rama **`main`**)
- Gestor Node: **pnpm** (`packageManager` en `package.json`)
