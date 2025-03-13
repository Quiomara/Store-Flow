/**
 * Interfaz para actualizar un préstamo con sus propiedades principales.
 */
export interface PrestamoUpdate {  
  pre_id: number;                     // ID del préstamo  
  pre_fin?: string;                   // Fecha de finalización del préstamo (opcional)  
  usr_cedula: number;                 // Cédula del usuario asociado al préstamo  
  est_id?: number;                    // ID del estado del préstamo (opcional)  
  ele_id: number;                     // ID del elemento asociado al préstamo  
  ele_cantidad: number;               // Cantidad de elementos involucrados en el préstamo  
  pre_ele_cantidad_prestado?: number; // Cantidad prestada (opcional)  
}
