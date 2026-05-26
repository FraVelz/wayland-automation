# Documentación técnica

Índice de la documentación interna del proyecto. El [README](../README.md) está pensado para empezar rápido; aquí está el funcionamiento real y los detalles de implementación.

## Contenido

| Documento | Descripción |
|-----------|-------------|
| [estructura.md](estructura.md) | Árbol del proyecto y qué hace cada archivo |
| [arquitectura.md](arquitectura.md) | Cómo se relacionan la GUI, los scripts y las herramientas Wayland |
| [aplicacion.md](aplicacion.md) | Código Python: entrada, servicios e interfaz PySide6 |
| [scripts.md](scripts.md) | Scripts shell: cursor, ratón y daemon |
| [daemon.md](daemon.md) | `ydotoold`, permisos, systemd y diagnóstico |
| [instalacion.md](instalacion.md) | `scripts/setup.sh`, paquetes Arch y configuración del sistema |
| [solucion-problemas.md](solucion-problemas.md) | Tabla ampliada de errores y soluciones |
| [referencias.md](referencias.md) | Enlaces externos |

## Flujo resumido

```
Usuario → main.py / GUI → scripts/*.sh → ydotool / wl-find-cursor / grim
                              ↓
                         ydotoold → /dev/uinput
```

Para el detalle de cada capa, sigue los enlaces de la tabla.
