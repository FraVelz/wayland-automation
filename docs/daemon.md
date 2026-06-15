# Daemon ydotoold

`ydotoold` es el servicio que recibe comandos de `ydotool` e inyecta eventos de ratón y teclado vía `/dev/uinput`.

## Requisitos

| Requisito | Motivo |
|-----------|--------|
| Grupo `input` | Acceso a `/dev/uinput` |
| Sesión Wayland activa | Los scripts deben ejecutarse dentro de Sway |
| `ydotoold` en ejecución | Socket en `/tmp/.ydotool_socket` |

## Comprobar permisos

```bash
./core/ydotoold.sh check
groups | grep input
ls -l /dev/uinput
```

## systemd (usuario)

`core/setup.sh` instala la unidad desde `systemd/ydotoold.service` en `~/.config/systemd/user/`.

La unidad arranca `ydotoold` con `-p /tmp/.ydotool_socket` (el daemon **no** lee la variable `YDOTOOL_SOCKET`; solo la usa el cliente `ydotool`) y `sg input` para que systemd --user tenga acceso a `/dev/uinput`.

Si actualizaste la unidad del repo, reinstálala:

```bash
./core/ydotoold.sh install
./core/ydotoold.sh enable     # habilitar al iniciar sesión
./core/prender.sh
./core/ydotoold.sh status
```

Tras añadirte al grupo `input` con `core/setup.sh`, **cierra sesión y vuelve a entrar**.

Volver al [índice](overview.md).
