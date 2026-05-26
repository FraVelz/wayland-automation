import { useCallback, useEffect, useState } from "react";
import {
  createMacroId,
  defaultMacro,
  loadMacros,
  saveMacros,
  type Macro,
  type MacroStep,
} from "../lib/macros";

export function useMacros() {
  const [macros, setMacros] = useState<Macro[]>(() => loadMacros());

  useEffect(() => {
    saveMacros(macros);
  }, [macros]);

  const addMacro = useCallback(() => {
    setMacros((prev) => [...prev, defaultMacro(`Macro ${prev.length + 1}`)]);
  }, []);

  const removeMacro = useCallback((id: string) => {
    setMacros((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMacro = useCallback((id: string, patch: Partial<Macro>) => {
    setMacros((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const duplicateMacro = useCallback((id: string) => {
    setMacros((prev) => {
      const source = prev.find((m) => m.id === id);
      if (!source) return prev;
      const copy: Macro = {
        ...source,
        id: createMacroId(),
        name: `${source.name} (copia)`,
        hotkey: "",
      };
      return [...prev, copy];
    });
  }, []);

  const addStep = useCallback((macroId: string, step: MacroStep) => {
    setMacros((prev) =>
      prev.map((m) => (m.id === macroId ? { ...m, steps: [...m.steps, step] } : m)),
    );
  }, []);

  const updateStep = useCallback((macroId: string, index: number, step: MacroStep) => {
    setMacros((prev) =>
      prev.map((m) => {
        if (m.id !== macroId) return m;
        const steps = [...m.steps];
        steps[index] = step;
        return { ...m, steps };
      }),
    );
  }, []);

  const removeStep = useCallback((macroId: string, index: number) => {
    setMacros((prev) =>
      prev.map((m) =>
        m.id === macroId ? { ...m, steps: m.steps.filter((_, i) => i !== index) } : m,
      ),
    );
  }, []);

  const moveStep = useCallback((macroId: string, index: number, direction: -1 | 1) => {
    setMacros((prev) =>
      prev.map((m) => {
        if (m.id !== macroId) return m;
        const next = index + direction;
        if (next < 0 || next >= m.steps.length) return m;
        const steps = [...m.steps];
        [steps[index], steps[next]] = [steps[next], steps[index]];
        return { ...m, steps };
      }),
    );
  }, []);

  return {
    macros,
    addMacro,
    removeMacro,
    updateMacro,
    duplicateMacro,
    addStep,
    updateStep,
    removeStep,
    moveStep,
  };
}
