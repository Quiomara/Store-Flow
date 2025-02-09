import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Elemento } from '../../../models/elemento.model'; // Asegúrate de importar la interfaz

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
  elemento: Elemento;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { elemento: Elemento } // Recibe el objeto completo
  ) {
    this.elemento = data.elemento; // Asigna el objeto a una propiedad
  }

  onConfirm(): void {
    console.log('Elemento confirmado para eliminar (objeto completo):', this.elemento);
    console.log('ID del elemento confirmado para eliminar:', this.elemento.ele_id);
    this.dialogRef.close(this.elemento); // Retorna el objeto completo
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}