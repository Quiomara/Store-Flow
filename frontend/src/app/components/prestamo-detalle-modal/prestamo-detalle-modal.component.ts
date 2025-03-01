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
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../warehouse/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  prestamo: Prestamo;
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
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // Configurar el préstamo desde los datos recibidos
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
  }

  ngOnInit(): void {
    this.initComponent();
  }

  private initComponent(): void {
    // Verificamos si hay un ID de préstamo definido y obtenemos los detalles
    if (this.prestamo.idPrestamo) {
      this.obtenerPrestamoDetalles(this.prestamo.idPrestamo);
    }
    
    const userType = this.authService.getUserType();
    const userId = this.authService.getUserId();

    // Definir si el usuario puede cambiar el estado (solo 'Almacén' con id 3)
    this.puedeCambiarEstado = (userType === 'Almacén' && userId === 3);
    
    // Obtener los posibles estados
    this.obtenerEstados();

    // Configuración de columnas según el tipo de usuario
    this.displayedColumns = (userType === 'Almacén') ? ['nombre', 'cantidad'] : ['nombre', 'cantidad', 'acciones'];
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
    if (!this.estadoSeleccionadoId) return;
    
    const nuevoEstado = this.estados.find(e => e.est_id === this.estadoSeleccionadoId);
    if (!nuevoEstado) return;
  
    const mensaje = `¿Seguro que deseas cambiar el estado a "${nuevoEstado.est_nombre}"?`;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        titulo: 'Confirmar cambio de estado',
        mensaje: mensaje,
        textoBotonConfirmar: 'Aceptar',
        textoBotonCancelar: 'Cancelar'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.prestamo.idPrestamo) {
        this.prestamoService.actualizarEstadoPrestamo(this.prestamo.idPrestamo, {
          estado: nuevoEstado.est_id,
          // No actualizar la fecha de inicio, solo la fechaEntrega
          fechaEntrega: new Date()
        }).subscribe({
          next: (response) => {
            if (response.respuesta) {
              this.prestamo.estado = nuevoEstado.est_nombre;
              this.dataUpdated = true;
              this.cdr.detectChanges();
              this.snackBar.open(`Estado actualizado a "${nuevoEstado.est_nombre}"`, 'Cerrar', { duration: 3000 });
            }
          },
          error: (error) => {
            console.error('Error al actualizar el estado', error);
            this.snackBar.open('Error al actualizar el estado', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }
  
  
  aprobarSolicitud(): void {
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
            fechaEntrega: new Date()
          }).subscribe({
            next: (response) => {
              if (response.respuesta) {
                this.prestamo.estado = 'En proceso';
                this.dataUpdated = true;
                this.cdr.detectChanges();
                this.snackBar.open('Solicitud aprobada correctamente', 'Cerrar', { duration: 3000 });
              }
            },
            error: (error) => {
              console.error('Error al aprobar la solicitud', error);
              this.snackBar.open('Error al aprobar la solicitud', 'Cerrar', { duration: 3000 });
            }
          });
        }
      }
    });
  }


  cambiarEstadoAEnProceso(): void {
    if (!this.prestamo.idPrestamo) {
      console.error('ID del préstamo no definido.');
      return;
    }  
  
    const estadoEnProceso = this.estados.find(e => e.est_nombre === 'En proceso');
    if (!estadoEnProceso) {
      console.error('No se encontró el estado "En proceso".');
      return;
    }
  
    const fechaEntrega = new Date(); // Mantén la fecha como un objeto Date
  
    this.prestamoService.actualizarEstadoPrestamo(
      this.prestamo.idPrestamo,
      { estado: estadoEnProceso.est_id, fechaEntrega: fechaEntrega } // Aquí pasas un objeto Date
    ).subscribe({
      next: (response) => {
        if (response.respuesta) {
          this.prestamo.estado = 'En proceso';
          // Actualizar la fecha de última actualización
          this.prestamo.pre_actualizacion = new Date();
          this.dataUpdated = true;
          this.cdr.detectChanges();
  
          // Si necesitas mostrar la fecha en formato día/mes/año en el frontend
          const fechaFormateada = fechaEntrega.toLocaleDateString('es-CO'); // Formato día/mes/año
          console.log(fechaFormateada); // Puedes usar esta fecha para mostrarla
  
          this.snackBar.open('Estado cambiado a "En proceso"', 'Cerrar', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error al cambiar estado a "En proceso":', error);
        this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
      }
    });
  }


  cambiarAEnPrestamo(): void {
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
        if (estadoEnPrestamo && this.prestamo.idPrestamo !== undefined) { // Verificar que idPrestamo esté definido
          this.prestamoService.actualizarEstadoPrestamo(this.prestamo.idPrestamo, {
            estado: estadoEnPrestamo.est_id,
            fechaEntrega: new Date()
          }).subscribe({
            next: (response) => {
              if (response.respuesta) {
                this.prestamo.estado = 'En préstamo';
                this.snackBar.open('Estado actualizado a "En préstamo"', 'Cerrar', { duration: 3000 });
              }
            },
            error: (error) => {
              console.error('Error al cambiar estado a "En préstamo":', error);
              this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
            }
          });
        }
      }
    });
  }
  
  cambiarAEntregado(): void {
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
        if (estadoEntregado && this.prestamo.idPrestamo !== undefined) { // Verificar que idPrestamo esté definido
          // Crear un objeto con las propiedades correctas
          const estadoData = {
            estado: estadoEntregado.est_id,  // El ID del estado "Entregado"
            fechaEntrega: new Date() // Ahora es un objeto Date, no una cadena
          };
  
          this.prestamoService.actualizarEstadoPrestamo(this.prestamo.idPrestamo, estadoData)
            .subscribe({
              next: (response) => {
                if (response.respuesta) {
                  // Actualizar los campos en el frontend
                  this.prestamo.fechaEntrega = estadoData.fechaEntrega; // Esto es ahora un objeto Date
                  this.prestamo.estado = 'Entregado';
                  this.prestamo.pre_actualizacion = new Date();
                  this.dataUpdated = true;
                  this.cdr.detectChanges();
                  this.snackBar.open('Estado actualizado a "Entregado"', 'Cerrar', { duration: 3000 });
                }
              },
              error: (error) => {
                console.error('Error al actualizar el estado', error);
                this.snackBar.open('Error al actualizar el estado', 'Cerrar', { duration: 3000 });
              }
            });
        }
      }
    });
  }
  
  

  private getMensajeConfirmacion(estado: string): string {
    switch (estado) {
      case 'En proceso':
        return '¿Estás seguro de aprobar esta solicitud?';
      case 'En préstamo':
        return '¿Estás seguro de marcar esta solicitud como "En préstamo"?';
      case 'Entregado':
        return '¿Estás seguro de marcar esta solicitud como "Entregado"?';
      default:
        return '¿Estás seguro de cambiar el estado de esta solicitud?';
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

      this.prestamoService.updatePrestamoElemento(updatePrestamoElemento).subscribe({
        next: () => {
          this.elementoService.actualizarStock(updateStock).subscribe({
            next: () => {
              this.dataUpdated = true;
              this.cdr.detectChanges();
              this.snackBar.open('Cambios guardados correctamente', 'Cerrar', { duration: 3000 });
            },
            error: (error) => {
              console.error('Error actualizando stock', error);
              this.snackBar.open('Error al actualizar el stock', 'Cerrar', { duration: 3000 });
            }
          });
        },
        error: (error) => {
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
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  close(): void {
    this.dialogRef.close(this.dataUpdated);
  }
}