import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { PrestamoService } from '../../services/prestamo.service';
import { Prestamo } from '../../models/prestamo.model';
import { ElementoService } from '../../services/elemento.service';
import { EditableElemento } from '../../models/editable-elemento.model';
import { AuthService } from '../../services/auth.service';
import { Estado } from '../../models/estado.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../warehouse/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';

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
    MatIconModule,
    MatTabsModule
  ]
})
export class PrestamoDetalleModalComponent implements OnInit {
  prestamo: Prestamo;

  // Columnas base para la tabla (mostramos "acciones" solo si se puede editar)
  displayedColumnsBase: string[] = ['nombre', 'cantidad', 'acciones'];

  originalItems: EditableElemento[] = [];
  puedeCambiarEstado = false;
  estados: Estado[] = [];
  estadoSeleccionadoId: number | null = null;
  dataUpdated = false;

  // Nueva propiedad que controla si el usuario puede editar la cantidad
  puedeEditarCantidad = false;

  // Flags para configurar el modal
  soloDetalle: boolean = false;       // Modo lectura o edición
  incluirHistorial: boolean = false;  // Mostrar la pestaña de historial

  // Historial de acciones (si se incluye)
  historialAcciones: any[] = [];

  // Getter: decide si se muestra la columna "acciones"
  get columnsToDisplay(): string[] {
    // Si puedeEditarCantidad es true, incluimos "acciones"
    if (this.puedeEditarCantidad) {
      return this.displayedColumnsBase; // ['nombre','cantidad','acciones']
    }
    // Caso contrario, solo "nombre" y "cantidad"
    return ['nombre', 'cantidad'];
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PrestamoDetalleModalComponent>,
    private prestamoService: PrestamoService,
    private elementoService: ElementoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // Asignar el préstamo
    this.prestamo = data.prestamo || {
      idPrestamo: 0,
      cedulaSolicitante: 0,
      solicitante: '',
      elementos: [],
      fecha: '',
      estado: 'Desconocido',
      fechaEntrega: '',
      instructorNombre: ''
    };

    // Recibir banderas (soloDetalle, incluirHistorial, historialAcciones)
    if (data.soloDetalle !== undefined) {
      this.soloDetalle = data.soloDetalle;
    }
    if (data.incluirHistorial !== undefined) {
      this.incluirHistorial = data.incluirHistorial;
    }
    if (data.historialAcciones) {
      this.historialAcciones = data.historialAcciones;
    }
  }

  ngOnInit(): void {
    this.initComponent();
  }

  private initComponent(): void {
    // Cargar detalles e historial si hay un ID
    if (this.prestamo.idPrestamo) {
      this.obtenerPrestamoDetalles(this.prestamo.idPrestamo);
      if (this.incluirHistorial) {
        this.obtenerHistorialEstados(this.prestamo.idPrestamo);
      }
    }

    this.obtenerEstados();

    // Datos del usuario logueado
    const userType = this.authService.getUserType(); // "Instructor", "Almacén", etc.
    const userId = this.authService.getUserId();     // 2, 3, etc.
    console.log('Usuario:', this.authService.getUserType(), 'ID:', this.authService.getUserId());
console.log('Estado del préstamo:', this.prestamo.estado);
console.log('Solo detalle:', this.soloDetalle);
console.log('Puede editar cantidad:', this.puedeEditarCantidad);

    // Lógica para cambiar estado (si la necesitas)
    this.puedeCambiarEstado = (userType === 'Almacén' && userId === 3);

    // Si es soloDetalle, no se permiten cambios de estado
    if (this.soloDetalle) {
      this.puedeCambiarEstado = false;
    }

    // Lógica para editar la cantidad:
    // 1) Usuario "Instructor" con id=2
    // 2) Préstamo en estado "Creado"
    // 3) !soloDetalle (modo edición)
    this.puedeEditarCantidad = this.prestamo.estado === 'Creado' && userType !== 'Almacén';

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
      this.estadoSeleccionadoId = estadoActual?.est_id ?? null;
    }
  }

  obtenerPrestamoDetalles(prestamoId: number): void {
    this.prestamoService.getPrestamoDetalles(prestamoId).subscribe({
      next: (response: any) => {
        if (response?.data) {
          // Mapeamos elementos
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

          // Ajustar estado si viene de la respuesta
          this.prestamo.estado = response.estadoPrestamo || 'Desconocido';
          this.setEstadoInicial();
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => console.error('Error al obtener detalles', error)
    });
  }

  obtenerHistorialEstados(pre_id: number): void {
    this.prestamoService.getHistorialEstados(pre_id).subscribe({
      next: (response: any) => {
        if (response.respuesta && response.data) {
          this.historialAcciones = response.data;
          // Ordenar de más reciente a más antiguo
          this.historialAcciones.sort(
            (a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        console.error('Error al obtener historial de estados', error);
      }
    });
  }

  // Métodos para cambiar estado (si los necesitas):
  aprobarSolicitud(): void {
    if (this.soloDetalle) return;
    // ...
  }

  cambiarEstadoAEnProceso(): void {
    if (this.soloDetalle) return;
    // ...
  }

  cambiarAEnPrestamo(): void {
    if (this.soloDetalle) return;
    // ...
  }

  cambiarAPrestado(): void {
    if (this.soloDetalle) return;
    // ...
  }

  cambiarAEntregado(): void {
    if (this.soloDetalle) return;
    // ...
  }

  // Métodos para editar la cantidad:
  enableEditing(item: EditableElemento): void {
    if (this.soloDetalle) return;
    item.editing = true;
    this.cdr.detectChanges();
  }

  cancelEditing(item: EditableElemento): void {
    if (this.soloDetalle) return;
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
    if (this.soloDetalle) return;
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

      this.prestamoService.updatePrestamoElemento(updatePrestamoElemento).subscribe({
        next: () => {
          this.elementoService.actualizarStock(updateStock).subscribe({
            next: () => {
              this.dataUpdated = true;
              this.cdr.detectChanges();
              this.snackBar.open('Cambios guardados correctamente', 'Cerrar', { duration: 3000 });
            },
            error: (error: any) => {
              console.error('Error actualizando stock', error);
              this.snackBar.open('Error al actualizar el stock', 'Cerrar', { duration: 3000 });
            }
          });
        },
        error: (error: any) => {
          console.error('Error actualizando PrestamosElementos', error);
          this.snackBar.open('Error al guardar los cambios', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  // Para clases de estilo de estado
  getEstadoClass(estado: string | undefined): string {
    if (!estado) return 'estado-desconocido';
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
        return 'estado-desconocido';
    }
  }

  // Formatear fecha si lo necesitas
  formatearFecha(fecha: string | undefined): string {
    if (!fecha) {
      console.error('Fecha no válida: undefined');
      return 'Fecha no válida';
    }
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      console.error('Fecha no válida:', fecha);
      return 'Fecha no válida';
    }
    return date.toISOString().split('T')[0];
  }

  onTabChange(event: MatTabChangeEvent): void {
    if (this.prestamo.idPrestamo !== undefined) {
      this.obtenerHistorialEstados(this.prestamo.idPrestamo);
    }
  }

  close(): void {
    this.dialogRef.close(this.dataUpdated);
  }
}
