import { Controller, Get, UseGuards, Post, Body, Req, Param, Patch, Delete, Query} from '@nestjs/common';
import { AuthGuard} from '../autenticacion/guards/auth.guard';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';

@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicacionesController {

    constructor(
    private readonly publicacionesService: PublicacionesService,
    ) {}

    @Post()
    crearPublicacion(
      @Body() createPublicacioneDto: CreatePublicacionDto,
      @Req() req: any,
    ) {
      return this.publicacionesService.create(
        createPublicacioneDto,
        req.user.sub,
      );
    }

    @Get()
    obtenerPublicaciones(
      @Query('offset') offset: string = '0',
      @Query('limit') limit: string = '10',
      @Query('orden') orden: string = 'fecha',
      @Query('usuarioId') usuarioId?: string,
    ) {
      return this.publicacionesService.findAll(
        offset,
        limit,
        orden,
        usuarioId,
      )
    }

    @Get(':id')
    obtenerUnaPublicacion(@Param('id') id: string) {
      return this.publicacionesService.findOne(id);
    }

    @Patch(':id')
    editarPublicacion(
      @Param('id') id: string,
      @Body() updatePublicacionDto: UpdatePublicacionDto,
      @Req() req: any,
    ) {
      return this.publicacionesService.update(
        id,
        updatePublicacionDto,
        req.user.sub,
      );
    }

    @Delete(':id')
    eliminarPublicacion(
      @Param('id') id: string,
      @Req() req: any,
    ) {
      return this.publicacionesService.remove(
        id,
        req.user.sub,
        req.user.perfil,
      );
    }

    @Post(':id/like')
    darLike(
      @Param('id') id: string,
      @Req() req: any,
    ) {
      return this.publicacionesService.darLike(
        id,
        req.user.sub,
      );
    }

    @Delete(':id/like')
    quitarLike(
      @Param('id') id: string,
      @Req() req: any,
    ) {
      return this.publicacionesService.quitarLike(
        id,
        req.user.sub,
      );
    }

    @Post(':id/comentarios')
    agregarComentario(
      @Param('id') id: string,
      @Body() comentarioDto: CreateComentarioDto,
      @Req() req: any,
    ) {
      return this.publicacionesService.agregarComentario(
        id,
        comentarioDto,
        req.user.sub,
      );
    }

    
}