export const translateSupabaseError = (error) => {
  if (!error) return "Ocurrió un error inesperado.";
  
  const message = error.message || "";
  
  if (message.includes("Invalid login credentials") || message.includes("Invalid email or password")) {
    return "Correo o contraseña incorrectos. Por favor, verifica tus datos.";
  }
  
  if (message.includes("User already registered") || message.includes("Email already in use")) {
    return "Este correo ya está registrado. Intenta con otro o inicia sesión.";
  }
  
  if (message.includes("Password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }

  if (message.includes("Network request failed")) {
    return "Error de conexión. Por favor, verifica tu internet.";
  }

  return message || "Hubo un problema al procesar tu solicitud.";
};

