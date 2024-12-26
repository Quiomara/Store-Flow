import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.css'],
  providers: [UserService]
})
export class SearchUserComponent implements OnInit {
  searchQuery: string = '';
  centros: any[] = [];
  searchResults: User[] = [];
  errores: any = {};

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getCentros().subscribe(
      response => {
        if (response && Array.isArray(response.data)) {
          this.centros = response.data;
        } else {
          console.error('Formato de respuesta inesperado para centros de formación:', response);
        }
      },
      error => {
        console.error('Error al obtener centros de formación', error);
      }
    );
  }

  onSearch() {
    // Lógica de búsqueda vendrá después
  }

  onEdit(user: User) {
    // Lógica para editar un usuario
    console.log(`Editar usuario: ${user.primerNombre} ${user.primerApellido}`);
    // Aquí puedes añadir la lógica para navegar a la página de edición o abrir un formulario de edición.
  }

  onDelete(user: User) {
    // Lógica para eliminar un usuario
    if (confirm(`¿Está seguro de que desea eliminar al usuario ${user.primerNombre} ${user.primerApellido}?`)) {
      this.userService.deleteUser(user.cedula.toString()).subscribe(
        response => {
          console.log('Usuario eliminado', response);
          this.searchResults = this.searchResults.filter(u => u.cedula !== user.cedula);
        },
        error => {
          console.error('Error al eliminar usuario', error);
          this.errores.delete = 'No se pudo eliminar el usuario. Inténtelo de nuevo más tarde.';
        }
      );
    }
  }
}




