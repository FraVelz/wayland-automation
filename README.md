# Automatización Wayland (Sway)

Herramientas para ver la posición del cursor, mover el ratón y gestionar `ydotoold` en **Arch Linux** con **Sway**.

Esta rama (`tauri`) usa **Tauri 2 + React + TypeScript + Tailwind CSS**. La versión PySide6 está en la rama [`pyside`](https://github.com/FraVelz/wayland-automation/tree/pyside).

## Ramas

| Rama | Interfaz |
|------|----------|
| `pyside` | PySide6 (por defecto) |
| `tauri` | Tauri + React |

Ver [BRANCHES.md](BRANCHES.md).

## Requisitos (rama tauri)

- Todo lo de `pyside`: Sway, `scripts/setup.sh`, grupo `input`
- [Node.js](https://nodejs.org/) 20+ y [pnpm](https://pnpm.io/) (`corepack enable`)
- [Rust](https://www.rust-lang.org/tools/install) (`rustup`; luego `source ~/.cargo/env`)
- Librerías GTK/WebKit en Arch: `./scripts/setup-tauri-deps.sh`

## Instalación del sistema

```bash
chmod +x scripts/*.sh
./scripts/setup.sh
```

Cierra sesión si te añadieron al grupo `input`.

## Desarrollo (interfaz Tauri)

```bash
pnpm install
pnpm tauri dev
```

Compilar release:

```bash
pnpm tauri build
```

## Diferencias respecto a PySide

- Misma lógica detrás: los scripts en `scripts/` no cambian.
- La pestaña **Cursor** solo muestra **coordenadas** (sin color del píxel / `-c`).
- No se incluye configuración del editor Cursor (carpeta `.cursor/` ignorada en git).

## Calidad de código

```bash
pnpm lint       # ESLint + TypeScript
pnpm doctor     # React Doctor (calidad React)
pnpm lint:md    # markdownlint
pnpm format     # Prettier
```

Configuración de React Doctor: `react-doctor.config.json`.

## Documentación técnica

[docs/overview.md](docs/overview.md) · [docs/tauri.md](docs/tauri.md)

## Problemas frecuentes

| Qué ves | Qué hacer |
|---------|-----------|
| `ERR_PNPM_IGNORED_BUILDS` (esbuild) | En `pnpm-workspace.yaml` debe estar `esbuild: true`; luego `pnpm install` |
| `cargo not found` | `source ~/.cargo/env` o instala Rust con rustup |
| `webkit2gtk-4.1` / `javascriptcoregtk` not found | `./scripts/setup-tauri-deps.sh` (pide sudo) |
| `ydotoold no está activo` | `./scripts/ydotoold.sh start` |
| El ratón no se mueve | Cierra sesión tras `./scripts/setup.sh` |

Más: [docs/solucion-problemas.md](docs/solucion-problemas.md).
