import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Importación de componentes
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
import { PrestamoDetalleModalComponent } from './components/prestamo-detalle-modal/prestamo-detalle-modal.component';
import { RegisterElementComponent } from './components/warehouse/register-element/register-element.component';
import { InventoryComponent } from './components/warehouse/inventory/inventory.component';

// Importación de guardas de autenticación
import { AuthGuard } from './guards/auth.guard';

/**
 * Rutas de la aplicación.
 *
 * @remarks
 * Se definen rutas públicas como `login`, `forgot-password-popup` y `reset-password`.
 * Las rutas protegidas se indican con `canActivate: [AuthGuard]` para restringir el acceso a usuarios autenticados.
 * Además, se organizan rutas hijas para los paneles de administrador, instructor y almacén, definiendo redirecciones por defecto en cada uno.
 */
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password-popup', component: ForgotPasswordPopupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Rutas del panel de administrador
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'register-user', component: RegisterUserComponent },
      { path: 'search-user', component: SearchUserComponent },
      { path: '', redirectTo: 'register-user', pathMatch: 'full' }
    ]
  },

  // Rutas del panel de instructor
  {
    path: 'instructor-dashboard',
    component: InstructorDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'new-request', component: InstructorRequestComponent },
      { path: 'loan-history', component: InstructorHistoryComponent },
      { path: '', redirectTo: 'new-request', pathMatch: 'full' }
    ]
  },

  // Rutas del panel de almacén
  {
    path: 'warehouse-dashboard',
    component: WarehouseDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'loan-requests', component: WarehouseRequestsComponent },
      { path: 'register-element', component: RegisterElementComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'history', component: WarehouseHistoryComponent },
      { path: '', redirectTo: 'loan-requests', pathMatch: 'full' }
    ]
  },

  // Ruta protegida para el detalle del préstamo
  { path: 'prestamo-detalle-modal', component: PrestamoDetalleModalComponent, canActivate: [AuthGuard] },

  // Ruta por defecto: redirige al login
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

/**
 * Módulo de enrutamiento de la aplicación.
 *
 * @remarks
 * Configura las rutas de la aplicación utilizando `RouterModule.forRoot(routes)` y habilita `HttpClientModule`
 * para el manejo de peticiones HTTP. Este módulo se exporta para ser importado en el módulo principal de la aplicación.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule],
  exports: [RouterModule]
})
export class AppRoutingModule {}
