import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { UsuariosService } from '../../core/services/usuario.service';

// Valida que las dos contraseñas coincidan
function clavesIguales(control: AbstractControl): ValidationErrors | null {
  const clave = control.get('clave')?.value;
  const repetirClave = control.get('repetirClave')?.value;

  if (!clave || !repetirClave) {
    return null;
  }

  return clave === repetirClave
    ? null
    : { clavesNoCoinciden: true };
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {

  private usuariosService = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  usuarios: any[] = [];

  cargando = true;
  creando = false;

  error = '';
  mensajeExito = '';

  mostrarFormulario = false;

  formUsuario = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    usuario: ['', [Validators.required, Validators.minLength(3)]],
    clave: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
      ]
    ],
    repetirClave: ['', Validators.required],
    fechaNacimiento: ['', Validators.required],
    descripcion: ['', Validators.maxLength(250)],
    perfil: ['usuario', Validators.required]
  }, {
    validators: clavesIguales
  });

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  obtenerUsuarios(): void {
    this.cargando = true;
    this.error = '';

    this.usuariosService.obtenerUsuarios().subscribe({
      next: (respuesta: any) => {
        console.log('RESPUESTA ADMIN:', respuesta);

        this.usuarios = Array.isArray(respuesta)
          ? respuesta
          : respuesta?.usuarios ?? [];

        this.cargando = false;
        console.log('USUARIOS CARGADOS:', this.usuarios.length);

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('ERROR ADMIN:', err);

        this.error = err.error?.message ||
          'No se pudieron cargar los usuarios';

        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarEstado(usuario: any): void {

    const peticion = usuario.activo === false
      ? this.usuariosService.activarUsuario(usuario._id)
      : this.usuariosService.desactivarUsuario(usuario._id);

    peticion.subscribe({
      next: () => {
        usuario.activo = usuario.activo === false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message ||
          'No se pudo modificar el estado';

        this.cdr.detectChanges();
      }
    });
  }

  abrirFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    this.mensajeExito = '';
    this.error = '';
    this.cdr.detectChanges();
  }

  crearUsuario(): void {

    this.mensajeExito = '';
    this.error = '';

    if (this.formUsuario.invalid || this.creando) {
      this.formUsuario.markAllAsTouched();
      return;
    }

    this.creando = true;

    const {
      repetirClave,
      ...datos
    } = this.formUsuario.getRawValue();

    this.usuariosService.crearUsuario(datos).subscribe({

      next: () => {
        this.creando = false;
        this.mensajeExito = '¡Usuario creado correctamente!';

        this.formUsuario.reset({
          nombre: '',
          apellido: '',
          correo: '',
          usuario: '',
          clave: '',
          repetirClave: '',
          fechaNacimiento: '',
          descripcion: '',
          perfil: 'usuario'
        });

        this.mostrarFormulario = false;

        // Volvemos a consultar para actualizar el listado
        this.obtenerUsuarios();

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('ERROR AL CREAR USUARIO:', err);

        const mensaje = err.error?.message;

        this.error = Array.isArray(mensaje)
          ? mensaje.join(', ')
          : mensaje || 'No se pudo crear el usuario';

        this.creando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
