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
    CommonModule
  ],
})
export class EditModalComponent implements OnInit, AfterViewInit {
  @ViewChild('nombreInput', { static: false }) nombreInput!: ElementRef;
  ubicaciones: Ubicacion[] = [];
  fileSelected = false;

  constructor(
    public dialogRef: MatDialogRef<EditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { form: FormGroup; ubicaciones: Ubicacion[] },
    private ubicacionService: UbicacionService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

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
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.data.form.patchValue({ ele_imagen: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  obtenerUbicaciones(): void {
    this.ubicacionService.getUbicaciones().subscribe(
      (data: Ubicacion[]) => {
        console.log('Ubicaciones obtenidas en el modal de edición:', data); // Log para verificar los datos
        this.ubicaciones = data;
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error('Error al obtener ubicaciones en el modal de edición:', error);
      }
    );
  }
}
