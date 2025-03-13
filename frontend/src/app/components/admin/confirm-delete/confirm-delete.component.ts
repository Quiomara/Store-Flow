import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../../models/user.model';

/**
 * Componente que muestra un cuadro de diálogo de confirmación para eliminar un usuario.
 *
 * Este componente presenta una interfaz de diálogo que solicita al usuario confirmar o cancelar la eliminación de un usuario.
 *
 * @remarks
 * Este componente es independiente (standalone) y utiliza los módulos de Angular Material: MatDialogModule y MatButtonModule.
 *
 * @example
 * ```html
 * <app-confirm-delete></app-confirm-delete>
 * ```
 */
@Component({
  selector: 'app-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.css'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class ConfirmDeleteComponent {
  /**
   * Crea una instancia del componente ConfirmDeleteComponent.
   *
   * @param dialogRef - Referencia al diálogo que se muestra, utilizada para cerrarlo.
   * @param data - Datos inyectados en el diálogo, que contienen el usuario a eliminar.
   */
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) { }

  /**
   * Método para confirmar la eliminación del usuario.
   *
   * Cierra el diálogo y retorna `true` para indicar que la eliminación ha sido confirmada.
   *
   * @returns {void}
   */
  onConfirm(): void {
    this.dialogRef.close(true);
  }

  /**
   * Método para cancelar la eliminación del usuario.
   *
   * Cierra el diálogo y retorna `false` para indicar que la eliminación ha sido cancelada.
   *
   * @returns {void}
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }
}

