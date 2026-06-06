# Estructura del proyecto

Rama **`script`**: automatización Wayland solo con scripts shell.

```text
wayland-automation/
├── README.md
├── LICENSE
├── docs/
├── scripts/
│   ├── setup.sh
│   ├── cursor.sh
│   ├── mover_raton.sh
│   ├── ejecutar_macro.sh
│   ├── grabar_posiciones.sh      # registrar teclas + coordenadas
│   ├── atalhos_numeros.sh        # atajos 0-9
│   ├── ydotoold.sh
│   ├── lib/
│   │   ├── common.sh
│   │   ├── input_common.py
│   │   ├── grabar_posiciones.py
│   │   └── atalhos_numeros.py
│   └── config/
│       └── atalhos.json.example
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
| `scripts/config/macro_generado.json` | Macro grabada con F9 |
| `scripts/config/grabacion.log` | Log de grabación |

Volver al [índice](overview.md).
