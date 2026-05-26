# Instalación

## 1. Base

Desde la raíz del repositorio:

```bash
chmod +x scripts/*.sh
./scripts/setup.sh   # no uses sudo ./scripts/setup.sh
```

El script:

1. Instala paquetes con `pacman` (sudo).
2. Añade el usuario al grupo **`input`**.
3. Compila `wl-find-cursor` en `bin/`.
4. Instala unidad systemd user para `ydotoold`.

**Importante:** si acabas de entrar en `input`, cierra sesión y vuelve a entrar.

## 2. Paquetes de `setup.sh`

| Paquete | Uso |
|---------|-----|
| `ydotool` | Control ratón/teclado |
| `grim`, `slurp` | Captura Wayland (color con `-c` en CLI) |
| `imagemagick` | Color RGB/HEX del píxel |
| `wayland-protocols`, `base-devel`, `git` | Compilar wl-find-cursor |

## 3. GUI Tauri (escritorio)

### Dependencias de sistema (Arch)

Sin estos paquetes verás `webkit2gtk-4.1 was not found` al compilar.

```bash
./scripts/setup-tauri-deps.sh
./scripts/check-tauri-deps.sh
```

Instala `webkit2gtk-4.1` (incluye `javascriptcoregtk-4.1`), `gtk3`, `libsoup3`, `pkgconf`, etc.

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

## 4. Permisos

| Requisito | Motivo |
|-----------|--------|
| Grupo `input` | `/dev/uinput` |
| Sesión Sway | `WAYLAND_DISPLAY` |
| `ydotoold` en marcha | Mover el ratón |

```bash
./scripts/ydotoold.sh check
groups | grep input
```

## 5. Atajo Sway (opcional)

```text
bindsym $mod+m exec /ruta/al/repo/bin/wl-find-cursor
```

Volver al [índice](overview.md).
