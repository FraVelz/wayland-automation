# Documentación técnica

Índice del proyecto **Wayland Automation**.

El [README](../README.md) es la guía rápida; aquí está el detalle por tema.

## Índice

| Documento | Contenido |
|-----------|-----------|
| [estructura.md](estructura.md) | Árbol del proyecto por rama |
| [arquitectura.md](arquitectura.md) | Capas: GUI → scripts → Wayland |
| [scripts.md](scripts.md) | Uso de `scripts/*.sh` |
| [daemon.md](daemon.md) | `ydotoold`, permisos, systemd |
| [instalacion.md](instalacion.md) | `setup.sh`, paquetes Arch, Tauri |
| [aplicacion.md](aplicacion.md) | Rama `pyside` (PySide6) |
| [tauri.md](tauri.md) | Rama `tauri` (React + Rust) |
| [calidad.md](calidad.md) | Lint, Prettier, React Doctor, CI |
| [solucion-problemas.md](solucion-problemas.md) | Errores frecuentes |
| [referencias.md](referencias.md) | Enlaces externos |

## Flujo común (scripts)

Todas las interfaces delegan en los mismos scripts:

```text
GUI (PySide o Tauri)  →  scripts/*.sh  →  wl-find-cursor / ydotool / grim
                              ↓
                         ydotoold  →  /dev/uinput
```

## Flujo por rama

### `pyside`

```text
activar-entorno.sh → main.py → app/ → ProcessRunner → scripts/
```

### `tauri`

```text
pnpm tauri dev → WebView + React (src/) → invoke Rust → scripts/
```

## Repositorio

- GitHub: `FraVelz/wayland-automation`
- Gestor de paquetes Node (rama `tauri`): **pnpm** (`packageManager` en `package.json`)
