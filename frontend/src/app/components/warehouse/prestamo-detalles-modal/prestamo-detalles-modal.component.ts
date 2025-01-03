import { Component, Inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prestamo-detalles-modal',
  templateUrl: './prestamo-detalles-modal.component.html',
  styleUrls: ['./prestamo-detalles-modal.component.css'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule]
})
export class PrestamoDetallesModalComponent {
  constructor(
    public dialogRef: MatDialogRef<PrestamoDetallesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  actualizarEstado(nuevoEstado: string) {
    this.data.actualizarEstado(this.data.solicitud, nuevoEstado);
    if (nuevoEstado === 'Cancelado' || nuevoEstado === 'Entregado') {
      this.dialogRef.close();  // Cerrar el modal si se cancela o entrega la solicitud
    }
    console.log('Estado actualizado a:', nuevoEstado);
  }
}

