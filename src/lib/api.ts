import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { CursorPosition, DaemonInfo, ScriptFinishedEvent, ScriptOutputEvent } from "./types";

export async function getCursorPosition(): Promise<CursorPosition> {
  return invoke<CursorPosition>("get_cursor_position");
}

export async function getDaemonInfo(): Promise<DaemonInfo> {
  return invoke<DaemonInfo>("get_daemon_info");
}

export async function runScript(script: string, args: string[] = []): Promise<void> {
  return invoke("run_script", { script, args });
}

export async function stopScript(): Promise<void> {
  return invoke("stop_script");
}

export function onScriptOutput(handler: (line: string) => void): Promise<() => void> {
  return listen<ScriptOutputEvent>("script-output", (event) => {
    handler(event.payload.line);
  });
}

export function onScriptFinished(handler: (payload: ScriptFinishedEvent) => void): Promise<() => void> {
  return listen<ScriptFinishedEvent>("script-finished", (event) => {
    handler(event.payload);
  });
}
