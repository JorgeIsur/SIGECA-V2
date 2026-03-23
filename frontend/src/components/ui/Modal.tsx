interface ModalProps {
  titulo: string;
  onCerrar: () => void;
  children: React.ReactNode;
}

export default function Modal({ titulo, onCerrar, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCerrar}
      />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">{titulo}</h3>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}