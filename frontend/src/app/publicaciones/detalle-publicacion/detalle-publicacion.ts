import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PublicacionesService } from '../../core/services/publicaciones.service';

@Component({
  selector: 'app-detalle-publicacion',
  standalone: true,
  imports: [DatePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './detalle-publicacion.html',
  styleUrl: './detalle-publicacion.css'
})
export class DetallePublicacion implements OnInit {

  private route = inject(ActivatedRoute);
  private publicacionesService = inject(PublicacionesService);
  private fb = inject(FormBuilder);
  private detector = inject(ChangeDetectorRef);

  publicacion: any = null;
  comentarios: any[] = [];

  cargando = false;
  enviandoComentario = false;

  error = '';
  errorComentario = '';
  mensajeExito = '';

  formularioComentario = this.fb.group({
    mensaje: ['', [
      Validators.required,
      Validators.maxLength(1000),
      Validators.pattern(/\S/)
    ]]
  });

  ngOnInit(): void {
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
        this.comentarios = respuesta.comentarios || [];
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
        this.comentarios = respuesta.comentarios || [];
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
}