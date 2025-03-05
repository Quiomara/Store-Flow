import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * Función de guardia que controla si un usuario puede acceder a una ruta.
 * @param {import('@angular/router').ActivatedRouteSnapshot} route - La ruta solicitada que se está intentando activar.
 * @param {import('@angular/router').RouterStateSnapshot} state - El estado actual de la ruta solicitada.
 * @returns {boolean | UrlTree} Retorna true si el usuario está autenticado, o redirige a la página de login si no lo está.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Inyecta el servicio de autenticación
  const router = inject(Router); // Inyecta el router para redirigir al login si es necesario

  // Si está autenticado, permite el acceso
  if (authService.isAuthenticated()) {
    return true;
  }
  // Si no, redirige a login
  return router.parseUrl('/login');
};

