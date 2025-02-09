import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Ubicacion } from '../models/ubicacion.model';
import { AuthService } from './auth.service'; // Importar AuthService para obtener el token

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService // Inyectar AuthService para obtener el token
  ) {}

  getUbicaciones(): Observable<Ubicacion[]> {
    const headers = this.getHeaders();
    return this.http.get<Ubicacion[]>(`${this.apiUrl}/ubicacion-elementos`, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Usar AuthService para obtener el token
    if (!token) {
      console.warn('No se encontró el token en localStorage, redirigiendo al login.');
      this.router.navigate(['/login']);
      return new HttpHeaders();
    }
    console.log('Usando token en UbicacionService:', token);
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    if (error.status === 401 || error.status === 403) {
      console.warn('No autorizado. Redirigiendo al inicio de sesión...');
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      errorMessage = 'No autorizado. Redirigiendo al inicio de sesión...';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`;
    }
    console.error('Error en UbicacionService:', errorMessage, '\nDetalles:', error);
    return throwError(() => new Error(errorMessage));
  }
}
