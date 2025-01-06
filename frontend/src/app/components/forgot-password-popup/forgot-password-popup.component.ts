import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

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
  forgotPasswordForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  showMessage: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ForgotPasswordPopupComponent>,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  sendForgotPasswordEmail() {
    if (this.forgotPasswordForm.invalid) {
      this.errorMessage = 'El correo es necesario y debe ser válido.';
      return;
    }

    const email = this.forgotPasswordForm.value.email;
    this.authService.forgotPassword(email).subscribe(
      (response: any) => {
        this.successMessage = response.message; // Mostrar el mensaje de éxito
        this.errorMessage = '';  // Limpiar el mensaje de error
        this.showMessage = true;  // Actualizar la propiedad para ocultar otros elementos
      },
      (error: any) => {
        this.errorMessage = error.message || 'Error desconocido.';
        this.successMessage = '';  // Limpiar el mensaje de éxito
      }
    );
  }

  close() {
    this.dialogRef.close();
  }
}




























