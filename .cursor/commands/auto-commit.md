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
5. Confirmar rama: en **`script`** no deben entrar archivos de Tauri/Node/React.

**No** incluir: `bin/wl-find-cursor`, `.build/`, `scripts/config/atalhos.json`, logs, credenciales.

## Scopes habituales

`scripts`, `cursor`, `daemon`, `macros`, `hotkeys`, `setup`, `systemd`, `docs`, `cursor` (config agente), `deps`.

Rutas: `scripts/`, `scripts/lib/`, `scripts/config/`, `docs/`, `systemd/`, `.cursor/`.

## Ejemplos

```text
feat(scripts): add numeric hotkeys listener via evdev
fix(scripts): dedupe keyboard events on multi-device setups
docs(scripts): document grabar_posiciones and atalhos flow
chore(cursor): align agent rules for script-only branch
```

## Commit (obligatorio con `-F`)

```bash
cat > /tmp/commit-msg.txt <<'EOF'
feat(scripts): add grabar_posiciones and atalhos_numeros
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
