import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Método que verifica si un usuario puede acceder a la ruta.
   * Si el usuario está autenticado, permite el acceso; de lo contrario, redirige al login.
   * @param {ActivatedRouteSnapshot} next - Información sobre la ruta solicitada.
   * @param {RouterStateSnapshot} state - Información sobre el estado de la ruta solicitada.
   * @returns {boolean | UrlTree | Observable<boolean | UrlTree>} Retorna true si el usuario está autenticado o una UrlTree para redirigir al login.
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    // Redirige al login si no está autenticado
    return this.router.createUrlTree(['/login']);
  }
}
