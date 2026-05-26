# Rama Tauri

App de **escritorio** con Tauri 2, React 19, TypeScript, Tailwind y backend Rust.

## Estructura

```text
src/           → UI React (pestañas, log, formularios)
src-tauri/     → Rust: ejecutar scripts, estado del daemon
scripts/       → Misma automatización que pyside
```

## Arranque

| Modo | Comando | Resultado |
|------|---------|-----------|
| Desarrollo | `pnpm tauri dev` | Ventana nativa + hot reload del frontend |
| Solo web | `pnpm dev` | Vite en navegador (sin Tauri) |
| Release | `pnpm tauri build` | Binario en `src-tauri/target/release/` |

Requisitos previos: [instalacion.md](instalacion.md) §4.

## Comandos Rust (`invoke`)

| Comando | Función |
|---------|---------|
| `get_cursor_position` | Coordenadas, color HEX/RGB/CSS/HSL del píxel bajo el cursor |
| `get_daemon_info` | Socket, PID, grupo input, uinput, autostart |
| `run_script` | Ejecuta `scripts/<nombre>` con argumentos |
| `stop_script` | Termina proceso en curso |

Eventos al frontend:

- `script-output` — línea de salida
- `script-finished` — código y estado

## Frontend

| Ruta | Rol |
|------|-----|
| `src/App.tsx` | Pestañas y orquestación |
| `src/hooks/useScriptRunner.ts` | Ejecución y log |
| `src/hooks/useDaemonStatus.ts` | Polling daemon (5 s) |
| `src/components/*` | Cursor, Ratón, Daemon, Sistema |

## Diferencias con `pyside`

- Stack pnpm + ESLint + React Doctor.
- Depende de Rust y WebKitGTK para compilar.

## Calidad

Ver [calidad.md](calidad.md).

Volver al [índice](overview.md).
