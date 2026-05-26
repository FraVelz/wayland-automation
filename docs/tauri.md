# Rama Tauri (React + TypeScript)

## Estructura

```text
src/              # Frontend React + Tailwind
src-tauri/        # Backend Rust (comandos Tauri)
scripts/          # Mismos scripts shell que en pyside
```

## Comandos Tauri (Rust)

| Comando | Función |
|---------|---------|
| `get_daemon_info` | Estado de ydotoold, grupo input, uinput |
| `run_script` | Ejecuta un script en `scripts/` y emite salida por eventos |
| `stop_script` | Termina el proceso en curso |

Eventos hacia el frontend:

- `script-output` — línea de stdout/stderr
- `script-finished` — código de salida

## Frontend

- `src/App.tsx` — pestañas y orquestación
- `src/hooks/useScriptRunner.ts` — escucha eventos y lanza scripts
- `src/hooks/useDaemonStatus.ts` — polling cada 5 s

## Cursor sin color

La rama `tauri` no expone botones con `-c` (color del píxel). Solo coordenadas una vez o en tiempo real (`cursor.sh` / `cursor.sh -w`).

## Desarrollo

```bash
npm install
npm run tauri dev
```

Volver al [índice](overview.md).
