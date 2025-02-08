import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PrestamoService } from '../../services/prestamo.service';
import { Prestamo } from '../../models/prestamo.model';
import { Elemento } from '../../models/elemento.model';
import { ElementoService } from '../../services/elemento.service';
import { EditableElemento } from '../../models/editable-elemento.model'; // ✅ Importa EditableElemento

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
      this.obtenerPrestamoDetalles(this.prestamo.idPrestamo);
    } else {
      console.error('ID del préstamo no definido.');
    }
  }

  obtenerPrestamoDetalles(prestamoId: number): void {
    if (prestamoId === undefined) {
      console.error('ID del préstamo no definido.');
      return;
    }

    this.prestamoService.getPrestamoDetalles(prestamoId).subscribe(
      (response: any) => {
        console.log('Respuesta completa del servicio:', response);

        if (response && response.data) {
          this.prestamo.elementos = response.data.map((item: any): EditableElemento => ({
            ele_id: Number(item.ele_id),
            ele_nombre: item.nombre || '',
            ele_cantidad_total: Number(item.ele_cantidad_total),
            ele_cantidad_actual: Number(item.ele_cantidad_actual),
            ubi_ele_id: item.ubi_ele_id, // Asegúrate de incluir esta propiedad
            ubi_nombre: item.ubi_nombre || '', // Asegúrate de incluir esta propiedad
            pre_ele_cantidad_prestado: Number(item.pre_ele_cantidad_prestado), // Cantidad prestada
            editing: false // Inicialmente, la edición está deshabilitada
          }));

          this.originalItems = this.prestamo.elementos.map(item => ({ ...item }));
          this.prestamo.estado = response.estadoPrestamo || 'Desconocido';
          console.log('Estado del préstamo asignado:', this.prestamo.estado);
        } else {
          console.error('Datos de respuesta no válidos:', response);
        }
      },
      (error: any) => {
        console.error('Error al obtener los detalles del préstamo', error);
      }
    );
  }

  enableEditing(item: EditableElemento): void {
    item.editing = true; // Habilitar la edición
  }

  cancelEditing(item: EditableElemento): void {
    if (item.editing) {
      const index = this.originalItems.findIndex((originalItem: EditableElemento) => originalItem.ele_id === item.ele_id);
      if (index !== -1) {
        this.prestamo.elementos[index] = { ...this.originalItems[index] };
      } else {
        console.error('Elemento no encontrado en originalItems para cancelar edición.');
      }
      item.editing = false; // Deshabilitar la edición
    }
  }

  saveChanges(item: EditableElemento): void {
    if (item.editing) {
      item.editing = false;

      // Verificar que el ID del préstamo esté definido
      const pre_id = this.prestamo.idPrestamo;
      if (pre_id === undefined) {
        console.error('ID del préstamo no definido.');
        return;
      }

      // Buscar el elemento original para comparar cantidades
      const originalItem = this.originalItems.find(
        (originalItem) => originalItem.ele_id === item.ele_id
      );

      if (!originalItem) {
        console.error('Elemento original no encontrado.');
        return;
      }

      const cantidadOriginal = Number(originalItem.pre_ele_cantidad_prestado); // Cantidad original prestada
      const cantidadActual = Number(item.pre_ele_cantidad_prestado); // Nueva cantidad prestada
      const diferencia = cantidadActual - cantidadOriginal; // Diferencia entre la nueva cantidad y la original

      // Actualizar cantidad en PrestamosElementos
      const updatePrestamoElemento = {
        pre_id: pre_id, // Usar la variable temporal pre_id
        ele_id: item.ele_id,
        pre_ele_cantidad_prestado: cantidadActual
      };

      // Actualizar stock
      const updateStock = {
        ele_id: item.ele_id,
        ele_cantidad_actual: -diferencia, // Ajustar el stock según la diferencia
        ele_cantidad_total: 0 // No cambia el total
      };

      // Llamadas a servicios para actualizar
      this.prestamoService.updatePrestamoElemento(updatePrestamoElemento).subscribe(
        () => {
          console.log('Cantidad en PrestamosElementos actualizada');

          // Si la actualización en PrestamosElementos fue exitosa, actualizar el stock
          this.elementoService.actualizarStock(updateStock).subscribe(
            () => {
              console.log('Stock actualizado');
              // Aquí podrías agregar lógica adicional, como actualizar la vista o mostrar un mensaje de éxito
            },
            (error) => {
              console.error('Error actualizando stock', error);

              // Revertir la actualización en PrestamosElementos si falla la actualización del stock
              const revertUpdatePrestamoElemento = {
                pre_id: pre_id, // Usar la variable temporal pre_id
                ele_id: item.ele_id,
                pre_ele_cantidad_prestado: cantidadOriginal
              };

              this.prestamoService.updatePrestamoElemento(revertUpdatePrestamoElemento).subscribe(
                () => console.log('Revertida la actualización en PrestamosElementos'),
                (revertError) => console.error('Error al revertir la actualización en PrestamosElementos', revertError)
              );
            }
          );
        },
        (error) => console.error('Error actualizando PrestamosElementos', error)
      );
    }
  }

  getEstadoClass(estado: string | undefined): string {
    if (!estado) {
      return 'estado-desconocido'; // Clase por defecto si el estado es undefined
    }

    switch (estado) {
      case 'Creado':
        return 'estado-creado';
      case 'En proceso':
        return 'estado-en-proceso';
      case 'En préstamo':
        return 'estado-en-prestamo';
      case 'Entregado':
        return 'estado-entregado';
      case 'Cancelado':
        return 'estado-cancelado';
      default:
        return 'estado-desconocido'; // Clase por defecto para estados desconocidos
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
