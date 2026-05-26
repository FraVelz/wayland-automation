import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";
import { normalizeHotkey } from "../lib/hotkey";

export interface HotkeyBinding {
  id: string;
  hotkey: string;
  onPress: () => void;
}

interface UseGlobalHotkeysOptions {
  bindings: HotkeyBinding[];
  enabled: boolean;
  paused?: boolean;
  onError?: (message: string) => void;
  onStatus?: (message: string) => void;
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function useGlobalHotkeys({
  bindings,
  enabled,
  paused = false,
  onError,
  onStatus,
}: UseGlobalHotkeysOptions) {
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;

  const signature = bindings
    .map((b) => `${b.id}:${normalizeHotkey(b.hotkey) ?? ""}`)
    .join("|");

  useEffect(() => {
    if (!isTauriRuntime()) {
      onErrorRef.current?.(
        "Atajos globales solo funcionan en la app Tauri (pnpm tauri dev), no en el navegador.",
      );
      return;
    }

    let cancelled = false;
    const unsubs: Array<() => void> = [];

    void (async () => {
      try {
        const unsubPressed = await listen<{ id: string }>("hotkey-pressed", (event) => {
          const binding = bindingsRef.current.find((b) => b.id === event.payload.id);
          binding?.onPress();
        });
        if (cancelled) {
          unsubPressed();
          return;
        }
        unsubs.push(unsubPressed);

        const unsubStatus = await listen<{ message: string }>("hotkey-status", (event) => {
          onStatusRef.current?.(event.payload.message);
        });
        if (cancelled) {
          unsubStatus();
          return;
        }
        unsubs.push(unsubStatus);
      } catch (err) {
        onErrorRef.current?.(`No se pudo enlazar listener de atajos: ${String(err)}`);
      }
    })();

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, []);

  useEffect(() => {
    if (!isTauriRuntime()) return;

    const active = enabled && !paused;
    const payload = bindingsRef.current
      .filter((b) => normalizeHotkey(b.hotkey))
      .map((b) => ({
        id: b.id,
        hotkey: normalizeHotkey(b.hotkey)!,
      }));

    void (async () => {
      try {
        const count = await invoke<number>("set_hotkey_bindings", {
          bindings: active ? payload : [],
          enabled: active,
        });
        if (active && count > 0) {
          onStatusRef.current?.(`${count} atajo(s) activo(s) (evdev / Wayland)`);
        }
      } catch (err) {
        onErrorRef.current?.(`Atajos: ${String(err)}`);
      }
    })();
  }, [enabled, paused, signature]);
}
