// auth.interceptor.service.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// auth.interceptor.service.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Usa localStorage directamente para pruebas
  const token = localStorage.getItem('authToken'); 
  console.log('Interceptor - Token desde localStorage:', token);

  if (token) {
    const clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(clonedReq);
  }

  return next(req);
};