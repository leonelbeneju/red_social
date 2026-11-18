import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../core/services/usuario.service';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
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

