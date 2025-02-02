import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'; // Añade este import

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.css'],
  standalone: true, // Asegúrate que está marcado como standalone
  imports: [
    MatDialogModule, // Añade este módulo
    MatIconModule,
    MatButtonModule // Añade este módulo
  ]
})
export class ImageModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { imagen: string, nombre: string }) {}
}