import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password-popup',
  templateUrl: './forgot-password-popup.component.html',
  styleUrls: ['./forgot-password-popup.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ForgotPasswordPopupComponent {
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  showMessage: boolean = false;

  @Output() closePopup = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  sendForgotPasswordEmail() {
    if (!this.email) {
      this.errorMessage = 'El correo es necesario.';
      return;
    }

    this.authService.forgotPassword(this.email).subscribe(
      response => {
        this.successMessage = response.message; // Mostrar el mensaje de éxito
        this.errorMessage = '';  // Limpiar el mensaje de error
        this.showMessage = true;  // Actualizar la propiedad para ocultar otros elementos
      },
      error => {
        this.errorMessage = error.message || 'Error desconocido.';
        this.successMessage = '';  // Limpiar el mensaje de éxito
      }
    );
  }

  close() {
    this.closePopup.emit(); // Emitir el evento para cerrar el popup
  }
}


























