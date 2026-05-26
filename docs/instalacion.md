# Instalación

## 1. Base (todas las ramas)

Desde la raíz del repositorio:

```bash
chmod +x scripts/*.sh
./scripts/setup.sh
```

El script:

1. Instala paquetes con `pacman` (sudo).
2. Añade el usuario al grupo **`input`**.
3. Compila `wl-find-cursor` en `bin/`.
4. Instala unidad systemd user para `ydotoold`.
5. En rama **`pyside`**: crea `env/` e instala PySide6.

**Importante:** si acabas de entrar en `input`, cierra sesión y vuelve a entrar.

## 2. Paquetes de `setup.sh`

| Paquete | Uso |
|---------|-----|
| `ydotool` | Control ratón/teclado |
| `grim`, `slurp` | Captura Wayland (color con `-c`) |
| `imagemagick` | Color RGB/HEX del píxel |
| `wayland-protocols`, `base-devel`, `git` | Compilar wl-find-cursor |
| `python`, `qt6-wayland` | GUI PySide en Wayland |

## 3. Rama `pyside` — GUI Python

```bash
git checkout pyside
./scripts/activar-entorno.sh
```

Manual:

```bash
python3 -m venv env && source env/bin/activate
pip install -r requirements.txt
python main.py
```

## 4. Rama `tauri` — GUI de escritorio

### Dependencias de sistema (Arch)

```bash
./scripts/setup-tauri-deps.sh
```

Instala principalmente `webkit2gtk-4.1` y `gtk3`.

### Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
rustup default stable
```

### Node y pnpm

```bash
corepack enable
pnpm install
```

### Desarrollo y release

```bash
pnpm tauri dev      # ventana de escritorio
pnpm tauri build    # ejecutable en src-tauri/target/release/
```

## 5. Permisos

| Requisito | Motivo |
|-----------|--------|
| Grupo `input` | `/dev/uinput` |
| Sesión Sway | `WAYLAND_DISPLAY` |
| `ydotoold` en marcha | Mover el ratón |

```bash
./scripts/ydotoold.sh check
groups | grep input
```

## 6. Atajo Sway (opcional)

```text
bindsym $mod+m exec /ruta/al/repo/bin/wl-find-cursor
```

Volver al [índice](overview.md).
