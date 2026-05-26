# Estructura del proyecto

```
python/
├── README.md
├── main.py                    # Punto de entrada
├── requirements.txt           # PySide6
│
├── app/                       # Código Python
│   ├── config.py              # Rutas del proyecto
│   ├── services/
│   │   ├── commands.py        # Construye comandos shell
│   │   └── runner.py          # Ejecuta procesos en segundo plano
│   └── ui/
│       ├── theme.py           # Tema oscuro (Qt StyleSheet)
│       ├── widgets.py         # Componentes reutilizables
│       └── main_window.py     # Ventana principal
│
├── scripts/                   # Todos los scripts shell
│   ├── setup.sh               # Instalación del sistema
│   ├── activar-entorno.sh     # Crea env/ y lanza la GUI
│   ├── cursor.sh
│   ├── mover_raton.sh
│   ├── ydotoold.sh
│   └── lib/common.sh
│
├── bin/wl-find-cursor
├── systemd/ydotoold.service
└── env/                       # Entorno virtual (creado por activar-entorno.sh)
```

## Instalación y entrada

| Archivo | Para qué sirve | Cuándo usarlo |
|---------|----------------|---------------|
| `scripts/setup.sh` | Instala paquetes Arch, permisos, compila `wl-find-cursor` e instala PySide6 en `env/` | Una sola vez |
| `main.py` | Lanza la aplicación PySide6 | Tras activar `env/` |
| `scripts/activar-entorno.sh` | Crea `env/` si no existe y ejecuta `main.py` | Forma recomendada de abrir la app |
| `app/` | Lógica de la GUI (ui + services) | Código Python del proyecto |

## Scripts de automatización

| Archivo | Para qué sirve | Depende de |
|---------|----------------|------------|
| `scripts/ydotoold.sh` | Gestiona el daemon que permite mover el ratón y simular teclado | `ydotool`, grupo `input`, sesión gráfica |
| `scripts/cursor.sh` | Coordenadas del cursor y, con `-c`, color HEX/RGB (una lectura o tiempo real) | `wl-find-cursor`; con `-c` también `grim` + `imagemagick` |
| `scripts/mover_raton.sh` | Mueve el ratón (relativo o absoluto) | `ydotoold` activo |
| `scripts/lib/common.sh` | Código compartido (buscar herramientas, leer coordenadas, capturar color) | Lo cargan los demás scripts; no ejecutar directamente |

## Binarios y servicios

| Archivo | Para qué sirve |
|---------|----------------|
| `bin/wl-find-cursor` | Consulta a Sway la posición del cursor. Wayland no lo expone de forma estándar |
| `systemd/ydotoold.service` | Plantilla que `scripts/setup.sh` copia a `~/.config/systemd/user/` para arranque automático |

## Carpetas auxiliares

| Carpeta | Qué es |
|---------|--------|
| `.build/` | Clon de `wl-find-cursor` usado solo durante `./scripts/setup.sh`. No hace falta tocarla |
| `env/` | Entorno virtual de Python con PySide6 |

Volver al [índice](overview.md).
