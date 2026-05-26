export type TabId = "cursor" | "mouse" | "daemon" | "system";

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

export interface CursorPosition {
  x: number;
  y: number;
}
