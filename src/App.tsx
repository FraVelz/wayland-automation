import { useCallback, useMemo, useRef, useState } from "react";
import { HotkeyCaptureProvider, useHotkeyCapture } from "./contexts/HotkeyCaptureContext";
import { Header } from "./components/Header";
import { LogPanel } from "./components/LogPanel";
import { TabCursor } from "./components/TabCursor";
import { TabDaemon } from "./components/TabDaemon";
import { TabMouse } from "./components/TabMouse";
import { TabMacros } from "./components/TabMacros";
import { TabSystem } from "./components/TabSystem";
import { useCursorPosition } from "./hooks/useCursorPosition";
import { useDaemonStatus } from "./hooks/useDaemonStatus";
import { useGlobalHotkeys } from "./hooks/useGlobalHotkeys";
import { useMacros } from "./hooks/useMacros";
import { useScriptRunner } from "./hooks/useScriptRunner";
import { runMacro } from "./lib/api";
import { loadCursorSettings, saveCursorSettings } from "./lib/cursorSettings";
import { normalizeHotkey } from "./lib/hotkey";
import { loadHotkeysEnabled, saveHotkeysEnabled } from "./lib/macros";
import type { TabId } from "./lib/types";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "cursor", label: "Cursor" },
  { id: "mouse", label: "Ratón" },
  { id: "macros", label: "Macros" },
  { id: "daemon", label: "Daemon" },
  { id: "system", label: "Sistema" },
];

function AppInner() {
  const { isCapturing } = useHotkeyCapture();
  const [tab, setTab] = useState<TabId>("cursor");
  const [log, setLog] = useState<string[]>([]);
  const append = useCallback((line: string) => {
    setLog((prev) => [...prev, line]);
  }, []);

  const [cursorSettings, setCursorSettings] = useState(loadCursorSettings);
  const [hotkeysEnabled, setHotkeysEnabled] = useState(loadHotkeysEnabled);

  const cursor = useCursorPosition();
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;
  const macrosState = useMacros();
  const { info, refresh } = useDaemonStatus();
  const { running, longRunning, execute, stop } = useScriptRunner(append);

  const setStopHotkey = useCallback((stopHotkey: string) => {
    setCursorSettings((prev) => {
      const next = { ...prev, stopHotkey };
      saveCursorSettings(next);
      return next;
    });
  }, []);

  const setHotkeysEnabledPersisted = useCallback((enabled: boolean) => {
    setHotkeysEnabled(enabled);
    saveHotkeysEnabled(enabled);
  }, []);

  const hotkeyBindings = useMemo(() => {
    const list = [];
    const stopHk = normalizeHotkey(cursorSettings.stopHotkey);
    if (stopHk) {
      list.push({
        id: "cursor-stop",
        hotkey: stopHk,
        onPress: () => {
          if (cursorRef.current.watching) {
            cursorRef.current.stopWatch();
            append("⌨ Tiempo real detenido (atajo)\n");
          }
        },
      });
    }
    for (const macro of macrosState.macros) {
      if (!macro.enabled || macro.steps.length === 0) continue;
      const hk = normalizeHotkey(macro.hotkey);
      if (!hk) continue;
      list.push({
        id: `macro-${macro.id}`,
        hotkey: hk,
        onPress: () => {
          if (!info?.ready_for_mouse) {
            append("⚠ ydotoold no está listo. Inicia el daemon antes de usar atajos.\n");
            return;
          }
          void runMacro(macro.steps)
            .then(() => append(`⌨ Macro "${macro.name}" (atajo)\n`))
            .catch((err) => append(`⚠ ${String(err)}\n`));
        },
      });
    }
    return list;
  }, [cursorSettings.stopHotkey, macrosState.macros, info?.ready_for_mouse, append]);

  useGlobalHotkeys({
    bindings: hotkeyBindings,
    enabled: hotkeysEnabled,
    paused: isCapturing,
    onError: (msg) => append(`⚠ ${msg}\n`),
    onStatus: (msg) => append(`⌨ ${msg}\n`),
  });

  const run = useCallback(
    (script: string, args: string[], label: string, long = false) => {
      void execute(script, args, label, long);
    },
    [execute],
  );

  const requireMouse = useCallback(
    (fn: () => void) => {
      if (info?.ready_for_mouse) {
        fn();
        return;
      }
      const msg = !info?.running
        ? "ydotoold no está activo."
        : !info?.input_group
          ? "No perteneces al grupo input."
          : `/dev/uinput: ${info?.uinput}`;
      if (confirm(`${msg}\n\n¿Intentar iniciar ydotoold ahora?`)) {
        run("ydotoold.sh", ["start"], "Iniciar daemon");
      }
    },
    [info, run],
  );

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <Header
        info={info}
        onRefresh={() => void refresh()}
        onStart={() => run("ydotoold.sh", ["start"], "Iniciar daemon")}
        onStop={() => run("ydotoold.sh", ["stop"], "Detener daemon")}
      />

      <nav className="flex gap-1 border-b border-surface-border">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={tab === id ? "tab-active" : "tab"}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="min-h-0 flex-1 overflow-y-auto">
        {tab === "cursor" && (
          <TabCursor
            position={cursor.position}
            error={cursor.error}
            loading={cursor.loading}
            watching={cursor.watching}
            intervalMs={cursor.intervalMs}
            setIntervalMs={cursor.setIntervalMs}
            refresh={cursor.refresh}
            toggleWatch={cursor.toggleWatch}
            stopHotkey={cursorSettings.stopHotkey}
            onStopHotkeyChange={setStopHotkey}
          />
        )}
        {tab === "macros" && (
          <TabMacros
            info={info}
            disabled={running}
            hotkeysEnabled={hotkeysEnabled}
            onHotkeysEnabledChange={setHotkeysEnabledPersisted}
            onLog={append}
            {...macrosState}
          />
        )}
        {tab === "mouse" && (
          <TabMouse
            info={info}
            disabled={running}
            onDefault={() => requireMouse(() => run("mover_raton.sh", [], "Mover 100 px →"))}
            onRelative={(dx, dy) =>
              requireMouse(() =>
                run("mover_raton.sh", ["--dx", dx, "--dy", dy], `Mover relativo (${dx}, ${dy})`),
              )
            }
            onAbsolute={(x, y) =>
              requireMouse(() =>
                run("mover_raton.sh", ["--x", x, "--y", y], `Mover a (${x}, ${y})`),
              )
            }
          />
        )}
        {tab === "daemon" && (
          <TabDaemon
            info={info}
            disabled={running}
            onAction={(action, label) => run("ydotoold.sh", [action], label)}
          />
        )}
        {tab === "system" && (
          <TabSystem
            disabled={running}
            onSetup={() => run("setup.sh", [], "Instalar / configurar sistema")}
          />
        )}
      </main>

      {tab !== "cursor" ? <LogPanel lines={log} onClear={() => setLog([])} /> : null}

      <footer className="flex justify-end">
        <button
          type="button"
          className="btn-danger"
          disabled={!longRunning}
          onClick={() => void stop()}
        >
          Detener
        </button>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <HotkeyCaptureProvider>
      <AppInner />
    </HotkeyCaptureProvider>
  );
}
