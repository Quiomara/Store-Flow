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
  searchForm: FormGroup;
  editForm: FormGroup;
  inventario: Elemento[] = [];
  ubicaciones: Ubicacion[] = [];
  filteredInventario: MatTableDataSource<Elemento>;
  displayedColumns: string[] = ['ele_id', 'ele_nombre', 'ele_cantidad_total', 'ele_cantidad_actual', 'ubi_nombre', 'ele_imagen', 'detalles'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
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

  ngOnInit(): void {
    this.obtenerUbicaciones();
    this.obtenerInventario();
    this.filteredInventario.paginator = this.paginator;
  }

  obtenerUbicaciones(): void {
    this.ubicacionService.getUbicaciones().subscribe({
      next: (data: Ubicacion[]) => {
        this.ubicaciones = data;
      },
      error: (error: any) => {
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

  obtenerInventario(): void {
    this.elementoService.getElementos().subscribe({
      next: (data: Elemento[]) => {
        console.log('Datos obtenidos del backend:', data); // Verificar que los datos incluyan ele_id
        this.inventario = data.map(elemento => ({
          ...elemento,
          ubi_nombre: this.ubicaciones.find(ubicacion => ubicacion.ubi_ele_id === elemento.ubi_ele_id)?.ubi_nombre || ''
        }));
        this.inventario.sort((a, b) => a.ele_id - b.ele_id);
        this.filteredInventario.data = this.inventario;
        console.log('Inventario procesado:', this.inventario); // Verificar que ele_id esté presente
      },
      error: (error: any) => {
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

  verImagen(imagen: string, nombre: string): void {
    this.dialog.open(ImageModalComponent, {
      data: { imagen, nombre }
    });
  }

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
        // Continúa desde aquí
        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/login']); // Redirigir al login si el token es inválido
        }
      }
    });
  }

  eliminarElemento(elemento: Elemento): void {
    console.log('Elemento a eliminar:', elemento); // Verifica que el objeto esté completo
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { elemento: elemento } // Pasa el objeto completo
    });
  
    dialogRef.afterClosed().subscribe((result: Elemento | null) => {
      if (result) {
        console.log('ID del elemento para eliminar (recibido del diálogo):', result.ele_id);
        console.log('Elemento completo recibido del diálogo:', result);
        if (!result.ele_id) {
          console.error('ele_id es undefined');
          return;
        }
        this.elementoService.eliminarElemento(result.ele_id).subscribe(
          (response: any) => {
            this.inventario = this.inventario.filter(e => e.ele_id !== result.ele_id);
            this.filteredInventario.data = this.inventario;
            this.snackBar.open(`Elemento "${result.ele_nombre}" eliminado correctamente`, '', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'bottom',
              panelClass: ['snack-bar-success']
            });
            this.obtenerInventario();
          },
          (error: any) => {
            console.error('Error al eliminar el elemento:', error);
            this.snackBar.open(`Error al eliminar "${result.ele_nombre}"`, '', {
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
      } else {
        console.log('Eliminación cancelada. El diálogo de confirmación cerró sin confirmar.');
      }
    });
  }
  
  

}
