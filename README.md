# Automatización Wayland (Sway)

Herramientas para ver la posición del cursor, leer el color del píxel bajo el ratón y moverlo en **Arch Linux** con **Sway**.

Incluye una **aplicación gráfica** y scripts que puedes usar desde la terminal.

## ¿Qué necesitas?

- Arch Linux con **Sway** (sesión Wayland)
- Permisos de `sudo` solo la primera vez, para instalar

## Empezar en 2 pasos

```bash
chmod +x scripts/*.sh
./scripts/setup.sh
```

Si el instalador te añade al grupo `input`, **cierra sesión y vuelve a entrar** antes de seguir.

Abre la aplicación:

```bash
./scripts/activar-entorno.sh
```

## La aplicación gráfica

Al ejecutar `./scripts/activar-entorno.sh` se abre una ventana con cuatro pestañas:

| Pestaña | Para qué sirve |
|---------|----------------|
| **Cursor** | Ver coordenadas del ratón y el color del píxel |
| **Ratón** | Mover el cursor (relativo o a una posición) |
| **Daemon** | Estado en vivo, iniciar/detener/reiniciar, autostart, logs y diagnóstico |
| **Sistema** | Comprobar que todo está bien instalado |

Abajo verás un panel con la salida de los comandos y un indicador que muestra si el daemon está activo.

> Si mueves el ratón desde la app o los scripts, el daemon (`ydotoold`) debe estar en marcha. En la pestaña **Daemon** puedes iniciarlo con un clic.

## Uso desde terminal (opcional)

Si prefieres no usar la interfaz gráfica:

```bash
./scripts/cursor.sh              # posición del cursor
./scripts/mover_raton.sh         # mueve el ratón (requiere daemon activo)
./scripts/ydotoold.sh start      # inicia el daemon
./scripts/ydotoold.sh status     # comprueba si está activo
```

## Problemas frecuentes

| Qué ves | Qué hacer |
|---------|-----------|
| Error de PySide6 | Ejecuta `./scripts/activar-entorno.sh` de nuevo |
| La ventana no abre | Ábrela desde una terminal dentro de Sway (por ejemplo foot) |
| `ydotoold no está activo` | Pestaña **Daemon** → Iniciar, o `./scripts/ydotoold.sh start` |
| El ratón no se mueve | `./scripts/ydotoold.sh status` y, si hace falta, cierra sesión tras `./scripts/setup.sh` |
| `wl-find-cursor no encontrado` | Vuelve a ejecutar `./scripts/setup.sh` |

Más casos y detalles: [docs/solucion-problemas.md](docs/solucion-problemas.md).

## Documentación técnica

Arquitectura del proyecto, scripts, permisos e instalación detallada:

**[docs/overview.md](docs/overview.md)**

## Enlaces útiles

- [ydotool](https://github.com/ReimuNotMoe/ydotool)
- [wl-find-cursor](https://github.com/cjacker/wl-find-cursor)
