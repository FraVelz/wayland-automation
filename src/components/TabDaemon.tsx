import type { DaemonInfo } from "../lib/types";

const ACTIONS: Array<{ id: string; label: string; desc: string }> = [
  { id: "status", label: "Estado", desc: "Comprueba si el daemon está activo" },
  { id: "check", label: "Diagnóstico", desc: "Verifica dependencias y permisos" },
  { id: "start", label: "Iniciar", desc: "Arranca ydotoold" },
  { id: "stop", label: "Detener", desc: "Para el daemon" },
  { id: "restart", label: "Reiniciar", desc: "Reinicia el servicio" },
  { id: "enable", label: "Autostart ON", desc: "Arranque al iniciar sesión" },
  { id: "disable", label: "Autostart OFF", desc: "Desactiva arranque automático" },
  { id: "logs", label: "Logs", desc: "Muestra logs recientes" },
  { id: "install", label: "Instalar unidad", desc: "Copia la unidad systemd al usuario" },
];

interface TabDaemonProps {
  info: DaemonInfo | null;
  disabled: boolean;
  onAction: (action: string, label: string) => void;
}

export function TabDaemon({ info, disabled, onAction }: TabDaemonProps) {
  return (
    <div className="space-y-4">
      <div className="card text-sm text-gray-400">
        <p>
          <span className="text-gray-300">Socket:</span> {info?.socket ?? "—"}
        </p>
        <p className="mt-1">
          <span className="text-gray-300">Grupo input:</span>{" "}
          {info?.input_group ? "sí" : "no"}
        </p>
        <p className="mt-1">
          <span className="text-gray-300">/dev/uinput:</span> {info?.uinput ?? "—"}
        </p>
        <p className="mt-1">
          <span className="text-gray-300">Autostart:</span> {info?.autostart ?? "—"}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ACTIONS.map(({ id, label, desc }) => (
          <button
            key={id}
            type="button"
            title={desc}
            className="btn-secondary min-h-14 text-left"
            disabled={disabled}
            onClick={() => onAction(id, label)}
          >
            <span className="block font-medium">{label}</span>
            <span className="mt-0.5 block text-xs text-gray-500">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
