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
import { Elemento } from '../../../models/elemento.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ElementoService } from '../../../services/elemento.service';

/**
 * Interfaz que representa un elemento agregado.
 */
interface ElementoAgregado {
  ele_id: number;                    // Identificador del elemento.
  ele_nombre: string;                // Nombre del elemento.
  pre_ele_cantidad_prestado: number; // Cantidad prestada del elemento.
  ele_cantidad_actual: number;       // Cantidad actual disponible del elemento.
}

/**
 * Componente que muestra el historial de préstamos para instructores.
 *
 * @remarks
 * Permite buscar y filtrar el historial de préstamos, visualizar detalles, cancelar préstamos,
 * y actualizar el estado de los mismos. Se integra con diversos servicios para manejar la lógica
 * de negocio y la comunicación con el backend.
 */
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
  token: string | null = null;                                  // Token del usuario.
  searchForm: FormGroup;                                        // Formulario para búsqueda de préstamos.
  prestamos: Prestamo[] = [];                                   // Lista de préstamos.
  filteredPrestamos: MatTableDataSource<Prestamo>;              // Fuente de datos filtrados para la tabla de préstamos.
  estados: Estado[] = [];                                       // Lista de estados disponibles.

  mensajeNoPrestamos: string = 'No se encontraron préstamos.';  // Mensaje a mostrar cuando no se encuentran préstamos.

  elementosAgregados: ElementoAgregado[] = [];                  // Lista de elementos agregados.
  elementos: Elemento[] = [];                                   // Lista de elementos disponibles en el inventario.

  @ViewChild(MatPaginator) paginator!: MatPaginator;            // Paginador de la tabla de préstamos.

  private prestamosUrl = 'http://localhost:3000/api/prestamos';  // URL del API para préstamos.
  displayedColumns: string[] = ['idPrestamo', 'fechaHora', 'fechaEntrega', 'estado', 'acciones'];  // Columnas mostradas en la tabla.

  /**
   * Crea una instancia del componente InstructorHistoryComponent.
   *
   * @param elementoService - Servicio para gestionar elementos.
   * @param http - Cliente HTTP para realizar peticiones.
   * @param fb - Servicio para la creación de formularios.
   * @param prestamoService - Servicio para gestionar préstamos.
   * @param authService - Servicio de autenticación.
   * @param snackBar - Servicio para mostrar notificaciones.
   * @param dialog - Servicio para abrir diálogos modales.
   */
  constructor(
    private elementoService: ElementoService, 
    private http: HttpClient,
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

  /**
   * ngOnInit - Inicializa el componente cargando datos iniciales y suscribiéndose a cambios en el formulario de búsqueda.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.loadInitialData();
    this.searchForm.valueChanges.subscribe(() => this.buscar());
  }

  /**
   * loadInitialData - Carga los datos iniciales, incluyendo el historial de préstamos y los estados.
   *
   * @returns void
   */
  loadInitialData(): void {
    const token = this.authService.getToken();
    const cedula = this.authService.getCedula();

    if (token && cedula) {
      this.getHistory();
      this.getEstados();
    } else {
      this.snackBar.open('Debes iniciar sesión para ver el historial de préstamos.', 'Cerrar', {
        duration: 5000
      });
    }
  }

  /**
   * getHistory - Obtiene el historial de préstamos del backend para el usuario autenticado.
   *
   * @returns void
   */
  getHistory(): void {
    const cedula = this.authService.getCedula();
    if (cedula) {
      this.prestamoService.getPrestamosPorCedula(cedula).subscribe(
        (data: any[]) => {
          this.prestamos = data.map(prestamo => ({
            idPrestamo: prestamo.pre_id,
            cedulaSolicitante: prestamo.usr_cedula,
            fechaInicio: new Date(prestamo.pre_inicio),
            fechaEntrega: prestamo.pre_fin ? new Date(prestamo.pre_fin) : null,
            estado: prestamo.est_nombre,
            elementos: prestamo.elementos || [],
          }));
          this.prestamos.sort((a, b) => b.fechaInicio.getTime() - a.fechaInicio.getTime());
          this.filteredPrestamos.data = this.prestamos;
          this.filteredPrestamos.paginator = this.paginator;
          this.buscar();
        },
        (error: any) => {
          this.snackBar.open('Ocurrió un error al obtener el historial de préstamos. Por favor, intenta nuevamente más tarde.', 'Cerrar', {
            duration: 5000
          });
        }
      );
    } else {
      this.snackBar.open('Debes iniciar sesión para ver el historial de préstamos.', 'Cerrar', {
        duration: 5000
      });
    }
  }

  /**
   * getEstados - Obtiene los estados disponibles para los préstamos desde el backend.
   *
   * @returns void
   */
  getEstados(): void {
    this.prestamoService.getEstados().subscribe(
      (data: Estado[]) => {
        this.estados = data;
      },
      (error: any) => {
        this.snackBar.open('Ocurrió un error al obtener los estados. Por favor, intenta nuevamente más tarde.', 'Cerrar', {
          duration: 5000
        });
      }
    );
  }

  /**
   * buscar - Filtra el historial de préstamos según los criterios ingresados en el formulario de búsqueda.
   *
   * @returns void
   */
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
        return; // No continúa si la fecha ingresada no es válida.
      }
      filteredData = filteredData.filter(prestamo => {
        if (!prestamo.fechaInicio) return false; // Excluye préstamos sin fecha.
        const parsedPrestamoFecha = new Date(prestamo.fechaInicio);
        if (isNaN(parsedPrestamoFecha.getTime())) {
          return false; // Excluye préstamos con fechas inválidas.
        }
        const prestamoFechaStr = parsedPrestamoFecha.toISOString().split('T')[0];
        const searchFechaStr = parsedSearchFecha.toISOString().split('T')[0];
        return prestamoFechaStr === searchFechaStr;
      });
    }

    this.filteredPrestamos.data = filteredData;
    this.actualizarMensajeNoPrestamos(searchEstado);
  }

  /**
   * actualizarMensajeNoPrestamos - Actualiza el mensaje de "no préstamos encontrados" según el filtro de estado.
   *
   * @param searchEstado - El estado utilizado para filtrar los préstamos.
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

  /**
   * verDetalles - Abre un modal para mostrar y editar los detalles del préstamo seleccionado.
   *
   * @param prestamo - El préstamo para el cual se mostrarán los detalles.
   * @returns void
   */
  verDetalles(prestamo: Prestamo): void {
    this.dialog.open(PrestamoDetalleModalComponent, {
      width: '800px',
      data: {
        prestamo,
        soloDetalle: false, // Permite edición.
        incluirHistorial: true
      }
    }).afterClosed().subscribe(() => {
      this.getHistory();
    });
  }

  /**
   * formatearFecha - Convierte una fecha a formato "DD/MM/YYYY".
   *
   * @param fecha - La fecha a formatear (string o Date).
   * @returns La fecha formateada o una cadena vacía si la fecha es inválida.
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
   * seleccionarEstado - Actualiza el valor del estado seleccionado en el formulario de búsqueda.
   *
   * @param event - Evento emitido al seleccionar un estado.
   * @returns void
   */
  seleccionarEstado(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const estadoSeleccionado = selectElement.value;
    this.searchForm.get('searchEstado')?.setValue(estadoSeleccionado);
    this.buscar();
  }

  /**
   * cancelarPrestamo - Inicia el proceso de cancelación de un préstamo.
   *
   * @param prestamo - El préstamo a cancelar.
   * @returns void
   */
  cancelarPrestamo(prestamo: Prestamo): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Confirmar cancelación',
        mensaje: `¿Estás seguro de que deseas cancelar el préstamo #${prestamo.idPrestamo}?`,
        textoBotonConfirmar: 'Cancelar préstamo',
        textoBotonCancelar: 'Volver'
      }
    });
  
    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) {
        // Cancelación abortada por el usuario.
        return;
      }
  
      // Si no hay elementos en el préstamo, se obtienen desde el backend.
      if (!prestamo.elementos || prestamo.elementos.length === 0) {
        this.prestamoService.getPrestamoDetalles(prestamo.idPrestamo!).subscribe(
          (detalles) => {
            if (!detalles || !detalles.data || detalles.data.length === 0) {
              // No se encontraron elementos asociados al préstamo en el backend.
              return;
            }
            // Se asignan los elementos obtenidos y se procede con la cancelación.
            prestamo.elementos = detalles.data;
            this.ejecutarCancelacion(prestamo);
          },
          (error) => {
            // Error al obtener los detalles del préstamo.
          }
        );
      } else {
        this.ejecutarCancelacion(prestamo);
      }
    });
  }
  
  /**
   * ejecutarCancelacion - Ejecuta la cancelación del préstamo y actualiza el stock de cada elemento.
   *
   * @param prestamo - El préstamo a cancelar.
   * @returns void
   */
  private ejecutarCancelacion(prestamo: Prestamo): void {
    this.prestamoService.cancelarPrestamo(prestamo.idPrestamo!)
      .subscribe(response => {
        if (!response.success) {
          // Error en la cancelación del préstamo.
          return;
        }
  
        // Actualiza el stock de cada elemento basado en los datos devueltos por el backend.
        response.data.forEach((elementoActualizado: any) => {
          const index = prestamo.elementos.findIndex(e => e.ele_id === elementoActualizado.ele_id);
          if (index !== -1) {
            prestamo.elementos[index].ele_cantidad_actual = elementoActualizado.ele_cantidad_actual;
          }
        });
  
        // Actualiza el historial de préstamos.
        this.getHistory();
      },
      error => {
        // Error en la solicitud de cancelación.
      });
  }
 
  /**
   * actualizarToken - Actualiza el token actual del usuario.
   *
   * @returns void
   */
  actualizarToken(): void {
    this.token = this.authService.getToken();
    if (!this.token) {
      this.snackBar.open('Token no disponible', 'Cerrar', { duration: 3000 });
    }
  }

  /**
   * handleError - Maneja errores de la solicitud y retorna un observable con el error.
   *
   * @param error - Error recibido.
   * @returns Observable que emite el error formateado.
   */
  private handleError(error: any): Observable<never> {
    return throwError(() => new Error(error.message || 'Error desconocido'));
  }

  /**
   * esCancelable - Determina si un préstamo es cancelable basándose en su estado.
   *
   * @param prestamo - El préstamo a evaluar.
   * @returns True si el préstamo es cancelable; de lo contrario, false.
   */
  esCancelable(prestamo: any): boolean {
    return prestamo.estado === 'Activo' || prestamo.estado === 'Creado';
  }
}
