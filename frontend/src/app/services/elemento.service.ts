import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Elemento } from '../models/elemento.model';
import { Router } from '@angular/router'; // Importar Router para redireccionar

@Injectable({
  providedIn: 'root',
})
export class ElementoService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private router: Router) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']); // Redirigir al login si no hay token
      throw new Error('No se encontró el token en localStorage');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

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

    console.error('Error en ElementoService:', errorMessage, '\nDetalles:', error);
    return throwError(() => new Error(errorMessage));
  }
  
  // Métodos del servicio (sin cambios)
  crearElemento(elemento: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/elementos/crear`, elemento, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener todos los elementos
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
}