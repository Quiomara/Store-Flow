import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Ubicacion } from '../models/ubicacion.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Obtiene la lista de ubicaciones.
   * @returns {Observable<Ubicacion[]>} - Lista de ubicaciones.
   */
  getUbicaciones(): Observable<Ubicacion[]> {
    // Se delega en el interceptor la inyección del token
    return this.http.get<Ubicacion[]>(`${this.apiUrl}/ubicacion-elementos`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Maneja errores en las solicitudes HTTP.
   * @param {HttpErrorResponse} error - Error recibido en la respuesta HTTP.
   * @returns {Observable<never>} - Observable con el error lanzado.
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
}
