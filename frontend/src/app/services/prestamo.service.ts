import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Prestamo } from '../models/prestamo.model';
import { AuthService } from './auth.service'; // Importar AuthService

@Injectable({
  providedIn: 'root',
})
export class PrestamoService {
  public apiUrl = 'http://localhost:3000/api/prestamos';
  public apiEstadosUrl = 'http://localhost:3000/api/estados';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      console.log('Enviando encabezados de autorización con el token:', token);
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    } else {
      console.warn('Token no disponible. No se enviarán encabezados de autorización.');
      return new HttpHeaders();
    }
  }

  createPrestamo(prestamo: Prestamo): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/crear`, prestamo, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getPrestamos(): Observable<Prestamo[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Prestamo[]>(this.apiUrl, { headers }).pipe(
      map(response => Array.isArray(response) ? response : []),
      catchError(this.handleError.bind(this))
    );
  }

  updatePrestamo(prestamo: Prestamo): Observable<Prestamo> {
    const headers = this.getAuthHeaders();
    return this.http.put<Prestamo>(`${this.apiUrl}/actualizar`, prestamo, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getHistory(): Observable<Prestamo[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Prestamo[]>(this.apiUrl, { headers }).pipe(
      map(response => Array.isArray(response) ? response : []),
      catchError(this.handleError.bind(this))
    );
  }

  getEstados(): Observable<{ est_id: number, est_nombre: string }[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ est_id: number, est_nombre: string }[]>(this.apiEstadosUrl, { headers }).pipe(
      map(response => Array.isArray(response) ? response : []),
      catchError(this.handleError.bind(this))
    );
  }

  getPrestamosPorCedula(usr_cedula: string): Observable<Prestamo[]> { // Asegúrate de que usr_cedula sea string
    const headers = this.getAuthHeaders();
    return this.http.get<Prestamo[]>(`${this.apiUrl}/usuario/${usr_cedula}`, { headers }).pipe(
      map(response => Array.isArray(response) ? response : []),
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Ocurrió un error:', error.message);
    return throwError(error);
  }
}

















