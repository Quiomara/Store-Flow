import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-warehouse-dashboard',
  templateUrl: './warehouse-dashboard.component.html', // Ruta del template
  styleUrls: ['./warehouse-dashboard.component.css'], // Ruta de los estilos
  standalone: true, // Indicamos que es un componente autónomo
  imports: [RouterModule, CommonModule] // Importamos módulos necesarios
})
export class WarehouseDashboardComponent {

}