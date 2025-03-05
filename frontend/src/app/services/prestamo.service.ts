import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Prestamo } from '../models/prestamo.model';
import { AuthService } from './auth.service';
import { Estado } from '../models/estado.model';
import { PrestamoUpdate } from '../models/prestamo-update.model';

@Injectable({
  providedIn: 'root',
})
export class PrestamoService {
  private readonly baseUrl = 'http://localhost:3000/api';
  private readonly prestamosUrl = `${this.baseUrl}/prestamos`;
  private readonly estadosUrl = `${this.baseUrl}/estados`;
  private readonly stockUrl = `${this.baseUrl}/stock`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Obtiene los headers con el token de autenticación.
   * @returns {HttpHeaders} - Headers de la petición.
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      this.authService.clearToken();
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Maneja errores en las solicitudes HTTP.
   * @param {HttpErrorResponse} error - Error recibido en la respuesta HTTP.
   * @returns {Observable<never>} - Observable con el error lanzado.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    if (error.status === 401 || error.status === 403) {
      this.authService.clearToken();
      errorMessage = 'No autorizado. Redirigiendo al inicio de sesión...';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Realiza una petición HTTP genérica.
   * @param {string} method - Método HTTP.
   * @param {string} url - URL de la petición.
   * @param {any} [body] - Cuerpo opcional de la petición.
   * @returns {Observable<T>} - Observable con la respuesta.
   */
  private request<T>(method: string, url: string, body?: any): Observable<T> {
    const headers = this.getHeaders();
    return this.http.request<T>(method, url, { body, headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo préstamo.
   * @param {Prestamo} prestamo - Datos del préstamo a crear.
   * @returns {Observable<any>} - Respuesta del servidor.
   */
  createPrestamo(prestamo: Prestamo): Observable<any> {
    return this.http.post(`${this.prestamosUrl}/crear`, prestamo)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene la lista de préstamos.
   * @returns {Observable<Prestamo[]>} - Lista de préstamos.
   */
  getPrestamos(): Observable<Prestamo[]> {
    return this.http.get<{ respuesta: boolean; mensaje: string; data: Prestamo[] }>(this.prestamosUrl, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data || []),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza el stock de un elemento.
   * @param {{ ele_id: number; ele_cantidad_actual: number }} item - Datos del stock a actualizar.
   * @returns {Observable<any>} - Respuesta del servidor.
   */
  updateStock(item: { ele_id: number; ele_cantidad_actual: number }): Observable<any> {
    return this.request('PUT', `${this.stockUrl}/actualizar-stock`, item);
  }

  /**
   * Obtiene la lista de estados.
   * @returns {Observable<Estado[]>} - Lista de estados.
   */
  getEstados(): Observable<Estado[]> {
    return this.request<Estado[]>('GET', this.estadosUrl).pipe(
      map(response => Array.isArray(response) ? response : [])
    );
  }

  /**
   * Obtiene préstamos por cédula de usuario.
   * @param {string} usr_cedula - Cédula del usuario.
   * @returns {Observable<Prestamo[]>} - Lista de préstamos asociados a la cédula.
   */
  getPrestamosPorCedula(usr_cedula: string): Observable<Prestamo[]> {
    return this.request<any>('GET', `${this.prestamosUrl}/usuario/${usr_cedula}`).pipe(
      map(response => {
        if (response.respuesta && response.data) {
          return response.data;
        }
        throw new Error('No se encontraron préstamos.');
      })
    );
  }

  /**
   * Obtiene los detalles de un préstamo.
   * @param {number} prestamoId - ID del préstamo.
   * @returns {Observable<any>} - Detalles del préstamo.
   */
  getPrestamoDetalles(prestamoId: number): Observable<any> {
    return this.request('GET', `${this.prestamosUrl}/${prestamoId}/detalles`);
  }

  /**
   * Actualiza la cantidad prestada de un elemento en un préstamo.
   * @param {{ pre_id: number; ele_id: number; pre_ele_cantidad_prestado: number }} data - Datos de actualización.
   * @returns {Observable<any>} - Respuesta del servidor.
   */
  updatePrestamoElemento(data: { pre_id: number; ele_id: number; pre_ele_cantidad_prestado: number }): Observable<any> {
    return this.request('PUT', `${this.prestamosUrl}/actualizar-cantidad`, data);
  }

  /**
   * Actualiza un préstamo.
   * @param {PrestamoUpdate} data - Datos de actualización.
   * @returns {Observable<any>} - Respuesta del servidor.
   */
  updatePrestamo(data: PrestamoUpdate): Observable<any> {
    return this.request('PUT', `${this.prestamosUrl}/update`, data);
  }

  /**
   * Cancela un préstamo.
   * @param {number} idPrestamo - ID del préstamo a cancelar.
   * @returns {Observable<any>} - Respuesta del servidor.
   */
  cancelarPrestamo(idPrestamo: number): Observable<any> {
    return this.http.put(`${this.prestamosUrl}/cancelar/${idPrestamo}`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene el historial de estados de un préstamo.
   * @param {number} pre_id - ID del préstamo.
   * @returns {Observable<any>} - Historial de estados.
   */
  getHistorialEstados(pre_id: number): Observable<any> {
    return this.http.get<any>(`${this.prestamosUrl}/${pre_id}/historial-estado`, {
      headers: this.getHeaders()
    });
  }
}
