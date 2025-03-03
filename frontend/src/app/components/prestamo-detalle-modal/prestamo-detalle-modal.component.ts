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
  // Por defecto, se muestran columnas para edición (si se permite)
  displayedColumns: string[] = ['nombre', 'cantidad', 'acciones'];
  originalItems: EditableElemento[] = [];
  puedeCambiarEstado = false;
  estados: Estado[] = [];
  estadoSeleccionadoId: number | null = null;
  dataUpdated = false;

  // Flag para modo solo visualización (sin edición o cambio de estado)
  soloDetalle: boolean = false;
  // Flag para incluir la pestaña de historial
  incluirHistorial: boolean = false;

  // Propiedad para almacenar el historial de acciones (se muestra en la pestaña Historial)
  historialAcciones: any[] = [];

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

    if (data.soloDetalle !== undefined) {
      this.soloDetalle = data.soloDetalle;
    }

    if (data.incluirHistorial !== undefined) {
      this.incluirHistorial = data.incluirHistorial;
    }

    // Si te pasan historialAcciones desde fuera, lo asignas
    if (data.historialAcciones) {
      this.historialAcciones = data.historialAcciones;
    }
  }

  ngOnInit(): void {
    this.initComponent();
  }

  private initComponent(): void {
    if (this.prestamo.idPrestamo) {
      this.obtenerPrestamoDetalles(this.prestamo.idPrestamo);
  
      if (this.incluirHistorial) {
        this.obtenerHistorialEstados(this.prestamo.idPrestamo);
      }
    }

    this.obtenerEstados();

    // Configuración según el modo:
    if (this.soloDetalle) {
      // En modo solo visualización, no se permiten cambios ni edición
      this.puedeCambiarEstado = false;
      // Se muestran siempre los detalles; la pestaña de historial se muestra según el flag incluirHistorial.
      this.displayedColumns = ['nombre', 'cantidad'];
    } else {
      const userType = this.authService.getUserType();
      const userId = this.authService.getUserId();
      // Solo el usuario 'Almacén' con id 3 puede cambiar estado
      this.puedeCambiarEstado = (userType === 'Almacén' && userId === 3);
      // En modo edición, se muestran los botones (columna de acciones) si es permitido
      this.displayedColumns = (userType === 'Almacén') ? ['nombre', 'cantidad'] : ['nombre', 'cantidad', 'acciones'];
    }
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

          // Ajustamos estado si viene de la respuesta
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
          // Asigna el arreglo al dataSource de la tabla
          this.historialAcciones = response.data;
          // (Opcional) Ordenar de más reciente a más antiguo
          this.historialAcciones.sort(
            (a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );
  
          console.log('Historial:', this.historialAcciones);
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        console.error('Error al obtener historial de estados', error);
      }
    });
  }  

  // MÉTODOS DE CAMBIO DE ESTADO: Si no estamos en modo soloDetalle, ejecutan la acción y cierran el modal

  aprobarSolicitud(): void {
    if (this.soloDetalle) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        titulo: 'Confirmar aprobación',
        mensaje: '¿Estás seguro de aprobar esta solicitud?',
        textoBotonConfirmar: 'Sí',
        textoBotonCancelar: 'No'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Buscamos el objeto Estado que tenga est_nombre = 'En proceso'
        const estadoEnProceso = this.estados.find(e => e.est_nombre === 'En proceso');

        if (estadoEnProceso && this.prestamo.idPrestamo) {
          this.prestamoService.actualizarEstadoPrestamo(this.prestamo.idPrestamo, {
            estado: estadoEnProceso.est_id,
            fechaEntrega: new Date(),
            usr_cedula: this.authService.getCedula() || ''
          }).subscribe({
            next: (response: any) => {
              if (response.respuesta) {
                // 1. Actualiza el estado del préstamo en el frontend
                this.prestamo.estado = 'En proceso';

                // 2. Recibe el historial en la misma respuesta
                const historialOrdenado = (response.historial_estados || []).sort(
                  (a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                );

                // 3. Asigna el historial a la variable que alimenta la tabla de Historial
                this.historialAcciones = historialOrdenado;

                // Verificamos en consola
                console.log('Historial en front:', this.historialAcciones);

                // Opcional: también puedes guardarlo en this.prestamo.historial_estados
                this.prestamo.historial_estados = historialOrdenado;

                this.dataUpdated = true;
                this.cdr.detectChanges();
                this.snackBar.open('Solicitud aprobada correctamente', 'Cerrar', { duration: 3000 });
                this.dialogRef.close(true);
              }
            },
            error: (error: any) => {
              console.error('Error al aprobar la solicitud', error);
              this.snackBar.open('Error al aprobar la solicitud', 'Cerrar', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  cambiarEstadoAEnProceso(): void {
    if (this.soloDetalle) return;
    if (!this.prestamo.idPrestamo) {
      console.error('ID del préstamo no definido.');
      return;
    }
    const estadoEnProceso = this.estados.find(e => e.est_nombre === 'En proceso');
    if (!estadoEnProceso) {
      console.error('No se encontró el estado "En proceso".');
      return;
    }
    this.prestamoService.actualizarEstadoPrestamo(this.prestamo.idPrestamo, {
      estado: estadoEnProceso.est_id,
      fechaEntrega: new Date(),
      usr_cedula: this.authService.getCedula() || ''
    })
    .subscribe({
      next: (response: any) => {
        if (response.respuesta) {
          this.prestamo.estado = 'En proceso';
          this.prestamo.pre_actualizacion = new Date();
          this.dataUpdated = true;
          this.cdr.detectChanges();
          this.snackBar.open('Estado cambiado a "En proceso"', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        }
      },
      error: (error: any) => {
        console.error('Error al cambiar estado a "En proceso":', error);
        this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cambiarAEnPrestamo(): void {
    if (this.soloDetalle) return;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        titulo: 'Confirmar estado en préstamo',
        mensaje: '¿Estás seguro de marcar esta solicitud como "En préstamo"?',
        textoBotonConfirmar: 'Sí',
        textoBotonCancelar: 'No'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const estadoEnPrestamo = this.estados.find(e => e.est_nombre === 'En préstamo');
        if (estadoEnPrestamo && this.prestamo.idPrestamo !== undefined) {
          this.prestamoService.actualizarEstadoPrestamo(this.prestamo.idPrestamo, {
            estado: estadoEnPrestamo.est_id,
            fechaEntrega: new Date(),
            usr_cedula: this.authService.getCedula() || ''
          })
          .subscribe({
            next: (response: any) => {
              if (response.respuesta) {
                this.prestamo.estado = 'En préstamo';
                this.snackBar.open('Estado actualizado a "En préstamo"', 'Cerrar', { duration: 3000 });
                this.dialogRef.close(true);
              }
            },
            error: (error: any) => {
              console.error('Error al cambiar estado a "En préstamo":', error);
              this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  cambiarAPrestado(): void {
    if (this.soloDetalle) return;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        titulo: 'Confirmar préstamo',
        mensaje: '¿Estás seguro de marcar esta solicitud como "Prestado"?',
        textoBotonConfirmar: 'Sí',
        textoBotonCancelar: 'No'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const estadoPrestado = this.estados.find(e => e.est_nombre === 'Prestado');
        if (estadoPrestado && this.prestamo.idPrestamo !== undefined) {
          this.prestamoService.actualizarEstadoPrestamo(this.prestamo.idPrestamo, {
            estado: estadoPrestado.est_id,
            fechaEntrega: new Date(),
            usr_cedula: this.authService.getCedula() || ''
          })
          .subscribe({
            next: (response: any) => {
              if (response.respuesta) {
                this.prestamo.estado = 'Prestado';
                this.prestamo.pre_actualizacion = new Date();
                this.dataUpdated = true;
                this.cdr.detectChanges();
                this.snackBar.open('Estado actualizado a "Prestado"', 'Cerrar', { duration: 3000 });
                this.dialogRef.close(true);
              }
            },
            error: (error: any) => {
              console.error('Error al cambiar estado a "Prestado":', error);
              this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  cambiarAEntregado(): void {
    if (this.soloDetalle) return;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        titulo: 'Confirmar entrega',
        mensaje: '¿Estás seguro de marcar esta solicitud como "Entregado"?',
        textoBotonConfirmar: 'Sí',
        textoBotonCancelar: 'No'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const estadoEntregado = this.estados.find(e => e.est_nombre === 'Entregado');
        if (estadoEntregado && this.prestamo.idPrestamo !== undefined) {
          const estadoData = {
            estado: estadoEntregado.est_id,
            fechaEntrega: new Date(),
            usr_cedula: this.authService.getCedula() || ''
          };
          this.prestamoService.actualizarEstadoPrestamo(this.prestamo.idPrestamo, estadoData)
            .subscribe({
              next: (response: any) => {
                if (response.respuesta) {
                  this.prestamo.fechaEntrega = estadoData.fechaEntrega;
                  this.prestamo.estado = 'Entregado';
                  this.prestamo.pre_actualizacion = new Date();
                  this.dataUpdated = true;
                  this.cdr.detectChanges();
                  this.snackBar.open('Estado actualizado a "Entregado"', 'Cerrar', { duration: 3000 });
                  this.dialogRef.close(true);
                }
              },
              error: (error: any) => {
                console.error('Error al actualizar el estado', error);
                this.snackBar.open('Error al actualizar el estado', 'Cerrar', { duration: 3000 });
              }
            });
        }
      }
    });
  }

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
    // Si el index de la pestaña "Historial" es 1 (por ejemplo),
    // llamas al servicio cuando el usuario hace clic en la pestaña
    if (this.prestamo.idPrestamo !== undefined) {
      this.obtenerHistorialEstados(this.prestamo.idPrestamo);
    }
   
  } 

  close(): void {
    this.dialogRef.close(this.dataUpdated);
  }
}
