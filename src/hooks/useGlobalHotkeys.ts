import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { useEffect, useRef } from "react";
import { canonicalHotkeyKey, normalizeHotkey } from "../lib/hotkey";

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
  onRegistered?: (count: number) => void;
}

export function useGlobalHotkeys({
  bindings,
  enabled,
  paused = false,
  onError,
  onRegistered,
}: UseGlobalHotkeysOptions) {
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onRegisteredRef = useRef(onRegistered);
  onRegisteredRef.current = onRegistered;

  const signature = bindings
    .map((b) => `${b.id}:${normalizeHotkey(b.hotkey) ?? ""}`)
    .join("|");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await unregisterAll();
      } catch {
        /* primera carga */
      }
      if (cancelled || !enabled || paused) return;

      const used = new Set<string>();
      const shortcuts: string[] = [];

      for (const binding of bindingsRef.current) {
        const hotkey = normalizeHotkey(binding.hotkey);
        if (!hotkey) continue;
        const key = canonicalHotkeyKey(hotkey);
        if (used.has(key)) {
          onErrorRef.current?.(
            `Atajo duplicado "${hotkey}" (${binding.id}). Solo se registra el primero.`,
          );
          continue;
        }
        used.add(key);
        shortcuts.push(hotkey);
      }

      if (shortcuts.length === 0) return;

      try {
        await register(shortcuts, (event) => {
          if (event.state !== "Pressed") return;
          const pressedKey = canonicalHotkeyKey(event.shortcut);
          const binding = bindingsRef.current.find(
            (b) => canonicalHotkeyKey(normalizeHotkey(b.hotkey) ?? "") === pressedKey,
          );
          binding?.onPress();
        });
        if (!cancelled) {
          onRegisteredRef.current?.(shortcuts.length);
        }
      } catch (err) {
        onErrorRef.current?.(`No se pudieron registrar atajos: ${String(err)}`);
      }
    })();

    return () => {
      cancelled = true;
      void unregisterAll().catch(() => undefined);
    };
  }, [enabled, paused, signature]);
}
