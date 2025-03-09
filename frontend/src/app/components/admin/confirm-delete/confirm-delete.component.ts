import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../../models/user.model'; // Ajusta la ruta

/**
 * Componente que muestra un cuadro de diálogo de confirmación para eliminar un usuario.
 * Permite al usuario confirmar o cancelar la eliminación de un usuario.
 */
@Component({
  selector: 'app-confirm-delete',  // Selector de este componente, utilizado para insertar el componente en plantillas
  templateUrl: './confirm-delete.component.html',  // Ruta de la plantilla HTML
  styleUrls: ['./confirm-delete.component.css'],  // Ruta de los estilos CSS para este componente
  standalone: true,  // Configura este componente como independiente, no necesita ser parte de un módulo
  imports: [MatDialogModule, MatButtonModule]  // Módulos de Angular Material importados para usar en este componente
})
export class ConfirmDeleteComponent {
  /**
   * Constructor del componente de confirmación de eliminación.
   * 
   * @param dialogRef - Referencia al diálogo que se está mostrando.
   * @param data - Datos inyectados en el componente, en este caso, un objeto de usuario.
   */
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteComponent>,  // Referencia para cerrar el diálogo
    @Inject(MAT_DIALOG_DATA) public data: { user: User }  // Datos que se pasan al diálogo, en este caso el usuario a eliminar
  ) { }

  /**
   * Método para confirmar la eliminación del usuario.
   * Cierra el diálogo y pasa un valor `true` para indicar que la eliminación es confirmada.
   */
  onConfirm(): void {
    this.dialogRef.close(true);  // Cierra el diálogo y pasa `true` al componente padre para confirmar la eliminación
  }

  /**
   * Método para cancelar la eliminación del usuario.
   * Cierra el diálogo y pasa un valor `false` para indicar que la eliminación ha sido cancelada.
   */
  onCancel(): void {
    this.dialogRef.close(false);  // Cierra el diálogo y pasa `false` al componente padre para cancelar la eliminación
  }
}
