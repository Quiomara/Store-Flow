import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * Función de guardia que controla si un usuario puede acceder a una ruta.
 *
 * @remarks
 * Esta función utiliza el servicio de autenticación para verificar si el usuario
 * está autenticado. Si el usuario está autenticado, se permite el acceso a la ruta;
 * de lo contrario, se redirige al usuario a la página de inicio de sesión.
 *
 * @param route - La ruta solicitada que se está intentando activar.
 * @param state - El estado actual de la ruta solicitada.
 * @returns Retorna `true` si el usuario está autenticado, o una UrlTree para redirigir a la página de login si no lo está.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);  // Inyecta el servicio de autenticación.
  const router = inject(Router);            // Inyecta el router para redirigir al login si es necesario.

  // Si el usuario está autenticado, permite el acceso.
  if (authService.isAuthenticated()) {
    return true;
  }
  // Si no está autenticado, redirige a la página de inicio de sesión.
  return router.parseUrl('/login');
};
