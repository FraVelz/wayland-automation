import { CursorColorPanel } from "./CursorColorPanel";
import { HotkeyInput } from "./ui/HotkeyInput";
import { ValueLabel } from "./ValueLabel";
import type { CursorPosition } from "../lib/types";

const DEFAULT_INTERVAL_MS = 150;

interface TabCursorProps {
  position: CursorPosition | null;
  error: string | null;
  loading: boolean;
  watching: boolean;
  intervalMs: number;
  setIntervalMs: (ms: number) => void;
  refresh: () => Promise<void>;
  toggleWatch: () => void;
  stopHotkey: string;
  onStopHotkeyChange: (hotkey: string) => void;
}

export function TabCursor({
  position,
  error,
  loading,
  watching,
  intervalMs,
  setIntervalMs,
  refresh,
  toggleWatch,
  stopHotkey,
  onStopHotkeyChange,
}: TabCursorProps) {
  const display = (n: number | undefined) =>
    loading && !position ? "…" : n !== undefined ? String(n) : "—";

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="font-semibold">Coordenadas del cursor</h2>
        <p className="mt-1 text-sm text-gray-400">
          Posición en vivo con wl-find-cursor y color del píxel seleccionado.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <ValueLabel id="cursor-x" title="Posición X" value={display(position?.x)} />
          <ValueLabel id="cursor-y" title="Posición Y" value={display(position?.y)} />
        </div>

        <CursorColorPanel
          color={position?.color}
          error={position?.color_error}
          loading={loading}
        />

        {error ? (
          <p className="mt-3 text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <button
            type="button"
            className="btn-primary min-h-11"
            disabled={loading || watching}
            onClick={() => void refresh()}
          >
            Leer ahora
          </button>
          <button
            type="button"
            className={watching ? "btn-danger min-h-11" : "btn-secondary min-h-11"}
            onClick={toggleWatch}
          >
            {watching ? "Detener tiempo real" : "Tiempo real"}
          </button>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-400">Intervalo (ms)</span>
            <input
              className="input w-28"
              type="number"
              min={50}
              max={2000}
              step={50}
              value={intervalMs}
              disabled={watching}
              onChange={(e) =>
                setIntervalMs(Number(e.target.value) || DEFAULT_INTERVAL_MS)
              }
            />
          </label>
        </div>

        <div className="mt-4 max-w-xs">
          <HotkeyInput
            id="cursor-stop-hotkey"
            label="Atajo para detener tiempo real"
            value={stopHotkey}
            onChange={onStopHotkeyChange}
            hint="Global: con tiempo real activo, pulsa el atajo (fuera de este campo) para detenerlo."
          />
        </div>
      </div>
    </div>
  );
}
