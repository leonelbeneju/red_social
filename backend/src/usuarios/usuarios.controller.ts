import { Controller, Get, Body, Patch, Req, UseGuards} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard } from '../autenticacion/guards/auth.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('mi-perfil')
  @UseGuards(AuthGuard)
  obtenerMiPerfil(@Req() req: any) {
    return this.usuariosService.obtenerMiPerfil(req.user.sub);
  }

  @Patch('mi-perfil')
  @UseGuards(AuthGuard)
  actualizarMiPerfil(@Req() req: any, @Body() dto: UpdateUsuarioDto) {
    return this.usuariosService.actualizarMiPerfil(req.user.sub, dto);
  }

}
