import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

/**
 * Componente de modal que muestra un mensaje de éxito.
 *
 * @remarks
 * Este componente se utiliza para mostrar un diálogo modal con un mensaje de éxito.
 */
@Component({
  selector: 'app-success-modal',
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.css'],
  standalone: true,
  imports: [MatDialogModule, MatIconModule]
})
export class SuccessModalComponent {
  /**
   * Constructor del componente de modal de éxito.
   *
   * @param dialogRef - Referencia al diálogo de Angular Material que controla el modal.
   * @param data - Datos que se pasan al modal, generalmente contiene el mensaje que se mostrará.
   */
  constructor(
    public dialogRef: MatDialogRef<SuccessModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  /**
   * Cierra el modal.
   *
   * @returns void
   */
  cerrar(): void {
    this.dialogRef.close();
  }
}
