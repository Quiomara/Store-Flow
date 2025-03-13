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

/**
 * Componente modal que muestra los detalles de un préstamo.
 *
 * @remarks
 * Permite visualizar y, en algunos casos, modificar los detalles de un préstamo, incluyendo la edición
 * de la cantidad de elementos prestados, la actualización de estados y la visualización del historial de acciones.
 */
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
  prestamo: Prestamo; // Objeto préstamo que contiene los detalles.

  displayedColumnsBase: string[] = ['nombre', 'cantidad', 'acciones']; // Columnas base de la tabla.
  originalItems: EditableElemento[] = []; // Lista de elementos originales para restauración en caso de cancelar edición.
  puedeCambiarEstado = false;           // Indica si el usuario puede cambiar el estado del préstamo.
  estados: Estado[] = [];               // Lista de estados disponibles.
  estadoSeleccionadoId: number | null = null; // Estado seleccionado.
  dataUpdated = false;                  // Indica si los datos han sido actualizados.

  puedeEditarCantidad = false;          // Flag que indica si el usuario puede editar la cantidad.
  soloDetalle: boolean = false;         // Indica si el modal está en modo solo detalle (lectura).
  incluirHistorial: boolean = false;    // Indica si se debe incluir la pestaña de historial.
  historialAcciones: any[] = [];        // Historial de acciones del préstamo.

  /**
   * Getter para determinar las columnas a mostrar en la tabla.
   *
   * @returns Las columnas que se deben mostrar, incluyendo 'acciones' si se permite editar.
   */
  get columnsToDisplay(): string[] {
    return this.puedeEditarCantidad ? this.displayedColumnsBase : ['nombre', 'cantidad'];
  }

  /**
   * Constructor del componente PrestamoDetalleModalComponent.
   *
   * @param data - Datos inyectados al abrir el modal, que incluyen el préstamo y opciones de visualización.
   * @param dialogRef - Referencia al diálogo modal.
   * @param prestamoService - Servicio para operaciones relacionadas con préstamos.
   * @param elementoService - Servicio para operaciones relacionadas con elementos.
   * @param authService - Servicio de autenticación.
   * @param cdr - Detector de cambios para actualizar la vista.
   * @param dialog - Servicio para abrir diálogos de confirmación.
   * @param snackBar - Servicio para mostrar notificaciones.
   */
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
    if (data.historialAcciones) {
      this.historialAcciones = data.historialAcciones;
    }
  }

  /**
   * ngOnInit - Inicializa el componente.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.initComponent();
  }

  /**
   * initComponent - Inicializa la carga de detalles, historial y estados del préstamo.
   *
   * @returns void
   */
  private initComponent(): void {
    if (this.prestamo.idPrestamo) {
      this.obtenerPrestamoDetalles(this.prestamo.idPrestamo);
      if (this.incluirHistorial) {
        this.obtenerHistorialEstados(this.prestamo.idPrestamo);
      }
    }
    this.obtenerEstados();

    const userType = this.authService.getUserType();
    const userId = this.authService.getUserId();

    this.puedeCambiarEstado = (userType === 'Almacén' && userId === 3);
    if (this.soloDetalle) {
      this.puedeCambiarEstado = false;
    }
    this.puedeEditarCantidad = this.prestamo.estado === 'Creado' && userType !== 'Almacén';
  }

  /**
   * obtenerEstados - Obtiene los estados disponibles para los préstamos.
   *
   * @returns void
   */
  obtenerEstados(): void {
    this.prestamoService.getEstados().subscribe({
      next: (estados: Estado[]) => {
        this.estados = estados;
        this.setEstadoInicial();
      },
      error: (error) => {
        // Manejo de errores adecuado sin usar console.log.
      }
    });
  }

  /**
   * setEstadoInicial - Establece el estado inicial del préstamo basado en el estado actual.
   *
   * @returns void
   */
  private setEstadoInicial(): void {
    if (this.prestamo.estado) {
      const estadoActual = this.estados.find(e => e.est_nombre === this.prestamo.estado);
      this.estadoSeleccionadoId = estadoActual?.est_id ?? null;
    }
  }

  /**
   * obtenerPrestamoDetalles - Obtiene los detalles de un préstamo a partir de su ID.
   *
   * @param prestamoId - ID del préstamo.
   * @returns void
   */
  obtenerPrestamoDetalles(prestamoId: number): void {
    this.prestamoService.getPrestamoDetalles(prestamoId).subscribe({
      next: (response: any) => {
        if (response?.data) {
          this.prestamo.elementos = response.data.map((item: any): EditableElemento => ({
            ele_id: Number(item.ele_id),
            ele_nombre: item.nombre || '',
            ele_cantidad_total: Number(item.ele_cantidad_total),
            ele_cantidad_actual: response.estadoPrestamo === 'Cancelado'
              ? Number(item.ele_cantidad_actual) + Number(item.pre_ele_cantidad_prestado)
              : Number(item.ele_cantidad_actual),
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
      error: (error: any) => {
        // Manejo de errores adecuado sin usar console.log.
      }
    });
  }

  /**
   * obtenerHistorialEstados - Obtiene el historial de estados de un préstamo.
   *
   * @param pre_id - ID del préstamo.
   * @returns void
   */
  obtenerHistorialEstados(pre_id: number): void {
    this.prestamoService.getHistorialEstados(pre_id).subscribe({
      next: (response: any) => {
        if (response.respuesta && response.data) {
          this.historialAcciones = response.data;
          this.historialAcciones.sort(
            (a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        // Manejo de errores adecuado sin usar console.log.
      }
    });
  }

  /**
   * aprobarSolicitud - Aprueba la solicitud y cambia el estado del préstamo a "En proceso" tras confirmación.
   *
   * @returns void
   */
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
        const estadoEnProceso = this.estados.find(e => e.est_nombre === 'En proceso');
        if (estadoEnProceso && this.prestamo.idPrestamo) {
          this.prestamoService.actualizarEstadoPrestamo(this.prestamo.idPrestamo, {
            estado: estadoEnProceso.est_id,
            fechaEntrega: new Date(),
            usr_cedula: this.authService.getCedula() || ''
          }).subscribe({
            next: (response: any) => {
              if (response.respuesta) {
                this.prestamo.estado = 'En proceso';
                const historialOrdenado = (response.historial_estados || []).sort(
                  (a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                );
                this.historialAcciones = historialOrdenado;
                this.prestamo.historial_estados = historialOrdenado;
                this.dataUpdated = true;
                this.cdr.detectChanges();
                this.snackBar.open('Solicitud aprobada correctamente', 'Cerrar', { duration: 3000 });
                this.dialogRef.close(true);
              }
            },
            error: (error: any) => {
              this.snackBar.open('Error al aprobar la solicitud', 'Cerrar', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  /**
   * cambiarEstadoAEnProceso - Cambia el estado del préstamo a "En proceso" y cierra el modal.
   *
   * @returns void
   */
  cambiarEstadoAEnProceso(): void {
    if (this.soloDetalle) return;
    if (!this.prestamo.idPrestamo) {
      return;
    }
    const estadoEnProceso = this.estados.find(e => e.est_nombre === 'En proceso');
    if (!estadoEnProceso) {
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
          this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * cambiarAEnPrestamo - Cambia el estado del préstamo a "En préstamo" tras confirmación.
   *
   * @returns void
   */
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
                this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
              }
            });
        }
      }
    });
  }

  /**
   * cambiarAPrestado - Cambia el estado del préstamo a "Prestado" tras confirmación.
   *
   * @returns void
   */
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
                this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
              }
            });
        }
      }
    });
  }

  /**
   * cambiarAEntregado - Cambia el estado del préstamo a "Entregado" tras confirmación.
   *
   * @returns void
   */
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
        if (this.prestamo.idPrestamo !== undefined) {
          this.prestamoService.entregarPrestamo(this.prestamo.idPrestamo)
            .subscribe({
              next: (response: any) => {
                if (response.success) {
                  this.prestamo.fechaEntrega = new Date(response.fechaEntrega);
                  this.prestamo.estado = 'Entregado';
                  this.prestamo.pre_actualizacion = new Date();
                  this.dataUpdated = true;
                  this.cdr.detectChanges();
                  this.snackBar.open('Estado actualizado a "Entregado"', 'Cerrar', { duration: 3000 });
                  this.dialogRef.close(true);
                }
              },
              error: () => {
                this.snackBar.open('Error al actualizar el estado', 'Cerrar', { duration: 3000 });
              }
            });
        }
      }
    });
  }

  /**
   * enableEditing - Habilita el modo de edición para la cantidad de un elemento.
   *
   * @param item - Elemento cuyo campo de cantidad se desea editar.
   * @returns void
   */
  enableEditing(item: EditableElemento): void {
    if (this.soloDetalle) return;
    item.editing = true;
    this.cdr.detectChanges();
  }

  /**
   * cancelEditing - Cancela la edición de la cantidad de un elemento y restaura el valor original.
   *
   * @param item - Elemento cuyo campo de cantidad se desea cancelar.
   * @returns void
   */
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

  /**
   * saveChanges - Guarda los cambios realizados en un elemento, actualizando la cantidad prestada y el stock.
   *
   * @param item - Elemento con cambios en la cantidad a guardar.
   * @returns void
   */
  saveChanges(item: EditableElemento): void {
    if (this.soloDetalle) return;
    if (item.editing) {
      item.editing = false;
      const pre_id = this.prestamo.idPrestamo;
      if (!pre_id) {
        this.snackBar.open('ID del préstamo no definido', 'Cerrar', { duration: 3000 });
        return;
      }
      const nuevaCantidad = Number(item.pre_ele_cantidad_prestado);
      this.elementoService.actualizarCantidadPrestado(pre_id, item.ele_id, nuevaCantidad)
        .subscribe({
          next: (response: any) => {
            if (!response.respuesta) {
              this.snackBar.open('Error al actualizar la cantidad', 'Cerrar', { duration: 3000 });
              return;
            }
            const stockActualizado = response.data.ele_cantidad_actual;
            const index = this.prestamo.elementos.findIndex(e => e.ele_id === item.ele_id);
            if (index !== -1) {
              this.prestamo.elementos[index].ele_cantidad_actual = stockActualizado;
            }
            this.dataUpdated = true;
            this.cdr.detectChanges();
            this.snackBar.open('Cambios guardados correctamente', 'Cerrar', { duration: 3000 });
          },
          error: (error: any) => {
            this.snackBar.open('Error al actualizar la cantidad', 'Cerrar', { duration: 3000 });
          }
        });
    }
  }

  /**
   * getEstadoClass - Retorna la clase CSS correspondiente para el estado del préstamo.
   *
   * @param estado - Estado del préstamo.
   * @returns La clase CSS representativa del estado.
   */
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

  /**
   * formatearFecha - Formatea una fecha en formato ISO (YYYY-MM-DD).
   *
   * @param fecha - Fecha en formato string a formatear.
   * @returns La fecha formateada o 'Fecha no válida' si es inválida.
   */
  formatearFecha(fecha: string | undefined): string {
    if (!fecha) {
      return 'Fecha no válida';
    }
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      return 'Fecha no válida';
    }
    return date.toISOString().split('T')[0];
  }

  /**
   * onTabChange - Obtiene el historial de estados al cambiar de pestaña.
   *
   * @param event - Evento de cambio de pestaña.
   * @returns void
   */
  onTabChange(event: MatTabChangeEvent): void {
    if (this.prestamo.idPrestamo !== undefined) {
      this.obtenerHistorialEstados(this.prestamo.idPrestamo);
    }
  }

  /**
   * close - Cierra el modal y devuelve el estado de actualización de los datos.
   *
   * @returns void
   */
  close(): void {
    this.dialogRef.close(this.dataUpdated);
  }
}
