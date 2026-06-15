# Documentación técnica

Índice del proyecto **Wayland Automation** (scripts shell en Sway/Wayland).

El [README](../README.md) es la guía rápida; aquí está el detalle por tema.

## Índice

| Documento | Contenido |
|-----------|-----------|
| [estructura.md](estructura.md) | Árbol del proyecto |
| [scripts.md](scripts.md) | Uso de `core/` y `scripts/` |
| [daemon.md](daemon.md) | `ydotoold`, permisos, systemd |
| [instalacion.md](instalacion.md) | `setup.sh`, paquetes Arch |
| [solucion-problemas.md](solucion-problemas.md) | Errores frecuentes |
| [referencias.md](referencias.md) | Enlaces externos |

## Flujo

```text
core/*.sh  →  scripts/*.sh  →  wl-find-cursor / ydotool / grim / evtest
                         ↓
                   ydotoold → /dev/uinput
```

## Repositorio

- GitHub: [FraVelz/wayland-automation](https://github.com/FraVelz/wayland-automation) — rama **`main`**
