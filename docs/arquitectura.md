# Arquitectura

## Capas

```
main.py / app/ ──► scripts/*.sh ──► herramientas Wayland
cursor.sh ───────► wl-find-cursor (+ grim/imagemagick con -c)
mover_raton.sh ──► ydotool ──► ydotoold ──► /dev/uinput
ydotoold.sh ─────► systemd --user o proceso en segundo plano
scripts/setup.sh ► instala todo lo anterior en Arch Linux
```

## Lectura del cursor y color

1. `cursor.sh` llama a `wl-find-cursor` para obtener `(x, y)` vía la API de Sway.
2. Con la opción `-c`, `common.sh` captura un píxel con `grim` (formato de geometría Sway: `"X,Y 1x1"`) y extrae HEX/RGB con ImageMagick.

No se usa X11 ni XWayland para las coordenadas.

## Movimiento del ratón

1. `mover_raton.sh` invoca `ydotool` con desplazamiento relativo (`--dx`, `--dy`) o posición absoluta (`--x`, `--y`).
2. `ydotool` envía órdenes al socket `/tmp/.ydotool_socket`.
3. `ydotoold` las traduce a eventos en `/dev/uinput` (requiere grupo `input`).

Sin `ydotoold` activo, las lecturas de cursor pueden funcionar pero el movimiento fallará.

## Aplicación gráfica

- `MainWindow` construye la UI y delega en `CommandBuilder` la línea de comando de cada script.
- `ProcessRunner` ejecuta procesos en segundo plano y vuelca stdout/stderr al panel de log.
- Un `QTimer` periódico comprueba si existe el socket de `ydotoold` para actualizar el indicador de estado.

La GUI no reimplementa la lógica Wayland: es una capa sobre los mismos scripts que la terminal.

Volver al [índice](overview.md).
