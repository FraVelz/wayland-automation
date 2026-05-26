import { useCallback, useEffect, useState } from "react";
import { getCursorPosition } from "../lib/api";
import type { CursorPosition } from "../lib/types";

const DEFAULT_INTERVAL_MS = 150;

export function useCursorPosition() {
  const [position, setPosition] = useState<CursorPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [watching, setWatching] = useState(false);
  const [intervalMs, setIntervalMs] = useState(DEFAULT_INTERVAL_MS);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPosition(await getCursorPosition());
    } catch (err) {
      setError(String(err));
      setPosition(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!watching) return;
    void refresh();
    const id = window.setInterval(() => void refresh(), intervalMs);
    return () => window.clearInterval(id);
  }, [watching, intervalMs, refresh]);

  const toggleWatch = useCallback(() => {
    setWatching((w) => !w);
  }, []);

  return {
    position,
    error,
    loading,
    watching,
    intervalMs,
    setIntervalMs,
    refresh,
    toggleWatch,
  };
}
