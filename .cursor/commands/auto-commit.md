# Autocommit — wayland-automation

Usar cuando el usuario pida **hacer commit** del trabajo actual. Mensajes **Conventional Commits**, coherentes con
`git log`. **No** hacer `git push` salvo petición explícita.

## Prohibido (Cursor / co-autor)

- **Nunca** dejar `Co-authored-by: Cursor` (ni variantes) en el mensaje.
- **Nunca** push si `git log -1 --format=%B` muestra trailer de agente/IDE.
- Usar **`git commit -F`** con archivo de mensaje limpio; verificar con `git log -1 --format=%B`.

Cumplir [`.cursor/rules/git-commits.mdc`](../rules/git-commits.mdc).

## Cuándo ejecutar

- Invocación de **`/auto-commit`** o petición explícita de commit.
- **No** commitear si el usuario no lo pidió.

## Antes de commitear

1. `git status` — staged y unstaged.
2. `git diff` — qué entra en el commit.
3. `git log -15 --oneline` — tono reciente.
4. **Respetar borrados:** si el diff elimina líneas o archivos, **no restaurarlos** ni "arreglar" el contenido antes del commit salvo petición explícita del usuario. Un borrado suele ser intencional.
5. Confirmar rama: **`main`** (solo scripts shell; no Tauri/Node/React).

**No** incluir: `bin/wl-find-cursor`, `.build/`, `scripts/config/macro_gui.json`, logs, credenciales.

## Scopes habituales

`scripts`, `cursor`, `daemon`, `macros`, `hotkeys`, `setup`, `systemd`, `docs`, `cursor` (config agente), `deps`.

Rutas: `core/`, `scripts/`, `docs/`, `systemd/`, `.cursor/`.

## Ejemplos

```text
feat(scripts): add macro_gui terminal recorder via evtest
fix(daemon): detect stale ydotoold socket before playback
docs(scripts): document macro_gui controls and setup flow
```

## Commit (obligatorio con `-F`)

```bash
cat > /tmp/commit-msg.txt <<'EOF'
feat(scripts): add macro_gui with reliable cursor playback
EOF
git commit -F /tmp/commit-msg.txt
git log -1 --format=%B
```

## Reglas

- Mensaje en **inglés**; respuesta al chat en **español**.
- Hook rechazado → corregir y **nuevo** commit; sin `--no-verify` salvo petición explícita.

## Comandos relacionados

- **`/update-docs`** — sincronizar docs con el repo.
- **`/problems-search`** — auditoría (no implica commit).
