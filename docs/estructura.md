# Estructura del proyecto

El repositorio tiene **dos ramas** con distinto frontend; el backend shell es común.

## Compartido (ambas ramas)

```text
wayland-automation/
├── README.md
├── BRANCHES.md
├── docs/
├── scripts/
│   ├── setup.sh              # Instalación sistema + PySide en env/
│   ├── setup-tauri-deps.sh     # WebKit GTK para compilar Tauri (Arch)
│   ├── activar-entorno.sh      # Solo rama pyside: lanza GUI Python
│   ├── cursor.sh
│   ├── mover_raton.sh
│   ├── ydotoold.sh
│   └── lib/common.sh
├── bin/wl-find-cursor
├── systemd/ydotoold.service
├── package.json              # pnpm: lint MD; en tauri también frontend
├── pnpm-lock.yaml
├── pnpm-workspace.yaml       # allowBuilds (pnpm 11)
└── .gitignore
```

## Rama `pyside`

```text
├── main.py
├── requirements.txt          # PySide6
├── app/
│   ├── config.py
│   ├── services/             # commands, runner, daemon_info
│   └── ui/                   # main_window, theme, widgets, daemon_panel
└── env/                      # venv Python (generado, no en git)
```

| Entrada | Uso |
|---------|-----|
| `scripts/setup.sh` | Una vez: paquetes, permisos, wl-find-cursor, PySide en `env/` |
| `scripts/activar-entorno.sh` | Abrir la GUI |
| `main.py` | Entrada directa con venv activo |

## Rama `tauri`

```text
├── index.html
├── vite.config.ts
├── tsconfig*.json
├── eslint.config.js
├── react-doctor.config.json
├── tailwind.config.js
├── src/                      # React
│   ├── App.tsx
│   ├── components/
│   ├── hooks/
│   └── lib/
├── src-tauri/                # Rust + Tauri
│   ├── src/lib.rs            # run_script, get_daemon_info
│   ├── tauri.conf.json
│   └── Cargo.toml
├── dist/                     # build frontend (generado)
└── node_modules/
```

| Entrada | Uso |
|---------|-----|
| `pnpm install` | Dependencias Node |
| `pnpm tauri dev` | App de escritorio en desarrollo |
| `pnpm tauri build` | Ejecutable release |
| `scripts/setup-tauri-deps.sh` | Librerías GTK/WebKit (sudo) |

## Carpetas ignoradas

| Carpeta | Qué es |
|---------|--------|
| `.build/` | Clon temporal para compilar wl-find-cursor |
| `env/` | Entorno virtual Python (`pyside`) |
| `src-tauri/target/` | Artefactos Rust (`tauri`) |
| `node_modules/`, `dist/` | Frontend (`tauri`) |

Volver al [índice](overview.md).
