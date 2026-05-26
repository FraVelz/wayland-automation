import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeyCapture } from "../../contexts/HotkeyCaptureContext";
import { hotkeyFromKeyboardEvent, hotkeyPreviewFromKeyboardEvent } from "../../lib/hotkey";

interface HotkeyInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (hotkey: string) => void;
  disabled?: boolean;
  hint?: string;
  autoFocus?: boolean;
}

export function HotkeyInput({
  id,
  label,
  value,
  onChange,
  disabled = false,
  hint,
  autoFocus = true,
}: HotkeyInputProps) {
  const { setCapturing } = useHotkeyCapture();
  const [focused, setFocused] = useState(false);
  const [preview, setPreview] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setCapturing(focused && !disabled);
    return () => setCapturing(false);
  }, [focused, disabled, setCapturing]);

  useEffect(() => {
    if (disabled || !autoFocus) return;
    const t = window.setTimeout(() => boxRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [disabled, autoFocus]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled || document.activeElement !== boxRef.current) return;

      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Escape") {
        setPreview("");
        boxRef.current?.blur();
        return;
      }
      if (event.key === "Backspace" || event.key === "Delete") {
        onChangeRef.current("");
        setPreview("");
        return;
      }

      const live = hotkeyPreviewFromKeyboardEvent(event);
      setPreview(live);

      const combo = hotkeyFromKeyboardEvent(event);
      if (combo) {
        onChangeRef.current(combo);
      }
    },
    [disabled],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  const display = focused && preview ? preview : value;

  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={id}>
      <span className="text-gray-400">{label}</span>
      <div
        ref={boxRef}
        id={id}
        role="textbox"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        onFocus={() => {
          setFocused(true);
          setPreview("");
        }}
        onBlur={() => {
          setFocused(false);
          setPreview("");
        }}
        className={
          disabled
            ? "input cursor-not-allowed font-mono opacity-50 outline-none"
            : focused
              ? "input cursor-default font-mono outline-none ring-2 ring-accent ring-offset-2 ring-offset-surface"
              : "input cursor-pointer font-mono outline-none ring-1 ring-accent/50"
        }
      >
        {display ? (
          <span className="text-accent">{display}</span>
        ) : (
          <span className="text-gray-500">
            {focused ? "Pulsa las teclas…" : "Clic aquí para capturar atajo"}
          </span>
        )}
      </div>
      {focused && !disabled ? (
        <span className="text-xs text-amber-200/90">
          Escuchando: la combinación se actualiza en vivo. Esc sale, Supr borra.
        </span>
      ) : null}
      {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
    </label>
  );
}
