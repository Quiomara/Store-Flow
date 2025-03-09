import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Prestamo } from '../models/prestamo.model';
import { AuthService } from './auth.service';
import { Estado } from '../models/estado.model';
import { PrestamoUpdate } from '../models/prestamo-update.model';

/**
 * Servicio encargado de manejar las operaciones relacionadas con los préstamos.
 */
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
   * Obtiene los encabezados de la solicitud, incluyendo el token de autenticación.
   * @returns {HttpHeaders} Los encabezados de la solicitud con el token de autenticación.
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
   * Maneja los errores que ocurren durante las solicitudes HTTP.
   * @param error - El error recibido en la respuesta HTTP.
   * @returns Un observable que emite el error procesado.
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
    console.error('Error en PrestamoService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Realiza una solicitud HTTP de tipo dinámico.
   * @param method - El método HTTP a utilizar (GET, POST, PUT, DELETE, etc.).
   * @param url - La URL a la que se realiza la solicitud.
   * @param body - El cuerpo de la solicitud (opcional).
   * @returns Un observable con el tipo genérico de respuesta esperada.
   */
  private request<T>(method: string, url: string, body?: any): Observable<T> {
    const headers = this.getHeaders();
    return this.http.request<T>(method, url, { body, headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo préstamo en el sistema.
   * @param prestamo - El objeto de préstamo a crear.
   * @returns Un observable con la respuesta de la creación del préstamo.
   */
  createPrestamo(prestamo: Prestamo): Observable<any> {
    return this.http.post(`${this.prestamosUrl}/crear`, prestamo)
      .pipe(catchError(this.handleError));
  }


  /**
 * Obtiene todos los préstamos disponibles en el sistema.
 * @returns Un observable que emite un arreglo de préstamos.
 */
  getPrestamos(): Observable<Prestamo[]> {
    return this.http.get<{ respuesta: boolean; mensaje: string; data: Prestamo[] }>(this.prestamosUrl, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data || []),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza el stock de un artículo.
   * @param item - Objeto que contiene el ID del artículo y su cantidad actual.
   * @returns Un observable con la respuesta de la actualización.
   */
  updateStock(item: { ele_id: number; ele_cantidad_actual: number }): Observable<any> {
    return this.request('PUT', `${this.stockUrl}/actualizar-stock`, item);
  }

  /**
   * Obtiene todos los estados disponibles en el sistema.
   * @returns Un observable que emite un arreglo de estados.
   */
  getEstados(): Observable<Estado[]> {
    return this.request<Estado[]>('GET', this.estadosUrl).pipe(
      map(response => Array.isArray(response) ? response : [])
    );
  }

  /**
   * Obtiene los préstamos asociados a una cédula de usuario.
   * @param usr_cedula - La cédula del usuario para buscar los préstamos.
   * @returns Un observable que emite un arreglo de préstamos asociados al usuario.
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
 * Obtiene los detalles de un préstamo por su ID.
 * @param prestamoId - El ID del préstamo para obtener sus detalles.
 * @returns Un observable que emite los detalles del préstamo.
 */
  getPrestamoDetalles(prestamoId: number): Observable<any> {
    return this.request('GET', `${this.prestamosUrl}/${prestamoId}/detalles`).pipe(
      map(response => response)
    );
  }

  /**
   * Actualiza la cantidad prestada de un artículo en un préstamo.
   * @param data - Objeto que contiene el ID del préstamo, el ID del artículo y la cantidad prestada.
   * @returns Un observable con la respuesta de la actualización.
   */
  updatePrestamoElemento(data: { pre_id: number; ele_id: number; pre_ele_cantidad_prestado: number }): Observable<any> {
    return this.request('PUT', `${this.prestamosUrl}/actualizar-cantidad`, data);
  }

  /**
   * Actualiza los detalles de un préstamo.
   * @param data - Objeto que contiene la información para actualizar el préstamo.
   * @returns Un observable con la respuesta de la actualización.
   */
  updatePrestamo(data: PrestamoUpdate): Observable<any> {
    return this.request('PUT', `${this.prestamosUrl}/update`, data);
  }

  /**
   * Actualiza el estado de un préstamo, su fecha de entrega y el usuario que realiza el cambio.
   * @param idPrestamo - El ID del préstamo a actualizar.
   * @param data - Objeto que contiene el nuevo estado, la fecha de entrega y la cédula del usuario.
   * @returns Un observable con la respuesta de la actualización.
   */
  actualizarEstadoPrestamo(idPrestamo: number, data: { estado: number; fechaEntrega: Date; usr_cedula: string }): Observable<any> {
    const url = `${this.prestamosUrl}/${idPrestamo}/actualizar-estado`;

    const body = {
      est_id: data.estado, // Enviar el estado correctamente
      fechaEntrega: data.fechaEntrega.toISOString(), // Convierte la fecha a string ISO antes de enviarla
      usr_cedula: data.usr_cedula
    };

    return this.request('PUT', url, body);
  }

  /**
   * Obtiene la URL base para los préstamos.
   * @returns La URL para acceder a los préstamos.
   */
  getPrestamosUrl(): string {
    return this.prestamosUrl;
  }

  /**
   * Cancela un préstamo y devuelve los elementos prestados al stock.
   * @param pre_id - ID del préstamo.
   * @param ele_id - ID del elemento.
   * @param cantidad - Cantidad prestada a devolver.
   * @returns Observable con la respuesta del backend.
   */
  cancelarPrestamo(prestamoId: number): Observable<any> {
    return this.http.put(`${this.prestamosUrl}/cancelar/${prestamoId}`, {})
      .pipe(
        catchError(this.handleError)
      );
  }
  
  
  /**
   * Marca un préstamo como entregado y devuelve los elementos al stock.
   * @param pre_id - ID del préstamo.
   * @param ele_id - ID del elemento.
   * @param cantidad - Cantidad prestada a devolver.
   * @returns Observable con la respuesta del backend.
   */
  entregarPrestamo(pre_id: number): Observable<any> {
    return this.http.put(`${this.prestamosUrl}/entregar/${pre_id}`, {}).pipe(
      catchError(this.handleError)
    );
  }
  

  /**
   * Obtiene el historial de estados de un préstamo.
   * @param pre_id - El ID del préstamo para obtener su historial de estados.
   * @returns Un observable con el historial de estados del préstamo.
   */
  getHistorialEstados(pre_id: number): Observable<any> {
    return this.http.get<any>(`${this.prestamosUrl}/${pre_id}/historial-estado`, {
      headers: this.getHeaders()
    });
  }
}
