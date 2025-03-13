import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

/**
 * Componente de diálogo de confirmación.
 *
 * @remarks
 * Este componente se utiliza para mostrar un diálogo que solicita al usuario confirmar o cancelar
 * una acción. Se inyectan datos que contienen el título, mensaje y los textos de los botones.
 */
@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    CommonModule
  ]
})
export class ConfirmationDialogComponent {
  /**
   * Título del diálogo.
   */
  titulo: string;

  /**
   * Mensaje que se muestra en el diálogo.
   */
  mensaje: string;

  /**
   * Texto del botón de confirmación.
   */
  textoBotonConfirmar: string;

  /**
   * Texto del botón de cancelación.
   */
  textoBotonCancelar: string;

  /**
   * Constructor del componente de diálogo de confirmación.
   *
   * @param dialogRef - Referencia al diálogo para cerrarlo.
   * @param data - Datos inyectados que contienen el título, mensaje y textos de los botones.
   */
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      titulo: string;
      mensaje: string;
      textoBotonConfirmar: string;
      textoBotonCancelar: string;
    }
  ) {
    this.titulo = data.titulo;
    this.mensaje = data.mensaje;
    this.textoBotonConfirmar = data.textoBotonConfirmar;
    this.textoBotonCancelar = data.textoBotonCancelar;
  }

  /**
   * Cierra el diálogo y retorna `true` indicando que el usuario confirmó la acción.
   *
   * @returns void
   */
  onConfirm(): void {
    this.dialogRef.close(true);
  }

  /**
   * Cierra el diálogo y retorna `false` indicando que el usuario canceló la acción.
   *
   * @returns void
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }
}
