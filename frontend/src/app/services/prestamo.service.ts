import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prestamo } from '../models/prestamo.model';
import { AuthService } from './auth.service'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root',
})
export class PrestamoService {
  public apiUrl = 'http://localhost:3000/api/prestamos'; // Cambia a público

  constructor(private http: HttpClient, private authService: AuthService) {}

  getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Obtener el token del AuthService
    console.log('Token obtenido:', token); // Log para verificar el token obtenido
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  createPrestamo(prestamo: Prestamo): Observable<any> {
    const headers = this.getHeaders();
    console.log('Authorization Header:', headers.get('Authorization')); // Log para verificar el encabezado de autorización
    return this.http.post(`${this.apiUrl}/crear`, prestamo, { headers });
  }

  getPrestamos(): Observable<Prestamo[]> {
    const headers = this.getHeaders();
    return this.http.get<Prestamo[]>(this.apiUrl, { headers });
  }

  updatePrestamo(prestamo: Prestamo): Observable<Prestamo> {
    const headers = this.getHeaders();
    return this.http.put<Prestamo>(`${this.apiUrl}/actualizar`, prestamo, { headers });
  }
}





