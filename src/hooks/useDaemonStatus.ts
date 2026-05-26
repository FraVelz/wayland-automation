import { useCallback, useEffect, useState } from "react";
import { getDaemonInfo } from "../lib/api";
import type { DaemonInfo } from "../lib/types";

const POLL_MS = 5000;

export function useDaemonStatus() {
  const [info, setInfo] = useState<DaemonInfo | null>(null);

  const refresh = useCallback(async () => {
    try {
      setInfo(await getDaemonInfo());
    } catch {
      setInfo(null);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { info, refresh };
}
