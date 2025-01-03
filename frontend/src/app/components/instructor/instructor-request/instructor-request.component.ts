import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Elemento {
  nombre: string;
  cantidad: number;
  stock: number;
}

@Component({
  selector: 'app-instructor-request',
  templateUrl: './instructor-request.component.html',
  styleUrls: ['./instructor-request.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class InstructorRequestComponent {
  fechaActual: string = new Date().toLocaleDateString();
  nombreCurso: string = '';
  idSolicitud: string = this.generarIdSolicitud();
  nuevoElemento: Partial<Elemento> = { nombre: '', cantidad: 0 };
  elementos: Elemento[] = [];
  elementosFiltrados: Elemento[] = [];
  elementoSeleccionado: Elemento | null = null;

  // Simulación de elementos en la base de datos
  elementosDB: Elemento[] = [
    { nombre: 'Martillo', cantidad: 0, stock: 10 },
    { nombre: 'Destornillador', cantidad: 0, stock: 15 },
    { nombre: 'Llave Inglesa', cantidad: 0, stock: 5 },
    // Agrega más elementos según sea necesario
  ];

  generarIdSolicitud(): string {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
  }

  convertToUppercase() {
    this.nombreCurso = this.nombreCurso.toUpperCase();
  }

  filtrarElementos() {
    if (this.nuevoElemento.nombre) {
      this.elementosFiltrados = this.elementosDB.filter((elemento) =>
        elemento.nombre
          .toLowerCase()
          .includes(this.nuevoElemento.nombre!.toLowerCase())
      );
    } else {
      this.elementosFiltrados = [];
    }
  }

  seleccionarElemento(elemento: Elemento) {
    this.nuevoElemento.nombre = elemento.nombre;
    this.elementoSeleccionado = elemento;
    this.elementosFiltrados = [];
  }

  agregarElemento() {
    if (
      this.nuevoElemento.nombre &&
      this.nuevoElemento.cantidad! > 0 &&
      this.elementoSeleccionado
    ) {
      this.elementos.push({
        nombre: this.nuevoElemento.nombre,
        cantidad: this.nuevoElemento.cantidad!,
        stock: this.elementoSeleccionado.stock,
      });
      this.nuevoElemento = { nombre: '', cantidad: 0 };
      this.elementoSeleccionado = null;
    }
  }

  eliminarElemento(elemento: Elemento) {
    this.elementos = this.elementos.filter((e) => e !== elemento);
  }

  enviarSolicitud() {
    if (this.elementos.length > 0) {
      // Implementa el envío de la solicitud con todos los elementos y cantidades
      console.log('Solicitud enviada:', this.elementos);
    }
  }
}

