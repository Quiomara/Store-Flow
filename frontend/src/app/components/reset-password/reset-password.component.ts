import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Importaciones nuevas de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

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
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  errorMessage: string = '';

  /**
   * Constructor del componente, obtiene el token de la URL.
   * @param authService - Servicio de autenticación para resetear la contraseña.
   * @param route - Proporciona acceso a los parámetros de la ruta.
   * @param router - Permite la navegación a otras rutas.
   */
  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) {
    this.token = this.route.snapshot.queryParams['token'];
  }

  /**
   * Resetea la contraseña del usuario si los campos son válidos.
   * Valida que las contraseñas coincidan y que los campos no estén vacíos.
   */
  resetPassword() {
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
