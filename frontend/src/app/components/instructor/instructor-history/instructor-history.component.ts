import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { PrestamoService } from '../../../services/prestamo.service';
import { AuthService } from '../../../services/auth.service';
import { Prestamo } from '../../../models/prestamo.model';
import { Estado } from '../../../models/estado.model';
import { PrestamoDetalleModalComponent } from '../../prestamo-detalle-modal/prestamo-detalle-modal.component';
import { ConfirmationDialogComponent } from '../../warehouse/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-instructor-history',
  templateUrl: './instructor-history.component.html',
  styleUrls: ['./instructor-history.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule,
    MatIconModule,
    MatPaginatorModule
  ]
})
export class InstructorHistoryComponent implements OnInit {
  token: string | null = null;
  searchForm: FormGroup;
  prestamos: Prestamo[] = [];
  filteredPrestamos: MatTableDataSource<Prestamo>;
  estados: Estado[] = [];
  mensajeNoPrestamos: string = 'No se encontraron préstamos.';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['idPrestamo', 'fechaHora', 'fechaEntrega', 'estado', 'acciones'];

  constructor(
    private fb: FormBuilder,
    private prestamoService: PrestamoService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    this.searchForm = this.fb.group({
      searchId: [''],
      searchEstado: [''],
      searchFecha: ['']
    });

    this.filteredPrestamos = new MatTableDataSource<Prestamo>([]);
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.searchForm.valueChanges.subscribe(() => this.buscar());
  }

  loadInitialData(): void {
    const token = this.authService.getToken();
    const cedula = this.authService.getCedula();
    console.log('Token:', token);
    console.log('Cédula:', cedula);

    if (token && cedula) {
      this.getHistory();
      this.getEstados();
    } else {
      console.error('Token o cédula no disponibles');
      this.snackBar.open('Debes iniciar sesión para ver el historial de préstamos.', 'Cerrar', {
        duration: 5000
      });
    }
  }

