import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Importar HttpClientModule

import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordPopupComponent } from './components/forgot-password-popup/forgot-password-popup.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { SearchUserComponent } from './components/search-user/search-user.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password-popup', component: ForgotPasswordPopupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'register-user', component: RegisterUserComponent },
  { path: 'search-user', component: SearchUserComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule], // Agregar HttpClientModule aquí
  exports: [RouterModule]
})
export class AppRoutingModule { }





















