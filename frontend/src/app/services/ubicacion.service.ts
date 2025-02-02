import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Ubicacion } from '../models/ubicacion.model'; // Ajusta la ruta

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  private apiUrl = 'http://localhost:3000/api'; // URL base del backend

  constructor(private http: HttpClient) {}

  // Obtener todas las ubicaciones
  getUbicaciones(): Observable<Ubicacion[]> {
    const headers = this.getHeaders();
    return this.http.get<Ubicacion[]>(`${this.apiUrl}/ubicacion-elementos`, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // Método para obtener encabezados con el token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Manejo de errores
  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error:', error);
    return throwError(() => new Error(error.message || 'Error en el servicio de ubicaciones'));
  }
}