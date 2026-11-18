
import { Component, OnInit, inject } from '@angular/core';
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

  usuarios: any[] = [];
  cargando = false;
  error = '';

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  obtenerUsuarios(): void {
    this.cargando = true;
    this.error = '';

    this.usuariosService.obtenerUsuarios().subscribe({
      next: (respuesta) => {
        this.usuarios = respuesta;
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'No se pudieron cargar los usuarios';
        this.cargando = false;
      }
    });
  }

  cambiarEstado(usuario: any): void {
    const peticion = usuario.activo
      ? this.usuariosService.desactivarUsuario(usuario._id)
      : this.usuariosService.activarUsuario(usuario._id);

    peticion.subscribe({
      next: () => {
        usuario.activo = !usuario.activo;
      },
      error: (err) => {
        this.error = err.error?.message || 'No se pudo modificar el estado';
      }
    });
  }
}
