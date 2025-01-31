import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CentroService {
  private apiUrl = 'http://localhost:3000/api/centros'; // URL del backend

  constructor(private http: HttpClient) {}

  // Método para obtener todos los centros de formación
  getCentros(): Observable<any> {
    const token = (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : '');
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.get(this.apiUrl, { headers });
  }
}
