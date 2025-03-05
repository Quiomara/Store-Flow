import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service'; 
@Injectable({
  providedIn: 'root'
})
export class CentroService {
  private apiUrl = 'http://localhost:3000/api/centros'; // URL del backend

  constructor(private http: HttpClient, private authService: AuthService) {} // Inyectar AuthService

  /**
   * Obtiene todos los centros de formación
   * @returns Observable con la lista de centros
   */
  getCentros(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Maneja los errores de las peticiones HTTP
   * @param error Objeto de error HTTP
   * @returns Observable con el mensaje de error
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
