import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/publicaciones`;

  // Obtener todas las publicaciones
  obtenerPublicaciones(offset: number = 0, limit: number = 10) {
    return this.http.get<any>(
      `${this.apiUrl}?offset=${offset}&limit=${limit}`
    );
  }

  // Crear una publicación
  crearPublicacion(datos: any) {
    return this.http.post<any>(this.apiUrl, datos);
  }

  // Obtener una publicación por ID
  obtenerUnaPublicacion(id: string) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Editar una publicación
  editarPublicacion(id: string, datos: any) {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, datos);
  }

  // Eliminar una publicación
  eliminarPublicacion(id: string) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Dar me gusta
  darLike(id: string) {
    return this.http.post<any>(`${this.apiUrl}/${id}/like`, {});
  }

  // Quitar me gusta
  quitarLike(id: string) {
    return this.http.delete<any>(`${this.apiUrl}/${id}/like`);
  }

  // Comentar una publicación
  agregarComentario(id: string, comentario: any) {
    return this.http.post<any>(
      `${this.apiUrl}/${id}/comentarios`,
      comentario
    );
  }

  // Editar un comentario
  editarComentario(publicacionId: string, comentarioId: string, datos: any) {
    return this.http.put<any>(
      `${this.apiUrl}/${publicacionId}/comentarios/${comentarioId}`,
      datos
    );
  }

  obtenerComentarios(id: string, offset: number = 0, limit: number = 5) {
    return this.http.get<any>(
      `${this.apiUrl}/${id}/comentarios?offset=${offset}&limit=${limit}`
    );
  }
}
