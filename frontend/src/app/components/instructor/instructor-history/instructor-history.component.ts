import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PrestamoService } from '../../../services/prestamo.service';
import { Prestamo } from '../../../models/prestamo.model';

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
  estados: string[] = [];
  searchFecha: string = '';

  constructor(private prestamoService: PrestamoService) {}

  ngOnInit(): void {
    this.getHistory();
    this.getEstados();
  }

  getHistory(): void {
    this.prestamoService.getHistory().subscribe(
      (data: Prestamo[]) => {
        this.prestamos = data;
        this.filteredPrestamos = data;
      },
      (error) => {
        console.error('Error al obtener el historial de préstamos', error);
      }
    );
  }

  getEstados(): void {
    this.prestamoService.getEstados().subscribe(
      (data: string[]) => {
        this.estados = data;
      },
      (error) => {
        console.error('Error al obtener los estados', error);
      }
    );
  }

  buscar(): void {
    this.filteredPrestamos = this.prestamos;

    if (this.searchId !== null) {
      this.filteredPrestamos = this.filteredPrestamos.filter(prestamo => prestamo.idPrestamo === this.searchId);
    }
    if (this.searchEstado !== '') {
      this.filteredPrestamos = this.filteredPrestamos.filter(prestamo => prestamo.estado === this.searchEstado);
    }
    if (this.searchFecha !== '') {
      this.filteredPrestamos = this.filteredPrestamos.filter(prestamo => prestamo.fecha === this.searchFecha);
    }
  }
}


