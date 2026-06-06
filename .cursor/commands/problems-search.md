# Auditoría de problemas (`/problems-search`)

## Cuándo ejecutar

- El usuario invoca **`/problems-search`** o pide auditoría global del repo.
- **No** implica corregir nada salvo petición posterior; primero **inventariar y priorizar**.

## Objetivo

Revisar el proyecto de forma sistemática (global → local) con foco en **Wayland, permisos, scripts y docs**.
Considerar impacto en uso real: automatización rota, daemon caído, coordenadas incorrectas, atajos que no disparan.

## Comprobaciones automáticas

Ejecutar cuando sea posible (sin `--no-verify`, sin alterar `git config`):

```bash
git branch --show-current
bash -n scripts/*.sh
python3 -m py_compile scripts/lib/*.py 2>/dev/null || true
./scripts/ydotoold.sh check 2>/dev/null || true
./scripts/cursor.sh --help
./scripts/grabar_posiciones.sh --help
./scripts/atalhos_numeros.sh --help
```

En rama **`main`** adicionalmente (si existen): `pnpm lint`, `pnpm tauri build` — solo si el usuario está en esa rama.

## Factores y prioridades

| Nivel | Etiqueta | Criterio |
|-------|----------|----------|
| **P0** | Crítico | Scripts rotos, `set -e` sin manejar errores graves, secretos en git, Tauri mezclado en rama `script` |
| **P1** | Alto | `ydotoold`/permisos mal documentados, JSON de macro inválido, evdev sin grupo `input`, docs desalineadas con scripts |
| **P2** | Medio | Duplicación bash/python, falta de `usage()`, inconsistencias en `common.sh` |
| **P3** | Bajo | Typos en docs, mensajes poco claros, mejoras opcionales |

## Áreas a revisar

### 1. Scripts y permisos (P0–P1)

- `scripts/setup.sh`, `ydotoold.sh`, `lib/common.sh`
- Socket `YDOTOOL_SOCKET`, grupo `input`, `/dev/uinput`
- Wrappers bash ↔ Python (`PYTHONPATH`, `WL_FIND_CURSOR`)

### 2. Macros y atajos (P1)

- Formato JSON en `ejecutar_macro.sh`, `atalhos_numeros.py`, `atalhos.json.example`
- Deduplicación evdev, placeholders de `command` en config

### 3. Documentación (P1–P2)

- `README.md`, `docs/scripts.md`, `docs/solucion-problemas.md`
- Referencias obsoletas a Tauri/pnpm en rama `script`
- Comandos de ejemplo ejecutables

### 4. Git e higiene (P2–P3)

- Archivos locales en staging (`atalhos.json`, logs, `bin/`)
- `.gitignore` coherente

### 5. Agente Cursor (P3)

- `.cursor/rules/` y commands alineados con la rama

Respetar [`.cursor/rules/project.mdc`](../rules/project.mdc) y [`.cursor/rules/scripts.mdc`](../rules/scripts.mdc).

## Formato del informe

Responder en **español**:

```markdown
## Resumen ejecutivo
…

## P0 — Crítico
- [ ] **Título** — ruta — impacto — fix sugerido

## P1 — Alto
…

## Comprobaciones ejecutadas
- …
```

Máximo ~15–25 ítems con impacto real. **No** commitear ni pushear salvo petición explícita.
