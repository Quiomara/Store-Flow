import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    CommonModule
  ],
})
export class ConfirmationDialogComponent {
  titulo: string;
  mensaje: string;
  textoBotonConfirmar: string;
  textoBotonCancelar: string;

  /**
   * Constructor del componente de confirmación de diálogo.
   * @param dialogRef - Referencia al diálogo para cerrarlo.
   * @param data - Datos inyectados que contienen título, mensaje y texto de los botones.
   */
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      titulo: string,
      mensaje: string,
      textoBotonConfirmar: string,
      textoBotonCancelar: string
    }
  ) {
    this.titulo = data.titulo;
    this.mensaje = data.mensaje;
    this.textoBotonConfirmar = data.textoBotonConfirmar;
    this.textoBotonCancelar = data.textoBotonCancelar;
  }

  /**
   * Cierra el diálogo y retorna `true` cuando el usuario confirma.
   */
  onConfirm(): void {
    this.dialogRef.close(true); // Retorna `true` si el usuario confirma
  }

  /**
   * Cierra el diálogo y retorna `false` cuando el usuario cancela.
   */
  onCancel(): void {
    this.dialogRef.close(false); // Retorna `false` si el usuario cancela
  }
}
