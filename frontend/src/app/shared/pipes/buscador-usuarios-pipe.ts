import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'buscadorUsuarios',
  standalone: true
})
export class BuscadorUsuariosPipe implements PipeTransform {

  transform(usuarios: any[], texto: string): any[] {

    if (!usuarios || !texto) {
      return usuarios || [];
    }

    const busqueda = texto.toLowerCase().trim();

    return usuarios.filter(usuario =>
      usuario.nombre?.toLowerCase().includes(busqueda) ||
      usuario.apellido?.toLowerCase().includes(busqueda) ||
      usuario.usuario?.toLowerCase().includes(busqueda)
    );
  }
}
