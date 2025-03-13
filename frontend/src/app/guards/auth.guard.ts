import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './../services/auth.service';

/**
 * Guardia de autenticación que protege las rutas de la aplicación.
 *
 * @remarks
 * Verifica si el usuario está autenticado utilizando el servicio AuthService.
 * Si el usuario está autenticado, permite el acceso a la ruta solicitada; de lo contrario,
 * redirige al usuario a la página de inicio de sesión.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  /**
   * Crea una instancia del AuthGuard.
   *
   * @param authService - Servicio de autenticación para verificar el estado del usuario.
   * @param router - Servicio de enrutamiento para redirigir al usuario si no está autenticado.
   */
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Verifica si el usuario puede acceder a la ruta solicitada.
   *
   * @param next - Información sobre la ruta solicitada.
   * @param state - Información sobre el estado de la ruta solicitada.
   * @returns Retorna `true` si el usuario está autenticado; de lo contrario, retorna una UrlTree para redirigir al login.
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    return this.router.createUrlTree(['/login']);
  }
}
