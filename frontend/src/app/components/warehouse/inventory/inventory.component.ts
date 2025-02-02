import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

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
  inventario: any[] = []; // Datos de ejemplo, se actualizarán con datos reales
  filteredInventario: MatTableDataSource<any>;
  displayedColumns: string[] = ['id', 'nombre', 'cantidadTotal', 'cantidadActual', 'ubicacion', 'imagen', 'detalles'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.searchForm = this.fb.group({
      searchId: [''],
      searchElemento: [''],
    });

    this.filteredInventario = new MatTableDataSource<any>(this.inventario);
  }

  ngOnInit(): void {
    // Aquí cargaríamos los datos reales del inventario
    this.filteredInventario.paginator = this.paginator;
  }

  // Métodos para ver imagen, editar y eliminar se agregarán después
  verImagen(imagen: string): void {
    this.snackBar.open('Mostrando imagen: ' + imagen, '', { duration: 2000 });
  }

  editarElemento(elemento: any): void {
    this.snackBar.open('Editando elemento: ' + elemento.nombre, '', { duration: 2000 });
  }

  eliminarElemento(id: number): void {
    this.snackBar.open('Eliminando elemento con ID: ' + id, '', { duration: 2000 });
  }
}
