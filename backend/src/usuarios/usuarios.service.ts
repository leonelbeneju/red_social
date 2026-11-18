import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RegistroDto } from '../autenticacion/dto/registro.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Usuario } from './entities/usuario.entity';
import { Publicacion } from '../publicaciones/entities/publicacion.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {

  constructor(
    @InjectModel('Usuario')
    private readonly usuarioModel: Model<Usuario>,

    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
  ) {}

  // OBTENER MI PERFIL
  async obtenerMiPerfil(usuarioId: string) {
    const usuario = await this.usuarioModel
      .findById(usuarioId)
      .select('-clave')
      .lean();

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const publicaciones = await this.publicacionModel
      .find({
        autor: new Types.ObjectId(usuarioId),
        activo: true,
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('autor', 'nombre apellido usuario imagen')
      .populate('comentarios.autor', 'nombre apellido usuario imagen');

    const comentarios = await this.publicacionModel
      .find({
        'comentarios.autor': new Types.ObjectId(usuarioId),
        activo: true,
      })
      .select('titulo comentarios createdAt')
      .populate('comentarios.autor', 'nombre apellido usuario imagen')
      .lean();

    const misComentarios = comentarios.flatMap((publicacion: any) =>
      publicacion.comentarios
        .filter((comentario: any) =>
          comentario.autor?._id?.toString() === usuarioId,
        )
        .map((comentario: any) => ({
          ...comentario,
          publicacionId: publicacion._id,
          tituloPublicacion: publicacion.titulo,
        })),
    );

    return {
      usuario,
      ultimasPublicaciones: publicaciones,
      comentarios: misComentarios,
    };
  }

  // ACTUALIZAR MI PERFIL
  async actualizarMiPerfil(usuarioId: string, dto: UpdateUsuarioDto) {
    const usuario = await this.usuarioModel.findById(usuarioId);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.correo) {
      dto.correo = dto.correo.toLowerCase();
    }

    if (dto.usuario) {
      dto.usuario = dto.usuario.toLowerCase();
    }

    Object.assign(usuario, dto);

    try {
      await usuario.save();
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException(
          'El correo o nombre de usuario ya está registrado',
        );
      }

      throw error;
    }

    const usuarioActualizado: any = usuario.toObject();
    delete usuarioActualizado.clave;

    return usuarioActualizado;
  }

  // LISTAR TODOS LOS USUARIOS
  async obtenerUsuarios() {
    return this.usuarioModel
      .find()
      .select('-clave')
      .sort({ createdAt: -1 })
      .lean();
  }

  // CREAR USUARIO DESDE EL PANEL ADMINISTRATIVO
  async crearUsuario(datos: RegistroDto & { perfil?: string; imagen?: string }) {
    const correo = datos.correo.toLowerCase();
    const nombreUsuario = datos.usuario.toLowerCase();

    const usuarioExistente = await this.usuarioModel.findOne({
      $or: [
        { correo },
        { usuario: nombreUsuario },
      ],
    });

    if (usuarioExistente) {
      throw new ConflictException(
        'El correo o nombre de usuario ya está registrado',
      );
    }

    const perfil = datos.perfil || 'usuario';

    if (!['usuario', 'administrador'].includes(perfil)) {
      throw new BadRequestException('El perfil seleccionado no es válido');
    }

    const claveEncriptada = await bcrypt.hash(datos.clave, 10);

    try {
      const nuevoUsuario = await this.usuarioModel.create({
        ...datos,
        correo,
        usuario: nombreUsuario,
        perfil,
        activo: true,
        clave: claveEncriptada,
      });

      const resultado: any = nuevoUsuario.toObject();
      delete resultado.clave;

      return resultado;

    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException(
          'El correo o nombre de usuario ya está registrado',
        );
      }

      throw error;
    }
  }

  // DESACTIVAR O REACTIVAR USUARIO
  async cambiarEstadoUsuario(id: string, activo: boolean) {
    const usuario = await this.usuarioModel.findById(id);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.activo = activo;
    await usuario.save();

    return {
      mensaje: activo
        ? 'Usuario activado correctamente'
        : 'Usuario desactivado correctamente',
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        usuario: usuario.usuario,
        correo: usuario.correo,
        perfil: usuario.perfil,
        activo: usuario.activo,
      },
    };
  }
}
