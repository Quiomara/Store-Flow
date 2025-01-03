import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PrestamoDetallesModalComponent } from '../prestamo-detalles-modal/prestamo-detalles-modal.component';

interface Solicitud {
  idPrestamo: string;
  solicitante: string;
  fechaHora: string;
  detallesPrestamo: { nombre: string; cantidad: number }[];
  estado: string;
  fechaEntrega?: string;
}

@Component({
  selector: 'app-warehouse-requests',
  templateUrl: './warehouse-requests.component.html',
  styleUrls: ['./warehouse-requests.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class WarehouseRequestsComponent {
  solicitudes: Solicitud[] = [];
  solicitudesVisibles: Solicitud[] = [];

  constructor(public dialog: MatDialog) {
    this.solicitudes.push({
      idPrestamo: this.generarIdSolicitud(),
      solicitante: 'Juan Perez',
      fechaHora: new Date().toLocaleString(),
      detallesPrestamo: [
        { nombre: 'Martillo', cantidad: 5 },
        { nombre: 'Destornillador', cantidad: 10 }
      ],
      estado: 'Creado'
    });
    this.actualizarSolicitudesVisibles();
  }

  generarIdSolicitud(): string {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
  }

  actualizarSolicitudesVisibles() {
    this.solicitudesVisibles = this.solicitudes.filter(solicitud => solicitud.estado !== 'Entregado' && solicitud.estado !== 'Cancelado');
  }

  actualizarEstadoSolicitud(solicitud: Solicitud, nuevoEstado: string) {
    solicitud.estado = nuevoEstado;
    this.actualizarSolicitudesVisibles();
    console.log(`Solicitud ${solicitud.idPrestamo} actualizada a: ${nuevoEstado}`);
  }

  aprobarSolicitud(solicitud: Solicitud) {
    this.actualizarEstadoSolicitud(solicitud, 'En proceso');
  }

  rechazarSolicitud(solicitud: Solicitud) {
    this.actualizarEstadoSolicitud(solicitud, 'Cancelado');
  }

  marcarComoEnPrestamo(solicitud: Solicitud) {
    this.actualizarEstadoSolicitud(solicitud, 'En préstamo');
  }

  marcarComoEntregado(solicitud: Solicitud) {
    solicitud.estado = 'Entregado';
    solicitud.fechaEntrega = new Date().toLocaleString();
    this.actualizarSolicitudesVisibles();
    console.log('Solicitud entregada:', solicitud);
  }

  verDetalles(solicitud: Solicitud) {
    this.dialog.open(PrestamoDetallesModalComponent, {
      width: '80%',  // Establece el tamaño del modal aquí
      data: {
        solicitud,
        actualizarEstado: this.actualizarEstadoSolicitud.bind(this)
      }
    });
  }
}



