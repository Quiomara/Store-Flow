import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // Base URL del endpoint de autenticación

  constructor(private http: HttpClient) {}

  // Método para iniciar sesión de usuario
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { correo: email, contrasena: password })
      .pipe(
        map(response => {
          console.log('Respuesta del servidor:', response);
          if (response && response.token) {
            this.setToken(response.token); // Almacena el token
            console.log('Token almacenado:', response.token);
            if (response.cedula) {
              this.setCedula(response.cedula.toString()); // Almacena la cédula
              console.log('Cédula almacenada:', response.cedula);
            }
            return response;
          }
          throw new Error('Inicio de sesión fallido');
        }),
        catchError(this.handleLoginError.bind(this))
      );
  }

  // Método para manejar la recuperación de contraseñas
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { correo: email })
      .pipe(
        map(response => response),
        catchError(this.handleError.bind(this))
      );
  }

  // Método para manejar el restablecimiento de contraseñas
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { token, newPassword })
      .pipe(
        map(response => response),
        catchError(this.handleError.bind(this))
      );
  }

  // Manejo de errores del inicio de sesión
  private handleLoginError(error: any): Observable<never> {
    let errorMessage = 'Error desconocido. Por favor, inténtalo de nuevo.';
    if (error.status === 400) {
      errorMessage = error.error.error || 'Usuario o contraseña incorrectos.';
    } else if (error.status === 404) {
      errorMessage = error.error.error || 'Correo no registrado. Por favor contacta con un administrador.';
    } else if (error.status === 500) {
      errorMessage = 'Error en el servidor. Por favor, inténtalo de nuevo más tarde.';
    }
    console.error('Detalles del error de inicio de sesión:', error);
    return throwError(() => new Error(errorMessage));
  }

  // Manejo general de errores
  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error:', error);
    return throwError(() => new Error('Ocurrió un error'));
  }

  // Almacenamiento del token en localStorage
  setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('token', token);
      console.log('Token almacenado en localStorage:', token);
    }
  }

  // Recuperación del token desde localStorage
  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('Recuperando token del localStorage:', token);  // Verificación del token
      return token;
    }
    return null;
  }

  // Borrar el token de localStorage
  clearToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      console.log('Token eliminado del localStorage');
    }
  }

  // Almacenamiento de la cédula en localStorage
  setCedula(cedula: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cedula', cedula);
      console.log('Cédula almacenada en localStorage:', cedula);
    }
  }

  // Recuperación de la cédula desde localStorage
  getCedula(): string | null {
    if (typeof localStorage !== 'undefined') {
      const cedula = localStorage.getItem('cedula');
      console.log('Recuperando cédula del localStorage:', cedula);
      return cedula;
    }
    return null;
  }

  // Borrar la cédula de localStorage
  clearCedula(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('cedula');
      console.log('Cédula eliminada del localStorage');
    }
  }

  // Obtener encabezados de autenticación con el token
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      console.error('No se encontró el token en localStorage.');
      throw new Error('No se encontró el token de autenticación.');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token; // Devuelve true si el token existe, false si no
  }
}



























































