import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Interceptor de autenticación para adjuntar el token JWT a las solicitudes HTTP.
 *
 * @remarks
 * Este interceptor utiliza el servicio de autenticación para obtener el token JWT. Si el token está
 * disponible, clona la solicitud original y agrega el encabezado de autorización con el token.
 * Si el token no está presente, la solicitud continúa sin modificaciones.
 *
 * @param req - La solicitud HTTP original.
 * @param next - La función que maneja la solicitud HTTP.
 * @returns La respuesta de la solicitud HTTP, con o sin el token de autenticación según corresponda.
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
