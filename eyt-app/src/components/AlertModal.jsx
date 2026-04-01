export function AlertModal({ isOpen, title, message, onConfirm, buttonText = "Aceptar" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900 bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full border border-gray-100 relative text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm border border-amber-100">
          ⚠️
        </div>
        <h2 className="text-xl font-black text-gray-800 tracking-tight mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className="w-full py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all active:scale-95"
            style={{ background: "#c8a84b" }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
