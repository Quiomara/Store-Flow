import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PrestamoDetallesModalComponent } from '../prestamo-detalles-modal/prestamo-detalles-modal.component';
import { PrestamoService } from '../../../services/prestamo.service';
import { Prestamo } from '../../../models/prestamo.model';
import { PrestamoUpdate } from '../../../models/prestamo-update.model'; // Importar desde el archivo correcto
import { UserService } from '../../../services/user.service';

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

  constructor(private prestamoService: PrestamoService, private userService: UserService, public dialog: MatDialog) {}

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
      pre_fin: solicitud.fechaEntrega ? solicitud.fechaEntrega.toString() : undefined, // Usar toString
      usr_cedula: solicitud.cedulaSolicitante!,
      est_id: this.getEstadoId(nuevoEstado),
      ele_id: solicitud.elementos[0].ele_id,  // Asegúrate de ajustar esto según tu lógica
      ele_cantidad: solicitud.elementos[0].ele_cantidad  // Asegúrate de ajustar esto según tu lógica
    };

    this.prestamoService.updatePrestamo(updateData).subscribe(
      (data: Prestamo) => {
        this.actualizarSolicitudesVisibles();
        console.log(`Solicitud ${solicitud.idPrestamo} actualizada a: ${nuevoEstado}`);
      },
      (error) => {
        console.error('Error al actualizar la solicitud', error);
      }
    );
  }

  aprobarSolicitud(solicitud: Prestamo): void {
    this.actualizarEstadoSolicitud(solicitud, 'En proceso');
  }

  rechazarSolicitud(solicitud: Prestamo): void {
    this.actualizarEstadoSolicitud(solicitud, 'Cancelado');
  }

  marcarComoEnPrestamo(solicitud: Prestamo): void {
    this.actualizarEstadoSolicitud(solicitud, 'En préstamo');
  }

  marcarComoEntregado(solicitud: Prestamo): void {
    solicitud.estado = 'Entregado';
    solicitud.fechaEntrega = new Date().toLocaleString();
    this.actualizarEstadoSolicitud(solicitud, 'Entregado');
  }

  verDetalles(solicitud: Prestamo): void {
    this.dialog.open(PrestamoDetallesModalComponent, {
      width: '80%',  // Establece el tamaño del modal aquí
      data: {
        solicitud,
        actualizarEstado: this.actualizarEstadoSolicitud.bind(this)
      }
    });
  }

  private getEstadoId(estado: string): number {
    // Implementa tu lógica para convertir el estado en un ID numérico
    switch (estado) {
      case 'En proceso':
        return 1; // Ejemplo, ajusta según tu lógica
      case 'Cancelado':
        return 2; // Ejemplo, ajusta según tu lógica
      case 'En préstamo':
        return 3; // Ejemplo, ajusta según tu lógica
      case 'Entregado':
        return 4; // Ejemplo, ajusta según tu lógica
      default:
        return 0; // Estado desconocido
    }
  }
}











