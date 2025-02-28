import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Elemento } from '../models/elemento.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ElementoService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.status === 401 || error.status === 403) {
      // Se delega en AuthService para manejar la desconexión
      this.authService.logout();
      console.warn('No autorizado. Redirigiendo al inicio de sesión...');
      errorMessage = 'No autorizado. Redirigiendo al inicio de sesión...';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`;
    }

    console.error('Error en ElementoService:', errorMessage, '\nDetalles:', error);
    return throwError(() => new Error(errorMessage));
  }

  crearElemento(elemento: any): Observable<any> {
    // El interceptor se encarga de agregar el header de autorización
    return this.http.post(`${this.apiUrl}/elementos/crear`, elemento)
      .pipe(catchError(this.handleError));
  }

  getElementos(): Observable<Elemento[]> {
    return this.http.get<Elemento[]>(`${this.apiUrl}/elementos`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  actualizarCantidadPrestado(pre_id: number, ele_id: number, pre_ele_cantidad_prestado: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar-cantidad`, { pre_id, ele_id, pre_ele_cantidad_prestado })
      .pipe(catchError(this.handleError));
  }

  actualizarStock(updateStock: { ele_id: number; ele_cantidad_actual: number; ele_cantidad_total: number; }): Observable<any> {
    return this.http.put(`${this.apiUrl}/elementos/actualizar-stock`, updateStock)
      .pipe(catchError(this.handleError));
  }

  actualizarElemento(elemento: Elemento): Observable<any> {
    return this.http.put(`${this.apiUrl}/elementos/actualizar`, elemento)
      .pipe(catchError(this.handleError));
  }

  eliminarElemento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/elementos/${id}`)
      .pipe(catchError(this.handleError));
  }
}
