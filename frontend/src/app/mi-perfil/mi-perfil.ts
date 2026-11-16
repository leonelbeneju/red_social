
import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../core/services/usuario.service';
import { DatePipe } from '@angular/common';

@Component({
  imports: [DatePipe],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit {

  perfil: any = null;
  cargando = true;
  mensajeError = '';

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.usuariosService.obtenerMiPerfil().subscribe({
      next: (respuesta: any) => {
        this.perfil = respuesta;
        this.cargando = false;
      },
      error: (error) => {
        console.error(error);
        this.mensajeError = 'No se pudo cargar tu perfil';
        this.cargando = false;
      }
    });
  }
}
