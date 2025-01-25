import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Prestamo } from '../models/prestamo.model';

@Injectable({
  providedIn: 'root',
})
export class PrestamoService {
  public apiUrl = 'http://localhost:3000/api/prestamos';  // Cambiado de private a public
  private apiEstadosUrl = 'http://localhost:3000/api/estados';
  private apiStockUrl = 'http://localhost:3000/api/stock'; // Nueva URL para manejar el stock

  constructor(private http: HttpClient) {}

  createPrestamo(prestamo: Prestamo): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, prestamo).pipe(
      catchError(this.handleError)
    );
  }

  getPrestamos(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(this.apiUrl).pipe(
      map(response => Array.isArray(response) ? response : []),
      catchError(this.handleError)
    );
  }

  updateStock(item: { ele_id: number, ele_cantidad: number }): Observable<any> {
    return this.http.put(`${this.apiStockUrl}/actualizar-stock`, item).pipe(
      catchError(this.handleError)
    );
  }

  getHistory(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(this.apiUrl).pipe(
      map(response => Array.isArray(response) ? response : []),
      catchError(this.handleError)
    );
  }

  getEstados(): Observable<{ est_id: number, est_nombre: string }[]> {
    return this.http.get<{ est_id: number, est_nombre: string }[]>(this.apiEstadosUrl).pipe(
      map(response => Array.isArray(response) ? response : []),
      catchError(this.handleError)
    );
  }

  getPrestamosPorCedula(usr_cedula: string): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.apiUrl}/usuario/${usr_cedula}`).pipe(
      map(response => Array.isArray(response) ? response : []),
      catchError(this.handleError)
    );
  }

  getPrestamoDetalles(prestamoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${prestamoId}/detalles`).pipe(
      map((response: any) => {
        console.log('Respuesta del servicio:', response); // Depuración
        return response;
      }),
      catchError(this.handleError)
    );
  }

  updatePrestamoElemento(data: { pre_id: number, ele_id: number, pre_ele_cantidad_prestado: number }): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar`, data).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Ocurrió un error:', error.message);
    return throwError(error);
  }
}
























