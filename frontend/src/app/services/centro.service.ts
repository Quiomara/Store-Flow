import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Importar AuthService

@Injectable({
  providedIn: 'root'
})
export class CentroService {
  private apiUrl = 'http://localhost:3000/api/centros'; // URL del backend

  constructor(private http: HttpClient, private authService: AuthService) {} // Inyectar AuthService

  // Método para obtener todos los centros de formación
  getCentros(): Observable<any> {
    const token = this.authService.getToken(); // Usar AuthService para obtener el token
    if (!token) {
      console.error('Token no válido');
      return throwError(() => new Error('Token no válido'));
    }

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.get(this.apiUrl, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`;
    }
    console.error('Error en CentroService:', errorMessage, '\nDetalles:', error);
    return throwError(() => new Error(errorMessage));
  }
}
