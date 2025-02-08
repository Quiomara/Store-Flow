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
    if (!this.email || !this.password) {
      this.errorMessage = 'Correo y contraseña son necesarios.';
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (response: LoginResponse) => { // <-- Especifica el tipo
        this.errorMessage = '';
        this.authService.setToken(response.token);
        
        if (response.cedula) {
          this.authService.setCedula(response.cedula);
        }

        // Verificación adicional para TypeScript
        if (!response.userType) {
          this.errorMessage = 'Error: Tipo de usuario no definido';
          return;
        }
        
        this.redirectUser(response.userType);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error desconocido.';
        console.error('Detalles del error:', error);
        // ... resto del manejo de errores
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
