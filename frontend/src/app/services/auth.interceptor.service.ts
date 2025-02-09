// auth.interceptor.service.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken');
  console.log('Interceptor - Clave usada:', 'authToken', 'Valor:', token);

  if (token) {
    console.log('Adjuntando token a la solicitud:', req.url);
    const clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(clonedReq);
  } else {
    console.warn('No se encontró token para la solicitud:', req.url);
  }

  return next(req);
};