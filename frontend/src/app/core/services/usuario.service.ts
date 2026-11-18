import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  obtenerMiPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mi-perfil`);
  }

  obtenerUsuarios(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  crearUsuario(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }

  desactivarUsuario(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/desactivar`, {});
  }

  activarUsuario(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activar`, {});
  }
}
