# Instalación y configuración del sistema

## scripts/setup.sh

Ejecutar una vez desde la raíz del proyecto:

```bash
chmod +x scripts/*.sh
./scripts/setup.sh
```

El script:

1. Instala paquetes con `pacman` (pide `sudo`).
2. Crea `env/` e instala PySide6 desde `requirements.txt`.
3. Añade el usuario al grupo `input`.
4. Compila `wl-find-cursor` en `bin/`.
5. Copia la unidad systemd de usuario para `ydotoold`.

## Paquetes instalados

| Paquete | Uso |
|---------|-----|
| `ydotool` | Control de ratón y teclado |
| `grim` | Captura de pantalla Wayland |
| `slurp` | Selección de región (útil con grim) |
| `imagemagick` | Color RGB/HEX del píxel |
| `wayland-protocols` | Compilar wl-find-cursor |
| `qt6-wayland` | Plugin Wayland de Qt para la GUI |
| `python`, `base-devel`, `git` | Entorno y compilación |

## Permisos en Arch Linux

| Requisito | Motivo |
|-----------|--------|
| Grupo `input` | `/dev/uinput` para ydotoold |
| Sesión Wayland | Scripts enlazados a Sway |
| ydotoold corriendo | Comunicación con ydotool |

Si `scripts/setup.sh` te añadió a `input`, reinicia la sesión gráfica antes de usar el movimiento del ratón.

## Atajo opcional en Sway

Para resaltar la posición del cursor (ejecuta `wl-find-cursor`):

```
bindsym $mod+m exec /ruta/al/proyecto/bin/wl-find-cursor
```

Sustituye `/ruta/al/proyecto` por la ruta real del repositorio.

Volver al [índice](overview.md).
