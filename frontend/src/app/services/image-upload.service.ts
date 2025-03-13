import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Servicio para la subida de imágenes.
 *
 * @remarks
 * Este servicio proporciona un método para subir archivos de imagen al servidor
 * utilizando el endpoint definido en `uploadUrl`.
 */
@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  /**
   * URL del endpoint para la subida de imágenes.
   */
  private uploadUrl = 'http://localhost:3000/api/upload';

  /**
   * Crea una instancia del servicio de subida de imágenes.
   *
   * @param http - Instancia de HttpClient para realizar peticiones HTTP.
   */
  constructor(private http: HttpClient) {}

  /**
   * Sube una imagen al servidor.
   *
   * @param file - Archivo de imagen a subir.
   * @returns Observable que emite la respuesta del servidor.
   */
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.uploadUrl, formData);
  }
}
