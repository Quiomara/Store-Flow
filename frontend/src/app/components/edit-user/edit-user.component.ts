import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service'; // Importa el servicio de usuario si es necesario para obtener datos

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
  editForm: FormGroup;
  centros: any[] = [];
  tiposUsuario: any[] = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Instructor' },
    { id: 3, nombre: 'Almacen' }
    // Añade más tipos de usuario según sea necesario
  ];

  constructor(
    public dialogRef: MatDialogRef<EditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private fb: FormBuilder,
    private userService: UserService // Inyecta el servicio de usuario si es necesario
  ) {
    // Configurar el formulario utilizando FormControl
    this.editForm = new FormGroup({
      cedula: new FormControl({ value: data.cedula, disabled: true }, Validators.required),
      primerNombre: new FormControl(data.primerNombre, Validators.required),
      segundoNombre: new FormControl(data.segundoNombre),
      primerApellido: new FormControl(data.primerApellido, Validators.required),
      segundoApellido: new FormControl(data.segundoApellido),
      email: new FormControl(data.email, [Validators.required, Validators.email]),
      telefono: new FormControl(data.telefono, Validators.required),
      centroFormacion: new FormControl(data.centroFormacion, Validators.required),
      tipoUsuario: new FormControl(data.tipoUsuario, Validators.required) // Campo tipo usuario
    });
  }

  ngOnInit(): void {
    this.loadCentros();
  }

  loadCentros(): void {
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
  }

  onSave(): void {
    if (this.editForm.valid) {
      const updatedUser = { ...this.data, ...this.editForm.getRawValue() };
      this.dialogRef.close(updatedUser);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}


