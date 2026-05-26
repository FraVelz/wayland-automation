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
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setCapturing(focused && !disabled);
    return () => setCapturing(false);
  }, [focused, disabled, setCapturing]);

  useEffect(() => {
    if (disabled || !autoFocus) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [disabled, autoFocus, id]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();

      const native = event.nativeEvent;

      if (native.key === "Escape") {
        setPreview("");
        return;
      }
      if (native.key === "Backspace" || native.key === "Delete") {
        onChangeRef.current("");
        setPreview("");
        return;
      }

      const live = hotkeyPreviewFromKeyboardEvent(native);
      setPreview(live);

      const combo = hotkeyFromKeyboardEvent(native);
      if (combo) {
        onChangeRef.current(combo);
      }
    },
    [disabled],
  );

  const display = preview || value;

  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={id}>
      <span className="text-gray-400">{label}</span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        readOnly
        tabIndex={disabled ? -1 : 0}
        className={
          disabled
            ? "input cursor-not-allowed font-mono opacity-50"
            : focused
              ? "input cursor-default font-mono ring-2 ring-accent ring-offset-2 ring-offset-surface"
              : "input cursor-pointer font-mono ring-1 ring-accent/60"
        }
        value={display}
        placeholder={focused ? "Pulsa las teclas…" : "Clic aquí y pulsa el atajo"}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setFocused(true);
          setPreview("");
        }}
        onBlur={() => {
          setFocused(false);
          setPreview("");
        }}
      />
      {focused && !disabled ? (
        <span className="text-xs text-amber-200/90">
          Capturando: cada pulsación actualiza el atajo. Esc limpia vista, Supr borra.
        </span>
      ) : null}
      {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
    </label>
  );
}
