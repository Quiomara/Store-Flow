import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // Si está autenticado, permite el acceso
  if (authService.isAuthenticated()) {
    return true;
  }
  // Si no, redirige a login
  return router.parseUrl('/login');
};
