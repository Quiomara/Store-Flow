import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElementoService } from '../../../services/elemento.service';
import { PrestamoService } from '../../../services/prestamo.service';
import { AuthService } from '../../../services/auth.service';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SuccessModalComponent } from '../success-modal/success-modal.component';
import { Prestamo, Elemento } from '../../../models/prestamo.model';
import { NgIf, NgForOf } from '@angular/common';

@Component({
  selector: 'app-instructor-request',
  templateUrl: './instructor-request.component.html',
  styleUrls: ['./instructor-request.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgForOf,
    HttpClientModule,
    MatDialogModule,
    MatIconModule
  ]
})
export class InstructorRequestComponent implements OnInit {
  fechaActual: string = new Date().toLocaleDateString();
  nombreCurso: string = '';
  idSolicitud: number | null = null;
  nuevoElemento = { nombre: '', cantidad: null as number | null };
  elementos: Elemento[] = [];
  elementosFiltrados: Elemento[] = [];
  elementoSeleccionado: Elemento | null = null;
  mostrarElementos: boolean = false;
  elementosAgregados: Elemento[] = [];

  constructor(
    private elementoService: ElementoService, 
    private prestamoService: PrestamoService,
    private authService: AuthService,
    private dialog: MatDialog,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.obtenerElementos();
  }

  obtenerElementos(): void {
    this.elementoService.getElementos().subscribe(
      (data: Elemento[]) => {
        this.elementos = data.sort((a, b) => a.ele_nombre.localeCompare(b.ele_nombre));
        this.elementosFiltrados = this.elementos;
        console.log('Elementos obtenidos:', this.elementos);
      },
      (error: any) => {
        console.error('Error al obtener elementos:', error);
      }
    );
  }

  convertToUppercase(): void {
    this.nombreCurso = this.nombreCurso.toUpperCase();
  }

  mostrarListaElementos(): void {
    this.mostrarElementos = true;
  }

  ocultarListaElementos(): void {
    setTimeout(() => {
      this.mostrarElementos = false;
    }, 200);
  }

  filtrarElementos(): void {
    const query = this.nuevoElemento.nombre.toLowerCase();
    this.elementosFiltrados = this.elementos.filter(elemento => elemento.ele_nombre.toLowerCase().includes(query));
  }

  seleccionarElemento(elemento: Elemento): void {
    this.nuevoElemento.nombre = elemento.ele_nombre;
    this.elementoSeleccionado = elemento;
    this.mostrarElementos = false;
    console.log('Elemento seleccionado:', this.elementoSeleccionado);
  }

  agregarElemento(): void {
    if (this.nuevoElemento.cantidad && this.nuevoElemento.cantidad > 0 && this.elementoSeleccionado) {
      const elementoAgregado = { ...this.elementoSeleccionado, ele_cantidad: this.nuevoElemento.cantidad };
      this.elementosAgregados.push(elementoAgregado);

      this.elementos = this.elementos.map(elemento => {
        if (elemento.ele_id === this.elementoSeleccionado!.ele_id) {
          return {
            ...elemento,
            ele_cantidad: elemento.ele_cantidad - this.nuevoElemento.cantidad!
          };
        }
        return elemento;
      });

      this.nuevoElemento = { nombre: '', cantidad: null };
      this.elementoSeleccionado = null;
    } else {
      alert('Seleccione un elemento y cantidad válida.');
    }
  }

  eliminarElemento(elemento: Elemento): void {
    this.elementosAgregados = this.elementosAgregados.filter(e => e !== elemento);

    this.elementos = this.elementos.map(e => {
      if (e.ele_id === elemento.ele_id) {
        return {
          ...e,
          ele_cantidad: e.ele_cantidad + elemento.ele_cantidad
        };
      }
      return e;
    });
  }

  obtenerCantidadDisponible(id: number): number {
    const elemento = this.elementos.find(e => e.ele_id === id);
    return elemento ? elemento.ele_cantidad : 0;
  }

  enviarSolicitud(): void {
    const cedulaSolicitante = this.authService.getCedula();
    if (cedulaSolicitante === null) {
      alert('Error: No se pudo obtener la cédula del usuario logueado.');
      return;
    }

    const prestamo: Omit<Prestamo, 'idPrestamo'> = {
      cedulaSolicitante: Number(cedulaSolicitante),
      elementos: this.elementosAgregados,
      fecha: this.fechaActual
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    const apiUrl = this.prestamoService.apiUrl || 'http://localhost:3000/api/prestamos';

    this.http.post(`${apiUrl}/crear`, prestamo, { headers }).subscribe(
      (response: any) => {
        console.log('Solicitud enviada con éxito', response);
        this.mostrarModalExito(response.id); // Mostrar el modal con el ID del préstamo real
        this.limpiarFormulario();
      },
      (error: any) => {
        console.error('Error al enviar solicitud:', error);
      }
    );
  }

  mostrarModalExito(idPrestamo: number): void {
    this.dialog.open(SuccessModalComponent, {
      data: {
        mensaje: `Solicitud Exitosa. Se ha creado la solicitud exitosamente con el siguiente ID: ${idPrestamo}`
      }
    });
  }

  limpiarFormulario(): void {
    this.nombreCurso = '';
    this.elementosAgregados = [];
    this.nuevoElemento = { nombre: '', cantidad: null };
    this.elementoSeleccionado = null;
    console.log('Formulario limpiado');
  }
}































