interface TabCursorProps {
  onOnce: () => void;
  onWatch: () => void;
  disabled: boolean;
}

/** Solo coordenadas; sin lectura de color del píxel (-c). */
export function TabCursor({ onOnce, onWatch, disabled }: TabCursorProps) {
  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="font-semibold">Coordenadas del cursor</h2>
        <p className="mt-1 text-sm text-gray-400">
          Lee la posición del ratón vía wl-find-cursor. Los modos en tiempo real se detienen con
          «Detener».
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="btn-primary min-h-12"
            disabled={disabled}
            onClick={onOnce}
          >
            Coordenadas (una lectura)
          </button>
          <button
            type="button"
            className="btn-secondary min-h-12"
            disabled={disabled}
            onClick={onWatch}
          >
            Tiempo real
          </button>
        </div>
      </div>
    </div>
  );
}
