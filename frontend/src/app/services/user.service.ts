import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api'; // Usa el proxy configurado

  constructor(private http: HttpClient) {}

  registerUser(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/register`, user);
  }

  searchUser(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/usuarios/search?email=${email}`);
  }

  getCentros(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/centros`);
  }

  getTiposUsuario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipos-usuario`);
  }
}






