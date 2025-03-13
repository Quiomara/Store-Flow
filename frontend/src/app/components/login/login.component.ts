import { Component } from '@angular/core';
import { AuthService, LoginResponse } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ForgotPasswordPopupComponent } from '../forgot-password-popup/forgot-password-popup.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Componente para el inicio de sesión de la aplicación.
 *
 * @remarks
 * Este componente permite a los usuarios autenticarse proporcionando su correo y contraseña.
 * Además, ofrece la posibilidad de recuperar la contraseña mediante un diálogo modal.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class LoginComponent {
  email: string = '';          // Correo electrónico ingresado por el usuario.
  password: string = '';       // Contraseña ingresada por el usuario.
  errorMessage: string = '';   // Mensaje de error a mostrar en caso de fallo en la autenticación.
  isLoading: boolean = false;  // Indicador del estado de carga durante el proceso de autenticación.

  /**
   * Constructor del componente LoginComponent.
   *
   * @param authService - Servicio para autenticar al usuario.
   * @param router - Servicio para la navegación de rutas.
   * @param dialog - Servicio para mostrar el diálogo de recuperación de contraseña.
   */
  constructor(
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  /**
   * Método para iniciar sesión.
   *
   * @remarks
   * Valida que se hayan ingresado el correo y la contraseña. Si los datos son válidos, llama al servicio
   * de autenticación para iniciar sesión y, en función de la respuesta, redirige al usuario a la ruta correspondiente.
   *
   * @returns void
   */
  login(): void {
    // Validación básica
    if (!this.email || !this.password) {
      this.errorMessage = 'Correo y contraseña son necesarios.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading = false;
        if (!response?.token) {
          this.errorMessage = 'Error: No se recibió un token válido.';
          return;
        }
        this.authService.setToken(response.token);
        if (response.cedula) {
          this.authService.setCedula(response.cedula);
        }
        if (!response.userType) {
          this.errorMessage = 'Error: Tipo de usuario no definido en la respuesta.';
          return;
        }
        this.redirectUser(response.userType);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.errorMessage = 'Credenciales inválidas. Por favor, inténtalo de nuevo.';
        } else if (error.status === 404) {
          this.errorMessage = 'Usuario no encontrado. Contacta con un administrador.';
        } else if (error.status === 500) {
          this.errorMessage = 'Error en el servidor. Inténtalo de nuevo más tarde.';
        } else {
          this.errorMessage = 'Error desconocido. Por favor, inténtalo de nuevo.';
        }
        if (error.error?.message) {
          this.errorMessage += ` Detalles: ${error.error.message}`;
        }
      }
    });
  }

  /**
   * Redirige al usuario a la página correspondiente según su tipo.
   *
   * @param userType - Tipo de usuario (por ejemplo, "Administrador", "Instructor", "Almacén").
   * @returns void
   */
  redirectUser(userType: string): void {
    switch (userType) {
      case 'Administrador':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'Instructor':
        this.router.navigate(['/instructor-dashboard']);
        break;
      case 'Almacén':
        this.router.navigate(['/warehouse-dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }

  /**
   * Abre el diálogo modal para la recuperación de contraseña.
   *
   * @returns void
   */
  forgotPassword(): void {
    this.dialog.open(ForgotPasswordPopupComponent, {
      width: '400px'
    });
  }
}
