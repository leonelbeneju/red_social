import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';

import { AutenticacionService } from './autenticacion.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Controller('autenticacion')
export class AutenticacionController {

  constructor(
    private readonly autenticacionService: AutenticacionService,
  ) {}

  @Post('registro')
  async registro(@Body() registroDto: RegistroDto) {
    return this.autenticacionService.register(registroDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.autenticacionService.login(loginDto);
  }

  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  async autorizar(
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    return this.autenticacionService.autorizar(token);
  }


  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  async refrescar(
    @Headers('authorization') authorization: string,
  ) {
    const token = authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    return this.autenticacionService.refrescar(token);
  }

}
