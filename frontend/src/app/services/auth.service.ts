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
  private readonly TOKEN_KEY = 'authToken'; // Usar nombre consistente
  private readonly CEDULA_KEY = 'userCedula';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

 // auth.service.ts
 login(email: string, password: string): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { // <-- Especifica el tipo
    correo: email,
    contrasena: password
  }).pipe(
    map((response) => {
      if (response?.token) {
        this.setToken(response.token);
        return response;
      }
      throw new Error('Respuesta inválida del servidor');
    }),
    catchError(this.handleLoginError)
  );
}

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { correo: email }).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token,
      newPassword
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Gestión de token mejorada
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.clearCedula();
  }

  // Gestión de cédula
  setCedula(cedula: string): void {
    localStorage.setItem(this.CEDULA_KEY, cedula);
  }

  getCedula(): string | null {
    return localStorage.getItem(this.CEDULA_KEY);
  }

  clearCedula(): void {
    localStorage.removeItem(this.CEDULA_KEY);
  }

  // Verificación de autenticación con validación de token
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

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

  private handleLoginError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = this.getLoginErrorMessage(error);
    console.error('Error de autenticación:', error);
    return throwError(() => new Error(errorMessage));
  }

  private getLoginErrorMessage(error: HttpErrorResponse): string {
    const defaultMessage = 'Error de autenticación. Verifique sus credenciales';
    
    return {
      400: error.error?.error || 'Credenciales inválidas',
      401: 'Acceso no autorizado',
      404: 'Usuario no registrado',
      500: 'Error interno del servidor'
    }[error.status] || defaultMessage;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en servicio de autenticación:', error);
    return throwError(() => new Error(
      error.error?.message || 'Ocurrió un error inesperado'
    ));
  }

  // Validación de expiración de token (requiere implementación JWT)
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch (e) {
      return true;
    }
  }

  // Cierre de sesión completo
  logout(): void {
    this.clearToken();
    this.router.navigate(['/login']);
  }
}