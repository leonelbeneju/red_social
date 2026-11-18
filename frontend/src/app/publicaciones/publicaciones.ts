import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
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


  publicaciones: any[] = [];
  cargando = false;
  publicando = false;
  error = '';
  mensajeExito = '';
  usuarioId = '';
  likesProcesando: string[] = [];
  mostrarFormulario = false;

  formularioPublicacion = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(100)]],
    mensaje: ['', [Validators.required, Validators.maxLength(2000)]],
    imagen: ['', [Validators.maxLength(500)]]
  });

  ngOnInit(): void {
    this.usuarioId = this.obtenerIdUsuario();
    this.cargarPublicaciones();
  }

  private obtenerIdUsuario(): string {
  const token = this.authService.obtenerToken();

    if (!token) return '';

    try {
      const parteToken = token.split('.')[1];
      const base64 = parteToken.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(
        atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
      );

      return payload.sub || '';
    } catch {
      return '';
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
    console.log('ID de publicación:', id);
    console.log('Navegando al detalle...');

    window.location.href = '/publicaciones/' + id;
  }
}

