import { useCallback, useState } from "react";
import { getCursorPosition, runMacro } from "../lib/api";
import {
  CLICK_BUTTONS,
  stepLabel,
  type ClickButton,
  type Macro,
  type MacroStep,
} from "../lib/macros";
import { HotkeyInput } from "./ui/HotkeyInput";
import type { DaemonInfo } from "../lib/types";

interface TabMacrosProps {
  info: DaemonInfo | null;
  disabled: boolean;
  hotkeysEnabled: boolean;
  onHotkeysEnabledChange: (enabled: boolean) => void;
  onLog: (line: string) => void;
  macros: Macro[];
  addMacro: () => void;
  removeMacro: (id: string) => void;
  updateMacro: (id: string, patch: Partial<Macro>) => void;
  duplicateMacro: (id: string) => void;
  addStep: (macroId: string, step: MacroStep) => void;
  updateStep: (macroId: string, index: number, step: MacroStep) => void;
  removeStep: (macroId: string, index: number) => void;
  moveStep: (macroId: string, index: number, direction: -1 | 1) => void;
}

function StepEditor({
  step,
  onChange,
}: {
  step: MacroStep;
  onChange: (step: MacroStep) => void;
}) {
  switch (step.type) {
    case "delay":
      return (
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-400">Milisegundos</span>
          <input
            className="input w-28"
            type="number"
            min={0}
            value={step.ms}
            onChange={(e) => onChange({ type: "delay", ms: Number(e.target.value) || 0 })}
          />
        </label>
      );
    case "move_absolute":
      return (
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-400">X</span>
            <input
              className="input w-24"
              type="number"
              value={step.x}
              onChange={(e) =>
                onChange({ type: "move_absolute", x: Number(e.target.value) || 0, y: step.y })
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-400">Y</span>
            <input
              className="input w-24"
              type="number"
              value={step.y}
              onChange={(e) =>
                onChange({ type: "move_absolute", x: step.x, y: Number(e.target.value) || 0 })
              }
            />
          </label>
        </div>
      );
    case "move_relative":
      return (
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-400">ΔX</span>
            <input
              className="input w-24"
              type="number"
              value={step.dx}
              onChange={(e) =>
                onChange({
                  type: "move_relative",
                  dx: Number(e.target.value) || 0,
                  dy: step.dy,
                })
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-400">ΔY</span>
            <input
              className="input w-24"
              type="number"
              value={step.dy}
              onChange={(e) =>
                onChange({
                  type: "move_relative",
                  dx: step.dx,
                  dy: Number(e.target.value) || 0,
                })
              }
            />
          </label>
        </div>
      );
    case "click":
      return (
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-400">Botón</span>
          <select
            className="input w-40"
            value={step.button}
            onChange={(e) =>
              onChange({ type: "click", button: e.target.value as ClickButton })
            }
          >
            {CLICK_BUTTONS.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      );
  }
}

export function TabMacros({
  info,
  disabled,
  hotkeysEnabled,
  onHotkeysEnabledChange,
  onLog,
  macros,
  addMacro,
  removeMacro,
  updateMacro,
  duplicateMacro,
  addStep,
  updateStep,
  removeStep,
  moveStep,
}: TabMacrosProps) {
  const [selectedId, setSelectedId] = useState<string | null>(() => macros[0]?.id ?? null);
  const [runningMacro, setRunningMacro] = useState(false);

  const selected =
    macros.find((m) => m.id === selectedId) ?? macros[0] ?? null;

  const log = useCallback((line: string) => onLog(line), [onLog]);

  const capturePosition = useCallback(async () => {
    if (!selected) return;
    try {
      const pos = await getCursorPosition();
      addStep(selected.id, { type: "move_absolute", x: pos.x, y: pos.y });
      log(`+ Paso: mover a (${pos.x}, ${pos.y})\n`);
    } catch (err) {
      log(`✗ No se pudo leer el cursor: ${String(err)}\n`);
    }
  }, [selected, addStep, log]);

  const executeMacro = useCallback(
    async (macro: Macro) => {
      if (!info?.ready_for_mouse) {
        log("⚠ ydotoold no está listo para ejecutar macros.\n");
        return;
      }
      if (macro.steps.length === 0) {
        log(`⚠ "${macro.name}" no tiene pasos.\n`);
        return;
      }
      setRunningMacro(true);
      log(`— Ejecutar "${macro.name}" —\n`);
      try {
        await runMacro(macro.steps);
        log(`■ "${macro.name}" completada\n\n`);
      } catch (err) {
        log(`✗ ${String(err)}\n`);
      } finally {
        setRunningMacro(false);
      }
    },
    [info?.ready_for_mouse, log],
  );

  const warning = !info?.ready_for_mouse
    ? !info?.running
      ? "⚠ ydotoold está inactivo. Las macros de movimiento/clic necesitan el daemon."
      : !info?.input_group
        ? "⚠ Falta el grupo input. Ejecuta scripts/setup.sh y cierra sesión."
        : `⚠ /dev/uinput: ${info?.uinput}.`
    : "";

  const busy = disabled || runningMacro;

  return (
    <div className="space-y-4">
      {warning ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          {warning}
        </p>
      ) : null}

      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Atajos globales</h2>
          <p className="mt-1 text-sm text-gray-400">
            Funcionan aunque la ventana no tenga el foco. El campo de atajo escucha teclas en vivo (pausa
            el registro global mientras capturas).
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hotkeysEnabled}
            onChange={(e) => onHotkeysEnabledChange(e.target.checked)}
          />
          Escuchar atajos
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(200px,240px)_1fr]">
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Macros</h2>
            <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={addMacro}>
              + Nueva
            </button>
          </div>
          {macros.length === 0 ? (
            <p className="text-sm text-gray-400">Crea una macro para empezar.</p>
          ) : (
            <ul className="space-y-1">
              {macros.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className={
                      selected?.id === m.id
                        ? "w-full rounded-lg bg-accent/20 px-3 py-2 text-left text-sm"
                        : "w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-border/40"
                    }
                    onClick={() => setSelectedId(m.id)}
                  >
                    <span className="font-medium">{m.name}</span>
                    {m.hotkey.trim() ? (
                      <span className="ml-2 font-mono text-xs text-accent">{m.hotkey}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selected ? (
          <div className="space-y-4">
            <div className="card space-y-4">
              <h2 className="font-semibold">Configuración</h2>
              <div className="flex flex-wrap gap-4">
                <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-sm">
                  <span className="text-gray-400">Nombre</span>
                  <input
                    className="input"
                    value={selected.name}
                    onChange={(e) => updateMacro(selected.id, { name: e.target.value })}
                  />
                </label>
                <div className="min-w-[200px] flex-1">
                  <HotkeyInput
                    key={selected.id}
                    id={`macro-hotkey-${selected.id}`}
                    label="Atajo (opcional)"
                    value={selected.hotkey}
                    onChange={(hotkey) => updateMacro(selected.id, { hotkey })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.enabled}
                  onChange={(e) => updateMacro(selected.id, { enabled: e.target.checked })}
                />
                Macro activa (el atajo solo se registra si está activa y hay atajo)
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={busy}
                  onClick={() => void executeMacro(selected)}
                >
                  Ejecutar ahora
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={busy}
                  onClick={() => duplicateMacro(selected.id)}
                >
                  Duplicar
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  disabled={busy}
                  onClick={() => {
                    if (!confirm(`¿Eliminar "${selected.name}"?`)) return;
                    removeMacro(selected.id);
                    setSelectedId(macros.find((m) => m.id !== selected.id)?.id ?? null);
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="card space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">Pasos</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary px-3 py-1.5 text-xs"
                    disabled={busy}
                    onClick={() => addStep(selected.id, { type: "delay", ms: 300 })}
                  >
                    + Pausa
                  </button>
                  <button
                    type="button"
                    className="btn-secondary px-3 py-1.5 text-xs"
                    disabled={busy}
                    onClick={() =>
                      addStep(selected.id, { type: "move_relative", dx: 50, dy: 0 })
                    }
                  >
                    + Mover relativo
                  </button>
                  <button
                    type="button"
                    className="btn-secondary px-3 py-1.5 text-xs"
                    disabled={busy}
                    onClick={() => addStep(selected.id, { type: "click", button: "left" })}
                  >
                    + Clic
                  </button>
                  <button
                    type="button"
                    className="btn-secondary px-3 py-1.5 text-xs"
                    disabled={busy}
                    onClick={() => void capturePosition()}
                  >
                    + Posición actual
                  </button>
                </div>
              </div>

              {selected.steps.length === 0 ? (
                <p className="text-sm text-gray-400">Añade pasos a la secuencia.</p>
              ) : (
                <ol className="space-y-3">
                  {selected.steps.map((step, index) => (
                    <li
                      key={`${selected.id}-${index}`}
                      className="rounded-lg border border-surface-border bg-surface p-3"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-300">
                          {index + 1}. {stepLabel(step)}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="btn-secondary px-2 py-1 text-xs"
                            disabled={busy || index === 0}
                            onClick={() => moveStep(selected.id, index, -1)}
                            title="Subir"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="btn-secondary px-2 py-1 text-xs"
                            disabled={busy || index === selected.steps.length - 1}
                            onClick={() => moveStep(selected.id, index, 1)}
                            title="Bajar"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="btn-danger px-2 py-1 text-xs"
                            disabled={busy}
                            onClick={() => removeStep(selected.id, index)}
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                      <StepEditor
                        step={step}
                        onChange={(next) => updateStep(selected.id, index, next)}
                      />
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <p className="text-sm text-gray-400">Selecciona o crea una macro.</p>
          </div>
        )}
      </div>
    </div>
  );
}
