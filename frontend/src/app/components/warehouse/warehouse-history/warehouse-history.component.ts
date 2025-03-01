import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-warehouse-history',
  templateUrl: './warehouse-history.component.html',
  styleUrls: ['./warehouse-history.component.css'],
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
export class WarehouseHistoryComponent implements OnInit {
  searchForm: FormGroup;
  prestamos: Prestamo[] = [];
  filteredPrestamos: MatTableDataSource<Prestamo>;
  estados: Estado[] = [];
  mensajeNoPrestamos: string = 'No se encontraron préstamos.';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['idPrestamo', 'instructorNombre', 'fechaHora', 'fechaEntrega', 'estado', 'acciones'];

  constructor(
    private fb: FormBuilder,
    private prestamoService: PrestamoService,
    private authService: AuthService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      searchId: [''],
      searchEstado: [''],
      searchFecha: [''],
      searchInstructor: ['']
    });

    this.filteredPrestamos = new MatTableDataSource<Prestamo>([]);
  }

  async ngOnInit(): Promise<void> {
    await this.loadInitialData();

    // Suscripción a cambios en el formulario para filtrado dinámico
    this.searchForm.valueChanges
      .pipe(
        debounceTime(300), // Espera 300 ms después de cada cambio
        distinctUntilChanged() // Solo emite si el valor cambió
      )
      .subscribe(() => this.buscar());
  }

  async loadInitialData(): Promise<void> {
    await this.getHistory();
    this.getEstados();
  }

  async getHistory(): Promise<void> {
    try {
      const prestamos = await this.prestamoService.getPrestamos().toPromise();
  
      if (prestamos && Array.isArray(prestamos)) {
        const ordenEstados = ['creado', 'en proceso', 'en préstamo'];
  
        this.prestamos = prestamos
          .map((item: any) => ({
            idPrestamo: item.pre_id,
            cedulaSolicitante: item.usr_cedula,
            instructorNombre: item.usr_nombre,
            fechaInicio: new Date(item.pre_inicio), // Convertir a Date
            fechaEntrega: item.pre_fin ? new Date(item.pre_fin) : null, // Convertir a Date o null
            estado: item.est_nombre,
            elementos: item.elementos || []
          }))
          .filter(prestamo => {
            const estado = prestamo.estado.toLowerCase();
            return ordenEstados.includes(estado);
          })
          .sort((a, b) => {
            const fechaA = a.fechaInicio.getTime();
            const fechaB = b.fechaInicio.getTime();
            return fechaB - fechaA;
          });
  
        this.filteredPrestamos = new MatTableDataSource<Prestamo>(this.prestamos);
        this.filteredPrestamos.paginator = this.paginator;
        this.buscar();
      } else {
        this.snackBar.open('No se encontraron préstamos.', 'Cerrar', { duration: 5000 });
      }
    } catch (error) {
      console.error('Error al obtener el historial de préstamos', error);
      this.snackBar.open('Ocurrió un error al obtener el historial. Por favor, intenta nuevamente más tarde.', 'Cerrar', { duration: 5000 });
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
    const { searchId, searchEstado, searchFecha, searchInstructor } = this.searchForm.value;
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
      filteredData = filteredData.filter(
        prestamo => prestamo.fechaInicio && prestamo.fechaInicio.toISOString().split('T')[0] === searchFecha
      );
    }
    

    if (searchInstructor && searchInstructor.trim() !== '') {
      filteredData = filteredData.filter(
        prestamo => prestamo.instructorNombre && prestamo.instructorNombre.toLowerCase().includes(searchInstructor.trim().toLowerCase())
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
      data: { 
        prestamo: { ...prestamo, fechaInicio: prestamo.fechaInicio } // Pasar la fecha de inicio
      },
      disableClose: true // Evita que el usuario cierre haciendo clic fuera
    });
  
    dialogRef.afterClosed().subscribe((updated: boolean) => {
      if (updated) {
        this.snackBar.open('Actualizando datos...', '', { duration: 2000 });
        this.getHistory().then(() => {
          this.snackBar.open('Datos actualizados', '', { duration: 2000 });
        }).catch(error => {
          this.snackBar.open('Error al actualizar', '', { duration: 2000 });
        });
      }
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

  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'creado': return 'estado-creado';
      case 'en proceso': return 'estado-proceso';
      case 'préstamo': return 'estado-prestamo';
      case 'entregado': return 'estado-entregado';
      case 'cancelado': return 'estado-cancelado';
      case 'pendiente': return 'estado-pendiente'; // Añadir esta línea para el estado Pendiente
      default: return 'estado-default';
    }
  }
  
}