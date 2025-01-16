import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Elemento } from '../models/prestamo.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ElementoService {
  private apiUrl = 'http://localhost:3000/api/elementos'; // Base URL del endpoint de elementos

  constructor(private http: HttpClient, @Inject(AuthService) private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('Headers con token:', headers); // Log para verificar los headers
    }
    return headers;
  }

  getElementos(): Observable<Elemento[]> {
    return this.http.get<Elemento[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error:', error);
    return throwError(error);
  }
}




