import type { DaemonInfo } from "../lib/types";

interface HeaderProps {
  info: DaemonInfo | null;
  onRefresh: () => void;
  onStart: () => void;
  onStop: () => void;
}

export function Header({ info, onRefresh, onStart, onStop }: HeaderProps) {
  const running = info?.running ?? false;
  const statusClass = running ? "text-emerald-400" : "text-red-400";

  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wayland Automation</h1>
        <p className="mt-1 text-sm text-gray-400">
          Control de cursor y ratón en Sway (Tauri + React)
        </p>
      </div>
      <div className="card min-w-[220px] text-right">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Estado ydotoold
        </p>
        <p className={`mt-1 text-lg font-semibold ${statusClass}`}>
          {info?.status_text ?? "…"}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {info
            ? running
              ? `PID ${info.pid} · servicio: ${info.service_state.toLowerCase()}`
              : `Socket: ${info.socket} · autostart: ${info.autostart.toLowerCase()}`
            : "Comprobando…"}
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            className="btn-primary text-xs"
            disabled={running}
            onClick={onStart}
          >
            Iniciar
          </button>
          <button
            type="button"
            className="btn-danger text-xs"
            disabled={!running}
            onClick={onStop}
          >
            Detener
          </button>
          <button type="button" className="btn-secondary text-xs" onClick={onRefresh}>
            Actualizar
          </button>
        </div>
      </div>
    </header>
  );
}
