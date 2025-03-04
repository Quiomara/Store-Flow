import { Component, Inject, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, OnInit,} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule,} from '@angular/material/dialog';
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
  @ViewChild('nombreInput', { static: false }) nombreInput!: ElementRef;
  ubicaciones: Ubicacion[] = [];
  fileSelected = false;
  selectedFile: File | null = null; // Definir selectedFile
  readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

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

  ngOnInit(): void {
    this.ubicaciones = this.data.ubicaciones;
    this.obtenerUbicaciones();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.nombreInput.nativeElement.focus();
      this.cdr.detectChanges();
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
  
    // Verificar que el archivo es válido y que es una imagen
    if (!file) {
      return;
    }
  
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen (JPG o PNG).');
      return;
    }
  
    this.fileSelected = !!file;
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
  
  actualizarElemento(): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      console.error('Token no encontrado');
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

  obtenerUbicaciones(): void {
    this.ubicacionService.getUbicaciones().subscribe(
      (data: Ubicacion[]) => {
        console.log('Ubicaciones obtenidas en el modal de edición:', data);
        this.ubicaciones = data;
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error('Error al obtener ubicaciones en el modal de edición:', error);
      }
    );
  }

  guardar(): void {
    this.actualizarElemento().subscribe(
      (response: any) => {
        console.log('Elemento actualizado con éxito:', response);
        this.dialogRef.close(this.data.form.value);
      },
      (error: any) => {
        console.error('Error al actualizar el elemento:', error);
      }
    );
  }
}
