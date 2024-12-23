import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserBackend } from '../models/user.model';
import { AuthService } from './auth.service';

interface ApiResponse {
  respuesta: boolean;
  mensaje: string;
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api'; // Asegúrate de que esta URL apunte correctamente a tu servidor backend

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    return new HttpHeaders();
  }

  getCentros(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/centros`, { headers: this.getHeaders() });
  }

  getTiposUsuario(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/tipos-usuario`, { headers: this.getHeaders() });
  }

  registerUser(user: UserBackend): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/registrar`, user, { headers: this.getHeaders() });
  }
}



























