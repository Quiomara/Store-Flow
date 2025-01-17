import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PrestamoService } from '../../../services/prestamo.service';
import { Prestamo } from '../../../models/prestamo.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-instructor-history',
  templateUrl: './instructor-history.component.html',
  styleUrls: ['./instructor-history.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule]
})
export class InstructorHistoryComponent implements OnInit {
  prestamos: Prestamo[] = [];
  filteredPrestamos: Prestamo[] = [];
  searchId: number | null = null;
  searchEstado: string = '';
  estados: { est_id: number, est_nombre: string }[] = [];
  searchFecha: string = '';

  constructor(private prestamoService: PrestamoService, private authService: AuthService) {}

  ngOnInit(): void {
    console.log('Componente inicializado');
    const token = this.authService.getToken();
    const cedula = this.authService.getCedula();
    console.log('Token:', token);
    console.log('Cédula:', cedula);
    if (token && cedula) {
      this.getHistory();
      this.getEstados();
    } else {
      console.error('Token o cédula no disponibles');
    }
  }

  getHistory(): void {
    const cedula = this.authService.getCedula();
    console.log('Cédula obtenida:', cedula);
    if (cedula) {
      this.prestamoService.getPrestamosPorCedula(cedula).subscribe(
        (data: any) => {
          console.log('Datos obtenidos del servicio:', data);
          this.prestamos = data.map((item: any) => ({
            idPrestamo: item.pre_id,
            fechaHora: this.formatearFecha(item.pre_inicio), // Formatear fecha
            fechaEntrega: item.pre_fin ? this.formatearFecha(item.pre_fin) : '', // Formatear fecha si está disponible
            estado: item.est_nombre, // Usar el nombre del estado
            cedulaSolicitante: item.usr_cedula,
          }));
          this.filteredPrestamos = this.prestamos;
          console.log('Prestamos asignados:', this.prestamos);
        },
        (error) => {
          console.error('Error al obtener el historial de préstamos', error);
        }
      );
    }
  }

  getEstados(): void {
    this.prestamoService.getEstados().subscribe(
      (data: { est_id: number, est_nombre: string }[]) => {
        console.log('Estados obtenidos del servicio:', data);
        this.estados = data;
      },
      (error) => {
        console.error('Error al obtener los estados', error);
      }
    );
  }

  buscar(): void {
    console.log('Buscar - Estado:', this.searchEstado);
    console.log('Buscar - Prestamos:', this.prestamos);
    this.filteredPrestamos = this.prestamos;

    if (this.searchId !== null) {
      this.filteredPrestamos = this.filteredPrestamos.filter(prestamo => prestamo.idPrestamo === this.searchId);
    }
    if (this.searchEstado !== '') {
      this.filteredPrestamos = this.filteredPrestamos.filter(prestamo => prestamo.estado === this.searchEstado);
    }
    if (this.searchFecha !== '') {
      this.filteredPrestamos = this.filteredPrestamos.filter(prestamo => prestamo.fechaHora === this.searchFecha);
    }

    console.log('Resultados filtrados:', this.filteredPrestamos);
  }

  verDetalles(prestamo: Prestamo): void {
    // Lógica para mostrar detalles del préstamo
    console.log('Detalles del préstamo:', prestamo);
    alert(`Detalles del préstamo:\nID: ${prestamo.idPrestamo}\nEstado: ${prestamo.estado}\nFecha Inicio: ${prestamo.fechaHora}\nFecha Fin: ${prestamo.fechaEntrega}`);
  }

  formatearFecha(fecha: string): string {
    return fecha ? fecha.split('T')[0] : ''; // Devolver solo la parte de la fecha
  }
}






















