import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Importar CommonModule

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule] // Añadir CommonModule en el array de importaciones
})
export class ResetPasswordComponent {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) {
    this.token = this.route.snapshot.queryParams['token'];
  }

  resetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Todos los campos son necesarios.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.authService.resetPassword(this.token, this.newPassword).subscribe(
      (response: any) => {
        this.message = response.message;
        this.errorMessage = ''; // Limpiar mensaje de error
        setTimeout(() => {
          this.router.navigate(['/login']); // Redirigir a la página de login después de 3 segundos
        }, 3000);
      },
      (error: any) => {
        console.error('Error en resetPassword:', error);
        this.errorMessage = error.message || 'Error desconocido.';
        this.message = ''; // Limpiar mensaje de éxito
      }
    );
  }
}





















