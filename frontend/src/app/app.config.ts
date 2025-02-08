// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app-routing.module';
import { authInterceptor } from './services/auth.interceptor.service'; // <-- ¡Usa la función!

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]) // 🚨 Sin "new", es una función
    ),
    provideRouter(routes)
  ]
};