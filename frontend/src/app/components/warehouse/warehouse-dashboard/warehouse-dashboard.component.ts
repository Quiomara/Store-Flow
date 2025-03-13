import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-warehouse-dashboard',
  templateUrl: './warehouse-dashboard.component.html', 
  styleUrls: ['./warehouse-dashboard.component.css'], 
  standalone: true, 
  imports: [RouterModule, CommonModule] 
})
export class WarehouseDashboardComponent {

}