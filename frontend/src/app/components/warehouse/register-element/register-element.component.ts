import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElementoService } from '../../../services/elemento.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Ubicacion } from '../../../models/ubicacion.model';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { UbicacionService } from '../../../services/ubicacion.service';
import { MatSnackBar } from '@angular/material/snack-bar'; // 

@Component({
  selector: 'app-register-element',
  standalone: true,
  imports: [HttpClientModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register-element.component.html',
  styleUrls: ['./register-element.component.css'],
})
export class RegisterElementComponent implements OnInit {
  formulario: FormGroup;
  ubicaciones: Ubicacion[] = [];
  imagenSeleccionada: string | null = null;

  constructor(
    private fb: FormBuilder,
    private elementoService: ElementoService,
    private authService: AuthService,
    private router: Router,
    private ubicacionService: UbicacionService,
    private snackBar: MatSnackBar // Inyectar MatSnackBar
  ) {
    this.formulario = this.fb.group({
      ele_nombre: ['', Validators.required],
      ele_cantidad_total: ['', [Validators.required, Validators.min(1)]],
      ubi_ele_id: ['', Validators.required],
      ele_imagen: [null],
    });
  }

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.obtenerUbicaciones();
  }

  obtenerUbicaciones(): void {
    this.ubicacionService.getUbicaciones().subscribe(
      (data: Ubicacion[]) => {
        this.ubicaciones = data;
      },
      (error: any) => {
        console.error('Error al obtener ubicaciones:', error);
      }
    );
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenSeleccionada = reader.result as string;
        this.formulario.patchValue({ ele_imagen: this.imagenSeleccionada });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.formulario.valid) {
      const elementoData = {
        ele_nombre: this.formulario.get('ele_nombre')?.value,
        ele_cantidad_total: this.formulario.get('ele_cantidad_total')?.value,
        ubi_ele_id: this.formulario.get('ubi_ele_id')?.value,
        ele_imagen: this.imagenSeleccionada
      };

      console.log('Datos enviados:', elementoData);

      this.elementoService.crearElemento(elementoData).subscribe(
        (response) => {
          console.log('Elemento creado:', response);
          this.snackBar.open('Elemento registrado correctamente', '', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            panelClass: ['snack-bar-success'] // Clase CSS para el color verde
          });
          this.formulario.reset();
        },
        (error: any) => {
          console.error('Error al crear elemento:', error);
          this.snackBar.open('Error al registrar el elemento', '', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            panelClass: ['snack-bar-error']
          });
        }
      );
    } else {
      this.snackBar.open('Por favor, complete el formulario correctamente', '', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: ['snack-bar-warning']
      });
    }
  }
}