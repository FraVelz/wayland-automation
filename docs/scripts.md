# Scripts shell

Todos los `.sh` están en `scripts/` y cargan `scripts/lib/common.sh`.

## Instalación del sistema

```bash
chmod +x scripts/*.sh
./scripts/setup.sh
```

| Script | Función |
|--------|---------|
| `setup.sh` | Paquetes Arch, grupo `input`, compila `wl-find-cursor`, systemd user |

## Daemon (`ydotoold.sh`)

```bash
./scripts/ydotoold.sh start
./scripts/ydotoold.sh stop
./scripts/ydotoold.sh restart
./scripts/ydotoold.sh status
./scripts/ydotoold.sh enable
./scripts/ydotoold.sh check
./scripts/ydotoold.sh logs
```

Más: [daemon.md](daemon.md).

## Cursor (`cursor.sh`)

Requiere `wl-find-cursor` y sesión Wayland.

```bash
./scripts/cursor.sh                  # una lectura
./scripts/cursor.sh -w               # tiempo real
./scripts/cursor.sh -w -i 0.05       # intervalo 50 ms
./scripts/cursor.sh --json           # JSON sin color
```

Con color del píxel (`-c`, usa `grim` + ImageMagick):

```bash
./scripts/cursor.sh -c
./scripts/cursor.sh -w -c
./scripts/cursor.sh --json -c
```

## Mover ratón (`mover_raton.sh`)

Requiere `ydotoold` activo.

```bash
./scripts/mover_raton.sh
./scripts/mover_raton.sh --dx 0 --dy -50
./scripts/mover_raton.sh --x 500 --y 300
./scripts/mover_raton.sh --delay 0
```

## Macro desde JSON (`ejecutar_macro.sh`)

```bash
./scripts/ejecutar_macro.sh --file scripts/config/macro_generado.json
```

## Grabar coordenadas (`grabar_posiciones.sh`)

Registra teclas y clics con la posición del cursor. Sirve para descubrir coordenadas y armar macros.

```bash
./scripts/grabar_posiciones.sh
```

- Cada tecla/clic → log con `x=` e `y=`
- **0–9** → imprime fragmento JSON para `atalhos.json`
- **F6** mover, **F7** clic, **F8** delay, **F9** guardar macro, **F10** vaciar

Salida: `scripts/config/grabacion.log` y `scripts/config/macro_generado.json`.

## Atajos numéricos (`atalhos_numeros.sh`)

Al pulsar **0–9** ejecuta comando shell y/o secuencia de ratón.

```bash
cp scripts/config/atalhos.json.example scripts/config/atalhos.json
# edita coordenadas
./scripts/atalhos_numeros.sh
```

Formato en `atalhos.json`:

```json
"1": {
  "label": "Mi atajo",
  "command": "notify-send hola",
  "steps": [
    {"type": "move_absolute", "x": 500, "y": 300},
    {"type": "click", "button": "left"}
  ]
}
```

Volver al [índice](overview.md).
