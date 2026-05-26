# Calidad de código

Herramientas según la rama del repositorio.

## Rama `pyside`

| Herramienta | Comando |
|-------------|---------|
| Markdownlint | `pnpm lint:md` |

Requiere `pnpm install` en la raíz (solo `markdownlint-cli2` en `package.json`).

## Rama `tauri`

Gestor: **pnpm** (`packageManager: pnpm@11.1.1`).

| Herramienta | Comando | Config |
|-------------|---------|--------|
| ESLint + TypeScript | `pnpm lint` | `eslint.config.js` |
| React Doctor | `pnpm react:doctor` | `react-doctor.config.json` |
| Markdownlint | `pnpm lint:md` | `.markdownlint.json` |
| Prettier | `pnpm format` | `.prettierrc` |
| Build frontend | `pnpm build` | Vite + `tsc` |

### React Doctor

- Escanea `src/` (React).
- Ignora `src-tauri/`, `dist/`, `scripts/`, `docs/`.
- Integra reglas de ESLint existentes (`adoptExistingLintConfig: true`).

### pnpm 11 — builds nativos

En `pnpm-workspace.yaml`:

```yaml
allowBuilds:
  esbuild: true
  msgpackr-extract: true
```

Si falla `pnpm install` con `ERR_PNPM_IGNORED_BUILDS`, revisa que esos paquetes estén en `true`.

## CI (opcional)

Plantilla: [ci-workflow.example.yml](ci-workflow.example.yml).

Requiere scope `workflow` en `gh` para subir `.github/workflows/`.

```bash
gh auth refresh -h github.com -s workflow
cp docs/ci-workflow.example.yml .github/workflows/lint.yml
```

Volver al [índice](overview.md).
