import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { MatIconModule } from '@angular/material/icon'; // Importar MatIconModule
import { PrestamoService } from '../../services/prestamo.service';
import { Prestamo, Elemento } from '../../models/prestamo.model'; // Importar el modelo

interface EditableElemento extends Elemento {
  editing?: boolean;
}

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
  prestamo: Prestamo = {
    cedulaSolicitante: 0,
    elementos: [],
    fecha: ''
  }; // Inicializar con valores por defecto
  displayedColumns: string[] = ['nombre', 'cantidad', 'acciones'];
  originalItems: EditableElemento[] = []; // Para almacenar los valores originales

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PrestamoDetalleModalComponent>,
    private prestamoService: PrestamoService
  ) {
    this.prestamo = data.prestamo || this.prestamo; // Asegurarse de que prestamo tenga un valor por defecto si data.prestamo es undefined
  }

  ngOnInit(): void {
    if (this.prestamo.idPrestamo !== undefined) {
      this.getPrestamoDetalles(this.prestamo.idPrestamo);
    } else {
      console.error('ID del préstamo no definido.');
    }
  }

  getPrestamoDetalles(prestamoId: number): void {
    this.prestamoService.getPrestamoDetalles(prestamoId).subscribe(
      (data: any) => {
        console.log('Datos recibidos en el componente:', data); // Depuración
        if (data && Array.isArray(data.items) && data.items.length) {
          this.prestamo.elementos = data.items.map((item: any) => ({
            ele_id: item.ele_id,
            ele_nombre: item.nombre,
            ele_cantidad: item.cantidad
          }));
          this.prestamo.estado = data.estadoPrestamo || '';
          // Asegurar que originalItems esté correctamente inicializado
          this.originalItems = this.prestamo.elementos.map((item: EditableElemento) => ({ ...item }));
          console.log('Detalles del préstamo obtenidos:', this.prestamo);
        } else {
          console.error('Datos de elementos no definidos o vacíos.');
        }
      },
      (error: any) => {
        console.error('Error al obtener los detalles del préstamo', error);
      }
    );
  }

  enableEditing(item: EditableElemento): void {
    item.editing = true;
  }

  cancelEditing(item: EditableElemento): void {
    if (item.editing) {
      const index = this.originalItems.findIndex((originalItem: EditableElemento) => originalItem.ele_id === item.ele_id);
      if (index !== -1) {
        this.prestamo.elementos[index] = { ...this.originalItems[index] };
      } else {
        console.error('Elemento no encontrado en originalItems para cancelar edición.');
      }
      item.editing = false;
    }
  }

  saveChanges(item: EditableElemento): void {
    if (item.editing) {
      item.editing = false;
      const updateData: Prestamo = {
        idPrestamo: this.prestamo.idPrestamo,
        cedulaSolicitante: this.prestamo.cedulaSolicitante,
        solicitante: this.prestamo.solicitante,
        fechaHora: this.prestamo.estado === 'entregado' ? new Date().toISOString() : undefined,
        elementos: this.prestamo.elementos,
        fecha: this.prestamo.fecha,
        estado: this.prestamo.estado,
        fechaEntrega: this.prestamo.fechaEntrega
      };
      // Guardar cambios en el backend para actualizar el pedido...
      this.prestamoService.updatePrestamo(updateData).subscribe(
        (response: any) => {
          console.log('Préstamo actualizado con éxito:', response);
          // Actualizar el stock en el backend...
          this.prestamoService.updateStock(item).subscribe(
            (response: any) => {
              console.log('Stock actualizado con éxito:', response);
            },
            (error: any) => {
              console.error('Error al actualizar el stock', error);
            }
          );
        },
        (error: any) => {
          console.error('Error al actualizar el préstamo', error);
        }
      );
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}











