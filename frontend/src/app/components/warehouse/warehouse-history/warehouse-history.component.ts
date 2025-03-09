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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Componente para mostrar el historial de préstamos en el almacén.
 */
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

  // Incluimos la columna 'fechaEntrega' para mostrar la fecha de entrega en el historial.
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

  /**
   * Inicializa el componente y carga los datos.
   */
  async ngOnInit(): Promise<void> {
    await this.loadInitialData();

    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.buscar());
  }

  /**
   * Carga los datos iniciales, incluyendo el historial de préstamos y los estados.
   */
  async loadInitialData(): Promise<void> {
    await this.getHistory();
    this.getEstados();
  }

  /**
   * Obtiene el historial de préstamos.
   */
  async getHistory(): Promise<void> {
    try {
      const prestamos = await this.prestamoService.getPrestamos().toPromise();

      if (prestamos && Array.isArray(prestamos)) {
        this.prestamos = prestamos
          .map((item: any) => ({
            idPrestamo: item.pre_id,
            cedulaSolicitante: item.usr_cedula,
            instructorNombre: item.usr_nombre,
            fechaHora: this.formatearFecha(item.pre_inicio),
            // Conservamos la fecha original para poder ordenarla y filtrar si es necesario.
            fechaInicio: item.pre_inicio,
            // Aseguramos que la fechaEntrega se mapee como un objeto Date, si existe.
            fechaEntrega: item.pre_fin ? new Date(item.pre_fin) : null,
            estado: item.est_nombre,
            elementos: item.elementos || []
          }))
          .sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());

        this.filteredPrestamos = new MatTableDataSource<Prestamo>(this.prestamos);
        this.filteredPrestamos.paginator = this.paginator;
        this.buscar();
      } else {
        this.snackBar.open('No se encontraron préstamos.', 'Cerrar', { duration: 5000 });
      }
    } catch (error) {
      this.snackBar.open('Ocurrió un error al obtener el historial. Por favor, intenta nuevamente más tarde.', 'Cerrar', { duration: 5000 });
    }
  }

  /**
   * Obtiene los estados disponibles.
   */
  getEstados(): void {
    this.prestamoService.getEstados().subscribe(
      (data: Estado[]) => {
        this.estados = data;
      },
      (error: any) => {
        this.snackBar.open('Ocurrió un error al obtener los estados. Por favor, intenta nuevamente más tarde.', 'Cerrar', { duration: 5000 });
      }
    );
  }

  /**
   * Filtra los préstamos en base a los criterios de búsqueda.
   */
  buscar(): void {
    const { searchId, searchEstado, searchFecha, searchInstructor } = this.searchForm.value;
    let filteredData = this.prestamos;

    // Filtrar por ID
    if (searchId) {
      filteredData = filteredData.filter(
        prestamo => prestamo.idPrestamo && prestamo.idPrestamo.toString().includes(searchId)
      );
    }

    // Filtrar por Estado
    if (searchEstado && searchEstado.trim() !== '') {
      filteredData = filteredData.filter(
        prestamo => prestamo.estado && prestamo.estado.toLowerCase().includes(searchEstado.trim().toLowerCase())
      );
    }

    // Filtrar por Fecha
    if (searchFecha) {
      const parsedSearchFecha = new Date(searchFecha);

      if (isNaN(parsedSearchFecha.getTime())) {
        this.snackBar.open("Fecha de búsqueda inválida.", 'Cerrar', { duration: 3000 });
        return; // Detiene el filtro si la fecha ingresada no es válida
      }

      filteredData = filteredData.filter(prestamo => {
        // Si no hay fecha en el préstamo, se descarta
        if (!prestamo.fechaInicio) return false;

        const parsedPrestamoFecha = new Date(prestamo.fechaInicio);
        // Si la fecha del préstamo no es válida, también se descarta
        if (isNaN(parsedPrestamoFecha.getTime())) {
          return false;
        }

        // Convertimos ambas fechas a 'YYYY-MM-DD' para compararlas sin hora
        const prestamoFechaStr = parsedPrestamoFecha.toISOString().split('T')[0];
        const searchFechaStr = parsedSearchFecha.toISOString().split('T')[0];

        return prestamoFechaStr === searchFechaStr;
      });
    }

    // Filtrar por Nombre de Instructor
    if (searchInstructor) {
      filteredData = filteredData.filter(
        prestamo => prestamo.instructorNombre?.toLowerCase().includes(searchInstructor.trim().toLowerCase())
      );
    }

    // Actualizar el DataSource con los resultados filtrados
    this.filteredPrestamos.data = filteredData;

    // Mostrar mensaje si no hay resultados
    this.actualizarMensajeNoPrestamos(searchEstado);
  }

  /**
 * Actualiza el mensaje que se muestra cuando no se encuentran préstamos en el filtro.
 * @param searchEstado - El estado de búsqueda que se está utilizando.
 */
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
        default:
          this.mensajeNoPrestamos = 'No se encontraron préstamos.';
      }
    } else {
      this.mensajeNoPrestamos = '';
    }
  }

  /**
   * Muestra los detalles de un préstamo en un modal.
   * @param prestamo - El préstamo cuyos detalles se van a mostrar.
   */
  verDetalles(prestamo: Prestamo): void {
    const dialogRef = this.dialog.open(PrestamoDetalleModalComponent, {
      width: '800px',
      data: {
        prestamo: { ...prestamo, fechaInicio: prestamo.fechaInicio },
        soloDetalle: true // Indicamos que es solo para visualizar detalles
      },
      disableClose: true
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

  /**
   * Formatea una fecha en formato 'dd/mm/yyyy'.
   * @param fecha - Fecha a formatear, puede ser un string o un objeto Date.
   * @returns La fecha formateada en 'dd/mm/yyyy' o una cadena vacía si la fecha no es válida.
   */
  formatearFecha(fecha: string | Date): string {
    if (!fecha) return ''; // Verifica que la fecha no sea nula o indefinida

    const fechaObj = new Date(fecha);

    if (isNaN(fechaObj.getTime())) {
      // Si la fecha es inválida, devuelve una cadena vacía
      return '';
    }

    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Establece el valor del estado seleccionado en el formulario de búsqueda.
   * @param event - El evento que contiene el valor seleccionado.
   */
  seleccionarEstado(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const estadoSeleccionado = selectElement.value;
    this.searchForm.get('searchEstado')?.setValue(estadoSeleccionado);
    this.buscar(); // Realiza la búsqueda con el nuevo estado seleccionado
  }

  /**
   * Obtiene la clase CSS correspondiente al estado de un préstamo.
   * @param estado - El estado del préstamo para el cual se desea obtener la clase CSS.
   * @returns La clase CSS asociada al estado.
   */
  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'creado':
        return 'estado-creado';
      case 'en proceso':
        return 'estado-proceso';
      case 'préstamo':
        return 'estado-prestamo';
      case 'pendiente':
        return 'estado-pendiente';
      case 'cancelado':
        return 'estado-cancelado';
      case 'entregado':
        return 'estado-entregado';
      default:
        return 'estado-default';
    }
  }

  /**
   * Muestra el historial de un préstamo en un modal.
   * @param prestamo - El préstamo cuyo historial se desea ver.
   */
  verHistorial(prestamo: Prestamo): void {
    const dialogRef = this.dialog.open(PrestamoDetalleModalComponent, {
      width: '800px',
      data: {
        prestamo: prestamo,
        soloDetalle: true,
        incluirHistorial: true,
        historialEstados: prestamo.historial_estados || [] // Si no hay historial, se pasa un arreglo vacío
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      // Manejas el resultado si es necesario
    });
  }
}

