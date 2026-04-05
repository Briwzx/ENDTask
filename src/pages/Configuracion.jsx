import { useState } from "react";
import { updateUserProfileSettings } from "../utils/storage";
import { useToast } from "../hooks/useToast";
import { translateSupabaseError } from "../utils/errors";

export function Configuracion({ user, onUpdateUser }) {
  const { showToast } = useToast();
  const [limiteDiario, setLimiteDiario] = useState(
    user?.settings?.limite_diario || 6
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = await updateUserProfileSettings({
        limite_diario: parseFloat(limiteDiario) || 6,
      });
      onUpdateUser(updatedUser);
      showToast("¡Configuración guardada correctamente!", "success");
    } catch (error) {
      const msg = translateSupabaseError(error);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-dark">Preferencias del Sistema</h2>
          <p className="text-sm text-muted">Ajusta los parámetros para optimizar tu flujo de trabajo</p>
        </div>

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
                  className="w-24 px-4 py-3 rounded-xl bg-white border border-border text-center text-sm font-bold text-dark shadow-sm focus:ring-4 focus:ring-primary-ghost focus:border-primary-light outline-none transition-all"
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
              className="btn-primary"
            >

              {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
