# Solución de problemas

## Scripts y permisos

| Problema | Solución |
|----------|----------|
| `ydotoold no está activo` | `./core/ydotoold.sh install && ./core/prender.sh` |
| `failed to open uinput` | `./core/setup.sh` (carga `uinput` y aplica udev). Si el grupo `input` es nuevo → cerrar sesión |
| `Permission denied` en logs de systemd | `./core/ydotoold.sh install` (unidad con `sg input` y `-p /tmp/.ydotool_socket`) |
| Daemon en socket distinto (`/run/user/...`) | `./core/ydotoold.sh install` (unidad con `-p /tmp/.ydotool_socket`) |
| Grupo `input` sí, `/dev/uinput` sin permisos | `sudo modprobe uinput && sudo udevadm trigger -c add -s misc -n uinput` o `./core/setup.sh` |
| `wl-find-cursor no encontrado` | `./core/setup.sh` |
| Coordenadas OK, ratón no se mueve | `./core/ydotoold.sh status`, grupo `input` |
| `invalid geometry` con grim | Formato Sway: `"X,Y 1x1"` |

```bash
./core/ydotoold.sh check
./core/ydotoold.sh status
groups | grep input
```

## Atajos y grabación (evdev)

| Problema | Solución |
|----------|----------|
| `No module named 'evdev'` | `sudo pacman -S python-evdev` o `./core/setup.sh` |
| `No se pudo abrir dispositivos de entrada` | Usuario en grupo `input`; cerrar sesión tras `./core/setup.sh` |
| Coordenadas vacías al grabar | `./core/setup.sh` (compila `wl-find-cursor`) |
| Atajos no mueven el ratón | `./core/prender.sh` |
| El dígito también se escribe en la app activa | Normal sin `grab`; usa el teclado numérico o edita la app enfocada |

Volver al [índice](overview.md).
