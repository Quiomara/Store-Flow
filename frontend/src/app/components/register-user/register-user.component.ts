import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent {
  // Propiedades para los campos del formulario
  user = {
    nombre: '',
    apellidos: '',
    email: '',
    confirmarEmail: '',
    centroFormacion: '',
    telefono: '',
    contrasena: '',
    confirmarContrasena: ''
  };

  // Método para manejar el envío del formulario
  onSubmit() {
    console.log('Formulario enviado', this.user);
  }
}

