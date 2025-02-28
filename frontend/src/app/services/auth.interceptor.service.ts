import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.getToken();
    console.log('🛑 Interceptor activado');
    console.log('🔑 Token obtenido:', token); // <-- Depuración

    if (!token) {
      console.warn('🚨 No se encontró un token. La petición seguirá sin autenticación.');
      return next.handle(req);
    }

    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Token agregado a la solicitud:', authReq);
    return next.handle(authReq);
  }
}
