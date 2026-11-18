import { Component, signal, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ModalSesion } from './shared/components/modal-sesion/modal-sesion';
import { SesionService } from './core/services/sesion.service';
import { AuthService } from './core/services/auth.service';

@Component({
  imports: [RouterOutlet, ModalSesion],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {

  protected readonly title = signal('frontend');

  private sesionService = inject(SesionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private detector = inject(ChangeDetectorRef);

  mostrarModal = false;
  
  private suscripcion?: Subscription;

  ngOnInit(): void {
    this.suscripcion = this.sesionService.avisoSesion$.subscribe(() => {
      this.mostrarModal = true;
      this.detector.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }


  renovando = false;

  extenderSesion(): void {

    if (this.renovando) {
      return;
    }

    this.renovando = true;

    this.authService.refrescarToken().subscribe({
      next: (respuesta) => {
        this.authService.guardarToken(respuesta.access_token);
        this.sesionService.iniciarContador();

        this.mostrarModal = false;
        this.renovando = false;
        this.detector.detectChanges();
      },
      error: () => {
        this.renovando = false;
        this.cerrarSesion();
      }
    });
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.sesionService.detenerContador();
    this.mostrarModal = false;
    this.router.navigate(['/login']);
  }
}
