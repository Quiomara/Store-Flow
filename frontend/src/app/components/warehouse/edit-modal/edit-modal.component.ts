import { Component, Inject, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { UbicacionService } from '../../../services/ubicacion.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Ubicacion } from '../../../models/ubicacion.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

/**
 * Componente modal para editar un elemento.
 *
 * @remarks
 * Permite al usuario modificar la información de un elemento, incluyendo su imagen y ubicación.
 */
@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.css'],
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule,
  ],
})
export class EditModalComponent implements OnInit, AfterViewInit {
  /** Referencia al input de nombre para poder hacer focus. */
  @ViewChild('nombreInput', { static: false }) nombreInput!: ElementRef;

  /** Lista de ubicaciones disponibles. */
  ubicaciones: Ubicacion[] = [];
  
  /** Flag que indica si se ha seleccionado un archivo. */
  fileSelected = false;
  
  /** Archivo seleccionado (imagen) o null si no se ha seleccionado. */
  selectedFile: File | null = null;
  
  /** Tamaño máximo permitido para el archivo (25 MB). */
  readonly MAX_FILE_SIZE = 25 * 1024 * 1024;

  /**
   * Crea una instancia del componente EditModal.
   *
   * @param dialogRef - Referencia al diálogo para cerrarlo.
   * @param data - Datos inyectados que contienen el formulario y la lista de ubicaciones.
   * @param ubicacionService - Servicio para obtener ubicaciones.
   * @param authService - Servicio de autenticación.
   * @param router - Servicio de enrutamiento.
   * @param cdr - Detector de cambios para actualizar la vista.
   * @param http - Cliente HTTP para realizar solicitudes.
   */
  constructor(
    public dialogRef: MatDialogRef<EditModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { form: FormGroup; ubicaciones: Ubicacion[] },
    private ubicacionService: UbicacionService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) { }

  /**
   * ngOnInit - Inicializa el componente asignando las ubicaciones y obteniéndolas desde el servicio.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.ubicaciones = this.data.ubicaciones;
    this.obtenerUbicaciones();
  }

  /**
   * ngAfterViewInit - Se ejecuta después de la inicialización de la vista.
   *
   * @returns void
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.nombreInput.nativeElement.focus();
      this.cdr.detectChanges();
    });
  }

  /**
   * onNoClick - Cierra el modal sin realizar cambios.
   *
   * @returns void
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * onFileSelected - Maneja la selección de un archivo de imagen, validándolo y redimensionándolo.
   *
   * @param event - Evento de selección de archivo.
   * @returns void
   */
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    // Verificar que se haya seleccionado un archivo.
    if (!file) {
      return;
    }

    // Validar que el archivo sea una imagen.
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen (JPG o PNG).');
      return;
    }

    this.fileSelected = true;
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const resizedImage = canvas.toDataURL('image/jpeg');
        this.data.form.patchValue({ ele_imagen: resizedImage });
      };
    };
    reader.readAsDataURL(file);
  }

  /**
   * actualizarElemento - Actualiza el elemento con la información del formulario.
   *
   * @returns Un observable que emite la respuesta de la solicitud HTTP.
   */
  actualizarElemento(): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return of(null);
    }

    const elemento = {
      ele_id: this.data.form.get('ele_id')?.value,
      ele_nombre: this.data.form.get('ele_nombre')?.value,
      ele_cantidad_total: this.data.form.get('ele_cantidad_total')?.value,
      ele_cantidad_actual: this.data.form.get('ele_cantidad_actual')?.value,
      ele_imagen: this.data.form.get('ele_imagen')?.value,
      ubi_ele_id: this.ubicaciones.find(ubic => ubic.ubi_nombre === this.data.form.get('ubi_nombre')?.value)?.ubi_ele_id
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    return this.http.put('http://localhost:3000/api/elementos/actualizar', elemento, { headers });
  }

  /**
   * obtenerUbicaciones - Obtiene las ubicaciones disponibles a través del servicio UbicacionService.
   *
   * @returns void
   */
  obtenerUbicaciones(): void {
    this.ubicacionService.getUbicaciones().subscribe(
      (data: Ubicacion[]) => {
        this.ubicaciones = data;
        this.cdr.detectChanges();
      },
      (error: any) => {
        // Manejo de errores adecuado.
      }
    );
  }

  /**
   * guardar - Guarda los cambios realizados en el formulario y actualiza el elemento.
   *
   * @returns void
   */
  guardar(): void {
    this.actualizarElemento().subscribe(
      (response: any) => {
        this.dialogRef.close(this.data.form.value);
      },
      (error: any) => {
        // Manejo de errores adecuado.
      }
    );
  }
}
