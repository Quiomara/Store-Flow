import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * Interfaz que representa la respuesta del login.
 *
 * @property {string} token - Token de autenticación JWT.
 * @property {string} userType - Tipo de usuario autenticado.
 * @property {string} [cedula] - Cédula del usuario, opcional.
 */
export interface LoginResponse {
  token: string;
  userType: string;
  cedula?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * URL base de la API de autenticación.
   */
  private readonly apiUrl = 'http://localhost:3000/api/auth';

  /**
   * Clave de almacenamiento para el token de autenticación en localStorage.
   */
  private readonly TOKEN_KEY = 'authToken';

  /**
   * Clave de almacenamiento para la cédula del usuario en localStorage.
   */
  private readonly CEDULA_KEY = 'userCedula';

  /**
   * Clave de almacenamiento para el tipo de usuario en localStorage.
   */
  private readonly USER_TYPE_KEY = 'userType';

  /**
   * Crea una instancia de AuthService.
   *
   * @param http - Instancia de HttpClient para realizar peticiones HTTP.
   * @param router - Instancia de Router para la navegación de rutas.
   */
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Maneja los errores HTTP de manera general.
   *
   * @param error - Objeto de error HTTP.
   * @returns Un Observable que emite un error formateado.
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
   * Realiza la autenticación del usuario.
   *
   * @param email - Correo electrónico del usuario.
   * @param password - Contraseña del usuario.
   * @returns Un Observable con la respuesta del servidor.
   *
   * @throws Error si la respuesta no contiene un token.
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
   * Almacena el token de autenticación en localStorage.
   *
   * @param token - Token de autenticación.
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Obtiene el token de autenticación almacenado.
   *
   * @returns El token de autenticación o null si no existe.
   */
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Elimina el token de autenticación almacenado.
   */
  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Almacena el tipo de usuario en localStorage.
   *
   * @param userType - Tipo de usuario.
   */
  setUserType(userType: string): void {
    localStorage.setItem(this.USER_TYPE_KEY, userType);
  }

  /**
   * Obtiene el tipo de usuario almacenado.
   *
   * @returns El tipo de usuario o null si no está almacenado.
   */
  getUserType(): string | null {
    return localStorage.getItem(this.USER_TYPE_KEY);
  }

  /**
   * Elimina el tipo de usuario almacenado en localStorage.
   */
  clearUserType(): void {
    localStorage.removeItem(this.USER_TYPE_KEY);
  }

  /**
   * Envía una solicitud para restablecer la contraseña.
   *
   * @param email - Correo electrónico del usuario.
   * @returns Un Observable con la respuesta del servidor.
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { correo: email }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Restablece la contraseña del usuario.
   *
   * @param token - Token de validación para el restablecimiento.
   * @param newPassword - Nueva contraseña del usuario.
   * @returns Un Observable con la respuesta del servidor.
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
   * Almacena la cédula del usuario en localStorage.
   *
   * @param cedula - Cédula del usuario.
   */
  setCedula(cedula: string): void {
    localStorage.setItem(this.CEDULA_KEY, cedula);
  }

  /**
   * Obtiene la cédula del usuario almacenada.
   *
   * @returns La cédula del usuario o null si no está almacenada.
   */
  getCedula(): string | null {
    return localStorage.getItem(this.CEDULA_KEY);
  }

  /**
   * Elimina la cédula almacenada en localStorage.
   */
  clearCedula(): void {
    localStorage.removeItem(this.CEDULA_KEY);
  }

  /**
   * Verifica si el usuario está autenticado validando la existencia y vigencia del token.
   *
   * @returns True si el usuario está autenticado y el token es válido; de lo contrario, false.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Procesa la respuesta del login almacenando el token y la cédula si están presentes.
   *
   * @param response - Respuesta de autenticación.
   * @returns La respuesta validada del login.
   *
   * @throws Error si la respuesta no contiene un token.
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
   * Obtiene un mensaje de error basado en el código de estado HTTP.
   *
   * @param error - Error de la solicitud HTTP.
   * @returns Un mensaje de error adecuado según el código de estado.
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
   * Valida si el token ha expirado (requiere implementación JWT).
   *
   * @param token - Token de autenticación.
   * @returns True si el token ha expirado; de lo contrario, false.
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
   * Cierra la sesión del usuario eliminando los datos de autenticación y redirigiendo al login.
   */
  logout(): void {
    this.clearToken();
    this.clearCedula();
    this.clearUserType();
    this.router.navigate(['/login']);
  }

  /**
   * Obtiene el ID del usuario.
   *
   * @returns El ID del usuario.
   *
   * @remarks
   * Actualmente retorna un valor estático de ejemplo; reemplazar con la lógica real para obtener el ID.
   */
  getUserId(): number {
    const userId = 3; // Ejemplo estático, reemplaza con la lógica real
    return userId;
  }
}
