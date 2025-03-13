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
import { PrestamoDetalleModalComponent } from '../../prestamo-detalle-modal/prestamo-detalle-modal.component';
import { UserService } from '../../../services/user.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Componente para gestionar las solicitudes de préstamos en el almacén.
 *
 * @remarks
 * Este componente se encarga de mostrar, filtrar y actualizar la lista de préstamos,
 * permitiendo ver los detalles de cada préstamo a través de un modal.
 *
 * @example
 * <app-warehouse-requests></app-warehouse-requests>
 */
@Component({
  selector: 'app-warehouse-requests',
  templateUrl: './warehouse-requests.component.html',
  styleUrls: ['./warehouse-requests.component.css'],
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
export class WarehouseRequestsComponent implements OnInit {
  /** Formulario de búsqueda para filtrar los préstamos. */
  searchForm: FormGroup;
  /** Lista completa de préstamos. */
  prestamos: Prestamo[] = [];
  /** DataSource filtrada para la tabla de préstamos. */
  filteredPrestamos: MatTableDataSource<Prestamo>;
  /** Lista de estados disponibles para los préstamos. */
  estados: Estado[] = [];
  /** Mensaje a mostrar cuando no se encuentran préstamos. */
  mensajeNoPrestamos: string = 'No se encontraron préstamos.';

  /** Referencia al paginador de la tabla. */
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /**
   * Columnas a mostrar en la tabla. Se elimina 'fechaEntrega' ya que no se mostrará.
   */
  displayedColumns: string[] = ['idPrestamo', 'instructorNombre', 'fechaHora', 'estado', 'acciones'];

  /**
   * Crea una instancia del componente WarehouseRequestsComponent.
   *
   * @param fb - Servicio para la creación de formularios reactivos.
   * @param prestamoService - Servicio para la gestión de préstamos.
   * @param authService - Servicio para la autenticación.
   * @param userService - Servicio para la gestión de usuarios.
   * @param snackBar - Servicio para mostrar notificaciones.
   * @param dialog - Servicio para la apertura de diálogos modales.
   * @param cd - Servicio para detectar cambios en la vista.
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
   * Método de ciclo de vida de Angular que se ejecuta al inicializar el componente.
   *
   * @returns Una promesa que se resuelve cuando se han cargado los datos iniciales.
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
   * Carga los datos iniciales requeridos por el componente.
   *
   * @returns Una promesa que se resuelve cuando se han cargado el historial y los estados.
   */
  async loadInitialData(): Promise<void> {
    await this.getHistory();
    this.getEstados();
  }

  /**
   * Obtiene el historial de préstamos y actualiza la tabla de datos.
   *
   * @returns Una promesa que se resuelve al completar la obtención y procesamiento de los préstamos.
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
            fechaInicio: item.pre_inicio,
            // Aseguramos que la fechaEntrega esté presente
            fechaEntrega: item.pre_fin ? new Date(item.pre_fin) : null,
            estado: item.est_nombre,
            elementos: item.elementos || []
          }))
          // Se filtran los préstamos con estado 'Entregado' o 'Cancelado'
          .filter(prestamo => {
            const estado = prestamo.estado.toLowerCase();
            return estado !== 'entregado' && estado !== 'cancelado';
          })
          // Se ordena siempre por fechaInicio de más reciente a más antigua
          .sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());

        this.filteredPrestamos = new MatTableDataSource<Prestamo>(this.prestamos);
        this.filteredPrestamos.paginator = this.paginator;
        this.buscar();
      } else {
        this.snackBar.open('No se encontraron préstamos.', 'Cerrar', { duration: 5000 });
      }
    } catch (error) {
      // Se notifica el error al usuario sin utilizar console.log
      this.snackBar.open('Ocurrió un error al obtener el historial. Por favor, intenta nuevamente más tarde.', 'Cerrar', { duration: 5000 });
    }
  }

  /**
   * Obtiene la lista de estados y filtra aquellos que no deben mostrarse.
   */
  getEstados(): void {
    this.prestamoService.getEstados().subscribe(
      (data: Estado[]) => {
        // Se filtran los estados para excluir "Cancelado"
        this.estados = data.filter(e => e.est_nombre.toLowerCase() !== 'cancelado');
      },
      (error: any) => {
        // Se notifica el error al usuario sin utilizar console.log
        this.snackBar.open('Ocurrió un error al obtener los estados. Por favor, intenta nuevamente más tarde.', 'Cerrar', { duration: 5000 });
      }
    );
  }

  /**
   * Filtra la lista de préstamos según los criterios del formulario de búsqueda.
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
        // Detiene el filtro si la fecha ingresada no es válida
        return;
      }

      filteredData = filteredData.filter(prestamo => {
        // Si no hay fecha en el préstamo, se descarta
        if (!prestamo.fechaInicio) return false;

        const parsedPrestamoFecha = new Date(prestamo.fechaInicio);
        // Si la fecha del préstamo no es válida, se descarta
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
   * Actualiza el mensaje que se muestra cuando no se encuentran préstamos.
   *
   * @param searchEstado - El estado de búsqueda ingresado por el usuario.
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
   * Abre el modal para ver los detalles de un préstamo.
   *
   * @param prestamo - El préstamo del cual se desean ver los detalles.
   */
  verDetalles(prestamo: Prestamo): void {
    const dialogRef = this.dialog.open(PrestamoDetalleModalComponent, {
      width: '800px',
      data: { 
        prestamo: { ...prestamo, fechaInicio: prestamo.fechaInicio },
        soloDetalle: false,
        incluirHistorial: false
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
   * Formatea una fecha en el formato 'DD/MM/YYYY'.
   *
   * @param fecha - La fecha a formatear, en formato string o Date.
   * @returns La fecha formateada o un string vacío si la fecha es inválida.
   */
  formatearFecha(fecha: string | Date): string {
    // 1. Verificar que la fecha no sea nula o indefinida
    if (!fecha) return '';

    // 2. Convertir la fecha a objeto Date
    const fechaObj = new Date(fecha);

    // 3. Verificar si la fecha es válida
    if (isNaN(fechaObj.getTime())) {
      // Si la fecha es inválida, devolver un string vacío
      return '';
    }

    // 4. Devolver la fecha en el formato deseado (ejemplo: "28/02/2025")
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Maneja la selección de un estado desde un elemento select.
   *
   * @param event - El evento emitido por el cambio en el select.
   */
  seleccionarEstado(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const estadoSeleccionado = selectElement.value;
    this.searchForm.get('searchEstado')?.setValue(estadoSeleccionado);
    this.buscar();
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
