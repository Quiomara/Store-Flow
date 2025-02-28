import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService); // Inyección en runtime
  const token = authService.getToken();

  console.log('🛑 Interceptor activado');
  console.log('🔑 Token obtenido:', token); // <-- Depuración

  if (!token) {
    console.warn('🚨 No se encontró un token. La petición seguirá sin autenticación.');
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  console.log('✅ Token agregado a la solicitud:', authReq);
  return next(authReq);
};
