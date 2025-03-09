import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { CentroService } from '../../../services/centro.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  editForm: FormGroup; // Formulario reactivo para editar los datos del usuario
  centros: any[] = []; // Lista de centros de formación obtenida desde el servicio
  tiposUsuario: any[] = []; // Lista de tipos de usuario obtenida desde el servicio

  /**
   * Constructor del componente.
   * @param dialogRef Referencia al diálogo para cerrar el componente.
   * @param data Datos del usuario que se van a editar.
   * @param userService Servicio para obtener tipos de usuario.
   * @param centroService Servicio para obtener centros de formación.
   */
  constructor(
    public dialogRef: MatDialogRef<EditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private userService: UserService,
    private centroService: CentroService
  ) {
    // Inicialización del formulario con los valores actuales del usuario
    this.editForm = new FormGroup({
      cedula: new FormControl({ value: data.cedula, disabled: true }, Validators.required),
      primerNombre: new FormControl(data.primerNombre, Validators.required),
      segundoNombre: new FormControl(data.segundoNombre),
      primerApellido: new FormControl(data.primerApellido, Validators.required),
      segundoApellido: new FormControl(data.segundoApellido),
      email: new FormControl(data.email, [Validators.required, Validators.email]),
      telefono: new FormControl(data.telefono, Validators.required),
      centroFormacion: new FormControl('', Validators.required),
      tipoUsuario: new FormControl(data.tipoUsuario, Validators.required)
    });
  }

  /**
   * Inicializa los datos cuando el componente se carga.
   * Llama a los métodos para obtener los centros de formación y tipos de usuario.
   */
  ngOnInit(): void {
    this.obtenerCentrosFormacion();
    this.obtenerTiposUsuario();
  }

  /**
   * Obtiene la lista de centros de formación desde el servicio.
   * @returns {void}
   */
  obtenerCentrosFormacion(): void {
    this.centroService.getCentros().subscribe(
      (response: any) => {
        this.centros = response.data;
        this.editForm.patchValue({
          centroFormacion: this.data.centroFormacion
        });
      },
      (error) => {
        // Se eliminó el console.log
      }
    );
  }

  /**
   * Obtiene la lista de tipos de usuario desde el servicio.
   * @returns {void}
   */
  obtenerTiposUsuario(): void {
    this.userService.getTiposUsuario().subscribe(
      (response: any) => {
        if (Array.isArray(response)) {
          this.tiposUsuario = response;
        } else {
          // Se eliminó el console.log
        }
      },
      (error) => {
        // Se eliminó el console.log
      }
    );
  }

  /**
   * Guarda los cambios realizados en el formulario si es válido.
   * Envía los datos actualizados y cierra el diálogo.
   * @returns {void}
   */
  onSave(): void {
    if (this.editForm.valid) {
      const updatedUser = { ...this.data, ...this.editForm.getRawValue() };
      this.dialogRef.close(updatedUser);
    }
  }

  /**
   * Cancela la edición y cierra el diálogo sin realizar cambios.
   * @returns {void}
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}

