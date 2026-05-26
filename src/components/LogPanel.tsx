import { useEffect, useRef } from "react";

interface LogPanelProps {
  lines: string[];
  onClear: () => void;
}

export function LogPanel({ lines, onClear }: LogPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Salida</span>
        <button type="button" className="btn-secondary text-xs" onClick={onClear}>
          Limpiar log
        </button>
      </div>
      <pre className="card max-h-48 min-h-32 overflow-y-auto font-mono text-xs leading-relaxed text-gray-300">
        {lines.join("") || "—"}
        <div ref={endRef} />
      </pre>
    </div>
  );
}
