export interface Prestamo {
  idPrestamo?: number; 
  cedulaSolicitante: number;
  solicitante?: string;
  fechaHora?: string;
  elementos: Elemento[];
  fecha: string;
  estado?: string;
  fechaEntrega?: string;
}

export interface Elemento {
  ele_id: number;
  ele_nombre: string;
  ele_cantidad: number;
}






  