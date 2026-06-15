# Actualizar documentación

Usar cuando el usuario invoque **`/update-docs`**, adjunte este archivo o pida alinear docs con el código.

## Objetivo

1. Corregir ortografía y redacción en **español** (idioma de `docs/` y `README.md`).
2. Alinear contenido factual con el **estado real del repo** (rama activa, scripts, rutas, comandos).
3. Actualizar enlaces rotos entre `README.md` ↔ `docs/*.md`.

## Ámbito de este repo

- Documentación en **`docs/`** (un solo idioma, español).
- **`README.md`** en la raíz.
- En rama **`script`**: no documentar Tauri/React salvo en la nota de ramas.
- En rama **`main`**: incluir sección GUI si existe en el README de esa rama.

## Fuentes de verdad al actualizar

| Tema | Contrastar con |
|------|----------------|
| Scripts y flags | `core/*.sh`, `scripts/*.sh`, `scripts/tools/*.sh`, `scripts/lib/` |
| Instalación / paquetes | `core/setup.sh` |
| Daemon | `core/ydotoold.sh`, `core/prender.sh`, `systemd/`, `docs/daemon.md` |
| Atajos y macros | `scripts/config/atalhos.json.example`, `docs/scripts.md` |
| Estructura | `docs/estructura.md`, árbol real del repo |
| Problemas frecuentes | `docs/solucion-problemas.md` |

## Pasos para el agente

1. Leer los archivos `@` indicados (o `README.md` + `docs/` si pidió barrido).
2. Explorar el repo y detectar discrepancias (scripts nuevos, rutas obsoletas, referencias a Tauri en rama `script`).
3. Corregir redacción sin cambiar alcance técnico salvo que el código haya cambiado.
4. Mantener tablas y bloques de código ejecutables **copiables** (comandos completos).
5. Resumen al usuario: archivos tocados y cambios factuales.

## Restricciones

- No inventar features que no existen en la rama actual.
- No eliminar secciones enteras sin petición explícita.
- No añadir pies “generado por IA” salvo que el usuario lo pida.
- Respuesta al usuario en **español**.

## Barrido completo

Si pide actualizar **toda** la documentación:

1. `README.md`
2. `docs/overview.md`, `estructura.md`, `instalacion.md`, `scripts.md`, `daemon.md`, `solucion-problemas.md`, `referencias.md`
3. Verificar enlaces cruzados al final.
