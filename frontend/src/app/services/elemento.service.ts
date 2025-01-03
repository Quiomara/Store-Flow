import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Elemento } from '../models/prestamo.model';

@Injectable({
  providedIn: 'root',
})
export class ElementoService {
  private apiUrl = 'http://localhost:3000/api/elementos';

  constructor(private http: HttpClient) {}

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getElementos(): Observable<Elemento[]> {
    return this.http.get<Elemento[]>(this.apiUrl, { headers: this.getHeaders() });
  }
}
