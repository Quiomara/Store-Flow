import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router'; // Importar Router para redireccionar
import { Ubicacion } from '../models/ubicacion.model'; // Ajusta la ruta

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  private apiUrl = 'http://localhost:3000/api'; // URL base del backend

  constructor(private http: HttpClient, private router: Router) {}

  // Obtener todas las ubicaciones
  getUbicaciones(): Observable<Ubicacion[]> {
    const headers = this.getHeaders();
    return this.http.get<Ubicacion[]>(`${this.apiUrl}/ubicacion-elementos`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  // Método para obtener encabezados con el token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No se encontró el token en localStorage, redirigiendo al login.');
      this.router.navigate(['/login']); // Redirigir al login si no hay token
      return new HttpHeaders(); // Devolver encabezados vacíos para evitar lanzar excepciones
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem('token'); // Eliminar el token inválido
      console.warn('No autorizado. Redirigiendo al inicio de sesión...');
      this.router.navigate(['/login']); // Redirigir al login
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
