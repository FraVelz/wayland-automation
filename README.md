# Wayland Automation — Scripts (Sway)

Automatización en **Arch Linux + Sway** solo con scripts shell: posición del cursor, movimiento del ratón, atajos numéricos y gestión de `ydotoold`.

> Esta es la rama **`script`**: terminal únicamente, sin GUI (Tauri/React está en **`main`**).

## Requisitos

- Arch Linux con sesión **Sway** (Wayland)
- `sudo` solo la primera vez (`./core/setup.sh`)
- Grupo **`input`** y `ydotoold` activo para mover el ratón y escuchar teclas

## Empezar

```bash
git clone https://github.com/FraVelz/wayland-automation.git
cd wayland-automation
git checkout script
chmod +x core/*.sh scripts/*.sh scripts/tools/*.sh
./core/setup.sh   # no uses sudo en el script completo; pedirá sudo internamente
```

Si te añaden al grupo `input`, **cierra sesión y vuelve a entrar**.

Comprobar el daemon:

```bash
./core/ydotoold.sh status
./core/prender.sh
./core/apagar.sh
```

## Core (infraestructura)

| Script | Función |
|--------|---------|
| `setup.sh` | Instalación del sistema |
| `ydotoold.sh` | Gestión del daemon |
| `prender.sh` / `apagar.sh` | Encender/apagar el daemon en la sesión actual |

## Scripts (uso diario)

| Script | Función |
|--------|---------|
| `atalhos_numeros.sh` | Al pulsar 0–9 ejecuta comando/macro |
| `ejecutar_macro.sh` | Ejecuta una macro desde JSON |

```bash
cp scripts/config/atalhos.json.example scripts/config/atalhos.json
./scripts/atalhos_numeros.sh
```

## Tools (herramientas prescindibles)

| Script | Función |
|--------|---------|
| `tools/cursor.sh` | Coordenadas del cursor (y color con `-c`) |
| `tools/grabar_posiciones.sh` | Registra teclas/clics y coordenadas |
| `tools/mover_raton.sh` | Mueve el ratón (prueba de ydotool) |

```bash
./scripts/tools/cursor.sh -w
./scripts/tools/grabar_posiciones.sh
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
