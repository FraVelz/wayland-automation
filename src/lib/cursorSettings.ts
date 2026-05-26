const STORAGE_KEY = "wa-cursor-settings";

export interface CursorSettings {
  stopHotkey: string;
}

const DEFAULTS: CursorSettings = {
  stopHotkey: "",
};

export function loadCursorSettings(): CursorSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<CursorSettings>;
    return {
      stopHotkey: typeof parsed.stopHotkey === "string" ? parsed.stopHotkey : "",
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveCursorSettings(settings: CursorSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
