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


interface ElementoAgregado {
  ele_id: number;
  ele_nombre: string;
  pre_ele_cantidad_prestado: number;
  ele_cantidad_actual: number;
}

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

  // Se agregan las propiedades necesarias
  elementosAgregados: ElementoAgregado[] = []; // Asegurar que exista la lista de elementos agregados
  elementos: Elemento[] = []; // Lista de elementos disponibles en el inventario


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private prestamosUrl = 'http://localhost:3000/api/prestamos';
  displayedColumns: string[] = ['idPrestamo', 'fechaHora', 'fechaEntrega', 'estado', 'acciones'];

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
   * ngOnInit - Inicializa los datos del componente y suscribe al formulario de búsqueda.
   * @returns {void}
   */
  ngOnInit(): void {
    this.loadInitialData();
    this.searchForm.valueChanges.subscribe(() => this.buscar());
  }

  /**
   * loadInitialData - Carga los datos iniciales, como el historial de préstamos y los estados.
   * Verifica que el usuario tenga un token y cédula disponibles antes de continuar.
   * @returns {void}
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
   * getHistory - Obtiene el historial de préstamos del backend para un usuario con base en su cédula.
   * @returns {void}
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
   * @returns {void}
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
   * buscar - Realiza la búsqueda de préstamos filtrando por ID, estado y fecha según los valores del formulario.
   * @returns {void}
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
        return; // No continúa si la fecha ingresada no es válida
      }

      filteredData = filteredData.filter(prestamo => {
        if (!prestamo.fechaInicio) return false; // Excluye préstamos sin fecha

        const parsedPrestamoFecha = new Date(prestamo.fechaInicio);
        if (isNaN(parsedPrestamoFecha.getTime())) {
          return false; // Excluye préstamos con fechas inválidas
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
   * actualizarMensajeNoPrestamos - Actualiza el mensaje de no resultados según el estado de los préstamos filtrados.
   * @param {string} searchEstado - El estado de los préstamos seleccionados para la búsqueda.
   * @returns {void}
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
 * verDetalles - Abre un modal para mostrar los detalles del préstamo y permite editarlo.
 * @param {Prestamo} prestamo - El objeto de préstamo para mostrar los detalles.
 * @returns {void}
 */
  verDetalles(prestamo: Prestamo): void {
    this.dialog.open(PrestamoDetalleModalComponent, {
      width: '800px',
      data: {
        prestamo,
        soloDetalle: false, // Permite edición
        incluirHistorial: false
      }
    }).afterClosed().subscribe(() => {
      this.getHistory();
    });
  }

  /**
   * formatearFecha - Convierte una fecha a un formato "DD/MM/YYYY".
   * @param {string | Date} fecha - La fecha a formatear, puede ser un string o un objeto Date.
   * @returns {string} - La fecha formateada en el formato "DD/MM/YYYY".
   */
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
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * seleccionarEstado - Establece el valor del estado seleccionado en el formulario de búsqueda.
   * @param {Event} event - El evento del select donde se seleccionó el estado.
   * @returns {void}
   */
  seleccionarEstado(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const estadoSeleccionado = selectElement.value;
    this.searchForm.get('searchEstado')?.setValue(estadoSeleccionado);
    this.buscar();
  }

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
        console.log("Cancelación abortada por el usuario.");
        return;
      }
  
      console.log("Iniciando cancelación de préstamo ID:", prestamo.idPrestamo);
  
      // Si no hay elementos en el préstamo, los obtenemos desde el backend
      if (!prestamo.elementos || prestamo.elementos.length === 0) {
        console.warn("El préstamo no tiene elementos en el frontend. Obteniendo detalles desde el backend...");
  
        this.prestamoService.getPrestamoDetalles(prestamo.idPrestamo!).subscribe(
          (detalles) => {
            if (!detalles || !detalles.data || detalles.data.length === 0) {
              console.error("Error: No se encontraron elementos asociados al préstamo en el backend.");
              return;
            }
            console.log("Elementos obtenidos correctamente:", detalles.data);
            prestamo.elementos = detalles.data; // Asignamos los elementos obtenidos
            this.ejecutarCancelacion(prestamo); // Llamamos a la función de cancelación
          },
          (error) => console.error("Error al obtener los detalles del préstamo:", error)
        );
      } else {
        this.ejecutarCancelacion(prestamo);
      }
    });
  }
  
  // Método separado para manejar la cancelación
  private ejecutarCancelacion(prestamo: Prestamo): void {
    this.prestamoService.cancelarPrestamo(prestamo.idPrestamo!)
      .subscribe(response => {
        console.log("Respuesta del backend al cancelar préstamo:", response);
        if (!response.success) {
          console.error("Error al cancelar préstamo:", response.message);
          return;
        }
  
        // Actualizamos cada elemento con el stock actualizado que ya devuelve el backend
        // Suponiendo que response.data es un array de objetos actualizados para cada elemento
        response.data.forEach((elementoActualizado: any) => {
          const index = prestamo.elementos.findIndex(e => e.ele_id === elementoActualizado.ele_id);
          if (index !== -1) {
            // Se asigna el valor actualizado directamente, sin sumarle nada extra
            prestamo.elementos[index].ele_cantidad_actual = elementoActualizado.ele_cantidad_actual;
          }
          console.log(`Stock actualizado para elemento ${elementoActualizado.ele_id}: ${elementoActualizado.ele_cantidad_actual}`);
        });
  
        console.log(`Préstamo ${prestamo.idPrestamo} cancelado correctamente. Actualizando historial...`);
        // Actualizar historial o recargar la data según corresponda
        this.getHistory();
      },
      error => console.error("Error en la solicitud:", error));
  }
 
  
  /**
   * actualizarToken - Actualiza el token recuperado desde el servicio de autenticación.
   * @returns {void}
   */
  actualizarToken(): void {
    this.token = this.authService.getToken();
    if (!this.token) {
      this.snackBar.open('Token no disponible', 'Cerrar', { duration: 3000 });
    }
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en la solicitud:', error);
    return throwError(() => new Error(error.message || 'Error desconocido'));
  }

  esCancelable(prestamo: any): boolean {

    return prestamo.estado === 'Activo' || prestamo.estado === 'Creado';
  }
  
  
  
}  