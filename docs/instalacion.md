# Instalación

## 1. Clonar

```bash
git clone https://github.com/FraVelz/wayland-automation.git
cd wayland-automation
```

## 2. Setup del sistema

Desde la raíz del repositorio:

```bash
chmod +x core/*.sh scripts/*.sh
./core/setup.sh   # no uses sudo ./core/setup.sh
```

El script:

1. Instala paquetes con `pacman` (sudo).
2. Añade el usuario al grupo **`input`**.
3. Compila `wl-find-cursor` en `bin/`.
4. Instala unidad systemd user para `ydotoold`.

**Importante:** si acabas de entrar en `input`, cierra sesión y vuelve a entrar.

## 3. Paquetes de `setup.sh`

| Paquete | Uso |
|---------|-----|
| `ydotool` | Control ratón/teclado |
| `grim`, `slurp` | Captura Wayland (color del píxel en macro_gui) |
| `imagemagick` | Color RGB/HEX del píxel |
| `evtest` | Escuchar teclas globales en macro_gui |
| `python-evdev` | Utilidades Python compartidas |
| `wayland-protocols`, `base-devel`, `git` | Compilar wl-find-cursor |

## 4. Permisos

| Requisito | Motivo |
|-----------|--------|
| Grupo `input` | `/dev/uinput` y `/dev/input/event*` |
| Sesión Sway | `WAYLAND_DISPLAY` |
| `ydotoold` en marcha | Mover el ratón |

```bash
./core/ydotoold.sh check
groups | grep input
```

## 5. Atajo Sway (opcional)

```text
bindsym $mod+m exec /ruta/al/repo/bin/wl-find-cursor
```

Volver al [índice](overview.md).
