import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-toast', // Selector para usar el componente en el HTML
  standalone: true, // Indica que el componente es independiente
  imports: [CommonModule], // Importa módulos necesarios
  templateUrl: './notification-toast.component.html', // Ruta al archivo HTML
  styleUrls: ['./notification-toast.component.css'] // Ruta al archivo CSS
})
export class NotificationToastComponent {
  @Input() message: string = ''; // Propiedad para el mensaje de la notificación
  @Input() isVisible: boolean = false; // Propiedad para controlar la visibilidad de la notificación

  /**
   * Método para cerrar la notificación
   * 
   * @returns {void} No retorna ningún valor, solo cambia el estado de visibilidad
   */
  closeToast(): void {
    if (this.isVisible) {
      this.isVisible = false; // Establece isVisible a false para ocultar la notificación
    }
  }
}
