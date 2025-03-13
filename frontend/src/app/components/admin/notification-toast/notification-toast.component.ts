import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente que muestra una notificación tipo "toast".
 *
 * @remarks
 * Este componente es independiente (standalone) y utiliza el módulo CommonModule.
 * Permite mostrar un mensaje de notificación y controlar su visibilidad mediante la propiedad `isVisible`.
 *
 * @example
 * ```html
 * <app-notification-toast [message]="'¡Operación exitosa!'" [isVisible]="true"></app-notification-toast>
 * ```
 */
@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.css']
})
export class NotificationToastComponent {
  /**
   * Mensaje que se mostrará en la notificación.
   */
  @Input() message: string = '';

  /**
   * Indica si la notificación es visible.
   */
  @Input() isVisible: boolean = false;

  /**
   * Cierra la notificación.
   *
   * @remarks
   * Este método establece la propiedad `isVisible` en false para ocultar la notificación.
   *
   * @returns void
   */
  closeToast(): void {
    if (this.isVisible) {
      this.isVisible = false;
    }
  }
}
