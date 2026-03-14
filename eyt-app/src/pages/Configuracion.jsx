import { useState } from "react";
import { updateUserProfileSettings } from "../utils/storage";

export function Configuracion({ user, onUpdateUser }) {
  const defaultSettings = { limite_diario: 6 };
  const currentSettings = user.settings || defaultSettings;
  
  const [limiteDiario, setLimiteDiario] = useState(currentSettings.limite_diario);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const newSettings = { ...currentSettings, limite_diario: Number(limiteDiario) };
      const updatedProfile = await updateUserProfileSettings(newSettings);
      onUpdateUser(updatedProfile);
      setMessage({ text: "¡Listo! Tu configuración ha sido guardada con éxito.", type: "success" });
    } catch (error) {
      console.error(error);
      setMessage({ text: "Hubo un problema al guardar tus ajustes. Por favor, asegúrate de tener conexión y de haber actualizado la base de datos.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-black text-gray-800 tracking-wide mb-6">CONFIGURACIÓN DE LA APP</h2>
        
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-semibold flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message.type === 'success' ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Límite de Horas */}
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  Límite de Horas Diarias de Trabajo
                </h3>
                <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                  Establece un límite de horas para evitar la sobrecarga al planificar tus tareas. 
                  Te avisaremos si el impacto total de tus áreas de trabajo supera esta cuota.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={limiteDiario}
                  onChange={(e) => setLimiteDiario(e.target.value)}
                  className="w-24 px-4 py-3 rounded-xl bg-white border border-gray-200 text-center text-sm font-bold text-gray-800 shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"
                  required
                />
                <span className="text-sm font-bold text-gray-400">horas</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold tracking-widest transition-all disabled:opacity-50 shadow-md hover:shadow-lg flex items-center gap-2"
              style={{ background: "#c8a84b", color: "#fff" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
