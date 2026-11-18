import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
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

  ingresar() {

    if (this.formLogin.invalid || this.cargando) {
      this.formLogin.markAllAsTouched();
      return;
    }

    this.mensajeError = '';

    const datos = {
      usuario: this.formLogin.value.usuario!,
      clave: this.formLogin.value.clave!
    };

    this.cargando = true;

    this.authService.login(datos).subscribe({
      next: (respuesta) => {

        this.authService.guardarToken(respuesta.access_token);

        // Comienza la validación del token
        this.cargando = true;

        this.authService.autorizarToken().subscribe({
          next: () => {
            this.sesionService.iniciarContador();
            this.router.navigate(['/publicaciones']);
          },
          error: () => {
            this.cargando = false;
            this.authService.cerrarSesion();
            this.sesionService.detenerContador();

            this.cargando = false;
            this.mensajeError = 'No se pudo validar la sesión. Intentá nuevamente.';
          }
        });

      },

      
      error: (error) => {
        this.mensajeError =
          error.error?.message || 'Usuario o contraseña incorrectos';
      }
    });
  }
}
