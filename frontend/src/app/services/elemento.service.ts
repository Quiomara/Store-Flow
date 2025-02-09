import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router'; // Importar Router para redireccionar
import { Elemento } from '../models/elemento.model';
import { AuthService } from './auth.service'; // Importar AuthService

@Injectable({
  providedIn: 'root',
})
export class ElementoService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService // Inyectar AuthService
  ) {}

  // Método para obtener encabezados con el token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Usar AuthService para obtener el token
    if (!token) {
      console.warn('No se encontró el token en localStorage, redirigiendo al login.');
      this.router.navigate(['/login']); // Redirigir al login si no hay token
      return new HttpHeaders(); // Devolver encabezados vacíos para evitar lanzar excepciones
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.status === 401 || error.status === 403) {
      this.authService.logout(); // Usar el método logout de AuthService para eliminar el token
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
    return this.http.post(`${this.apiUrl}/elementos/crear`, elemento, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  getElementos(): Observable<Elemento[]> { 
    const headers = this.getHeaders();
    return this.http.get<Elemento[]>(`${this.apiUrl}/elementos`, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  actualizarCantidadPrestado(pre_id: number, ele_id: number, pre_ele_cantidad_prestado: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar-cantidad`, { pre_id, ele_id, pre_ele_cantidad_prestado }, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  actualizarStock(updateStock: { ele_id: number; ele_cantidad_actual: number; ele_cantidad_total: number; }): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar-stock`, updateStock, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  actualizarElemento(elemento: Elemento): Observable<any> {
    return this.http.put(`${this.apiUrl}/elementos/actualizar`, elemento, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  eliminarElemento(id: number): Observable<any> {
    const headers = this.getHeaders(); // Asegúrate de obtener los encabezados aquí también
    return this.http.delete(`${this.apiUrl}/elementos/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }
}
