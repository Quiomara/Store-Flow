import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserBackend } from '../models/user.model';
import { AuthService } from './auth.service';
import { Prestamo } from '../models/prestamo.model';

/**
 * Interfaz que representa la respuesta del API.
 *
 * @template T - Tipo de datos contenidos en la respuesta.
 */
interface ApiResponse<T> {
  respuesta: boolean;
  mensaje: string;
  data: T[];
}

/**
 * Interfaz que representa un centro de formación.
 */
interface Centro {
  id: number;
  nombre: string;
}

/**
 * Interfaz que representa un tipo de usuario.
 */
interface TipoUsuario {
  id: number;
  nombre: string;
}

/**
 * Servicio encargado de gestionar las operaciones relacionadas con los usuarios.
 *
 * @remarks
 * Este servicio proporciona métodos para obtener centros, tipos de usuario, usuarios, realizar búsquedas,
 * actualizaciones, eliminaciones y registros de usuarios, además de obtener la lista de préstamos.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  /**
   * URL base del API.
   */
  private apiUrl = 'http://localhost:3000/api';

  /**
   * Crea una instancia del servicio de usuarios.
   *
   * @param http - Cliente HTTP para realizar peticiones al backend.
   * @param authService - Servicio de autenticación para gestionar el token de acceso.
   */
  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Obtiene los headers con el token de autenticación.
   *
   * @returns Headers con el token de autenticación o headers vacíos si no existe token.
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
   *
   * @returns Un observable que emite una lista de centros.
   */
  getCentros(): Observable<Centro[]> {
    return this.http.get<ApiResponse<Centro>>(`${this.apiUrl}/centros`, { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  /**
   * Obtiene todos los tipos de usuario.
   *
   * @returns Un observable que emite una lista de tipos de usuario.
   */
  getTiposUsuario(): Observable<TipoUsuario[]> {
    return this.http.get<ApiResponse<TipoUsuario>>(`${this.apiUrl}/tipos-usuario`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtiene un centro de formación por su ID.
   *
   * @param id - ID del centro de formación.
   * @returns Un observable que emite el centro de formación.
   */
  getCentroDeFormacionPorID(id: string): Observable<Centro> {
    return this.http.get<Centro>(`${this.apiUrl}/centros/${id}`);
  }

  /**
   * Obtiene todos los usuarios.
   *
   * @returns Un observable que emite una lista de usuarios.
   *
   * @remarks
   * Se utiliza forkJoin para combinar la respuesta de los centros y la lista de usuarios del backend,
   * y se mapea cada usuario utilizando la función {@link mapUser}.
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
   *
   * @param user - Usuario recibido del backend.
   * @param centros - Lista de centros de formación.
   * @returns El usuario mapeado.
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
   * Busca usuarios por un término de búsqueda.
   *
   * @param query - Término de búsqueda.
   * @returns Un observable que emite una lista de usuarios que coinciden con la búsqueda.
   */
  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/usuarios?search=${query}`, { headers: this.getHeaders() });
  }

  /**
   * Elimina un usuario por cédula.
   *
   * @param userCedula - Cédula del usuario a eliminar.
   * @returns Un observable con la respuesta del servidor.
   */
  deleteUser(userCedula: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${userCedula}`, { headers: this.getHeaders() });
  }

  /**
   * Actualiza un usuario.
   *
   * @param userCedula - Cédula del usuario a actualizar.
   * @param userData - Datos parciales del usuario para actualizar.
   * @returns Un observable con la respuesta del servidor.
   */
  updateUser(userCedula: string, userData: Partial<UserBackend>): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/actualizar`, userData, {
      headers: this.getHeaders(),
      params: { usr_cedula: userCedula }
    });
  }

  /**
   * Registra un nuevo usuario.
   *
   * @param user - Datos del usuario a registrar.
   * @returns Un observable con la respuesta del servidor.
   */
  registerUser(user: UserBackend): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/registrar`, user, { headers: this.getHeaders() });
  }

  /**
   * Obtiene un usuario por cédula.
   *
   * @param cedula - Cédula del usuario.
   * @returns Un observable que emite el usuario obtenido.
   *
   * @remarks
   * Se espera que la respuesta contenga un arreglo con un único usuario. Si la respuesta es negativa,
   * se lanza un error con el mensaje proporcionado.
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
   *
   * @returns Un observable que emite una lista de préstamos.
   */
  getPrestamos(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.apiUrl}/prestamos`);
  }
}
