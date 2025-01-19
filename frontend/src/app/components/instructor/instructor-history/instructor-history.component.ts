import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PrestamoService } from '../../../services/prestamo.service';
import { Prestamo } from '../../../models/prestamo.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-instructor-history',
  templateUrl: './instructor-history.component.html',
  styleUrls: ['./instructor-history.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSnackBarModule
  ]
})

export class InstructorHistoryComponent implements OnInit {
  searchForm: FormGroup;
  prestamos: Prestamo[] = [];
  filteredPrestamos: Prestamo[] = [];
  estados: { est_id: number, est_nombre: string }[] = [];
  displayedColumns: string[] = ['idPrestamo', 'fechaHora', 'fechaEntrega', 'estado', 'acciones'];

  constructor(
    private fb: FormBuilder,
    private prestamoService: PrestamoService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      searchId: [''],
      searchEstado: [''],
      searchFecha: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    const token = await this.authService.getToken();
    const cedula = await this.authService.getCedula();
    console.log('Token:', token);
    console.log('Cédula:', cedula);

    if (token && cedula) {
      await this.getHistory();
      this.getEstados();
    } else {
      console.error('Token o cédula no disponibles');
      this.snackBar.open('Debes iniciar sesión para ver el historial de préstamos.', 'Cerrar', {
        duration: 5000
      });
    }
  }

  async getHistory(): Promise<void> {
    const cedula = await this.authService.getCedula();
    if (cedula) { 
      this.prestamoService.getPrestamosPorCedula(cedula).subscribe(
        (data: any) => {
          this.prestamos = data.map((item: any) => ({
            idPrestamo: item.pre_id,
            fechaHora: this.formatearFecha(item.pre_inicio),
            fechaEntrega: this.formatearFecha(item.pre_fin),
            estado: item.est_nombre,
            cedulaSolicitante: item.usr_cedula
          }));
          this.filteredPrestamos = this.prestamos;
        },
        (error: any) => {
          console.error('Error al obtener el historial de préstamos', error);
          this.snackBar.open('Ocurrió un error al obtener el historial de préstamos. Por favor, intenta nuevamente más tarde.', 'Cerrar', {
            duration: 5000
          });
        }
      );
    } else {
      console.error('La cédula no está disponible.');
      this.snackBar.open('Debes iniciar sesión para ver el historial de préstamos.', 'Cerrar', {
        duration: 5000
      });
    }
  }

  getEstados(): void {
    this.prestamoService.getEstados().subscribe(
      (data: { est_id: number, est_nombre: string }[]) => {
        this.estados = data;
      },
      (error: any) => {
        console.error('Error al obtener los estados', error);
        this.snackBar.open('Ocurrió un error al obtener los estados. Por favor, intenta nuevamente más tarde.', 'Cerrar', {
          duration: 5000
        });
      }
    );
  }

  buscar(): void {
    const { searchId, searchEstado, searchFecha } = this.searchForm?.value || {};
    this.filteredPrestamos = this.prestamos;

    if (searchId) {
      this.filteredPrestamos = this.filteredPrestamos.filter(
        prestamo => prestamo.idPrestamo && prestamo.idPrestamo.toString().includes(searchId)
      );
    }

    if (searchEstado && searchEstado.trim() !== '') {
      this.filteredPrestamos = this.filteredPrestamos.filter(
        prestamo => prestamo.estado && prestamo.estado.toLowerCase().includes(searchEstado.trim().toLowerCase())
      );
    }

    if (searchFecha) {
      this.filteredPrestamos = this.filteredPrestamos.filter(
        prestamo => prestamo.fechaHora && prestamo.fechaHora.split('T')[0] === searchFecha
      );
    }

    console.log('Resultados filtrados:', this.filteredPrestamos);
  }

  verDetalles(prestamo: Prestamo): void {
    this.snackBar.open(`Detalles del préstamo:\nID: ${prestamo.idPrestamo}\nEstado: ${prestamo.estado}\nFecha Inicio: ${prestamo.fechaHora}\nFecha Fin: ${prestamo.fechaEntrega}`, 'Cerrar', {
      duration: 5000
    });
  }

  formatearFecha(fecha: string): string {
    return fecha && fecha.includes('T') ? fecha.split('T')[0] : 'Fecha no disponible';
  }
}





























