import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Elemento } from '../models/elemento.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ElementoService {
  private apiUrl = 'http://localhost:3000/api';

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
    return this.http.put(`${this.apiUrl}/actualizar-cantidad`, { pre_id, ele_id, pre_ele_cantidad_prestado })
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualiza el stock de un elemento
   * @param updateStock Objeto con los datos de actualización de stock
   * @returns Observable con la respuesta del servidor
   */
  actualizarStock(updateStock: { ele_id: number; ele_cantidad_actual: number; ele_cantidad_total: number; }): Observable<any> {
    return this.http.put(`${this.apiUrl}/elementos/actualizar-stock`, updateStock)
      .pipe(catchError(this.handleError));
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
}
