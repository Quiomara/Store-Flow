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

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('Token de autenticación no disponible, redirigiendo al login.');
      this.authService.clearToken();
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    if (error.status === 401 || error.status === 403) {
      console.warn('No autorizado. Redirigiendo al inicio de sesión...');
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

  private request<T>(method: string, url: string, body?: any): Observable<T> {
    const headers = this.getHeaders();
    console.log('Headers enviados:', headers);
    return this.http.request<T>(method, url, { body, headers }).pipe(
      catchError(this.handleError)
    );
  }

  createPrestamo(prestamo: Prestamo): Observable<any> {
    return this.http.post(`${this.prestamosUrl}/crear`, prestamo)
      .pipe(catchError(this.handleError));
  }


  getPrestamos(): Observable<Prestamo[]> {
    return this.http.get<{ respuesta: boolean; mensaje: string; data: Prestamo[] }>(this.prestamosUrl, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data || []),
        catchError(this.handleError)
      );
  }

  updateStock(item: { ele_id: number; ele_cantidad_actual: number }): Observable<any> {
    return this.request('PUT', `${this.stockUrl}/actualizar-stock`, item);
  }

  getEstados(): Observable<Estado[]> {
    return this.request<Estado[]>('GET', this.estadosUrl).pipe(
      map(response => Array.isArray(response) ? response : [])
    );
  }

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

  getPrestamoDetalles(prestamoId: number): Observable<any> {
    return this.request('GET', `${this.prestamosUrl}/${prestamoId}/detalles`).pipe(
      map(response => {
        console.log('Respuesta del servicio:', response);
        return response;
      })
    );
  }

  updatePrestamoElemento(data: { pre_id: number; ele_id: number; pre_ele_cantidad_prestado: number }): Observable<any> {
    return this.request('PUT', `${this.prestamosUrl}/actualizar-cantidad`, data);
  }

  updatePrestamo(data: PrestamoUpdate): Observable<any> {
    return this.request('PUT', `${this.prestamosUrl}/update`, data);
  }

  // Método para actualizar estado, fecha de entrega y registrar el usuario que realiza el cambio
  actualizarEstadoPrestamo(idPrestamo: number, data: { estado: number; fechaEntrega: Date; usr_cedula: string }): Observable<any> {
    const url = `${this.prestamosUrl}/${idPrestamo}/actualizar-estado`;

    const body = {
      est_id: data.estado, // Enviar el estado correctamente
      fechaEntrega: data.fechaEntrega.toISOString(), // Convierte la fecha a string ISO antes de enviarla
      usr_cedula: data.usr_cedula
    };

    return this.request('PUT', url, body);
  }


  getPrestamosUrl(): string {
    return this.prestamosUrl;
  }

  cancelarPrestamo(idPrestamo: number): Observable<any> {
    return this.http.put(`${this.prestamosUrl}/cancelar/${idPrestamo}`, {})
      .pipe(
        catchError((error) => {
          console.error('Error al cancelar préstamo:', error);
          return throwError(() => new Error('Error al cancelar el préstamo.'));
        })
      );
  }

  getHistorialEstados(pre_id: number): Observable<any> {
    // Ajusta la URL base a la tuya
    return this.http.get<any>(`${this.prestamosUrl}/${pre_id}/historial-estado`, {
      headers: this.getHeaders()
    });
  }
  

}
