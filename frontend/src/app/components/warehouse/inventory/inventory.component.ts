import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ElementoService } from '../../../services/elemento.service';
import { UbicacionService } from '../../../services/ubicacion.service';
import { Elemento } from '../../../models/elemento.model';
import { Ubicacion } from '../../../models/ubicacion.model';
import { ImageModalComponent } from '../image-modal/image-modal.component';
import { EditModalComponent } from '../edit-modal/edit-modal.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Observable } from 'rxjs';
import { PrestamoService } from '../../../services/prestamo.service';
import { HttpClient } from '@angular/common/http';

/**
 * Componente que administra el inventario de elementos.
 *
 * @remarks
 * Permite buscar, filtrar, visualizar detalles, editar y eliminar elementos del inventario.
 */
@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
})
export class InventoryComponent implements OnInit {
  /** Formulario para búsqueda de elementos. */
  searchForm: FormGroup;
  /** Formulario para edición de un elemento. */
  editForm: FormGroup;
  /** Lista de elementos del inventario. */
  inventario: Elemento[] = [];
  /** Lista de ubicaciones disponibles. */
  ubicaciones: Ubicacion[] = [];
  /** Lista de elementos prestados (no se usa en este ejemplo pero se mantiene para referencia). */
  elementosPrestados: any[] = [];
  /** Fuente de datos para la tabla de inventario filtrado. */
  filteredInventario: MatTableDataSource<Elemento>;
  /** Columnas a mostrar en la tabla de inventario. */
  displayedColumns: string[] = ['ele_id', 'ele_nombre', 'ele_cantidad_total', 'ele_cantidad_actual', 'ubi_nombre', 'ele_imagen', 'detalles'];

