import { Injectable } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SesionService {

  private temporizador?: Subscription;

  // Avisamos al componente que debe mostrar el modal
  avisoSesion$ = new Subject<void>();

  iniciarContador(): void {
    this.detenerContador();
    this.temporizador = timer(10 * 60 * 1000).subscribe(() => {
        this.avisoSesion$.next();
    });
  }

  detenerContador(): void {
    this.temporizador?.unsubscribe();
    this.temporizador = undefined;
  }
}
