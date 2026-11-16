import { ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Usuario } from './entities/usuario.entity';
import { Publicacion } from '../publicaciones/entities/publicacion.entity';


@Injectable()
export class UsuariosService {

  constructor(
    @InjectModel('Usuario') private readonly usuarioModel: Model<Usuario>,
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>
  ) {}

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

}