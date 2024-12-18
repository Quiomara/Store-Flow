import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css'],
  providers: [UserService]
})
export class RegisterUserComponent implements OnInit {
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
        this.tiposUsuario = response;
      },
      error => {
        console.error('Error al obtener tipos de usuario', error);
      }
    );
  }

  onSubmit() {
    if (this.user.email !== this.user.confirmarEmail || this.user.contrasena !== this.user.confirmarContrasena) {
      alert('Los correos electrónicos o las contraseñas no coinciden.');
      return;
    }

    const usuario = {
      ...this.user,
      nombre: `${this.user.primerNombre} ${this.user.segundoNombre}`,
      apellidos: `${this.user.primerApellido} ${this.user.segundoApellido}`
    };

    this.userService.registerUser(usuario).subscribe(
      response => {
        console.log('Usuario registrado exitosamente', response);
        alert('Usuario registrado exitosamente');
      },
      error => {
        console.error('Error al registrar usuario', error);
        alert('Ocurrió un error al registrar el usuario');
      }
    );
  }
}






