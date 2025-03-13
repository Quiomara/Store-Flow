import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
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
 *
 * @remarks
 * Permite al usuario visualizar y filtrar el historial de préstamos basándose en criterios como ID, estado, fecha e instructor.
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
  /** Formulario para la búsqueda de préstamos. */
  searchForm: FormGroup;
  /** Lista de todos los préstamos obtenidos. */
  prestamos: Prestamo[] = [];
  /** Fuente de datos para la tabla filtrada de préstamos. */
  filteredPrestamos: MatTableDataSource<Prestamo>;
  /** Lista de estados disponibles para filtrar. */
  estados: Estado[] = [];
  /** Mensaje a mostrar cuando no se encuentren préstamos. */
  mensajeNoPrestamos: string = 'No se encontraron préstamos.';

  /** Referencia al paginador de la tabla. */
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /** Columnas a mostrar en la tabla de historial. */
  displayedColumns: string[] = ['idPrestamo', 'instructorNombre', 'fechaHora', 'fechaEntrega', 'estado', 'acciones'];

  /**
   * Crea una instancia del componente WarehouseHistoryComponent.
   *
   * @param fb - Servicio para la creación de formularios.
   * @param prestamoService - Servicio para gestionar préstamos.
   * @param authService - Servicio de autenticación.
   * @param userService - Servicio para gestionar usuarios.
   * @param snackBar - Servicio para mostrar notificaciones.
   * @param dialog - Servicio para abrir diálogos modales.
   * @param cd - Detector de cambios para actualizar la vista.
   */
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
   * ngOnInit - Inicializa el componente y configura el formulario de búsqueda.
   *
   * @returns void
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
   * loadInitialData - Carga los datos iniciales, incluyendo el historial de préstamos y los estados.
   *
   * @returns Promise<void> que se resuelve cuando se han cargado los datos.
   */
  async loadInitialData(): Promise<void> {
    await this.getHistory();
    this.getEstados();
  }

  /**
   * getHistory - Obtiene el historial de préstamos desde el servicio.
   *
   * @returns Promise<void> que se resuelve cuando se ha obtenido el historial.
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
            // Se conserva la fecha original para ordenamiento y filtrado.
            fechaInicio: item.pre_inicio,
            // Se mapea fechaEntrega como un objeto Date si existe.
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
   * getEstados - Obtiene los estados disponibles desde el servicio de préstamos.
   *
   * @returns void
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
   * buscar - Filtra el historial de préstamos según los criterios de búsqueda.
   *
   * @returns void
   */
  buscar(): void {
    const { searchId, searchEstado, searchFecha, searchInstructor } = this.searchForm.value;
    let filteredData = this.prestamos;

    // Filtrar por ID.
    if (searchId) {
      filteredData = filteredData.filter(
        prestamo => prestamo.idPrestamo && prestamo.idPrestamo.toString().includes(searchId)
      );
    }

    // Filtrar por Estado.
    if (searchEstado && searchEstado.trim() !== '') {
      filteredData = filteredData.filter(
        prestamo => prestamo.estado && prestamo.estado.toLowerCase().includes(searchEstado.trim().toLowerCase())
      );
    }

    // Filtrar por Fecha.
    if (searchFecha) {
      const parsedSearchFecha = new Date(searchFecha);

      if (isNaN(parsedSearchFecha.getTime())) {
        this.snackBar.open("Fecha de búsqueda inválida.", 'Cerrar', { duration: 3000 });
        return;
      }

      filteredData = filteredData.filter(prestamo => {
        if (!prestamo.fechaInicio) return false;
        const parsedPrestamoFecha = new Date(prestamo.fechaInicio);
        if (isNaN(parsedPrestamoFecha.getTime())) {
          return false;
        }
        const prestamoFechaStr = parsedPrestamoFecha.toISOString().split('T')[0];
        const searchFechaStr = parsedSearchFecha.toISOString().split('T')[0];
        return prestamoFechaStr === searchFechaStr;
      });
    }

    // Filtrar por Nombre de Instructor.
    if (searchInstructor) {
      filteredData = filteredData.filter(
        prestamo => prestamo.instructorNombre?.toLowerCase().includes(searchInstructor.trim().toLowerCase())
      );
    }

    // Actualizar el DataSource con los resultados filtrados.
    this.filteredPrestamos.data = filteredData;

    // Actualizar el mensaje en caso de que no se encuentren resultados.
    this.actualizarMensajeNoPrestamos(searchEstado);
  }

  /**
   * actualizarMensajeNoPrestamos - Actualiza el mensaje mostrado cuando no se encuentran préstamos.
   *
   * @param searchEstado - El estado de búsqueda utilizado.
   * @returns void
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
   * verDetalles - Abre un modal para mostrar los detalles de un préstamo.
   *
   * @param prestamo - El préstamo cuyos detalles se mostrarán.
   * @returns void
   */
  verDetalles(prestamo: Prestamo): void {
    const dialogRef = this.dialog.open(PrestamoDetalleModalComponent, {
      width: '800px',
      data: {
        prestamo: { ...prestamo, fechaInicio: prestamo.fechaInicio },
        soloDetalle: true
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
   * formatearFecha - Formatea una fecha a formato 'dd/mm/yyyy'.
   *
   * @param fecha - La fecha a formatear (string o Date).
   * @returns La fecha formateada en 'dd/mm/yyyy' o una cadena vacía si la fecha es inválida.
   */
  formatearFecha(fecha: string | Date): string {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return '';
    }
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * seleccionarEstado - Establece el valor del estado seleccionado en el formulario de búsqueda.
   *
   * @param event - Evento que contiene el valor seleccionado.
   * @returns void
   */
  seleccionarEstado(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const estadoSeleccionado = selectElement.value;
    this.searchForm.get('searchEstado')?.setValue(estadoSeleccionado);
    this.buscar();
  }

  /**
   * verHistorial - Abre un modal para mostrar el historial de un préstamo.
   *
   * @param prestamo - El préstamo cuyo historial se desea ver.
   * @returns void
   */
  verHistorial(prestamo: Prestamo): void {
    const dialogRef = this.dialog.open(PrestamoDetalleModalComponent, {
      width: '800px',
      data: {
        prestamo: prestamo,
        soloDetalle: true,
        incluirHistorial: true,
        historialEstados: prestamo.historial_estados || []
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      // Se puede manejar el resultado si es necesario.
    });
  }

  /**
 * Devuelve la clase CSS correspondiente según el estado del préstamo.
 *
 * @param estado - El estado del préstamo.
 * @returns Una cadena con el nombre de la clase CSS.
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

}