  /** Paginador para la tabla de inventario. */
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /**
   * Crea una instancia del componente InventoryComponent.
   *
   * @param prestamoService - Servicio para gestionar préstamos.
   * @param http - Cliente HTTP para realizar peticiones.
   * @param fb - Servicio para la creación de formularios.
   * @param snackBar - Servicio para mostrar notificaciones.
   * @param elementoService - Servicio para gestionar elementos.
   * @param ubicacionService - Servicio para gestionar ubicaciones.
   * @param dialog - Servicio para abrir diálogos modales.
   * @param router - Servicio para la navegación de rutas.
   */
  constructor(
    private prestamoService: PrestamoService,
    private http: HttpClient,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private elementoService: ElementoService,
    private ubicacionService: UbicacionService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      searchId: [''],
      searchElemento: [''],
    });

    this.editForm = this.fb.group({
      ele_id: [''],
      ele_nombre: [''],
      ele_cantidad_total: [''],
      ubi_nombre: [''],
      ele_imagen: [''],
      ele_cantidad_actual: ['']
    });

    this.filteredInventario = new MatTableDataSource<Elemento>(this.inventario);

    this.searchForm.valueChanges.subscribe(() => {
      this.applyFilter();
    });
  }

  /**
   * ngOnInit - Inicializa el componente obteniendo el inventario y las ubicaciones.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.obtenerInventario();
    this.obtenerUbicaciones();
    // Suscribirse al BehaviorSubject para recibir actualizaciones en tiempo real.
    this.elementoService.inventario$.subscribe({
      next: (data: Elemento[]) => {
        this.inventario = data;
        this.filteredInventario.data = data;
      },
      error: (error: any) => {
        // Manejo de error en la suscripción del inventario.
        console.error('Error en la suscripción del inventario', error);
      }
    });
    // Refrescar el inventario al iniciar el componente.
    this.elementoService.refreshInventario();
    this.filteredInventario.paginator = this.paginator;
  }

  /**
   * obtenerUbicaciones - Obtiene las ubicaciones disponibles a través del servicio.
   *
   * @returns void
   */
  obtenerUbicaciones(): void {
    this.ubicacionService.getUbicaciones().subscribe({
      next: (data: Ubicacion[]) => {
        this.ubicaciones = data;
      },
      error: (error: any) => {
        // Manejo de error al obtener ubicaciones.
        console.error('Error al obtener ubicaciones:', error);
        this.snackBar.open('Error al obtener ubicaciones', '', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          panelClass: ['snack-bar-error']
        });
        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /**
   * obtenerInventario - Obtiene el inventario de elementos desde el backend.
   *
   * @returns void
   */
  obtenerInventario(): void {
    this.elementoService.getElementos().subscribe({
      next: (data: Elemento[]) => {
        // Procesa los datos obtenidos del backend y asocia el nombre de la ubicación.
        this.inventario = data.map(elemento => ({
          ...elemento,
          ubi_nombre: this.ubicaciones.find(ubicacion => ubicacion.ubi_ele_id === elemento.ubi_ele_id)?.ubi_nombre || ''
        }));
        // Ordena el inventario por ID.
        this.inventario.sort((a, b) => a.ele_id - b.ele_id);
        this.filteredInventario.data = this.inventario;
      },
      error: (error: any) => {
        // Manejo de error al obtener inventario.
        console.error('Error al obtener inventario:', error);
        this.snackBar.open('Error al obtener inventario', '', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          panelClass: ['snack-bar-error']
        });
        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /**
   * applyFilter - Filtra el inventario según los criterios del formulario de búsqueda.
   *
   * @returns void
   */
  applyFilter(): void {
    const { searchId, searchElemento } = this.searchForm.value;
    let filteredData = this.inventario;

    if (searchId) {
      filteredData = filteredData.filter(elemento => elemento.ele_id.toString().includes(searchId));
    }
    if (searchElemento) {
      filteredData = filteredData.filter(elemento => elemento.ele_nombre.toLowerCase().includes(searchElemento.toLowerCase()));
    }
    this.filteredInventario.data = filteredData;
  }

  /**
   * verImagen - Abre un modal para visualizar la imagen del elemento.
   *
   * @param imagen - URL o cadena de la imagen.
   * @param nombre - Nombre del elemento.
   * @returns void
   */
  verImagen(imagen: string, nombre: string): void {
    this.dialog.open(ImageModalComponent, {
      data: { imagen, nombre }
    });
  }

  /**
   * editarElemento - Abre un modal para editar la información de un elemento.
   *
   * @param elemento - Elemento a editar.
   * @returns void
   */
  editarElemento(elemento: Elemento): void {
    this.editForm.setValue({
      ele_id: elemento.ele_id,
      ele_nombre: elemento.ele_nombre,
      ele_cantidad_total: elemento.ele_cantidad_total,
      ubi_nombre: elemento.ubi_nombre,
      ele_imagen: elemento.ele_imagen,
      ele_cantidad_actual: elemento.ele_cantidad_actual
    });

    const dialogRef = this.dialog.open(EditModalComponent, {
      width: '500px',
      data: { form: this.editForm, ubicaciones: this.ubicaciones }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const cantidadTotalAnterior = elemento.ele_cantidad_total;
        const cantidadActualAnterior = elemento.ele_cantidad_actual;
        const nuevaCantidadTotal = result.ele_cantidad_total;
        const diferenciaCantidad = nuevaCantidadTotal - cantidadTotalAnterior;
        const nuevaCantidadActual = cantidadActualAnterior + diferenciaCantidad;

        const ubicacion = this.ubicaciones.find((ubicacion: Ubicacion) => ubicacion.ubi_nombre === result.ubi_nombre);
        if (!ubicacion) {
          this.snackBar.open('Error: Ubicación no válida', '', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            panelClass: ['snack-bar-error']
          });
          return;
        }

        const nuevoElemento: Elemento = {
          ...elemento,
          ele_nombre: result.ele_nombre,
          ele_cantidad_total: result.ele_cantidad_total,
          ubi_ele_id: ubicacion.ubi_ele_id,
          ele_imagen: result.ele_imagen,
          ele_cantidad_actual: nuevaCantidadActual
        };

        this.actualizarElemento(nuevoElemento);
      }
    });
  }

  /**
   * actualizarElemento - Envía una solicitud para actualizar la información de un elemento.
   *
   * @param elemento - Elemento con la información actualizada.
   * @returns void
   */
  actualizarElemento(elemento: Elemento): void {
    this.elementoService.actualizarElemento(elemento).subscribe({
      next: (res) => {
        this.snackBar.open('Elemento actualizado correctamente', '', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          panelClass: ['snack-bar-success']
        });
        this.obtenerInventario();
      },
      error: (error: any) => {
        console.error('Error al actualizar el elemento:', error);
        this.snackBar.open('Error al actualizar el elemento', '', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          panelClass: ['snack-bar-error']
        });
        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /**
   * eliminarElemento - Elimina un elemento del inventario después de confirmar la acción.
   *
   * @param elemento - Elemento a eliminar.
   * @returns void
   */
  eliminarElemento(elemento: Elemento): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Confirmar eliminación',
        mensaje: `¿Estás seguro de eliminar el elemento "${elemento.ele_nombre}"?`,
        textoBotonConfirmar: 'Eliminar',
        textoBotonCancelar: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.elementoService.eliminarElemento(elemento.ele_id).subscribe(
          (response: any) => {
            this.inventario = this.inventario.filter(e => e.ele_id !== elemento.ele_id);
            this.filteredInventario.data = this.inventario;
            this.snackBar.open(`Elemento "${elemento.ele_nombre}" eliminado correctamente`, '', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'bottom',
              panelClass: ['snack-bar-success']
            });
            this.obtenerInventario();
          },
          (error: any) => {
            console.error('Error al eliminar el elemento:', error);
            this.snackBar.open(`Error al eliminar "${elemento.ele_nombre}"`, '', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'bottom',
              panelClass: ['snack-bar-error']
            });
            if (error.status === 401 || error.status === 403) {
              this.router.navigate(['/login']);
            }
          }
        );
      }
    });
  }
}
