import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api'; // Usa el proxy configurado

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    return new HttpHeaders();
  }

  registerUser(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/register`, user, { headers: this.getHeaders() });
  }

  getCentros(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/centros`, { headers: this.getHeaders() });
  }

  getTiposUsuario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipos-usuario`, { headers: this.getHeaders() });
  }
}














