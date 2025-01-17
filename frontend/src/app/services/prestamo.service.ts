import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Prestamo } from '../models/prestamo.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PrestamoService {
  public apiUrl = 'http://localhost:3000/api/prestamos';
  public apiEstadosUrl = 'http://localhost:3000/api/estados';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Token obtenido en PrestamoService:', token); // Verificación adicional del token
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    } else {
      return new HttpHeaders();
    }
  }  

  createPrestamo(prestamo: Prestamo): Observable<any> {
    const headers = this.getHeaders();
    console.log('Authorization Header:', headers.get('Authorization'));
    return this.http.post(`${this.apiUrl}/crear`, prestamo, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getPrestamos(): Observable<Prestamo[]> {
    const headers = this.getHeaders();
    return this.http.get<Prestamo[]>(this.apiUrl, { headers }).pipe(
      map(response => Array.isArray(response) ? response : []),
      catchError(this.handleError)
    );
  }

  updatePrestamo(prestamo: Prestamo): Observable<Prestamo> {
    const headers = this.getHeaders();
    return this.http.put<Prestamo>(`${this.apiUrl}/actualizar`, prestamo, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getHistory(): Observable<Prestamo[]> {
    const headers = this.getHeaders();
    return this.http.get<Prestamo[]>(this.apiUrl, { headers }).pipe(
      map(response => Array.isArray(response) ? response : []),
      catchError(this.handleError)
    );
  }

  getEstados(): Observable<{ est_id: number, est_nombre: string }[]> {
    const headers = this.getHeaders();
    return this.http.get<{ est_id: number, est_nombre: string }[]>(this.apiEstadosUrl, { headers }).pipe(
      map(response => Array.isArray(response) ? response : []),
      catchError(this.handleError)
    );
  }

  getPrestamosPorCedula(usr_cedula: number): Observable<Prestamo[]> {
    const headers = this.getHeaders();
    return this.http.get<Prestamo[]>(`${this.apiUrl}/usuario/${usr_cedula}`, { headers }).pipe(
      map(response => Array.isArray(response) ? response : []),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error:', error);
    return throwError(error);
  }
}

















