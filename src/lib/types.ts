export type TabId = "cursor" | "mouse" | "macros" | "daemon" | "system";

export interface DaemonInfo {
  running: boolean;
  socket: string;
  pid: string;
  input_group: boolean;
  autostart: string;
  service_state: string;
  uinput: string;
  status_text: string;
  ready_for_mouse: boolean;
}

export interface ScriptOutputEvent {
  line: string;
}

export interface ScriptFinishedEvent {
  code: number;
  status: string;
}

export interface CursorColor {
  hex: string;
  rgb: string;
  css_rgb: string;
  hsl: string;
  r: number;
  g: number;
  b: number;
}

export interface CursorPosition {
  x: number;
  y: number;
  color: CursorColor | null;
  color_error: string | null;
}
