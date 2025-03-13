import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UserService } from '../../../services/user.service';
import { CentroService } from '../../../services/centro.service';
import { User, UserBackend } from '../../../models/user.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Componente para la búsqueda, visualización y gestión de usuarios.
 *
 * @component
 */
@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatTableModule
  ],
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.css'],
  providers: [UserService, CentroService]
})
export class SearchUserComponent implements OnInit, AfterViewInit {
  /** Formulario reactivo para la búsqueda de usuarios */
  searchForm: FormGroup;

  /** Lista de centros de formación */
  centros: any[] = [];

  /** Tipos de usuario disponibles */
  tiposUsuario: any[] = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Instructor' },
    { id: 3, nombre: 'Almacen' }
  ];

  /** Resultados de la búsqueda de usuarios */
  searchResults: User[] = [];

  /** Resultados filtrados de los usuarios */
  filteredResults: User[] = [];

  /** Fuente de datos para la tabla de usuarios */
  dataSource = new MatTableDataSource<User>(this.filteredResults);

  /** Columnas a mostrar en la tabla */
  displayedColumns: string[] = ['cedula', 'nombre', 'centroFormacion', 'email', 'telefono', 'tipoUsuario', 'acciones'];

  /** Objeto para almacenar los errores de validación */
  errores: any = {};

  /** Referencia al paginador */
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  /**
   * Constructor del componente.
   *
   * @param userService - Servicio para obtener los usuarios.
   * @param centroService - Servicio para obtener los centros de formación.
   * @param fb - Instancia de FormBuilder para crear formularios reactivos.
   * @param dialog - Instancia de MatDialog para manejar los diálogos modales.
   * @param snackBar - Instancia de MatSnackBar para mostrar notificaciones.
   */
  constructor(
    private userService: UserService,
    private centroService: CentroService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      nombre: [''],
      centroFormacion: [''],
      email: [''],
      cedula: ['']
    });
  }

  /**
   * Inicializa el componente y carga los centros de formación.
   *
   * Configura la suscripción para filtrar usuarios al cambiar los valores del formulario.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.loadCentros();
    this.searchForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(values => {
      this.filterUsers(values);
    });
  }

  /**
   * Configura la paginación para la tabla después de que la vista se haya inicializado.
   *
   * @returns void
   */
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Carga los usuarios desde el servicio `UserService`.
   *
   * Asigna el centro de formación y el tipo de usuario a cada usuario obtenido y actualiza la fuente de datos de la tabla.
   *
   * @returns void
   */
  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (response: User[]) => {
        this.searchResults = response.map(user => {
          user.centroFormacion = user.cen_nombre || 'N/A';
          user.tipoUsuario = user.tip_usr_nombre || 'N/A';
          return user;
        });
        this.filteredResults = this.searchResults;
        this.dataSource.data = this.filteredResults;
        this.sortUsersAlphabetically();
        this.updatePaginator();
      },
      (error: any) => {
        console.error('Error al obtener usuarios', error);
      }
    );
  }

  /**
   * Carga los centros de formación desde el servicio `CentroService`.
   *
   * Una vez cargados, se invoca la carga de usuarios.
   *
   * @returns void
   */
  loadCentros(): void {
    this.centroService.getCentros().subscribe(
      (response: any) => {
        this.centros = response.data;
        this.loadUsers(); // Carga los usuarios después de obtener los centros
      },
      (error: any) => {
        console.error('Error al obtener centros de formación', error);
      }
    );
  }

  /**
 * Filtra los usuarios en base a los valores del formulario de búsqueda.
 *
 * @param values - Los valores del formulario de búsqueda.
 * @returns void
 */
filterUsers(values: any): void {
  this.filteredResults = this.searchResults.filter(user => {
    const nombreCompleto = `${user.primerNombre} ${user.segundoNombre} ${user.primerApellido} ${user.segundoApellido}`.toLowerCase();
    const nombreFiltrado = values.nombre.toLowerCase();
    const centroFiltrado = this.centros.find(c => c.cen_id === Number(values.centroFormacion))?.cen_nombre;

    return (values.nombre === '' || nombreCompleto.includes(nombreFiltrado)) &&
           (values.centroFormacion === '' || user.centroFormacion === centroFiltrado) &&
           (values.email === '' || user.email.toLowerCase().includes(values.email.toLowerCase())) &&
           (values.cedula === '' || user.cedula.toString().includes(values.cedula));
  });

  this.dataSource.data = this.filteredResults;
  this.sortUsersAlphabetically();
  this.updatePaginator();
}

/**
 * Actualiza el paginador de la tabla después de filtrar los usuarios.
 *
 * Asigna la longitud de los resultados filtrados al paginador.
 *
 * @returns void
 */
updatePaginator(): void {
  this.dataSource.paginator = this.paginator;
  this.paginator.length = this.filteredResults.length;
}

/**
 * Ordena los usuarios alfabéticamente por nombre.
 *
 * @returns void
 */
sortUsersAlphabetically(): void {
  this.filteredResults.sort((a, b) =>
    `${a.primerNombre} ${a.primerApellido}`.localeCompare(`${b.primerNombre} ${b.primerApellido}`)
  );
}

/**
 * Abre un diálogo para editar un usuario.
 *
 * Se abre un diálogo modal con los datos del usuario seleccionado para editar. Una vez cerrado el diálogo,
 * si se confirman los cambios, se actualiza el usuario a través del servicio y se recargan los usuarios.
 *
 * @param user - El usuario a editar.
 * @returns void
 */
onEdit(user: User): void {
  const centroNombre = this.centros.find(c => c.cen_id === user.centroFormacion)?.cen_nombre || user.centroFormacion;
  const dialogRef = this.dialog.open(EditUserComponent, {
    width: '600px',
    data: {
      ...user,
      centroFormacion: centroNombre
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      const userBackend: Partial<UserBackend> = {
        usr_cedula: result.cedula,
        usr_primer_nombre: result.primerNombre,
        usr_segundo_nombre: result.segundoNombre,
        usr_primer_apellido: result.primerApellido,
        usr_segundo_apellido: result.segundoApellido,
        usr_correo: result.email,
        usr_telefono: result.telefono,
        cen_id: this.centros.find(centro => centro.cen_nombre === result.centroFormacion)?.cen_id,
        tip_usr_id: this.tiposUsuario.find(tipo => tipo.nombre === result.tipoUsuario)?.id
      };

      this.userService.updateUser(result.cedula.toString(), userBackend).subscribe(
        (response: any) => {
          this.loadUsers();
        },
        (error: any) => {
          // Manejo de errores (sin usar console.log)
        }
      );
    }
  });
}

  /**
   * Abre un diálogo de confirmación para eliminar un usuario.
   * @param {User} user El usuario a eliminar
   */
  onDelete(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '400px',
      data: { user: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user.cedula.toString()).subscribe(
          () => {
            this.filteredResults = this.filteredResults.filter(u => u.cedula !== user.cedula);
            this.dataSource.data = this.filteredResults;
            this.updatePaginator();

            this.snackBar.open(`Usuario ${user.primerNombre} eliminado con éxito`, '', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'bottom',
              panelClass: ['snack-bar-success'],
            });
          },
          (error) => {
            console.error('Error al eliminar usuario', error);
            this.snackBar.open('Error al eliminar el usuario', '', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'bottom',
              panelClass: ['snack-bar-error'],
            });
          }
        );
      }
    });
  }
}

