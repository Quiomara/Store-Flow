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
 * @component PrestamoDetalleModalComponent
 * Modal que muestra los detalles de un préstamo.
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
    if (this.puedeEditarCantidad) {
      return this.displayedColumnsBase; // ['nombre','cantidad','acciones']
    }
    return ['nombre', 'cantidad'];
  }

  /**
   * Constructor del componente PrestamoDetalleModalComponent.
   * @param {any} data Datos que se pasan al abrir el modal.
   * @param {MatDialogRef<PrestamoDetalleModalComponent>} dialogRef Referencia al diálogo.
   * @param {PrestamoService} prestamoService Servicio de préstamos.
   * @param {ElementoService} elementoService Servicio de elementos.
   * @param {AuthService} authService Servicio de autenticación.
   * @param {ChangeDetectorRef} cdr Detector de cambios.
   * @param {MatDialog} dialog Diálogo de confirmación.
   * @param {MatSnackBar} snackBar Servicio para mostrar notificaciones.
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

    const userType = this.authService.getUserType(); // "Instructor", "Almacén", etc.
    const userId = this.authService.getUserId();     // 2, 3, etc.

    // Lógica para cambiar estado
    this.puedeCambiarEstado = (userType === 'Almacén' && userId === 3);

    if (this.soloDetalle) {
      this.puedeCambiarEstado = false;
    }

    // Lógica para editar la cantidad:
    this.puedeEditarCantidad = this.prestamo.estado === 'Creado' && userType !== 'Almacén';
  }

  /**
 * Obtiene los estados disponibles para los préstamos.
 */
  obtenerEstados(): void {
    this.prestamoService.getEstados().subscribe({
      next: (estados: Estado[]) => {
        this.estados = estados;
        this.setEstadoInicial();
      },
      error: (error) => {
        // Eliminar console.log y agregar manejo adecuado de errores
        console.error('Error al obtener estados', error);
      }
    });
  }

  /**
   * Establece el estado inicial del préstamo basado en el estado actual.
   */
  private setEstadoInicial(): void {
    if (this.prestamo.estado) {
      const estadoActual = this.estados.find(e => e.est_nombre === this.prestamo.estado);
      this.estadoSeleccionadoId = estadoActual?.est_id ?? null;
    }
  }

  /**
   * Obtiene los detalles de un préstamo.
   * @param {number} prestamoId ID del préstamo para obtener los detalles.
   */
  obtenerPrestamoDetalles(prestamoId: number): void {
    this.prestamoService.getPrestamoDetalles(prestamoId).subscribe({
      next: (response: any) => {
        if (response?.data) {
          // Mapeamos elementos y corregimos la cantidad actual si el préstamo está cancelado
          this.prestamo.elementos = response.data.map((item: any): EditableElemento => ({
            ele_id: Number(item.ele_id),
            ele_nombre: item.nombre || '',
            ele_cantidad_total: Number(item.ele_cantidad_total),
            ele_cantidad_actual: response.estadoPrestamo === 'Cancelado' 
              ? Number(item.ele_cantidad_actual) + Number(item.pre_ele_cantidad_prestado) // 🔥 Se ajusta la cantidad
              : Number(item.ele_cantidad_actual),
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
      error: (error: any) => {
        console.error('Error al obtener detalles', error);
      }
    });
  }
   

  /**
   * Obtiene el historial de estados de un préstamo.
   * @param {number} pre_id ID del préstamo para obtener el historial de estados.
   */
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
        // Eliminar console.log y agregar manejo adecuado de errores
        console.error('Error al obtener historial de estados', error);
      }
    });
  }

  /**
  * Aprueba la solicitud y cambia el estado del préstamo a "En proceso".
  * Si no estamos en modo soloDetalle, abre un diálogo de confirmación antes de ejecutar la acción.
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
        // Buscar el estado "En proceso"
        const estadoEnProceso = this.estados.find(e => e.est_nombre === 'En proceso');

        if (estadoEnProceso && this.prestamo.idPrestamo) {
          this.prestamoService.actualizarEstadoPrestamo(this.prestamo.idPrestamo, {
            estado: estadoEnProceso.est_id,
            fechaEntrega: new Date(),
            usr_cedula: this.authService.getCedula() || ''
          }).subscribe({
            next: (response: any) => {
              if (response.respuesta) {
                // Actualiza el estado del préstamo
                this.prestamo.estado = 'En proceso';

                // Ordena el historial de estados
                const historialOrdenado = (response.historial_estados || []).sort(
                  (a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                );

                // Asigna el historial
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
   * Cambia el estado del préstamo a "En proceso" y cierra el modal.
   * Si no estamos en modo soloDetalle, ejecuta la acción directamente.
   */
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
          this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
        }
      });
  }


  /**
 * Cambia el estado del préstamo a "En préstamo" después de confirmar la acción en un diálogo.
 * Si no estamos en modo soloDetalle, ejecuta la acción de actualización.
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
   * Cambia el estado del préstamo a "Prestado" después de confirmar la acción en un diálogo.
   * Si no estamos en modo soloDetalle, ejecuta la acción de actualización.
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
   * Cambia el estado del préstamo a "Entregado" después de confirmar la acción en un diálogo.
   * Si no estamos en modo soloDetalle, ejecuta la acción de actualización.
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
                  this.prestamo.fechaEntrega = new Date(response.fechaEntrega); // Actualizar fecha de entrega
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
   * Habilita el modo de edición para la cantidad de un elemento.
   * Si no estamos en modo soloDetalle, permite la edición.
   * @param item - El elemento cuyo campo de cantidad se desea editar.
   */
  enableEditing(item: EditableElemento): void {
    if (this.soloDetalle) return;
    item.editing = true;
    this.cdr.detectChanges();
  }

  /**
   * Cancela la edición de la cantidad de un elemento y restaura el valor original.
   * Si no estamos en modo soloDetalle, restaura los cambios.
   * @param item - El elemento cuyo campo de cantidad se desea cancelar.
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
   * Guarda los cambios realizados en el elemento del préstamo, actualizando la cantidad prestada y el stock.
   * Si no estamos en modo soloDetalle, se guardan los cambios y se realiza la actualización.
   * @param item - El elemento cuyo cambio de cantidad se desea guardar.
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
      
      // Convertimos la cantidad ingresada a número
      const nuevaCantidad = Number(item.pre_ele_cantidad_prestado);
      
      // Llamamos al método en elementoService con los 3 parámetros requeridos
      this.elementoService.actualizarCantidadPrestado(pre_id, item.ele_id, nuevaCantidad)
        .subscribe({
          next: (response: any) => {
            console.log("Respuesta del backend al actualizar cantidad:", response);
            if (!response.respuesta) {
              this.snackBar.open('Error al actualizar la cantidad', 'Cerrar', { duration: 3000 });
              return;
            }
            // Actualizamos la vista con el stock actualizado que retorna el backend
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
            console.error("Error en actualizarCantidadPrestado:", error);
            this.snackBar.open('Error al actualizar la cantidad', 'Cerrar', { duration: 3000 });
          }
        });
    }
  }
  
  
  /**
   * Retorna la clase CSS correspondiente para el estado del préstamo.
   * @param estado - El estado del préstamo (por ejemplo, 'En proceso', 'Cancelado', etc.).
   * @returns - La clase CSS que representa el estado.
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
   * Formatea una fecha en formato ISO (YYYY-MM-DD).
   * Si la fecha no es válida, retorna 'Fecha no válida'.
   * @param fecha - La fecha en formato de cadena a formatear.
   * @returns - La fecha formateada como una cadena o 'Fecha no válida' si la fecha no es válida.
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
   * Obtiene el historial de estados cuando se cambia de pestaña.
   * @param event - El evento de cambio de pestaña.
   */
  onTabChange(event: MatTabChangeEvent): void {
    if (this.prestamo.idPrestamo !== undefined) {
      this.obtenerHistorialEstados(this.prestamo.idPrestamo);
    }
  }

  /**
   * Cierra el modal y devuelve el estado de si los datos fueron actualizados.
   */
  close(): void {
    this.dialogRef.close(this.dataUpdated);
  }
}