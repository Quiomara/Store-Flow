import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PrestamoDetallesModalComponent } from '../prestamo-detalles-modal/prestamo-detalles-modal.component';
import { PrestamoService } from '../../../services/prestamo.service';
import { Prestamo } from '../../../models/prestamo.model';
import { PrestamoUpdate } from '../../../models/prestamo-update.model';
import { UserService } from '../../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar'; // Para mostrar mensajes de confirmación

@Component({
  selector: 'app-warehouse-requests',
  templateUrl: './warehouse-requests.component.html',
  styleUrls: ['./warehouse-requests.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class WarehouseRequestsComponent implements OnInit {
  solicitudes: Prestamo[] = [];
  solicitudesVisibles: Prestamo[] = [];

  constructor(
    private prestamoService: PrestamoService,
    private userService: UserService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar // Para mostrar mensajes
  ) {}

  ngOnInit(): void {
    this.obtenerSolicitudes();
  }

  obtenerSolicitudes(): void {
    this.prestamoService.getPrestamos().subscribe(
      async (data: Prestamo[]) => {
        if (Array.isArray(data)) {
          for (let prestamo of data) {
            const usuario = await this.userService.getUsuarioByCedula(prestamo.cedulaSolicitante).toPromise();
            if (usuario) {
              prestamo.solicitante = `${usuario.primerNombre} ${usuario.primerApellido}`;
            } else {
              prestamo.solicitante = 'Usuario desconocido';
            }
          }
          this.solicitudes = data;
          this.actualizarSolicitudesVisibles();
        } else {
          console.error('Data received is not an array', data);
        }
      },
      (error) => {
        console.error('Error al obtener solicitudes', error);
      }
    );
  }

  actualizarSolicitudesVisibles(): void {
    if (!Array.isArray(this.solicitudes)) {
      console.error('Solicitudes is not an array', this.solicitudes);
      this.solicitudes = [];
    }
    this.solicitudesVisibles = this.solicitudes.filter(
      (solicitud) => solicitud.estado !== 'Entregado' && solicitud.estado !== 'Cancelado'
    );
  }

  actualizarEstadoSolicitud(solicitud: Prestamo, nuevoEstado: string): void {
    const updateData: PrestamoUpdate = {
      pre_id: solicitud.idPrestamo!,
      pre_fin: solicitud.fechaEntrega ? solicitud.fechaEntrega.toString() : undefined,
      usr_cedula: solicitud.cedulaSolicitante!,
      est_id: this.getEstadoId(nuevoEstado),
      ele_id: solicitud.elementos[0].ele_id,
      ele_cantidad: solicitud.elementos[0].ele_cantidad_actual,
      pre_ele_cantidad_prestado: (solicitud.elementos[0] as any).pre_ele_cantidad_prestado
    };

    this.prestamoService.updatePrestamo(updateData).subscribe(
      () => {
        this.snackBar.open(`Solicitud ${nuevoEstado.toLowerCase()} con éxito`, 'Cerrar', {
          duration: 3000,
        });
        this.obtenerSolicitudes(); // Refrescar la lista
      },
      (error: HttpErrorResponse) => {
        this.snackBar.open(`Error al actualizar el estado: ${error.message}`, 'Cerrar', {
          duration: 3000,
        });
      }
    );
  }

  aprobarSolicitud(solicitud: Prestamo): void {
    if (confirm('¿Estás seguro de aprobar esta solicitud?')) {
      this.actualizarEstadoSolicitud(solicitud, 'En proceso');
    }
  }

  rechazarSolicitud(solicitud: Prestamo): void {
    if (confirm('¿Estás seguro de rechazar esta solicitud?')) {
      this.actualizarEstadoSolicitud(solicitud, 'Cancelado');
    }
  }

  marcarComoEnPrestamo(solicitud: Prestamo): void {
    if (confirm('¿Estás seguro de marcar esta solicitud como "En préstamo"?')) {
      this.actualizarEstadoSolicitud(solicitud, 'En préstamo');
    }
  }

  marcarComoEntregado(solicitud: Prestamo): void {
    if (confirm('¿Estás seguro de marcar esta solicitud como "Entregado"?')) {
      this.actualizarEstadoSolicitud(solicitud, 'Entregado');
    }
  }

  verDetalles(solicitud: Prestamo): void {
    this.dialog.open(PrestamoDetallesModalComponent, {
      width: '80%',
      data: {
        solicitud,
        actualizarEstado: this.actualizarEstadoSolicitud.bind(this)
      }
    });
  }

  private getEstadoId(estado: string): number {
    switch (estado) {
      case 'En proceso':
        return 1;
      case 'Cancelado':
        return 2;
      case 'En préstamo':
        return 3;
      case 'Entregado':
        return 4;
      default:
        return 0;
    }
  }
}