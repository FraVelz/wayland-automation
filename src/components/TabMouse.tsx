import { useState } from "react";
import type { DaemonInfo } from "../lib/types";

interface TabMouseProps {
  info: DaemonInfo | null;
  disabled: boolean;
  onDefault: () => void;
  onRelative: (dx: string, dy: string) => void;
  onAbsolute: (x: string, y: string) => void;
}

export function TabMouse({
  info,
  disabled,
  onDefault,
  onRelative,
  onAbsolute,
}: TabMouseProps) {
  const [dx, setDx] = useState("100");
  const [dy, setDy] = useState("0");
  const [absX, setAbsX] = useState("500");
  const [absY, setAbsY] = useState("300");

  const warning = !info?.ready_for_mouse
    ? !info?.running
      ? "⚠ ydotoold está inactivo. Inícialo desde la pestaña Daemon o el botón Iniciar arriba."
      : !info?.input_group
        ? "⚠ Falta el grupo input. Ejecuta scripts/setup.sh y cierra sesión."
        : `⚠ /dev/uinput: ${info.uinput}. Revisa permisos con scripts/setup.sh.`
    : "";

  return (
    <div className="space-y-4">
      {warning ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          {warning}
        </p>
      ) : null}

      <div className="card">
        <h2 className="font-semibold">Acción rápida</h2>
        <p className="mt-1 text-sm text-gray-400">Mueve el ratón 100 px a la derecha (requiere ydotoold).</p>
        <button
          type="button"
          className="btn-primary mt-4"
          disabled={disabled}
          onClick={onDefault}
        >
          Mover 100 px →
        </button>
      </div>

      <div className="card">
        <h2 className="font-semibold">Desplazamiento relativo</h2>
        <div className="mt-3 flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-400">ΔX</span>
            <input className="input w-28" value={dx} onChange={(e) => setDx(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-400">ΔY</span>
            <input className="input w-28" value={dy} onChange={(e) => setDy(e.target.value)} />
          </label>
        </div>
        <button
          type="button"
          className="btn-secondary mt-4"
          disabled={disabled}
          onClick={() => onRelative(dx, dy)}
        >
          Mover relativo
        </button>
      </div>

      <div className="card">
        <h2 className="font-semibold">Posición absoluta</h2>
        <div className="mt-3 flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-400">X</span>
            <input className="input w-28" value={absX} onChange={(e) => setAbsX(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-400">Y</span>
            <input className="input w-28" value={absY} onChange={(e) => setAbsY(e.target.value)} />
          </label>
        </div>
        <button
          type="button"
          className="btn-secondary mt-4"
          disabled={disabled}
          onClick={() => {
            if (!absX.trim() || !absY.trim()) {
              alert("Indica X e Y.");
              return;
            }
            onAbsolute(absX, absY);
          }}
        >
          Mover a posición
        </button>
      </div>
    </div>
  );
}
