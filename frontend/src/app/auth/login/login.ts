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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ingresar() {

    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    const datos = {
      usuario: this.formLogin.value.usuario!,
      clave: this.formLogin.value.clave!
    };

    this.authService.login(datos).subscribe({
      next: (respuesta) => {
        this.authService.guardarToken(respuesta.access_token);
        this.sesionService.iniciarContador();
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        this.mensajeError =
          error.error?.message || 'Usuario o contraseña incorrectos';
      }
    });
  }
}
