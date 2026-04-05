export const translateSupabaseError = (error) => {
  if (!error) return "Ocurri\xf3 un error inesperado.";
  
  const message = error.message || "";
  
  if (message.includes("Invalid login credentials") || message.includes("Invalid email or password")) {
    return "Correo o contrase\xf1a incorrectos. Por favor, verifica tus datos.";
  }
  
  if (message.includes("User already registered") || message.includes("Email already in use")) {
    return "Este correo ya est\xe1 registrado. Intenta con otro o inicia sesi\xf3n.";
  }
  
  if (message.includes("Password should be at least")) {
    return "La contrase\xf1a debe tener al menos 6 caracteres.";
  }

  if (message.includes("Network request failed")) {
    return "Error de conexi\xf3n. Por favor, verifica tu internet.";
  }

  return message || "Hubo un problema al procesar tu solicitud.";
};
