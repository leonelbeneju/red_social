import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
  access_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/autenticacion`;

  constructor(private http: HttpClient) {}

  login(datos: { usuario: string; clave: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      datos
    );
  }

  refrescarToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/refrescar`,
      {}
    );
  }

  autorizarToken(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/autorizar`,
      {}
    );
  }

  registro(datos: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/registro`,
      datos
    );
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
  }
}
