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
import { PrestamoDetalleModalComponent } from '../../../components/prestamo-detalle-modal/prestamo-detalle-modal.component';
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

  async ngOnInit(): Promise<void> {
    await this.loadInitialData();
    this.searchForm.valueChanges.subscribe(() => this.buscar());
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
          console.log('Datos recibidos del backend:', data);
          this.prestamos = data.map((item: any) => ({
            idPrestamo: item.pre_id,
            fechaInicio: this.formatearFecha(item.pre_inicio),
            fechaEntrega: item.pre_fin ? this.formatearFecha(item.pre_fin) : '',
            estado: item.est_nombre,
            items: [],
            cedulaSolicitante: item.usr_cedula
          }));
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
      filteredData = filteredData.filter(prestamo =>
        prestamo.fechaInicio === searchFecha
      );
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

  formatearFecha(fecha: string): string {
    return fecha && fecha.includes('T') ? fecha.split('T')[0] : '';
  }

  seleccionarEstado(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const estadoSeleccionado = selectElement.value;
    this.searchForm.get('searchEstado')?.setValue(estadoSeleccionado);
    this.buscar();
  }

  cancelarPrestamo(prestamo: any): void {
    console.log('Abriendo diálogo de confirmación para:', prestamo);
  
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Cancelar Préstamo',
        mensaje: `¿Estás seguro de que deseas cancelar el préstamo ${prestamo.idPrestamo}?`,
        textoBotonConfirmar: 'Sí, cancelar',
        textoBotonCancelar: 'No'
      }
    });
  
    dialogRef.afterClosed().subscribe(async (result) => {
      console.log('Diálogo cerrado con resultado:', result);
      if (!result) return; // Si el usuario cancela, no hacemos nada
  
      try {
        await this.prestamoService.cancelarPrestamo(prestamo.idPrestamo).toPromise();
        prestamo.estado = 'Cancelado';
        this.snackBar.open(`Préstamo ${prestamo.idPrestamo} cancelado exitosamente.`, 'Cerrar', {
          duration: 3000
        });
        this.getHistory();
      } catch (error) {
        console.error('Error al cancelar el préstamo:', error);
        this.snackBar.open('Ocurrió un error al cancelar el préstamo. Inténtalo de nuevo.', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }
  
  

  
}
