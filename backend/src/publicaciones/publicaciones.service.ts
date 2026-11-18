import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Publicacion } from './entities/publicacion.entity';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dts';

@Injectable()
export class PublicacionesService {

  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
  ){}

  async create(
    createPublicacioneDto: CreatePublicacionDto,
    autorId: string,
  ) {
      const nuevaPublicacion = await this.publicacionModel.create({
        ...createPublicacioneDto,
        autor: autorId,
      });

      return nuevaPublicacion;
  }

  async findAll(
  offset: string,
  limit: string,
  orden: string,
  usuarioId?: string,
  ) {
    const desde = Math.max(0, Number(offset) || 0);
    const cantidad = Math.min(10, Math.max(1, Number(limit) || 10));

    const filtro: any = { activo: true };

    if (usuarioId) {
      filtro.autor = new Types.ObjectId(usuarioId);
    }

    const ordenamiento: Record<string, 1 | -1> =
    orden === 'likes'
      ? { cantidadLikes: -1, createdAt: -1 }
      : { createdAt: -1 };

    const publicaciones = await this.publicacionModel.aggregate([
      { $match: filtro },
      {
        $addFields: {
          cantidadLikes: {
            $size: { $ifNull: ['$reacciones', []] },
          },
        },
      },
      { $sort: ordenamiento },
      { $skip: desde },
      { $limit: cantidad },
    ]);

    await this.publicacionModel.populate(publicaciones, {
      path: 'autor',
      select: 'nombre apellido usuario imagen',
    });

    const total = await this.publicacionModel.countDocuments(filtro);

    return {
      publicaciones,
      total,
      offset: desde,
      limit: cantidad,
    };
  }

  async findOne(id: string) {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, activo: true })
      .populate('autor', 'nombre apellido usuario imagen')
      .populate('comentarios.autor', 'nombre apellido usuario imagen');

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return publicacion;
  }

  async update(
    id: string,
    updatePublicacionDto: UpdatePublicacionDto,
    autorId: string,
  ) {
    const publicacion = await this.publicacionModel.findOne({
      _id: id,
      activo: true,
    });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (publicacion.autor.toString() !== autorId) {
      throw new ForbiddenException(
        'No tenés permiso para modificar esta publicación',
      );
    }

    Object.assign(publicacion, updatePublicacionDto);

    await publicacion.save();

    return publicacion;
  }

  async remove(id: string, autorId: string, perfil: string) {
    const publicacion = await this.publicacionModel.findById(id);

    if (!publicacion || !publicacion.activo) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const esAutor = publicacion.autor.toString() === autorId;
    const esAdministrador = perfil === 'administrador';

    if (!esAutor && !esAdministrador) {
      throw new ForbiddenException(
        'No tenés permiso para eliminar esta publicación',
      );
    }

    publicacion.activo = false;
    await publicacion.save();

    return {
      mensaje: 'Publicación eliminada correctamente',
    };
  }

  async darLike(id: string, usuarioId: string) {
  const publicacion = await this.publicacionModel.findOneAndUpdate(
      {
        _id: id,
        activo: true,
        reacciones: { $ne: usuarioId },
      },
      {
        $addToSet: { reacciones: usuarioId },
      },
      { new: true },
   );

    if (!publicacion) {
      const existe = await this.publicacionModel.exists({
      _id: id,
      activo: true,
      });

      if (!existe) {
        throw new NotFoundException('Publicación no encontrada');
      }

        throw new ConflictException('Ya diste Me gusta a esta publicación');
      }

      return {
        mensaje: '¡Te gusta esta publicación!',
        reacciones: publicacion.reacciones.length,
      };
    }

  async quitarLike(id: string, usuarioId: string) {
  const publicacion = await this.publicacionModel.findOneAndUpdate(
    {
      _id: id,
      activo: true,
      reacciones: usuarioId,
    },
    {
      $pull: { reacciones: usuarioId },
    },
    { new: true },
  );

    if (!publicacion) {
      const existe = await this.publicacionModel.exists({
        _id: id,
        activo: true,
      });

      if (!existe) {
        throw new NotFoundException('Publicación no encontrada');
      }

      throw new ConflictException('No diste Me gusta a esta publicación');
    }

    return {
      mensaje: 'Quitaste el Me gusta',
      reacciones: publicacion.reacciones.length,
    };
  }

  async agregarComentario(
  id: string,
  comentarioDto: CreateComentarioDto,
  usuarioId: string,
  ) {
    const publicacion = await this.publicacionModel.findOneAndUpdate(
      {
        _id: id,
        activo: true,
      },
      {
        $push: {
          comentarios: {
            mensaje: comentarioDto.mensaje,
            autor: usuarioId,
          },
        },
      },
      { new: true },
    ).populate('comentarios.autor', 'nombre apellido usuario imagen');

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return {
      mensaje: 'Comentario agregado correctamente',
      comentarios: publicacion.comentarios,
    };
  }

    async obtenerComentario(
    id: string,
    offset: string,
    limit: string,
  ) {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, activo: true })
      .populate('comentarios.autor', 'nombre apellido usuario imagen');

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const desde = Math.max(0, Number(offset) || 0);
    const cantidad = Math.min(20, Math.max(1, Number(limit) || 5));

    const comentariosOrdenados = [...publicacion.comentarios].sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );

    const comentarios = comentariosOrdenados.slice(
      desde,
      desde + cantidad,
    );

    return {
      comentarios,
      total: comentariosOrdenados.length,
      offset: desde,
      limit: cantidad,
    };
  }

  async editarComentario(
    id: string,
    comentarioId: string,
    comentarioDto: UpdateComentarioDto,
    usuarioId: string,
  ) {
    const publicacion = await this.publicacionModel.findOne({
      _id: id,
      activo: true,
    });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const comentario = publicacion.comentarios.find(
      (c: any) => c._id.toString() === comentarioId,
    );

    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comentario.autor.toString() !== usuarioId) {
      throw new ForbiddenException(
        'No tenés permiso para editar este comentario',
      );
    }

    comentario.mensaje = comentarioDto.mensaje;
    comentario.modificado = true;

    await publicacion.save();

    await publicacion.populate(
      'comentarios.autor',
      'nombre apellido usuario imagen',
    );

    return {
      mensaje: 'Comentario editado correctamente',
      comentario,
    };
  }
}
