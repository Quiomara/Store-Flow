import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserBackend } from '../models/user.model';
import { AuthService } from './auth.service';

interface ApiResponse<T> {
  respuesta: boolean;
  mensaje: string;
  data: T[];
}

interface Centro {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    return new HttpHeaders();
  }

  getCentros(): Observable<Centro[]> {
    return this.http.get<ApiResponse<Centro>>(`${this.apiUrl}/centros`, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data)
      );
  }

  getCentroDeFormacionPorID(id: string): Observable<Centro>{
    return this.http.get<Centro>(`${this.apiUrl}/centros/${id}`);
  }

  getUsers(): Observable<User[]> {
    return forkJoin([this.getCentros(), this.http.get<ApiResponse<UserBackend>>(`${this.apiUrl}/usuarios`, { headers: this.getHeaders() })])
      .pipe(
        map(([centros, response]) => {
          if (response.respuesta) {
            return response.data.map(user => this.mapUser(user, centros));
          } else {
            throw new Error(response.mensaje);
          }
        })
      );
  }

  private mapUser(user: UserBackend, centros: Centro[]): User {
    const centroFormacion = centros.find(centro => centro.id === Number(user.cen_id))?.nombre || 'Desconocido';
  
    return {
      cedula: user.usr_cedula,
      primerNombre: user.usr_primer_nombre,
      segundoNombre: user.usr_segundo_nombre,
      primerApellido: user.usr_primer_apellido,
      segundoApellido: user.usr_segundo_apellido,
      email: user.usr_correo,
      confirmarEmail: user.usr_correo,
      centroFormacion: centroFormacion,
      tipoUsuario: '',
      telefono: user.usr_telefono,
      contrasena: user.usr_contrasena,
      confirmarContrasena: user.usr_contrasena
    };
  }
  

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/usuarios?search=${query}`, { headers: this.getHeaders() });
  }

  deleteUser(userCedula: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${userCedula}`, { headers: this.getHeaders() });
  }

  updateUser(userCedula: string, userData: Partial<UserBackend>): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/actualizar`, userData, {
      headers: this.getHeaders(),
      params: { usr_cedula: userCedula }
    });
  }

  getTiposUsuario(): Observable<ApiResponse<UserBackend>> {
    return this.http.get<ApiResponse<UserBackend>>(`${this.apiUrl}/tipos-usuario`, { headers: this.getHeaders() });
  }

  registerUser(user: UserBackend): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/registrar`, user, { headers: this.getHeaders() });
  }
}






























