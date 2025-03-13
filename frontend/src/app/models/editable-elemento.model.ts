import { Elemento } from './elemento.model'; // Importa la interfaz Elemento

/**
 * Interfaz que extiende Elemento para agregar propiedades editables.
 */
export interface EditableElemento extends Elemento {
  pre_ele_cantidad_prestado?: number; // Cantidad del elemento que ha sido prestada (opcional)
  editing?: boolean;                  // Indica si el elemento está en modo edición (opcional)
}
