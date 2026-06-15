# Estructura del proyecto

Rama **`script`**: automatización Wayland solo con scripts shell.

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
├── scripts/                      # uso diario (permanente)
│   ├── atalhos_numeros.sh
│   ├── ejecutar_macro.sh
│   ├── lib/
│   │   ├── input_common.py
│   │   └── atalhos_numeros.py
│   ├── config/
│   │   └── atalhos.json.example
│   └── tools/                    # prescindibles / experimentales
│       ├── cursor.sh
│       ├── grabar_posiciones.sh
│       ├── mover_raton.sh
│       └── lib/
│           └── grabar_posiciones.py
├── bin/wl-find-cursor            # compilado por setup.sh
├── systemd/ydotoold.service
└── .gitignore
```

## Carpetas ignoradas / generadas

| Carpeta / archivo | Qué es |
|-------------------|--------|
| `.build/` | Clon temporal para compilar wl-find-cursor |
| `bin/wl-find-cursor` | Binario local (no en git) |
| `scripts/config/atalhos.json` | Config local de atajos |
| `scripts/tools/config/macro_generado.json` | Macro grabada con F9 |
| `scripts/tools/config/grabacion.log` | Log de grabación |

Volver al [índice](overview.md).
