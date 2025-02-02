export interface Elemento {
  ele_id: number; // ID del elemento
  ele_nombre: string; // Nombre del elemento
  ele_cantidad_total: number; // Total de elementos en stock
  ele_cantidad_actual: number; // Cantidad actual disponible en stock
  ubi_ele_id: string; // ID de la ubicación (relación con la tabla de ubicaciones)
  ele_imagen?: File; // Imagen del elemento (opcional)
  editing?: boolean; // Propiedad para manejar la edición en la interfaz
  pre_ele_cantidad_prestado?: number; // Cantidad prestada (opcional)
}