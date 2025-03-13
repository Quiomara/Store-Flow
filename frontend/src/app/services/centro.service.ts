import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

/**
 * Servicio para gestionar los centros de formación.
 *
 * @remarks
 * Este servicio se encarga de obtener la lista de centros de formación desde el backend.
 *
 * @example
 * ```typescript
 * centroService.getCentros().subscribe(centros => {
 *   // manejar la lista de centros
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class CentroService {
  /**
   * URL base del backend para operaciones relacionadas con los centros de formación.
   */
  private apiUrl = 'http://localhost:3000/api/centros';

  /**
   * Crea una instancia del servicio de centros.
   *
   * @param http - Cliente HTTP para realizar peticiones al backend.
   * @param authService - Servicio de autenticación para gestionar la autorización.
   */
  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Obtiene todos los centros de formación.
   *
   * @returns Observable que emite la lista de centros obtenida desde el backend.
   *
   * @remarks
   * Realiza una petición GET a la URL definida en `apiUrl` y utiliza `handleError` para el manejo de errores.
   */
  getCentros(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Maneja los errores de las peticiones HTTP.
   *
   * @param error - Objeto de error HTTP recibido.
   * @returns Observable que emite un error con un mensaje formateado.
   *
   * @remarks
   * Determina si el error proviene del cliente o del servidor y construye un mensaje de error adecuado.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
