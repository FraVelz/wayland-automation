import { useCallback, useEffect, useRef, useState } from "react";

interface LogPanelProps {
  lines: string[];
  onClear: () => void;
}

async function copyText(text: string): Promise<boolean> {
  if (!text.trim()) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  }
}

export function LogPanel({ lines, onClear }: LogPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const text = lines.join("");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const handleCopy = useCallback(async () => {
    const ok = await copyText(text);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Salida</span>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary text-xs"
            disabled={!text.trim()}
            onClick={() => void handleCopy()}
          >
            {copied ? "Copiado" : "Copiar log"}
          </button>
          <button type="button" className="btn-secondary text-xs" onClick={onClear}>
            Limpiar log
          </button>
        </div>
      </div>
      <pre className="card max-h-48 min-h-32 overflow-y-auto font-mono text-xs leading-relaxed text-gray-300">
        {text || "—"}
        <div ref={endRef} />
      </pre>
    </div>
  );
}
