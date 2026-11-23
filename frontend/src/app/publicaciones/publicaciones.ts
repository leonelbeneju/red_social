import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicacionesService } from '../core/services/publicaciones.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink, DatePipe, ReactiveFormsModule],
  selector: 'app-publicaciones',
  styleUrl: './publicaciones.css',
  templateUrl: './publicaciones.html',
})
export class Publicaciones implements OnInit {

  private publicacionesService = inject(PublicacionesService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private detector = inject(ChangeDetectorRef);
  private router = inject(Router);

  publicaciones: any[] = [];
  cargando = false;
  publicando = false;
  eliminando: string[] = [];
  error = '';
  mensajeExito = '';
  usuarioId = '';
  perfil = '';
  esAdmin = false;
  likesProcesando: string[] = [];
  mostrarFormulario = false;

  formularioPublicacion = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(100)]],
    mensaje: ['', [Validators.required, Validators.maxLength(2000)]],
    imagen: ['', [Validators.maxLength(500)]]
  });

  ngOnInit(): void {
    this.obtenerDatosUsuario();

    this.mensajeExito = history.state?.mensajeExito || '';

    this.cargarPublicaciones();
  }

  private obtenerDatosUsuario(): void {
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

  yaDioLike(publicacion: any): boolean {
    return (publicacion.reacciones ?? []).some(
      (reaccion: any) => String(reaccion?._id ?? reaccion) === this.usuarioId
    );
  }

  alternarLike(publicacion: any): void {
    const id = publicacion._id;

    if (!this.usuarioId || this.likesProcesando.includes(id)) {
      return;
    }

    const yaTieneLike = this.yaDioLike(publicacion);

    this.likesProcesando.push(id);
    this.detector.markForCheck();

    const peticion = yaTieneLike
      ? this.publicacionesService.quitarLike(id)
      : this.publicacionesService.darLike(id);

    peticion.subscribe({
      next: (respuesta) => {
        const reacciones = publicacion.reacciones ?? [];

        if (yaTieneLike) {
          publicacion.reacciones = reacciones.filter(
            (reaccion: any) =>
              String(reaccion?._id ?? reaccion) !== this.usuarioId
          );
        } else {
          publicacion.reacciones = [...reacciones, this.usuarioId];
        }

        publicacion.cantidadLikes = respuesta.reacciones;

        this.likesProcesando = this.likesProcesando.filter(
          publicacionId => publicacionId !== id
        );

        this.detector.detectChanges();
      },

      error: (err) => {
        console.error('Error al modificar Me gusta:', err);

        this.likesProcesando = this.likesProcesando.filter(
          publicacionId => publicacionId !== id
        );

        this.detector.detectChanges();
      }
    });
  }

  eliminarPublicacion(publicacion: any): void {
    if (!this.esAdmin || this.eliminando.includes(publicacion._id)) {
      return;
    }

    const confirmar = confirm(
      '¿Estás seguro de que querés dar de baja esta publicación?'
    );

    if (!confirmar) return;

    const id = publicacion._id;

    this.eliminando.push(id);
    this.error = '';
    this.mensajeExito = '';

    this.publicacionesService.eliminarPublicacion(id).subscribe({
      next: () => {
        this.publicaciones = this.publicaciones.filter(
          p => p._id !== id
        );

        this.mensajeExito = 'La publicación se dio de baja correctamente.';

        this.eliminando = this.eliminando.filter(
          publicacionId => publicacionId !== id
        );

        this.detector.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar publicación:', err);

        this.error = err.error?.message ||
          'No se pudo dar de baja la publicación.';

        this.eliminando = this.eliminando.filter(
          publicacionId => publicacionId !== id
        );

        this.detector.detectChanges();
      }
    });
  }

  cargarPublicaciones(): void {
    this.cargando = true;
    this.error = '';

    this.detector.markForCheck();

    this.publicacionesService.obtenerPublicaciones().subscribe({
      next: (respuesta) => {
        console.log('Respuesta de publicaciones:', respuesta);

        this.publicaciones = Array.isArray(respuesta)
          ? respuesta
          : respuesta.publicaciones ?? [];

        this.cargando = false;

        this.detector.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar publicaciones:', err);

        this.error = 'No se pudieron cargar las publicaciones.';
        this.cargando = false;

        this.detector.markForCheck();
      }
    });
  }

  crearPublicacion(): void {
    if (this.formularioPublicacion.invalid) {
      this.formularioPublicacion.markAllAsTouched();
      return;
    }

    this.publicando = true;
    this.mensajeExito = '';
    this.error = '';

    const datos = this.formularioPublicacion.getRawValue();

    this.publicacionesService.crearPublicacion({
      titulo: datos.titulo,
      mensaje: datos.mensaje,
      imagen: datos.imagen?.trim() || undefined
    }).subscribe({
      next: () => {
        this.formularioPublicacion.reset();
        this.mostrarFormulario = false;
        this.publicando = false;
        this.mensajeExito = '¡Tu publicación se creó exitosamente!';

        this.cargarPublicaciones();
      },
      error: (err) => {
        console.error('Error al crear publicación:', err);
        this.error = err.error?.message || 'No se pudo crear la publicación.';
        this.publicando = false;
      }
    });
  }

  probarNavegacion(id: string): void {
    this.router.navigate(['/publicaciones', id]);
  }
}
