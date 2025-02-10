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
  editForm: FormGroup;
  centros: any[] = [];
  tiposUsuario: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<EditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private userService: UserService,
    private centroService: CentroService
  ) {
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

  ngOnInit(): void {
    this.obtenerCentrosFormacion();
    this.obtenerTiposUsuario();
  }

  obtenerCentrosFormacion(): void {
    this.centroService.getCentros().subscribe(
      (response: any) => {
        this.centros = response.data;
        console.log('Centros de formación obtenidos:', this.centros);
        this.editForm.patchValue({
          centroFormacion: this.data.centroFormacion
        });
        console.log('Centro de formación inicializado:', this.editForm.get('centroFormacion')?.value);
      },
      (error) => {
        console.error('Error al obtener centros de formación', error);
        if (error.error) {
          console.error('Detalles del error:', error.error);
        }
        if (error.message) {
          console.error('Mensaje del error:', error.message);
        }
        if (error.status) {
          console.error('Código de estado del error:', error.status);
        }
      }
    );
  }

  obtenerTiposUsuario(): void {
    this.userService.getTiposUsuario().subscribe(
      (response: any) => {
        if (Array.isArray(response)) {
          this.tiposUsuario = response;
        } else {
          console.error('Formato de respuesta inesperado para tipos de usuario:', response);
        }
      },
      (error) => {
        console.error('Error al obtener tipos de usuario', error);
      }
    );
  }

  onSave(): void {
    if (this.editForm.valid) {
      const updatedUser = { ...this.data, ...this.editForm.getRawValue() };
      console.log('Datos actualizados que se enviarán:', updatedUser);
      this.dialogRef.close(updatedUser);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
