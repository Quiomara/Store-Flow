import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PrestamoService } from '../../services/prestamo.service';
import { Prestamo, Elemento } from '../../models/prestamo.model';
import { PrestamoUpdate } from '../../models/prestamo-update.model';
import { ElementoService } from '../../services/elemento.service';

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
    FormsModule,
    MatIconModule
  ]
})
export class PrestamoDetalleModalComponent implements OnInit {
  prestamo: Prestamo = {
    cedulaSolicitante: 0,
    elementos: [],
    fecha: ''
  };
  displayedColumns: string[] = ['nombre', 'cantidad', 'acciones'];
  originalItems: EditableElemento[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PrestamoDetalleModalComponent>,
    private prestamoService: PrestamoService,
    private elementoService: ElementoService
  ) {
    this.prestamo = data.prestamo || this.prestamo;
    console.log('Constructor - data recibida:', data); // Log para verificar los datos iniciales
  }

  ngOnInit(): void {
    console.log('ngOnInit - prestamo:', this.prestamo);
    if (this.prestamo.idPrestamo !== undefined) {
      this.getPrestamoDetalles(this.prestamo.idPrestamo);
    } else {
      console.error('ID del préstamo no definido.');
    }
  }

  getPrestamoDetalles(prestamoId: number): void {
    if (prestamoId === undefined) {
      console.error('ID del préstamo no definido.');
      return;
    }
  
    this.prestamoService.getPrestamoDetalles(prestamoId).subscribe(
      (data: any) => {
        if (data && Array.isArray(data.items) && data.items.length) {
          this.prestamo.elementos = data.items.map((item: any): Elemento => ({
            ele_id: Number(item.ele_id),
            ele_nombre: item.nombre || '',
            ele_cantidad: Number(item.cantidad)
          }));
          
          this.originalItems = this.prestamo.elementos.map(item => ({ ...item }));
          this.prestamo.estado = data.estadoPrestamo || '';
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
  
      if (this.prestamo.idPrestamo === undefined) {
        console.error('ID del préstamo no definido.');
        return;
      }
  
      const originalItem = this.originalItems.find(
        (originalItem) => originalItem.ele_id === item.ele_id
      );
      const cantidadOriginal = originalItem ? Number(originalItem.ele_cantidad) : 0;
      const cantidadActual = Number(item.ele_cantidad);
      const cantidadActualizada = cantidadActual - cantidadOriginal;
  
      // Actualizar cantidad en PrestamosElementos
      const updatePrestamoElemento = {
        pre_id: this.prestamo.idPrestamo,
        ele_id: item.ele_id,
        pre_ele_cantidad_prestado: cantidadActual
      };
  
      // Actualizar stock
      const updateStock = {
        ele_id: item.ele_id,
        ele_cantidad: -cantidadActualizada // Negativo para reducir stock
      };
  
      // Llamadas a servicios para actualizar
      this.prestamoService.updatePrestamoElemento(updatePrestamoElemento).subscribe(
        () => console.log('Cantidad en PrestamosElementos actualizada'),
        (error) => console.error('Error actualizando PrestamosElementos', error)
      );
  
      this.elementoService.updateStock(updateStock).subscribe(
        () => console.log('Stock actualizado'),
        (error) => console.error('Error actualizando stock', error)
      );
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}


















