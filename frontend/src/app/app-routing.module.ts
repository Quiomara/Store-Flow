import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordPopupComponent } from './components/forgot-password-popup/forgot-password-popup.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { InstructorDashboardComponent } from './components/instructor/instructor-dashboard/instructor-dashboard.component';
import { RegisterUserComponent } from './components/admin/register-user/register-user.component';
import { SearchUserComponent } from './components/admin/search-user/search-user.component';
import { WarehouseDashboardComponent } from './components/warehouse/warehouse-dashboard/warehouse-dashboard.component';
import { InstructorRequestComponent } from './components/instructor/instructor-request/instructor-request.component';
import { WarehouseRequestsComponent } from './components/warehouse/warehouse-requests/warehouse-requests.component';
import { InstructorHistoryComponent } from './components/instructor/instructor-history/instructor-history.component';
import { WarehouseHistoryComponent } from './components/warehouse/warehouse-history/warehouse-history.component';
import { PrestamoDetalleModalComponent } from './components/prestamo-detalle-modal/prestamo-detalle-modal.component'; // Importa el componente del modal

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password-popup', component: ForgotPasswordPopupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    children: [
      { path: 'register-user', component: RegisterUserComponent },
      { path: 'search-user', component: SearchUserComponent },
      { path: '', redirectTo: 'register-user', pathMatch: 'full' }
    ]
  },
  {
    path: 'instructor-dashboard',
    component: InstructorDashboardComponent,
    children: [
      { path: 'new-request', component: InstructorRequestComponent },
      { path: 'loan-history', component: InstructorHistoryComponent },
      { path: '', redirectTo: 'new-request', pathMatch: 'full' }
    ]
  },
  {
    path: 'warehouse-dashboard',
    component: WarehouseDashboardComponent,
    children: [
      { path: 'loan-requests', component: WarehouseRequestsComponent },
      { path: 'register-item', component: WarehouseRequestsComponent }, // Placeholder component
      { path: 'inventory', component: WarehouseRequestsComponent }, // Placeholder component
      { path: 'history', component: WarehouseHistoryComponent },
      { path: '', redirectTo: 'loan-requests', pathMatch: 'full' }
    ]
  },
  { path: 'prestamo-detalle-modal', component: PrestamoDetalleModalComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule],
  exports: [RouterModule]
})
export class AppRoutingModule {}











