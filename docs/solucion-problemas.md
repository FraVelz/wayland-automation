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

## Atajos y grabación (evdev)

| Problema | Solución |
|----------|----------|
| `No module named 'evdev'` | `sudo pacman -S python-evdev` o `./scripts/setup.sh` |
| `No se pudo abrir dispositivos de entrada` | Usuario en grupo `input`; cerrar sesión tras `./scripts/setup.sh` |
| Coordenadas vacías al grabar | `./scripts/setup.sh` (compila `wl-find-cursor`) |
| Atajos no mueven el ratón | `./scripts/ydotoold.sh start` |
| El dígito también se escribe en la app activa | Normal sin `grab`; usa el teclado numérico o edita la app enfocada |

Volver al [índice](overview.md).
