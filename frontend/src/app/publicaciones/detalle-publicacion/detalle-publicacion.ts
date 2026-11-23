import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

import { PublicacionesService } from '../../core/services/publicaciones.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-detalle-publicacion',
  standalone: true,
  imports: [ DatePipe, RouterLink, ReactiveFormsModule, FormsModule ],
  templateUrl: './detalle-publicacion.html',
  styleUrl: './detalle-publicacion.css'
})
export class DetallePublicacion implements OnInit {

  private route = inject(ActivatedRoute);
  private publicacionesService = inject(PublicacionesService);
  private fb = inject(FormBuilder);
  private detector = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private router = inject(Router);

  publicacion: any = null;
  comentarios: any[] = [];
  comentarioEditandoId: string | null = null;
  mensajeEdicion = '';
  guardandoEdicion = false;

  cargando = false;
  enviandoComentario = false;
  offsetComentarios = 0;
  limiteComentarios = 5;
  totalComentarios = 0;
  cargandoComentarios = false;

  error = '';
  errorComentario = '';
  mensajeExito = '';
  usuarioId = '';

  perfil = '';
  esAdmin = false;
  eliminando = false;

  formularioComentario = this.fb.group({
    mensaje: ['', [
      Validators.required,
      Validators.maxLength(1000),
      Validators.pattern(/\S/)
    ]]
  });

  ngOnInit(): void {
    this.cargarDatosUsuario();

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'No se encontró el ID de la publicación.';
      return;
    }

    this.cargarPublicacion(id);
  }

  cargarPublicacion(id: string): void {
    this.cargando = true;
    this.error = '';

    this.publicacionesService.obtenerUnaPublicacion(id).subscribe({
      next: (respuesta) => {
        this.publicacion = respuesta;
        this.comentarios = [];
        this.offsetComentarios = 0;
        this.totalComentarios = 0;
        this.cargarMasComentarios();
        this.cargando = false;
        this.detector.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar publicación:', err);
        this.error = 'No se pudo cargar la publicación.';
        this.cargando = false;
        this.detector.markForCheck();
      }
    });
  }

  cargarMasComentarios(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id || this.cargandoComentarios) return;

    if (
      this.offsetComentarios > 0 &&
      this.offsetComentarios >= this.totalComentarios
    ) {
      return;
    }

    this.cargandoComentarios = true;

    this.publicacionesService.obtenerComentarios(
      id,
      this.offsetComentarios,
      this.limiteComentarios
    ).subscribe({
      next: (respuesta) => {
        const nuevosComentarios = respuesta.comentarios || [];

        this.comentarios = [
          ...this.comentarios,
          ...nuevosComentarios
        ];

        this.offsetComentarios += nuevosComentarios.length;
        this.totalComentarios = respuesta.total;

        this.cargandoComentarios = false;
        this.detector.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar comentarios:', err);
        this.errorComentario = 'No se pudieron cargar los comentarios.';
        this.cargandoComentarios = false;
        this.detector.markForCheck();
      }
    });
  }

  agregarComentario(): void {
    if (this.formularioComentario.invalid || this.enviandoComentario) {
      this.formularioComentario.markAllAsTouched();
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) return;

    const mensaje = this.formularioComentario.value.mensaje?.trim();

    if (!mensaje) return;

    this.enviandoComentario = true;
    this.errorComentario = '';
    this.mensajeExito = '';

    this.publicacionesService.agregarComentario(id, { mensaje }).subscribe({
      next: (respuesta) => {
        this.comentarios = [];
        this.offsetComentarios = 0;
        this.totalComentarios = 0;
        this.cargarMasComentarios();
        this.formularioComentario.reset();
        this.enviandoComentario = false;
        this.mensajeExito = '¡Comentario publicado correctamente!';
        this.detector.markForCheck();
      },
      error: (err) => {
        console.error('Error al agregar comentario:', err);
        this.errorComentario =
          err.error?.message || 'No se pudo publicar el comentario.';
        this.enviandoComentario = false;
        this.detector.markForCheck();
      }
    });
  }

  cargarDatosUsuario(): void {
    const token = this.authService.obtenerToken();

    if (!token) return;

    try {
      const parteToken = token.split('.')[1];
      const base64 = parteToken.replace(/-/g, '+').replace(/_/g, '/');

      const payload = JSON.parse(
        atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
      );

      this.usuarioId = payload.sub || '';
      this.perfil = payload.perfil || '';
      this.esAdmin = this.perfil === 'administrador';

    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  }

  iniciarEdicion(comentario: any): void {
  this.comentarioEditandoId = comentario._id;
  this.mensajeEdicion = comentario.mensaje;
  this.errorComentario = '';
  this.mensajeExito = '';
  }

  cancelarEdicion(): void {
    this.comentarioEditandoId = null;
    this.mensajeEdicion = '';
  }

  eliminarPublicacion(): void {
    if (!this.esAdmin || this.eliminando || !this.publicacion) {
      return;
    }

    const confirmar = confirm(
      '¿Estás seguro que queres eliminar esta publicación?'
    );

    if (!confirmar) return;

    const id = this.publicacion._id;

    this.eliminando = true;
    this.error = '';
    this.mensajeExito = '';

    this.publicacionesService.eliminarPublicacion(id).subscribe({
      next: () => {
        this.mensajeExito = '¡La publicación se eliminó correctamente!';
        this.eliminando = false;

        this.detector.detectChanges();

        this.router.navigate(['/publicaciones'], {
          state: {
            mensajeExito: this.mensajeExito
          }
        });
      },

      error: (err) => {
        console.error('Error al eliminar publicación:', err);

        this.error = err.error?.message ||
          'No se pudo dar de baja la publicación.';

        this.eliminando = false;

        this.detector.detectChanges();
      }
    });
}

  guardarEdicion(comentarioId: string): void {
    const mensaje = this.mensajeEdicion.trim();

    if (!mensaje || mensaje.length > 1000 || this.guardandoEdicion) {
      return;
    }

    const publicacionId = this.route.snapshot.paramMap.get('id');
    if (!publicacionId) return;

    this.guardandoEdicion = true;
    this.errorComentario = '';
    this.mensajeExito = '';

    this.publicacionesService.editarComentario(
      publicacionId,
      comentarioId,
      { mensaje }
    ).subscribe({
      next: (respuesta) => {
        const comentarioActualizado = respuesta.comentario;

        this.comentarios = this.comentarios.map(comentario =>
          comentario._id === comentarioId
            ? comentarioActualizado
            : comentario
        );

        this.cancelarEdicion();
        this.guardandoEdicion = false;
        this.mensajeExito = '¡Comentario editado correctamente!';
        this.detector.markForCheck();
      },
      error: (err) => {
        console.error('Error al editar comentario:', err);
        this.errorComentario =
          err.error?.message || 'No se pudo editar el comentario.';
        this.guardandoEdicion = false;
        this.detector.markForCheck();
      }
    });
  }
}