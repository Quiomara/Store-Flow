import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PrestamoService } from '../../services/prestamo.service';
import { Prestamo } from '../../models/prestamo.model';
import { ElementoService } from '../../services/elemento.service';
import { EditableElemento } from '../../models/editable-elemento.model';
import { AuthService } from '../../services/auth.service';
import { Estado } from '../../models/estado.model';

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
    fecha: '',
    estado: 'Desconocido'
  };
  displayedColumns: string[] = ['nombre', 'cantidad', 'acciones'];
  originalItems: EditableElemento[] = [];
  puedeCambiarEstado = false;
  estados: Estado[] = [];
  estadoSeleccionadoId: number | null = null;
  dataUpdated = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PrestamoDetalleModalComponent>,
    private prestamoService: PrestamoService,
    private elementoService: ElementoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.prestamo = data.prestamo || { ...this.prestamo, estado: 'Desconocido' };
  }

  ngOnInit(): void {
    if (this.prestamo.idPrestamo !== undefined) {
      this.obtenerPrestamoDetalles(this.prestamo.idPrestamo);
    }

    const userType = this.authService.getUserType();
    const userId = this.authService.getUserId();
    this.puedeCambiarEstado = userType === 'Almacén' && userId === 3;

    this.obtenerEstados();
  }

  obtenerEstados(): void {
    this.prestamoService.getEstados().subscribe({
      next: (estados: Estado[]) => {
        this.estados = estados;
        this.setEstadoInicial();
      },
      error: (error) => console.error('Error al obtener estados', error)
    });
  }

  private setEstadoInicial(): void {
    if (this.prestamo.estado) {
      const estadoActual = this.estados.find(e => e.est_nombre === this.prestamo.estado);
      this.estadoSeleccionadoId = estadoActual?.est_id || null;
    }
  }

  obtenerPrestamoDetalles(prestamoId: number): void {
    this.prestamoService.getPrestamoDetalles(prestamoId).subscribe({
      next: (response) => {
        if (response?.data) {
          this.prestamo.elementos = response.data.map((item: any): EditableElemento => ({
            ele_id: Number(item.ele_id),
            ele_nombre: item.nombre || '',
            ele_cantidad_total: Number(item.ele_cantidad_total),
            ele_cantidad_actual: Number(item.ele_cantidad_actual),
            ubi_ele_id: item.ubi_ele_id,
            ubi_nombre: item.ubi_nombre || '',
            pre_ele_cantidad_prestado: Number(item.pre_ele_cantidad_prestado),
            editing: false
          }));

          this.originalItems = [...this.prestamo.elementos];
          this.prestamo.estado = response.estadoPrestamo || 'Desconocido';
          this.setEstadoInicial();
          this.cdr.detectChanges();
        }
      },
      error: (error) => console.error('Error al obtener detalles', error)
    });
  }

  cambiarEstado(): void {
    if (this.prestamo.idPrestamo && this.estadoSeleccionadoId !== null) {
      this.prestamoService.actualizarEstadoPrestamo(
        this.prestamo.idPrestamo,
        this.estadoSeleccionadoId
      ).subscribe({
        next: (response) => {
          if (response.respuesta) {
            const nuevoEstado = this.estados.find(e => e.est_id === this.estadoSeleccionadoId);
            if (nuevoEstado) {
              this.prestamo.estado = nuevoEstado.est_nombre;
            }
            this.dataUpdated = true;
            this.cdr.detectChanges();
          }
        },
        error: (error) => alert(`Error: ${error.error?.mensaje || 'Error desconocido'}`)
      });
    }
  }

  enableEditing(item: EditableElemento): void {
    item.editing = true;
    this.cdr.detectChanges();
  }

  cancelEditing(item: EditableElemento): void {
    if (item.editing) {
      const index = this.originalItems.findIndex(originalItem => originalItem.ele_id === item.ele_id);
      if (index !== -1) {
        this.prestamo.elementos[index] = { ...this.originalItems[index] };
      }
      item.editing = false;
      this.cdr.detectChanges();
    }
  }

  saveChanges(item: EditableElemento): void {
    if (item.editing) {
      item.editing = false;
      const pre_id = this.prestamo.idPrestamo;

      if (!pre_id) {
        console.error('ID del préstamo no definido.');
        return;
      }

      const originalItem = this.originalItems.find(original => original.ele_id === item.ele_id);
      if (!originalItem) return;

      const cantidadOriginal = Number(originalItem.pre_ele_cantidad_prestado);
      const cantidadActual = Number(item.pre_ele_cantidad_prestado);
      const diferencia = cantidadActual - cantidadOriginal;

      const updatePrestamoElemento = {
        pre_id: pre_id,
        ele_id: item.ele_id,
        pre_ele_cantidad_prestado: cantidadActual
      };

      const updateStock = {
        ele_id: item.ele_id,
        ele_cantidad_actual: -diferencia,
        ele_cantidad_total: 0
      };

      this.prestamoService.updatePrestamoElemento(updatePrestamoElemento).subscribe(
        () => {
          this.elementoService.actualizarStock(updateStock).subscribe(
            () => {
              this.dataUpdated = true; // Marcar cambios
              this.cdr.detectChanges();
            },
            (error: any) => {
              console.error('Error actualizando stock', error);
              // Revertir cambios en PrestamosElementos
              this.prestamoService.updatePrestamoElemento({
                pre_id: pre_id,
                ele_id: item.ele_id,
                pre_ele_cantidad_prestado: cantidadOriginal
              }).subscribe();
            }
          );
        },
        (error: any) => console.error('Error actualizando PrestamosElementos', error)
      );
    }
  }

  getEstadoClass(estado: string | undefined): string {
    if (!estado) return 'estado-desconocido';

    switch (estado) {
      case 'Creado': return 'estado-creado';
      case 'En proceso': return 'estado-en-proceso';
      case 'En préstamo': return 'estado-en-prestamo';
      case 'Entregado': return 'estado-entregado';
      case 'Cancelado': return 'estado-cancelado';
      default: return 'estado-desconocido';
    }
  }

  close(): void {
    this.dialogRef.close(this.dataUpdated); // Enviar estado de actualización
  }
}