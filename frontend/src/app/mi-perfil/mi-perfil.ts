import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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

  private usuariosService = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);

  perfil: any = null;
  cargando = true;
  mensajeError = '';

  ngOnInit(): void {
    this.obtenerPerfil();
  }

  obtenerPerfil(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.usuariosService.obtenerMiPerfil().subscribe({

      next: (respuesta: any) => {

        console.log('RESPUESTA PERFIL:', respuesta);

        this.perfil = respuesta;
        this.cargando = false;

        console.log('PERFIL CARGADO:', this.perfil.usuario);

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('ERROR PERFIL:', error);

        this.mensajeError = 'No se pudo cargar tu perfil';
        this.cargando = false;

        this.cdr.detectChanges();
      }
    });
  }
}
