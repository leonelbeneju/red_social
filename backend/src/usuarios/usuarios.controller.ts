import {
  Controller,
  Get,
  Body,
  Patch,
  Req,
  UseGuards,
  Post,
  Param,
  Query
} from '@nestjs/common';

import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard } from '../autenticacion/guards/auth.guard';
import { AdminGuard } from '../autenticacion/guards/admin.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // PERFIL PERSONAL
  @Get('mi-perfil')
  @UseGuards(AuthGuard)
  obtenerMiPerfil(@Req() req: any) {
    return this.usuariosService.obtenerMiPerfil(req.user.sub);
  }


  // BUSCAR USUARIOS
  @Get('buscar')
  @UseGuards(AuthGuard)
  buscarUsuarios(@Query('texto') texto: string, @Req() req: any) {
    return this.usuariosService.buscarUsuarios(
      texto || '',
      req.user.sub,
    );
  }


  @Patch('mi-perfil')
  @UseGuards(AuthGuard)
  actualizarMiPerfil(@Req() req: any, @Body() dto: UpdateUsuarioDto) {
    return this.usuariosService.actualizarMiPerfil(req.user.sub, dto);
  }

  // GESTIÓN ADMINISTRATIVA DE USUARIOS
  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  obtenerUsuarios() {
    return this.usuariosService.obtenerUsuarios();
  }

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  crearUsuario(@Body() datos: any) {
    return this.usuariosService.crearUsuario(datos);
  }

  @Patch(':id/desactivar')
  @UseGuards(AuthGuard, AdminGuard)
  desactivarUsuario(@Param('id') id: string) {
    return this.usuariosService.cambiarEstadoUsuario(id, false);
  }

  @Patch(':id/activar')
  @UseGuards(AuthGuard, AdminGuard)
  activarUsuario(@Param('id') id: string) {
    return this.usuariosService.cambiarEstadoUsuario(id, true);
  }
}
