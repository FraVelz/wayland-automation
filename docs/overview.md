# Documentación técnica

Índice del proyecto **Wayland Automation** (rama **`script`**: solo scripts shell).

El [README](../README.md) es la guía rápida; aquí está el detalle por tema.

## Índice

| Documento | Contenido |
|-----------|-----------|
| [estructura.md](estructura.md) | Árbol del proyecto |
| [scripts.md](scripts.md) | Uso de `scripts/*.sh` |
| [daemon.md](daemon.md) | `ydotoold`, permisos, systemd |
| [instalacion.md](instalacion.md) | `setup.sh`, paquetes Arch |
| [solucion-problemas.md](solucion-problemas.md) | Errores frecuentes |
| [referencias.md](referencias.md) | Enlaces externos |

## Flujo

```text
scripts/*.sh  →  wl-find-cursor / ydotool / grim / python-evdev
                         ↓
                   ydotoold → /dev/uinput
```

## Ramas del repositorio

| Rama | Contenido |
|------|-----------|
| **`script`** | Scripts shell + docs (esta rama) |
| **`main`** | Scripts + GUI Tauri (React + Rust) |

## Repositorio

- GitHub: `FraVelz/wayland-automation`
