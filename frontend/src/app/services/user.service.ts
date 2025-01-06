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

interface TipoUsuario {
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

  // Método para obtener todos los centros
  getCentros(): Observable<Centro[]> {
    return this.http.get<ApiResponse<Centro>>(`${this.apiUrl}/centros`, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data)
      );
  }

  // Método para obtener todos los tipos de usuario
  getTiposUsuario(): Observable<TipoUsuario[]> {
    return this.http.get<ApiResponse<TipoUsuario>>(`${this.apiUrl}/tipos-usuario`, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data)
      );
  }

  // Método para obtener centro por ID
  getCentroDeFormacionPorID(id: string): Observable<Centro> {
    return this.http.get<Centro>(`${this.apiUrl}/centros/${id}`);
  }

  // Método para obtener todos los usuarios
  getUsers(): Observable<User[]> {
    return forkJoin([this.getCentros(), this.getTiposUsuario(), this.http.get<ApiResponse<UserBackend>>(`${this.apiUrl}/usuarios`, { headers: this.getHeaders() })])
      .pipe(
        map(([centros, tiposUsuario, response]) => {
          if (response.respuesta) {
            return response.data.map(user => this.mapUser(user, centros, tiposUsuario));
          } else {
            throw new Error(response.mensaje);
          }
        })
      );
  }

  private mapUser(user: UserBackend, centros: Centro[], tiposUsuario: TipoUsuario[]): User {
    const centroFormacion = centros.find(centro => centro.id === Number(user.cen_id))?.nombre || 'N/A';
    const tipoUsuario = tiposUsuario.find(tipo => tipo.id === Number(user.tip_usr_id))?.nombre || 'N/A';

    return {
      cedula: user.usr_cedula,
      primerNombre: user.usr_primer_nombre,
      segundoNombre: user.usr_segundo_nombre,
      primerApellido: user.usr_primer_apellido,
      segundoApellido: user.usr_segundo_apellido,
      email: user.usr_correo,
      confirmarEmail: user.usr_correo,
      centroFormacion: centroFormacion,
      tipoUsuario: tipoUsuario,
      telefono: user.usr_telefono,
      contrasena: user.usr_contrasena,
      confirmarContrasena: user.usr_contrasena
    };
  }

  // Método para buscar usuarios
  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/usuarios?search=${query}`, { headers: this.getHeaders() });
  }

  // Método para eliminar usuarios
  deleteUser(userCedula: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${userCedula}`, { headers: this.getHeaders() });
  }

  // Método para actualizar usuarios
  updateUser(userCedula: string, userData: Partial<UserBackend>): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/actualizar`, userData, {
      headers: this.getHeaders(),
      params: { usr_cedula: userCedula }
    });
  }

  // Método para registrar usuarios
  registerUser(user: UserBackend): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/registrar`, user, { headers: this.getHeaders() });
  }

  // Método para obtener usuario por cédula
  getUsuarioByCedula(cedula: number): Observable<User> {
    return this.http.get<ApiResponse<UserBackend>>(`${this.apiUrl}/usuarios/${cedula}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          if (response.respuesta) {
            const user = response.data[0];
            const mappedUser: User = {
              cedula: user.usr_cedula,
              primerNombre: user.usr_primer_nombre,
              segundoNombre: user.usr_segundo_nombre,
              primerApellido: user.usr_primer_apellido,
              segundoApellido: user.usr_segundo_apellido,
              email: user.usr_correo,
              confirmarEmail: user.usr_correo,
              centroFormacion: '', // Asignar centro de formación si es necesario
              tipoUsuario: '', // Asignar tipo de usuario si es necesario
              telefono: user.usr_telefono,
              contrasena: user.usr_contrasena,
              confirmarContrasena: user.usr_contrasena
            };
            return mappedUser;
          } else {
            throw new Error(response.mensaje);
          }
        })
      );
  }
}




