  getHistory(): void {
    const cedula = this.authService.getCedula();
    if (cedula) {
      this.prestamoService.getPrestamosPorCedula(cedula).subscribe(
        (data: any[]) => {
          console.log('Datos recibidos del backend:', data);
  
          this.prestamos = data.map(prestamo => ({
            idPrestamo: prestamo.pre_id,
            cedulaSolicitante: prestamo.usr_cedula,
            fechaInicio: new Date(prestamo.pre_inicio), // <--- Se asume SIEMPRE válido
            // Si fechaEntrega puede ser nula, úsala así:
            fechaEntrega: prestamo.pre_fin ? new Date(prestamo.pre_fin) : null,
            estado: prestamo.est_nombre,
            elementos: prestamo.elementos || [],
          }));
  
          // Ordenar por fecha de inicio (más reciente a más antigua)
          this.prestamos.sort((a, b) => {
            // Dado que fechaInicio NUNCA es nula, podemos usar getTime() directamente
            return b.fechaInicio.getTime() - a.fechaInicio.getTime();
          });
  
          this.filteredPrestamos.data = this.prestamos;
          this.filteredPrestamos.paginator = this.paginator;
          this.buscar();
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
      (data: Estado[]) => {
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
    const { searchId, searchEstado, searchFecha } = this.searchForm.value;
    let filteredData = this.prestamos;

    if (searchId) {
      filteredData = filteredData.filter(
        prestamo => prestamo.idPrestamo && prestamo.idPrestamo.toString().includes(searchId)
      );
    }

    if (searchEstado && searchEstado.trim() !== '') {
      filteredData = filteredData.filter(
        prestamo => prestamo.estado && prestamo.estado.toLowerCase().includes(searchEstado.trim().toLowerCase())
      );
    }

    if (searchFecha) {
      const parsedSearchFecha = new Date(searchFecha);
      
      if (isNaN(parsedSearchFecha.getTime())) {
        console.error("Fecha de búsqueda inválida:", searchFecha);
        return; // No continúa si la fecha ingresada no es válida
      }
    
      filteredData = filteredData.filter(prestamo => {
        if (!prestamo.fechaInicio) return false; // Excluye préstamos sin fecha
    
        const parsedPrestamoFecha = new Date(prestamo.fechaInicio);
        if (isNaN(parsedPrestamoFecha.getTime())) {
          console.warn("Fecha inválida en el préstamo:", prestamo);
          return false; // Excluye préstamos con fechas inválidas
        }
    
        // Convertir ambas fechas a formato YYYY-MM-DD para comparación sin hora
        const prestamoFechaStr = parsedPrestamoFecha.toISOString().split('T')[0];
        const searchFechaStr = parsedSearchFecha.toISOString().split('T')[0];
    
        return prestamoFechaStr === searchFechaStr;
      });
    }
    
    
    
    this.filteredPrestamos.data = filteredData;
    this.actualizarMensajeNoPrestamos(searchEstado);
  }

  actualizarMensajeNoPrestamos(searchEstado: string): void {
    if (this.filteredPrestamos.data.length === 0) {
      switch (searchEstado?.toLowerCase()) {
        case 'creado':
          this.mensajeNoPrestamos = 'No hay préstamos creados.';
          break;
        case 'en proceso':
          this.mensajeNoPrestamos = 'No hay préstamos en proceso.';
          break;
        case 'préstamo':
          this.mensajeNoPrestamos = 'No hay préstamos en curso.';
          break;
        case 'entregado':
          this.mensajeNoPrestamos = 'No hay préstamos entregados.';
          break;
        case 'cancelado':
          this.mensajeNoPrestamos = 'No hay préstamos cancelados.';
          break;
        default:
          this.mensajeNoPrestamos = 'No se encontraron préstamos.';
      }
    } else {
      this.mensajeNoPrestamos = '';
    }
  }

  verDetalles(prestamo: Prestamo): void {
    const dialogRef = this.dialog.open(PrestamoDetalleModalComponent, {
      width: '800px',
      data: { prestamo }
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('El modal se cerró');
      this.getHistory();
    });
  }

  formatearFecha(fecha: string | Date): string {
    // 1. Verificar que la fecha no sea nula o indefinida
    if (!fecha) return '';
  
    // 2. Convertir la fecha a objeto Date
    const fechaObj = new Date(fecha);
  
    // 3. Verificar si la fecha es válida
    if (isNaN(fechaObj.getTime())) {
      // Si la fecha es inválida, devolver un string vacío (o un mensaje de error)
      return '';
    }
  
    // 4. Devolver la fecha en el formato deseado
    // Ejemplo: "28/02/2025"
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  seleccionarEstado(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const estadoSeleccionado = selectElement.value;
    this.searchForm.get('searchEstado')?.setValue(estadoSeleccionado);
    this.buscar();
  }

  cancelarPrestamo(prestamo: Prestamo): void {
    if (!prestamo.idPrestamo) {
      console.error('El préstamo no tiene un ID válido.');
      this.snackBar.open('Error: préstamo inválido.', 'Cerrar', { duration: 3000 });
      return;
    }
  
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        titulo: 'Confirmar Cancelación',
        mensaje: '¿Estás seguro de que deseas cancelar este préstamo?',
        textoBotonCancelar: 'Cancelar',
        textoBotonConfirmar: 'Confirmar'
      }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const fechaActual = new Date();
  
        this.prestamoService.actualizarEstadoPrestamo(prestamo.idPrestamo!, {
          estado: 5, // ID del estado "Cancelado"
          fechaEntrega: fechaActual, // Solo se actualiza la fecha de entrega
          usr_cedula: this.authService.getCedula() || ''
        }).subscribe(
          (response: any) => {
            // Actualizamos localmente el préstamo sin modificar fechaInicio
            this.prestamos = this.prestamos.map(p => {
              if (p.idPrestamo === prestamo.idPrestamo) {
                return {
                  ...p,
                  estado: 'Cancelado',
                  fechaEntrega: response.pre_fin // o la fecha que devuelva el backend
                };
              }
              return p;
            });
            
            this.filteredPrestamos.data = this.prestamos;
            this.snackBar.open('Préstamo cancelado con éxito.', 'Cerrar', { duration: 3000 });
          },
          (error) => {
            console.error('Error al cancelar el préstamo:', error);
            this.snackBar.open('Error al cancelar el préstamo.', 'Cerrar', { duration: 3000 });
          }
        );
      }
    });
  }
    
  actualizarToken(): void {
    this.token = this.authService.getToken();
    if (this.token) {
      console.log('Token recuperado:', this.token);
    } else {
      console.log('Token no disponible');
    }
  }
  
}  