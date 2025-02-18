import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PrestamoService } from '../../services/prestamo.service';
import { Prestamo } from '../../models/prestamo.model';
import { Elemento } from '../../models/elemento.model';
import { ElementoService } from '../../services/elemento.service';
import { EditableElemento } from '../../models/editable-elemento.model';
import { AuthService } from '../../services/auth.service';
import { Estado } from '../../models/estado.model';

@Component({
  selector: 'app-prestamo-detalle-modal',
  templateUrl: './prestamo-detalle-modal.component.html',
  styleUrls: ['./prestamo-detalle-modal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    FormsModule,
    MatIconModule
  ]
})
export class PrestamoDetalleModalComponent implements OnInit {
  prestamo: Prestamo = {
    cedulaSolicitante: 0,
    elementos: [],
    fecha: '',
    estado: 'Desconocido' // Inicializar el estado para evitar undefined
  };
  displayedColumns: string[] = ['nombre', 'cantidad', 'acciones'];
  originalItems: EditableElemento[] = [];
  puedeCambiarEstado = false; // Variable para verificar si el usuario puede cambiar el estado
  estados: Estado[] = []; // Variable para almacenar los estados

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PrestamoDetalleModalComponent>,
    private prestamoService: PrestamoService,
    private elementoService: ElementoService,
    private authService: AuthService // Inyectar el servicio de autenticación
  ) {
    this.prestamo = data.prestamo || { ...this.prestamo, estado: 'Desconocido' };
    console.log('Constructor - data recibida:', data); // Log para verificar los datos iniciales
  }

  ngOnInit(): void {
    console.log('ngOnInit - prestamo:', this.prestamo);
    if (this.prestamo.idPrestamo !== undefined) {
      this.obtenerPrestamoDetalles(this.prestamo.idPrestamo);
    } else {
      console.error('ID del préstamo no definido.');
    }
  
    // Verificar el rol y el ID del usuario
    const userType = this.authService.getUserType(); // Obtener el tipo de usuario
    const userId = this.authService.getUserId(); // Obtener el ID del usuario
    console.log('userType:', userType); // Log para verificar el tipo de usuario
    console.log('userId:', userId); // Log para verificar el ID del usuario
  
    // Comparar valores y asegurarse de que sean correctos
    this.puedeCambiarEstado = userType === 'Almacén' && userId === 3;
    console.log('puedeCambiarEstado:', this.puedeCambiarEstado); // Log para verificar puedeCambiarEstado
  
    // Obtener los estados desde el servicio
    this.obtenerEstados();
  }
  

  obtenerEstados(): void {
    this.prestamoService.getEstados().subscribe(
      (estados: Estado[]) => {
        this.estados = estados;
        console.log('estados:', this.estados); // Log para verificar los estados
      },
      (error: any) => {
        console.error('Error al obtener los estados', error);
      }
    );
  }

  obtenerPrestamoDetalles(prestamoId: number): void {
    if (prestamoId === undefined) {
      console.error('ID del préstamo no definido.');
      return;
    }

    this.prestamoService.getPrestamoDetalles(prestamoId).subscribe(
      (response: any) => {
        console.log('Respuesta completa del servicio:', response);

        if (response && response.data) {
          this.prestamo.elementos = response.data.map((item: any): EditableElemento => ({
            ele_id: Number(item.ele_id),
            ele_nombre: item.nombre || '',
            ele_cantidad_total: Number(item.ele_cantidad_total),
            ele_cantidad_actual: Number(item.ele_cantidad_actual),
            ubi_ele_id: item.ubi_ele_id,
            ubi_nombre: item.ubi_nombre || '',
            pre_ele_cantidad_prestado: Number(item.pre_ele_cantidad_prestado),
            editing: false
          }));

          this.originalItems = this.prestamo.elementos.map(item => ({ ...item }));
          this.prestamo.estado = response.estadoPrestamo || 'Desconocido'; // Asegura que estadoPrestamo tenga un valor por defecto
          console.log('Estado del préstamo asignado:', this.prestamo.estado);
        } else {
          console.error('Datos de respuesta no válidos:', response);
        }
      },
      (error: any) => {
        console.error('Error al obtener los detalles del préstamo', error);
      }
    );
  }

  cambiarEstado(nuevoEstado: string): void {
    if (this.prestamo.idPrestamo !== undefined) {
      this.prestamoService.actualizarEstadoPrestamo(this.prestamo.idPrestamo, nuevoEstado).subscribe(
        (response) => {
          console.log('Estado del préstamo actualizado:', response);
          this.prestamo.estado = nuevoEstado;
        },
        (error: any) => {
          console.error('Error al actualizar el estado del préstamo', error);
        }
      );
    } else {
      console.error('ID del préstamo no definido.');
    }
  }
  

  enableEditing(item: EditableElemento): void {
    item.editing = true;
  }

  cancelEditing(item: EditableElemento): void {
    if (item.editing) {
      const index = this.originalItems.findIndex((originalItem: EditableElemento) => originalItem.ele_id === item.ele_id);
      if (index !== -1) {
        this.prestamo.elementos[index] = { ...this.originalItems[index] };
      } else {
        console.error('Elemento no encontrado en originalItems para cancelar edición.');
      }
      item.editing = false;
    }
  }

  saveChanges(item: EditableElemento): void {
    if (item.editing) {
      item.editing = false;

      const pre_id = this.prestamo.idPrestamo;
      if (pre_id === undefined) {
        console.error('ID del préstamo no definido.');
        return;
      }

      const originalItem = this.originalItems.find(
        (originalItem) => originalItem.ele_id === item.ele_id
      );

      if (!originalItem) {
        console.error('Elemento original no encontrado.');
        return;
      }

      const cantidadOriginal = Number(originalItem.pre_ele_cantidad_prestado);
      const cantidadActual = Number(item.pre_ele_cantidad_prestado);
      const diferencia = cantidadActual - cantidadOriginal;

      const updatePrestamoElemento = {
        pre_id: pre_id,
        ele_id: item.ele_id,
        pre_ele_cantidad_prestado: cantidadActual
      };

      const updateStock = {
        ele_id: item.ele_id,
        ele_cantidad_actual: -diferencia,
        ele_cantidad_total: 0
      };

      this.prestamoService.updatePrestamoElemento(updatePrestamoElemento).subscribe(
        () => {
          console.log('Cantidad en PrestamosElementos actualizada');
          this.elementoService.actualizarStock(updateStock).subscribe(
            () => {
              console.log('Stock actualizado');
            },
            (error: any) => {
              console.error('Error actualizando stock', error);
              const revertUpdatePrestamoElemento = {
                pre_id: pre_id,
                ele_id: item.ele_id,
                pre_ele_cantidad_prestado: cantidadOriginal
              };

              this.prestamoService.updatePrestamoElemento(revertUpdatePrestamoElemento).subscribe(
                () => console.log('Revertida la actualización en PrestamosElementos'),
                (revertError: any) => console.error('Error al revertir la actualización en PrestamosElementos', revertError)
              );
            }
          );
        },
        (error: any) => console.error('Error actualizando PrestamosElementos', error)
      );
    }
  }

  getEstadoClass(estado: string | undefined): string {
    if (!estado) {
      return 'estado-desconocido';
    }

    switch (estado) {
      case 'Creado':
        return 'estado-creado';
      case 'En proceso':
        return 'estado-en-proceso';
      case 'En préstamo':
        return 'estado-en-prestamo';
      case 'Entregado':
        return 'estado-entregado';
      case 'Cancelado':
        return 'estado-cancelado';
      default:
        return 'estado-desconocido';
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
