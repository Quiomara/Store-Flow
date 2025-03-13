/**
 * Interfaz que representa un usuario dentro del sistema.
 * Define los atributos básicos que un usuario debe tener, incluyendo información personal,
 * datos de contacto y credenciales de acceso.
 */
export interface User {
  cedula: number;               // Número de cédula del usuario.
  primerNombre: string;         // Primer nombre del usuario.
  segundoNombre?: string;       // Segundo nombre del usuario (opcional).
  primerApellido: string;       // Primer apellido del usuario.
  segundoApellido?: string;     // Segundo apellido del usuario (opcional).
  email: string;                // Correo electrónico del usuario.
  confirmarEmail: string;       // Confirmación del correo electrónico.
  centroFormacion: string;      // Centro de formación al que pertenece el usuario.
  cen_nombre?: string;          // Nombre del centro de formación (opcional).
  tipoUsuario: string;          // Tipo de usuario.
  tip_usr_nombre?: string;      // Nombre del tipo de usuario (opcional).
  telefono?: string;            // Teléfono de contacto (opcional).
  contrasena: string;           // Contraseña del usuario.
  confirmarContrasena: string;  // Confirmación de la contraseña.
}

/**
 * Interfaz que representa un usuario en el backend.
 * Define los atributos de un usuario tal como están almacenados en la base de datos,
 * incluyendo información relacionada con su centro de formación y tipo de usuario.
 */
export interface UserBackend {
  usr_cedula: number;            // Cédula del usuario.
  usr_primer_nombre: string;     // Primer nombre del usuario.
  usr_segundo_nombre?: string;   // Segundo nombre del usuario (opcional).
  usr_primer_apellido: string;   // Primer apellido del usuario.
  usr_segundo_apellido?: string; // Segundo apellido del usuario (opcional).
  usr_correo: string;            // Correo electrónico del usuario.
  usr_contrasena: string;        // Contraseña del usuario.
  usr_telefono?: string;         // Teléfono de contacto (opcional).
  tip_usr_id: string;            // Identificador del tipo de usuario.
  cen_id: string;                // Identificador del centro de formación.
  cen_nombre?: string;           // Nombre del centro de formación (opcional).
  tip_usr_nombre?: string;       // Nombre del tipo de usuario (opcional).
}
