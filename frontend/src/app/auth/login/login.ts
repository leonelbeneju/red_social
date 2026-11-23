import { Component, inject, ChangeDetectorRef } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { SesionService } from '../../core/services/sesion.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  private sesionService = inject(SesionService);
  private detector = inject(ChangeDetectorRef);

  formLogin = new FormGroup({
    usuario: new FormControl('', {
      validators: [Validators.required]
    }),
    clave: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(10)
      ]
    })
  });

  mensajeError = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ingresar(): void {

    if (this.formLogin.invalid || this.cargando) {
      this.formLogin.markAllAsTouched();
      return;
    }

    this.mensajeError = '';
    this.cargando = true;
    

    const datos = {
      usuario: this.formLogin.value.usuario!,
      clave: this.formLogin.value.clave!
    };

    let validandoToken = false;

    this.authService.login(datos).pipe(

      switchMap((respuesta) => {

        this.authService.guardarToken(respuesta.access_token);

        validandoToken = true;

        return this.authService.autorizarToken();

      }),

      tap(() => {
        this.sesionService.iniciarContador();
        this.router.navigate(['/publicaciones']);
      }),

      catchError((error) => {

        this.authService.cerrarSesion();
        this.sesionService.detenerContador();

        this.mensajeError = validandoToken
          ? 'No se pudo validar la sesión. Intentá nuevamente.'
          : error.error?.message || 'Usuario o contraseña incorrectos';

        return EMPTY;
      }),

      finalize(() => {
        this.cargando = false;
        this.detector.detectChanges();
      })

    ).subscribe();
  }
}
