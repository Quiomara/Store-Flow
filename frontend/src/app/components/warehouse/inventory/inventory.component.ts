import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ElementoService } from '../../../services/elemento.service';
import { Elemento } from '../../../models/elemento.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
})
export class InventoryComponent implements OnInit {
  searchForm: FormGroup;
  inventario: Elemento[] = [];
  filteredInventario: MatTableDataSource<Elemento>;
  displayedColumns: string[] = ['ele_id', 'ele_nombre', 'ele_cantidad_total', 'ele_cantidad_actual', 'ubi_ele_id', 'ele_imagen', 'detalles'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private elementoService: ElementoService) {
    this.searchForm = this.fb.group({
      searchId: [''],
      searchElemento: [''],
    });

    this.filteredInventario = new MatTableDataSource<Elemento>(this.inventario);

    // Añadir el filtrado dinámico
    this.searchForm.valueChanges.subscribe(() => {
      this.applyFilter();
    });
  }

  ngOnInit(): void {
    this.obtenerInventario();
    this.filteredInventario.paginator = this.paginator;
  }

  obtenerInventario(): void {
    this.elementoService.getElementos().subscribe(
      (data: Elemento[]) => {
        this.inventario = data;
        this.filteredInventario.data = this.inventario;
      },
      (error: any) => {
        console.error('Error al obtener inventario:', error);
        this.snackBar.open('Error al obtener inventario', '', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          panelClass: ['snack-bar-error']
        });
      }
    );
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

  verImagen(imagen: string): void {
    this.snackBar.open('Mostrando imagen: ' + imagen, '', { duration: 2000 });
  }

  editarElemento(elemento: Elemento): void {
    this.snackBar.open('Editando elemento: ' + elemento.ele_nombre, '', { duration: 2000 });
  }

  eliminarElemento(id: number): void {
    this.snackBar.open('Eliminando elemento con ID: ' + id, '', { duration: 2000 });
  }
}
