# Wayland Automation (Sway)

Automatización en **Arch Linux + Sway**: posición del cursor, movimiento del ratón y gestión de `ydotoold`.

Repositorio: [github.com/FraVelz/wayland-automation](https://github.com/FraVelz/wayland-automation)

## ¿Qué incluye?

- **Scripts shell** en `scripts/` (núcleo compartido por todas las ramas)
- **Dos interfaces gráficas** en ramas distintas de git

| Rama | Interfaz | Arranque habitual |
|------|----------|-------------------|
| **`pyside`** (por defecto) | PySide6 / Qt nativo | `./scripts/activar-entorno.sh` |
| **`tauri`** | Tauri 2 + React + TypeScript + Tailwind | `pnpm tauri dev` |

Detalle de ramas: [BRANCHES.md](BRANCHES.md).

## Requisitos comunes

- Arch Linux con sesión **Sway** (Wayland)
- `sudo` solo la primera vez (`./scripts/setup.sh`)
- Grupo **`input`** y `ydotoold` activo para **mover** el ratón

## Empezar (cualquier rama)

```bash
git clone https://github.com/FraVelz/wayland-automation.git
cd wayland-automation
chmod +x scripts/*.sh
./scripts/setup.sh
```

Si te añaden al grupo `input`, **cierra sesión y vuelve a entrar**.

Comprobar el daemon:

```bash
./scripts/ydotoold.sh status
```

## Interfaz PySide (`pyside`)

```bash
git checkout pyside
./scripts/activar-entorno.sh
```

Requisitos extra: Python 3, venv en `env/`, `qt6-wayland` (lo instala `setup.sh`).

## Interfaz Tauri (`tauri`)

```bash
git checkout tauri
corepack enable
pnpm install
./scripts/setup-tauri-deps.sh   # WebKit GTK (sudo, una vez)
source ~/.cargo/env             # si usas rustup
pnpm tauri dev                  # ventana de escritorio
```

Compilar ejecutable:

```bash
pnpm tauri build
# → src-tauri/target/release/ (y bundle/ si aplica)
```

Requisitos extra: Node 20+, **pnpm**, **Rust**, `webkit2gtk-4.1`.

## Scripts desde terminal (sin GUI)

```bash
./scripts/cursor.sh              # coordenadas del cursor
./scripts/mover_raton.sh           # mueve el ratón (requiere ydotoold)
./scripts/ydotoold.sh start        # inicia el daemon
./scripts/ydotoold.sh check        # diagnóstico
```

## Documentación

| Nivel | Enlace |
|-------|--------|
| Índice técnico | [docs/overview.md](docs/overview.md) |
| Instalación sistema | [docs/instalacion.md](docs/instalacion.md) |
| Scripts shell | [docs/scripts.md](docs/scripts.md) |
| Problemas | [docs/solucion-problemas.md](docs/solucion-problemas.md) |

## Calidad de código (rama `tauri`)

```bash
pnpm lint
pnpm react:doctor
pnpm lint:md
pnpm format
```

Ver [docs/calidad.md](docs/calidad.md).

## Enlaces

- [ydotool](https://github.com/ReimuNotMoe/ydotool)
- [wl-find-cursor](https://github.com/cjacker/wl-find-cursor)
- [Tauri](https://tauri.app/)
- [React Doctor](https://react.doctor/)
