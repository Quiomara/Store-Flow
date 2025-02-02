// ubicacion.model.ts
export interface Ubicacion {
  ubi_ele_id: number; // Asegúrate de que el tipo sea number si el backend devuelve números
  ubi_nombre: string;
}