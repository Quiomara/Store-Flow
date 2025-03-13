/**
 * Interfaz que representa un elemento con sus propiedades principales.
 */
export interface Elemento {
  ele_id: number;                    // ID del elemento
  ele_nombre: string;                // Nombre del elemento
  ele_cantidad_total: number;        // Total de elementos en stock
  ele_cantidad_actual: number;       // Cantidad actual disponible en stock
  ubi_nombre?: string;               // Campo opcional para el nombre de la ubicación
  ubi_ele_id: number;                // Incluir ubi_ele_id
  ele_imagen?: File;                 // Imagen del elemento (opcional)
  editing?: boolean;                 // Propiedad para manejar la edición en la interfaz
  pre_ele_cantidad_prestado?: number; // Cantidad prestada (opcional)
}
