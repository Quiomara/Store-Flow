import { Elemento } from './elemento.model';

export interface Prestamo {
  idPrestamo?: number; // ID del préstamo (opcional para nuevos préstamos)
  cedulaSolicitante: number; // Cédula del solicitante (obligatoria)
  solicitante?: string; // Nombre del solicitante (opcional)
  fechaInicio?: Date; // Fecha de inicio del préstamo (obligatoria)
  elementos: Elemento[]; // Lista de elementos prestados (obligatoria)
  fecha?: string; // Fecha formateada (opcional, para visualización)
  estado?: string; // Estado del préstamo (opcional)
  fechaEntrega?: string; // Fecha de entrega (opcional)
  instructorNombre?: string; // Nombre completo del instructor (opcional)
  pre_actualizacion?: Date;
}