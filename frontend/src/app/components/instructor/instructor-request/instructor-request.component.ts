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
import { Prestamo } from '../../../models/prestamo.model';
import { Elemento } from '../../../models/elemento.model';
import { NgIf, NgForOf } from '@angular/common';

interface ElementoAgregado {
  ele_id: number;
  ele_nombre: string;
  pre_ele_cantidad_prestado: number;
  ele_cantidad_actual: number;
}

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
  nuevoElemento: { nombre: string, cantidad: number | null } = { nombre: '', cantidad: null };
  elementos: Elemento[] = [];
  elementosFiltrados: Elemento[] = [];
  elementoSeleccionado: Elemento | null = null;
  mostrarElementos: boolean = false;
  elementosAgregados: ElementoAgregado[] = [];

  constructor(
    private elementoService: ElementoService,
    private prestamoService: PrestamoService,
    private authService: AuthService,
    private dialog: MatDialog,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.obtenerElementos();
  }

  /**
   * Obtiene los elementos disponibles desde el servicio de Elemento.
   * @returns {void}
   */
  obtenerElementos(): void {
    this.elementoService.getElementos().subscribe(
      (data: Elemento[]) => {
        this.elementos = data.sort((a, b) => a.ele_nombre.localeCompare(b.ele_nombre));
        this.elementosFiltrados = this.elementos;
      },
      (error: any) => {
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
        }
      }
    );
  }

  /**
   * Muestra la lista de elementos filtrados.
   * @returns {void}
   */
  mostrarListaElementos(): void {
    this.mostrarElementos = true;
  }

  /**
   * Oculta la lista de elementos después de un pequeño retraso.
   * @returns {void}
   */
  ocultarListaElementos(): void {
    setTimeout(() => {
      this.mostrarElementos = false;
    }, 200);
  }

  /**
   * Filtra los elementos por el nombre del nuevo elemento.
   * @returns {void}
   */
  filtrarElementos(): void {
    const query = this.nuevoElemento.nombre.toLowerCase();
    this.elementosFiltrados = this.elementos.filter(elemento => elemento.ele_nombre.toLowerCase().includes(query));
  }

  /**
   * Selecciona un elemento de la lista filtrada.
   * @param {Elemento} elemento El elemento seleccionado.
   * @returns {void}
   */
  seleccionarElemento(elemento: Elemento): void {
    this.nuevoElemento.nombre = elemento.ele_nombre;
    this.elementoSeleccionado = elemento;
    this.mostrarElementos = false;
  }

  /**
   * Agrega un nuevo elemento a la lista de elementos agregados.
   * @returns {void}
   */
  agregarElemento(): void {
    if (this.nuevoElemento.cantidad && this.nuevoElemento.cantidad > 0 && this.elementoSeleccionado) {
      // Buscar si el elemento ya ha sido agregado
      const elementoExistente = this.elementosAgregados.find(elemento => elemento.ele_id === this.elementoSeleccionado?.ele_id);
  
      if (elementoExistente) {
        // Si el elemento ya existe, solo sumamos la cantidad
        elementoExistente.pre_ele_cantidad_prestado += this.nuevoElemento.cantidad;
        // Actualizamos la cantidad disponible en el inventario
        this.elementos = this.elementos.map(elemento => {
          if (elemento.ele_id === this.elementoSeleccionado!.ele_id) {
            return {
              ...elemento,
              ele_cantidad_actual: elemento.ele_cantidad_actual - this.nuevoElemento.cantidad!
            };
          }
          return elemento;
        });
      } else {
        // Si el elemento no está en el pedido, lo agregamos como nuevo
        const elementoAgregado: ElementoAgregado = {
          ele_id: this.elementoSeleccionado.ele_id,
          ele_nombre: this.elementoSeleccionado.ele_nombre,
          pre_ele_cantidad_prestado: this.nuevoElemento.cantidad,
          ele_cantidad_actual: this.elementoSeleccionado.ele_cantidad_actual - this.nuevoElemento.cantidad
        };
        this.elementosAgregados.push(elementoAgregado);
  
        // Actualizamos la cantidad del inventario
        this.elementos = this.elementos.map(elemento => {
          if (elemento.ele_id === this.elementoSeleccionado!.ele_id) {
            return {
              ...elemento,
              ele_cantidad_actual: elemento.ele_cantidad_actual - this.nuevoElemento.cantidad!
            };
          }
          return elemento;
        });
      }
  
      // Resetear valores de entrada
      this.nuevoElemento = { nombre: '', cantidad: null };
      this.elementoSeleccionado = null;
    } else {
      alert('Seleccione un elemento y una cantidad válida.');
    }
  }  

  /**
   * Elimina un elemento de la lista de elementos agregados.
   * @param {ElementoAgregado} elemento El elemento a eliminar.
   * @returns {void}
   */
  eliminarElemento(elemento: ElementoAgregado): void {
    this.elementosAgregados = this.elementosAgregados.filter(e => e.ele_id !== elemento.ele_id);

    this.elementos = this.elementos.map(e => {
      if (e.ele_id === elemento.ele_id) {
        return {
          ...e,
          ele_cantidad_actual: e.ele_cantidad_actual + elemento.pre_ele_cantidad_prestado
        };
      }
      return e;
    });
  }

  /**
   * Obtiene la cantidad disponible de un elemento.
   * @param {number} id El ID del elemento.
   * @returns {number} La cantidad disponible del elemento.
   */
  obtenerCantidadDisponible(id: number): number {
    const elemento = this.elementos.find(e => e.ele_id === id);
    return elemento ? elemento.ele_cantidad_actual : 0;
  }

  /**
   * Envía la solicitud de préstamo con los elementos seleccionados.
   * @returns {void}
   */
  enviarSolicitud(): void {
    const cedulaSolicitante = this.authService.getCedula();
    const token = this.authService.getToken();

    if (cedulaSolicitante === null) {
      alert('Error: No se pudo obtener la cédula del usuario logueado.');
      return;
    }

    if (!token) {
      alert('Error: No se pudo obtener el token de autenticación.');
      return;
    }

    if (!this.elementosAgregados || this.elementosAgregados.length === 0) {
      alert('Error: No se han agregado elementos al préstamo.');
      return;
    }

    const elementosParaEnviar = this.elementosAgregados.map(elemento => ({
      ele_id: elemento.ele_id,
      pre_ele_cantidad_prestado: elemento.pre_ele_cantidad_prestado
    }));

    const prestamo = {
      usr_cedula: Number(cedulaSolicitante),
      est_id: 1,
      elementos: elementosParaEnviar
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const apiUrl = this.prestamoService.getPrestamosUrl() || 'http://localhost:3000/api/prestamos';

    this.http.post(`${apiUrl}/crear`, prestamo, { headers }).subscribe(
      (response: any) => {
        this.mostrarModalExito(response.prestamoId);
        this.limpiarFormulario();
      },
      (error: any) => {
        alert('Error al enviar la solicitud. Por favor, inténtalo de nuevo.');
      }
    );

  }

  /**
   * Muestra un modal de éxito con el ID de la solicitud creada.
   * @param {number} idPrestamo El ID del préstamo creado.
   * @returns {void}
   */
  mostrarModalExito(idPrestamo: number): void {
    this.dialog.open(SuccessModalComponent, {
      data: {
        mensaje: `Solicitud Exitosa. Se ha creado la solicitud exitosamente con el siguiente ID: ${idPrestamo}`
      }
    });
  }

  /**
   * Limpia el formulario de solicitud.
   * @returns {void}
   */
  limpiarFormulario(): void {
    this.nombreCurso = '';
    this.elementosAgregados = [];
    this.nuevoElemento = { nombre: '', cantidad: null };
    this.elementoSeleccionado = null;
  }
}
