/**
 * Interfaz que representa un usuario dentro del sistema.
 * Define los atributos básicos que un usuario debe tener, incluyendo información personal,
 * datos de contacto y credenciales de acceso.
 */
export interface User {
  cedula: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  email: string;
  confirmarEmail: string;
  centroFormacion: string;
  cen_nombre?: string;
  tipoUsuario: string;
  tip_usr_nombre?: string;
  telefono?: string;
  contrasena: string;
  confirmarContrasena: string;
}

/**
 * Interfaz que representa un usuario en el backend.
 * Define los atributos de un usuario tal como están almacenados en la base de datos,
 * incluyendo información relacionada con su centro de formación y tipo de usuario.
 */
export interface UserBackend {
  usr_cedula: number;
  usr_primer_nombre: string;
  usr_segundo_nombre?: string;
  usr_primer_apellido: string;
  usr_segundo_apellido?: string;
  usr_correo: string;
  usr_contrasena: string;
  usr_telefono?: string;
  tip_usr_id: string;
  cen_id: string;
  cen_nombre?: string;
  tip_usr_nombre?: string;
}
