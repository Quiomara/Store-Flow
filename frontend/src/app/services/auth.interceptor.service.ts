import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Interceptor de autenticación para adjuntar el token JWT a las solicitudes HTTP.
 */
export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService); // Inyección en tiempo de ejecución
  const token = authService.getToken();

  // Si no hay token, la solicitud continúa sin autenticación.
  if (!token) {
    return next(req);
  }

  // Clonar la solicitud y agregar el encabezado de autorización con el token.
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authReq);
};
