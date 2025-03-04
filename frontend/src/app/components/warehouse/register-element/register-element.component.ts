import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElementoService } from '../../../services/elemento.service';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Ubicacion } from '../../../models/ubicacion.model';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { UbicacionService } from '../../../services/ubicacion.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register-element',
  standalone: true,
  imports: [HttpClientModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register-element.component.html',
  styleUrls: ['./register-element.component.css'],
})
export class RegisterElementComponent implements OnInit {
  @ViewChild('nombreInput', { static: false }) nombreInput!: ElementRef;
  formulario: FormGroup;
  ubicaciones: Ubicacion[] = [];
  imagenSeleccionada: string | null = null;
  readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

  constructor(
    private fb: FormBuilder,
    private elementoService: ElementoService,
    private authService: AuthService,
    private router: Router,
    private ubicacionService: UbicacionService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.formulario = this.fb.group({
      ele_nombre: ['', Validators.required],
      ele_cantidad_total: ['', [Validators.required, Validators.min(1)]],
      ubi_ele_id: ['', Validators.required],
      ele_imagen: [null],
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.obtenerUbicaciones();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.nombreInput) {
        this.nombreInput.nativeElement.focus();
        this.cdr.detectChanges();
      }
    });
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
  
    // Validar que el archivo sea una imagen permitida
    if (!file || !file.type.match('image/(jpeg|png)')) {
      alert('Solo se permiten imágenes en formato JPG o PNG.');
      return;
    }
  
    // Validar tamaño máximo del archivo
    if (file.size > this.MAX_FILE_SIZE) {
      alert('El archivo es demasiado grande. El tamaño máximo permitido es de 25 MB.');
      return;
    }
  
    // Procesar la imagen
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;
  
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          if (width > height) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          } else {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
  
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
  
          // Convertir a base64 y actualizar el formulario
          this.formulario.patchValue({ ele_imagen: canvas.toDataURL('image/jpeg') });
        } else {
          this.formulario.patchValue({ ele_imagen: reader.result as string });
        }
      };
    };
    reader.readAsDataURL(file);
  }
  

  onSubmit(): void {
    if (this.formulario.valid) {
      const elementoData = {
        ele_nombre: this.formulario.get('ele_nombre')?.value,
        ele_cantidad_total: this.formulario.get('ele_cantidad_total')?.value,
        ubi_ele_id: this.formulario.get('ubi_ele_id')?.value,
        ele_imagen: this.formulario.get('ele_imagen')?.value,
      };

      console.log('Datos enviados:', elementoData);

      this.elementoService.crearElemento(elementoData).subscribe(
        (response) => {
          console.log('Elemento creado:', response);
          this.snackBar.open('Elemento registrado correctamente', '', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            panelClass: ['snack-bar-success'],
          });
          this.formulario.reset();
        },
        (error: any) => {
          console.error('Error al crear elemento:', error);
          this.snackBar.open('Error al registrar el elemento', '', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            panelClass: ['snack-bar-error'],
          });
        }
      );
    } else {
      this.snackBar.open('Por favor, complete el formulario correctamente', '', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: ['snack-bar-warning'],
      });
    }
  }
}
