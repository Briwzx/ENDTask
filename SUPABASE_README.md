# Configuración de Supabase

## Pasos para configurar Supabase:

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com) y crea una cuenta
   - Crea un nuevo proyecto
   - Espera a que se configure completamente

2. **Obtener las credenciales:**
   - Ve a Settings > API en tu proyecto de Supabase
   - Copia el "Project URL" y "anon public" key

3. **Configurar variables de entorno:**
   - Edita el archivo `.env` en la raíz del proyecto
   - Reemplaza los valores placeholder con tus credenciales reales:
     ```
     VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
     VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
     ```

4. **Configurar la base de datos:**
   - Ve a SQL Editor en tu proyecto de Supabase
   - Ejecuta el contenido del archivo `supabase-setup.sql`
   - Esto creará la tabla `profiles` con las políticas de seguridad necesarias

5. **Configurar Authentication:**
   - Ve a Authentication > Settings
   - Asegúrate de que "Enable email confirmations" esté activado si quieres verificación de email
   - Opcionalmente, configura proveedores de OAuth (Google, GitHub, etc.)

6. **Probar la aplicación:**
   - Ejecuta `npm run dev`
   - Registra un nuevo usuario
   - Verifica que los datos se guarden en Supabase

## Notas importantes:

- Los usuarios ahora se autentican a través de Supabase Auth
- Los perfiles de usuario se almacenan en la tabla `profiles`
- La aplicación maneja automáticamente la autenticación y sesiones
- Los datos de tareas siguen guardándose en localStorage (puedes migrarlos después si quieres)

## Seguridad:

- RLS (Row Level Security) está habilitado
- Los usuarios solo pueden acceder a su propio perfil
- Las contraseñas se manejan de forma segura por Supabase

## Depuración

Si al registrar ves un mensaje genérico de error ("Error al registrar usuario"):

1. **Revisa la consola del navegador**: ahora el formulario mostrará el texto exacto del error proporcionado por Supabase (por ejemplo, "email rate limit exceeded").
2. **Límite de registro**: el proyecto gratuito impone un tope de intentos por minuto. Si haces muchos registros rápidamente verás el error 429; espera un par de minutos y vuelve a intentarlo.
3. **Errores de RLS**: si la tabla `profiles` no existe o las políticas no permiten la inserción, la consola mostrará un mensaje como `permission denied for table profiles` o similar. Asegúrate de ejecutar `supabase-setup.sql` en el SQL editor.
4. Para pruebas, puedes insertar manualmente un perfil desde el editor SQL:
   ```sql
   INSERT INTO profiles (id, nombre, apellido, telefono, email, anio)
   VALUES ('<uuid>', 'Test', 'User', '123', 'test@example.com', '2000');
   ```
5. **Corroborar tabla**: en la sección "Table Editor" de Supabase deberías ver la tabla `profiles` con las columnas correctas.

Estas indicaciones te ayudarán a localizar el problema si algo no funciona tras el primer registro exitoso.