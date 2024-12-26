import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User, UserBackend } from '../../models/user.model';
import { NotificationToastComponent } from '../../notification-toast/notification-toast.component';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationToastComponent],
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css'],
  providers: [UserService]
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

  centros: any[] = [];
  tiposUsuario: any[] = [];
  errores: any = {};
  registroExitoso: boolean = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getCentros().subscribe(
      response => {
        this.centros = response;
      },
      error => {
        console.error('Error al obtener centros de formación', error);
      }
    );

    this.userService.getTiposUsuario().subscribe(
      response => {
        if (response && Array.isArray(response.data)) {
          this.tiposUsuario = response.data;
        } else {
          console.error('Formato de respuesta inesperado para tipos de usuario:', response);
        }
      },
      error => {
        console.error('Error al obtener tipos de usuario', error);
      }
    );
  }

  onSubmit() {
    this.errores = {};
    this.registroExitoso = false;

    if (this.user.email !== this.user.confirmarEmail) {
      this.errores.confirmarEmail = 'Los correos electrónicos no coinciden.';
      return;
    }

    if (this.user.contrasena !== this.user.confirmarContrasena) {
      this.errores.confirmarContrasena = 'Las contraseñas no coinciden.';
      return;
    }

    if (!this.user.cedula) {
      this.errores.cedula = 'Este campo es obligatorio.';
    }
    if (!this.user.primerNombre) {
      this.errores.primerNombre = 'Este campo es obligatorio.';
    }
    if (!this.user.primerApellido) {
      this.errores.primerApellido = 'Este campo es obligatorio.';
    }
    if (!this.user.email) {
      this.errores.email = 'Este campo es obligatorio.';
    }
    if (!this.user.contrasena) {
      this.errores.contrasena = 'Este campo es obligatorio.';
    }
    if (!this.user.tipoUsuario) {
      this.errores.tipoUsuario = 'Seleccione un tipo de usuario.';
    }
    if (!this.user.centroFormacion) {
      this.errores.centroFormacion = 'Este campo es obligatorio.';
    }

    if (Object.keys(this.errores).length > 0) {
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
      response => {
        console.log('Usuario registrado exitosamente', response);
        this.registroExitoso = true;
        this.notificationToast.message = 'Usuario Registrado';
        this.notificationToast.isVisible = true;

        setTimeout(() => {
          this.notificationToast.isVisible = false;
        }, 3000);

        this.user = {
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
        this.errores = {};
      },
      error => {
        console.error('Error al registrar usuario', error);
        const mensaje = error.error.mensaje;
        if (mensaje.includes('cédula')) {
          this.errores.cedula = 'Esta cédula ya está registrada';
        }
        if (mensaje.includes('correo')) {
          this.errores.email = 'Este correo ya está registrado';
        }
        if (mensaje.includes('teléfono')) {
          this.errores.telefono = 'Este teléfono ya está registrado';
        }
      }
    );
  }
}







































