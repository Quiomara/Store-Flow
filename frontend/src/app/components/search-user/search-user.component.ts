import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';

@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.css'],
  providers: [UserService]
})
export class SearchUserComponent implements OnInit {
  searchForm: FormGroup;
  centros: any[] = [];
  searchResults: User[] = [];
  filteredResults: User[] = [];
  errores: any = {};

  constructor(private userService: UserService, private fb: FormBuilder, public dialog: MatDialog) {
    this.searchForm = this.fb.group({
      nombre: [''],
      centroFormacion: [''],
      email: [''],
      cedula: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.userService.getCentros().subscribe(
      (response: any) => {
        if (Array.isArray(response)) {
          this.centros = response;
        } else if (response && Array.isArray(response.data)) {
          this.centros = response.data;
        } else {
          console.error('Formato de respuesta inesperado para centros de formación:', response);
        }
      },
      (error: any) => {
        console.error('Error al obtener centros de formación', error);
      }
    );

    this.searchForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(values => {
      this.filterUsers(values);
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (response: User[]) => {
        console.log('Usuarios en loadUsers:', response);
        this.searchResults = response;
        this.filteredResults = response.slice(0, 12);
        this.sortUsersAlphabetically(); // Ordenar inicialmente
        console.log('Resultados filtrados:', this.filteredResults);
        this.filteredResults.forEach(user => console.log('Usuario:', user)); // Verificar cada usuario
      },
      (error: any) => {
        console.error('Error al obtener usuarios', error);
      }
    );
  }

  filterUsers(values: any): void {
    if (Array.isArray(this.searchResults)) {
      this.filteredResults = this.searchResults.filter(user => {
        return (values.nombre === '' || `${user.primerNombre} ${user.segundoNombre} ${user.primerApellido} ${user.segundoApellido}`.toLowerCase().includes(values.nombre.toLowerCase())) &&
               (values.centroFormacion === '' || user.centroFormacion === values.centroFormacion) &&
               (values.email === '' || user.email.toLowerCase().includes(values.email.toLowerCase())) &&
               (values.cedula === '' || user.cedula.toString().includes(values.cedula)); // Convertir a string
      });

      this.sortUsersAlphabetically(); // Ordenar después de filtrar
      console.log('Resultados filtrados:', this.filteredResults);
    } else {
      console.error('Error: searchResults no es un arreglo');
    }
  }

  sortUsersAlphabetically(): void {
    if (Array.isArray(this.filteredResults)) {
      this.filteredResults.sort((a, b) => `${a.primerNombre} ${a.primerApellido}`.localeCompare(`${b.primerNombre} ${b.primerApellido}`));
    } else {
      console.error('Error: filteredResults no es un arreglo');
    }
  }

  onEdit(user: User) {
    console.log(`Editar usuario: ${user.primerNombre} ${user.primerApellido}`);
    // Aquí puedes añadir la lógica para navegar a la página de edición o abrir un formulario de edición.
  }

  onDelete(user: User) {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '400px',
      data: { user: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user.cedula.toString()).subscribe(
          (response: any) => {
            console.log('Usuario eliminado', response);
            this.filteredResults = this.filteredResults.filter(u => u.cedula !== user.cedula);
          },
          (error: any) => {
            console.error('Error al eliminar usuario', error);
            this.errores.delete = 'No se pudo eliminar el usuario. Inténtelo de nuevo más tarde.';
          }
        );
      }
    });
  }
}











