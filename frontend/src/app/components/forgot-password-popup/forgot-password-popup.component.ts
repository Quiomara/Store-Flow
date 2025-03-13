import { Component } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

/**
 * Componente para la recuperación de contraseña mediante una ventana emergente.
 *
 * @component
 */
@Component({
  selector: 'app-forgot-password-popup',
  templateUrl: './forgot-password-popup.component.html',
  styleUrls: ['./forgot-password-popup.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ForgotPasswordPopupComponent {
  /** Formulario reactivo para la recuperación de contraseña. */
  forgotPasswordForm: FormGroup;

  /** Mensaje de error a mostrar en caso de fallo en la solicitud. */
  errorMessage: string = '';

  /** Mensaje de éxito a mostrar en caso de solicitud exitosa. */
  successMessage: string = '';

  /** Indica si se debe mostrar el mensaje (éxito o error). */
  showMessage: boolean = false;

  /**
   * Crea una instancia de ForgotPasswordPopupComponent.
   *
   * @param dialogRef - Referencia al diálogo para poder cerrarlo.
   * @param fb - Instancia de FormBuilder para crear formularios reactivos.
   * @param authService - Servicio de autenticación para manejar la recuperación de contraseña.
   */
  constructor(
    private dialogRef: MatDialogRef<ForgotPasswordPopupComponent>,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Envía el correo de recuperación de contraseña.
   *
   * Verifica que el formulario sea válido antes de enviar la solicitud. Si la solicitud es exitosa,
   * se muestra un mensaje de éxito; en caso de error, se muestra un mensaje de error.
   *
   * @returns void
   */
  sendForgotPasswordEmail(): void {
    if (this.forgotPasswordForm.invalid) {
      this.errorMessage = 'El correo es necesario y debe ser válido.';
      return;
    }

    const email = this.forgotPasswordForm.value.email;
    this.authService.forgotPassword(email).subscribe(
      (response: any) => {
        this.successMessage = response.message; // Muestra el mensaje de éxito
        this.errorMessage = '';                // Limpia el mensaje de error
        this.showMessage = true;               // Muestra el mensaje
      },
      (error: any) => {
        this.errorMessage = error.message || 'Error desconocido.';
        this.successMessage = '';              // Limpia el mensaje de éxito
      }
    );
  }

  /**
   * Cierra el diálogo de la ventana emergente.
   *
   * @returns void
   */
  close(): void {
    this.dialogRef.close();
  }
}

