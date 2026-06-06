# Wayland Automation — Scripts (Sway)

Automatización en **Arch Linux + Sway** solo con scripts shell: posición del cursor, movimiento del ratón, atajos numéricos y gestión de `ydotoold`.

> Esta es la rama **`script`**: terminal únicamente, sin GUI (Tauri/React está en **`main`**).

## Requisitos

- Arch Linux con sesión **Sway** (Wayland)
- `sudo` solo la primera vez (`./scripts/setup.sh`)
- Grupo **`input`** y `ydotoold` activo para mover el ratón y escuchar teclas

## Empezar

```bash
git clone https://github.com/FraVelz/wayland-automation.git
cd wayland-automation
git checkout script
chmod +x scripts/*.sh
./scripts/setup.sh   # no uses sudo en el script completo; pedirá sudo internamente
```

Si te añaden al grupo `input`, **cierra sesión y vuelve a entrar**.

Comprobar el daemon:

```bash
./scripts/ydotoold.sh status
```

## Scripts

| Script | Función |
|--------|---------|
| `cursor.sh` | Coordenadas del cursor (y color con `-c`) |
| `mover_raton.sh` | Mueve el ratón (requiere ydotoold) |
| `ejecutar_macro.sh` | Ejecuta una macro desde JSON |
| `grabar_posiciones.sh` | Registra teclas/clics y coordenadas (para armar macros) |
| `atalhos_numeros.sh` | Al pulsar 0–9 ejecuta comando/macro |
| `ydotoold.sh` | Gestión del daemon |

```bash
./scripts/cursor.sh -w                    # coordenadas en tiempo real
./scripts/grabar_posiciones.sh          # descubrir coordenadas
cp scripts/config/atalhos.json.example scripts/config/atalhos.json
./scripts/atalhos_numeros.sh            # atajos numéricos
```

## Documentación

| Nivel          | Enlace                                                   |
| -------------- | -------------------------------------------------------- |
| Índice técnico | [docs/overview.md](docs/overview.md)                     |
| Instalación    | [docs/instalacion.md](docs/instalacion.md)               |
| Scripts shell  | [docs/scripts.md](docs/scripts.md)                       |
| Problemas      | [docs/solucion-problemas.md](docs/solucion-problemas.md) |

## Autor y licencia

| | |
| --- | --- |
| **Autor** | [Fravelz](https://github.com/FraVelz) |
| **Licencia** | [Apache License 2.0](LICENSE) |
