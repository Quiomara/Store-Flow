import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Elemento } from '../models/elemento.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ElementoService {
  private apiUrl = 'http://localhost:3000/api/elementos'; // Base URL del endpoint de elementos

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('Headers con token:', headers); // Log para verificar los headers
    } else {
      console.warn('Token no disponible. No se enviarán encabezados de autorización.');
    }
    return headers;
  }

  // Método para obtener la lista de elementos
  getElementos(): Observable<Elemento[]> {
    const headers = this.getHeaders();
    return this.http.get<Elemento[]>(`${this.apiUrl}`, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // Actualizar cantidad prestada
  actualizarCantidadPrestado(pre_id: number, ele_id: number, pre_ele_cantidad_prestado: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/actualizar-cantidad`, { pre_id, ele_id, pre_ele_cantidad_prestado }, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // Actualizar stock
  actualizarStock(updateStock: { ele_id: number; ele_cantidad_actual: number; ele_cantidad_total: number }): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/actualizar-stock`, updateStock, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error:', error);
    return throwError(error);
  }
}
