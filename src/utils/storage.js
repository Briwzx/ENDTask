// ── Supabase Client ────────────────────────────────────────────────
import { supabase } from './supabase.js';

// ── Usuarios registrados ──────────────────────────────────────────
// Nota: Con Supabase, los usuarios se manejan automáticamente en auth.users
// Esta función ahora obtiene perfiles de usuario desde una tabla 'profiles'
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return data || [];
};

// ── Registro de usuario ───────────────────────────────────────────
export const registerUser = async (userData) => {
  const { nombre_completo, email, password, email_institucional } = userData;
  
  // Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre_completo
      }
    }
  });

  if (error) {
    throw error;
  }

  // Si el registro es exitoso, el trigger on_auth_user_created creará el perfil inicial vacio.
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        nombre_completo,
        email,
        email_institucional: email_institucional || null
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Error creating/updating profile:', profileError);
      throw profileError;
    }
  }

  return data;
};

// ── Inicio de sesión ──────────────────────────────────────────────
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data;
};

// ── Sesión activa ─────────────────────────────────────────────────
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return session?.user || null;
};

// ── Cerrar sesión ─────────────────────────────────────────────────
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error logging out:', error);
  }
};

// ── Obtener perfil del usuario actual ─────────────────────────────
export const getCurrentUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Profile does not exist, let's try to create it from auth metadata
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          nombre_completo: user.user_metadata?.nombre_completo || 'Usuario Nuevo',
          email: user.email
        })
        .select()
        .single();
      
      if (!createError) return newProfile;
    }
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

// ── Actualizar perfil completo ─────────────────────────────────────
export const updateUserProfile = async (profileData) => {
  const user = await getSession();
  if (!user) throw new Error("No user logged in");

  const { data, error } = await supabase
    .from('profiles')
    .update({
      nombre_completo: profileData.nombre_completo,
      email: profileData.email
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return data;
};

// ── Actualizar configuración del perfil ───────────────────────────
export const updateUserProfileSettings = async (settings) => {
  const user = await getSession();
  if (!user) throw new Error("No user logged in");

  const { data, error } = await supabase
    .from('profiles')
    .update({ settings })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile settings:', error);
    throw error;
  }

  return data;
};

// ── Cursos (Supabase) ──────────────────────────────────────────────
export const getCourses = async () => {
  const user = await getSession();
  if (!user) return [];

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', user.id)
    .order('fecha', { ascending: true }); // o false dependiendo de tu preferencia

  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
  return data || [];
};

export const addCourse = async (courseData) => {
  const user = await getSession();
  if (!user) throw new Error("No user logged in");

  const { data, error } = await supabase
    .from('courses')
    .insert([{
      ...courseData,
      user_id: user.id
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCourse = async (id) => {
  const user = await getSession();
  if (!user) throw new Error("No user logged in");

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // doble validación por seguridad

  if (error) throw error;
};

// ── Tareas (Supabase) ──────────────────────────────────────────────
export const getTasks = async () => {
  const user = await getSession();
  if (!user) return [];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('fecha', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  return data || [];
};

export const addTask = async (taskData) => {
  const user = await getSession();
  if (!user) throw new Error("No user logged in");

  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      ...taskData,
      user_id: user.id
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTask = async (id, taskUpdates) => {
  const user = await getSession();
  if (!user) throw new Error("No user logged in");

  // Eliminamos id y user_id de las actualizaciones permitidas
  const updates = { ...taskUpdates };
  delete updates.id;
  delete updates.user_id;

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTask = async (id) => {
  const user = await getSession();
  if (!user) throw new Error("No user logged in");

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
};

// ── Funciones de compatibilidad (para migración gradual) ──────────
// Estas funciones mantienen compatibilidad con el código existente
export const saveUsers = (users) => {
  // No longer needed with Supabase
  console.warn('saveUsers is deprecated. Users are now managed by Supabase.');
};

export const saveSession = (user) => {
  // No longer needed with Supabase
  console.warn('saveSession is deprecated. Sessions are now managed by Supabase.');
};

export const clearSession = () => {
  // No longer needed with Supabase
  console.warn('clearSession is deprecated. Use logoutUser instead.');
};
