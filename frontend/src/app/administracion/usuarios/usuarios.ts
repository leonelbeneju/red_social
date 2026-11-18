import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../core/services/usuario.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {

  private usuariosService = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: any[] = [];
  cargando = true;
  error = '';

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  obtenerUsuarios(): void {
    this.cargando = true;
    this.error = '';

    this.usuariosService.obtenerUsuarios().subscribe({
      next: (respuesta: any) => {

        console.log('RESPUESTA ADMIN:', respuesta);

        this.usuarios = Array.isArray(respuesta)
          ? respuesta
          : respuesta?.usuarios ?? [];

        this.cargando = false;

        console.log('USUARIOS CARGADOS:', this.usuarios.length);

        // Actualiza la vista después de recibir los datos.
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('ERROR ADMIN:', err);

        this.error = err.error?.message ||
          'No se pudieron cargar los usuarios';

        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarEstado(usuario: any): void {

    const peticion = usuario.activo === false
      ? this.usuariosService.activarUsuario(usuario._id)
      : this.usuariosService.desactivarUsuario(usuario._id);

    peticion.subscribe({
      next: () => {
        usuario.activo = usuario.activo === false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message ||
          'No se pudo modificar el estado';

        this.cdr.detectChanges();
      }
    });
  }
}
