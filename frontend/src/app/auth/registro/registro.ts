import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

// Si coinciden las contraseñas
const clavesIguales: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const clave = control.get('clave')?.value;
  const repetirClave = control.get('repetirClave')?.value;

  if (!clave || !repetirClave) {
    return null;
  }

  return clave === repetirClave ? null : { noCoinciden: true };
};


// Validar la contraseña con letra y num
const validarClave: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const clave = control.value || '';

  let tieneMayuscula = false;
  let tieneNumero = false;

  for (const caracter of clave) {

    if (caracter >= 'A' && caracter <= 'Z') {
      tieneMayuscula = true;
    }

    if (caracter >= '0' && caracter <= '9') {
      tieneNumero = true;
    }
  }

  if (!tieneMayuscula || !tieneNumero) {
    return { claveInvalida: true };
  }

  return null;
};

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {

  imagenSeleccionada: File | null = null;

  formRegistro = new FormGroup({

    nombre: new FormControl('', [
      Validators.required
    ]),

    apellido: new FormControl('', [
      Validators.required
    ]),

    correo: new FormControl('', [
      Validators.required,
      Validators.email
    ]),

    usuario: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),

    clave: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      validarClave
    ]),

    repetirClave: new FormControl('', [
      Validators.required
    ]),

    fechaNacimiento: new FormControl('', [
      Validators.required
    ]),

    descripcion: new FormControl('')

  }, {
    validators: clavesIguales
  });

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imagenSeleccionada = input.files?.[0] ?? null;
  }

  registrar(): void {

    if (this.formRegistro.invalid) {
      this.formRegistro.markAllAsTouched();
      return;
    }

    console.log(this.formRegistro.value);
    console.log(this.imagenSeleccionada);
  }
}
