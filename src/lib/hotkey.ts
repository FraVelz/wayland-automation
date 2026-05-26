/** Teclas que no cuentan como atajo principal (solo modificadores). */
const MODIFIER_KEYS = new Set([
  "Control",
  "Shift",
  "Alt",
  "Meta",
  "OS",
  "AltGraph",
]);

const SPECIAL_KEY_LABELS: Record<string, string> = {
  " ": "Space",
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  Enter: "Enter",
  Escape: "Escape",
  Tab: "Tab",
  Backspace: "Backspace",
  Delete: "Delete",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
  Insert: "Insert",
  CapsLock: "CapsLock",
  NumLock: "NumLock",
  ScrollLock: "ScrollLock",
  Pause: "Pause",
  PrintScreen: "PrintScreen",
};

function formatMainKey(event: KeyboardEvent): string | null {
  const { key } = event;
  if (!key || MODIFIER_KEYS.has(key)) return null;

  if (SPECIAL_KEY_LABELS[key]) return SPECIAL_KEY_LABELS[key];
  if (/^F\d{1,2}$/i.test(key)) return key.toUpperCase();
  if (key.length === 1) return key.toUpperCase();
  if (key.startsWith("Digit")) return key.slice(5);
  if (key.startsWith("Numpad")) return key;
  if (key.startsWith("Key")) return key.slice(3);

  return key;
}

function modifierParts(event: KeyboardEvent): string[] {
  const parts: string[] = [];
  if (event.ctrlKey) parts.push("Ctrl");
  if (event.altKey) parts.push("Alt");
  if (event.shiftKey) parts.push("Shift");
  if (event.metaKey) parts.push("Super");
  return parts;
}

/** Vista previa en vivo (incluye solo modificadores). */
export function hotkeyPreviewFromKeyboardEvent(event: KeyboardEvent): string {
  const main = formatMainKey(event);
  const parts = modifierParts(event);
  if (main) {
    parts.push(main);
    return parts.join("+");
  }
  return parts.length > 0 ? `${parts.join("+")}+…` : "";
}

/** Convierte keydown a atajo completo (requiere tecla principal). */
export function hotkeyFromKeyboardEvent(event: KeyboardEvent): string | null {
  if (event.key === "Escape") return null;

  const main = formatMainKey(event);
  if (!main) return null;

  const parts = modifierParts(event);
  parts.push(main);
  return parts.join("+");
}

export function normalizeHotkey(raw: string): string | null {
  const trimmed = raw.trim().replace(/\+…$/u, "");
  return trimmed || null;
}

/** Clave canónica para comparar (plugin devuelve control+, nosotros Ctrl+). */
export function canonicalHotkeyKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .split("+")
    .map((part) => {
      const p = part.trim();
      if (p === "ctrl" || p === "control") return "control";
      if (p === "cmd" || p === "command") return "super";
      if (p === "option") return "alt";
      if (p === "cmdorctrl" || p === "commandorcontrol") return "control";
      return p;
    })
    .filter(Boolean)
    .join("+");
}
