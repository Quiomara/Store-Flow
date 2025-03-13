import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Ubicacion } from '../models/ubicacion.model';
import { AuthService } from './auth.service';

/**
 * Servicio encargado de gestionar las ubicaciones de elementos.
 *
 * @remarks
 * Este servicio proporciona métodos para obtener la lista de ubicaciones de elementos desde el backend y
 * maneja los errores que se puedan presentar en las solicitudes HTTP.
 */
@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  /**
   * URL base del API.
   */
  private apiUrl = 'http://localhost:3000/api';

  /**
   * Crea una instancia del servicio UbicacionService.
   *
   * @param http - Cliente HTTP para realizar las peticiones al backend.
   * @param router - Instancia de Router para la navegación de rutas.
   * @param authService - Servicio de autenticación para gestionar la sesión del usuario.
   */
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Obtiene la lista de ubicaciones.
   *
   * @returns Un observable que emite un arreglo de ubicaciones.
   *
   * @remarks
   * La inyección del token se maneja mediante un interceptor.
   */
  getUbicaciones(): Observable<Ubicacion[]> {
    return this.http.get<Ubicacion[]>(`${this.apiUrl}/ubicacion-elementos`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Maneja los errores en las solicitudes HTTP.
   *
   * @param error - El error recibido en la respuesta HTTP.
   * @returns Un observable que emite un error con un mensaje formateado.
   *
   * @remarks
   * Si el error indica una falta de autorización (401 o 403), se cierra la sesión del usuario.
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
