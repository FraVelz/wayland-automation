import { useCallback, useEffect, useRef, useState } from "react";
import { onScriptFinished, onScriptOutput, runScript, stopScript } from "../lib/api";

export function useScriptRunner(onLine: (line: string) => void) {
  const [running, setRunning] = useState(false);
  const [longRunning, setLongRunning] = useState(false);
  const onLineRef = useRef(onLine);
  onLineRef.current = onLine;

  useEffect(() => {
    let cancelled = false;
    const unsubs: Array<() => void> = [];

    void (async () => {
      const unsubOutput = await onScriptOutput((line) => {
        onLineRef.current(line);
      });
      if (cancelled) {
        unsubOutput();
        return;
      }
      unsubs.push(unsubOutput);

      const unsubFinished = await onScriptFinished(({ code, status }) => {
        onLineRef.current(`■ Finalizado (${status})\n\n`);
        setRunning(false);
        setLongRunning(false);
        if (code !== 0) {
          onLineRef.current(`⚠ Código de salida: ${code}\n`);
        }
      });
      if (cancelled) {
        unsubFinished();
        return;
      }
      unsubs.push(unsubFinished);
    })();

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, []);

  const execute = useCallback(
    async (script: string, args: string[], label: string, long = false) => {
      if (running) {
        onLineRef.current("⚠ Ya hay un comando en ejecución.\n");
        return;
      }
      setRunning(true);
      setLongRunning(long);
      onLineRef.current(`— ${label} —\n`);
      try {
        await runScript(script, args);
      } catch (err) {
        onLineRef.current(`✗ Error: ${String(err)}\n`);
        setRunning(false);
        setLongRunning(false);
      }
    },
    [running],
  );

  const stop = useCallback(async () => {
    await stopScript();
    setRunning(false);
    setLongRunning(false);
  }, []);

  return { running, longRunning, execute, stop };
}
