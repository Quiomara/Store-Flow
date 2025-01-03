import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElementoService } from '../../../services/elemento.service';
import { PrestamoService } from '../../../services/prestamo.service';
import { Elemento, Prestamo } from '../../../models/prestamo.model';

@Component({
  selector: 'app-instructor-request',
  templateUrl: './instructor-request.component.html',
  styleUrls: ['./instructor-request.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class InstructorRequestComponent implements OnInit {
  fechaActual: string = new Date().toLocaleDateString();
  nombreCurso: string = '';
  cedulaSolicitante: number = 123456; // Asignar cédula del solicitante
  idSolicitud: string = '';
  nuevoElemento = { nombre: '', cantidad: 0 };
  elementos: Elemento[] = [];
  elementosFiltrados: Elemento[] = [];
  elementoSeleccionado: Elemento | null = null;

  constructor(private elementoService: ElementoService, private prestamoService: PrestamoService) {}

  ngOnInit(): void {
    this.elementoService.getElementos().subscribe(
      (data: Elemento[]) => {
        this.elementos = data;
        this.elementosFiltrados = data;
        console.log('Elementos obtenidos:', this.elementos); // Debug: Verifica los elementos obtenidos
      },
      (error) => {
        console.error('Error al obtener elementos', error);
      }
    );
  }
  
  convertToUppercase(): void {
    this.nombreCurso = this.nombreCurso.toUpperCase();
  }

  filtrarElementos(): void {
    const query = this.nuevoElemento.nombre.toLowerCase();
    this.elementosFiltrados = this.elementos.filter(elemento => elemento.ele_nombre.toLowerCase().includes(query));
  }

  seleccionarElemento(elemento: Elemento): void {
    this.nuevoElemento.nombre = elemento.ele_nombre;
    this.elementoSeleccionado = elemento;
    this.elementosFiltrados = [];
    console.log('Elemento seleccionado:', this.elementoSeleccionado); // Debug: Verifica el elemento seleccionado
  }

  agregarElemento(): void {
    if (this.nuevoElemento.cantidad > 0 && this.elementoSeleccionado) {
      this.elementos.push({ ...this.elementoSeleccionado, ele_cantidad: this.nuevoElemento.cantidad });
      this.nuevoElemento = { nombre: '', cantidad: 0 };
      this.elementoSeleccionado = null;
    } else {
      alert('Seleccione un elemento y cantidad válida.');
    }
  }

  eliminarElemento(elemento: Elemento): void {
    this.elementos = this.elementos.filter(e => e !== elemento);
  }

  enviarSolicitud(): void {
    const prestamo: Prestamo = {
      idPrestamo: Math.floor(Math.random() * 1000), // Generar ID aleatorio temporalmente
      nombreCurso: this.nombreCurso,
      cedulaSolicitante: this.cedulaSolicitante,
      elementos: this.elementos,
      fecha: this.fechaActual,
    };

    this.prestamoService.createPrestamo(prestamo).subscribe(
      (response) => {
        console.log('Solicitud enviada con éxito', response);
      },
      (error) => {
        console.error('Error al enviar solicitud', error);
      }
    );
  }
}











