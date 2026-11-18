import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

import { Usuario, UsuarioDocument } from '../usuarios/entities/usuario.entity';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AutenticacionService {

  constructor(
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {

    const identificador = loginDto.usuario.toLowerCase();

    const user = await this.usuarioModel.findOne({
      $or: [
        { usuario: identificador },
        { correo: identificador },
      ],
    }).select('+clave');

    if (!user || !(await bcrypt.compare(loginDto.clave, user.clave))) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.activo) {
      throw new UnauthorizedException(
        'Tu cuenta se encuentra desactivada. Contactá al administrador.',
      );
    }

    return this.generateToken(user);
  }

  async register(registroDto: RegistroDto) {

    const { clave, ...datosUsuario } = registroDto;

    const usuarioExistente = await this.usuarioModel.findOne({
      $or: [
        { correo: datosUsuario.correo.toLowerCase() },
        { usuario: datosUsuario.usuario.toLowerCase() },
      ],
    });

    if (usuarioExistente) {
      throw new ConflictException(
        'El correo o nombre de usuario ya está registrado',
      );
    }

    const claveEncriptada = await bcrypt.hash(clave, 10);

    const newUser = await this.usuarioModel.create({
      ...datosUsuario,
      clave: claveEncriptada,
    });

    return this.generateToken(newUser);
  }

  async getPerfil(id: string) {

    const user = await this.usuarioModel.findById(id);

    if (!user) {
      throw new NotFoundException('No se pudo obtener el perfil');
    }

    return user;
  }

  async generateToken(usuario: UsuarioDocument) {

    const payload = {
      correo: usuario.correo,
      sub: usuario._id.toString(),
      perfil: usuario.perfil,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
    };
  }

  async autorizar(token: string) {
    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }

    const usuario = await this.usuarioModel
      .findById(payload.sub)
      .select('-clave');

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException(
        'Tu cuenta se encuentra desactivada.',
      );
    }

    return { usuario };
  }

  async refrescar(token: string) {
    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }

    const usuario = await this.usuarioModel.findById(payload.sub);

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException(
        'Tu cuenta se encuentra desactivada o no existe.',
      );
    }

    // Sacamos los datos del token anterior.
    const { iat, exp, ...datosUsuario } = payload;

    const nuevoToken = await this.jwtService.signAsync(datosUsuario);

    return {
      access_token: nuevoToken,
    };
  }

  setTokenCookie(res: Response, token: string) {

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24,
    });

  }

}
