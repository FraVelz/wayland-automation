import { useCallback, useState } from "react";
import { Header } from "./components/Header";
import { LogPanel } from "./components/LogPanel";
import { TabCursor } from "./components/TabCursor";
import { TabDaemon } from "./components/TabDaemon";
import { TabMouse } from "./components/TabMouse";
import { TabMacros } from "./components/TabMacros";
import { TabSystem } from "./components/TabSystem";
import { useDaemonStatus } from "./hooks/useDaemonStatus";
import { useScriptRunner } from "./hooks/useScriptRunner";
import type { TabId } from "./lib/types";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "cursor", label: "Cursor" },
  { id: "mouse", label: "Ratón" },
  { id: "macros", label: "Macros" },
  { id: "daemon", label: "Daemon" },
  { id: "system", label: "Sistema" },
];

export default function App() {
  const [tab, setTab] = useState<TabId>("cursor");
  const [log, setLog] = useState<string[]>([]);
  const append = useCallback((line: string) => {
    setLog((prev) => [...prev, line]);
  }, []);
  const { info, refresh } = useDaemonStatus();
  const { running, longRunning, execute, stop } = useScriptRunner(append);

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
        {tab === "cursor" && <TabCursor />}
        {tab === "macros" && (
          <TabMacros
            info={info}
            disabled={running}
            onLog={append}
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
