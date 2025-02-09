import { Component } from '@angular/core';
import { AuthService, LoginResponse  } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ForgotPasswordPopupComponent } from '../forgot-password-popup/forgot-password-popup.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatDialogModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router, public dialog: MatDialog) {}

  login() {
    // Validación básica de campos
    if (!this.email || !this.password) {
      this.errorMessage = 'Correo y contraseña son necesarios.';
      return;
    }
  
    // Limpiar mensajes de error previos
    this.errorMessage = '';
  
    // Llamada al servicio de autenticación
    this.authService.login(this.email, this.password).subscribe({
      next: (response: LoginResponse) => {
        console.log('Respuesta del login:', response); // Depuración
  
        // Verificar que la respuesta tenga el token
        if (!response?.token) {
          this.errorMessage = 'Error: No se recibió un token válido.';
          return;
        }
  
        // Almacenar el token y la cédula (si está presente)
        this.authService.setToken(response.token);
        if (response.cedula) {
          this.authService.setCedula(response.cedula);
        }
  
        // Verificar el tipo de usuario
        if (!response.userType) {
          this.errorMessage = 'Error: Tipo de usuario no definido en la respuesta.';
          return;
        }
  
        // Redirigir según el tipo de usuario
        this.redirectUser(response.userType);
      },
      error: (error) => {
        console.error('Error en el login:', error); // Depuración
  
        // Manejo de errores específicos
        if (error.status === 401) {
          this.errorMessage = 'Credenciales inválidas. Por favor, inténtalo de nuevo.';
        } else if (error.status === 404) {
          this.errorMessage = 'Usuario no encontrado. Contacta con un administrador.';
        } else if (error.status === 500) {
          this.errorMessage = 'Error en el servidor. Inténtalo de nuevo más tarde.';
        } else {
          this.errorMessage = 'Error desconocido. Por favor, inténtalo de nuevo.';
        }
  
        // Mostrar detalles adicionales del error (opcional)
        if (error.error?.message) {
          this.errorMessage += ` Detalles: ${error.error.message}`;
        }
      }
    });
  }

  redirectUser(userType: string) {
    switch(userType) {
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

  forgotPassword() {
    this.dialog.open(ForgotPasswordPopupComponent, {
      width: '400px'
    });
  }
}
