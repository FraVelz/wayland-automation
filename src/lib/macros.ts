export type ClickButton = "left" | "right" | "middle";

export type MacroStep =
  | { type: "delay"; ms: number }
  | { type: "move_absolute"; x: number; y: number }
  | { type: "move_relative"; dx: number; dy: number }
  | { type: "click"; button: ClickButton };

export interface Macro {
  id: string;
  name: string;
  steps: MacroStep[];
  /** Atajo global, p. ej. "F9" o "Ctrl+Shift+M". Vacío = sin atajo. */
  hotkey: string;
  enabled: boolean;
}

const STORAGE_KEY = "wa-macros";

export function createMacroId(): string {
  return crypto.randomUUID();
}

export function defaultMacro(name = "Nueva macro"): Macro {
  return {
    id: createMacroId(),
    name,
    steps: [{ type: "delay", ms: 300 }],
    hotkey: "",
    enabled: true,
  };
}

export function loadMacros(): Macro[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMacro);
  } catch {
    return [];
  }
}

export function saveMacros(macros: Macro[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(macros));
}

function isMacro(value: unknown): value is Macro {
  if (!value || typeof value !== "object") return false;
  const m = value as Macro;
  return (
    typeof m.id === "string" &&
    typeof m.name === "string" &&
    Array.isArray(m.steps) &&
    typeof m.hotkey === "string" &&
    typeof m.enabled === "boolean"
  );
}

export function stepLabel(step: MacroStep): string {
  switch (step.type) {
    case "delay":
      return `Esperar ${step.ms} ms`;
    case "move_absolute":
      return `Mover a (${step.x}, ${step.y})`;
    case "move_relative":
      return `Mover Δ(${step.dx}, ${step.dy})`;
    case "click":
      return `Clic ${step.button === "left" ? "izquierdo" : step.button === "right" ? "derecho" : "central"}`;
  }
}

export const CLICK_BUTTONS: Array<{ id: ClickButton; label: string }> = [
  { id: "left", label: "Izquierdo" },
  { id: "right", label: "Derecho" },
  { id: "middle", label: "Central" },
];
