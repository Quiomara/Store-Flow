// src/app/models/prestamo.model.ts
import { Elemento } from './elemento.model'; // ✅ Importación necesaria

export interface Prestamo {
  idPrestamo?: number;
  cedulaSolicitante: number;
  solicitante?: string;
  fechaInicio: Date;
  elementos: Elemento[]; // Ahora TypeScript reconocerá el tipo
  fecha: string;
  estado?: string;
  fechaEntrega?: string;
  instructorNombre?: string; // Nueva propiedad para el nombre completo del instructor
}