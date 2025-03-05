import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserBackend } from '../models/user.model';
import { AuthService } from './auth.service';
import { Prestamo } from '../models/prestamo.model';

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

  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Obtiene los headers con el token de autenticación.
   * @returns {HttpHeaders} - Headers con el token de autenticación.
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    return new HttpHeaders();
  }

  /**
   * Obtiene todos los centros.
   * @returns {Observable<Centro[]>} - Lista de centros.
   */
  getCentros(): Observable<Centro[]> {
    return this.http.get<ApiResponse<Centro>>(`${this.apiUrl}/centros`, { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  /**
   * Obtiene todos los tipos de usuario.
   * @returns {Observable<TipoUsuario[]>} - Lista de tipos de usuario.
   */
  getTiposUsuario(): Observable<TipoUsuario[]> {
    return this.http.get<ApiResponse<TipoUsuario>>(`${this.apiUrl}/tipos-usuario`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtiene un centro de formación por ID.
   * @param {string} id - ID del centro de formación.
   * @returns {Observable<Centro>} - Centro de formación.
   */
  getCentroDeFormacionPorID(id: string): Observable<Centro> {
    return this.http.get<Centro>(`${this.apiUrl}/centros/${id}`);
  }

  /**
   * Obtiene todos los usuarios.
   * @returns {Observable<User[]>} - Lista de usuarios.
   */
  getUsers(): Observable<User[]> {
    return forkJoin([
      this.getCentros(),
      this.http.get<ApiResponse<UserBackend>>(`${this.apiUrl}/usuarios`, { headers: this.getHeaders() })
    ]).pipe(
      map(([centros, response]) => {
        if (response.respuesta) {
          return response.data.map(user => this.mapUser(user, centros));
        } else {
          throw new Error(response.mensaje);
        }
      })
    );
  }

  /**
   * Mapea un usuario del backend a un usuario del frontend.
   * @param {UserBackend} user - Usuario del backend.
   * @param {Centro[]} centros - Lista de centros.
   * @returns {User} - Usuario mapeado.
   */
  private mapUser(user: UserBackend, centros: Centro[]): User {
    const centroFormacion = centros.find(centro => centro.id === Number(user.cen_id))?.nombre || user.cen_nombre || 'N/A';
    const tipoUsuario = user.tip_usr_nombre || 'N/A';

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
      confirmarContrasena: user.usr_contrasena,
      cen_nombre: user.cen_nombre,
      tip_usr_nombre: user.tip_usr_nombre
    };
  }

  /**
   * Busca usuarios por query.
   * @param {string} query - Término de búsqueda.
   * @returns {Observable<User[]>} - Lista de usuarios encontrados.
   */
  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/usuarios?search=${query}`, { headers: this.getHeaders() });
  }

  /**
   * Elimina un usuario por cédula.
   * @param {string} userCedula - Cédula del usuario.
   * @returns {Observable<any>} - Respuesta del servidor.
   */
  deleteUser(userCedula: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${userCedula}`, { headers: this.getHeaders() });
  }

  /**
   * Actualiza un usuario.
   * @param {string} userCedula - Cédula del usuario.
   * @param {Partial<UserBackend>} userData - Datos del usuario a actualizar.
   * @returns {Observable<any>} - Respuesta del servidor.
   */
  updateUser(userCedula: string, userData: Partial<UserBackend>): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/actualizar`, userData, {
      headers: this.getHeaders(),
      params: { usr_cedula: userCedula }
    });
  }

  /**
   * Registra un usuario.
   * @param {UserBackend} user - Datos del usuario.
   * @returns {Observable<any>} - Respuesta del servidor.
   */
  registerUser(user: UserBackend): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/registrar`, user, { headers: this.getHeaders() });
  }

  /**
   * Obtiene un usuario por cédula.
   * @param {number} cedula - Cédula del usuario.
   * @returns {Observable<User>} - Usuario obtenido.
   */
  getUsuarioByCedula(cedula: number): Observable<User> {
    return this.http.get<ApiResponse<UserBackend>>(`${this.apiUrl}/usuarios/${cedula}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          if (response.respuesta) {
            const user = response.data[0];
            return {
              cedula: user.usr_cedula,
              primerNombre: user.usr_primer_nombre,
              segundoNombre: user.usr_segundo_nombre,
              primerApellido: user.usr_primer_apellido,
              segundoApellido: user.usr_segundo_apellido,
              email: user.usr_correo,
              confirmarEmail: user.usr_correo,
              centroFormacion: '',
              tipoUsuario: '',
              telefono: user.usr_telefono,
              contrasena: user.usr_contrasena,
              confirmarContrasena: user.usr_contrasena
            };
          } else {
            throw new Error(response.mensaje);
          }
        })
      );
  }

  /**
   * Obtiene la lista de préstamos.
   * @returns {Observable<Prestamo[]>} - Lista de préstamos.
   */
  getPrestamos(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.apiUrl}/prestamos`);
  }
}
