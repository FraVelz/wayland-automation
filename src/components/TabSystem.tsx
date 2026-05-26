interface TabSystemProps {
  disabled: boolean;
  onSetup: () => void;
}

export function TabSystem({ disabled, onSetup }: TabSystemProps) {
  return (
    <div className="card max-w-lg">
      <h2 className="font-semibold">Instalación del sistema</h2>
      <p className="mt-2 text-sm text-gray-400">
        Ejecuta scripts/setup.sh: instala paquetes de Arch, compila wl-find-cursor y configura
        permisos. Puede pedir contraseña sudo.
      </p>
      <button
        type="button"
        className="btn-primary mt-4"
        disabled={disabled}
        onClick={() => {
          if (confirm("Se ejecutará scripts/setup.sh y puede pedir sudo.\n¿Continuar?")) {
            onSetup();
          }
        }}
      >
        Ejecutar scripts/setup.sh
      </button>
    </div>
  );
}
