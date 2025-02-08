import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router'; // Importar Router para redireccionar

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // Base URL del endpoint de autenticación

  constructor(private http: HttpClient, private router: Router) {} // Inyectar Router

  // Método para iniciar sesión de usuario
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { correo: email, contrasena: password }).pipe(
      map((response) => {
        if (response && response.token) {
          this.setToken(response.token); // Almacenar el token
          if (response.cedula) {
            this.setCedula(response.cedula.toString()); // Almacenar la cédula
          }
          return response;
        }
        throw new Error('Inicio de sesión fallido');
      }),
      catchError(this.handleLoginError)
    );
  }

  // Método para manejar la recuperación de contraseñas
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { correo: email }).pipe(
      map((response) => response),
      catchError(this.handleError)
    );
  }

  // Método para manejar el restablecimiento de contraseñas
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { token, newPassword }).pipe(
      map((response) => response),
      catchError(this.handleError)
    );
  }

  // Manejo de errores del inicio de sesión
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

  // Manejo general de errores
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Ocurrió un error:', error);
    return throwError(() => new Error('Ocurrió un error'));
  }

  // Almacenamiento del token en localStorage
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Recuperación del token desde localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Borrar el token de localStorage
  clearToken(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']); // Redirigir al login
  }

  // Almacenamiento de la cédula en localStorage
  setCedula(cedula: string): void {
    localStorage.setItem('cedula', cedula);
  }

  // Recuperación de la cédula desde localStorage
  getCedula(): string | null {
    return localStorage.getItem('cedula');
  }

  // Borrar la cédula de localStorage
  clearCedula(): void {
    localStorage.removeItem('cedula');
  }

  // Obtener encabezados de autenticación con el token
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      console.warn('No se encontró el token de autenticación, redirigiendo al login.');
      this.router.navigate(['/login']); // Redirigir al login si no hay token
      return new HttpHeaders(); // Devolver encabezados vacíos
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken(); // Devuelve true si el token existe, false si no
  }
}
