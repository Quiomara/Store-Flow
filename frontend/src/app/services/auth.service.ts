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

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { correo: email, contrasena: password })
      .pipe(
        map(response => {
          console.log('Respuesta del servidor:', response); // Log para verificar la respuesta
          if (response && response.token) {
            this.setToken(response.token);
            console.log('Token almacenado:', response.token); // Log para verificar el token
            if (response.cedula) {
              this.setCedula(response.cedula);
              console.log('Cédula almacenada:', response.cedula); // Log para verificar la cédula
            }
            return response;
          }
          throw new Error('Inicio de sesión fallido');
        }),
        catchError(error => this.handleLoginError(error))
      );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { correo: email })
      .pipe(
        map(response => response),
        catchError(this.handleError)
      );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { token, newPassword })
      .pipe(
        map(response => response),
        catchError(this.handleError)
      );
  }

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
    return throwError({ message: errorMessage, error: error.error, status: error.status });
  }

  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error:', error);
    return throwError(error);
  }

  setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('Recuperando token del localStorage:', token); // Log para verificar el token
      return token;
    }
    return null;
  }

  clearToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Métodos para manejar la cédula del usuario
  setCedula(cedula: number): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cedula', cedula.toString());
      console.log('Cédula almacenada en localStorage:', cedula.toString()); // Log para verificar el almacenamiento
    }
  }

  getCedula(): number | null {
    if (typeof localStorage !== 'undefined') {
      const cedula = localStorage.getItem('cedula');
      console.log('Recuperando cédula del localStorage:', cedula); // Log para verificar la cédula
      return cedula ? Number(cedula) : null;
    }
    return null;
  }

  clearCedula(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('cedula');
    }
  }
}
























































