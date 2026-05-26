# Scripts shell

Todos los scripts `.sh` están en `scripts/` y comparten funciones en `scripts/lib/common.sh`.

## Instalación y aplicación

```bash
./scripts/setup.sh           # instalar paquetes y permisos (una vez)
./scripts/activar-entorno.sh # abrir la GUI
```

## Daemon (`ydotoold.sh`)

```bash
./scripts/ydotoold.sh start      # iniciar
./scripts/ydotoold.sh stop       # detener
./scripts/ydotoold.sh restart    # reiniciar
./scripts/ydotoold.sh status     # estado y permisos
./scripts/ydotoold.sh enable     # arranque automático al iniciar sesión
./scripts/ydotoold.sh check      # diagnóstico completo
./scripts/ydotoold.sh logs       # ver logs
```

Detalle de permisos y systemd: [daemon.md](daemon.md).

## Cursor (`cursor.sh`)

Usa `wl-find-cursor`; con `-c` añade `grim` e ImageMagick.

```bash
./scripts/cursor.sh                  # coordenadas, una lectura
./scripts/cursor.sh -w               # coordenadas en tiempo real
./scripts/cursor.sh -c               # coordenadas + color, una lectura
./scripts/cursor.sh -w -c            # coordenadas + color en tiempo real
./scripts/cursor.sh -w -i 0.05       # actualización cada 50 ms
./scripts/cursor.sh --json -c        # {"x":1373,"y":882,"hex":"#1C1B22","rgb":"..."}
```

Salida con color:

```
x=1373 y=882  HEX=#1C1B22  RGB=srgb(28,27,34)
```

## Mover ratón (`mover_raton.sh`)

Requiere `ydotoold` activo.

```bash
./scripts/mover_raton.sh                      # 100 px a la derecha
./scripts/mover_raton.sh --dx 0 --dy -50        # 50 px arriba
./scripts/mover_raton.sh --x 500 --y 300        # posición absoluta
./scripts/mover_raton.sh --delay 0              # sin espera
```

Volver al [índice](overview.md).
