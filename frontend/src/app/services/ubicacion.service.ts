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

  getUbicaciones(): Observable<Ubicacion[]> {
    // Se delega en el interceptor la inyección del token
    return this.http.get<Ubicacion[]>(`${this.apiUrl}/ubicacion-elementos`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.status === 401 || error.status === 403) {
      console.warn('No autorizado. Redirigiendo al inicio de sesión...');
      this.authService.logout();
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
