import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-prestamo-detalle-modal',
  templateUrl: './prestamo-detalle-modal.component.html',
  styleUrls: ['./prestamo-detalle-modal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ]
})
export class PrestamoDetalleModalComponent implements OnInit {
  prestamo: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PrestamoDetalleModalComponent>
  ) {
    this.prestamo = data.prestamo;
  }

  ngOnInit(): void {}

  close(): void {
    this.dialogRef.close();
  }

  edit(): void {
    // Implementar la lógica de edición
    console.log('Editar préstamo', this.prestamo.idPrestamo);
  }
}
