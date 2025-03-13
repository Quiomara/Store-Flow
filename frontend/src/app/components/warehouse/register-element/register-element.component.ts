import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ElementoService } from '../../../services/elemento.service';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Ubicacion } from '../../../models/ubicacion.model';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { UbicacionService } from '../../../services/ubicacion.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * Componente para registrar un nuevo elemento en el inventario.
 *
 * @remarks
 * Este componente permite a los usuarios registrar un nuevo elemento proporcionando un formulario con los datos
 * necesarios, incluyendo el nombre del elemento, cantidad total, ubicación y una imagen opcional.
 */
@Component({
  selector: 'app-register-element',
  standalone: true,
  imports: [HttpClientModule, CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './register-element.component.html',
  styleUrls: ['./register-element.component.css'],
})
export class RegisterElementComponent implements OnInit {
  /** Referencia al input del nombre para aplicar focus. */
  @ViewChild('nombreInput', { static: false }) nombreInput!: ElementRef;

  /** Formulario reactivo para el registro de un elemento. */
  formulario: FormGroup;
  /** Lista de ubicaciones disponibles. */
  ubicaciones: Ubicacion[] = [];
  /** Imagen seleccionada, en formato base64, o null si no se ha seleccionado. */
  imagenSeleccionada: string | null = null;
  /** Tamaño máximo permitido para el archivo, 25 MB. */
  readonly MAX_FILE_SIZE = 25 * 1024 * 1024;

  /**
   * Crea una instancia del componente RegisterElementComponent.
   *
   * @param fb - Servicio para la creación de formularios.
   * @param elementoService - Servicio para gestionar elementos.
   * @param authService - Servicio de autenticación.
   * @param router - Servicio para la navegación entre rutas.
   * @param ubicacionService - Servicio para obtener ubicaciones.
   * @param snackBar - Servicio para mostrar notificaciones.
   * @param cdr - Detector de cambios para actualizar la vista.
   */
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

  /**
   * ngOnInit - Inicializa el componente.
   *
   * @remarks
   * Verifica si el usuario está autenticado y, en caso afirmativo, obtiene la lista de ubicaciones.
   *
   * @returns void
   */
  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.obtenerUbicaciones();
  }

  /**
   * ngAfterViewInit - Se ejecuta después de que la vista se ha inicializado.
   *
   * @remarks
   * Aplica focus al input de nombre para mejorar la experiencia del usuario.
   *
   * @returns void
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.nombreInput) {
        this.nombreInput.nativeElement.focus();
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Obtiene las ubicaciones disponibles mediante el servicio UbicacionService.
   *
   * @returns void
   */
  obtenerUbicaciones(): void {
    this.ubicacionService.getUbicaciones().subscribe(
      (data: Ubicacion[]) => {
        this.ubicaciones = data;
      },
      (error: any) => {
        this.snackBar.open('Error al obtener ubicaciones', '', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          panelClass: ['snack-bar-error'],
        });
      }
    );
  }

  /**
   * Maneja la selección de un archivo de imagen.
   *
   * @param event - Evento de selección de archivo.
   * @returns void
   */
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    // Validar que se haya seleccionado un archivo y que sea una imagen permitida (JPG o PNG).
    if (!file || !file.type.match('image/(jpeg|png)')) {
      alert('Solo se permiten imágenes en formato JPG o PNG.');
      return;
    }

    // Validar que el tamaño del archivo no exceda el máximo permitido.
    if (file.size > this.MAX_FILE_SIZE) {
      alert('El archivo es demasiado grande. El tamaño máximo permitido es de 25 MB.');
      return;
    }

    // Procesar la imagen y actualizar el formulario con la imagen redimensionada o original.
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

          // Convertir la imagen redimensionada a base64 y actualizar el formulario.
          this.formulario.patchValue({ ele_imagen: canvas.toDataURL('image/jpeg') });
        } else {
          this.formulario.patchValue({ ele_imagen: reader.result as string });
        }
      };
    };
    reader.readAsDataURL(file);
  }

  /**
   * Envía el formulario para crear un nuevo elemento.
   *
   * @remarks
   * Valida que el formulario sea válido y envía los datos al servicio para registrar el nuevo elemento.
   * Muestra notificaciones de éxito o error según corresponda.
   *
   * @returns void
   */
  onSubmit(): void {
    if (this.formulario.valid) {
      const elementoData = {
        ele_nombre: this.formulario.get('ele_nombre')?.value,
        ele_cantidad_total: this.formulario.get('ele_cantidad_total')?.value,
        ubi_ele_id: this.formulario.get('ubi_ele_id')?.value,
        ele_imagen: this.formulario.get('ele_imagen')?.value,
      };

      this.elementoService.crearElemento(elementoData).subscribe(
        (response) => {
          this.snackBar.open('Elemento registrado correctamente', '', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            panelClass: ['snack-bar-success'],
          });
          this.formulario.reset();
        },
        (error: any) => {
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
