import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ForgotPasswordPopupComponent } from '../forgot-password-popup/forgot-password-popup.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ForgotPasswordPopupComponent]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  showForgotPasswordPopup: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Correo y contraseña son necesarios.';
      return;
    }

    this.authService.login(this.email, this.password).subscribe(
      response => {
        if (response && response.token) {
          this.errorMessage = '';  // Limpiar el mensaje de error
          this.redirectUser(response.userType);
        }
      },
      error => {
        this.errorMessage = error.message || 'Error desconocido.';
        console.error('Detalles del error:', error);
      }
    );
  }

  redirectUser(userType: string) {
    switch(userType) {
      case 'Administrador':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'Instructor':
        this.router.navigate(['/instructor']);
        break;
      case 'Almacén':
        this.router.navigate(['/almacen']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }

  forgotPassword() {
    this.showForgotPasswordPopup = true;
  }

  closeForgotPasswordPopup() {
    this.showForgotPasswordPopup = false; // Cerrar el popup
  }
}













































