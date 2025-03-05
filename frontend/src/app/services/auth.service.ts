import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

// Exporta la interfaz
export interface LoginResponse {
  token: string;
  userType: string;
  cedula?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'authToken';
  private readonly CEDULA_KEY = 'userCedula';
  private readonly USER_TYPE_KEY = 'userType';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * Manejo de errores generales
   * @param error Objeto de error HTTP
   * @returns Observable con error formateado
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido. Por favor, inténtalo de nuevo.';
    if (error.status === 400) {
      errorMessage = error.error.error || 'Usuario o contraseña incorrectos.';
    } else if (error.status === 404) {
      errorMessage = error.error.error || 'Correo no registrado. Por favor contacta con un administrador.';
    } else if (error.status === 500) {
      errorMessage = 'Error en el servidor. Por favor, inténtalo de nuevo más tarde.';
    }
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Inicia sesión en la aplicación
   * @param email Correo electrónico del usuario
   * @param password Contraseña del usuario
   * @returns Observable con la respuesta del servidor
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { correo: email, contrasena: password }).pipe(
      map((response) => {
        if (response && response.token) {
          this.setToken(response.token); 
          if (response.userType) {
            this.setUserType(response.userType);
          }
          return response;
        }
        throw new Error('Inicio de sesión fallido');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Almacena el token de autenticación en localStorage
   * @param token Token de autenticación
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Obtiene el token de autenticación almacenado
   * @returns Token de autenticación o null si no está almacenado
   */
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Elimina el token de autenticación almacenado
   */
  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Almacena el tipo de usuario en localStorage
   * @param userType Tipo de usuario
   */
  setUserType(userType: string): void {
    localStorage.setItem(this.USER_TYPE_KEY, userType);
  }

  /**
   * Obtiene el tipo de usuario almacenado
   * @returns Tipo de usuario o null si no está almacenado
   */
  getUserType(): string | null {
    return localStorage.getItem(this.USER_TYPE_KEY);
  }

  /**
   * Elimina el tipo de usuario almacenado
   */
  clearUserType(): void {
    localStorage.removeItem(this.USER_TYPE_KEY);
  }

  /**
   * Envia una solicitud para restablecer la contraseña
   * @param email Correo electrónico del usuario
   * @returns Observable con la respuesta del servidor
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { correo: email }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Restablece la contraseña del usuario
   * @param token Token de validación para el restablecimiento
   * @param newPassword Nueva contraseña
   * @returns Observable con la respuesta del servidor
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/reset-password`,
      { token, newPassword }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Almacena la cédula del usuario en localStorage
   * @param cedula Cédula del usuario
   */
  setCedula(cedula: string): void {
    localStorage.setItem(this.CEDULA_KEY, cedula);
  }

  /**
   * Obtiene la cédula del usuario almacenada
   * @returns Cédula del usuario o null si no está almacenada
   */
  getCedula(): string | null {
    return localStorage.getItem(this.CEDULA_KEY);
  }

   /**
   * Elimina la cédula almacenada en localStorage
   */
   clearCedula(): void {
    localStorage.removeItem(this.CEDULA_KEY);
  }

  /**
   * Verifica si el usuario está autenticado validando el token
   * @returns Booleano indicando si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Maneja la respuesta del login, almacenando el token y la cédula si están presentes
   * @param response Respuesta de la autenticación
   * @returns Respuesta validada del login
   */
  private handleLoginResponse(response: LoginResponse): LoginResponse {
    if (!response?.token) {
      throw new Error('Respuesta de autenticación inválida');
    }

    this.setToken(response.token);

    if (response.cedula) {
      this.setCedula(response.cedula);
    }

    return response;
  }

  /**
   * Obtiene un mensaje de error basado en el código de estado HTTP
   * @param error Error de la solicitud HTTP
   * @returns Mensaje de error adecuado
   */
  private getLoginErrorMessage(error: HttpErrorResponse): string {
    const defaultMessage = 'Error de autenticación. Verifique sus credenciales';

    return {
      400: error.error?.error || 'Credenciales inválidas',
      401: 'Acceso no autorizado',
      404: 'Usuario no registrado',
      500: 'Error interno del servidor'
    }[error.status] || defaultMessage;
  }

  /**
   * Valida si el token ha expirado (requiere implementación JWT)
   * @param token Token de autenticación
   * @returns Booleano indicando si el token ha expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch (e) {
      return true;
    }
  }

  /**
   * Cierra sesión del usuario, eliminando sus datos y redirigiéndolo al login
   */
  logout(): void {
    this.clearToken();
    this.clearCedula();
    this.clearUserType();
    this.router.navigate(['/login']);
  }

  /**
   * Obtiene el ID del usuario
   * @returns ID del usuario
   */
  getUserId(): number {
    // Implementación para obtener el ID del usuario
    const userId = 3; // Ejemplo estático, reemplaza con la lógica real
    return userId;
  }
}

