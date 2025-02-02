import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse,  HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Elemento } from '../models/elemento.model';
import { AuthService } from './auth.service';
import { Ubicacion } from '../models/ubicacion.model';

@Injectable({
  providedIn: 'root',
})
export class ElementoService {
  private apiUrl = 'http://localhost:3000/api'; // ✅ URL base general

  constructor(private http: HttpClient, private authService: AuthService) {}

  // elemento.service.ts
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Ocurrió un error:', error);
    return throwError(() => new Error(error.message));
  }

  // Método para crear un elemento
  crearElemento(elemento: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    });

    return this.http.post(`${this.apiUrl}/elementos/crear`, elemento, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Método para obtener la lista de elementos
  getElementos(): Observable<Elemento[]> {
    const headers = this.getHeaders();
    return this.http
      .get<Elemento[]>(`${this.apiUrl}/elementos`, { headers }) // Concatenar la ruta /elementos
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Actualizar cantidad prestada
  actualizarCantidadPrestado(
    pre_id: number,
    ele_id: number,
    pre_ele_cantidad_prestado: number
  ): Observable<any> {
    const headers = this.getHeaders();
    return this.http
      .put(
        `${this.apiUrl}/actualizar-cantidad`,
        { pre_id, ele_id, pre_ele_cantidad_prestado },
        { headers }
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Actualizar stock
  actualizarStock(updateStock: {
    ele_id: number;
    ele_cantidad_actual: number;
    ele_cantidad_total: number;
  }): Observable<any> {
    const headers = this.getHeaders();
    return this.http
      .put(`${this.apiUrl}/actualizar-stock`, updateStock, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  
}
