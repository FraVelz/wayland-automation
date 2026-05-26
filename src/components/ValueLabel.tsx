interface ValueLabelProps {
  id: string;
  title: string;
  value: string;
  mono?: boolean;
}

export function ValueLabel({ id, title, value, mono = true }: ValueLabelProps) {
  return (
    <label htmlFor={id} className="card flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {title}
      </span>
      <span
        id={id}
        className={`text-3xl font-semibold text-gray-100 ${mono ? "font-mono tabular-nums" : ""}`}
        aria-live="polite"
      >
        {value}
      </span>
    </label>
  );
}
