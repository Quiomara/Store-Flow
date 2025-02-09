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
 login(email: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login`, { correo: email, contrasena: password }).pipe(
    map((response) => {
      if (response && response.token) {
        this.setToken(response.token); // Almacenar el token
        console.log('Token almacenado correctamente:', response.token); // Confirmar almacenamiento
        return response;
      }
      throw new Error('Inicio de sesión fallido');
    }),
    catchError(this.handleLoginError)
  );
}

setToken(token: string): void {
  localStorage.setItem(this.TOKEN_KEY, token); // Usar la clave constante
  console.log('Token almacenado con clave:', this.TOKEN_KEY);
}

getToken(): string | null {
  return localStorage.getItem(this.TOKEN_KEY); // Misma clave aquí
}

clearToken(): void {
  localStorage.removeItem(this.TOKEN_KEY);
}

private handleLoginError(error: HttpErrorResponse): Observable<never> {
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

private handleError(error: HttpErrorResponse): Observable<never> {
  console.error('Ocurrió un error:', error);
  return throwError(() => new Error('Ocurrió un error'));
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

  

  private getLoginErrorMessage(error: HttpErrorResponse): string {
    const defaultMessage = 'Error de autenticación. Verifique sus credenciales';
    
    return {
      400: error.error?.error || 'Credenciales inválidas',
      401: 'Acceso no autorizado',
      404: 'Usuario no registrado',
      500: 'Error interno del servidor'
    }[error.status] || defaultMessage;
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