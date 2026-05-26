import type { CursorColor } from "../lib/types";

interface CursorColorPanelProps {
  color: CursorColor | null | undefined;
  error: string | null | undefined;
  loading: boolean;
}

const FORMATS: Array<{ key: keyof Pick<CursorColor, "hex" | "rgb" | "css_rgb" | "hsl">; label: string }> =
  [
    { key: "hex", label: "HEX" },
    { key: "rgb", label: "RGB" },
    { key: "css_rgb", label: "CSS" },
    { key: "hsl", label: "HSL" },
  ];

export function CursorColorPanel({ color, error, loading }: CursorColorPanelProps) {
  return (
    <div className="mt-4 border-t border-surface-border pt-4">
      <h3 className="text-sm font-medium text-gray-300">Color del píxel</h3>
      <p className="mt-1 text-xs text-gray-500">
        Captura 1×1 px bajo el cursor con grim + ImageMagick.
      </p>

      {error ? (
        <p className="mt-3 text-sm text-amber-400" role="status">
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className="h-20 w-full shrink-0 rounded-xl border border-surface-border sm:w-20"
          style={{ backgroundColor: color?.hex ?? "transparent" }}
          aria-label={color ? `Muestra ${color.hex}` : "Sin muestra de color"}
          title={color?.hex ?? "Sin color"}
        />

        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
          {FORMATS.map(({ key, label }) => (
            <div key={key} className="rounded-lg border border-surface-border bg-surface px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
              </span>
              <p className="mt-1 font-mono text-sm text-gray-100">
                {loading && !color ? "…" : color?.[key] ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
