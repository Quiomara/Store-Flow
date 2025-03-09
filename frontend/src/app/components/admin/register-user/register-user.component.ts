import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { CentroService } from '../../../services/centro.service'; // Importa el servicio de centros
import { User, UserBackend } from '../../../models/user.model';
import { NotificationToastComponent } from '../notification-toast/notification-toast.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationToastComponent],
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})

export class RegisterUserComponent implements OnInit {
  @ViewChild(NotificationToastComponent) notificationToast!: NotificationToastComponent;

  user: User = {
    cedula: 0,
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    email: '',
    confirmarEmail: '',
    centroFormacion: '',
    tipoUsuario: '',
    telefono: '',
    contrasena: '',
    confirmarContrasena: ''
  };

  centros: any[] = []; // Array para almacenar los centros de formación
  tiposUsuario: any[] = []; // Array para almacenar los tipos de usuario
  errores: any = {}; // Objeto para manejar errores
  registroExitoso: boolean = false;

  constructor(
    private userService: UserService,
    private centroService: CentroService, // Inyecta el servicio de centros
    private snackBar: MatSnackBar // Inyecta MatSnackBar
  ) { }

  ngOnInit(): void {
    this.obtenerCentrosFormacion(); // Llama al método para obtener los centros
    this.obtenerTiposUsuario(); // Llama al método para obtener los tipos de usuario
  }

  /**
   * Obtiene la lista de centros de formación desde el servicio.
   * @returns {void}
   */
  obtenerCentrosFormacion(): void {
    this.centroService.getCentros().subscribe(
      (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          this.centros = response.data;
        }
      },
      (error) => {
        // Se eliminó el console.log
      }
    );
  }

  /**
   * Obtiene la lista de tipos de usuario desde el servicio.
   * @returns {void}
   */
  obtenerTiposUsuario(): void {
    this.userService.getTiposUsuario().subscribe(
      (response: any) => {
        if (Array.isArray(response)) {
          this.tiposUsuario = response; // Asigna los tipos de usuario recibidos
        }
      },
      (error) => {
        // Se eliminó el console.log
      }
    );
  }

  /**
   * Envía el formulario de registro de usuario.
   * Verifica que los datos sean correctos antes de enviar la solicitud de registro.
   * @returns {void}
   */
  onSubmit(): void {
    this.errores = {};
    this.registroExitoso = false;

    if (this.user.email !== this.user.confirmarEmail) {
      this.errores.confirmarEmail = 'Los correos electrónicos no coinciden.';
      this.snackBar.open('Los correos electrónicos no coinciden.', '', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: ['snack-bar-warning'],
      });
      return;
    }

    if (this.user.contrasena !== this.user.confirmarContrasena) {
      this.errores.confirmarContrasena = 'Las contraseñas no coinciden.';
      this.snackBar.open('Las contraseñas no coinciden.', '', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: ['snack-bar-warning'],
      });
      return;
    }

    if (!this.user.cedula || !this.user.primerNombre || !this.user.primerApellido ||
      !this.user.email || !this.user.contrasena || !this.user.tipoUsuario || !this.user.centroFormacion) {
      this.snackBar.open('Por favor, complete todos los campos obligatorios.', '', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: ['snack-bar-warning'],
      });
      return;
    }

    const usuario: UserBackend = {
      usr_cedula: this.user.cedula,
      usr_primer_nombre: this.user.primerNombre,
      usr_segundo_nombre: this.user.segundoNombre,
      usr_primer_apellido: this.user.primerApellido,
      usr_segundo_apellido: this.user.segundoApellido,
      usr_correo: this.user.email,
      usr_contrasena: this.user.contrasena,
      usr_telefono: this.user.telefono,
      tip_usr_id: this.user.tipoUsuario,
      cen_id: this.user.centroFormacion
    };

    this.userService.registerUser(usuario).subscribe(
      (response) => {
        this.snackBar.open('Usuario registrado correctamente', '', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          panelClass: ['snack-bar-success'],
        });

        // Resetear formulario
        this.user = {
          cedula: 0, primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
          email: '', confirmarEmail: '', centroFormacion: '', tipoUsuario: '', telefono: '',
          contrasena: '', confirmarContrasena: ''
        };
        this.errores = {};
      },
      (error) => {
        const mensaje = error.error?.mensaje || '';

        if (mensaje.includes('cédula')) {
          this.errores.cedula = 'Esta cédula ya está registrada';
        }
        if (mensaje.includes('correo')) {
          this.errores.email = 'Este correo ya está registrado';
        }
        if (mensaje.includes('teléfono')) {
          this.errores.telefono = 'Este teléfono ya está registrado';
        }

        this.snackBar.open('Error al registrar el usuario', '', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          panelClass: ['snack-bar-error'],
        });
      }
    );
  }

  /**
   * Muestra un mensaje en la snack bar.
   * @param mensaje El mensaje que se quiere mostrar.
   * @param tipo El tipo de mensaje ('success' o 'error').
   * @returns {void}
   */
  mostrarSnackBar(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000, // Duración en milisegundos (3 segundos)
      horizontalPosition: 'end', // Alineado a la derecha
      verticalPosition: 'bottom', // En la parte inferior
    });
  }
}
