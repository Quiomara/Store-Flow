import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { MatIconModule } from '@angular/material/icon'; // Importar MatIconModule
import { PrestamoService } from '../../services/prestamo.service';

@Component({
  selector: 'app-prestamo-detalle-modal',
  templateUrl: './prestamo-detalle-modal.component.html',
  styleUrls: ['./prestamo-detalle-modal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    FormsModule, // Añadir FormsModule aquí
    MatIconModule // Añadir MatIconModule aquí
  ]
})
export class PrestamoDetalleModalComponent implements OnInit {
  prestamo: any;
  displayedColumns: string[] = ['nombre', 'cantidad', 'acciones'];
  originalItems: any[] = []; // Para almacenar los valores originales

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PrestamoDetalleModalComponent>,
    private prestamoService: PrestamoService
  ) {
    this.prestamo = data.prestamo;
  }

  ngOnInit(): void {
    this.getPrestamoDetalles(this.prestamo.idPrestamo);
  }

  getPrestamoDetalles(prestamoId: number): void {
    this.prestamoService.getPrestamoDetalles(prestamoId).subscribe(
      (data: any) => {
        this.prestamo = {
          ...this.prestamo,
          items: data.items
        };
        // Clonar los ítems para manejar la cancelación de edición
        this.originalItems = JSON.parse(JSON.stringify(this.prestamo.items));
        console.log('Detalles del préstamo obtenidos:', this.prestamo);
      },
      (error: any) => {
        console.error('Error al obtener los detalles del préstamo', error);
      }
    );
  }

  enableEditing(item: any): void {
    item.editing = true;
  }

  cancelEditing(item: any): void {
    const index = this.prestamo.items.findIndex((i: any) => i === item);
    this.prestamo.items[index] = JSON.parse(JSON.stringify(this.originalItems[index]));
    item.editing = false;
  }

  saveChanges(item: any): void {
    item.editing = false;
    // Guardar cambios en el backend...
    this.prestamoService.updatePrestamo(this.prestamo).subscribe(
      (response: any) => {
        console.log('Préstamo actualizado con éxito:', response);
      },
      (error: any) => {
        console.error('Error al actualizar el préstamo', error);
      }
    );
  }

  close(): void {
    this.dialogRef.close();
  }
}
