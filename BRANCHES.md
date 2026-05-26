# Ramas del repositorio

## Resumen

| Rama | Contenido | Rama por defecto en GitHub |
|------|-----------|----------------------------|
| `pyside` | GUI PySide6, `main.py`, `app/`, `requirements.txt` | Sí |
| `tauri` | GUI Tauri + React, `src/`, `src-tauri/`, `pnpm` | No |

Lo **compartido** en ambas ramas:

- `scripts/` — automatización Wayland
- `docs/` — documentación técnica (con secciones específicas por rama)
- `bin/wl-find-cursor`, `systemd/`, `setup.sh`

## Cuándo usar cada una

- **`pyside`**: app Qt nativa en Wayland; menos Node/Rust; color del píxel (`-c`) en la GUI.
- **`tauri`**: React + Tailwind + Tauri; app de escritorio WebView; React Doctor; sin color en GUI.

## Cambiar de rama

```bash
git checkout pyside
# o
git checkout tauri
```

Tras cambiar, instala dependencias de esa rama (`./scripts/activar-entorno.sh` o `pnpm install`).
