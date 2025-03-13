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

/**
 * Interfaz que representa un elemento agregado con sus propiedades principales.
 */
interface ElementoAgregado {
  ele_id: number;                    // Identificador del elemento.
  ele_nombre: string;                // Nombre del elemento.
  pre_ele_cantidad_prestado: number; // Cantidad prestada del elemento.
  ele_cantidad_actual: number;       // Cantidad actual disponible del elemento.
}

/**
 * Componente que gestiona la solicitud de préstamos para instructores.
 *
 * @remarks
 * Permite a los instructores seleccionar elementos del inventario, agregarlos a una solicitud de préstamo,
 * y enviar dicha solicitud al backend. También proporciona funcionalidades para filtrar y seleccionar elementos.
 */
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
  fechaActual: string = new Date().toLocaleDateString(); // Fecha actual en formato local.
  nombreCurso: string = '';                                // Nombre del curso asociado a la solicitud.
  idSolicitud: number | null = null;                       // Identificador de la solicitud de préstamo.
  nuevoElemento: { nombre: string, cantidad: number | null } = { nombre: '', cantidad: null }; // Datos del nuevo elemento a agregar.
  elementos: Elemento[] = [];                              // Lista de elementos disponibles en el inventario.
  elementosFiltrados: Elemento[] = [];                     // Lista de elementos filtrados según la búsqueda.
  elementoSeleccionado: Elemento | null = null;            // Elemento actualmente seleccionado.
  mostrarElementos: boolean = false;                       // Bandera que indica si se debe mostrar la lista de elementos.
  elementosAgregados: ElementoAgregado[] = [];             // Lista de elementos agregados a la solicitud.

  /**
   * Crea una referencia al paginador (si se utiliza en otros contextos).
   */
  // Se importa HttpClientModule para permitir el uso de HttpClient en componentes standalone.
  
  /**
   * Crea una instancia del componente InstructorRequestComponent.
   *
   * @param elementoService - Servicio para gestionar los elementos.
   * @param prestamoService - Servicio para gestionar los préstamos.
   * @param authService - Servicio de autenticación para obtener datos del usuario.
   * @param dialog - Servicio para abrir diálogos modales.
   * @param http - Cliente HTTP para realizar peticiones al backend.
   */
  constructor(
    private elementoService: ElementoService,
    private prestamoService: PrestamoService,
    private authService: AuthService,
    private dialog: MatDialog,
    private http: HttpClient
  ) { }

  /**
   * ngOnInit - Inicializa el componente obteniendo la lista de elementos.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.obtenerElementos();
  }

  /**
   * obtenerElementos - Obtiene los elementos disponibles desde el servicio de Elemento.
   *
   * @returns void
   */
  obtenerElementos(): void {
    this.elementoService.getElementos().subscribe(
      (data: Elemento[]) => {
        // Ordena los elementos por nombre de forma ascendente.
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
   * mostrarListaElementos - Muestra la lista de elementos filtrados.
   *
   * @returns void
   */
  mostrarListaElementos(): void {
    this.mostrarElementos = true;
  }

  /**
   * ocultarListaElementos - Oculta la lista de elementos después de un pequeño retraso.
   *
   * @returns void
   */
  ocultarListaElementos(): void {
    setTimeout(() => {
      this.mostrarElementos = false;
    }, 200);
  }

  /**
   * filtrarElementos - Filtra los elementos disponibles según el nombre ingresado.
   *
   * @returns void
   */
  filtrarElementos(): void {
    const query = this.nuevoElemento.nombre.toLowerCase();
    this.elementosFiltrados = this.elementos.filter(elemento => elemento.ele_nombre.toLowerCase().includes(query));
  }

  /**
   * seleccionarElemento - Selecciona un elemento de la lista filtrada.
   *
   * @param elemento - El elemento seleccionado.
   * @returns void
   */
  seleccionarElemento(elemento: Elemento): void {
    this.nuevoElemento.nombre = elemento.ele_nombre;
    this.elementoSeleccionado = elemento;
    this.mostrarElementos = false;
  }

  /**
   * agregarElemento - Agrega un elemento a la lista de elementos agregados para la solicitud.
   *
   * @returns void
   */
  agregarElemento(): void {
    if (this.nuevoElemento.cantidad && this.nuevoElemento.cantidad > 0 && this.elementoSeleccionado) {
      // Verifica si el elemento ya fue agregado previamente.
      const elementoExistente = this.elementosAgregados.find(elemento => elemento.ele_id === this.elementoSeleccionado?.ele_id);
  
      if (elementoExistente) {
        // Si ya existe, suma la cantidad nueva a la cantidad prestada.
        elementoExistente.pre_ele_cantidad_prestado += this.nuevoElemento.cantidad;
        // Actualiza la cantidad disponible en el inventario.
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
        // Si el elemento no está en el pedido, lo agrega como nuevo.
        const elementoAgregado: ElementoAgregado = {
          ele_id: this.elementoSeleccionado.ele_id,
          ele_nombre: this.elementoSeleccionado.ele_nombre,
          pre_ele_cantidad_prestado: this.nuevoElemento.cantidad,
          ele_cantidad_actual: this.elementoSeleccionado.ele_cantidad_actual - this.nuevoElemento.cantidad
        };
        this.elementosAgregados.push(elementoAgregado);
  
        // Actualiza la cantidad disponible en el inventario.
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
  
      // Reinicia los valores de entrada.
      this.nuevoElemento = { nombre: '', cantidad: null };
      this.elementoSeleccionado = null;
    } else {
      alert('Seleccione un elemento y una cantidad válida.');
    }
  }  

  /**
   * eliminarElemento - Elimina un elemento de la lista de elementos agregados.
   *
   * @param elemento - El elemento a eliminar.
   * @returns void
   */
  eliminarElemento(elemento: ElementoAgregado): void {
    // Remueve el elemento de la lista de elementos agregados.
    this.elementosAgregados = this.elementosAgregados.filter(e => e.ele_id !== elemento.ele_id);
    // Restaura la cantidad disponible en el inventario.
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
   * obtenerCantidadDisponible - Retorna la cantidad disponible de un elemento dado su ID.
   *
   * @param id - El ID del elemento.
   * @returns La cantidad disponible del elemento.
   */
  obtenerCantidadDisponible(id: number): number {
    const elemento = this.elementos.find(e => e.ele_id === id);
    return elemento ? elemento.ele_cantidad_actual : 0;
  }

  /**
   * enviarSolicitud - Envía la solicitud de préstamo con los elementos agregados.
   *
   * @returns void
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
   * mostrarModalExito - Abre un modal para mostrar un mensaje de éxito tras crear la solicitud.
   *
   * @param idPrestamo - El ID del préstamo creado.
   * @returns void
   */
  mostrarModalExito(idPrestamo: number): void {
    this.dialog.open(SuccessModalComponent, {
      data: {
        mensaje: `Solicitud Exitosa. Se ha creado la solicitud exitosamente con el siguiente ID: ${idPrestamo}`
      }
    });
  }

  /**
   * limpiarFormulario - Reinicia el formulario de solicitud y los elementos agregados.
   *
   * @returns void
   */
  limpiarFormulario(): void {
    this.nombreCurso = '';
    this.elementosAgregados = [];
    this.nuevoElemento = { nombre: '', cantidad: null };
    this.elementoSeleccionado = null;
  }
}
