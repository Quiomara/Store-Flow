import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

/**
 * Componente que permite al usuario restablecer su contraseña.
 *
 * @remarks
 * Este componente se encarga de mostrar un formulario para que el usuario pueda ingresar
 * una nueva contraseña y confirmar la misma. El token necesario para el restablecimiento se obtiene
 * de los parámetros de la URL.
 */
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class ResetPasswordComponent {
  token: string = '';          // Token de restablecimiento obtenido de la URL.
  newPassword: string = '';    // Nueva contraseña ingresada por el usuario.
  confirmPassword: string = '';// Confirmación de la nueva contraseña.
  message: string = '';        // Mensaje de éxito o información.
  errorMessage: string = '';   // Mensaje de error en caso de fallos en el restablecimiento.

  /**
   * Constructor del componente ResetPasswordComponent.
   *
   * @param authService - Servicio de autenticación para realizar el restablecimiento de la contraseña.
   * @param route - Proporciona acceso a los parámetros de la ruta.
   * @param router - Servicio para la navegación a otras rutas.
   */
  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) {
    this.token = this.route.snapshot.queryParams['token'];
  }

  /**
   * Resetea la contraseña del usuario.
   *
   * @remarks
   * Valida que los campos de nueva contraseña y confirmación no estén vacíos y que coincidan.
   * Si la validación es exitosa, llama al servicio de autenticación para realizar el cambio.
   * En caso de éxito, muestra un mensaje y redirige al usuario al login después de 3 segundos.
   * En caso de error, muestra el mensaje de error recibido.
   *
   * @returns void
   */
  resetPassword(): void {
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Todos los campos son necesarios.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response) => {
        this.message = response.message;
        this.errorMessage = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error desconocido.';
        this.message = '';
      }
    });
  }
}
