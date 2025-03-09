import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Elemento } from '../models/elemento.model';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class ElementoService {
  
  private apiUrl = 'http://localhost:3000/api';

  // BehaviorSubject para mantener el inventario actualizado
  private _inventarioSubject: BehaviorSubject<Elemento[]> = new BehaviorSubject<Elemento[]>([]);
  public inventario$: Observable<Elemento[]> = this._inventarioSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Maneja los errores de las solicitudes HTTP
   * @param error Objeto de error recibido
   * @returns Observable con el error formateado
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.status === 401 || error.status === 403) {
      this.authService.logout();
      errorMessage = 'No autorizado. Redirigiendo al inicio de sesión...';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`;
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Crea un nuevo elemento
   * @param elemento Objeto con la información del elemento
   * @returns Observable con la respuesta del servidor
   */
  crearElemento(elemento: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/elementos/crear`, elemento)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene la lista de elementos
   * @returns Observable con la lista de elementos
   */
  getElementos(): Observable<Elemento[]> {
    return this.http.get<Elemento[]>(`${this.apiUrl}/elementos`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Actualiza la cantidad prestada de un elemento
   * @param pre_id ID del préstamo
   * @param ele_id ID del elemento
   * @param pre_ele_cantidad_prestado Cantidad prestada del elemento
   * @returns Observable con la respuesta del servidor
   */
  actualizarCantidadPrestado(pre_id: number, ele_id: number, pre_ele_cantidad_prestado: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/prestamos/actualizar-cantidad`, { pre_id, ele_id, pre_ele_cantidad_prestado })
      .pipe(catchError(this.handleError));
  }  

  /**
   * Actualiza el stock de un elemento
   * @param updateStock Objeto con los datos de actualización de stock
   * @returns Observable con la respuesta del servidor
   */
  actualizarStock(updateStock: { ele_id: number; ele_cantidad_actual: number; ele_cantidad_total: number }): Observable<any> {
    return this.http.put(`${this.apiUrl}/elementos/actualizar-stock`, updateStock)
      .pipe(
        catchError(this.handleError),
        map((response: any) => {
          // Refrescar el inventario en la aplicación después de actualizar el stock
          this.refreshInventario();
          return response;
        })
      );
  }
  
  /**
   * Actualiza la información de un elemento
   * @param elemento Objeto con la información del elemento actualizado
   * @returns Observable con la respuesta del servidor
   */
  actualizarElemento(elemento: Elemento): Observable<any> {
    return this.http.put(`${this.apiUrl}/elementos/actualizar`, elemento)
      .pipe(catchError(this.handleError));
  }

  /**
   * Elimina un elemento por su ID
   * @param id Identificador del elemento a eliminar
   * @returns Observable con la respuesta del servidor
   */
  eliminarElemento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/elementos/${id}`)
      .pipe(catchError(this.handleError));
  }

/**
 * Obtiene la lista de elementos actualizada desde el backend y notifica a los componentes suscritos.
 */
refreshInventario(): void {
  this.getElementos().subscribe({
    next: (data) => {
      console.log('Inventario actualizado después de cancelar préstamo:', data);
    },
    error: (error) => console.error('Error al actualizar inventario:', error)
  });
}

/**
 * Obtiene un elemento por su ID
 * @param ele_id ID del elemento
 * @returns Observable con el elemento encontrado
 */
obtenerElementoPorId(ele_id: number): Observable<Elemento> {
  return this.http.get<Elemento>(`${this.apiUrl}/elementos/${ele_id}`)
    .pipe(catchError(this.handleError));
}


}
