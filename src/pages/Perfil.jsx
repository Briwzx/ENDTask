import { useState, useEffect } from "react";
import { updateUserProfile } from "../utils/storage";
import { AlertModal } from "../components/AlertModal";

export function Perfil({ user, onUpdateUser, tareasCount, cursosCount }) {
  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    apellido: user?.apellido || "",
    email: user?.email || "",
    telefono: user?.telefono || "",
    anio: user?.anio || ""
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "" });

  // Sincronizar con cambios en el prop user (por si acaso)
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        email: user.email || "",
        telefono: user.telefono || "",
        anio: user.anio || ""
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
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        email: user.email || "",
        telefono: user.telefono || "",
        anio: user.anio || ""
      });
    }
    setIsEditing(false);
    setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim()) {
      setAlert({
        isOpen: true,
        title: "Faltan datos",
        message: "Por favor, completa los campos obligatorios (Nombre, Apellido y Correo)."
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const updatedProfile = await updateUserProfile(formData);
      onUpdateUser(updatedProfile);
      setMessage({ text: "¡Perfil actualizado con éxito!", type: "success" });
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      setMessage({ text: "Error al actualizar el perfil. Intenta de nuevo.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto w-full">
      <AlertModal
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        onConfirm={() => setAlert({ ...alert, isOpen: false })}
      />
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-amber-50">
        {/* Header Decorativo */}
        <div className="h-32 bg-gradient-to-r from-amber-400 to-amber-200 relative">
          <div className="absolute -bottom-12 left-10">
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg border-4 border-white"
              style={{ background: "#fdfaf3", color: "#c8a84b" }}
            >
              {formData.nombre?.[0]}{formData.apellido?.[0]}
            </div>
          </div>
        </div>

        <div className="pt-16 pb-10 px-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Tu Perfil Estudiantil</h2>
              <p className="text-sm text-gray-400 font-medium">Gestiona tu información personal y académica</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">Tareas</p>
                <p className="text-lg font-black text-gray-800 leading-none">{tareasCount}</p>
              </div>
              <div className="text-center px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">Cursos</p>
                <p className="text-lg font-black text-gray-800 leading-none">{cursosCount}</p>
              </div>
            </div>
          </div>

          {message.text && (
            <div className={`p-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.type === 'success' ? (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                readOnly={!isEditing}
                className={`w-full px-5 py-4 rounded-2xl border transition-all text-sm font-bold shadow-inner outline-none ${
                  isEditing 
                    ? "bg-white border-amber-400 ring-4 ring-amber-50 text-gray-700" 
                    : "bg-gray-50 border-transparent text-gray-500 cursor-not-allowed"
                }`}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Tu apellido"
                readOnly={!isEditing}
                className={`w-full px-5 py-4 rounded-2xl border transition-all text-sm font-bold shadow-inner outline-none ${
                  isEditing 
                    ? "bg-white border-amber-400 ring-4 ring-amber-50 text-gray-700" 
                    : "bg-gray-50 border-transparent text-gray-500 cursor-not-allowed"
                }`}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                readOnly={!isEditing}
                className={`w-full px-5 py-4 rounded-2xl border transition-all text-sm font-bold shadow-inner outline-none ${
                  isEditing 
                    ? "bg-white border-amber-400 ring-4 ring-amber-50 text-gray-700" 
                    : "bg-gray-50 border-transparent text-gray-500 cursor-not-allowed"
                }`}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Número de Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+57 300..."
                readOnly={!isEditing}
                className={`w-full px-5 py-4 rounded-2xl border transition-all text-sm font-bold shadow-inner outline-none ${
                  isEditing 
                    ? "bg-white border-amber-400 ring-4 ring-amber-50 text-gray-700" 
                    : "bg-gray-50 border-transparent text-gray-500 cursor-not-allowed"
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Año de Nacimiento</label>
              <input
                type="text"
                name="anio"
                value={formData.anio}
                onChange={handleChange}
                placeholder="YYYY"
                readOnly={!isEditing}
                className={`w-full px-5 py-4 rounded-2xl border transition-all text-sm font-bold shadow-inner outline-none ${
                  isEditing 
                    ? "bg-white border-amber-400 ring-4 ring-amber-50 text-gray-700" 
                    : "bg-gray-50 border-transparent text-gray-500 cursor-not-allowed"
                }`}
              />
            </div>

            <div className="md:col-span-2 pt-6 flex justify-end gap-4">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-black tracking-[0.2em] uppercase transition-all flex items-center gap-3 transform hover:-translate-y-1 active:translate-y-0"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-4 text-white rounded-2xl text-xs font-black tracking-[0.2em] uppercase transition-all disabled:opacity-50 shadow-xl hover:shadow-2xl flex items-center gap-3 transform hover:-translate-y-1 active:translate-y-0"
                    style={{ background: "#c8a84b" }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        GUARDANDO...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        GUARDAR CAMBIOS
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-10 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl text-xs font-black tracking-[0.2em] uppercase transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 transform hover:-translate-y-1 active:translate-y-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  EDITAR PERFIL
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
