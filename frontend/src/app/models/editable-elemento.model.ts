// src/app/models/editable-elemento.model.ts
import { Elemento } from './elemento.model'; // ✅ Importación necesaria

export interface EditableElemento extends Elemento {
  pre_ele_cantidad_prestado?: number; // Cantidad prestada
  editing?: boolean; // Indica si el elemento está en modo edición
}