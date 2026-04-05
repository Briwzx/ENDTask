import { useState, useEffect } from "react";
import { updateUserProfile } from "../utils/storage";
import { useToast } from "../hooks/useToast";
import { useModal } from "../hooks/useModal";
import { translateSupabaseError } from "../utils/errors";

export function Perfil({ user, onUpdateUser, tareasCount, cursosCount }) {
  const { showToast } = useToast();
  const { showModal } = useModal();
  const [formData, setFormData] = useState({
    nombre_completo: user?.nombre_completo || "",
    email: user?.email || ""
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre_completo: user.nombre_completo || "",
        email: user.email || ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nombre_completo: user.nombre_completo || "",
        email: user.email || ""
      });
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre_completo.trim() || !formData.email.trim()) {
      showModal({
        type: "warning",
        title: "Faltan datos",
        subtitle: "Por favor, completa los campos obligatorios."
      });
      return;
    }

    setLoading(true);

    try {
      const updatedProfile = await updateUserProfile(formData);
      onUpdateUser(updatedProfile);
      showToast("¡Perfil actualizado con éxito!", "success");
      setIsEditing(false);
    } catch (error) {
      const msg = translateSupabaseError(error);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto w-full">
      <div className="bg-surface rounded-card shadow-premium overflow-hidden border border-border">
        {/* Header Decorativo */}
        <div className="h-40 bg-dark relative flex items-end px-10 pb-8">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="var(--color-primary)" />
            </svg>
          </div>
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-surface uppercase">
              {formData.nombre_completo?.[0]}
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold tracking-tight">{formData.nombre_completo}</h1>
              <p className="text-primary-ghost text-sm">{formData.email}</p>
            </div>
          </div>
        </div>

        <div className="p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-bold text-dark">Información Personal</h2>
              <p className="text-sm text-muted">Mantén tus datos actualizados para una mejor experiencia</p>
            </div>
            
            <div className="flex gap-3">
              <div className="bg-primary-mist px-4 py-2 rounded-xl text-center border border-primary-ghost">
                <span className="block text-[10px] font-bold text-primary uppercase tracking-wider">Tareas</span>
                <span className="text-lg font-bold text-dark leading-none">{tareasCount}</span>
              </div>
              <div className="bg-primary-mist px-4 py-2 rounded-xl text-center border border-primary-ghost">
                <span className="block text-[10px] font-bold text-primary uppercase tracking-wider">Cursos</span>
                <span className="text-lg font-bold text-dark leading-none">{cursosCount}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-dark uppercase tracking-widest ml-1">Nombre Completo</label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  readOnly={!isEditing}
                  className={`w-full px-5 py-3.5 rounded-lg border transition-all text-sm outline-none ${
                    isEditing 
                      ? "bg-white border-primary-light ring-4 ring-primary-ghost text-dark shadow-sm" 
                      : "bg-bg border-transparent text-muted cursor-not-allowed"
                  }`}
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-dark uppercase tracking-widest ml-1">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  readOnly={!isEditing}
                  className={`w-full px-5 py-3.5 rounded-lg border transition-all text-sm outline-none ${
                    isEditing 
                      ? "bg-white border-primary-light ring-4 ring-primary-ghost text-dark shadow-sm" 
                      : "bg-bg border-transparent text-muted cursor-not-allowed"
                  }`}
                  required
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-border">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-bg hover:bg-gray-200 text-muted rounded-lg text-xs font-bold tracking-widest uppercase transition-all"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        GUARDANDO...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        GUARDAR CAMBIOS
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    EDITAR PERFIL
                  </span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
