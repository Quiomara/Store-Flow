import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prestamo } from '../models/prestamo.model';

@Injectable({
  providedIn: 'root',
})
export class PrestamoService {
  private apiUrl = 'http://localhost:3000/api/prestamos';

  constructor(private http: HttpClient) {}

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  createPrestamo(prestamo: Prestamo): Observable<Prestamo> {
    return this.http.post<Prestamo>(`${this.apiUrl}/crear`, prestamo, { headers: this.getHeaders() });
  }

  getPrestamos(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  updatePrestamo(prestamo: Prestamo): Observable<Prestamo> {
    return this.http.put<Prestamo>(`${this.apiUrl}/actualizar`, prestamo, { headers: this.getHeaders() });
  }
}






