# Estructura del proyecto

Automatización Wayland solo con scripts shell (rama **`main`**).

```text
wayland-automation/
├── README.md
├── LICENSE
├── docs/
├── core/                         # infraestructura (setup + daemon)
│   ├── setup.sh
│   ├── ydotoold.sh
│   ├── prender.sh
│   ├── apagar.sh
│   └── lib/
│       └── common.sh
├── scripts/                      # uso diario
│   ├── macro_gui.sh
│   ├── lib/
│   │   └── input_common.py
│   └── config/
│       └── macro_gui.json        # local (gitignore)
├── bin/wl-find-cursor            # compilado por setup.sh
├── systemd/ydotoold.service
└── .gitignore
```

## Carpetas ignoradas / generadas

| Carpeta / archivo | Qué es |
|-------------------|--------|
| `.build/` | Clon temporal para compilar wl-find-cursor |
| `bin/wl-find-cursor` | Binario local (no en git) |
| `scripts/config/macro_gui.json` | Macro guardada por el usuario |

Volver al [índice](overview.md).
