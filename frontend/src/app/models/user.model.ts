export interface User {
  cedula: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  email: string;
  confirmarEmail: string;
  centroFormacion: string;
  tipoUsuario: string;
  telefono?: string;
  contrasena: string;
  confirmarContrasena: string;
}

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
}



  