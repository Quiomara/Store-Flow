export interface Elemento {
    ele_id: number;
    ele_nombre: string;
    ele_cantidad_total: number; // Total de elementos en stock
    ele_cantidad_actual: number; // Cantidad actual disponible en stock
    editing?: boolean; // Añadir la propiedad editing
    pre_ele_cantidad_prestado?: number;
  }
  