import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { useEffect, useRef } from "react";
import { runMacro } from "../lib/api";
import type { Macro } from "../lib/macros";

interface UseMacroHotkeysOptions {
  macros: Macro[];
  enabled: boolean;
  readyForMouse: boolean;
  onTrigger: (macroName: string) => void;
  onError: (message: string) => void;
}

function normalizeHotkey(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed;
}

export function useMacroHotkeys({
  macros,
  enabled,
  readyForMouse,
  onTrigger,
  onError,
}: UseMacroHotkeysOptions) {
  const callbacksRef = useRef({ onTrigger, onError });
  callbacksRef.current = { onTrigger, onError };

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await unregisterAll();
      } catch {
        /* primera carga */
      }
      if (cancelled || !enabled) return;

      const used = new Set<string>();
      for (const macro of macros) {
        if (!macro.enabled || macro.steps.length === 0) continue;
        const hotkey = normalizeHotkey(macro.hotkey);
        if (!hotkey) continue;
        const key = hotkey.toLowerCase();
        if (used.has(key)) {
          callbacksRef.current.onError(
            `Atajo duplicado "${hotkey}" en "${macro.name}". Solo se registra el primero.`,
          );
          continue;
        }
        used.add(key);

        try {
          await register(hotkey, (event) => {
            if (event.state !== "Pressed") return;
            if (!readyForMouse) {
              callbacksRef.current.onError(
                "ydotoold no está listo. Inicia el daemon antes de usar atajos.",
              );
              return;
            }
            void runMacro(macro.steps)
              .then(() => callbacksRef.current.onTrigger(macro.name))
              .catch((err) => callbacksRef.current.onError(String(err)));
          });
        } catch (err) {
          callbacksRef.current.onError(`No se pudo registrar "${hotkey}": ${String(err)}`);
        }
      }
    })();

    return () => {
      cancelled = true;
      void unregisterAll().catch(() => undefined);
    };
  }, [macros, enabled, readyForMouse]);
}
