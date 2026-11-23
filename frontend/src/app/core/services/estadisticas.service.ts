import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {

  private http = inject(HttpClient);

  private API_URL = 'https://livefutbol-api.onrender.com/estadisticas';

  publicacionesPorUsuario(desde: string, hasta: string) {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get<any[]>(
      `${this.API_URL}/publicaciones-por-usuario`,
      { params }
    );
  }

  comentariosPorPeriodo(desde: string, hasta: string) {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get<any[]>(
      `${this.API_URL}/comentarios-por-periodo`,
      { params }
    );
  }

  comentariosPorPublicacion(desde: string, hasta: string) {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get<any[]>(
      `${this.API_URL}/comentarios-por-publicacion`,
      { params }
    );
  }
}