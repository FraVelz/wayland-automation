# Wayland Automation (Sway)

Automatización en **Arch Linux + Sway**: posición del cursor, movimiento del ratón y gestión de `ydotoold`.

## ¿Qué incluye?

- **Scripts shell** en `scripts/` (núcleo del proyecto)
- **GUI de escritorio** con Tauri 2 + React + TypeScript + Tailwind (`src/`, `src-tauri/`)

## Requisitos

- Arch Linux con sesión **Sway** (Wayland)
- `sudo` solo la primera vez (`./scripts/setup.sh`)
- Grupo **`input`** y `ydotoold` activo para **mover** el ratón
- Node 20+, **pnpm**, **Rust**, `webkit2gtk-4.1` (para compilar la GUI)

## Empezar

```bash
git clone https://github.com/FraVelz/wayland-automation.git
cd wayland-automation
chmod +x scripts/*.sh
./scripts/setup.sh   # no uses sudo en el script completo; pedirá sudo internamente
```

Si te añaden al grupo `input`, **cierra sesión y vuelve a entrar**.

Comprobar el daemon:

```bash
./scripts/ydotoold.sh status
```

## Interfaz gráfica (Tauri)

```bash
corepack enable
pnpm install                    # obligatorio: instala vite y el resto
./scripts/setup-tauri-deps.sh   # WebKit GTK (sudo, obligatorio una vez)
./scripts/check-tauri-deps.sh   # verificar antes de compilar
source ~/.cargo/env             # si usas rustup
pnpm tauri dev                  # ventana de escritorio
```

Compilar ejecutable:

```bash
pnpm tauri build
# → src-tauri/target/release/ (y bundle/ si aplica)
```

## Scripts desde terminal (sin GUI)

```bash
./scripts/cursor.sh              # coordenadas del cursor
./scripts/mover_raton.sh         # mueve el ratón (requiere ydotoold)
./scripts/ydotoold.sh start      # inicia el daemon
./scripts/ydotoold.sh check      # diagnóstico
```

## Documentación

| Nivel          | Enlace                                                   |
| -------------- | -------------------------------------------------------- |
| Índice técnico | [docs/overview.md](docs/overview.md)                     |
| Instalación    | [docs/instalacion.md](docs/instalacion.md)               |
| Scripts shell  | [docs/scripts.md](docs/scripts.md)                       |
| Problemas      | [docs/solucion-problemas.md](docs/solucion-problemas.md) |

## Calidad de código

```bash
pnpm lint
pnpm react:doctor
pnpm lint:md
pnpm format
```

Ver [docs/calidad.md](docs/calidad.md).

## Autor y licencia

| | |
| --- | --- |
| **Autor** | [Fravelz](https://github.com/FraVelz) |
| **Licencia** | [Apache License 2.0](LICENSE) |
