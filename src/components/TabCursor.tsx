import { ValueLabel } from "./ValueLabel";
import { useCursorPosition } from "../hooks/useCursorPosition";

const DEFAULT_INTERVAL_MS = 150;

export function TabCursor() {
  const {
    position,
    error,
    loading,
    watching,
    intervalMs,
    setIntervalMs,
    refresh,
    toggleWatch,
  } = useCursorPosition();

  const display = (n: number | undefined) =>
    loading && !position ? "…" : n !== undefined ? String(n) : "—";

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="font-semibold">Coordenadas del cursor</h2>
        <p className="mt-1 text-sm text-gray-400">
          Valores en vivo desde wl-find-cursor (sin panel de salida).
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <ValueLabel id="cursor-x" title="Posición X" value={display(position?.x)} />
          <ValueLabel id="cursor-y" title="Posición Y" value={display(position?.y)} />
        </div>

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
      </div>
    </div>
  );
}
