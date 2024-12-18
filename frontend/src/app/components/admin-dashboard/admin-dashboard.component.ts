import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegisterUserComponent } from '../register-user/register-user.component'; // Importar el componente

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule, RegisterUserComponent] // Declarar el componente
})
export class AdminDashboardComponent {}
